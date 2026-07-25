<?php

namespace App\Policies;

use App\Models\CooperativeAdmin;
use App\Models\Subscription;
use App\Models\User;

class SubscriptionPolicy
{
    public function viewAny(User $user): bool
    {
        return CooperativeAdmin::query()->where('user_id', $user->id)->exists();
    }

    public function view(User $user, Subscription $subscription): bool
    {
        return $this->belongsToAdminCooperative($user, $subscription);
    }

    public function update(User $user, Subscription $subscription): bool
    {
        return $this->belongsToAdminCooperative($user, $subscription);
    }

    private function belongsToAdminCooperative(User $user, Subscription $subscription): bool
    {
        return CooperativeAdmin::query()
            ->where('user_id', $user->id)
            ->where('cooperative_id', $subscription->cooperative_id)
            ->exists();
    }
}
