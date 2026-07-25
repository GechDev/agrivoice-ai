<?php

namespace App\Http\Middleware;

use App\Services\AgentSession;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Gates portal routes behind agent authentication.
 *
 * Registered as the 'agent' middleware alias in bootstrap/app.php.
 * Routes that require a signed-in data-entry agent (create, store)
 * use this middleware. The public live-list (index) does not.
 *
 * Behaviour:
 * - Authenticated → pass through
 * - Inertia page request → redirect to /portal/login
 * - API client (Accept: JSON, no X-Inertia header) → 401 JSON response
 *
 * The Inertia header check is necessary because Inertia sends
 * Accept: application/json on page visits, which would otherwise
 * trigger the JSON 401 branch instead of the redirect.
 */
class EnsureAgentIsAuthenticated
{
    public function __construct(private readonly AgentSession $agentSession) {}

    public function handle(Request $request, Closure $next): Response
    {
        if ($this->agentSession->isAuthenticated()) {
            return $next($request);
        }

        // Inertia page requests send Accept: application/json but also
        // include X-Inertia: true. We treat these as browser navigations
        // and redirect to the login page. Pure API clients (no X-Inertia)
        // get a 401 JSON response.
        if ($request->expectsJson() && ! $request->hasHeader('X-Inertia')) {
            return response()->json([
                'success' => false,
                'message' => 'Sign in as an agent to continue.',
            ], 401);
        }

        return redirect()->route('portal.login');
    }
}
