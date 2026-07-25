<?php

namespace App\Models;

use Database\Factories\AgentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * A field agent who collects crowd-price reports from farmers.
 *
 * Agents authenticate via the lightweight session-based flow
 * (AgentSession), not the Fortify auth guard. The portal presents a
 * roster of seeded agents; the agent taps their name and enters a
 * four-digit PIN. There is no sign-up screen — agents are fixtures
 * seeded by AgentSeeder.
 *
 * The PIN is stored as a bcrypt hash (via the 'hashed' cast) and
 * never exposed to the front-end ($hidden). Authentication is
 * intentionally vague on failure to avoid leaking information about
 * which agent names exist.
 */
class Agent extends Model
{
    /** @use HasFactory<AgentFactory> */
    use HasFactory;

    /**
     * Name is the agent's login identifier and display label.
     * PIN is the shared secret — both are mass-assignable only through
     * the seeder/factory; no HTTP request should set these directly.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'pin',
    ];

    /**
     * PIN must never be serialized to JSON or passed to the front-end.
     * This applies to Inertia props, API responses, and log output.
     *
     * @var list<string>
     */
    protected $hidden = [
        'pin',
    ];

    /**
     * The 'hashed' cast automatically bcrypt-hashes the PIN on write
     * and verifies it via Hash::check() on comparison. This means
     * AgentLoginRequest can call Hash::check($plain, $agent->pin)
     * without manually hashing.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'pin' => 'hashed',
        ];
    }

    /**
     * All price reports submitted by this agent.
     *
     * Report.agent_id is stamped from the session — never from a
     * form field — so this relationship is append-only and cannot be
     * tampered with by the front-end.
     *
     * @return HasMany<Report, $this>
     */
    public function reports(): HasMany
    {
        return $this->hasMany(Report::class);
    }
}
