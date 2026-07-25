<?php

namespace App\Http\Middleware;

use App\Models\Cooperative;
use App\Models\CooperativeAdmin;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureCooperativeAdmin
{
    /**
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user === null) {
            abort(403);
        }

        /** @var CooperativeAdmin|null $admin */
        $admin = CooperativeAdmin::query()
            ->with('cooperative')
            ->where('user_id', $user->id)
            ->first();

        if ($admin === null || ! $admin->cooperative instanceof Cooperative) {
            abort(403);
        }

        $request->attributes->set('cooperative', $admin->cooperative);

        return $next($request);
    }
}
