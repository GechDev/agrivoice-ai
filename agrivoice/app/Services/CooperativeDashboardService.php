<?php

namespace App\Services;

use App\Enums\Crop;
use App\Models\Cooperative;
use App\Models\CooperativeMember;
use App\Models\MemberQuery;
use App\Models\Prediction;
use App\Models\Report;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class CooperativeDashboardService
{
    public function __construct(private SnapshotService $snapshotService) {}

    /**
     * @return array{
     *     id: int,
     *     name: string,
     *     region: string,
     *     defaultCrops: list<string>
     * }
     */
    public function cooperativePayload(Cooperative $cooperative): array
    {
        return [
            'id' => $cooperative->id,
            'name' => $cooperative->name,
            'region' => $cooperative->region,
            'defaultCrops' => array_values($cooperative->default_crops ?? []),
        ];
    }

    /**
     * Verified, unflagged cooperative reports for the current calendar week,
     * grouped by crop + market. Empty when there are no current-week reports.
     *
     * @return list<array{
     *     crop: string,
     *     cropLabel: string,
     *     market: string,
     *     marketLabel: string,
     *     averagePrice: float,
     *     changePercent: float|null,
     *     confidence: int,
     *     reportCount: int
     * }>
     */
    public function prices(Cooperative $cooperative): array
    {
        $currentStart = now()->startOfWeek()->copy();
        $currentEnd = now()->endOfWeek()->copy();
        $previousStart = $currentStart->copy()->subWeek();
        $previousEnd = $currentStart->copy()->subSecond();

        /** @var Collection<int, Report> $currentReports */
        $currentReports = Report::query()
            ->with('market')
            ->forCooperative($cooperative->id)
            ->verified()
            ->notFlagged()
            ->whereBetween('reported_at', [$currentStart, $currentEnd])
            ->get();

        if ($currentReports->isEmpty()) {
            return [];
        }

        /** @var Collection<int, Report> $previousReports */
        $previousReports = Report::query()
            ->forCooperative($cooperative->id)
            ->verified()
            ->notFlagged()
            ->whereBetween('reported_at', [$previousStart, $previousEnd])
            ->get()
            ->groupBy(fn (Report $report): string => $this->cropMarketKey($report->crop, $report->market_id));

        return $currentReports
            ->groupBy(fn (Report $report): string => $this->cropMarketKey($report->crop, $report->market_id))
            ->map(function (Collection $reports) use ($previousReports): array {
                /** @var Report $sample */
                $sample = $reports->first();
                $crop = $sample->crop;
                $market = $sample->market;

                $averagePrice = round(
                    $reports->avg(fn (Report $report): float => (float) $report->price),
                    2,
                );

                /** @var Collection<int, Report> $previousGroup */
                $previousGroup = $previousReports->get(
                    $this->cropMarketKey($crop, $sample->market_id),
                    collect(),
                );

                $previousAverage = $previousGroup->isEmpty()
                    ? null
                    : $previousGroup->avg(fn (Report $report): float => (float) $report->price);

                return [
                    'crop' => $crop->value,
                    'cropLabel' => $crop->label(),
                    'market' => $market->slug->value,
                    'marketLabel' => $market->name,
                    'averagePrice' => $averagePrice,
                    'changePercent' => $this->percentChange($averagePrice, $previousAverage !== null ? (float) $previousAverage : null),
                    'confidence' => $this->snapshotService->confidence($reports->values()),
                    'reportCount' => $reports->count(),
                ];
            })
            ->values()
            ->all();
    }

    /**
     * @return array{
     *     totalMembers: array{value: int, changePercent: float|null},
     *     activeMembers: array{value: int, changePercent: float|null},
     *     totalQueries: array{value: int, changePercent: float|null},
     *     totalReports: array{value: int, changePercent: float|null}
     * }
     */
    public function memberActivity(Cooperative $cooperative): array
    {
        $currentStart = now()->subDays(7);
        $previousStart = now()->subDays(14);
        $previousEnd = $currentStart->copy();

        $totalMembers = CooperativeMember::query()
            ->forCooperative($cooperative->id)
            ->notRemoved()
            ->count();

        $joinedInCurrentWindow = CooperativeMember::query()
            ->forCooperative($cooperative->id)
            ->notRemoved()
            ->where('created_at', '>=', $currentStart)
            ->count();

        $previousTotalMembers = max(0, $totalMembers - $joinedInCurrentWindow);

        $activeCurrent = $this->activeMemberCount($cooperative->id, $currentStart, now());
        $activePrevious = $this->activeMemberCount($cooperative->id, $previousStart, $previousEnd);

        $queriesCurrent = MemberQuery::query()
            ->forCooperative($cooperative->id)
            ->where('queried_at', '>=', $currentStart)
            ->count();

        $queriesPrevious = MemberQuery::query()
            ->forCooperative($cooperative->id)
            ->whereBetween('queried_at', [$previousStart, $previousEnd])
            ->count();

        $reportsCurrent = Report::query()
            ->forCooperative($cooperative->id)
            ->where('reported_at', '>=', $currentStart)
            ->count();

        $reportsPrevious = Report::query()
            ->forCooperative($cooperative->id)
            ->whereBetween('reported_at', [$previousStart, $previousEnd])
            ->count();

        return [
            'totalMembers' => [
                'value' => $totalMembers,
                'changePercent' => $this->percentChange($totalMembers, $previousTotalMembers),
            ],
            'activeMembers' => [
                'value' => $activeCurrent,
                'changePercent' => $this->percentChange($activeCurrent, $activePrevious),
            ],
            'totalQueries' => [
                'value' => $queriesCurrent,
                'changePercent' => $this->percentChange($queriesCurrent, $queriesPrevious),
            ],
            'totalReports' => [
                'value' => $reportsCurrent,
                'changePercent' => $this->percentChange($reportsCurrent, $reportsPrevious),
            ],
        ];
    }

    /**
     * Daily actual vs forecast series for each default crop.
     *
     * Actuals cover the trailing 90 days. Forecasts start today and look
     * ahead 20 days — past prediction rows are never surfaced on the chart.
     *
     * @return list<array{
     *     crop: string,
     *     cropLabel: string,
     *     points: list<array{date: string, actual: float|null, forecast: float|null}>
     * }>
     */
    public function trends(Cooperative $cooperative): array
    {
        $from = now()->subDays(90)->startOfDay();
        $today = now()->startOfDay();
        $until = now()->addDays(20)->endOfDay();
        $crops = $cooperative->defaultCropEnums();

        if ($crops === []) {
            return [];
        }

        $cropValues = array_map(fn (Crop $crop): string => $crop->value, $crops);

        /** @var Collection<int, Report> $reports */
        $reports = Report::query()
            ->forCooperative($cooperative->id)
            ->verified()
            ->notFlagged()
            ->whereIn('crop', $cropValues)
            ->where('reported_at', '>=', $from)
            ->get(['crop', 'market_id', 'price', 'reported_at']);

        $marketIdsByCrop = $reports
            ->groupBy(fn (Report $report): string => $report->crop->value)
            ->map(
                fn (Collection $cropReports): array => $cropReports
                    ->pluck('market_id')
                    ->unique()
                    ->values()
                    ->all(),
            );

        /** @var Collection<int, Prediction> $predictions */
        $predictions = collect();

        if ($marketIdsByCrop->isNotEmpty()) {
            $predictions = Prediction::query()
                ->whereDate('predicted_for', '>=', $today->toDateString())
                ->whereDate('predicted_for', '<=', $until->toDateString())
                ->where(function (Builder $query) use ($marketIdsByCrop): void {
                    foreach ($marketIdsByCrop as $crop => $marketIds) {
                        $query->orWhere(
                            fn (Builder $cropMarketQuery): Builder => $cropMarketQuery
                                ->where('crop', $crop)
                                ->whereIn('market_id', $marketIds),
                        );
                    }
                })
                ->get(['crop', 'market_id', 'predicted_price', 'predicted_for']);
        }

        $actualByCropDate = $reports
            ->groupBy(fn (Report $report): string => $report->crop->value)
            ->map(function (Collection $cropReports): Collection {
                return $cropReports
                    ->groupBy(fn (Report $report): string => $report->reported_at->toDateString())
                    ->map(fn (Collection $dayReports): float => round(
                        $dayReports->avg(fn (Report $report): float => (float) $report->price),
                        2,
                    ));
            });

        $forecastByCropDate = $predictions
            ->groupBy(fn (Prediction $prediction): string => $prediction->crop->value)
            ->map(function (Collection $cropPredictions): Collection {
                return $cropPredictions
                    ->groupBy(fn (Prediction $prediction): string => $prediction->predicted_for->toDateString())
                    ->map(fn (Collection $dayPredictions): float => round(
                        $dayPredictions->avg(fn (Prediction $prediction): float => (float) $prediction->predicted_price),
                        2,
                    ));
            });

        $dates = collect();
        for ($day = $from->copy(); $day->lte($until); $day = $day->addDay()) {
            $dates->push($day->toDateString());
        }

        $todayDate = $today->toDateString();

        return collect($crops)
            ->map(function (Crop $crop) use ($dates, $todayDate, $actualByCropDate, $forecastByCropDate): array {
                $actuals = $actualByCropDate->get($crop->value, collect());
                $forecasts = $forecastByCropDate->get($crop->value, collect());

                $points = $dates
                    ->map(function (string $date) use ($todayDate, $actuals, $forecasts): ?array {
                        $actual = $actuals->get($date);
                        $forecast = $date >= $todayDate ? $forecasts->get($date) : null;

                        if ($date === $todayDate && $actual !== null && $forecast !== null) {
                            $forecast = $actual;
                        }

                        if ($actual === null && $forecast === null) {
                            return null;
                        }

                        return [
                            'date' => $date,
                            'actual' => $actual !== null ? (float) $actual : null,
                            'forecast' => $forecast !== null ? (float) $forecast : null,
                        ];
                    })
                    ->filter()
                    ->values()
                    ->all();

                return [
                    'crop' => $crop->value,
                    'cropLabel' => $crop->label(),
                    'points' => $points,
                ];
            })
            ->values()
            ->all();
    }

    private function cropMarketKey(Crop $crop, int $marketId): string
    {
        return $crop->value.'|'.$marketId;
    }

    private function activeMemberCount(int $cooperativeId, CarbonInterface $from, CarbonInterface $to): int
    {
        $reportMemberIds = Report::query()
            ->forCooperative($cooperativeId)
            ->whereBetween('reported_at', [$from, $to])
            ->whereNotNull('cooperative_member_id')
            ->distinct()
            ->pluck('cooperative_member_id');

        $queryMemberIds = MemberQuery::query()
            ->forCooperative($cooperativeId)
            ->whereBetween('queried_at', [$from, $to])
            ->distinct()
            ->pluck('cooperative_member_id');

        return $reportMemberIds->merge($queryMemberIds)->unique()->count();
    }

    private function percentChange(float|int $current, float|int|null $previous): ?float
    {
        if ($previous === null) {
            return null;
        }

        if ((float) $previous === 0.0) {
            return (float) $current === 0.0 ? null : 100.0;
        }

        return round((((float) $current - (float) $previous) / (float) $previous) * 100, 1);
    }
}
