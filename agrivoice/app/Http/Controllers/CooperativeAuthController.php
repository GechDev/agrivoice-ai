<?php

namespace App\Http\Controllers;

use App\Actions\RegisterCooperative;
use App\Http\Requests\CooperativeLoginRequest;
use App\Http\Requests\CooperativeRegisterRequest;
use App\Models\CooperativeAdmin;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class CooperativeAuthController extends Controller
{
    public function createLogin(): Response
    {
        return Inertia::render('Cooperative/auth/login');
    }

    public function login(CooperativeLoginRequest $request): RedirectResponse
    {
        $credentials = $request->only('email', 'password');
        $remember = $request->boolean('remember');

        if (! Auth::attempt($credentials, $remember)) {
            throw ValidationException::withMessages([
                'email' => __('These credentials do not match our records.'),
            ]);
        }

        $request->session()->regenerate();

        /** @var User $user */
        $user = $request->user();

        if (! CooperativeAdmin::query()->where('user_id', $user->id)->exists()) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            throw ValidationException::withMessages([
                'email' => 'This account is not a cooperative admin. Use the farmer login instead.',
            ]);
        }

        return redirect()->intended(route('cooperative.dashboard'));
    }

    public function createRegister(): Response
    {
        return Inertia::render('Cooperative/auth/register', [
            'passwordRules' => Password::defaults()->toPasswordRulesString(),
        ]);
    }

    public function register(
        CooperativeRegisterRequest $request,
        RegisterCooperative $registerCooperative,
    ): RedirectResponse {
        $user = $registerCooperative->handle($request->validated());

        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->route('cooperative.dashboard');
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('cooperative.login');
    }
}
