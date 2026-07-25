<?php

namespace Database\Factories;

use App\Enums\MarketSlug;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Market>
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
