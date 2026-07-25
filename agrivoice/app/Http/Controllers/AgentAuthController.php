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
 * Light sign-in for data-entry agents: a name and a PIN, nothing else.
 *
 * Its only job is attribution — knowing which agent entered a price is what
 * makes the reported data credible on screen.
 */
class AgentAuthController extends Controller
{
    public function create(AgentSession $agentSession): Response|RedirectResponse
    {
        if ($agentSession->isAuthenticated()) {
            return redirect()->route('portal.entry');
        }

        return Inertia::render('portal/login', [
            // The roster is fixed and seeded, so offering the names removes the
            // likeliest mistake during a live demo. The PIN still gates entry.
            'agentNames' => Agent::orderBy('name')->pluck('name')->all(),
        ]);
    }

    public function store(AgentLoginRequest $request, AgentSession $agentSession): RedirectResponse
    {
        $name = $request->string('name')->value();
        $agent = Agent::where('name', $name)->first();

        if (! $agent instanceof Agent || ! Hash::check($request->string('pin')->value(), $agent->pin)) {
            Log::warning('Agent sign-in failed.', ['name' => $name]);

            throw ValidationException::withMessages([
                // Vague on purpose: it must not reveal which names exist.
                'pin' => 'That agent name and PIN do not match.',
            ]);
        }

        $agentSession->login($agent);

        return redirect()->route('portal.entry');
    }

    public function destroy(AgentSession $agentSession): RedirectResponse
    {
        $agentSession->logout();

        return redirect()->route('portal.login');
    }
}
