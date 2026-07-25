<?php

namespace App\Models;

use App\Enums\Crop;
use App\Enums\ReporterType;
use Database\Factories\ReportFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * A single price observation at a market.
 *
 * This is the central fact table of AgriVoice. Every displayed price
 * on the dashboard is a derived aggregate over unflagged reports —
 * prices are never stored as denormalised columns.
 *
 * Lifecycle:
 *   1. Agent signs in via AgentSession (PIN auth).
 *   2. Agent picks crop + market + enters price + reporter_type.
 *   3. ReportEntryService stamps agent_id from the session and
 *      resolves reported_at (same-day → clock time, backdated → start of day).
 *   4. SnapshotService reads unflagged reports within the trailing
 *      window and computes weighted-average prices.
 *   5. Dashboard renders the snapshots; live list shows recent reports.
 *
 * The `is_flagged` boolean is the moderation lever. Flagged rows are
 * excluded from every aggregate scope (notFlagged) so the dashboard
 * and trend engine never see them. There is no "unflag" UI — once
 * flagged, the row is quarantined.
 */
class Report extends Model
{
    /** @use HasFactory<ReportFactory> */
    use HasFactory;

    /**
     * All report columns are meaningful. agent_id is stamped server-side
     * and must not be mass-assigned from the front-end. is_flagged
     * defaults to false and is only toggled by FlagReport action.
     *
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
     * Type casts enforce domain invariants at the database boundary:
     * - crop: stored as lowercase string, cast to Crop enum for type safety
     * - reporter_type: cast to ReporterType enum which carries weight()
     * - price: decimal:2 — ETB amounts have two decimal places
     * - reported_at: Carbon datetime for date-range filtering
     * - is_flagged: boolean — simple on/off, no soft-delete needed
     *
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

    /**
     * The market where this price was observed.
     *
     * @return BelongsTo<Market, $this>
     */
    public function market(): BelongsTo
    {
        return $this->belongsTo(Market::class);
    }

    /**
     * The agent who submitted this report.
     *
     * agent_id is stamped from the session in ReportEntryService,
     * never from a form field. This prevents impersonation even if
     * a malicious agent adds a hidden field to the entry form.
     *
     * @return BelongsTo<Agent, $this>
     */
    public function agent(): BelongsTo
    {
        return $this->belongsTo(Agent::class);
    }

    /**
     * Excludes flagged reports from aggregate queries.
     *
     * Both SnapshotService and PredictionService chain this scope so
     * a flagged outlier never distorts the weighted average or trend
     * calculation. This is the single point of truth for "visible
     * reports" — if you need to query all reports (e.g. for an admin
     * audit view), omit this scope deliberately.
     *
     * @param  Builder<Report>  $query
     * @return Builder<Report>
     */
    public function scopeNotFlagged(Builder $query): Builder
    {
        return $query->where('is_flagged', false);
    }

    /**
     * Narrows to a specific crop-market combination.
     *
     * Used by SnapshotService and PredictionService to compute
     * per-tile aggregates. The composite index on (crop, market_id,
     * reported_at) makes this query fast.
     *
     * @param  Builder<Report>  $query
     * @return Builder<Report>
     */
    public function scopeForCropMarket(Builder $query, Crop $crop, int $marketId): Builder
    {
        return $query->where('crop', $crop)->where('market_id', $marketId);
    }
}
