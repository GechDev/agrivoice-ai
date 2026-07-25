<?php

namespace App\Models;

use App\Enums\MarketSlug;
use Database\Factories\MarketFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * A physical marketplace where commodity prices are observed.
 *
 * Markets are static reference data — there is no create/update/delete
 * endpoint. They are seeded once by MarketSeeder and referenced by
 * foreign key in the reports table. The MarketSlug enum carries the
 * display label, region, and Leaflet coordinates so the front-end
 * never has to reverse-geocode.
 *
 * The map on the dashboard renders one marker per market; clicking a
 * marker filters the live report list to that market.
 */
class Market extends Model
{
    /** @use HasFactory<MarketFactory> */
    use HasFactory;

    /**
     * All columns except timestamps are meaningful reference data.
     * slug is the stable URL key (e.g. ?market=adama) and must
     * never change once seeded.
     *
     * @var list<string>
     */
    protected $fillable = [
        'slug',
        'name',
        'region',
        'latitude',
        'longitude',
    ];

    /**
     * Casts:
     * - slug → MarketSlug enum for type-safe comparisons
     * - latitude/longitude → decimal:7 to preserve OSM precision
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'slug' => MarketSlug::class,
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
        ];
    }

    /**
     * All price reports observed at this market.
     *
     * @return HasMany<Report, $this>
     */
    public function reports(): HasMany
    {
        return $this->hasMany(Report::class);
    }
}
