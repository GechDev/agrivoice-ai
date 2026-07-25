<?php

namespace App\Policies;

use App\Enums\CooperativeMemberStatus;
use App\Models\CooperativeAdmin;
use App\Models\CooperativeMember;
use App\Models\User;

class CooperativeMemberPolicy
{
    public function viewAny(User $user): bool
    {
        return $this->isCooperativeAdmin($user);
    }

    public function view(User $user, CooperativeMember $cooperativeMember): bool
    {
        return $this->belongsToAdminCooperative($user, $cooperativeMember);
    }

    public function create(User $user): bool
    {
        return $this->isCooperativeAdmin($user);
    }

    public function remove(User $user, CooperativeMember $cooperativeMember): bool
    {
        if ($cooperativeMember->status === CooperativeMemberStatus::Removed) {
            return false;
        }

        return $this->belongsToAdminCooperative($user, $cooperativeMember);
    }

    private function isCooperativeAdmin(User $user): bool
    {
        return CooperativeAdmin::query()
            ->where('user_id', $user->id)
            ->exists();
    }

    private function belongsToAdminCooperative(User $user, CooperativeMember $member): bool
    {
        $cooperativeId = CooperativeAdmin::query()
            ->where('user_id', $user->id)
            ->value('cooperative_id');

        return $cooperativeId !== null
            && (int) $cooperativeId === (int) $member->cooperative_id;
    }
}
