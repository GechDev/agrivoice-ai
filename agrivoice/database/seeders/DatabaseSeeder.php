<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

/**
 * Root seeder that initialises the application database.
 *
 * Seeds a test user (for Fortify admin/settings) and the three
 * AgriVoice-specific tables: markets, agents, and reports.
 *
 * WithoutModelEvents prevents event dispatch during seeding for
 * performance — seeding ~100 reports would otherwise fire hundreds
 * of model events.
 */
class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Fortify test user — needed for the settings/profile pages
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        // Order matters: markets and agents must exist before reports reference them.
        $this->call([
            MarketSeeder::class,
            AgentSeeder::class,
            ReportSeeder::class,
        ]);
    }
}
