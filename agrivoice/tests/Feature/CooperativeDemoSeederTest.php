<?php

use App\Enums\ReportStatus;
use App\Models\Cooperative;
use App\Models\CooperativeMember;
use App\Models\MemberQuery;
use App\Models\Prediction;
use App\Models\Report;
use App\Services\CooperativeDashboardService;
use Database\Seeders\CooperativeDemoSeeder;
use Database\Seeders\MarketSeeder;

test('the cooperative demo seeder creates a rich dashboard dataset', function () {
    $this->seed([
        MarketSeeder::class,
        CooperativeDemoSeeder::class,
    ]);

    $cooperative = Cooperative::query()
        ->where('name', 'Oromia Coffee Growers')
        ->sole();

    expect($cooperative->default_crops)->toHaveCount(4)
        ->and(CooperativeMember::query()->forCooperative($cooperative->id)->count())->toBe(34)
        ->and(Report::query()->forCooperative($cooperative->id)->where('status', ReportStatus::Verified)->count())->toBe(168)
        ->and(Report::query()->forCooperative($cooperative->id)->where('status', ReportStatus::Pending)->count())->toBe(6)
        ->and(MemberQuery::query()->forCooperative($cooperative->id)->count())->toBe(288)
        ->and(Prediction::query()->whereDate('predicted_for', '>=', now()->toDateString())->count())->toBe(84)
        ->and(Prediction::query()->whereDate('predicted_for', '<', now()->toDateString())->count())->toBe(0);

    $dashboard = app(CooperativeDashboardService::class);
    $trends = $dashboard->trends($cooperative);

    expect($dashboard->prices($cooperative))->toHaveCount(4)
        ->and($trends)->toHaveCount(4);

    foreach ($trends as $trend) {
        $points = collect($trend['points']);
        $today = $points->firstWhere('date', now()->toDateString());
        $tomorrow = $points->firstWhere('date', now()->addDay()->toDateString());
        $pastWithForecast = $points->filter(
            fn (array $point): bool => $point['date'] < now()->toDateString()
                && $point['forecast'] !== null,
        );
        $actualDates = $points
            ->filter(fn (array $point): bool => $point['actual'] !== null)
            ->pluck('date')
            ->values();
        $forecastDates = $points
            ->filter(fn (array $point): bool => $point['forecast'] !== null)
            ->pluck('date')
            ->values();
        $actuals = $points
            ->pluck('actual')
            ->filter()
            ->map(fn ($price) => (float) $price)
            ->values();

        expect($pastWithForecast)->toBeEmpty()
            ->and($today)->not->toBeNull()
            ->and($today['actual'])->not->toBeNull()
            ->and($today['forecast'])->not->toBeNull()
            ->and($today['forecast'])->toEqual($today['actual'])
            ->and($tomorrow)->not->toBeNull()
            ->and($tomorrow['forecast'])->not->toBeNull()
            ->and($actualDates)->toHaveCount(21)
            ->and($forecastDates)->toHaveCount(21);

        $gap = abs((float) $tomorrow['forecast'] - (float) $today['actual']);
        $actualRange = $actuals->max() - $actuals->min();
        $averageActual = $actuals->average();

        expect($gap)->toBeGreaterThanOrEqual(20)
            ->and($gap)->toBeLessThanOrEqual(50)
            ->and($actualRange)->toBeGreaterThan($averageActual * 0.05);

        $isStrictlyIncreasing = true;

        for ($index = 1; $index < $actuals->count(); $index++) {
            if ($actuals[$index] <= $actuals[$index - 1]) {
                $isStrictlyIncreasing = false;

                break;
            }
        }

        expect($isStrictlyIncreasing)->toBeFalse();
    }
});
