<?php

namespace Database\Seeders;

use App\Models\Agent;
use Illuminate\Database\Seeder;

/**
 * Seeds the fixed roster of data-entry agents.
 *
 * There is no sign-up screen by design — agents are demo fixtures,
 * not real users. Each agent has a name (their login identifier)
 * and a 4-digit PIN (their password). The PIN is stored via the
 * 'hashed' cast so it's bcrypt-hashed on write.
 *
 * These PINs are shared verbally during live demos. They are NOT
 * secrets — the security gate is that you must know both the name
 * AND the PIN, and the error message is deliberately vague.
 *
 * Uses updateOrCreate to be idempotent — re-seeding doesn't create
 * duplicates.
 */
class AgentSeeder extends Seeder
{
    /**
     * Demo agent roster. Names are the team members' first names.
     *
     * @var list<array{name: string, pin: string}>
     */
    private const AGENTS = [
        ['name' => 'Tsegaye', 'pin' => '1111'],
        ['name' => 'Gezachew', 'pin' => '2222'],
        ['name' => 'Nati', 'pin' => '3333'],
        ['name' => 'Nba', 'pin' => '4444'],
    ];

    public const PUBLIC_AGENT_NAME = 'Public Submission';

    public function run(): void
    {
        foreach (self::AGENTS as $agent) {
            Agent::query()->updateOrCreate(
                ['name' => $agent['name']],
                ['pin' => $agent['pin']],
            );
        }

        Agent::query()->firstOrCreate(
            ['name' => self::PUBLIC_AGENT_NAME],
            ['pin' => '0000'],
        );
    }
}
