<?php

namespace App\Actions;

use App\Enums\ReportStatus;
use App\Models\Report;
use App\Models\ReportStatusLog;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ChangeReportStatus
{
    public function handle(
        Report $report,
        ReportStatus $newStatus,
        ?string $reason,
        User $changedBy,
    ): Report {
        return DB::transaction(function () use ($report, $newStatus, $reason, $changedBy): Report {
            /** @var Report $locked */
            $locked = Report::query()
                ->whereKey($report->id)
                ->lockForUpdate()
                ->firstOrFail();

            $oldStatus = $locked->status;

            $locked->forceFill([
                'status' => $newStatus,
            ])->save();

            ReportStatusLog::query()->create([
                'report_id' => $locked->id,
                'changed_by' => $changedBy->id,
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'reason' => $reason,
            ]);

            return $locked->refresh();
        });
    }
}
