<?php

namespace App\Http\Middleware;

use App\Services\AgentSession;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAgentIsAuthenticated
{
    public function __construct(private readonly AgentSession $agentSession) {}

    public function handle(Request $request, Closure $next): Response
    {
        if ($this->agentSession->isAuthenticated()) {
            return $next($request);
        }

        // Inertia sends an Accept header that looks like JSON, so the header is
        // what actually distinguishes a page visit from an API client.
        if ($request->expectsJson() && ! $request->hasHeader('X-Inertia')) {
            return response()->json([
                'success' => false,
                'message' => 'Sign in as an agent to continue.',
            ], 401);
        }

        return redirect()->route('portal.login');
    }
}
