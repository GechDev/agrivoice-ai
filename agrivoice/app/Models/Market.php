<?php

namespace App\Models;

use App\Enums\MarketSlug;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property MarketSlug $slug
 * @property string $name
 * @property string $region
 * @property float $latitude
 * @property float $longitude
 * @property CarbonInterface $created_at
 * @property CarbonInterface $updated_at
 * @property-read Collection<int, Report> $reports
 */
class Market extends Model
{
    /** @use HasFactory<\Database\Factories\MarketFactory> */
    use HasFactory;

    /**
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
     * @return HasMany<Report, $this>
     */
    public function reports(): HasMany
    {
        return $this->hasMany(Report::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'slug' => MarketSlug::class,
            'latitude' => 'float',
            'longitude' => 'float',
        ];
    }
}
