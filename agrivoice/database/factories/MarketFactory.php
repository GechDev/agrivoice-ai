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
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return $this->attributesForSlug(MarketSlug::Adama);
    }

    public function slug(MarketSlug $slug): static
    {
        return $this->state(fn (): array => $this->attributesForSlug($slug));
    }

    public function adama(): static
    {
        return $this->slug(MarketSlug::Adama);
    }

    public function addisAbaba(): static
    {
        return $this->slug(MarketSlug::AddisAbaba);
    }

    public function jimma(): static
    {
        return $this->slug(MarketSlug::Jimma);
    }

    /**
     * @return array<string, mixed>
     */
    private function attributesForSlug(MarketSlug $slug): array
    {
        return [
            'slug' => $slug,
            'name' => $slug->label(),
            'region' => $slug->region(),
            ...$slug->coordinates(),
        ];
    }
}
