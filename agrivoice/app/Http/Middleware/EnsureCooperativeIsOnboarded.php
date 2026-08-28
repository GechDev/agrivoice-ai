<?php

namespace App\Http\Middleware;

use App\Models\Cooperative;
use App\Models\Subscription;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureCooperativeIsOnboarded
{
    /** @param  Closure(Request): (Response)  $next */
    public function handle(Request $request, Closure $next): Response
    {
        $cooperative = $request->attributes->get('cooperative');

        if (! $cooperative instanceof Cooperative) {
            abort(403);
        }

        if (! Subscription::query()->forCooperative($cooperative->id)->exists()) {
            return redirect()->route('cooperative.onboarding');
        }

        return $next($request);
    }
}
