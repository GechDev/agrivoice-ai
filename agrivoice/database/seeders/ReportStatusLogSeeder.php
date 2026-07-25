<?php

namespace Database\Seeders;

use App\Enums\ReportStatus;
use App\Models\Cooperative;
use App\Models\CooperativeAdmin;
use App\Models\CooperativeMember;
use App\Models\Market;
use App\Models\Report;
use App\Models\ReportStatusLog;
use App\Models\User;
use Illuminate\Database\Seeder;

class ReportStatusLogSeeder extends Seeder
{
    /**
     * Seed sample status-change audit rows for local development.
     * Not called from DatabaseSeeder — invoke explicitly when needed.
     */
    public function run(): void
    {
        $market = Market::query()->first() ?? Market::factory()->adama()->create();
        $cooperative = Cooperative::factory()->create();
        $admin = User::factory()->create();

        CooperativeAdmin::factory()->owner()->create([
            'cooperative_id' => $cooperative->id,
            'user_id' => $admin->id,
        ]);

        $member = CooperativeMember::factory()->active()->create([
            'cooperative_id' => $cooperative->id,
        ]);

        $report = Report::factory()->fromMember($member)->pending()->create([
            'market_id' => $market->id,
            'reported_at' => now()->subHours(2),
        ]);

        ReportStatusLog::factory()->create([
            'report_id' => $report->id,
            'changed_by' => $admin->id,
            'old_status' => ReportStatus::Pending,
            'new_status' => ReportStatus::Verified,
            'reason' => null,
            'created_at' => now()->subHour(),
        ]);

        $report->forceFill(['status' => ReportStatus::Verified])->save();
    }
}
