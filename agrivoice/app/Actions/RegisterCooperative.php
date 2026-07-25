<?php

namespace App\Actions;

use App\Enums\CooperativeAdminRole;
use App\Enums\Crop;
use App\Enums\PlanTier;
use App\Enums\SubscriptionStatus;
use App\Models\Cooperative;
use App\Models\CooperativeAdmin;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class RegisterCooperative
{
    /**
     * Create a cooperative org and its owner admin from a signup request.
     *
     * @param  array{
     *     name: string,
     *     email: string,
     *     password: string,
     *     cooperative_name: string,
     *     region: string,
     * }  $input
     */
    public function handle(array $input): User
    {
        return DB::transaction(function () use ($input): User {
            $cooperative = Cooperative::query()->create([
                'name' => $input['cooperative_name'],
                'region' => $input['region'],
                'default_crops' => [Crop::Coffee->value, Crop::Teff->value],
            ]);

            $user = User::query()->create([
                'name' => $input['name'],
                'email' => $input['email'],
                'password' => $input['password'],
                'email_verified_at' => now(),
            ]);

            CooperativeAdmin::query()->create([
                'cooperative_id' => $cooperative->id,
                'user_id' => $user->id,
                'role' => CooperativeAdminRole::Owner,
            ]);

            Subscription::query()->create([
                'cooperative_id' => $cooperative->id,
                'plan_tier' => PlanTier::Starter,
                'price_per_month' => PlanTier::Starter->monthlyPrice(),
                'member_limit' => PlanTier::Starter->memberLimit(),
                'status' => SubscriptionStatus::Active,
                'current_period_end' => now()->addMonth()->toDateString(),
            ]);

            return $user;
        });
    }
}
