<?php

namespace Database\Factories;

use App\Enums\CooperativeAdminRole;
use App\Models\Cooperative;
use App\Models\CooperativeAdmin;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CooperativeAdmin>
 */
class CooperativeAdminFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'cooperative_id' => Cooperative::factory(),
            'user_id' => User::factory(),
            'role' => CooperativeAdminRole::Owner,
        ];
    }

    public function owner(): static
    {
        return $this->state(fn (): array => [
            'role' => CooperativeAdminRole::Owner,
        ]);
    }

    public function staff(): static
    {
        return $this->state(fn (): array => [
            'role' => CooperativeAdminRole::Staff,
        ]);
    }
}
