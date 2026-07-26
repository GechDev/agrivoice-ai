<?php

namespace App\Enums;

use App\Concerns\HasEnumValues;

/**
 * Supported commodity crops in the AgriVoice system.
 *
 * The original MVP shipped with only Teff and Coffee — the two most
 * price-volatile staples in Ethiopian farmers' markets. Maize, Wheat,
 * Sesame, Pulses, and Sorghum were added to broaden coverage during
 * the second sprint. Every crop must have seeded price history for the
 * dashboard snapshot engine to produce a row; missing crops simply
 * render as empty.
 *
 * The back-end stores the lower-case slug (e.g. "teff") as the
 * database column value. The front-end maps these via CropLabel()
 * in resources/js/lib/agrivoice.ts — keep those two in sync.
 */
enum Crop: string
{
    use HasEnumValues;

    case Teff = 'teff';
    case Coffee = 'coffee';
    case Maize = 'maize';
    case Wheat = 'wheat';
    case Sesame = 'sesame';
    case Pulses = 'pulses';
    case Sorghum = 'sorghum';

    /**
     * Crops shown on the public live dashboard (first six in enum order).
     *
     * Sorghum remains in the system for reports/IVR, but the projector
     * dashboard keeps a six-tile grid for readability.
     *
     * @return list<string>
     */
    public static function dashboardValues(): array
    {
        return array_slice(self::values(), 0, 6);
    }

    /**
     * Human-readable display label shown in the dashboard and entry form.
     *
     * Kept as a simple PascalCase string rather than pulling from a
     * translation file, because the seed data is English-only and the
     * label appears in high-frequency UI elements where a round-trip
     * to the translation service would be wasteful.
     */
    public function label(): string
    {
        return match ($this) {
            self::Teff => 'Teff',
            self::Coffee => 'Coffee',
            self::Maize => 'Maize',
            self::Wheat => 'Wheat',
            self::Sesame => 'Sesame',
            self::Pulses => 'Pulses',
            self::Sorghum => 'Sorghum',
        };
    }
}
