<?php

use App\Enums\Crop;
use App\Models\Cooperative;
use App\Models\CooperativeAdmin;
use App\Models\CooperativeMember;
use App\Models\Market;
use App\Models\Report;
use App\Models\User;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->withoutVite();
    Carbon::setTestNow('2026-07-25 12:00:00');
});

afterEach(function () {
    Carbon::setTestNow();
});

/**
 * @return array{cooperative: Cooperative, admin: User, member: CooperativeMember}
 */
function createPricesCooperativeAdmin(array $cooperativeAttributes = []): array
{
    $cooperative = Cooperative::factory()->teffOnly()->create([
        'region' => 'Oromia',
        ...$cooperativeAttributes,
    ]);
    $admin = User::factory()->create();
    $member = CooperativeMember::factory()->active()->create([
        'cooperative_id' => $cooperative->id,
    ]);

    CooperativeAdmin::factory()->owner()->create([
        'cooperative_id' => $cooperative->id,
        'user_id' => $admin->id,
    ]);

    return compact('cooperative', 'admin', 'member');
}

test('guests are redirected away from cooperative prices and pdf download', function () {
    $this->get(route('cooperative.prices.index'))
        ->assertRedirect(route('login'));

    $this->get(route('cooperative.prices.download'))
        ->assertRedirect(route('login'));
});

test('authenticated users without a cooperative admin record receive 403 on prices', function () {
    $this->actingAs(User::factory()->create());

    $this->get(route('cooperative.prices.index'))->assertForbidden();
    $this->get(route('cooperative.prices.download'))->assertForbidden();
});

test('prices isolate the cooperative average and calculate the defined regional benchmark', function () {
    ['cooperative' => $cooperative, 'admin' => $admin, 'member' => $member] = createPricesCooperativeAdmin();
    ['member' => $otherMember] = createPricesCooperativeAdmin(['name' => 'Other Cooperative']);

    $adama = Market::factory()->adama()->create();
    $jimma = Market::factory()->jimma()->create();
    $addisAbaba = Market::factory()->addisAbaba()->create();

    Report::factory()->fromMember($member)->verified()->create([
        'crop' => Crop::Teff,
        'market_id' => $adama->id,
        'price' => 100,
        'reported_at' => now()->subDay(),
    ]);
    Report::factory()->fromMember($member)->verified()->create([
        'crop' => Crop::Teff,
        'market_id' => $adama->id,
        'price' => 120,
        'reported_at' => now()->subDays(2),
    ]);
    Report::factory()->fromMember($member)->verified()->create([
        'crop' => Crop::Teff,
        'market_id' => $adama->id,
        'price' => 80,
        'reported_at' => now()->subDays(9),
    ]);
    Report::factory()->fromMember($otherMember)->verified()->create([
        'crop' => Crop::Teff,
        'market_id' => $adama->id,
        'price' => 1000,
        'reported_at' => now()->subDays(3),
    ]);
    Report::factory()->verified()->create([
        'crop' => Crop::Teff,
        'market_id' => $jimma->id,
        'price' => 90,
        'reported_at' => now()->subDay(),
    ]);

    Report::factory()->fromMember($member)->flagged()->create([
        'crop' => Crop::Teff,
        'market_id' => $adama->id,
        'price' => 999,
        'reported_at' => now()->subDay(),
    ]);
    Report::factory()->fromMember($member)->pending()->create([
        'crop' => Crop::Teff,
        'market_id' => $adama->id,
        'price' => 888,
        'reported_at' => now()->subDay(),
    ]);
    Report::factory()->verified()->create([
        'crop' => Crop::Teff,
        'market_id' => $addisAbaba->id,
        'price' => 777,
        'reported_at' => now()->subDay(),
    ]);

    $this->actingAs($admin)
        ->get(route('cooperative.prices.index'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Cooperative/Prices/Index')
            ->where('summary.cooperative.name', $cooperative->name)
            ->where('summary.cooperative.region', 'Oromia')
            ->where('summary.regionalMarketsCount', 2)
            ->has('summary.rows', 2)
            ->where('summary.rows.0.crop', Crop::Teff->value)
            ->where('summary.rows.0.market', 'Adama')
            ->where('summary.rows.0.currentPrice', 110)
            ->where('summary.rows.0.regionalAverage', 327.5)
            ->where('summary.rows.0.regionalMarketCount', 2)
            ->where('summary.rows.0.trend', 'up')
            ->where('summary.rows.0.trendPercentage', 37.5)
            ->where('summary.rows.1.market', 'Jimma')
            ->where('summary.rows.1.currentPrice', null)
            ->where('summary.rows.1.regionalAverage', 327.5));
});

test('each cooperative sees only its own current price while sharing the aggregate benchmark', function () {
    ['admin' => $firstAdmin, 'member' => $firstMember] = createPricesCooperativeAdmin(['name' => 'First Cooperative']);
    ['admin' => $secondAdmin, 'member' => $secondMember] = createPricesCooperativeAdmin(['name' => 'Second Cooperative']);
    $adama = Market::factory()->adama()->create();
    Market::factory()->jimma()->create();

    Report::factory()->fromMember($firstMember)->verified()->create([
        'crop' => Crop::Teff,
        'market_id' => $adama->id,
        'price' => 100,
        'reported_at' => now()->subDay(),
    ]);
    Report::factory()->fromMember($secondMember)->verified()->create([
        'crop' => Crop::Teff,
        'market_id' => $adama->id,
        'price' => 300,
        'reported_at' => now()->subDay(),
    ]);

    $this->actingAs($firstAdmin)
        ->get(route('cooperative.prices.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('summary.rows.0.currentPrice', 100)
            ->where('summary.rows.0.regionalAverage', 200));

    $this->actingAs($secondAdmin)
        ->get(route('cooperative.prices.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('summary.rows.0.currentPrice', 300)
            ->where('summary.rows.0.regionalAverage', 200));
});

test('cooperative admins can download a black and white weekly price pdf', function () {
    ['admin' => $admin, 'member' => $member] = createPricesCooperativeAdmin([
        'name' => 'Harmee Farmers Cooperative',
    ]);
    $adama = Market::factory()->adama()->create();
    Market::factory()->jimma()->create();

    Report::factory()->fromMember($member)->verified()->create([
        'crop' => Crop::Teff,
        'market_id' => $adama->id,
        'price' => 140,
        'reported_at' => now()->subDay(),
    ]);

    $response = $this->actingAs($admin)
        ->get(route('cooperative.prices.download'));

    $response->assertSuccessful()
        ->assertHeader('content-type', 'application/pdf')
        ->assertDownload('harmee-farmers-cooperative-weekly-prices-2026-07-25.pdf');

    expect((string) $response->getContent())->toStartWith('%PDF-');
});
