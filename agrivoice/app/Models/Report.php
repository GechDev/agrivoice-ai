<?php

namespace App\Models;

use App\Enums\Crop;
use App\Enums\ReporterType;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Report extends Model
{
    /** @use HasFactory<\Database\Factories\ReportFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'crop',
        'market_id',
        'price',
        'reporter_type',
        'source',
        'agent_id',
        'reported_at',
        'is_flagged',
    ];

    /**
     * @return BelongsTo<Market, $this>
     */
    public function market(): BelongsTo
    {
        return $this->belongsTo(Market::class);
    }

    /**
     * @return BelongsTo<Agent, $this>
     */
    public function agent(): BelongsTo
    {
        return $this->belongsTo(Agent::class);
    }

    /**
     * Flagged reports are excluded from every aggregate, so the snapshot and
     * trend engines share this scope rather than each rewriting the filter.
     *
     * @param  Builder<$this>  $query
     */
    public function scopeNotFlagged(Builder $query): void
    {
        $query->where('is_flagged', false);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'crop' => Crop::class,
            'reporter_type' => ReporterType::class,
            'price' => 'decimal:2',
            'reported_at' => 'datetime',
            'is_flagged' => 'boolean',
        ];
    }
}
