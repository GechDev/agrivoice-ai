<?php

namespace Database\Seeders;

use App\Enums\MarketSlug;
use App\Models\Market;
use Illuminate\Database\Seeder;

class MarketSeeder extends Seeder
{
    /**
     * Seed the three MVP markets with lat/long for the live map.
     */
    public function run(): void
    {
        $markets = [
            [
                'slug' => MarketSlug::Adama,
                'name' => 'Adama',
                'region' => 'Oromia',
                'latitude' => 8.5400000,
                'longitude' => 39.2700000,
            ],
            [
                'slug' => MarketSlug::AddisAbaba,
                'name' => 'Addis Ababa',
                'region' => 'Addis Ababa',
                'latitude' => 9.0300000,
                'longitude' => 38.7400000,
            ],
            [
                'slug' => MarketSlug::Jimma,
                'name' => 'Jimma',
                'region' => 'Oromia',
                'latitude' => 7.6700000,
                'longitude' => 36.8300000,
            ],
        ];

        foreach ($markets as $market) {
            Market::query()->updateOrCreate(
                ['slug' => $market['slug']],
                $market,
            );
        }
    }
}
