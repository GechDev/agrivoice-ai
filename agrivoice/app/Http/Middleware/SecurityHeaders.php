<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Symfony\Component\HttpFoundation\Response;

/**
 * Baseline browser security headers for every web response.
 *
 * Charts (Recharts), shadcn/Radix UI, and Leaflet marker assets are npm-
 * bundled — they never call a public API. The only third-party origins
 * allowed here are fonts (Bunny) and map tiles (OpenStreetMap).
 *
 * IMPORTANT: CSP host sources must use exact ports (e.g. :5173). Port
 * wildcards like `http://127.0.0.1:*` are rejected by Chromium/Electron
 * and silently drop the source — which blocks Vite CSS/JS and leaves
 * the page looking like raw unstyled HTML.
 */
class SecurityHeaders
{
    /**
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set(
            'Permissions-Policy',
            'camera=(), microphone=(), geolocation=(), payment=()',
        );
        $response->headers->set('Content-Security-Policy', $this->contentSecurityPolicy());

        if ($request->isSecure() || app()->isProduction()) {
            $response->headers->set(
                'Strict-Transport-Security',
                'max-age=31536000; includeSubDomains',
            );
        }

        return $response;
    }

    /**
     * Allow only first-party app code plus the known UI asset origins.
     */
    private function contentSecurityPolicy(): string
    {
        $connectSrc = ["'self'"];
        $scriptSrc = ["'self'", "'unsafe-inline'"];
        $styleSrc = ["'self'", "'unsafe-inline'", 'https://fonts.bunny.net'];
        $fontSrc = ["'self'", 'data:', 'https://fonts.bunny.net'];

        if (! app()->isProduction()) {
            $viteOrigins = $this->viteOrigins();
            $viteSockets = array_map(
                static fn (string $origin): string => preg_replace('/^http/', 'ws', $origin) ?? $origin,
                $viteOrigins,
            );

            $connectSrc = array_values(array_unique([
                "'self'",
                ...$viteOrigins,
                ...$viteSockets,
            ]));
            $scriptSrc = array_values(array_unique([
                ...$scriptSrc,
                ...$viteOrigins,
                "'unsafe-eval'",
            ]));
            $styleSrc = array_values(array_unique([
                ...$styleSrc,
                ...$viteOrigins,
            ]));
            $fontSrc = array_values(array_unique([
                ...$fontSrc,
                ...$viteOrigins,
            ]));
        }

        return implode('; ', [
            "default-src 'self'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'self'",
            "object-src 'none'",
            "img-src 'self' data: blob: https://*.tile.openstreetmap.org https://tile.openstreetmap.org",
            'font-src '.implode(' ', $fontSrc),
            'style-src '.implode(' ', $styleSrc),
            'script-src '.implode(' ', $scriptSrc),
            'connect-src '.implode(' ', $connectSrc),
        ]);
    }

    /**
     * Exact Vite origins — never use port wildcards.
     *
     * @return list<string>
     */
    private function viteOrigins(): array
    {
        $origins = [
            'http://127.0.0.1:5173',
            'http://localhost:5173',
            'http://[::1]:5173',
        ];

        $hotPath = public_path('hot');

        if (File::exists($hotPath)) {
            $hot = trim((string) File::get($hotPath));

            if (filter_var($hot, FILTER_VALIDATE_URL)) {
                $parts = parse_url($hot);
                $scheme = $parts['scheme'] ?? 'http';
                $host = $parts['host'] ?? '127.0.0.1';
                $port = $parts['port'] ?? ($scheme === 'https' ? 443 : 80);
                $authority = str_contains($host, ':')
                    ? "[{$host}]:{$port}"
                    : "{$host}:{$port}";

                $origins[] = "{$scheme}://{$authority}";
            }
        }

        return array_values(array_unique($origins));
    }
}
