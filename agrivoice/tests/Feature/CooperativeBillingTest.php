<?php

use App\Enums\CooperativeMemberStatus;
use App\Enums\InvoiceStatus;
use App\Enums\PlanTier;
use App\Models\Cooperative;
use App\Models\CooperativeAdmin;
use App\Models\CooperativeMember;
use App\Models\Invoice;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->withoutVite();
});

/**
 * @return array{cooperative: Cooperative, admin: User, subscription: Subscription}
 */
function createBillingCooperativeAdmin(array $subscriptionAttributes = []): array
{
    $cooperative = Cooperative::factory()->create();
    $admin = User::factory()->create();
    CooperativeAdmin::factory()->owner()->create([
        'cooperative_id' => $cooperative->id,
        'user_id' => $admin->id,
    ]);
    $subscription = Subscription::factory()->create([
        'cooperative_id' => $cooperative->id,
        ...$subscriptionAttributes,
    ]);

    return compact('cooperative', 'admin', 'subscription');
}

test('guests and non cooperative admins cannot access billing', function () {
    $this->get(route('cooperative.billing.index'))
        ->assertRedirect(route('login'));

    $this->actingAs(User::factory()->create())
        ->get(route('cooperative.billing.index'))
        ->assertForbidden();
});

test('billing shows scoped plan usage and paginated invoices', function () {
    ['cooperative' => $cooperative, 'admin' => $admin] = createBillingCooperativeAdmin();
    ['cooperative' => $otherCooperative] = createBillingCooperativeAdmin();

    CooperativeMember::factory()->count(3)->active()->create([
        'cooperative_id' => $cooperative->id,
    ]);
    CooperativeMember::factory()->create([
        'cooperative_id' => $cooperative->id,
        'status' => CooperativeMemberStatus::Removed,
    ]);
    CooperativeMember::factory()->count(7)->active()->create([
        'cooperative_id' => $otherCooperative->id,
    ]);
    Invoice::factory()->count(11)->create([
        'cooperative_id' => $cooperative->id,
    ]);
    Invoice::factory()->overdue()->create([
        'cooperative_id' => $otherCooperative->id,
        'amount' => 99999,
    ]);

    $this->actingAs($admin)
        ->get(route('cooperative.billing.index'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Cooperative/Billing/Index')
            ->where('subscription.planName', 'Growth')
            ->where('subscription.memberCount', 3)
            ->where('subscription.memberLimit', 500)
            ->where('invoices.total', 11)
            ->has('invoices.data', 10)
            ->has('plans', 3)
            ->missing('invoices.data.10')
            ->where('invoices.data.0.amount', fn (float|int $amount): bool => $amount !== 99999));
});

test('plan changes are authorized and scheduled for the next billing cycle', function () {
    ['admin' => $admin, 'subscription' => $subscription] = createBillingCooperativeAdmin();
    ['subscription' => $foreignSubscription] = createBillingCooperativeAdmin();

    $this->actingAs($admin)
        ->patch(route('cooperative.billing.plan', $subscription), [
            'plan_tier' => PlanTier::Scale->value,
        ])
        ->assertRedirect();

    expect($subscription->fresh()->pending_plan_tier)->toBe(PlanTier::Scale)
        ->and($subscription->fresh()->plan_tier)->toBe(PlanTier::Growth)
        ->and((float) $subscription->fresh()->price_per_month)->toBe(6000.0);

    $this->actingAs($admin)
        ->patch(route('cooperative.billing.plan', $foreignSubscription), [
            'plan_tier' => PlanTier::Starter->value,
        ])
        ->assertForbidden();

    expect($foreignSubscription->fresh()->pending_plan_tier)->toBeNull();
});

test('mock payment method updates validate display only values and isolate cooperatives', function () {
    ['admin' => $admin, 'subscription' => $subscription] = createBillingCooperativeAdmin();
    ['subscription' => $foreignSubscription] = createBillingCooperativeAdmin();

    $this->actingAs($admin)
        ->patch(route('cooperative.billing.payment-method', $subscription), [
            'type' => 'Chapa test',
            'last_four' => '1234',
        ])
        ->assertRedirect();

    expect($subscription->fresh()->payment_method_type)->toBe('Chapa test')
        ->and($subscription->fresh()->payment_method_last_four)->toBe('1234');

    $this->actingAs($admin)
        ->patch(route('cooperative.billing.payment-method', $subscription), [
            'type' => 'Unknown',
            'last_four' => 'real-secret',
        ])
        ->assertSessionHasErrors(['type', 'last_four']);

    $this->actingAs($admin)
        ->patch(route('cooperative.billing.payment-method', $foreignSubscription), [
            'type' => 'Telebirr',
            'last_four' => '9876',
        ])
        ->assertForbidden();
});

test('invoice downloads require tenant ownership and an existing pdf', function () {
    Storage::fake('local');
    ['cooperative' => $cooperative, 'admin' => $admin] = createBillingCooperativeAdmin();
    ['cooperative' => $otherCooperative] = createBillingCooperativeAdmin();
    Storage::disk('local')->put('invoices/own.pdf', '%PDF-own');
    Storage::disk('local')->put('invoices/foreign.pdf', '%PDF-foreign');

    $invoice = Invoice::factory()->create([
        'cooperative_id' => $cooperative->id,
        'status' => InvoiceStatus::Paid,
        'issued_at' => '2026-07-01',
        'pdf_path' => 'invoices/own.pdf',
    ]);
    $foreignInvoice = Invoice::factory()->create([
        'cooperative_id' => $otherCooperative->id,
        'pdf_path' => 'invoices/foreign.pdf',
    ]);

    $this->actingAs($admin)
        ->get(route('cooperative.billing.invoices.download', $invoice))
        ->assertDownload('invoice-2026-07-01.pdf');

    $this->actingAs($admin)
        ->get(route('cooperative.billing.invoices.download', $foreignInvoice))
        ->assertForbidden();
});
