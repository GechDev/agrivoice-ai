<?php

namespace App\Models;

use App\Enums\Crop;
use App\Enums\Trend;
use Database\Factories\PredictionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property Crop $crop
 * @property int $market_id
 * @property string $predicted_price Decimal cast, so ETB comes back as a string.
 * @property Trend $trend
 * @property int $confidence_score
 * @property Carbon $predicted_for
 * @property Carbon $generated_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Market $market
 */
class Prediction extends Model
{
    /** @use HasFactory<PredictionFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'crop',
        'market_id',
        'predicted_price',
        'trend',
        'confidence_score',
        'predicted_for',
        'generated_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'crop' => Crop::class,
            'predicted_price' => 'decimal:2',
            'trend' => Trend::class,
            'confidence_score' => 'integer',
            'predicted_for' => 'date',
            'generated_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Market, $this>
     */
    public function market(): BelongsTo
    {
        return $this->belongsTo(Market::class);
    }
}
