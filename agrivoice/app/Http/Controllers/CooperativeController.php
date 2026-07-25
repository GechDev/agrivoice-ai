<?php

namespace App\Http\Controllers;

use App\Models\Cooperative;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;

abstract class CooperativeController extends Controller
{
    use AuthorizesRequests;

    /**
     * Cooperative resolved by EnsureCooperativeAdmin — never from the client.
     */
    protected function cooperative(Request $request): Cooperative
    {
        $cooperative = $request->attributes->get('cooperative');

        if (! $cooperative instanceof Cooperative) {
            abort(403);
        }

        return $cooperative;
    }
}
