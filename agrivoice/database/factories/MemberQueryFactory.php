<?php

namespace Database\Factories;

use App\Enums\Crop;
use App\Models\CooperativeMember;
use App\Models\Market;
use App\Models\MemberQuery;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MemberQuery>
 */
class MemberQueryFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'cooperative_member_id' => CooperativeMember::factory(),
            'crop' => fake()->optional()->randomElement(Crop::cases()),
            'market_id' => null,
            'query_text' => fake()->optional()->sentence(),
            'channel' => 'voice',
            'queried_at' => fake()->dateTimeBetween('-14 days', 'now'),
        ];
    }

    public function forMarket(Market $market): static
    {
        return $this->state(fn (): array => [
            'market_id' => $market->id,
        ]);
    }

    public function voice(): static
    {
        return $this->state(fn (): array => [
            'channel' => 'voice',
        ]);
    }
}
