<?php

use App\Enums\Crop;
use App\Enums\ReporterType;
use App\Models\Agent;
use App\Models\Market;
use App\Models\Report;
use App\Services\ReportEntryService;
use Database\Seeders\MarketSeeder;
use Inertia\Testing\AssertableInertia;

beforeEach(function (): void {
    $this->seed(MarketSeeder::class);

    $this->market = Market::where('slug', 'adama')->sole();
    $this->agent = Agent::factory()->create(['name' => 'Gezachew']);

    $this->withSession(['agent_id' => $this->agent->id]);
});

/**
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function validReport(array $overrides = []): array
{
    return [
        'crop' => 'teff',
        'market' => 'adama',
        'price' => '8600',
        'reporter_type' => 'crowd',
        'reported_at' => now()->toDateString(),
        ...$overrides,
    ];
}

test('an agent saves a price and it is attributed to them', function () {
    $this->post(route('reports.store'), validReport())
        ->assertRedirect(route('portal.entry'))
        ->assertSessionHasNoErrors();

    $report = Report::sole();

    expect($report->crop)->toBe(Crop::Teff)
        ->and($report->reporter_type)->toBe(ReporterType::Crowd)
        ->and((float) $report->price)->toBe(8600.0)
        ->and($report->agent_id)->toBe($this->agent->id)
        ->and($report->market_id)->toBe($this->market->id)
        ->and($report->is_flagged)->toBeFalse()
        ->and($report->source)->toBe(ReportEntryService::PORTAL_SOURCE);
});

test('attribution comes from the session, never from the form', function () {
    $impostor = Agent::factory()->create(['name' => 'Impostor']);

    $this->post(route('reports.store'), validReport([
        'agent_id' => $impostor->id,
        'agent_name' => $impostor->name,
    ]))->assertSessionHasNoErrors();

    expect(Report::sole()->agent_id)->toBe($this->agent->id);
});

test('a price typed with a thousands separator is accepted', function () {
    $this->post(route('reports.store'), validReport(['price' => '8,600']))
        ->assertSessionHasNoErrors();

    expect((float) Report::sole()->price)->toBe(8600.0);
});

test('a same-day report keeps the clock time so it sorts as the newest', function () {
    $this->post(route('reports.store'), validReport());

    expect(Report::sole()->reported_at->format('H:i:s'))->not->toBe('00:00:00');
});

test('a backdated report is stored at the start of that day', function () {
    $observedOn = now()->subDays(3)->toDateString();

    $this->post(route('reports.store'), validReport(['reported_at' => $observedOn]));

    expect(Report::sole()->reported_at->toDateTimeString())
        ->toBe($observedOn.' 00:00:00');
});

test('crops outside the fixed scope are rejected', function () {
    $this->post(route('reports.store'), validReport(['crop' => 'maize']))
        ->assertSessionHasErrors('crop');

    expect(Report::count())->toBe(0);
});

test('markets outside the fixed scope are rejected', function () {
    $this->post(route('reports.store'), validReport(['market' => 'hawassa']))
        ->assertSessionHasErrors('market');

    expect(Report::count())->toBe(0);
});

test('a reporter type outside official or crowd is rejected', function () {
    $this->post(route('reports.store'), validReport(['reporter_type' => 'guess']))
        ->assertSessionHasErrors('reporter_type');

    expect(Report::count())->toBe(0);
});

test('an out-of-range price is rejected', function (string $price) {
    $this->post(route('reports.store'), validReport(['price' => $price]))
        ->assertSessionHasErrors('price');

    expect(Report::count())->toBe(0);
})->with([
    'zero' => ['0'],
    'negative' => ['-500'],
    'at the ceiling' => ['100000'],
    'not a number' => ['cheap'],
    'empty' => [''],
]);

test('an unusable observation date is rejected', function (string $reportedAt) {
    $this->post(route('reports.store'), validReport(['reported_at' => $reportedAt]))
        ->assertSessionHasErrors('reported_at');

    expect(Report::count())->toBe(0);
})->with([
    'far future' => [date('Y-m-d', strtotime('+1 month'))],
    'long past' => [date('Y-m-d', strtotime('-3 years'))],
    'nonsense' => ['not-a-date'],
    'empty' => [''],
]);

test('the entry page hands the form its markets and the agent their own entries', function () {
    $mine = Report::factory()
        ->for($this->agent)
        ->for(Market::where('slug', 'jimma')->sole())
        ->create();

    Report::factory()->for($this->market)->create();

    $this->get(route('portal.entry'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('portal/entry')
            ->where('agent.name', 'Gezachew')
            ->has('markets', 3)
            ->has('recentReports', 1)
            ->where('recentReports.0.id', $mine->id)
            ->where('recentReports.0.market', 'jimma')
            ->where('recentReports.0.agentName', 'Gezachew')
            ->where('entriesToday', 1),
        );
});

test('the newest entry is listed first', function () {
    $older = Report::factory()->for($this->agent)->for($this->market)
        ->create(['created_at' => now()->subHour()]);
    $newer = Report::factory()->for($this->agent)->for($this->market)
        ->create(['created_at' => now()]);

    $this->get(route('portal.entry'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('recentReports.0.id', $newer->id)
            ->where('recentReports.1.id', $older->id),
        );
});
