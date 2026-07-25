<?php

namespace App\Models;

use App\Enums\MarketSlug;
use Database\Factories\MarketFactory;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property MarketSlug $slug
 * @property string $name
 * @property string $region
 * @property string $latitude
 * @property string $longitude
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Collection<int, Report> $reports
 * @property-read Collection<int, Prediction> $predictions
 * @property-read Collection<int, MemberQuery> $memberQueries
 */
class Market extends Model
{
    /** @use HasFactory<MarketFactory> */
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
     * @return HasMany<Report, $this>
     */
    public function reports(): HasMany
    {
        return $this->hasMany(Report::class);
    }

    /**
     * @return HasMany<Prediction, $this>
     */
    public function predictions(): HasMany
    {
        return $this->hasMany(Prediction::class);
    }

    /**
     * @return HasMany<MemberQuery, $this>
     */
    public function memberQueries(): HasMany
    {
        return $this->hasMany(MemberQuery::class);
    }
}
