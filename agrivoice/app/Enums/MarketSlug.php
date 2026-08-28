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

    /**
     * Approximate reporting catchment radius in kilometres around the market hub.
     *
     * Sized to the city/peri-urban footprint so map pins stay inside the
     * selected market area rather than drifting into neighbouring towns.
     */
    public function catchmentRadiusKm(): float
    {
        return match ($this) {
            self::Adama => 26.0,
            self::AddisAbaba => 16.0,
            self::Jimma => 30.0,
        };
    }

    /**
     * Deterministic fake submission pins inside this market's catchment.
     *
     * Reports do not store GPS yet, so the dashboard visualises where
     * crowd reports are treated as coming from: 20–40 points scattered
     * around the market hub. The seed is derived from the slug so the
     * cloud stays stable across polls.
     *
     * @return list<array{id: int, latitude: float, longitude: float, crop: string}>
     */
    public function submissionLocations(): array
    {
        $seed = crc32('agrivoice-submissions-'.$this->value);
        mt_srand($seed);

        $count = mt_rand(20, 40);
        $center = $this->coordinates();
        $radiusKm = $this->catchmentRadiusKm();
        $crops = Crop::dashboardValues();
        $points = [];

        for ($index = 1; $index <= $count; $index++) {
            $angle = (mt_rand() / mt_getrandmax()) * 2 * M_PI;
            // sqrt keeps the disk uniform instead of clustering at the centre
            $distanceKm = sqrt(mt_rand() / mt_getrandmax()) * $radiusKm;
            $latOffset = ($distanceKm / 111.32) * cos($angle);
            $lngScale = 111.32 * cos(deg2rad($center['latitude']));
            $lngOffset = $lngScale > 0.0
                ? ($distanceKm / $lngScale) * sin($angle)
                : 0.0;

            $points[] = [
                'id' => $index,
                'latitude' => round($center['latitude'] + $latOffset, 6),
                'longitude' => round($center['longitude'] + $lngOffset, 6),
                'crop' => $crops[($index - 1) % count($crops)],
            ];
        }

        mt_srand();

        return $points;
    }
}
