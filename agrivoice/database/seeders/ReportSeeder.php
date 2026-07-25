<?php

namespace Database\Seeders;

use App\Enums\Crop;
use App\Enums\ReporterType;
use App\Models\Agent;
use App\Models\Market;
use App\Models\Report;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection as SupportCollection;

/**
 * Fills all six crop-and-market pairs with a plausible fortnight of history, so
 * the dashboard is already alive before anyone enters a price on stage.
 *
 * Every number here is derived rather than random: re-seeding produces the same
 * database, which is what makes the demo rehearsable.
 */
class ReportSeeder extends Seeder
{
    private const HISTORY_IN_DAYS = 13;

    /**
     * Opening ETB per quintal for each pair. Addis pays a premium; Jimma coffee
     * is cheaper at source.
     *
     * @var array<string, array<string, int>>
     */
    private const BASE_PRICES = [
        'teff' => ['adama' => 8_600, 'addis_ababa' => 9_400, 'jimma' => 8_900],
        'coffee' => ['adama' => 18_200, 'addis_ababa' => 19_600, 'jimma' => 16_800],
    ];

    /**
     * Deliberately uneven coverage, so confidence on the dashboard ranges from
     * well-evidenced to visibly thin instead of being uniform everywhere.
     *
     * @var array<string, array<string, int>>
     */
    private const REPORT_COUNTS = [
        'teff' => ['adama' => 14, 'addis_ababa' => 9, 'jimma' => 3],
        'coffee' => ['adama' => 2, 'addis_ababa' => 7, 'jimma' => 12],
    ];

    /**
     * Repeating per-report offsets stand in for honest disagreement between
     * reporters without needing a random number generator.
     *
     * @var list<int>
     */
    private const PRICE_OFFSETS = [0, -120, 80, -40, 160, -200, 60, 100, -80];

    /**
     * Left unflagged on purpose: flagging one of these live is how the
     * anti-poisoning story gets told.
     *
     * @var list<array{crop: string, market: string, price: int}>
     */
    private const OUTLIERS = [
        ['crop' => 'teff', 'market' => 'adama', 'price' => 1_450],
        ['crop' => 'coffee', 'market' => 'addis_ababa', 'price' => 41_000],
    ];

    public function run(): void
    {
        $this->callOnce([AgentSeeder::class, MarketSeeder::class]);

        $agents = Agent::query()->orderBy('id')->get();
        $marketIds = Market::query()->pluck('id', 'slug');

        if ($agents->isEmpty() || $marketIds->isEmpty()) {
            return;
        }

        $reportIndex = 0;

        foreach (self::BASE_PRICES as $crop => $basePriceByMarket) {
            foreach ($basePriceByMarket as $marketSlug => $basePrice) {
                $count = self::REPORT_COUNTS[$crop][$marketSlug];

                for ($index = 0; $index < $count; $index++) {
                    $daysAgo = $this->daysAgoFor($index, $count);
                    $reporterType = $index % 3 === 0 ? ReporterType::Official : ReporterType::Crowd;

                    Report::query()->create([
                        'crop' => $crop,
                        'market_id' => $marketIds[$marketSlug],
                        'price' => $this->priceFor($crop, $basePrice, $index, $daysAgo),
                        'reporter_type' => $reporterType,
                        'source' => $this->sourceFor($crop, $reporterType),
                        'agent_id' => $this->agentFor($agents, $reportIndex++)->id,
                        'reported_at' => now()->subDays($daysAgo),
                        'is_flagged' => false,
                    ]);
                }
            }
        }

        $this->seedOutliers($agents, $marketIds);
    }

    /**
     * Spreads a market's reports across the fortnight, oldest first.
     */
    private function daysAgoFor(int $index, int $count): int
    {
        if ($count <= 1) {
            return 0;
        }

        return self::HISTORY_IN_DAYS - intdiv($index * self::HISTORY_IN_DAYS, $count - 1);
    }

    /**
     * A gentle climb across the fortnight, so the trend engine has a real
     * movement to find, plus per-reporter disagreement around it.
     */
    private function priceFor(string $crop, int $basePrice, int $index, int $daysAgo): float
    {
        $daysElapsed = self::HISTORY_IN_DAYS - $daysAgo;
        $drift = $basePrice * 0.004 * $daysElapsed;

        // Coffee trades an order of magnitude higher, so its spread is wider.
        $spread = $crop === Crop::Coffee->value ? 3 : 1;
        $variation = self::PRICE_OFFSETS[$index % count(self::PRICE_OFFSETS)] * $spread;

        return round($basePrice + $drift + $variation, 2);
    }

    private function sourceFor(string $crop, ReporterType $reporterType): string
    {
        if ($reporterType === ReporterType::Crowd) {
            return 'farmer';
        }

        return $crop === Crop::Coffee->value ? 'ecx' : 'wfp';
    }

    /**
     * @param  Collection<int, Agent>  $agents
     * @param  SupportCollection<string, int>  $marketIds
     */
    private function seedOutliers(Collection $agents, SupportCollection $marketIds): void
    {
        foreach (self::OUTLIERS as $index => $outlier) {
            Report::query()->create([
                'crop' => $outlier['crop'],
                'market_id' => $marketIds[$outlier['market']],
                'price' => $outlier['price'],
                'reporter_type' => ReporterType::Crowd,
                'source' => 'farmer',
                'agent_id' => $this->agentFor($agents, $index)->id,
                'reported_at' => now()->subHours($index + 1),
                'is_flagged' => false,
            ]);
        }
    }

    /**
     * Rotates entries across the roster so attribution varies on screen.
     *
     * @param  Collection<int, Agent>  $agents
     */
    private function agentFor(Collection $agents, int $index): Agent
    {
        return $agents[$index % $agents->count()];
    }
}
