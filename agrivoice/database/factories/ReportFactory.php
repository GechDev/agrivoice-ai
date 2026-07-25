<?php

namespace Database\Factories;

use App\Enums\Crop;
use App\Enums\ReporterType;
use App\Models\Agent;
use App\Models\Market;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Report>
 */
class ReportFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'crop' => fake()->randomElement(Crop::cases()),
            'market_id' => Market::factory(),
            'price' => fake()->numberBetween(8_000, 20_000),
            'reporter_type' => ReporterType::Crowd,
            'source' => 'farmer',
            'agent_id' => Agent::factory(),
            'reported_at' => fake()->dateTimeBetween('-2 weeks'),
            'is_flagged' => false,
        ];
    }

    public function flagged(): static
    {
        return $this->state(['is_flagged' => true]);
    }
}
