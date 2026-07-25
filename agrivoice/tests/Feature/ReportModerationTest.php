<?php

use App\Enums\Crop;
use App\Enums\ReporterType;
use App\Models\Agent;
use App\Models\Market;
use App\Models\Report;
use App\Models\User;
use App\Services\SnapshotService;
use Inertia\Testing\AssertableInertia as Assert;

test('guests can view the live reports list', function () {
    $this->get(route('reports.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('reports')
            ->where('canModerate', false)
        );
});

test('guests cannot flag reports', function () {
    $market = Market::factory()->adama()->create();
    $report = Report::factory()->create([
        'market_id' => $market->id,
    ]);

    $this->post(route('reports.flag', $report))->assertRedirect(route('login'));
});

test('authenticated users see newest reports with agent names', function () {
    $market = Market::factory()->adama()->create();
    $agent = Agent::factory()->create(['name' => 'Nati']);

    Report::factory()->create([
        'crop' => Crop::Teff,
        'market_id' => $market->id,
        'agent_id' => $agent->id,
        'price' => 5100,
        'reporter_type' => ReporterType::Crowd,
        'reported_at' => now()->subMinutes(5),
    ]);

    Report::factory()->create([
        'crop' => Crop::Coffee,
        'market_id' => $market->id,
        'agent_id' => $agent->id,
        'price' => 9000,
        'reporter_type' => ReporterType::Official,
        'reported_at' => now()->subMinute(),
    ]);

    $this->actingAs(User::factory()->create());

    $this->get(route('reports.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('reports')
            ->where('canModerate', true)
            ->has('reports', 2)
            ->where('reports.0.crop', 'coffee')
            ->where('reports.0.agentName', 'Nati')
            ->where('reports.0.source', 'official')
            ->where('reports.0.isFlagged', false)
            ->where('reports.1.crop', 'teff')
        );
});

test('flagging a report marks it and excludes it from dashboard snapshots', function () {
    $adama = Market::factory()->adama()->create();
    Market::factory()->addisAbaba()->create();
    Market::factory()->jimma()->create();
    $agent = Agent::factory()->create();

    $good = Report::factory()->create([
        'crop' => Crop::Teff,
        'market_id' => $adama->id,
        'agent_id' => $agent->id,
        'price' => 5000,
        'reporter_type' => ReporterType::Official,
        'reported_at' => now()->subHour(),
        'is_flagged' => false,
    ]);

    $outlier = Report::factory()->create([
        'crop' => Crop::Teff,
        'market_id' => $adama->id,
        'agent_id' => $agent->id,
        'price' => 150,
        'reporter_type' => ReporterType::Crowd,
        'reported_at' => now()->subMinutes(10),
        'is_flagged' => false,
    ]);

    $this->actingAs(User::factory()->create());

    $this->post(route('reports.flag', $outlier))
        ->assertRedirect();

    expect($outlier->fresh()->is_flagged)->toBeTrue();

    $snapshot = app(SnapshotService::class)->forCropMarket(Crop::Teff, $adama);

    expect($snapshot['reportCount'])->toBe(1)
        ->and($snapshot['price'])->toBe(5000.0);

    $this->assertModelExists($good);
});

test('flagging an already flagged report is idempotent', function () {
    $market = Market::factory()->jimma()->create();
    $agent = Agent::factory()->create();
    $report = Report::factory()->flagged()->create([
        'market_id' => $market->id,
        'agent_id' => $agent->id,
    ]);

    $this->actingAs(User::factory()->create());

    $this->post(route('reports.flag', $report))->assertRedirect();

    expect($report->fresh()->is_flagged)->toBeTrue();
});
