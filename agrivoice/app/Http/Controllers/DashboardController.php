<?php

namespace App\Http\Controllers;

use App\Enums\Crop;
use App\Enums\MarketSlug;
use App\Http\Requests\DashboardFilterRequest;
use App\Http\Resources\PriceSnapshotResource;
use App\Models\Market;
use App\Services\SnapshotService;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Renders the main dashboard — the projector-facing view.
 *
 * Always scoped to one market location (defaults to Adama) and the first
 * six crops. The front-end polls every 2.5s via usePoll() against the
 * current `?market=` URL so the selection survives poll ticks.
 */
class DashboardController extends Controller
{
    public function __construct(private SnapshotService $snapshotService) {}

    /**
     * Build location-scoped snapshots and render the dashboard.
     */
    public function __invoke(DashboardFilterRequest $request): Response
    {
        $selectedMarket = $request->market() ?? MarketSlug::Adama;
        $dashboardCrops = Crop::dashboardValues();

        $snapshots = collect($this->snapshotService->all())
            ->filter(fn (array $snapshot): bool => in_array($snapshot['crop'], $dashboardCrops, true))
            ->map(fn (array $snapshot) => (new PriceSnapshotResource($snapshot))->resolve())
            ->values()
            ->all();

        return Inertia::render('dashboard', [
            'snapshots' => $snapshots,
            // Markets change rarely — short cache cuts repeated work on 2.5s polls.
            'markets' => Cache::remember('dashboard.markets.v2', 300, function () {
                return Market::query()
                    ->orderBy('name')
                    ->get()
                    ->map(fn (Market $market) => [
                        'slug' => $market->slug->value,
                        'name' => $market->name,
                        'region' => $market->region,
                        'latitude' => (float) $market->latitude,
                        'longitude' => (float) $market->longitude,
                        'catchmentRadiusKm' => $market->slug->catchmentRadiusKm(),
                    ])
                    ->values()
                    ->all();
            }),
            'submissionLocations' => $selectedMarket->submissionLocations(),
            'filters' => [
                'market' => $selectedMarket->value,
            ],
        ]);
    }
}
