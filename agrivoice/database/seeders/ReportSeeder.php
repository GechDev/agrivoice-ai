<?php

namespace Database\Seeders;

use App\Enums\Crop;
use App\Enums\ReporterType;
use App\Enums\ReportStatus;
use App\Models\Agent;
use App\Models\Market;
use App\Models\Report;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection as SupportCollection;

/**
 * Generates a deterministic 13-day price history for all crop×market pairs.
 *
 * This is the most complex seeder in the system. Its purpose is to make
 * the dashboard look alive from the first page load — no manual data
 * entry required during a demo.
 *
 * DESIGN PRINCIPLES:
 * 1. DETERMINISTIC: Every number is derived from a formula, not random().
 *    Re-seeding always produces the same database. This makes the demo
 *    rehearseable — the same trends appear every time.
 *
 * 2. UNEVEN COVERAGE: Different crop×market pairs have different report
 *    counts (2 to 14). This makes the confidence score vary visibly
 *    across tiles — some are "well-evidenced" (high confidence), others
 *    are "thin" (low confidence). Uniform coverage would make confidence
 *    meaningless.
 *
 * 3. GENTLE UPWARD DRIFT: Prices climb ~0.4% per day across the fortnight.
 *    This ensures the trend engine (PredictionService) computes a
 *    meaningful "Up" trend for most pairs. The drift is small enough
 *    to feel realistic but large enough to exceed the 2% threshold
 *    over 7 days.
 *
 * 4. PER-REPORTER DISAGREEMENT: A repeating offset pattern simulates
 *    honest disagreement between reporters. Higher-value crops (coffee,
 *    sesame) get 3× the spread, making them noisier.
 *
 * 5. DELIBERATE OUTLIERS: Two obviously wrong prices (ETB 1,450 for teff,
 *    ETB 41,000 for coffee) are left unflagged. During the demo, the
 *    presenter flags one of these to show the anti-poisoning story.
 */
class ReportSeeder extends Seeder
{
    /** Number of days of history to generate. */
    private const HISTORY_IN_DAYS = 13;

    /**
     * Base ETB/quintal price for each crop×market pair.
     *
     * Addis Ababa consistently pays a premium (higher transport costs,
     * larger consumer market). Jimma prices are lower at source.
     * These are plausible but fictional prices for the showcase.
     *
     * @var array<string, array<string, int>>
     */
    private const BASE_PRICES = [
        'teff' => ['adama' => 8_600, 'addis_ababa' => 9_400, 'jimma' => 8_900],
        'coffee' => ['adama' => 18_200, 'addis_ababa' => 19_600, 'jimma' => 16_800],
        'maize' => ['adama' => 3_800, 'addis_ababa' => 4_200, 'jimma' => 3_600],
        'wheat' => ['adama' => 4_900, 'addis_ababa' => 5_400, 'jimma' => 4_700],
        'sesame' => ['adama' => 13_200, 'addis_ababa' => 14_500, 'jimma' => 12_800],
        'pulses' => ['adama' => 5_600, 'addis_ababa' => 6_100, 'jimma' => 5_400],
        'sorghum' => ['adama' => 3_400, 'addis_ababa' => 3_800, 'jimma' => 3_200],
    ];

    /**
     * Number of reports per crop×market pair across the 13-day window.
     *
     * Ranges from 2 (coffee/adama) to 14 (teff/adama). This deliberate
     * variation makes the confidence score visually distinct on the
     * dashboard — tiles with 2 reports show low confidence, tiles with
     * 14 show high confidence.
     *
     * @var array<string, array<string, int>>
     */
    private const REPORT_COUNTS = [
        'teff' => ['adama' => 14, 'addis_ababa' => 9, 'jimma' => 3],
        'coffee' => ['adama' => 2, 'addis_ababa' => 7, 'jimma' => 12],
        'maize' => ['adama' => 8, 'addis_ababa' => 5, 'jimma' => 4],
        'wheat' => ['adama' => 6, 'addis_ababa' => 7, 'jimma' => 3],
        'sesame' => ['adama' => 3, 'addis_ababa' => 5, 'jimma' => 8],
        'pulses' => ['adama' => 5, 'addis_ababa' => 4, 'jimma' => 3],
        'sorghum' => ['adama' => 7, 'addis_ababa' => 3, 'jimma' => 5],
    ];

    /**
     * Repeating price offsets (ETB) that simulate reporter disagreement.
     *
     * Applied cyclically across reports: report 0 gets +0, report 1 gets
     * -120, report 2 gets +80, etc. Higher-value crops (coffee, sesame)
     * multiply these by 3 to reflect wider market spreads.
     *
     * @var list<int>
     */
    private const PRICE_OFFSETS = [0, -120, 80, -40, 160, -200, 60, 100, -80];

    /**
     * Deliberately wrong prices left unflagged for the demo.
     *
     * - Teff at ETB 1,450 (normal: ~8,600–9,400) — obviously too low
     * - Coffee at ETB 41,000 (normal: ~16,800–19,600) — obviously too high
     *
     * The presenter flags one of these during the demo to show how
     * the anti-poisoning story works: flag → dashboard recalculates
     * → the outlier disappears from the aggregate.
     *
     * @var list<array{crop: string, market: string, price: int}>
     */
    private const OUTLIERS = [
        ['crop' => 'teff', 'market' => 'adama', 'price' => 1_450],
        ['crop' => 'coffee', 'market' => 'addis_ababa', 'price' => 41_000],
    ];

    public function run(): void
    {
        // Seed agents and markets first — reports reference both by FK.
        $this->call([AgentSeeder::class, MarketSeeder::class]);

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
                    // Every 3rd report is official; the rest are crowd.
                    // This gives a ~33% official / 67% crowd mix.
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
                        'status' => ReportStatus::Verified,
                    ]);
                }
            }
        }

        $this->seedOutliers($agents, $marketIds);
    }

    /**
     * Spread reports evenly across the 13-day window.
     *
     * The oldest report is day 0 (13 days ago), the newest is day 13 (today).
     * Reports are distributed so the first report is at the start and the
     * last is at the end, with even spacing in between.
     */
    private function daysAgoFor(int $index, int $count): int
    {
        if ($count <= 1) {
            return 0;
        }

        return self::HISTORY_IN_DAYS - intdiv($index * self::HISTORY_IN_DAYS, $count - 1);
    }

    /**
     * Compute a price with gentle upward drift and reporter disagreement.
     *
     * The formula:  basePrice + drift + variation
     *
     * drift = basePrice × 0.004 × daysElapsed
     *   → ~0.4% per day → ~5.2% over 13 days
     *   → exceeds the 2% PredictionService threshold after ~5 days
     *
     * variation = PRICE_OFFSETS[index % 9] × spreadMultiplier
     *   → simulates honest disagreement between reporters
     *   → coffee/sesame get 3× spread (wider market variance)
     */
    private function priceFor(string $crop, int $basePrice, int $index, int $daysAgo): float
    {
        $daysElapsed = self::HISTORY_IN_DAYS - $daysAgo;
        $drift = $basePrice * 0.004 * $daysElapsed;

        // Higher-value crops trade with a wider spread between reporters.
        $spread = in_array($crop, [Crop::Coffee->value, Crop::Sesame->value], true) ? 3 : 1;
        $variation = self::PRICE_OFFSETS[$index % count(self::PRICE_OFFSETS)] * $spread;

        return round($basePrice + $drift + $variation, 2);
    }

    /**
     * Map reporter type to a plausible data source string.
     *
     * Official sources are labelled "wfp" (World Food Programme) or
     * "ecx" (Ethiopian Commodity Exchange) depending on the crop.
     * Crowd sources are labelled "farmer".
     */
    private function sourceFor(string $crop, ReporterType $reporterType): string
    {
        if ($reporterType === ReporterType::Crowd) {
            return 'farmer';
        }

        return in_array($crop, [Crop::Coffee->value, Crop::Sesame->value], true) ? 'ecx' : 'wfp';
    }

    /**
     * Insert the two deliberately wrong outlier reports.
     *
     * These are recent (within the last 2 hours) so they're visible
     * on the dashboard and can be flagged during the demo.
     *
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
                'status' => ReportStatus::Verified,
            ]);
        }
    }

    /**
     * Rotate agents so attribution varies across the report list.
     *
     * @param  Collection<int, Agent>  $agents
     */
    private function agentFor(Collection $agents, int $index): Agent
    {
        return $agents[$index % $agents->count()];
    }
}
