<?php

use App\Enums\Crop;
use App\Enums\ReporterType;
use App\Models\Agent;
use App\Models\Market;
use App\Models\Report;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected away from the dashboard', function () {
    $this->get(route('dashboard'))->assertRedirect(route('login'));
});

test('authenticated users see twenty-one snapshots and three markets', function () {
    Market::factory()->adama()->create();
    Market::factory()->addisAbaba()->create();
    Market::factory()->jimma()->create();

    $this->actingAs(User::factory()->create());

    $this->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->has('snapshots', 21)
            ->has('markets', 3)
            ->where('snapshots.0.crop', fn ($crop) => in_array($crop, Crop::values(), true))
            ->where('snapshots.0.confidence', 0)
            ->where('snapshots.0.reportCount', 0)
        );
});

test('dashboard snapshots exclude flagged reports and raise confidence with data', function () {
    $adama = Market::factory()->adama()->create();
    Market::factory()->addisAbaba()->create();
    Market::factory()->jimma()->create();
    $agent = Agent::factory()->create();

    Report::factory()->create([
        'crop' => Crop::Teff,
        'market_id' => $adama->id,
        'agent_id' => $agent->id,
        'price' => 5000,
        'reporter_type' => ReporterType::Official,
        'reported_at' => now()->subHour(),
        'is_flagged' => false,
    ]);

    Report::factory()->flagged()->create([
        'crop' => Crop::Teff,
        'market_id' => $adama->id,
        'agent_id' => $agent->id,
        'price' => 100,
        'reported_at' => now()->subMinutes(30),
    ]);

    $this->actingAs(User::factory()->create());

    $this->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->has('snapshots', 21)
            ->where('snapshots', function ($snapshots) {
                $teffAdama = collect($snapshots)->first(
                    fn ($s) => ($s['crop'] ?? null) === 'teff'
                        && ($s['market'] ?? null) === 'adama'
                );

                if ($teffAdama === null) {
                    return false;
                }

                return (int) $teffAdama['reportCount'] === 1
                    && (float) $teffAdama['price'] === 5000.0
                    && (int) $teffAdama['confidence'] > 0;
            })
        );
});
