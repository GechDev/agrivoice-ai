<?php

namespace App\Enums;

/**
 * Price-trend direction for a crop-market pair over the trailing 7 days.
 *
 * Produced by PredictionService by comparing the average price of the
 * last 7 days against the 7 days before that:
 * - Up:    current period ≥ 2% higher than previous
 * - Down:  current period ≤ 2% lower than previous
 * - Stable: change within ±2% (considered noise, not a real trend)
 *
 * The 2% threshold prevents trivial fluctuations (e.g. a single
 * outlier report) from triggering a trend indicator on the dashboard.
 */
enum Trend: string
{
    case Up = 'up';
    case Down = 'down';
    case Stable = 'stable';
}
