<?php

namespace App\Models;

use App\Enums\Crop;
use App\Enums\ReporterType;
use App\Enums\ReportStatus;
use Database\Factories\ReportFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property Crop $crop
 * @property int $market_id
 * @property string $price Decimal cast, so ETB comes back as a string.
 * @property ReporterType $reporter_type
 * @property string|null $source
 * @property int|null $agent_id
 * @property int|null $cooperative_member_id
 * @property Carbon $reported_at
 * @property bool $is_flagged
 * @property ReportStatus $status
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Market $market
 * @property-read Agent|null $agent
 * @property-read CooperativeMember|null $cooperativeMember
 * @property-read Collection<int, ReportStatusLog> $statusLogs
 */
class Report extends Model
{
    /** @use HasFactory<ReportFactory> */
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
        'cooperative_member_id',
        'reported_at',
        'is_flagged',
        'status',
    ];

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
            'status' => ReportStatus::class,
        ];
    }

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
     * @return BelongsTo<CooperativeMember, $this>
     */
    public function cooperativeMember(): BelongsTo
    {
        return $this->belongsTo(CooperativeMember::class);
    }

    /**
     * @return HasMany<ReportStatusLog, $this>
     */
    public function statusLogs(): HasMany
    {
        return $this->hasMany(ReportStatusLog::class)
            ->latest('created_at')
            ->latest('id');
    }

    /**
     * Flagged reports are excluded from every aggregate, so the snapshot and
     * trend engines share this scope rather than each rewriting the filter.
     *
     * @param  Builder<Report>  $query
     * @return Builder<Report>
     */
    public function scopeNotFlagged(Builder $query): Builder
    {
        return $query->where('is_flagged', false);
    }

    /**
     * Only verified reports (excludes pending, disputed, and rejected).
     *
     * @param  Builder<Report>  $query
     * @return Builder<Report>
     */
    public function scopeVerified(Builder $query): Builder
    {
        return $query->where('status', ReportStatus::Verified);
    }

    /**
     * @param  Builder<Report>  $query
     * @return Builder<Report>
     */
    public function scopeForCropMarket(Builder $query, Crop $crop, int $marketId): Builder
    {
        return $query->where('crop', $crop)->where('market_id', $marketId);
    }

    /**
     * Constrain to reports submitted by members of the given cooperative.
     *
     * @param  Builder<Report>  $query
     * @return Builder<Report>
     */
    public function scopeForCooperative(Builder $query, int $id): Builder
    {
        $membersTable = (new CooperativeMember)->getTable();

        return $query->whereIn('cooperative_member_id', function ($subquery) use ($id, $membersTable): void {
            $subquery->select('id')
                ->from($membersTable)
                ->where('cooperative_id', $id);
        });
    }
}
