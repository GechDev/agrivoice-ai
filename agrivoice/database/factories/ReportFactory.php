<?php

namespace Database\Factories;

use App\Enums\Crop;
use App\Enums\ReporterType;
use App\Models\Agent;
use App\Models\Market;
use App\Models\Report;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Report>
 */
class ReportFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'crop' => fake()->randomElement(Crop::cases()),
            'market_id' => Market::factory(),
            'price' => fake()->randomFloat(2, 2000, 12000),
            'reporter_type' => fake()->randomElement(ReporterType::cases()),
            'source' => fake()->optional()->randomElement(['wfp', 'ecx', 'user']),
            'agent_id' => Agent::factory(),
            'reported_at' => fake()->dateTimeBetween('-14 days', 'now'),
            'is_flagged' => false,
        ];
    }

    public function flagged(): static
    {
        return $this->state(fn () => ['is_flagged' => true]);
    }

    public function official(): static
    {
        return $this->state(fn () => ['reporter_type' => ReporterType::Official]);
    }

    public function crowd(): static
    {
        return $this->state(fn () => ['reporter_type' => ReporterType::Crowd]);
    }

    public function teff(): static
    {
        return $this->state(fn () => ['crop' => Crop::Teff]);
    }

    public function coffee(): static
    {
        return $this->state(fn () => ['crop' => Crop::Coffee]);
    }
}
