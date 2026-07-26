<?php

namespace App\Http\Controllers;

use App\Enums\Crop;
use App\Http\Requests\PriceIndexRequest;
use App\Http\Resources\PriceSnapshotResource;
use App\Models\Market;
use App\Models\Report;
use App\Services\SnapshotService;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class PriceController extends Controller
{
    public function __construct(private SnapshotService $snapshotService) {}

    public function index(PriceIndexRequest $request): Response
    {
        $filters = array_merge([
            'crop' => null,
            'market' => null,
            'trend' => null,
            'sort' => 'crop',
            'direction' => 'asc',
            'chart_crop' => null,
            'chart_market' => null,
        ], $request->validated());

        $rows = collect($this->snapshotService->all())
            ->map(fn (array $snapshot): array => (new PriceSnapshotResource($snapshot))->resolve())
            ->when($filters['crop'], fn (Collection $rows, string $crop): Collection => $rows->where('crop', $crop))
            ->when($filters['market'], fn (Collection $rows, string $market): Collection => $rows->where('market', $market))
            ->when($filters['trend'], fn (Collection $rows, string $trend): Collection => $rows->where('trend', $trend));

        $sortKey = match ($filters['sort']) {
            'market' => 'market',
            'price' => 'price',
            'change' => 'changePercent',
            'confidence' => 'confidence',
            'updated' => 'lastUpdated',
            default => 'crop',
        };

        $rows = $rows
            ->sortBy($sortKey, SORT_REGULAR, $filters['direction'] === 'desc')
            ->values();

        $selected = $rows->first(function (array $row) use ($filters): bool {
            return $row['crop'] === $filters['chart_crop']
                && $row['market'] === $filters['chart_market'];
        }) ?? $rows->first(fn (array $row): bool => $row['reportCount'] > 0)
            ?? $rows->first();

        return Inertia::render('prices', [
            'rows' => $rows->all(),
            'markets' => Market::query()
                ->orderBy('name')
                ->get()
                ->map(fn (Market $market): array => [
                    'slug' => $market->slug->value,
                    'name' => $market->name,
                ])
                ->values()
                ->all(),
            'filters' => $filters,
            'selected' => $selected === null ? null : [
                'crop' => $selected['crop'],
                'market' => $selected['market'],
            ],
            'history' => $selected === null
                ? []
                : $this->historyFor($selected['crop'], $selected['market']),
        ]);
    }

    /**
     * @return list<array{date: string, price: float}>
     */
    private function historyFor(string $crop, string $marketSlug): array
    {
        $market = Market::query()->where('slug', $marketSlug)->first();

        if (! $market instanceof Market) {
            return [];
        }

        return Report::query()
            ->verified()
            ->notFlagged()
            ->forCropMarket(Crop::from($crop), $market->id)
            ->orderBy('reported_at')
            ->get(['price', 'reported_at'])
            ->groupBy(fn (Report $report): string => $report->reported_at->toDateString())
            ->map(fn (Collection $reports, string $date): array => [
                'date' => $date,
                'price' => round((float) $reports->avg(fn (Report $report): float => (float) $report->price), 2),
            ])
            ->values()
            ->all();
    }
}
