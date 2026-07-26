<?php

use App\Enums\Crop;
use App\Enums\ReporterType;
use App\Models\Agent;
use App\Models\Market;
use App\Models\Report;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests can visit the public live dashboard', function () {
    Market::factory()->adama()->create();
    Market::factory()->addisAbaba()->create();
    Market::factory()->jimma()->create();

    $this->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->has('snapshots', 18)
            ->has('markets', 3)
            ->has('submissionLocations')
            ->where('filters.market', 'adama')
            ->where('submissionLocations', function ($locations) {
                $count = count($locations);

                if ($count < 20 || $count > 40) {
                    return false;
                }

                return collect($locations)->every(
                    fn ($point) => isset($point['latitude'], $point['longitude'], $point['crop'])
                        && abs((float) $point['latitude'] - 8.54) < 0.35
                        && abs((float) $point['longitude'] - 39.2675) < 0.35
                        && in_array($point['crop'], Crop::dashboardValues(), true)
                );
            })
            ->where('snapshots', function ($snapshots) {
                $crops = collect($snapshots)->pluck('crop')->unique()->sort()->values()->all();

                return $crops === ['coffee', 'maize', 'pulses', 'sesame', 'teff', 'wheat'];
            })
        );
});

test('authenticated users see six crops across three markets', function () {
    Market::factory()->adama()->create();
    Market::factory()->addisAbaba()->create();
    Market::factory()->jimma()->create();

    $this->actingAs(User::factory()->create());

    $this->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->has('snapshots', 18)
            ->has('markets', 3)
            ->where('filters.market', 'adama')
            ->where('snapshots.0.crop', fn ($crop) => in_array($crop, Crop::dashboardValues(), true))
            ->where('snapshots.0.confidence', 0)
            ->where('snapshots.0.reportCount', 0)
        );
});

test('dashboard accepts a market location filter in the query string', function () {
    Market::factory()->adama()->create();
    Market::factory()->addisAbaba()->create();
    Market::factory()->jimma()->create();

    $this->get(route('dashboard', ['market' => 'jimma']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->has('snapshots', 18)
            ->has('markets', 3)
            ->where('filters.market', 'jimma')
            ->where('submissionLocations', function ($locations) {
                $count = count($locations);

                if ($count < 20 || $count > 40) {
                    return false;
                }

                return collect($locations)->every(
                    fn ($point) => isset($point['crop'])
                        && abs((float) $point['latitude'] - 7.6733) < 0.4
                        && abs((float) $point['longitude'] - 36.8344) < 0.4
                        && in_array($point['crop'], Crop::dashboardValues(), true)
                );
            })
        );
});

test('dashboard rejects an unknown market location filter', function () {
    Market::factory()->adama()->create();

    $this->get(route('dashboard', ['market' => 'not-a-market']))
        ->assertSessionHasErrors('market');
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
            ->has('snapshots', 18)
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
