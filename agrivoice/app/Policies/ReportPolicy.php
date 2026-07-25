<?php

namespace App\Policies;

use App\Models\CooperativeAdmin;
use App\Models\Report;
use App\Models\User;

class ReportPolicy
{
    public function viewAny(User $user): bool
    {
        return $this->isCooperativeAdmin($user);
    }

    public function view(User $user, Report $report): bool
    {
        return $this->belongsToAdminCooperative($user, $report);
    }

    public function update(User $user, Report $report): bool
    {
        return $this->belongsToAdminCooperative($user, $report);
    }

    private function isCooperativeAdmin(User $user): bool
    {
        return CooperativeAdmin::query()
            ->where('user_id', $user->id)
            ->exists();
    }

    private function belongsToAdminCooperative(User $user, Report $report): bool
    {
        $cooperativeId = CooperativeAdmin::query()
            ->where('user_id', $user->id)
            ->value('cooperative_id');

        if ($cooperativeId === null || $report->cooperative_member_id === null) {
            return false;
        }

        $report->loadMissing('cooperativeMember');

        return $report->cooperativeMember !== null
            && (int) $cooperativeId === (int) $report->cooperativeMember->cooperative_id;
    }
}
