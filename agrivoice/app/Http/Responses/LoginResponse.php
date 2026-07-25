<?php

namespace App\Http\Responses;

use App\Models\CooperativeAdmin;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Laravel\Fortify\Fortify;
use Symfony\Component\HttpFoundation\Response;

class LoginResponse implements LoginResponseContract
{
    public function toResponse($request): Response
    {
        /** @var User|null $user */
        $user = $request->user();

        $home = ($user instanceof User
            && CooperativeAdmin::query()->where('user_id', $user->id)->exists())
            ? route('cooperative.dashboard')
            : (config('fortify.home') ?: '/dashboard');

        return $request->wantsJson()
            ? new JsonResponse('', 204)
            : redirect()->intended(Fortify::redirects('login', $home));
    }
}
