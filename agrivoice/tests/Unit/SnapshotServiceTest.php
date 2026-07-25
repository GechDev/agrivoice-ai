<?php

use App\Enums\Crop;
use App\Enums\ReporterType;
use App\Enums\Trend;
use App\Models\Agent;
use App\Models\Market;
use App\Models\Report;
use App\Services\PredictionService;
use App\Services\SnapshotService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

test('weighted price favors official and newer reports', function () {
    $market = Market::factory()->adama()->create();
    $agent = Agent::factory()->create();

    Report::factory()->create([
        'crop' => Crop::Teff,
        'market_id' => $market->id,
        'agent_id' => $agent->id,
        'price' => 4000,
        'reporter_type' => ReporterType::Crowd,
        'reported_at' => now()->subDays(5),
    ]);

    Report::factory()->create([
        'crop' => Crop::Teff,
        'market_id' => $market->id,
        'agent_id' => $agent->id,
        'price' => 6000,
        'reporter_type' => ReporterType::Official,
        'reported_at' => now()->subHour(),
    ]);

    $snapshot = app(SnapshotService::class)->forCropMarket(Crop::Teff, $market);

    expect($snapshot['price'])->toBeGreaterThan(5000)
        ->and($snapshot['reportCount'])->toBe(2)
        ->and($snapshot['confidence'])->toBeGreaterThan(0)
        ->and($snapshot['confidence'])->toBeLessThanOrEqual(100);
});

test('empty market returns collecting-data friendly snapshot', function () {
    $market = Market::factory()->jimma()->create();

    $snapshot = app(SnapshotService::class)->forCropMarket(Crop::Coffee, $market);

    expect($snapshot)
        ->price->toBe(0.0)
        ->confidence->toBe(0)
        ->reportCount->toBe(0)
        ->trend->toBe(Trend::Stable->value)
        ->lastUpdated->toBeNull();
});

test('flagged reports are excluded from aggregates', function () {
    $market = Market::factory()->addisAbaba()->create();
    $agent = Agent::factory()->create();

    Report::factory()->create([
        'crop' => Crop::Coffee,
        'market_id' => $market->id,
        'agent_id' => $agent->id,
        'price' => 9000,
        'reported_at' => now()->subHour(),
    ]);

    Report::factory()->flagged()->create([
        'crop' => Crop::Coffee,
        'market_id' => $market->id,
        'agent_id' => $agent->id,
        'price' => 1000,
        'reported_at' => now(),
    ]);

    $snapshot = app(SnapshotService::class)->forCropMarket(Crop::Coffee, $market);

    expect($snapshot['price'])->toBe(9000.0)
        ->and($snapshot['reportCount'])->toBe(1);
});

test('prediction service detects upward trend', function () {
    $market = Market::factory()->adama()->create();
    $agent = Agent::factory()->create();

    Report::factory()->create([
        'crop' => Crop::Teff,
        'market_id' => $market->id,
        'agent_id' => $agent->id,
        'price' => 4000,
        'reported_at' => now()->subDays(10),
    ]);

    Report::factory()->create([
        'crop' => Crop::Teff,
        'market_id' => $market->id,
        'agent_id' => $agent->id,
        'price' => 5000,
        'reported_at' => now()->subDays(2),
    ]);

    $result = app(PredictionService::class)->trend(Crop::Teff, $market);

    expect($result['trend'])->toBe(Trend::Up)
        ->and($result['changePercent'])->toBeGreaterThan(2);
});

test('prediction service returns stable when data is thin', function () {
    $market = Market::factory()->jimma()->create();

    $result = app(PredictionService::class)->trend(Crop::Coffee, $market);

    expect($result['trend'])->toBe(Trend::Stable)
        ->and($result['changePercent'])->toBeNull();
});
