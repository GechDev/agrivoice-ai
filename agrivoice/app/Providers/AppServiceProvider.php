<?php

namespace App\Providers;

use App\Services\AgentSession;
use Carbon\CarbonImmutable;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\DevCommands;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
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
        $this->configureRateLimiting();
        $this->configureDevCommands();
    }

    /**
     * Keep Laravel + Vite on the same IPv4 loopback host so asset URLs
     * never split between localhost (::1) and 127.0.0.1.
     */
    protected function configureDevCommands(): void
    {
        DevCommands::artisan('serve --host=127.0.0.1 --port=8000', 'server');
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

        // Force HTTPS URLs in production so cookies, signed links, and
        // redirects never leak http:// behind a TLS-terminating proxy.
        if ($this->app->isProduction()) {
            URL::forceScheme('https');

            // Secure cookies when unset — deployers can still override via .env.
            if (config('session.secure') === null) {
                config(['session.secure' => true]);
            }
        }

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

    /**
     * Named rate limiters for public and guest write endpoints.
     */
    protected function configureRateLimiting(): void
    {
        RateLimiter::for('public-report', function (Request $request) {
            return Limit::perMinute(10)->by($request->ip());
        });

        RateLimiter::for('cooperative-login', function (Request $request) {
            $email = Str::lower((string) $request->input('email'));

            return Limit::perMinute(5)->by($email.'|'.$request->ip());
        });

        RateLimiter::for('cooperative-register', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip());
        });
    }
}
