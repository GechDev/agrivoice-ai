<?php

/**
 * CORS is locked to explicit app origins — never `*`.
 *
 * Paths use `*` so HandleCors runs on every route (Inertia pages, portal,
 * cooperative, health, storage signatures, and any future api/*).
 * Origins stay allowlisted; unknown Origin headers are not reflected.
 */
$configured = array_values(array_unique(array_filter([
    ...array_map(
        static fn (string $origin): string => rtrim($origin, '/'),
        array_filter([
            env('APP_URL'),
            env('FRONTEND_URL'),
        ]),
    ),
    ...array_map(
        static fn (string $origin): string => rtrim($origin, '/'),
        array_filter(array_map(
            'trim',
            explode(',', (string) env('CORS_ALLOWED_ORIGINS', '')),
        )),
    ),
])));

// Local loopbacks so Vite / artisan hosts (localhost vs 127.0.0.1) both work.
$localOrigins = [];
if (env('APP_ENV', 'production') !== 'production') {
    $localOrigins = [
        'http://127.0.0.1:8000',
        'http://localhost:8000',
        'http://127.0.0.1:5173',
        'http://localhost:5173',
    ];

    foreach ($configured as $origin) {
        $parts = parse_url($origin);
        if (! is_array($parts) || empty($parts['scheme']) || empty($parts['host'])) {
            continue;
        }

        $port = isset($parts['port']) ? ':'.$parts['port'] : '';
        $scheme = $parts['scheme'];

        foreach (['127.0.0.1', 'localhost'] as $host) {
            $localOrigins[] = "{$scheme}://{$host}{$port}";
        }
    }
}

$origins = array_values(array_unique(array_filter(
    [...$configured, ...$localOrigins],
    static fn (string $origin): bool => $origin !== '*',
)));

return [

    /*
    | Apply CORS on every path. Credentials stay on; origins stay explicit.
    */
    'paths' => ['*'],

    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    'allowed_origins' => $origins,

    'allowed_origins_patterns' => [],

    'allowed_headers' => [
        'Accept',
        'Authorization',
        'Content-Type',
        'X-Requested-With',
        'X-CSRF-TOKEN',
        'X-XSRF-TOKEN',
        'X-Inertia',
        'X-Inertia-Version',
        'X-Socket-ID',
    ],

    'exposed_headers' => [
        'X-Inertia',
        'X-Inertia-Location',
        'X-Request-Id',
    ],

    'max_age' => 3600,

    'supports_credentials' => (bool) env('CORS_SUPPORTS_CREDENTIALS', true),

];
