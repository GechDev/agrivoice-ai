<?php

namespace App\Http\Controllers;

use App\Enums\PlanTier;
use App\Enums\SubscriptionStatus;
use App\Http\Requests\StoreCooperativeOnboardingRequest;
use App\Models\Subscription;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CooperativeOnboardingController extends CooperativeController
{
    public function create(Request $request): Response|RedirectResponse
    {
        $cooperative = $this->cooperative($request);

        if (Subscription::query()->forCooperative($cooperative->id)->exists()) {
            return redirect()->route('cooperative.dashboard');
        }

        return Inertia::render('Cooperative/Onboarding', [
            'cooperative' => [
                'name' => $cooperative->name,
                'region' => $cooperative->region,
            ],
            'plans' => $this->plans(),
        ]);
    }

    public function store(StoreCooperativeOnboardingRequest $request): RedirectResponse
    {
        $cooperative = $this->cooperative($request);
        $plan = $request->planTier();

        Subscription::query()->firstOrCreate(
            ['cooperative_id' => $cooperative->id],
            [
                'plan_tier' => $plan,
                'price_per_month' => $plan->monthlyPrice(),
                'member_limit' => $plan->memberLimit(),
                'status' => SubscriptionStatus::Active,
                'current_period_end' => now()->addMonth()->toDateString(),
            ],
        );

        return redirect()
            ->route('cooperative.dashboard')
            ->with('success', __('Your cooperative workspace is ready.'));
    }

    /**
     * @return list<array{tier: string, name: string, pricePerMonth: int, memberLimit: int}>
     */
    private function plans(): array
    {
        return collect(PlanTier::cases())
            ->map(fn (PlanTier $plan): array => [
                'tier' => $plan->value,
                'name' => $plan->label(),
                'pricePerMonth' => $plan->monthlyPrice(),
                'memberLimit' => $plan->memberLimit(),
            ])
            ->all();
    }
}
