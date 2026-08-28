<?php

use App\Enums\PlanTier;
use App\Models\Cooperative;
use App\Models\CooperativeAdmin;
use App\Models\Subscription;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function (): void {
    $this->withoutVite();
});

function cooperativeOwnerWithoutPlan(): array
{
    $cooperative = Cooperative::factory()->create();
    $owner = User::factory()->create();

    CooperativeAdmin::factory()->owner()->create([
        'cooperative_id' => $cooperative->id,
        'user_id' => $owner->id,
    ]);

    return [$owner, $cooperative];
}

test('cooperative owners must finish onboarding before using the dashboard', function () {
    [$owner] = cooperativeOwnerWithoutPlan();

    $this->actingAs($owner)
        ->get(route('cooperative.dashboard'))
        ->assertRedirect(route('cooperative.onboarding'));
});

test('cooperative onboarding displays every available plan', function () {
    [$owner, $cooperative] = cooperativeOwnerWithoutPlan();

    $this->actingAs($owner)
        ->get(route('cooperative.onboarding'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Cooperative/Onboarding')
            ->where('cooperative.name', $cooperative->name)
            ->where('cooperative.region', $cooperative->region)
            ->has('plans', 3)
            ->where('plans.0.tier', PlanTier::Starter->value)
            ->where('plans.1.tier', PlanTier::Growth->value)
            ->where('plans.2.tier', PlanTier::Scale->value)
        );
});

test('choosing a plan activates the cooperative and opens the dashboard', function () {
    [$owner, $cooperative] = cooperativeOwnerWithoutPlan();

    $this->actingAs($owner)
        ->post(route('cooperative.onboarding.store'), [
            'plan_tier' => PlanTier::Growth->value,
        ])
        ->assertRedirect(route('cooperative.dashboard'))
        ->assertSessionHas('success');

    $subscription = Subscription::query()
        ->forCooperative($cooperative->id)
        ->sole();

    expect($subscription->plan_tier)->toBe(PlanTier::Growth)
        ->and((float) $subscription->price_per_month)->toBe(6000.0)
        ->and($subscription->member_limit)->toBe(500);

    $this->actingAs($owner)
        ->get(route('cooperative.dashboard'))
        ->assertOk();
});

test('onboarding rejects an unknown plan', function () {
    [$owner] = cooperativeOwnerWithoutPlan();

    $this->actingAs($owner)
        ->post(route('cooperative.onboarding.store'), [
            'plan_tier' => 'enterprise',
        ])
        ->assertSessionHasErrors('plan_tier');

    expect(Subscription::query()->count())->toBe(0);
});

test('already onboarded cooperatives cannot repeat plan selection', function () {
    [$owner, $cooperative] = cooperativeOwnerWithoutPlan();
    Subscription::factory()->starter()->create([
        'cooperative_id' => $cooperative->id,
    ]);

    $this->actingAs($owner)
        ->get(route('cooperative.onboarding'))
        ->assertRedirect(route('cooperative.dashboard'));
});
