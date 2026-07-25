<?php

namespace App\Http\Controllers;

use App\Http\Requests\AgentLoginRequest;
use App\Models\Agent;
use App\Services\AgentSession;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Lightweight authentication for data-entry agents.
 *
 * Agents sign in with a name (from a seeded roster) and a 4-digit PIN.
 * There is no sign-up, no email, no password reset. The sole purpose is
 * attribution — knowing which agent entered a price makes the data
 * credible on the live dashboard.
 *
 * Authentication failure returns a vague error message intentionally:
 * "That agent name and PIN do not match." This avoids revealing whether
 * a specific agent name exists in the system.
 *
 * Routes:
 *   GET  /portal/login  → create()   (render login form)
 *   POST /portal/login  → store()    (authenticate)
 *   POST /portal/logout → destroy()  (sign out)
 */
class AgentAuthController extends Controller
{
    /**
     * Show the login form, or redirect if already signed in.
     *
     * The login page receives the seeded agent roster so it can render
     * a name-picker. This removes the "guess the username" friction
     * during a live demo — the PIN is still the security gate.
     */
    public function create(AgentSession $agentSession): Response|RedirectResponse
    {
        if ($agentSession->isAuthenticated()) {
            return redirect()->route('portal.entry');
        }

        return Inertia::render('portal/login', [
            'agentNames' => Agent::orderBy('name')->pluck('name')->all(),
        ]);
    }

    /**
     * Authenticate an agent with name + PIN.
     *
     * Flow:
     * 1. Find the agent by name (case-sensitive, exact match).
     * 2. Verify the PIN against the bcrypt hash.
     * 3. On success: store agent_id in the session, redirect to entry form.
     * 4. On failure: throw a ValidationException with a vague message.
     *
     * The vague error message is a security measure — it prevents an
     * attacker from enumerating valid agent names by observing which
     * error message appears for each attempt.
     */
    public function store(AgentLoginRequest $request, AgentSession $agentSession): RedirectResponse
    {
        $name = $request->string('name')->value();
        $agent = Agent::where('name', $name)->first();

        if (! $agent instanceof Agent || ! Hash::check($request->string('pin')->value(), $agent->pin)) {
            Log::warning('Agent sign-in failed.', ['name' => $name]);

            throw ValidationException::withMessages([
                // Vague on purpose: must not reveal which names exist.
                'pin' => 'That agent name and PIN do not match.',
            ]);
        }

        $agentSession->login($agent);

        return redirect()->route('portal.entry');
    }

    /**
     * Sign out the current agent and redirect to the login screen.
     *
     * AgentSession::logout() clears the session key and regenerates
     * the session ID to prevent replay attacks.
     */
    public function destroy(AgentSession $agentSession): RedirectResponse
    {
        $agentSession->logout();

        return redirect()->route('portal.login');
    }
}
