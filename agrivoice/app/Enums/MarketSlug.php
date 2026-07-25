<?php

namespace App\Enums;

use App\Concerns\HasEnumValues;

/**
 * Geographic market locations tracked by AgriVoice.
 *
 * Each enum case maps to a `markets` database row via MarketSeeder.
 * The slug doubles as the stable URL key — e.g. /reports?market=adama —
 * so renaming an enum case would break deep links. Treat these as
 * immutable once seeded.
 *
 * Coordinates are the approximate centre of each market area as used
 * by the Leaflet map on the dashboard. They were taken from OSM
 * Nominatim geocoding and are deliberately coarse — the pin is a
 * visual hint, not a GPS lock.
 */
enum MarketSlug: string
{
    use HasEnumValues;

    /** Regional capital in the Rift Valley; heavy official price reporting. */
    case Adama = 'adama';

    /** National capital; highest crowd-report density. */
    case AddisAbaba = 'addis_ababa';

    /** Western Oromia hub; strong for coffee and pulses. */
    case Jimma = 'jimma';

    /**
     * Display label shown in the sidebar, filter pills, and map tooltips.
     */
    public function label(): string
    {
        return match ($this) {
            self::Adama => 'Adama',
            self::AddisAbaba => 'Addis Ababa',
            self::Jimma => 'Jimma',
        };
    }

    /**
     * Administrative region the market sits in.
     *
     * Used by the dashboard to group markets when a region filter is
     * added in a later sprint. Both Adama and Jimma fall under Oromia;
     * Addis Ababa is a chartered city and gets its own region string.
     */
    public function region(): string
    {
        return match ($this) {
            self::Adama, self::Jimma => 'Oromia',
            self::AddisAbaba => 'Addis Ababa',
        };
    }

    /**
     * Centre-point coordinates for the Leaflet dashboard map.
     *
     * @return array{latitude: float, longitude: float}
     */
    public function coordinates(): array
    {
        return match ($this) {
            self::Adama => ['latitude' => 8.5400, 'longitude' => 39.2675],
            self::AddisAbaba => ['latitude' => 9.0300, 'longitude' => 38.7400],
            self::Jimma => ['latitude' => 7.6733, 'longitude' => 36.8344],
        };
    }
}
