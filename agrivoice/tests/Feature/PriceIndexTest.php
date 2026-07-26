<?php

use App\Models\Agent;
use App\Models\Market;
use App\Models\Report;
use App\Models\User;
use Database\Seeders\MarketSeeder;
use Inertia\Testing\AssertableInertia;

beforeEach(function (): void {
    $this->seed(MarketSeeder::class);
});

test('guests are redirected to login from the prices page', function () {
    $this->get(route('prices.index'))->assertRedirect(route('login'));
});

test('an authenticated farmer can browse every crop and market price', function () {
    $this->actingAs(User::factory()->create());

    $this->get(route('prices.index'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('prices')
            ->has('rows', 21)
            ->has('markets', 3)
            ->where('filters.sort', 'crop')
            ->where('filters.direction', 'asc')
            ->where('selected.crop', 'coffee')
            ->has('history', 0)
        );
});

test('farmers can filter by crop market and trend and load its history', function () {
    $this->actingAs(User::factory()->create());
    $market = Market::query()->where('slug', 'adama')->sole();
    $agent = Agent::factory()->create();

    Report::factory()->verified()->create([
        'crop' => 'teff',
        'market_id' => $market->id,
        'agent_id' => $agent->id,
        'price' => 5000,
        'reported_at' => now()->subDays(10),
        'is_flagged' => false,
    ]);

    Report::factory()->verified()->create([
        'crop' => 'teff',
        'market_id' => $market->id,
        'agent_id' => $agent->id,
        'price' => 6000,
        'reported_at' => now()->subDays(2),
        'is_flagged' => false,
    ]);

    $this->get(route('prices.index', [
        'crop' => 'teff',
        'market' => 'adama',
        'trend' => 'up',
        'sort' => 'price',
        'direction' => 'desc',
        'chart_crop' => 'teff',
        'chart_market' => 'adama',
    ]))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('prices')
            ->has('rows', 1)
            ->where('rows.0.crop', 'teff')
            ->where('rows.0.market', 'adama')
            ->where('rows.0.trend', 'up')
            ->where('selected.crop', 'teff')
            ->where('selected.market', 'adama')
            ->has('history', 2)
            ->where('history.0.price', 5000)
            ->where('history.1.price', 6000)
        );
});

test('invalid price filters are rejected', function () {
    $this->actingAs(User::factory()->create());

    $this->get(route('prices.index', [
        'crop' => 'barley',
        'market' => 'hawassa',
        'trend' => 'volatile',
        'sort' => 'unknown',
    ]))->assertSessionHasErrors(['crop', 'market', 'trend', 'sort']);
});
