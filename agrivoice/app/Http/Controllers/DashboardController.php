<?php

namespace App\Http\Controllers;

use App\Http\Resources\PriceSnapshotResource;
use App\Models\Market;
use App\Services\SnapshotService;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Renders the main dashboard — the projector-facing view.
 *
 * This is a single-action controller (InvokableController) because
 * the dashboard has exactly one route and one purpose: show all
 * crop×market price tiles.
 *
 * The Inertia render sends two props:
 * - snapshots: computed price aggregates for all 21 crop×market pairs
 * - markets: reference data for the Leaflet map markers
 *
 * The front-end polls every 2.5s via usePoll() so the dashboard
 * updates in real-time as agents submit new reports. No WebSocket
 * infrastructure is needed — Inertia's polling simply re-fetches
 * the same page props.
 */
class DashboardController extends Controller
{
    public function __construct(private SnapshotService $snapshotService) {}

    /**
     * Build all snapshots and render the dashboard page.
     *
     * SnapshotService::all() returns 21 raw arrays (7 crops × 3 markets).
     * Each is wrapped in PriceSnapshotResource to normalise the shape
     * for the front-end (camelCase keys, consistent null handling).
     *
     * Markets are sent as a flat array with coordinates for the Leaflet
     * map. They're ordered alphabetically so the map legend is stable.
     */
    public function __invoke(): Response
    {
        $snapshots = collect($this->snapshotService->all())
            ->map(fn (array $snapshot) => (new PriceSnapshotResource($snapshot))->resolve())
            ->values()
            ->all();

        return Inertia::render('dashboard', [
            'snapshots' => $snapshots,
            // Markets change rarely — short cache cuts repeated work on 2.5s polls.
            'markets' => Cache::remember('dashboard.markets', 300, function () {
                return Market::query()
                    ->orderBy('name')
                    ->get()
                    ->map(fn (Market $market) => [
                        'slug' => $market->slug->value,
                        'name' => $market->name,
                        'region' => $market->region,
                        'latitude' => (float) $market->latitude,
                        'longitude' => (float) $market->longitude,
                    ])
                    ->values()
                    ->all();
            }),
        ]);
    }
}
