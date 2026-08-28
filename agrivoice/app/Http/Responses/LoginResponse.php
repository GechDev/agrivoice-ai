<?php

namespace App\Http\Responses;

use App\Models\CooperativeAdmin;
use App\Models\Subscription;
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

        $home = config('fortify.home') ?: '/dashboard';

        if ($user instanceof User) {
            $admin = CooperativeAdmin::query()->where('user_id', $user->id)->first();

            if ($admin instanceof CooperativeAdmin) {
                $home = Subscription::query()->forCooperative($admin->cooperative_id)->exists()
                    ? route('cooperative.dashboard')
                    : route('cooperative.onboarding');
            }
        }

        return $request->wantsJson()
            ? new JsonResponse('', 204)
            : redirect()->intended(Fortify::redirects('login', $home));
    }
}
