<?php

namespace App\Actions;

use App\Models\Report;

/**
 * Marks a price report as a flagged outlier.
 *
 * Flagged reports are excluded from every aggregate by the
 * Report::notFlagged() scope. This means:
 * - SnapshotService won't include them in weighted averages
 * - PredictionService won't include them in trend calculations
 * - The dashboard tiles won't reflect their prices
 *
 * The action is idempotent: flagging an already-flagged report
 * is a no-op (no unnecessary write). Uses forceFill() to bypass
 * the fillable check since is_flagged is in fillable but this
 * is a deliberate admin operation.
 *
 * There is no "unflag" action — once quarantined, a report stays
 * quarantined. This simplifies the moderation flow: flag it and
 * move on.
 */
class FlagReport
{
    /**
     * Mark a report as a flagged outlier (excluded from dashboard aggregates).
     */
    public function handle(Report $report): Report
    {
        if (! $report->is_flagged) {
            $report->forceFill(['is_flagged' => true])->save();
        }

        return $report->refresh();
    }
}
