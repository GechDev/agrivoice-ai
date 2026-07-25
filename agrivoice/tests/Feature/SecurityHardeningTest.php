<?php

use App\Models\Agent;
use App\Models\Report;
use Database\Seeders\MarketSeeder;
use Illuminate\Http\Middleware\HandleCors;

beforeEach(function (): void {
    $this->withoutVite();
});

test('there is no public api route file registered', function () {
    expect(file_exists(base_path('routes/api.php')))->toBeFalse();
});

test('sensitive pages require authentication', function (string $uri) {
    $this->get($uri)->assertRedirect(route('login'));
})->with([
    '/cooperative/dashboard',
    '/cooperative/members',
    '/cooperative/reports',
    '/cooperative/prices',
    '/cooperative/billing',
]);

test('public showcase pages are reachable without authentication', function (string $uri) {
    if ($uri === '/dashboard') {
        $this->seed(MarketSeeder::class);
    }

    $this->get($uri)->assertOk();
})->with([
    '/dashboard',
    '/reports',
    '/report-price',
    '/portal/login',
    '/cooperative/login',
]);

test('agent report writes are rejected without an agent session', function () {
    $this->post(route('reports.store'), [
        'crop' => 'teff',
        'market' => 'adama',
        'price' => '5000',
        'reporter_type' => 'crowd',
        'reported_at' => now()->toDateString(),
    ])->assertRedirect(route('portal.login'));
});

test('private storage uploads require a signed url', function () {
    $this->call('PUT', '/storage/invoices/secret.pdf', content: 'not-allowed')
        ->assertForbidden();
});

test('security headers are present on web responses', function () {
    $response = $this->get(route('home'))
        ->assertOk()
        ->assertHeader('X-Frame-Options', 'SAMEORIGIN')
        ->assertHeader('X-Content-Type-Options', 'nosniff')
        ->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    $csp = (string) $response->headers->get('Content-Security-Policy');

    expect($csp)
        ->toContain("default-src 'self'")
        ->toContain('https://fonts.bunny.net')
        ->toContain('tile.openstreetmap.org')
        ->not->toContain('default-src *')
        ->not->toContain('connect-src *')
        ->not->toContain('script-src *');
});

test('local development csp allows vite asset origins with exact ports', function () {
    expect(app()->environment())->not->toBe('production');

    $csp = (string) $this->get(route('home'))
        ->assertOk()
        ->headers
        ->get('Content-Security-Policy');

    expect($csp)
        ->toContain('http://127.0.0.1:5173')
        ->toContain('http://localhost:5173')
        ->toContain('ws://127.0.0.1:5173')
        ->not->toContain('http://127.0.0.1:*')
        ->not->toContain('http://localhost:*');
});

test('cors never uses a wildcard origin', function () {
    $origins = config('cors.allowed_origins');

    expect($origins)->toBeArray()
        ->and($origins)->not->toContain('*')
        ->and(config('cors.supports_credentials'))->toBeTrue()
        ->and(config('cors.paths'))->toContain('*');
});

test('cors allows configured origins on any path preflight', function () {
    HandleCors::flushState();

    config([
        'cors.paths' => ['*'],
        'cors.allowed_origins' => ['https://app.example'],
        'cors.supports_credentials' => true,
    ]);

    $this->withHeaders([
        'Origin' => 'https://app.example',
        'Access-Control-Request-Method' => 'GET',
        'Access-Control-Request-Headers' => 'Content-Type, X-Inertia',
    ])->options('/reports')
        ->assertSuccessful()
        ->assertHeader('Access-Control-Allow-Origin', 'https://app.example')
        ->assertHeader('Access-Control-Allow-Credentials', 'true');
});

test('cors does not reflect unknown origins on web preflight', function () {
    HandleCors::flushState();

    config([
        'cors.paths' => ['*'],
        'cors.allowed_origins' => ['https://app.example', 'https://admin.example'],
        'cors.supports_credentials' => true,
    ]);

    $response = $this->withHeaders([
        'Origin' => 'https://evil.example',
        'Access-Control-Request-Method' => 'GET',
    ])->options('/dashboard');

    expect($response->headers->get('Access-Control-Allow-Origin'))
        ->toBeNull();
});

test('cors headers are applied on normal web responses for allowed origins', function () {
    HandleCors::flushState();

    config([
        'cors.paths' => ['*'],
        'cors.allowed_origins' => ['https://app.example'],
        'cors.supports_credentials' => true,
    ]);

    $this->withHeaders([
        'Origin' => 'https://app.example',
    ])->get(route('home'))
        ->assertOk()
        ->assertHeader('Access-Control-Allow-Origin', 'https://app.example')
        ->assertHeader('Access-Control-Allow-Credentials', 'true');
});

test('public report submissions are rate limited', function () {
    $this->seed(MarketSeeder::class);

    Agent::query()->firstOrCreate(
        ['name' => 'Public Submission'],
        ['pin' => '0000'],
    );

    $payload = [
        'crop' => 'teff',
        'market' => 'adama',
        'price' => '8500',
        'reported_at' => now()->toDateString(),
    ];

    for ($i = 0; $i < 10; $i++) {
        $this->post(route('report-price.store'), $payload)->assertRedirect();
    }

    $this->post(route('report-price.store'), $payload)->assertStatus(429);

    expect(Report::count())->toBe(10);
});
