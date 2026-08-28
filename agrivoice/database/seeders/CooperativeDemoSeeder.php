<?php

namespace Database\Seeders;

use App\Enums\CooperativeAdminRole;
use App\Enums\Crop;
use App\Enums\InvoiceStatus;
use App\Enums\MarketSlug;
use App\Enums\PlanTier;
use App\Enums\ReporterType;
use App\Enums\SubscriptionStatus;
use App\Enums\Trend;
use App\Models\Cooperative;
use App\Models\CooperativeAdmin;
use App\Models\CooperativeMember;
use App\Models\Invoice;
use App\Models\Market;
use App\Models\MemberQuery;
use App\Models\Prediction;
use App\Models\Report;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Seeds a complete cooperative portal demo: org, owner admin, members,
 * member reports/queries, subscription, and invoices.
 *
 * Demo login (fixtures, not secrets):
 *   coop.owner@gmail.com / password
 */
class CooperativeDemoSeeder extends Seeder
{
    public const OWNER_EMAIL = 'coop.owner@gmail.com';

    public const OWNER_PASSWORD = 'password';

    /** Consecutive reported days ending today (inclusive). */
    private const HISTORY_DAYS = 21;

    /** Forecast days from today through today + N (inclusive). */
    private const FORECAST_DAYS = 20;

    public function run(): void
    {
        $this->call(CooperativeSeeder::class);

        $cooperative = Cooperative::query()
            ->where('name', 'Oromia Coffee Growers')
            ->firstOrFail();

        $owner = User::query()->updateOrCreate(
            ['email' => self::OWNER_EMAIL],
            [
                'name' => 'Cooperative Owner',
                'password' => Hash::make(self::OWNER_PASSWORD),
                'email_verified_at' => now(),
            ],
        );

        CooperativeAdmin::query()->updateOrCreate(
            ['user_id' => $owner->id],
            [
                'cooperative_id' => $cooperative->id,
                'role' => CooperativeAdminRole::Owner,
            ],
        );

        $this->seedMembersAndActivity($cooperative);
        $this->seedBilling($cooperative);
    }

    private function seedMembersAndActivity(Cooperative $cooperative): void
    {
        Report::query()->forCooperative($cooperative->id)->delete();
        CooperativeMember::query()->forCooperative($cooperative->id)->delete();
        Prediction::query()
            ->where(function ($query): void {
                $query->whereDate('predicted_for', '<', now()->toDateString())
                    ->orWhereDate(
                        'predicted_for',
                        '>',
                        now()->addDays(self::FORECAST_DAYS)->toDateString(),
                    );
            })
            ->delete();

        $markets = Market::query()->get()->keyBy(
            fn (Market $market): string => $market->slug->value,
        );

        if ($markets->count() < 3) {
            return;
        }

        $activeMembers = CooperativeMember::factory()
            ->count(24)
            ->active()
            ->recycle($cooperative)
            ->create();

        CooperativeMember::factory()
            ->count(8)
            ->invited()
            ->recycle($cooperative)
            ->create();

        CooperativeMember::factory()
            ->count(2)
            ->removed()
            ->recycle($cooperative)
            ->create();

        $cropSeries = [
            [
                'crop' => Crop::Coffee,
                'market' => MarketSlug::Jimma,
                'basePrice' => 15_900,
            ],
            [
                'crop' => Crop::Teff,
                'market' => MarketSlug::Adama,
                'basePrice' => 8_100,
            ],
            [
                'crop' => Crop::Maize,
                'market' => MarketSlug::Adama,
                'basePrice' => 4_900,
            ],
            [
                'crop' => Crop::Wheat,
                'market' => MarketSlug::AddisAbaba,
                'basePrice' => 6_700,
            ],
        ];

        foreach ($cropSeries as $cropIndex => $series) {
            /** @var Market $market */
            $market = $markets->get($series['market']->value);
            $todayPrices = [];

            foreach (range(self::HISTORY_DAYS - 1, 0) as $daysAgo) {
                $dayIndex = self::HISTORY_DAYS - 1 - $daysAgo;
                $dailyPrice = $this->smoothDemoPrice(
                    $series['basePrice'],
                    $dayIndex,
                    $cropIndex,
                );

                foreach (range(0, 1) as $reportIndex) {
                    /** @var CooperativeMember $member */
                    $member = $activeMembers[
                        ($dayIndex + $reportIndex + $cropIndex * 3) % $activeMembers->count()
                    ];
                    $variation = ($reportIndex === 0 ? -6 : 6) + (($dayIndex + $cropIndex) % 3 - 1) * 4;
                    $price = max(1_000, $dailyPrice + $variation);

                    if ($daysAgo === 0) {
                        $todayPrices[] = $price;
                    }

                    Report::factory()->fromMember($member)->verified()->create([
                        'crop' => $series['crop'],
                        'market_id' => $market->id,
                        'price' => $price,
                        'reporter_type' => ReporterType::Crowd,
                        'reported_at' => now()
                            ->subDays($daysAgo)
                            ->setTime(8 + $reportIndex * 5, ($dayIndex * 7) % 60),
                        'is_flagged' => false,
                    ]);
                }
            }

            $todayActual = (int) round(array_sum($todayPrices) / max(1, count($todayPrices)));
            $forecastGap = 20 + (($cropIndex * 11) % 31);
            $forecastSign = $cropIndex % 2 === 0 ? 1 : -1;
            $firstFuturePrice = $todayActual + ($forecastSign * $forecastGap);
            $firstFutureBaseline = $this->smoothDemoPrice(
                $series['basePrice'],
                self::HISTORY_DAYS,
                $cropIndex,
            );
            $forecastAdjustment = $firstFuturePrice - $firstFutureBaseline;

            foreach (range(0, self::FORECAST_DAYS) as $daysAhead) {
                $dayIndex = (self::HISTORY_DAYS - 1) + $daysAhead;
                $forecastPrice = $daysAhead === 0
                    ? $todayActual
                    : $this->smoothDemoPrice(
                        $series['basePrice'],
                        $dayIndex,
                        $cropIndex,
                    ) + $forecastAdjustment;

                Prediction::query()->updateOrCreate(
                    [
                        'crop' => $series['crop'],
                        'market_id' => $market->id,
                        'predicted_for' => now()->addDays($daysAhead)->toDateString(),
                    ],
                    [
                        'predicted_price' => max(1_000, $forecastPrice),
                        'trend' => $this->trendFromDelta($forecastPrice - $todayActual),
                        'confidence_score' => max(62, 91 - $daysAhead),
                        'generated_at' => now()->subHour(),
                    ],
                );
            }
        }

        foreach ($activeMembers as $memberIndex => $member) {
            foreach (range(0, 11) as $queryIndex) {
                $series = $cropSeries[($memberIndex + $queryIndex) % count($cropSeries)];
                /** @var Market $market */
                $market = $markets->get($series['market']->value);

                MemberQuery::factory()->create([
                    'cooperative_member_id' => $member->id,
                    'crop' => $series['crop'],
                    'market_id' => $market->id,
                    'query_text' => 'What is the current '.$series['crop']->label().' price in '.$market->name.'?',
                    'channel' => $queryIndex % 4 === 0 ? 'web' : 'voice',
                    'queried_at' => now()
                        ->subDays(($memberIndex + $queryIndex * 2) % 28)
                        ->subMinutes($memberIndex * 3),
                ]);
            }
        }

        foreach ($activeMembers->take(6) as $index => $member) {
            $series = $cropSeries[$index % count($cropSeries)];
            /** @var Market $market */
            $market = $markets->get($series['market']->value);

            Report::factory()->fromMember($member)->pending()->create([
                'crop' => $series['crop'],
                'market_id' => $market->id,
                'price' => $series['basePrice'] + 350 + $index * 45,
                'reported_at' => now()->subMinutes(10 + $index * 12),
                'is_flagged' => false,
            ]);
        }
    }

    private function seedBilling(Cooperative $cooperative): void
    {
        Subscription::query()->updateOrCreate(
            ['cooperative_id' => $cooperative->id],
            [
                'plan_tier' => PlanTier::Growth,
                'price_per_month' => PlanTier::Growth->monthlyPrice(),
                'member_limit' => PlanTier::Growth->memberLimit(),
                'status' => SubscriptionStatus::Active,
                'current_period_end' => now()->addMonth()->toDateString(),
                'payment_method_type' => 'Telebirr',
                'payment_method_last_four' => '2048',
            ],
        );

        if (Invoice::query()->forCooperative($cooperative->id)->exists()) {
            return;
        }

        foreach (range(1, 6) as $month) {
            Invoice::factory()->create([
                'cooperative_id' => $cooperative->id,
                'amount' => PlanTier::Growth->monthlyPrice(),
                'status' => $month === 1 ? InvoiceStatus::Due : InvoiceStatus::Paid,
                'issued_at' => now()->subMonths($month - 1)->startOfMonth(),
            ]);
        }
    }

    /**
     * Smooth absolute price path (gentle waves + tiny noise) so charts look natural.
     */
    private function smoothDemoPrice(int $basePrice, int $dayIndex, int $seriesIndex): int
    {
        $wave = sin(($dayIndex * 0.43) + ($seriesIndex * 1.15)) * ($basePrice * 0.055);
        $slowWave = sin(($dayIndex * 0.16) + ($seriesIndex * 0.55)) * ($basePrice * 0.035);
        $noise = ((($dayIndex * 7) + ($seriesIndex * 13)) % 5 - 2) * ($basePrice * 0.003);

        return max(1_000, (int) round($basePrice + $wave + $slowWave + $noise));
    }

    private function trendFromDelta(int $delta): Trend
    {
        if ($delta >= 80) {
            return Trend::Up;
        }

        if ($delta <= -80) {
            return Trend::Down;
        }

        return Trend::Stable;
    }
}
