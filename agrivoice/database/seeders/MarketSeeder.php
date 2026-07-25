<?php

namespace Database\Seeders;

use App\Enums\MarketSlug;
use App\Models\Market;
use Illuminate\Database\Seeder;

/**
 * Seeds the three MVP market locations.
 *
 * Market data (name, region, coordinates) lives in the MarketSlug enum
 * as the single source of truth. This seeder materialises that enum
 * data into the `markets` database table so it can be referenced by
 * foreign key in reports.
 *
 * Uses updateOrCreate keyed on slug — re-seeding is safe and idempotent.
 */
class MarketSeeder extends Seeder
{
    /**
     * Create one database row per MarketSlug enum case.
     */
    public function run(): void
    {
        foreach (MarketSlug::cases() as $slug) {
            Market::query()->updateOrCreate(
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
