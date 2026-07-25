<?php

namespace App\Services;

use App\Models\Agent;
use Illuminate\Contracts\Session\Session;

/**
 * Holds the identity of the agent doing data entry.
 *
 * This is deliberately not Laravel's auth guard: agents are seeded operators
 * with a name and a PIN, and the only thing the session needs to remember is
 * which one of them is entering prices, so every report can be attributed.
 */
class AgentSession
{
    private const SESSION_KEY = 'agent_id';

    private ?Agent $cachedAgent = null;

    public function __construct(private readonly Session $session) {}

    public function login(Agent $agent): void
    {
        // Fresh session id on sign-in so a pre-login session cannot be replayed.
        $this->session->regenerate();
        $this->session->put(self::SESSION_KEY, $agent->id);

        $this->cachedAgent = $agent;
    }

    public function logout(): void
    {
        $this->session->forget(self::SESSION_KEY);
        $this->session->regenerate();

        $this->cachedAgent = null;
    }

    public function isAuthenticated(): bool
    {
        return $this->agent() instanceof Agent;
    }

    public function agent(): ?Agent
    {
        if ($this->cachedAgent instanceof Agent) {
            return $this->cachedAgent;
        }

        $agentId = $this->session->get(self::SESSION_KEY);

        if (! is_int($agentId)) {
            return null;
        }

        return $this->cachedAgent = Agent::find($agentId);
    }

    /**
     * The signed-in agent. Routes behind the agent middleware can rely on this
     * instead of null-checking, and it fails closed if the session is stale.
     */
    public function agentOrFail(): Agent
    {
        $agent = $this->agent();

        abort_if(! $agent instanceof Agent, 403, 'No agent is signed in.');

        return $agent;
    }
}
