<?php

namespace App\Services;

use App\Enums\Crop;
use App\Enums\ReporterType;
use App\Models\Market;
use App\Models\Report;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

/**
 * Computes the "displayed price" for every crop-market pair on the dashboard.
 *
 * AgriVoice never stores a denormalised price column. Instead, each tile on
 * the dashboard is a live aggregate over unflagged reports in a trailing
 * window. This service is the single source of truth for that aggregate.
 *
 * Algorithm overview:
 *   1. Collect all unflagged reports for a crop+market within LOOKBACK_DAYS.
 *   2. Compute a recency-weighted average where each report's weight is:
 *        weight = recency × reporter_type_weight
 *      recency = 0.5 ^ (hoursAgo / 72)  — a 72-hour half-life exponential decay
 *      reporter_type_weight = 1.5 for official, 1.0 for crowd
 *   3. Compute a confidence score (0–100) from three independent signals:
 *      - Count score (max 40): 8 points per report, capped at 5 reports
 *      - Recency score (max 30): exponential decay with 48-hour half-life
 *      - Agreement score (max 30): penalises high coefficient of variation
 *   4. Delegate trend computation to PredictionService.
 *
 * The LOOKBACK_DAYS (14) and RECENCY_HALF_LIFE_HOURS (72) were chosen so
 * that:
 * - A report from 3 days ago still has ~47% weight (meaningful signal)
 * - A report from 7 days ago has ~23% weight (fading but visible)
 * - A report from 14 days ago has ~5% weight (near-zero contribution)
 *
 * This creates a natural "sliding window" feel without hard cut-offs.
 */
class SnapshotService
{
    /**
     * Trailing window in days. Reports older than this are excluded entirely.
     * The dashboard shows a 14-day price history; the seed data covers 13
     * days so every crop-market pair has at least some data.
     */
    private const LOOKBACK_DAYS = 14;

    /**
     * Half-life in hours for recency decay. A 72-hour (3-day) half-life
     * means a report loses half its weight every 3 days. This balances
     * responsiveness (new data moves the price quickly) against stability
     * (a single outlier doesn't swing the display).
     */
    private const RECENCY_HALF_LIFE_HOURS = 72.0;

    public function __construct(private PredictionService $predictionService) {}

    /**
     * Build all crop×market snapshots for the live dashboard.
     *
     * Iterates every Crop × Market combination (currently 7 × 3 = 21 tiles).
     * Pairs with zero reports return price=0, confidence=0, trend=stable —
     * the front-end renders these as "no data" states.
     *
     * @return list<array{
     *     crop: string,
     *     market: string,
     *     price: float,
     *     confidence: int,
     *     reportCount: int,
     *     lastUpdated: string|null,
     *     trend: string,
     *     changePercent: float|null
     * }>
     */
    public function all(): array
    {
        $markets = Market::query()->get()->keyBy(fn (Market $market) => $market->slug->value);

        $snapshots = [];

        foreach (Crop::cases() as $crop) {
            foreach ($markets as $slug => $market) {
                $snapshots[] = $this->forCropMarket($crop, $market);
            }
        }

        return $snapshots;
    }

    /**
     * Compute the snapshot for one crop-market tile.
     *
     * Returns a flat array that maps directly to PriceSnapshotResource
     * on the front-end. The array shape is intentionally kept simple
     * (no nested objects) so Inertia can pass it as a prop without
     * serialisation surprises.
     *
     * @return array{
     *     crop: string,
     *     market: string,
     *     price: float,
     *     confidence: int,
     *     reportCount: int,
     *     lastUpdated: string|null,
     *     trend: string,
     *     changePercent: float|null
     * }
     */
    public function forCropMarket(Crop $crop, Market $market): array
    {
        /** @var Collection<int, Report> $reports */
        $reports = Report::query()
            ->notFlagged()
            ->forCropMarket($crop, $market->id)
            ->where('reported_at', '>=', now()->subDays(self::LOOKBACK_DAYS))
            ->orderByDesc('reported_at')
            ->get();

        $price = $this->weightedPrice($reports);
        $confidence = $this->confidence($reports);
        $trend = $this->predictionService->trend($crop, $market);

        /** @var Report|null $latest */
        $latest = $reports->first();

        return [
            'crop' => $crop->value,
            'market' => $market->slug->value,
            'price' => $price,
            'confidence' => $confidence,
            'reportCount' => $reports->count(),
            'lastUpdated' => $latest?->reported_at?->toIso8601String(),
            'trend' => $trend['trend']->value,
            'changePercent' => $trend['changePercent'],
        ];
    }

    /**
     * Recency-weighted average price across all unflagged reports.
     *
     * The formula is:  Σ(price × weight) / Σ(weight)
     * where weight = recency_decay × reporter_type_weight
     *
     * This ensures:
     * - Recent reports dominate the displayed price
     * - Official sources (WFP, ECX) pull the average toward their value
     * - Crowd reports still contribute meaningfully (1.0× vs 1.5×)
     *
     * Returns 0.0 for empty report sets — the front-end treats this as
     * "no data" rather than displaying "ETB 0".
     *
     * @param  Collection<int, Report>  $reports
     */
    public function weightedPrice(Collection $reports): float
    {
        if ($reports->isEmpty()) {
            return 0.0;
        }

        $now = Carbon::now();
        $weightedSum = 0.0;
        $totalWeight = 0.0;

        foreach ($reports as $report) {
            $weight = $this->reportWeight($report, $now);
            $weightedSum += (float) $report->price * $weight;
            $totalWeight += $weight;
        }

        if ($totalWeight <= 0.0) {
            return 0.0;
        }

        return round($weightedSum / $totalWeight, 2);
    }

    /**
     * Confidence score (0–100) representing data quality for a tile.
     *
     * Three independent signals, each contributing up to a maximum:
     *
     * 1. COUNT SCORE (max 40 points):
     *    8 points per report, capped at 5 reports (5 × 8 = 40).
     *    Rationale: More reports = more reliable. After 5 reports the
     *    marginal value of additional data drops sharply.
     *
     * 2. RECENCY SCORE (max 30 points):
     *    30 × e^(-hoursSinceLatest / 48). A report from 48 hours ago
     *    scores ~11 points; a report from now scores 30. If the latest
     *    report is >5 days old, recency score approaches 0.
     *    Rationale: Stale data is less trustworthy for current pricing.
     *
     * 3. AGREEMENT SCORE (max 30 points):
     *    30 × (1 - min(1, CV × 2)) where CV = coefficient of variation
     *    (stddev / mean). If all reports agree (CV=0), score=30.
     *    If reports are wildly spread (CV≥0.5), score=0.
     *    Rationale: High variance means the price is uncertain.
     *
     * The three scores are summed and clamped to [0, 100].
     *
     * @param  Collection<int, Report>  $reports
     */
    public function confidence(Collection $reports): int
    {
        if ($reports->isEmpty()) {
            return 0;
        }

        // Count score: 8 points per report, capped at 5 reports
        $countScore = min(40.0, $reports->count() * 8.0);

        // Recency score: exponential decay from latest report
        $hoursSinceLatest = max(
            0.0,
            Carbon::now()->floatDiffInHours($reports->first()->reported_at),
        );
        $recencyScore = max(0.0, 30.0 * exp(-$hoursSinceLatest / 48.0));

        // Agreement score: penalise high coefficient of variation
        $prices = $reports->map(fn (Report $report) => (float) $report->price)->all();
        $mean = array_sum($prices) / count($prices);
        $variance = 0.0;

        foreach ($prices as $price) {
            $variance += ($price - $mean) ** 2;
        }

        $variance /= count($prices);
        $cv = $mean > 0 ? sqrt($variance) / $mean : 1.0;
        // CV of 0.5 or higher => agreement score of 0
        $agreementScore = max(0.0, 30.0 * (1.0 - min(1.0, $cv * 2.0)));

        return (int) round(min(100.0, $countScore + $recencyScore + $agreementScore));
    }

    /**
     * Compute the composite weight for a single report.
     *
     * weight = recency_decay × reporter_type_weight
     *
     * recency_decay uses a 72-hour half-life exponential:
     *   0.5 ^ (hoursAgo / 72)
     * - 0 hours ago → 1.0
     * - 72 hours ago → 0.5
     * - 144 hours ago → 0.25
     *
     * reporter_type_weight is 1.5 for Official, 1.0 for Crowd.
     * This means a 3-day-old official report has weight 0.5 × 1.5 = 0.75,
     * roughly equal to a brand-new crowd report (1.0 × 1.0 = 1.0).
     */
    private function reportWeight(Report $report, Carbon $now): float
    {
        $hoursAgo = max(0.0, $now->floatDiffInHours($report->reported_at));
        $recency = 0.5 ** ($hoursAgo / self::RECENCY_HALF_LIFE_HOURS);

        $typeWeight = $report->reporter_type instanceof ReporterType
            ? $report->reporter_type->weight()
            : ReporterType::Crowd->weight();

        return $recency * $typeWeight;
    }
}
