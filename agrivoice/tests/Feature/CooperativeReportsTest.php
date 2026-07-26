<?php

use App\Enums\Crop;
use App\Enums\MarketSlug;
use App\Enums\ReportStatus;
use App\Models\Cooperative;
use App\Models\CooperativeAdmin;
use App\Models\CooperativeMember;
use App\Models\Market;
use App\Models\Report;
use App\Models\ReportStatusLog;
use App\Models\Subscription;
use App\Models\User;
use App\Policies\ReportPolicy;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->withoutVite();
});

/**
 * @return array{cooperative: Cooperative, admin: User}
 */
function createReportsCooperativeAdmin(?Cooperative $cooperative = null): array
{
    $cooperative ??= Cooperative::factory()->create();
    $admin = User::factory()->create();

    CooperativeAdmin::factory()->owner()->create([
        'cooperative_id' => $cooperative->id,
        'user_id' => $admin->id,
    ]);
    Subscription::factory()->create([
        'cooperative_id' => $cooperative->id,
    ]);

    return ['cooperative' => $cooperative, 'admin' => $admin];
}

test('guests are redirected away from cooperative reports', function () {
    $this->get(route('cooperative.reports.index'))
        ->assertRedirect(route('login'));

    $this->get(route('cooperative.reports.export'))
        ->assertRedirect(route('login'));
});

test('authenticated users without a cooperative admin record receive 403 on reports', function () {
    $this->actingAs(User::factory()->create());

    $this->get(route('cooperative.reports.index'))
        ->assertForbidden();

    $this->get(route('cooperative.reports.export'))
        ->assertForbidden();
});

test('index paginates and filters reports while isolating cooperatives and audit trails', function () {
    ['cooperative' => $coopA, 'admin' => $admin] = createReportsCooperativeAdmin();
    $coopB = Cooperative::factory()->create();

    $adama = Market::factory()->adama()->create();
    $jimma = Market::factory()->jimma()->create();

    $memberA = CooperativeMember::factory()->active()->create([
        'cooperative_id' => $coopA->id,
        'name' => 'Alemayehu',
        'phone_number' => '+251911000001',
    ]);
    $memberB = CooperativeMember::factory()->active()->create([
        'cooperative_id' => $coopB->id,
        'name' => 'Other Coop Member',
        'phone_number' => '+251911000099',
    ]);

    $visible = Report::factory()->fromMember($memberA)->pending()->create([
        'crop' => Crop::Teff,
        'market_id' => $adama->id,
        'price' => 11_000,
        'reported_at' => now()->subDay(),
    ]);

    $coffee = Report::factory()->fromMember($memberA)->verified()->create([
        'crop' => Crop::Coffee,
        'market_id' => $jimma->id,
        'price' => 15_000,
        'reported_at' => now()->subDays(3),
    ]);

    Report::factory()->fromMember($memberA)->verified()->create([
        'crop' => Crop::Teff,
        'market_id' => $adama->id,
        'price' => 10_500,
        'reported_at' => now()->subDays(10),
    ]);

    $foreign = Report::factory()->fromMember($memberB)->pending()->create([
        'crop' => Crop::Teff,
        'market_id' => $adama->id,
        'price' => 99_999,
        'reported_at' => now()->subDay(),
    ]);

    ReportStatusLog::factory()->create([
        'report_id' => $visible->id,
        'changed_by' => $admin->id,
        'old_status' => ReportStatus::Pending,
        'new_status' => ReportStatus::Pending,
        'reason' => 'Visible audit',
        'created_at' => now()->subMinutes(30),
    ]);

    ReportStatusLog::factory()->create([
        'report_id' => $foreign->id,
        'changed_by' => User::factory()->create()->id,
        'old_status' => ReportStatus::Pending,
        'new_status' => ReportStatus::Disputed,
        'reason' => 'Secret foreign audit',
        'created_at' => now()->subMinutes(10),
    ]);

    Report::factory()->fromMember($memberA)->count(20)->create([
        'crop' => Crop::Teff,
        'market_id' => $adama->id,
        'reported_at' => now()->subHours(2),
        'status' => ReportStatus::Verified,
    ]);

    $this->actingAs($admin);

    $this->get(route('cooperative.reports.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Cooperative/Reports/Index')
            ->has('reports.data', 20)
            ->where('reports.total', 23)
            ->where('filters.crop', null)
            ->where('filters.market', null)
            ->where('filters.status', null)
            ->where('filters.from', null)
            ->where('filters.to', null)
            ->has('cropOptions', count(Crop::cases()))
            ->has('statusOptions', 4)
            ->where('marketOptions', function ($options) {
                $values = collect($options)->pluck('value');

                return $values->contains(MarketSlug::Adama->value)
                    && $values->contains(MarketSlug::Jimma->value)
                    && ! $values->contains(MarketSlug::AddisAbaba->value);
            })
            ->where('reports.data', function ($rows) use ($foreign) {
                $ids = collect($rows)->pluck('id');

                return ! $ids->contains($foreign->id)
                    && collect($rows)->every(function (array $row) {
                        $reasons = collect($row['auditTrail'])->pluck('reason');

                        return ! $reasons->contains('Secret foreign audit');
                    });
            })
        );

    $this->get(route('cooperative.reports.index', [
        'crop' => Crop::Coffee->value,
        'market' => MarketSlug::Jimma->value,
        'status' => ReportStatus::Verified->value,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Cooperative/Reports/Index')
            ->has('reports.data', 1)
            ->where('reports.data.0.id', $coffee->id)
            ->where('filters.crop', Crop::Coffee->value)
            ->where('filters.market', MarketSlug::Jimma->value)
            ->where('filters.status', ReportStatus::Verified->value)
        );

    $this->get(route('cooperative.reports.index', [
        'from' => now()->subDays(2)->toDateString(),
        'to' => now()->toDateString(),
        'status' => ReportStatus::Pending->value,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Cooperative/Reports/Index')
            ->has('reports.data', 1)
            ->where('reports.data.0.id', $visible->id)
            ->where('reports.data.0.reporter.name', 'Alemayehu')
            ->where('reports.data.0.auditTrail.0.reason', 'Visible audit')
            ->where('reports.data.0.auditTrail.0.changedBy.id', $admin->id)
        );
});

test('empty cooperative reports list is supported', function () {
    ['admin' => $admin] = createReportsCooperativeAdmin();

    $this->actingAs($admin)
        ->get(route('cooperative.reports.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Cooperative/Reports/Index')
            ->has('reports.data', 0)
            ->where('reports.total', 0)
            ->where('marketOptions', [])
        );
});

test('cooperative admin cannot update another cooperative report', function () {
    ['admin' => $adminA] = createReportsCooperativeAdmin();
    $coopB = Cooperative::factory()->create();
    $memberB = CooperativeMember::factory()->active()->create([
        'cooperative_id' => $coopB->id,
    ]);
    $market = Market::factory()->adama()->create();

    $foreign = Report::factory()->fromMember($memberB)->pending()->create([
        'market_id' => $market->id,
    ]);

    $this->actingAs($adminA)
        ->patch(route('cooperative.reports.status', $foreign), [
            'status' => ReportStatus::Verified->value,
        ])
        ->assertForbidden();

    expect($foreign->fresh()->status)->toBe(ReportStatus::Pending);
    expect(ReportStatusLog::query()->where('report_id', $foreign->id)->count())->toBe(0);
});

test('status update writes an exact audit row and enforces reason rules', function () {
    ['admin' => $admin] = createReportsCooperativeAdmin();
    $member = CooperativeMember::factory()->active()->create([
        'cooperative_id' => $admin->cooperativeAdmin->cooperative_id,
    ]);
    $market = Market::factory()->adama()->create();

    $report = Report::factory()->fromMember($member)->pending()->create([
        'market_id' => $market->id,
    ]);

    $this->actingAs($admin)
        ->from(route('cooperative.reports.index'))
        ->patch(route('cooperative.reports.status', $report), [
            'status' => ReportStatus::Disputed->value,
        ])
        ->assertSessionHasErrors('reason');

    $this->actingAs($admin)
        ->from(route('cooperative.reports.index'))
        ->patch(route('cooperative.reports.status', $report), [
            'status' => ReportStatus::Rejected->value,
        ])
        ->assertSessionHasErrors('reason');

    $this->actingAs($admin)
        ->from(route('cooperative.reports.index'))
        ->patch(route('cooperative.reports.status', $report), [
            'status' => ReportStatus::Verified->value,
        ])
        ->assertRedirect(route('cooperative.reports.index'));

    $report->refresh();
    expect($report->status)->toBe(ReportStatus::Verified);

    $log = ReportStatusLog::query()->where('report_id', $report->id)->sole();
    expect($log->changed_by)->toBe($admin->id)
        ->and($log->old_status)->toBe(ReportStatus::Pending)
        ->and($log->new_status)->toBe(ReportStatus::Verified)
        ->and($log->reason)->toBeNull();

    $this->actingAs($admin)
        ->from(route('cooperative.reports.index'))
        ->patch(route('cooperative.reports.status', $report), [
            'status' => ReportStatus::Verified->value,
        ])
        ->assertSessionHasErrors('status');

    $this->actingAs($admin)
        ->from(route('cooperative.reports.index'))
        ->patch(route('cooperative.reports.status', $report), [
            'status' => ReportStatus::Disputed->value,
            'reason' => 'Price looks unrealistically high for this market.',
        ])
        ->assertRedirect(route('cooperative.reports.index'));

    $disputeLog = ReportStatusLog::query()
        ->where('report_id', $report->id)
        ->where('new_status', ReportStatus::Disputed)
        ->sole();

    expect($disputeLog->changed_by)->toBe($admin->id)
        ->and($disputeLog->old_status)->toBe(ReportStatus::Verified)
        ->and($disputeLog->new_status)->toBe(ReportStatus::Disputed)
        ->and($disputeLog->reason)->toBe('Price looks unrealistically high for this market.');
});

test('verifying a report immediately updates cooperative dashboard aggregates', function () {
    ['cooperative' => $cooperative, 'admin' => $admin] = createReportsCooperativeAdmin(
        Cooperative::factory()->teffOnly()->create(),
    );
    $market = Market::factory()->adama()->create();
    $member = CooperativeMember::factory()->active()->create([
        'cooperative_id' => $cooperative->id,
    ]);

    $report = Report::factory()->fromMember($member)->pending()->create([
        'crop' => Crop::Teff,
        'market_id' => $market->id,
        'price' => 12_500,
        'reported_at' => now()->startOfWeek()->addHours(4),
        'is_flagged' => false,
    ]);

    $this->actingAs($admin);

    $this->get(route('cooperative.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Cooperative/Dashboard')
            ->where('prices', [])
        );

    $this->from(route('cooperative.reports.index'))
        ->patch(route('cooperative.reports.status', $report), [
            'status' => ReportStatus::Verified->value,
        ])
        ->assertRedirect(route('cooperative.reports.index'));

    $this->get(route('cooperative.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Cooperative/Dashboard')
            ->has('prices', 1)
            ->where('prices.0.crop', Crop::Teff->value)
            ->where('prices.0.averagePrice', 12500)
            ->where('prices.0.reportCount', 1)
        );
});

test('csv export respects filters and only includes the acting cooperative rows', function () {
    ['cooperative' => $coopA, 'admin' => $admin] = createReportsCooperativeAdmin();
    $coopB = Cooperative::factory()->create();

    $adama = Market::factory()->adama()->create();
    $jimma = Market::factory()->jimma()->create();

    $memberA = CooperativeMember::factory()->active()->create([
        'cooperative_id' => $coopA->id,
        'name' => 'Exporter',
        'phone_number' => '+251911222333',
    ]);
    $memberB = CooperativeMember::factory()->active()->create([
        'cooperative_id' => $coopB->id,
        'name' => 'Foreign Exporter',
        'phone_number' => '+251911444555',
    ]);

    $match = Report::factory()->fromMember($memberA)->verified()->create([
        'crop' => Crop::Teff,
        'market_id' => $adama->id,
        'price' => 10_200,
        'reported_at' => now()->subDay(),
    ]);

    $unmatchedCrop = Report::factory()->fromMember($memberA)->verified()->create([
        'crop' => Crop::Coffee,
        'market_id' => $adama->id,
        'price' => 14_000,
        'reported_at' => now()->subDay(),
    ]);

    $unmatchedMarket = Report::factory()->fromMember($memberA)->verified()->create([
        'crop' => Crop::Teff,
        'market_id' => $jimma->id,
        'price' => 10_300,
        'reported_at' => now()->subDay(),
    ]);

    $unmatchedStatus = Report::factory()->fromMember($memberA)->pending()->create([
        'crop' => Crop::Teff,
        'market_id' => $adama->id,
        'price' => 10_400,
        'reported_at' => now()->subDay(),
    ]);

    $unmatchedDate = Report::factory()->fromMember($memberA)->verified()->create([
        'crop' => Crop::Teff,
        'market_id' => $adama->id,
        'price' => 10_500,
        'reported_at' => now()->subDays(20),
    ]);

    $foreign = Report::factory()->fromMember($memberB)->verified()->create([
        'crop' => Crop::Teff,
        'market_id' => $adama->id,
        'price' => 88_888,
        'reported_at' => now()->subDay(),
    ]);

    $this->actingAs($admin);

    $response = $this->get(route('cooperative.reports.export', [
        'crop' => Crop::Teff->value,
        'market' => MarketSlug::Adama->value,
        'status' => ReportStatus::Verified->value,
        'from' => now()->subDays(3)->toDateString(),
        'to' => now()->toDateString(),
    ]));

    $response->assertOk();
    $response->assertHeader('content-type', 'text/csv; charset=UTF-8');

    $csv = $response->streamedContent();

    expect($csv)->toStartWith("\xEF\xBB\xBF")
        ->and($csv)->toContain('id,crop,market,price,reporter_name,reporter_phone,status,reported_at')
        ->and($csv)->toContain('Exporter')
        ->and($csv)->toContain('+251911222333')
        ->and($csv)->not->toContain('Foreign Exporter')
        ->and($csv)->not->toContain('88888.00');

    $rows = collect(explode("\n", trim(ltrim($csv, "\xEF\xBB\xBF"))))
        ->filter(fn (string $line): bool => $line !== '')
        ->map(fn (string $line): array => str_getcsv($line))
        ->values();

    $header = $rows->shift();
    $ids = $rows->pluck(0)->map(fn ($id) => (int) $id);

    expect($header)->toBe([
        'id',
        'crop',
        'market',
        'price',
        'reporter_name',
        'reporter_phone',
        'status',
        'reported_at',
    ])
        ->and($rows)->toHaveCount(1)
        ->and($ids->all())->toBe([$match->id])
        ->and($ids)->not->toContain($unmatchedCrop->id)
        ->and($ids)->not->toContain($unmatchedMarket->id)
        ->and($ids)->not->toContain($unmatchedStatus->id)
        ->and($ids)->not->toContain($unmatchedDate->id)
        ->and($ids)->not->toContain($foreign->id)
        ->and($rows->first()[1])->toBe('teff')
        ->and($rows->first()[2])->toBe('adama')
        ->and($rows->first()[3])->toBe('10200.00')
        ->and($rows->first()[6])->toBe('verified');
});

test('report policy allows only matching cooperative admins', function () {
    ['cooperative' => $coopA, 'admin' => $adminA] = createReportsCooperativeAdmin();
    ['admin' => $adminB] = createReportsCooperativeAdmin();

    $memberA = CooperativeMember::factory()->active()->create([
        'cooperative_id' => $coopA->id,
    ]);
    $report = Report::factory()->fromMember($memberA)->pending()->create([
        'market_id' => Market::factory()->adama()->create()->id,
    ]);

    $policy = new ReportPolicy;

    expect($policy->viewAny($adminA))->toBeTrue()
        ->and($policy->view($adminA, $report))->toBeTrue()
        ->and($policy->update($adminA, $report))->toBeTrue()
        ->and($policy->view($adminB, $report))->toBeFalse()
        ->and($policy->update($adminB, $report))->toBeFalse()
        ->and($policy->viewAny(User::factory()->create()))->toBeFalse();
});
