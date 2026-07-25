<?php

namespace Database\Factories;

use App\Enums\CooperativeMemberStatus;
use App\Models\Cooperative;
use App\Models\CooperativeMember;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CooperativeMember>
 */
class CooperativeMemberFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'cooperative_id' => Cooperative::factory(),
            'farmer_id' => null,
            'name' => fake()->optional(0.6)->name(),
            'phone_number' => '+2519'.fake()->unique()->numerify('########'),
            'status' => CooperativeMemberStatus::Invited,
            'joined_at' => null,
        ];
    }

    public function active(): static
    {
        return $this->state(fn (): array => [
            'status' => CooperativeMemberStatus::Active,
            'joined_at' => now()->subDays(fake()->numberBetween(1, 60)),
        ]);
    }

    public function invited(): static
    {
        return $this->state(fn (): array => [
            'status' => CooperativeMemberStatus::Invited,
            'joined_at' => null,
        ]);
    }

    public function removed(): static
    {
        return $this->state(fn (): array => [
            'status' => CooperativeMemberStatus::Removed,
        ]);
    }

    public function claimed(): static
    {
        return $this->state(fn (): array => [
            'farmer_id' => User::factory(),
            'status' => CooperativeMemberStatus::Active,
            'joined_at' => now()->subDays(7),
        ]);
    }
}
