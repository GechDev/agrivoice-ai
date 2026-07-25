<?php

namespace App\Providers;

use App\Services\AgentSession;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

/**
 * Central service configuration for AgriVoice.
 *
 * Registers the AgentSession binding and configures framework defaults
 * for production safety and consistent date handling.
 */
class AppServiceProvider extends ServiceProvider
{
    /**
     * Register application services.
     */
    public function register(): void
    {
        // AgentSession is registered as 'scoped' — meaning one instance
        // per request lifecycle, shared between middleware and controllers.
        // Without scoped, each new() call would create a fresh instance,
        // losing the agent identity that the middleware stored. With
        // 'singleton', the instance would leak across requests in
        // long-running processes (Octane/Swoole). 'scoped' is the safe
        // middle ground: shared within a request, fresh for each request.
        $this->app->scoped(AgentSession::class);
    }

    /**
     * Bootstrap application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
    }

    /**
     * Configure framework defaults for production readiness.
     */
    protected function configureDefaults(): void
    {
        // Use immutable Carbon dates throughout the app. This prevents
        // accidental mutation of shared date instances (e.g. calling
        // ->addDay() on a shared "now" variable would mutate it for
        // all subsequent code). Immutable is the safe default.
        Date::use(CarbonImmutable::class);

        // Prevent accidental DROP TABLE / TRUNCATE in production.
        // Only affects artisan migrate:fresh and similar commands.
        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        // Password rules: relaxed in development (any password works),
        // strict in production (12+ chars, mixed case, symbols, etc.).
        // The agent PIN system doesn't use Fortify passwords — this
        // only applies to the admin/settings auth.
        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
