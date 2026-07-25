<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

/**
 * Root seeder that initialises a demo-ready database.
 *
 * One `php artisan migrate:fresh --seed` must leave the app usable for a
 * live showcase: markets, agents, reports, and a cooperative portal with
 * known login credentials.
 */
class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        $this->call([
            MarketSeeder::class,
            AgentSeeder::class,
            ReportSeeder::class,
            CooperativeDemoSeeder::class,
        ]);

        // Optional historical WFP import (not run by default — large, slow):
        // php artisan db:seed --class=WfpFoodPricesSeeder
    }
}
