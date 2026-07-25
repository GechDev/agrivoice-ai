<?php

namespace App\Http\Controllers;

use App\Http\Resources\PriceSnapshotResource;
use App\Models\Market;
use App\Services\SnapshotService;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(private SnapshotService $snapshotService) {}

    /**
     * Live market dashboard — 6 crop×market tiles for the projector.
     */
    public function __invoke(): Response
    {
        $snapshots = collect($this->snapshotService->all())
            ->map(fn (array $snapshot) => (new PriceSnapshotResource($snapshot))->resolve())
            ->values()
            ->all();

        return Inertia::render('dashboard', [
            'snapshots' => $snapshots,
            'markets' => Market::query()
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
                ->all(),
        ]);
    }
}
