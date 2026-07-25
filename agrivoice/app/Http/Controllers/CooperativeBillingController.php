<?php

namespace App\Http\Controllers;

use App\Enums\CooperativeMemberStatus;
use App\Enums\PlanTier;
use App\Http\Requests\UpdatePaymentMethodRequest;
use App\Http\Requests\UpdateSubscriptionPlanRequest;
use App\Models\CooperativeMember;
use App\Models\Invoice;
use App\Models\Subscription;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CooperativeBillingController extends CooperativeController
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Subscription::class);
        $this->authorize('viewAny', Invoice::class);
        $cooperative = $this->cooperative($request);
        $subscription = Subscription::query()->forCooperative($cooperative->id)->first();
        $memberCount = CooperativeMember::query()
            ->forCooperative($cooperative->id)
            ->where('status', '!=', CooperativeMemberStatus::Removed)
            ->count();

        $invoices = Invoice::query()
            ->forCooperative($cooperative->id)
            ->latest('issued_at')
            ->latest('id')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Invoice $invoice): array => [
                'id' => $invoice->id,
                'amount' => (float) $invoice->amount,
                'status' => $invoice->status->value,
                'statusLabel' => $invoice->status->label(),
                'issuedAt' => $invoice->issued_at->toDateString(),
                'downloadAvailable' => $invoice->pdf_path !== null
                    && Storage::disk('local')->exists($invoice->pdf_path),
            ]);

        return Inertia::render('Cooperative/Billing/Index', [
            'subscription' => $subscription === null ? null : [
                'id' => $subscription->id,
                'planTier' => $subscription->plan_tier->value,
                'planName' => $subscription->plan_tier->label(),
                'pendingPlanTier' => $subscription->pending_plan_tier?->value,
                'pendingPlanName' => $subscription->pending_plan_tier?->label(),
                'pricePerMonth' => (float) $subscription->price_per_month,
                'status' => $subscription->status->value,
                'statusLabel' => $subscription->status->label(),
                'renewalDate' => $subscription->current_period_end->toDateString(),
                'memberLimit' => $subscription->member_limit,
                'memberCount' => $memberCount,
                'paymentMethod' => [
                    'type' => $subscription->payment_method_type,
                    'lastFour' => $subscription->payment_method_last_four,
                ],
            ],
            'invoices' => $invoices,
            'plans' => collect(PlanTier::cases())->map(fn (PlanTier $plan): array => [
                'tier' => $plan->value,
                'name' => $plan->label(),
                'pricePerMonth' => $plan->monthlyPrice(),
                'memberLimit' => $plan->memberLimit(),
            ])->all(),
        ]);
    }

    public function updatePlan(
        UpdateSubscriptionPlanRequest $request,
        Subscription $subscription,
    ): RedirectResponse {
        $plan = $request->planTier();

        if ($subscription->plan_tier === $plan) {
            return back()->with('error', 'This is already your current plan.');
        }

        $subscription->update(['pending_plan_tier' => $plan]);

        return back()->with(
            'success',
            $plan->label().' will take effect on '.$subscription->current_period_end->toFormattedDateString().'.',
        );
    }

    public function updatePaymentMethod(
        UpdatePaymentMethodRequest $request,
        Subscription $subscription,
    ): RedirectResponse {
        // TODO: wire to the selected payment provider API before accepting real payment credentials.
        $subscription->update([
            'payment_method_type' => $request->validated('type'),
            'payment_method_last_four' => $request->validated('last_four'),
        ]);

        return back()->with('success', 'Mock payment method updated.');
    }

    public function downloadInvoice(Invoice $invoice): StreamedResponse
    {
        $this->authorize('view', $invoice);

        abort_unless(
            $invoice->pdf_path !== null && Storage::disk('local')->exists($invoice->pdf_path),
            404,
        );

        return Storage::disk('local')->download(
            $invoice->pdf_path,
            'invoice-'.$invoice->issued_at->format('Y-m-d').'.pdf',
        );
    }
}
