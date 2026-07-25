<?php

namespace App\Services;

use App\Enums\Crop;
use App\Enums\Trend;
use App\Models\Market;
use App\Models\Report;
use Illuminate\Support\Collection;

/**
 * Determines the price trend direction for a crop-market pair.
 *
 * Compares the average price of the last 7 days against the 7 days
 * before that (a simple "current vs previous" period comparison).
 *
 * This is NOT a machine-learning model — it's a deterministic heuristic
 * chosen for the hackathon showcase because:
 * 1. It's explainable to judges in one sentence
 * 2. It produces stable, reproducible results on seeded data
 * 3. It handles missing data gracefully (returns "stable" when either
 *    period has no reports)
 *
 * The 2% threshold prevents trivial noise (e.g. a single report
 * differing by ETB 50 on a ETB 5000 crop) from showing as a "trend".
 * In the seeded data, prices drift upward ~2–5% over 14 days, so the
 * threshold ensures most crop-market pairs show a visible trend.
 */
class PredictionService
{
    /**
     * Minimum percentage change to register as Up or Down.
     * Below this, the trend is Stable — the price hasn't moved enough
     * to be meaningful noise.
     */
    private const STABLE_THRESHOLD_PERCENT = 2.0;

    /**
     * Compare the last 7 days' average price to the previous 7 days.
     *
     * Returns the trend direction and the numeric change percentage.
     * The front-end uses changePercent to size the trend arrow and
     * display "▲ 3.2%" style indicators.
     *
     * @return array{trend: Trend, changePercent: float|null}
     */
    public function trend(Crop $crop, Market $market): array
    {
        // Current period: last 7 days (most recent data)
        $recentAvg = $this->averagePrice($crop, $market, now()->subDays(7), now());
        // Previous period: 7 days before that (baseline for comparison)
        $previousAvg = $this->averagePrice($crop, $market, now()->subDays(14), now()->subDays(7));

        return $this->classify($recentAvg, $previousAvg);
    }

    /**
     * Same trend heuristic as trend(), computed from an in-memory report set.
     * Used by SnapshotService::all() to avoid 42 extra SQL queries per poll.
     *
     * @param  Collection<int, Report>  $reports  Verified, unflagged reports for one crop×market (≤14 days)
     * @return array{trend: Trend, changePercent: float|null}
     */
    public function trendFromReports(Collection $reports): array
    {
        $now = now();
        $recentStart = $now->copy()->subDays(7);
        $previousStart = $now->copy()->subDays(14);

        $recentAvg = $this->averageFromCollection(
            $reports->filter(
                fn (Report $report): bool => $report->reported_at !== null
                    && $report->reported_at->gte($recentStart)
                    && $report->reported_at->lte($now),
            ),
        );

        $previousAvg = $this->averageFromCollection(
            $reports->filter(
                fn (Report $report): bool => $report->reported_at !== null
                    && $report->reported_at->gte($previousStart)
                    && $report->reported_at->lt($recentStart),
            ),
        );

        return $this->classify($recentAvg, $previousAvg);
    }

    /**
     * @return array{trend: Trend, changePercent: float|null}
     */
    private function classify(?float $recentAvg, ?float $previousAvg): array
    {
        if ($recentAvg === null || $previousAvg === null || $previousAvg <= 0.0) {
            return [
                'trend' => Trend::Stable,
                'changePercent' => null,
            ];
        }

        $changePercent = round((($recentAvg - $previousAvg) / $previousAvg) * 100, 1);

        $trend = match (true) {
            $changePercent >= self::STABLE_THRESHOLD_PERCENT => Trend::Up,
            $changePercent <= -self::STABLE_THRESHOLD_PERCENT => Trend::Down,
            default => Trend::Stable,
        };

        return [
            'trend' => $trend,
            'changePercent' => $changePercent,
        ];
    }

    /**
     * @param  Collection<int, Report>  $reports
     */
    private function averageFromCollection(Collection $reports): ?float
    {
        if ($reports->isEmpty()) {
            return null;
        }

        return (float) $reports->avg(fn (Report $report): float => (float) $report->price);
    }

    /**
     * Simple arithmetic average of unflagged report prices in a date range.
     *
     * Unlike SnapshotService::weightedPrice(), this uses a plain average
     * because the trend comparison needs both periods on equal footing.
     * Weighting would bias the recent period more heavily and distort
     * the comparison.
     *
     * @param  mixed  $from  Carbon-compatible start date
     * @param  mixed  $to  Carbon-compatible end date
     */
    private function averagePrice(Crop $crop, Market $market, mixed $from, mixed $to): ?float
    {
        $avg = Report::query()
            ->verified()
            ->notFlagged()
            ->forCropMarket($crop, $market->id)
            ->whereBetween('reported_at', [$from, $to])
            ->avg('price');

        return $avg === null ? null : (float) $avg;
    }
}
