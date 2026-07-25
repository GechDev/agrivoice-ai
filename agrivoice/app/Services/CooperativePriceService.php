<?php

namespace App\Services;

use App\Enums\Crop;
use App\Models\Cooperative;
use App\Models\Market;
use App\Models\Report;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Collection;

class CooperativePriceService
{
    /**
     * Regional benchmark definition:
     * - verified, unflagged reports
     * - reported during the trailing seven days
     * - same crop
     * - markets whose region exactly matches the cooperative's region
     *
     * Cooperative prices use the same quality and time filters but only include
     * reports submitted by members of the authenticated cooperative.
     *
     * @return array{
     *     cooperative: array{name: string, region: string},
     *     period: array{from: string, to: string, label: string},
     *     definition: string,
     *     regionalMarketsCount: int,
     *     rows: list<array{
     *         crop: string,
     *         cropLabel: string,
     *         market: string,
     *         currentPrice: float|null,
     *         regionalAverage: float|null,
     *         regionalMarketCount: int,
     *         comparisonPercentage: float|null,
     *         trend: 'up'|'down'|'stable'|'unavailable',
     *         trendPercentage: float|null,
     *         asOf: string|null
     *     }>
     * }
     */
    public function summary(Cooperative $cooperative): array
    {
        $currentFrom = now()->subDays(6)->startOfDay();
        $currentTo = now()->endOfDay();
        $previousFrom = now()->subDays(13)->startOfDay();
        $previousTo = now()->subDays(7)->endOfDay();
        $crops = $cooperative->defaultCropEnums();
        $cropValues = array_map(fn (Crop $crop): string => $crop->value, $crops);

        /** @var Collection<int, Market> $markets */
        $markets = Market::query()
            ->where('region', $cooperative->region)
            ->orderBy('name')
            ->get(['id', 'name']);

        if ($crops === [] || $markets->isEmpty()) {
            return $this->emptySummary($cooperative, $currentFrom->toDateString(), $currentTo->toDateString());
        }

        $marketIds = $markets->modelKeys();

        $current = Report::query()
            ->forCooperative($cooperative->id)
            ->verified()
            ->notFlagged()
            ->whereIn('crop', $cropValues)
            ->whereIn('market_id', $marketIds)
            ->whereBetween('reported_at', [$currentFrom, $currentTo])
            ->selectRaw('crop, market_id, AVG(price) as average_price, MAX(reported_at) as as_of')
            ->groupBy('crop', 'market_id')
            ->get()
            ->keyBy(fn (Report $report): string => $this->key($report->crop->value, $report->market_id));

        $previous = Report::query()
            ->forCooperative($cooperative->id)
            ->verified()
            ->notFlagged()
            ->whereIn('crop', $cropValues)
            ->whereIn('market_id', $marketIds)
            ->whereBetween('reported_at', [$previousFrom, $previousTo])
            ->selectRaw('crop, market_id, AVG(price) as average_price')
            ->groupBy('crop', 'market_id')
            ->get()
            ->keyBy(fn (Report $report): string => $this->key($report->crop->value, $report->market_id));

        $regional = Report::query()
            ->verified()
            ->notFlagged()
            ->whereIn('crop', $cropValues)
            ->whereIn('market_id', $marketIds)
            ->whereBetween('reported_at', [$currentFrom, $currentTo])
            ->selectRaw('crop, AVG(price) as average_price, COUNT(DISTINCT market_id) as markets_count, MAX(reported_at) as as_of')
            ->groupBy('crop')
            ->get()
            ->keyBy(fn (Report $report): string => $report->crop->value);

        $rows = [];
        foreach ($crops as $crop) {
            foreach ($markets as $market) {
                $key = $this->key($crop->value, $market->id);
                $currentAggregate = $current->get($key);
                $previousAggregate = $previous->get($key);
                $regionalAggregate = $regional->get($crop->value);
                $currentPrice = $this->aggregatePrice($currentAggregate);
                $previousPrice = $this->aggregatePrice($previousAggregate);
                $regionalAverage = $this->aggregatePrice($regionalAggregate);
                [$trend, $trendPercentage] = $this->trend($currentPrice, $previousPrice);

                $rows[] = [
                    'crop' => $crop->value,
                    'cropLabel' => $crop->label(),
                    'market' => $market->name,
                    'currentPrice' => $currentPrice,
                    'regionalAverage' => $regionalAverage,
                    'regionalMarketCount' => (int) ($regionalAggregate?->getAttribute('markets_count') ?? 0),
                    'comparisonPercentage' => $this->percentageChange($currentPrice, $regionalAverage),
                    'trend' => $trend,
                    'trendPercentage' => $trendPercentage,
                    'asOf' => $this->aggregateAsOf($currentAggregate)
                        ?? $this->aggregateAsOf($regionalAggregate),
                ];
            }
        }

        return [
            'cooperative' => [
                'name' => $cooperative->name,
                'region' => $cooperative->region,
            ],
            'period' => [
                'from' => $currentFrom->toDateString(),
                'to' => $currentTo->toDateString(),
                'label' => 'Trailing 7 days',
            ],
            'definition' => 'Regional average uses verified, unflagged reports from the trailing 7 days for the same crop across eligible markets in '.$cooperative->region.'. Each row shows how many of those markets contributed reports.',
            'regionalMarketsCount' => $markets->count(),
            'rows' => $rows,
        ];
    }

    /**
     * @return array{
     *     cooperative: array{name: string, region: string},
     *     period: array{from: string, to: string, label: string},
     *     definition: string,
     *     regionalMarketsCount: int,
     *     rows: array{}
     * }
     */
    private function emptySummary(Cooperative $cooperative, string $from, string $to): array
    {
        return [
            'cooperative' => ['name' => $cooperative->name, 'region' => $cooperative->region],
            'period' => ['from' => $from, 'to' => $to, 'label' => 'Trailing 7 days'],
            'definition' => 'Regional average uses verified, unflagged reports from the trailing 7 days for the same crop across eligible markets in '.$cooperative->region.'. Each row shows how many of those markets contributed reports.',
            'regionalMarketsCount' => 0,
            'rows' => [],
        ];
    }

    private function aggregatePrice(?Report $aggregate): ?float
    {
        $value = $aggregate?->getAttribute('average_price');

        return $value !== null ? round((float) $value, 2) : null;
    }

    private function aggregateAsOf(?Report $aggregate): ?string
    {
        $value = $aggregate?->getAttribute('as_of');

        if ($value instanceof DateTimeInterface) {
            return $value->format(DateTimeInterface::ATOM);
        }

        return is_string($value) ? $value : null;
    }

    /**
     * @return array{0: 'up'|'down'|'stable'|'unavailable', 1: float|null}
     */
    private function trend(?float $current, ?float $previous): array
    {
        $percentage = $this->percentageChange($current, $previous);

        if ($percentage === null) {
            return ['unavailable', null];
        }

        if (abs($percentage) < 1) {
            return ['stable', $percentage];
        }

        return [$percentage > 0 ? 'up' : 'down', $percentage];
    }

    private function percentageChange(?float $value, ?float $baseline): ?float
    {
        if ($value === null || $baseline === null || $baseline === 0.0) {
            return null;
        }

        return round((($value - $baseline) / $baseline) * 100, 1);
    }

    private function key(string $crop, int $marketId): string
    {
        return $crop.'|'.$marketId;
    }
}
