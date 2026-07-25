<?php

namespace App\Enums;

use App\Concerns\HasEnumValues;

/**
 * Classifies who supplied a price report.
 *
 * The weighting scheme reflects data reliability:
 * - Official sources (government, WFP, ECX) carry a 1.5× multiplier
 *   because they follow standardised collection protocols.
 * - Crowd reports (farmer field observations via agents) carry a 1.0×
 *   base weight. They are more frequent but noisier.
 *
 * SnapshotService uses these weights when computing the recency-weighted
 * average price. The multipliers are deliberately conservative — a 1.5×
 * factor means an official report counts as 1.5 crowd reports, not
 * infinitely more, so the crowd signal still moves the aggregate.
 */
enum ReporterType: string
{
    use HasEnumValues;

    /** Government agencies, WFP, Ethiopian Commodity Exchange. */
    case Official = 'official';

    /** Farmer-reported observations collected by field agents. */
    case Crowd = 'crowd';

    public function label(): string
    {
        return match ($this) {
            self::Official => 'Official',
            self::Crowd => 'Crowd',
        };
    }

    /**
     * Relative weight for weighted-average price calculation.
     *
     * SnapshotService multiplies each report's price by this value
     * before dividing by the total weight sum. A higher weight pulls
     * the average toward that report's price more strongly.
     *
     * @see SnapshotService::weightedPrice()
     */
    public function weight(): float
    {
        return match ($this) {
            self::Official => 1.5,
            self::Crowd => 1.0,
        };
    }
}
