<?php

namespace Database\Factories;

use App\Enums\Crop;
use App\Enums\Trend;
use App\Models\Market;
use App\Models\Prediction;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Prediction>
 */
class PredictionFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'crop' => fake()->randomElement(Crop::cases()),
            'market_id' => Market::factory(),
            'predicted_price' => fake()->numberBetween(8_000, 20_000),
            'trend' => fake()->randomElement(Trend::cases()),
            'confidence_score' => fake()->numberBetween(40, 95),
            'predicted_for' => fake()->dateTimeBetween('-30 days', '+7 days')->format('Y-m-d'),
            'generated_at' => fake()->dateTimeBetween('-7 days', 'now'),
        ];
    }

    public function forCrop(Crop $crop): static
    {
        return $this->state(fn (): array => [
            'crop' => $crop,
        ]);
    }
}
