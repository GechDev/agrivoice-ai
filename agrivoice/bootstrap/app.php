<?php

use App\Http\Middleware\EnsureAgentIsAuthenticated;
use App\Http\Middleware\EnsureCooperativeAdmin;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\SecurityHeaders;
use App\Http\Middleware\SetLocale;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;

/**
 * Application bootstrap configuration.
 *
 * This file wires together the routing, middleware pipeline, and
 * exception handling for the entire application. It replaces the
 * kernel class from older Laravel versions.
 */
return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        // Web routes handle all browser-facing pages. API routes are
        // intentionally absent — this is an Inertia SPA, not a REST API.
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        // Health check endpoint for load balancers / container orchestration.
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Trust reverse proxies (Railway, Fly, Nginx, Cloudflare) so HTTPS
        // and client IPs are detected correctly for secure cookies / throttling.
        $middleware->trustProxies(at: '*');

        // Appearance, locale, and sidebar state are stored in non-encrypted
        // cookies so the front-end can read them without CSRF token validation.
        // Encrypting them would cause Inertia to fail on first visit.
        $middleware->encryptCookies(except: ['appearance', 'locale', 'sidebar_state']);

        // Global web middleware stack — runs on every browser request:
        // - HandleAppearance: reads the 'appearance' cookie for dark/light mode
        // - SetLocale: reads the 'locale' cookie and sets app locale
        // - HandleInertiaRequests: shares flash data, auth, and CSRF with Inertia
        // - AddLinkHeadersForPreloadedAssets: HTTP/2 preload hints for performance
        // - SecurityHeaders: baseline browser hardening for deployment
        $middleware->web(append: [
            HandleAppearance::class,
            SetLocale::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            SecurityHeaders::class,
        ]);

        // 'agent' alias for EnsureAgentIsAuthenticated middleware.
        // Used on portal routes (create, store) to require a signed-in agent.
        // The farmer live-list (reports.index) uses auth+verified instead.
        $middleware->alias([
            'agent' => EnsureAgentIsAuthenticated::class,
            'cooperative.admin' => EnsureCooperativeAdmin::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // API and AJAX requests get JSON error responses instead of HTML.
        // Inertia sends Accept: application/json on page visits, but the
        // X-Inertia header distinguishes those from pure API calls.
        // Note: there is no routes/api.php — api/* matches only if added later.
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
