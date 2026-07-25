<?php

namespace Database\Seeders;

use App\Enums\CooperativeAdminRole;
use App\Enums\CooperativeMemberStatus;
use App\Enums\Crop;
use App\Enums\InvoiceStatus;
use App\Enums\MarketSlug;
use App\Enums\PlanTier;
use App\Enums\ReporterType;
use App\Enums\SubscriptionStatus;
use App\Models\Cooperative;
use App\Models\CooperativeAdmin;
use App\Models\CooperativeMember;
use App\Models\Invoice;
use App\Models\Market;
use App\Models\MemberQuery;
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
        if (CooperativeMember::query()->forCooperative($cooperative->id)->exists()) {
            return;
        }

        $markets = Market::query()->get();
        $jimma = $markets->first(
            fn (Market $market): bool => $market->slug === MarketSlug::Jimma,
        ) ?? $markets->first();
        $adama = $markets->first(
            fn (Market $market): bool => $market->slug === MarketSlug::Adama,
        ) ?? $markets->first();

        if ($jimma === null || $adama === null) {
            return;
        }

        $activeMembers = CooperativeMember::factory()
            ->count(5)
            ->active()
            ->recycle($cooperative)
            ->create();

        CooperativeMember::factory()
            ->count(3)
            ->invited()
            ->recycle($cooperative)
            ->create();

        CooperativeMember::factory()
            ->removed()
            ->recycle($cooperative)
            ->create([
                'status' => CooperativeMemberStatus::Removed,
            ]);

        foreach ($activeMembers as $index => $member) {
            Report::factory()->fromMember($member)->verified()->create([
                'crop' => Crop::Coffee,
                'market_id' => $jimma->id,
                'price' => 16_800 + ($index * 120),
                'reporter_type' => ReporterType::Crowd,
                'reported_at' => now()->subHours(4 + $index),
                'is_flagged' => false,
            ]);

            Report::factory()->fromMember($member)->verified()->create([
                'crop' => Crop::Teff,
                'market_id' => $adama->id,
                'price' => 8_600 + ($index * 80),
                'reporter_type' => ReporterType::Crowd,
                'reported_at' => now()->startOfWeek()->subDays(2)->setTime(10, $index),
                'is_flagged' => false,
            ]);

            MemberQuery::factory()->create([
                'cooperative_member_id' => $member->id,
                'crop' => Crop::Coffee,
                'market_id' => $jimma->id,
                'queried_at' => now()->subDays($index + 1),
            ]);
        }

        /** @var CooperativeMember $moderationMember */
        $moderationMember = $activeMembers->first();

        Report::factory()->fromMember($moderationMember)->pending()->create([
            'crop' => Crop::Coffee,
            'market_id' => $jimma->id,
            'price' => 17_250,
            'reported_at' => now()->subMinutes(45),
            'is_flagged' => false,
        ]);

        Report::factory()->fromMember($moderationMember)->pending()->create([
            'crop' => Crop::Teff,
            'market_id' => $adama->id,
            'price' => 1_200,
            'reported_at' => now()->subMinutes(20),
            'is_flagged' => false,
        ]);
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
}
