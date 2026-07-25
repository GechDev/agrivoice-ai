<?php

use App\Enums\Crop;
use App\Enums\MarketSlug;
use App\Enums\ReporterType;
use App\Enums\ReportStatus;
use App\Models\Market;
use App\Models\Report;
use Database\Seeders\MarketSeeder;
use Database\Seeders\WfpFoodPricesSeeder;

beforeEach(function (): void {
    $this->seed(MarketSeeder::class);
});

test('wfp seeder imports mapped wholesale quintal prices from the csv fixture', function () {
    $seeder = new WfpFoodPricesSeeder;
    $seeder->csvPath = base_path('tests/fixtures/wfp_food_prices_eth_sample.csv');
    $seeder->run();

    expect(Report::query()->where('source', WfpFoodPricesSeeder::SOURCE)->count())->toBe(6);

    $teff = Report::query()
        ->where('source', WfpFoodPricesSeeder::SOURCE)
        ->where('crop', Crop::Teff)
        ->whereRelation('market', 'slug', MarketSlug::AddisAbaba->value)
        ->first();

    expect($teff)->not->toBeNull()
        ->and((float) $teff->price)->toBe(8500.50)
        ->and($teff->reporter_type)->toBe(ReporterType::Official)
        ->and($teff->status)->toBe(ReportStatus::Verified)
        ->and($teff->agent_id)->toBeNull()
        ->and($teff->is_flagged)->toBeFalse();

    $adamaWheat = Report::query()
        ->where('source', WfpFoodPricesSeeder::SOURCE)
        ->where('crop', Crop::Wheat)
        ->whereRelation('market', 'slug', MarketSlug::Adama->value)
        ->first();

    expect($adamaWheat)->not->toBeNull()
        ->and((float) $adamaWheat->price)->toBe(5200.0);

    $maizeFromKg = Report::query()
        ->where('source', WfpFoodPricesSeeder::SOURCE)
        ->where('crop', Crop::Maize)
        ->whereRelation('market', 'slug', MarketSlug::Jimma->value)
        ->first();

    expect($maizeFromKg)->not->toBeNull()
        ->and((float) $maizeFromKg->price)->toBe(4200.0);

    expect(Report::query()->where('crop', Crop::Coffee)->exists())->toBeTrue()
        ->and(Market::count())->toBe(3);
});

test('wfp seeder skips retail flour and unsupported markets', function () {
    $seeder = new WfpFoodPricesSeeder;
    $seeder->csvPath = base_path('tests/fixtures/wfp_food_prices_eth_sample.csv');
    $seeder->run();

    expect(Report::query()->where('price', 7000)->exists())->toBeFalse()
        ->and(Report::query()->where('price', 9000)->exists())->toBeFalse()
        ->and(Report::query()->where('price', 8000)->exists())->toBeFalse();
});

test('re-running the wfp seeder replaces previous wfp imports without duplicating', function () {
    $seeder = new WfpFoodPricesSeeder;
    $seeder->csvPath = base_path('tests/fixtures/wfp_food_prices_eth_sample.csv');
    $seeder->run();
    $seeder->run();

    expect(Report::query()->where('source', WfpFoodPricesSeeder::SOURCE)->count())->toBe(6);
});

test('resolved csv path defaults to the committed database data file', function () {
    $seeder = new WfpFoodPricesSeeder;

    expect($seeder->resolvedCsvPath())
        ->toBe(database_path('data/wfp_food_prices_eth.csv'))
        ->and(is_readable($seeder->resolvedCsvPath()))->toBeTrue();
});
