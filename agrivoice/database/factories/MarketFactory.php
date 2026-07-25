<?php

namespace Database\Factories;

use App\Enums\MarketSlug;
use App\Models\Market;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Market>
 */
class MarketFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'slug' => fake()->unique()->randomElement(MarketSlug::cases()),
            'name' => fake()->city(),
            'region' => fake()->state(),
            'latitude' => fake()->latitude(3, 15),
            'longitude' => fake()->longitude(32, 48),
        ];
    }

    public function adama(): static
    {
        return $this->state(fn () => [
            'slug' => MarketSlug::Adama,
            'name' => 'Adama',
            'region' => 'Oromia',
            'latitude' => 8.5400000,
            'longitude' => 39.2700000,
        ]);
    }

    public function addisAbaba(): static
    {
        return $this->state(fn () => [
            'slug' => MarketSlug::AddisAbaba,
            'name' => 'Addis Ababa',
            'region' => 'Addis Ababa',
            'latitude' => 9.0300000,
            'longitude' => 38.7400000,
        ]);
    }

    public function jimma(): static
    {
        return $this->state(fn () => [
            'slug' => MarketSlug::Jimma,
            'name' => 'Jimma',
            'region' => 'Oromia',
            'latitude' => 7.6700000,
            'longitude' => 36.8300000,
        ]);
    }
}
