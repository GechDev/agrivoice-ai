<?php

namespace App\Services;

use App\Enums\Crop;
use App\Enums\ReporterType;
use App\Models\Market;
use App\Models\Report;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class SnapshotService
{
    /**
     * How far back to look when aggregating the displayed price.
     */
    private const LOOKBACK_DAYS = 14;

    /**
     * Half-life (hours) for recency decay — newer reports weigh more.
     */
    private const RECENCY_HALF_LIFE_HOURS = 72.0;

    public function __construct(private PredictionService $predictionService) {}

    /**
     * Build all 6 crop×market snapshots for the live dashboard.
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
     * Recency-weighted average; official reports weigh above crowd.
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
     * Confidence 0–100 from count + recency + agreement (low variance).
     *
     * @param  Collection<int, Report>  $reports
     */
    public function confidence(Collection $reports): int
    {
        if ($reports->isEmpty()) {
            return 0;
        }

        $countScore = min(40.0, $reports->count() * 8.0);

        $hoursSinceLatest = max(
            0.0,
            Carbon::now()->floatDiffInHours($reports->first()->reported_at),
        );
        $recencyScore = max(0.0, 30.0 * exp(-$hoursSinceLatest / 48.0));

        $prices = $reports->map(fn (Report $report) => (float) $report->price)->all();
        $mean = array_sum($prices) / count($prices);
        $variance = 0.0;

        foreach ($prices as $price) {
            $variance += ($price - $mean) ** 2;
        }

        $variance /= count($prices);
        $cv = $mean > 0 ? sqrt($variance) / $mean : 1.0;
        $agreementScore = max(0.0, 30.0 * (1.0 - min(1.0, $cv * 2.0)));

        return (int) round(min(100.0, $countScore + $recencyScore + $agreementScore));
    }

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
