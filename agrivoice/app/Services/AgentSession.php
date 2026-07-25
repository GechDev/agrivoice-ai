<?php

namespace App\Services;

use App\Models\Agent;
use Illuminate\Contracts\Session\Session;

/**
 * Lightweight session-based authentication for data-entry agents.
 *
 * This is deliberately NOT Laravel's auth guard. The reasons:
 *
 * 1. SIMPLICITY: Agents are seeded fixtures with a name and 4-digit PIN.
 *    There's no sign-up, no email, no password reset. Fortify handles
 *    the admin/settings auth (email + password). AgentSession handles
 *    the portal auth (name + PIN).
 *
 * 2. SHARED SESSION: Both auth systems share the same Laravel session
 *    cookie. Fortify uses the "login" key; AgentSession uses "agent_id".
 *    They never collide because they write to different session keys.
 *
 * 3. SCOPED BINDING: Registered as a scoped singleton in AppServiceProvider
 *    so the same AgentSession instance is shared between middleware and
 *    controllers within a single request, but each request gets a fresh
 *    instance (no cross-request state leakage).
 *
 * 4. FAIL-CLOSED: agentOrFail() aborts with 403 if no agent is signed in.
 *    Routes behind the 'agent' middleware can call this instead of
 *    null-checking, ensuring the code path is safe by construction.
 */
class AgentSession
{
    /** Session key where the authenticated agent's ID is stored. */
    private const SESSION_KEY = 'agent_id';

    /** Cached Agent model to avoid repeated DB lookups within a request. */
    private ?Agent $cachedAgent = null;

    public function __construct(private readonly Session $session) {}

    /**
     * Authenticate an agent and store their identity in the session.
     *
     * Regenerates the session ID to prevent session fixation attacks:
     * an attacker who set a cookie before login cannot replay it after
     * the agent authenticates.
     */
    public function login(Agent $agent): void
    {
        $this->session->regenerate();
        $this->session->put(self::SESSION_KEY, $agent->id);

        $this->cachedAgent = $agent;
    }

    /**
     * Clear the agent identity and regenerate the session.
     *
     * The regenerate() call invalidates any pre-logout session tokens,
     * preventing a stolen cookie from being reused after the agent
     * signs out.
     */
    public function logout(): void
    {
        $this->session->forget(self::SESSION_KEY);
        $this->session->regenerate();

        $this->cachedAgent = null;
    }

    /**
     * Check if an agent is currently signed in.
     *
     * Used by EnsureAgentIsAuthenticated middleware to decide whether
     * to allow the request or redirect to /portal/login.
     */
    public function isAuthenticated(): bool
    {
        return $this->agent() instanceof Agent;
    }

    /**
     * Retrieve the authenticated agent, or null if not signed in.
     *
     * Uses a cached copy to avoid hitting the database on every call
     * within a single request. The cache is cleared on login/logout.
     * If the session contains a stale agent ID (e.g. agent was deleted
     * from the DB), this returns null gracefully.
     */
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
     * The authenticated agent, or abort with 403.
     *
     * Use this in controllers/middleware behind the 'agent' middleware
     * to avoid repetitive null-checks. The middleware already guarantees
     * an agent is signed in, so this is a safety net + documentation
     * that the route requires authentication.
     */
    public function agentOrFail(): Agent
    {
        $agent = $this->agent();

        abort_if(! $agent instanceof Agent, 403, 'No agent is signed in.');

        return $agent;
    }
}
