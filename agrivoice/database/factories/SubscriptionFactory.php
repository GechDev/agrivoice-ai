<?php

namespace Database\Factories;

use App\Enums\PlanTier;
use App\Enums\SubscriptionStatus;
use App\Models\Cooperative;
use App\Models\Subscription;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Subscription>
 */
class SubscriptionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'cooperative_id' => Cooperative::factory(),
            'plan_tier' => PlanTier::Growth,
            'pending_plan_tier' => null,
            'price_per_month' => PlanTier::Growth->monthlyPrice(),
            'member_limit' => PlanTier::Growth->memberLimit(),
            'status' => SubscriptionStatus::Active,
            'current_period_end' => now()->addMonth()->toDateString(),
            'payment_method_type' => 'Telebirr',
            'payment_method_last_four' => fake()->numerify('####'),
        ];
    }

    public function starter(): static
    {
        return $this->state(fn (): array => [
            'plan_tier' => PlanTier::Starter,
            'price_per_month' => PlanTier::Starter->monthlyPrice(),
            'member_limit' => PlanTier::Starter->memberLimit(),
        ]);
    }
}
