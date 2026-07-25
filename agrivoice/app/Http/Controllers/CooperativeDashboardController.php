<?php

namespace App\Http\Controllers;

use App\Services\CooperativeDashboardService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CooperativeDashboardController extends CooperativeController
{
    public function __construct(private CooperativeDashboardService $dashboard) {}

    public function __invoke(Request $request): Response
    {
        $cooperative = $this->cooperative($request);

        return Inertia::render('Cooperative/Dashboard', [
            'cooperative' => $this->dashboard->cooperativePayload($cooperative),
            'prices' => $this->dashboard->prices($cooperative),
            'memberActivity' => $this->dashboard->memberActivity($cooperative),
            'trends' => Inertia::defer(fn () => $this->dashboard->trends($cooperative)),
        ]);
    }
}
