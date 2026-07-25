<?php

namespace App\Actions;

use App\Models\Report;

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
