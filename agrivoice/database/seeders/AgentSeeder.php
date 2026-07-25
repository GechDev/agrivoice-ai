<?php

namespace Database\Seeders;

use App\Models\Agent;
use Illuminate\Database\Seeder;

class AgentSeeder extends Seeder
{
    /**
     * The showcase roster. There is no sign-up screen by design, so these are
     * fixed demo fixtures rather than credentials — their purpose is that every
     * price on the dashboard can name the agent who collected it.
     *
     * @var list<array{name: string, pin: string}>
     */
    private const AGENTS = [
        ['name' => 'Tsegaye', 'pin' => '1111'],
        ['name' => 'Gezachew', 'pin' => '2222'],
        ['name' => 'Nati', 'pin' => '3333'],
        ['name' => 'Nba', 'pin' => '4444'],
    ];

    public function run(): void
    {
        foreach (self::AGENTS as $agent) {
            Agent::updateOrCreate(
                ['name' => $agent['name']],
                ['pin' => $agent['pin']],
            );
        }
    }
}
