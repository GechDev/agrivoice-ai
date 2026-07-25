<?php

use App\Enums\Crop;
use App\Enums\MarketSlug;
use App\Models\Agent;
use App\Models\Market;
use App\Models\Report;
use Database\Seeders\ReportSeeder;

beforeEach(function (): void {
    $this->seed(ReportSeeder::class);
});

test('seeding fills every crop and market pair so the dashboard opens populated', function () {
    expect(Agent::count())->toBe(5)
        ->and(Market::count())->toBe(3);

    foreach (Crop::cases() as $crop) {
        foreach (MarketSlug::cases() as $marketSlug) {
            $reportCount = Report::where('crop', $crop)
                ->whereRelation('market', 'slug', $marketSlug->value)
                ->count();

            expect($reportCount)
                ->toBeGreaterThan(0, "{$crop->value} in {$marketSlug->value} has no reports");
        }
    }
});

test('the seeded history spans a fortnight so a trend can be computed', function () {
    $oldest = Report::min('reported_at');
    $newest = Report::max('reported_at');

    expect(now()->diffInDays($oldest, true))->toBeGreaterThan(7)
        ->and(now()->diffInDays($newest, true))->toBeLessThan(2);
});

test('coverage is uneven so confidence has something to vary against', function () {
    $countsPerPair = Report::selectRaw('crop, market_id, count(*) as total')
        ->groupBy('crop', 'market_id')
        ->pluck('total');

    expect($countsPerPair->min())->not->toBe($countsPerPair->max());
});

test('the seeded outliers are left unflagged, ready for the flag demo', function () {
    expect(Report::where('is_flagged', true)->count())->toBe(0);

    // Cast before sorting: the decimal cast hands back strings.
    $teffPrices = Report::where('crop', Crop::Teff)
        ->pluck('price')
        ->map(fn (string $price): float => (float) $price)
        ->sort()
        ->values();

    $cheapest = $teffPrices->first();
    $median = $teffPrices->get((int) ($teffPrices->count() / 2));

    // An obviously wrong low price has to survive seeding, or there is nothing
    // to flag on stage.
    expect($cheapest)->toBeLessThan($median / 2);
});

test('every seeded report is attributed to an agent', function () {
    expect(Report::whereNull('agent_id')->count())->toBe(0)
        ->and(Report::query()->distinct()->count('agent_id'))->toBeGreaterThan(1);
});

test('re-seeding does not duplicate the agent roster or the markets', function () {
    $this->seed(ReportSeeder::class);

    expect(Agent::count())->toBe(5)
        ->and(Market::count())->toBe(3);
});

test('a seeded agent can sign in with their demo PIN', function () {
    $this->post(route('portal.login.store'), ['name' => 'Gezachew', 'pin' => '2222'])
        ->assertRedirect(route('portal.entry'))
        ->assertSessionHasNoErrors();
});
