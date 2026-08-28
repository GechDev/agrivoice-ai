<?php

use App\Enums\Crop;
use App\Enums\ReporterType;
use App\Enums\ReportStatus;
use App\Enums\Trend;
use App\Models\Cooperative;
use App\Models\CooperativeAdmin;
use App\Models\CooperativeMember;
use App\Models\Market;
use App\Models\MemberQuery;
use App\Models\Prediction;
use App\Models\Report;
use App\Models\Subscription;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->withoutVite();
});

test('guests are redirected away from the cooperative dashboard', function () {
    $this->get(route('cooperative.dashboard'))
        ->assertRedirect(route('login'));
});

test('authenticated users without a cooperative admin record receive 403', function () {
    $this->actingAs(User::factory()->create());

    $this->get(route('cooperative.dashboard'))
        ->assertForbidden();
});

test('cooperative admins receive the dashboard with immediate props and deferred trends', function () {
    $market = Market::factory()->adama()->create();
    $unreportedMarket = Market::factory()->addisAbaba()->create();
    $cooperative = Cooperative::factory()->teffOnly()->create([
        'name' => 'Alpha Cooperative',
        'region' => 'Oromia',
    ]);
    $admin = User::factory()->create();
    CooperativeAdmin::factory()->owner()->create([
        'cooperative_id' => $cooperative->id,
        'user_id' => $admin->id,
    ]);
    Subscription::factory()->create([
        'cooperative_id' => $cooperative->id,
    ]);

    $member = CooperativeMember::factory()->active()->create([
        'cooperative_id' => $cooperative->id,
        'created_at' => now()->subDays(30),
    ]);

    Report::factory()->fromMember($member)->create([
        'crop' => Crop::Teff,
        'market_id' => $market->id,
        'price' => 10_000,
        'reported_at' => now()->startOfDay()->addHour(),
        'status' => ReportStatus::Verified,
        'is_flagged' => false,
    ]);

    Report::factory()->fromMember($member)->create([
        'crop' => Crop::Teff,
        'market_id' => $market->id,
        'price' => 8_000,
        'reported_at' => now()->startOfWeek()->subDay()->setTime(12, 0),
        'status' => ReportStatus::Verified,
        'is_flagged' => false,
    ]);

    MemberQuery::factory()->create([
        'cooperative_member_id' => $member->id,
        'crop' => Crop::Teff,
        'market_id' => $market->id,
        'queried_at' => now()->subDays(2),
    ]);

    Prediction::factory()->create([
        'crop' => Crop::Teff,
        'market_id' => $market->id,
        'predicted_price' => 10_035,
        'predicted_for' => now()->toDateString(),
        'trend' => Trend::Up,
        'confidence_score' => 80,
        'generated_at' => now()->subHour(),
    ]);

    Prediction::factory()->create([
        'crop' => Crop::Teff,
        'market_id' => $unreportedMarket->id,
        'predicted_price' => 99_999,
        'predicted_for' => now()->toDateString(),
        'trend' => Trend::Up,
        'confidence_score' => 80,
        'generated_at' => now()->subHour(),
    ]);

    $this->actingAs($admin);

    $this->get(route('cooperative.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Cooperative/Dashboard')
            ->where('cooperative.id', $cooperative->id)
            ->where('cooperative.name', 'Alpha Cooperative')
            ->where('cooperative.region', 'Oromia')
            ->where('cooperative.defaultCrops', [Crop::Teff->value])
            ->has('prices', 1)
            ->where('prices.0.crop', Crop::Teff->value)
            ->where('prices.0.cropLabel', 'Teff')
            ->where('prices.0.market', 'adama')
            ->where('prices.0.marketLabel', $market->name)
            ->where('prices.0.averagePrice', 10000)
            ->where('prices.0.changePercent', 25)
            ->where('prices.0.reportCount', 1)
            ->where('memberActivity.totalMembers.value', 1)
            ->where('memberActivity.activeMembers.value', 1)
            ->where('memberActivity.totalQueries.value', 1)
            ->where('memberActivity.totalReports.value', 2)
            ->missing('trends')
            ->loadDeferredProps(fn (Assert $reload) => $reload
                ->has('trends', 1)
                ->where('trends.0.crop', Crop::Teff->value)
                ->where('trends.0.cropLabel', 'Teff')
                ->where('trends.0.points', function ($points) {
                    $points = collect($points);
                    $today = $points->firstWhere('date', now()->toDateString());
                    $pastWithForecast = $points
                        ->filter(fn ($point) => $point['date'] < now()->toDateString()
                            && $point['forecast'] !== null);

                    return $today !== null
                        && (float) $today['actual'] === 10000.0
                        && (float) $today['forecast'] === 10000.0
                        && $pastWithForecast->isEmpty();
                })
            )
        );
});

test('cooperative dashboard isolates prices activity and trends across cooperatives', function () {
    $market = Market::factory()->adama()->create();

    $coopA = Cooperative::factory()->teffOnly()->create(['name' => 'Coop A']);
    $coopB = Cooperative::factory()->teffOnly()->create(['name' => 'Coop B']);

    $adminA = User::factory()->create();
    CooperativeAdmin::factory()->owner()->create([
        'cooperative_id' => $coopA->id,
        'user_id' => $adminA->id,
    ]);
    Subscription::factory()->create([
        'cooperative_id' => $coopA->id,
    ]);

    $memberA = CooperativeMember::factory()->active()->create([
        'cooperative_id' => $coopA->id,
        'created_at' => now()->subDays(20),
    ]);
    $memberB = CooperativeMember::factory()->active()->create([
        'cooperative_id' => $coopB->id,
        'created_at' => now()->subDays(20),
    ]);

    CooperativeMember::factory()->active()->create([
        'cooperative_id' => $coopB->id,
        'created_at' => now()->subDays(20),
    ]);

    Report::factory()->fromMember($memberA)->create([
        'crop' => Crop::Teff,
        'market_id' => $market->id,
        'price' => 12_000,
        'reported_at' => now()->startOfWeek()->addHours(6),
        'status' => ReportStatus::Verified,
        'reporter_type' => ReporterType::Crowd,
    ]);

    Report::factory()->fromMember($memberB)->create([
        'crop' => Crop::Teff,
        'market_id' => $market->id,
        'price' => 99_999,
        'reported_at' => now()->startOfWeek()->addHours(6),
        'status' => ReportStatus::Verified,
        'reporter_type' => ReporterType::Crowd,
    ]);

    Report::factory()->fromMember($memberB)->create([
        'crop' => Crop::Teff,
        'market_id' => $market->id,
        'price' => 88_888,
        'reported_at' => now()->subDays(2),
        'status' => ReportStatus::Verified,
    ]);

    MemberQuery::factory()->create([
        'cooperative_member_id' => $memberB->id,
        'queried_at' => now()->subDay(),
    ]);

    Prediction::factory()->create([
        'crop' => Crop::Teff,
        'market_id' => $market->id,
        'predicted_price' => 12_500,
        'predicted_for' => now()->subDays(1)->toDateString(),
        'generated_at' => now()->subDays(2),
    ]);

    Prediction::factory()->create([
        'crop' => Crop::Teff,
        'market_id' => $market->id,
        'predicted_price' => 12_040,
        'predicted_for' => now()->toDateString(),
        'generated_at' => now()->subHour(),
    ]);

    $this->actingAs($adminA);

    $this->get(route('cooperative.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Cooperative/Dashboard')
            ->where('cooperative.id', $coopA->id)
            ->has('prices', 1)
            ->where('prices.0.averagePrice', 12000)
            ->where('prices.0.reportCount', 1)
            ->where('memberActivity.totalMembers.value', 1)
            ->where('memberActivity.activeMembers.value', 1)
            ->where('memberActivity.totalQueries.value', 0)
            ->where('memberActivity.totalReports.value', 1)
            ->loadDeferredProps(fn (Assert $reload) => $reload
                ->has('trends', 1)
                ->where('trends.0.points', function ($points) {
                    $points = collect($points);
                    $prices = $points
                        ->pluck('actual')
                        ->filter()
                        ->map(fn ($price) => (float) $price)
                        ->values();
                    $today = $points->firstWhere('date', now()->toDateString());
                    $pastWithForecast = $points
                        ->filter(fn ($point) => $point['date'] < now()->toDateString()
                            && $point['forecast'] !== null);

                    return $prices->contains(12000.0)
                        && ! $prices->contains(99999.0)
                        && ! $prices->contains(88888.0)
                        && $pastWithForecast->isEmpty()
                        && $today !== null
                        && (float) $today['forecast'] === 12040.0;
                })
            )
        );
});

test('prices omit groups when the cooperative has no verified reports in the current calendar week', function () {
    $market = Market::factory()->adama()->create();
    $cooperative = Cooperative::factory()->create();
    $admin = User::factory()->create();
    CooperativeAdmin::factory()->create([
        'cooperative_id' => $cooperative->id,
        'user_id' => $admin->id,
    ]);
    Subscription::factory()->create([
        'cooperative_id' => $cooperative->id,
    ]);
    $member = CooperativeMember::factory()->active()->create([
        'cooperative_id' => $cooperative->id,
    ]);

    Report::factory()->fromMember($member)->create([
        'crop' => Crop::Teff,
        'market_id' => $market->id,
        'price' => 7_000,
        'reported_at' => now()->startOfWeek()->subDay(),
        'status' => ReportStatus::Verified,
    ]);

    Report::factory()->fromMember($member)->pending()->create([
        'crop' => Crop::Teff,
        'market_id' => $market->id,
        'price' => 7_500,
        'reported_at' => now()->startOfWeek()->addDay(),
    ]);

    $this->actingAs($admin);

    $this->get(route('cooperative.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Cooperative/Dashboard')
            ->where('prices', [])
        );
});
