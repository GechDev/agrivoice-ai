<?php

namespace Database\Factories;

use App\Enums\Crop;
use App\Models\Cooperative;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Cooperative>
 */
class CooperativeFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->company().' Cooperative',
            'region' => fake()->randomElement(['Oromia', 'Amhara', 'SNNPR', 'Tigray']),
            'default_crops' => [Crop::Teff->value, Crop::Coffee->value],
        ];
    }

    public function teffOnly(): static
    {
        return $this->state(fn (): array => [
            'default_crops' => [Crop::Teff->value],
        ]);
    }

    public function coffeeOnly(): static
    {
        return $this->state(fn (): array => [
            'default_crops' => [Crop::Coffee->value],
        ]);
    }
}
