<?php

namespace App\Providers;

use App\Models\CooperativeMember;
use App\Models\Invoice;
use App\Models\Report;
use App\Models\Subscription;
use App\Policies\CooperativeMemberPolicy;
use App\Policies\InvoicePolicy;
use App\Policies\ReportPolicy;
use App\Policies\SubscriptionPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * @var array<class-string, class-string>
     */
    protected $policies = [
        CooperativeMember::class => CooperativeMemberPolicy::class,
        Invoice::class => InvoicePolicy::class,
        Report::class => ReportPolicy::class,
        Subscription::class => SubscriptionPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();
    }
}
