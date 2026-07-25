<?php

namespace Database\Seeders;

use App\Enums\PlanTier;
use App\Enums\SubscriptionStatus;
use App\Models\Cooperative;
use App\Models\Subscription;
use Illuminate\Database\Seeder;

/**
 * Local/dev mock billing data — not called by DatabaseSeeder.
 */
class SubscriptionSeeder extends Seeder
{
    public function run(): void
    {
        $cooperative = Cooperative::query()->first();

        if ($cooperative === null) {
            return;
        }

        // TODO: replace mock subscription values with the selected payment provider API.
        Subscription::query()->updateOrCreate(
            ['cooperative_id' => $cooperative->id],
            [
                'plan_tier' => PlanTier::Growth,
                'price_per_month' => PlanTier::Growth->monthlyPrice(),
                'member_limit' => PlanTier::Growth->memberLimit(),
                'status' => SubscriptionStatus::Active,
                'current_period_end' => now()->addMonth()->toDateString(),
                'payment_method_type' => 'Telebirr',
                'payment_method_last_four' => '2048',
            ],
        );
    }
}
