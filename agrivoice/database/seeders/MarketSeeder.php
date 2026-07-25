<?php

namespace Database\Seeders;

use App\Enums\MarketSlug;
use App\Models\Market;
use Illuminate\Database\Seeder;

class MarketSeeder extends Seeder
{
    public function run(): void
    {
        foreach (MarketSlug::cases() as $slug) {
            Market::updateOrCreate(
                ['slug' => $slug->value],
                [
                    'name' => $slug->label(),
                    'region' => $slug->region(),
                    ...$slug->coordinates(),
                ],
            );
        }
    }
}
