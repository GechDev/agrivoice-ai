<?php

namespace Database\Seeders;

use App\Models\Agent;
use Illuminate\Database\Seeder;

class AgentSeeder extends Seeder
{
    /**
     * Seed the four team agents (shared foundation — Gezachew's slice).
     */
    public function run(): void
    {
        $agents = [
            'Tsegaye',
            'Gezachew',
            'Nati',
            'Nba',
        ];

        foreach ($agents as $name) {
            Agent::query()->updateOrCreate(
                ['name' => $name],
                ['pin' => '1234'],
            );
        }
    }
}
