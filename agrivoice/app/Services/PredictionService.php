<?php

namespace App\Services;

use App\Enums\Crop;
use App\Enums\Trend;
use App\Models\Market;
use App\Models\Report;

class PredictionService
{
    /**
     * Percent change below this threshold is treated as stable.
     */
    private const STABLE_THRESHOLD_PERCENT = 2.0;

    /**
     * Compare the last 7 days' average price to the previous 7 days.
     *
     * @return array{trend: Trend, changePercent: float|null}
     */
    public function trend(Crop $crop, Market $market): array
    {
        $recentAvg = $this->averagePrice($crop, $market, now()->subDays(7), now());
        $previousAvg = $this->averagePrice($crop, $market, now()->subDays(14), now()->subDays(7));

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

    private function averagePrice(Crop $crop, Market $market, mixed $from, mixed $to): ?float
    {
        $avg = Report::query()
            ->notFlagged()
            ->forCropMarket($crop, $market->id)
            ->whereBetween('reported_at', [$from, $to])
            ->avg('price');

        return $avg === null ? null : (float) $avg;
    }
}
