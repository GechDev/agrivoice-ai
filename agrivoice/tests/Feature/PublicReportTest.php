<?php

use App\Enums\Crop;
use App\Enums\ReportStatus;
use App\Models\Agent;
use App\Models\Market;
use App\Models\Report;
use App\Models\User;
use App\Services\SnapshotService;
use Database\Seeders\MarketSeeder;
use Inertia\Testing\AssertableInertia;

beforeEach(function (): void {
    $this->seed(MarketSeeder::class);
    $this->actingAs(User::factory()->create());

    Agent::query()->firstOrCreate(
        ['name' => 'Public Submission'],
        ['pin' => '0000'],
    );
});

test('an authenticated farmer can open the report-price page', function () {
    $this->get(route('report-price'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('report-price')
            ->has('markets', 3)
        );
});

test('a guest cannot open or submit the report-price form', function () {
    auth()->logout();

    $this->get(route('report-price'))->assertRedirect(route('login'));
    $this->post(route('report-price.store'))->assertRedirect(route('login'));
});

test('a valid farmer submission creates a pending report and redirects to the dashboard', function () {
    $this->post(route('report-price.store'), [
        'crop' => 'teff',
        'market' => 'adama',
        'price' => '8500',
        'reported_at' => now()->toDateString(),
    ])->assertRedirect(route('dashboard'))
        ->assertSessionHas('success', 'Report submitted for review.');

    $report = Report::sole();

    expect($report->crop->value)->toBe('teff')
        ->and($report->reporter_type->value)->toBe('crowd')
        ->and((float) $report->price)->toBe(8500.0)
        ->and($report->source)->toBe('public_web')
        ->and($report->status)->toBe(ReportStatus::Pending)
        ->and($report->is_flagged)->toBeFalse()
        ->and($report->agent->name)->toBe('Public Submission');
});

test('pending reports are excluded from dashboard snapshots', function () {
    $adama = Market::where('slug', 'adama')->sole();
    $agent = Agent::factory()->create();
    $publicAgent = Agent::where('name', 'Public Submission')->sole();

    Report::factory()->create([
        'crop' => 'teff',
        'market_id' => $adama->id,
        'agent_id' => $agent->id,
        'price' => 5000,
        'reported_at' => now()->subHour(),
        'status' => 'verified',
    ]);

    Report::factory()->create([
        'crop' => 'teff',
        'market_id' => $adama->id,
        'agent_id' => $publicAgent->id,
        'price' => 200,
        'reported_at' => now()->subMinutes(10),
        'status' => 'pending',
    ]);

    $snapshot = app(SnapshotService::class)->forCropMarket(
        Crop::Teff,
        $adama,
    );

    expect($snapshot['reportCount'])->toBe(1)
        ->and($snapshot['price'])->toBe(5000.0);
});

test('a price with a thousands separator is accepted', function () {
    $this->post(route('report-price.store'), [
        'crop' => 'coffee',
        'market' => 'jimma',
        'price' => '18,500',
        'reported_at' => now()->toDateString(),
    ])->assertSessionHasNoErrors();

    expect((float) Report::sole()->price)->toBe(18500.0);
});

test('unsupported crops are rejected', function () {
    $this->post(route('report-price.store'), [
        'crop' => 'barley',
        'market' => 'adama',
        'price' => '5000',
        'reported_at' => now()->toDateString(),
    ])->assertSessionHasErrors('crop');

    expect(Report::count())->toBe(0);
});

test('markets outside the fixed scope are rejected', function () {
    $this->post(route('report-price.store'), [
        'crop' => 'teff',
        'market' => 'hawassa',
        'price' => '5000',
        'reported_at' => now()->toDateString(),
    ])->assertSessionHasErrors('market');

    expect(Report::count())->toBe(0);
});

test('out-of-range prices are rejected', function (string $price) {
    $this->post(route('report-price.store'), [
        'crop' => 'teff',
        'market' => 'adama',
        'price' => $price,
        'reported_at' => now()->toDateString(),
    ])->assertSessionHasErrors('price');

    expect(Report::count())->toBe(0);
})->with([
    'zero' => ['0'],
    'negative' => ['-500'],
    'at the ceiling' => ['100000'],
    'not a number' => ['cheap'],
    'empty' => [''],
]);
