<?php

use App\Enums\CooperativeMemberStatus;
use App\Enums\Crop;
use App\Jobs\SendMemberInviteJob;
use App\Models\Cooperative;
use App\Models\CooperativeAdmin;
use App\Models\CooperativeMember;
use App\Models\Market;
use App\Models\MemberQuery;
use App\Models\Report;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->withoutVite();
});

/**
 * @return array{cooperative: Cooperative, admin: User}
 */
function createCooperativeAdmin(?Cooperative $cooperative = null): array
{
    $cooperative ??= Cooperative::factory()->create();
    $admin = User::factory()->create();

    CooperativeAdmin::factory()->owner()->create([
        'cooperative_id' => $cooperative->id,
        'user_id' => $admin->id,
    ]);

    return ['cooperative' => $cooperative, 'admin' => $admin];
}

test('guests are redirected away from cooperative members', function () {
    $this->get(route('cooperative.members.index'))
        ->assertRedirect(route('login'));
});

test('authenticated users without a cooperative admin record receive 403 on members', function () {
    $this->actingAs(User::factory()->create());

    $this->get(route('cooperative.members.index'))
        ->assertForbidden();
});

test('index paginates members and scopes search status and counts to the acting cooperative', function () {
    ['cooperative' => $coopA, 'admin' => $admin] = createCooperativeAdmin();
    $this->actingAs($admin);

    $coopB = Cooperative::factory()->create();

    $farmer = User::factory()->create(['name' => 'Abebe Farmer']);

    $visible = CooperativeMember::factory()->active()->create([
        'cooperative_id' => $coopA->id,
        'name' => 'Visible Member',
        'phone_number' => '+251911000001',
        'farmer_id' => $farmer->id,
    ]);

    CooperativeMember::factory()->invited()->create([
        'cooperative_id' => $coopA->id,
        'name' => 'Invited Only',
        'phone_number' => '+251911000002',
    ]);

    CooperativeMember::factory()->active()->create([
        'cooperative_id' => $coopB->id,
        'name' => 'Other Coop',
        'phone_number' => '+251911000001',
    ]);

    $market = Market::factory()->adama()->create();

    Report::factory()->fromMember($visible)->count(2)->create([
        'market_id' => $market->id,
        'reported_at' => now()->subHour(),
    ]);

    MemberQuery::factory()->count(3)->create([
        'cooperative_member_id' => $visible->id,
        'market_id' => $market->id,
        'queried_at' => now()->subMinutes(30),
    ]);

    CooperativeMember::factory()->active()->count(20)->create([
        'cooperative_id' => $coopA->id,
    ]);

    $this->get(route('cooperative.members.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Cooperative/Members/Index')
            ->has('members.data', 20)
            ->where('members.total', 22)
            ->where('filters.search', null)
            ->where('filters.status', null)
            ->has('statusOptions', 3)
            ->where('selectedMember', null)
        );

    $this->get(route('cooperative.members.index', ['search' => 'Abebe']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Cooperative/Members/Index')
            ->has('members.data', 1)
            ->where('members.data.0.id', $visible->id)
            ->where('members.data.0.name', 'Visible Member')
            ->where('members.data.0.queriesCount', 3)
            ->where('members.data.0.reportsCount', 2)
            ->where('filters.search', 'Abebe')
        );

    $this->get(route('cooperative.members.index', ['status' => 'invited']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Cooperative/Members/Index')
            ->has('members.data', 1)
            ->where('members.data.0.name', 'Invited Only')
            ->where('filters.status', 'invited')
        );

    $this->get(route('cooperative.members.index', ['status' => 'not-a-status']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Cooperative/Members/Index')
            ->where('filters.status', null)
            ->where('members.total', 22)
        );
});

test('store ignores injected cooperative_id and invites only the acting cooperative', function () {
    Queue::fake();

    ['cooperative' => $coopA, 'admin' => $admin] = createCooperativeAdmin();
    $coopB = Cooperative::factory()->create();

    $this->actingAs($admin)
        ->post(route('cooperative.members.store'), [
            'name' => 'New Member',
            'phone_number' => '0911234567',
            'cooperative_id' => $coopB->id,
        ])
        ->assertRedirect();

    $member = CooperativeMember::query()->where('phone_number', '+251911234567')->first();

    expect($member)->not->toBeNull()
        ->and($member->cooperative_id)->toBe($coopA->id)
        ->and($member->name)->toBe('New Member')
        ->and($member->status)->toBe(CooperativeMemberStatus::Invited);

    expect(CooperativeMember::query()->where('cooperative_id', $coopB->id)->count())->toBe(0);

    Queue::assertPushed(SendMemberInviteJob::class, fn (SendMemberInviteJob $job): bool => $job->cooperativeMemberId === $member->id);
});

test('store normalizes ethiopian phone numbers and rejects duplicates within the same cooperative', function () {
    Queue::fake();

    ['cooperative' => $coopA, 'admin' => $admin] = createCooperativeAdmin();
    $this->actingAs($admin);

    $coopB = Cooperative::factory()->create();

    CooperativeMember::factory()->create([
        'cooperative_id' => $coopA->id,
        'phone_number' => '+251911111111',
    ]);

    CooperativeMember::factory()->create([
        'cooperative_id' => $coopB->id,
        'phone_number' => '+251911111111',
    ]);

    $this->actingAs($admin)
        ->post(route('cooperative.members.store'), [
            'phone_number' => '09-1111-1111',
        ])
        ->assertSessionHasErrors('phone_number');

    $this->actingAs($admin)
        ->post(route('cooperative.members.store'), [
            'name' => 'From B Format',
            'phone_number' => '+251 711 222 333',
        ])
        ->assertRedirect();

    expect(CooperativeMember::query()->where('phone_number', '+251711222333')->value('cooperative_id'))
        ->toBe($coopA->id);

    $this->actingAs($admin)
        ->post(route('cooperative.members.store'), [
            'phone_number' => '12345',
        ])
        ->assertSessionHasErrors('phone_number');
});

test('admin cannot view or remove another cooperatives member but can remove their own', function () {
    ['cooperative' => $coopA, 'admin' => $admin] = createCooperativeAdmin();
    $this->actingAs($admin);

    $coopB = Cooperative::factory()->create();

    $own = CooperativeMember::factory()->active()->create([
        'cooperative_id' => $coopA->id,
    ]);

    $other = CooperativeMember::factory()->active()->create([
        'cooperative_id' => $coopB->id,
    ]);

    $this->get(route('cooperative.members.show', $other))
        ->assertForbidden();

    $this->patch(route('cooperative.members.remove', $other))
        ->assertForbidden();

    $this->patch(route('cooperative.members.remove', $own))
        ->assertRedirect();

    expect($own->fresh()->status)->toBe(CooperativeMemberStatus::Removed);

    $this->patch(route('cooperative.members.remove', $own))
        ->assertForbidden();

    $this->get(route('cooperative.members.show', $own))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Cooperative/Members/Index')
            ->where('selectedMember.id', $own->id)
            ->where('selectedMember.status', 'removed')
        );
});

test('bulk invite streams at least 500 valid rows with duplicate and invalid summary', function () {
    Queue::fake();

    ['cooperative' => $cooperative, 'admin' => $admin] = createCooperativeAdmin();
    $this->actingAs($admin);

    CooperativeMember::factory()->create([
        'cooperative_id' => $cooperative->id,
        'phone_number' => '+251911999999',
    ]);

    $lines = ['name,phone_number'];

    for ($i = 1; $i <= 500; $i++) {
        $suffix = str_pad((string) $i, 8, '0', STR_PAD_LEFT);
        $lines[] = 'Member '.$i.',09'.$suffix;
    }

    $lines[] = 'Existing,0911999999';
    $lines[] = 'Dup In File,0900000001';
    $lines[] = 'Bad,not-a-phone';
    $lines[] = 'Also Bad,123';

    $csv = UploadedFile::fake()->createWithContent(
        'members.csv',
        "\xEF\xBB\xBF".implode("\n", $lines)."\n",
    );

    $this->post(route('cooperative.members.bulk-invite'), [
        'csv' => $csv,
    ])
        ->assertRedirect()
        ->assertSessionHas('bulkInviteSummary', [
            'invited' => 500,
            'skipped_duplicates' => 2,
            'invalid_format' => 2,
        ]);

    expect(CooperativeMember::query()->forCooperative($cooperative->id)->count())->toBe(501);

    Queue::assertPushed(SendMemberInviteJob::class, 500);
});

test('member detail stats and frequent dispute flag are scoped to the selected member', function () {
    ['cooperative' => $cooperative, 'admin' => $admin] = createCooperativeAdmin();
    $this->actingAs($admin);

    $market = Market::factory()->adama()->create();

    $member = CooperativeMember::factory()->active()->create([
        'cooperative_id' => $cooperative->id,
        'name' => 'Disputed Member',
    ]);

    $other = CooperativeMember::factory()->active()->create([
        'cooperative_id' => $cooperative->id,
    ]);

    Report::factory()->fromMember($member)->count(3)->disputed()->create([
        'market_id' => $market->id,
        'crop' => Crop::Teff,
        'reported_at' => now()->subDays(1),
    ]);

    Report::factory()->fromMember($member)->count(2)->verified()->create([
        'market_id' => $market->id,
        'crop' => Crop::Teff,
        'reported_at' => now()->subHours(2),
    ]);

    Report::factory()->fromMember($other)->count(10)->disputed()->create([
        'market_id' => $market->id,
        'reported_at' => now()->subDay(),
    ]);

    MemberQuery::factory()->count(2)->create([
        'cooperative_member_id' => $member->id,
        'market_id' => $market->id,
        'crop' => Crop::Teff,
        'query_text' => 'Price of teff?',
        'queried_at' => now()->subHour(),
    ]);

    $this->get(route('cooperative.members.show', $member))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Cooperative/Members/Index')
            ->where('selectedMember.id', $member->id)
            ->where('selectedMember.totalReports', 5)
            ->where('selectedMember.disputedOrRejectedRate', 60)
            ->where('selectedMember.frequentDisputes', true)
            ->has('selectedMember.recentReports', 5)
            ->has('selectedMember.recentQueries', 2)
            ->where('selectedMember.recentQueries.0.text', 'Price of teff?')
        );
});
