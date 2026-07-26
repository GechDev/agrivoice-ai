<?php

use App\Models\CooperativeAdmin;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Support\Facades\RateLimiter;
use Laravel\Fortify\Features;

test('login screen can be rendered', function () {
    $response = $this->get(route('login'));

    $response->assertOk();
});

test('users can authenticate using the login screen', function () {
    $user = User::factory()->create();

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
});

test('cooperative admins without a plan are redirected to onboarding after fortify login', function () {
    $admin = CooperativeAdmin::factory()->owner()->create();

    $response = $this->post(route('login.store'), [
        'email' => $admin->user->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticatedAs($admin->user);
    $response->assertRedirect(route('cooperative.onboarding'));
});

test('cooperative admins with a plan are redirected to the cooperative dashboard after fortify login', function () {
    $admin = CooperativeAdmin::factory()->owner()->create();
    Subscription::factory()->starter()->create([
        'cooperative_id' => $admin->cooperative_id,
    ]);

    $response = $this->post(route('login.store'), [
        'email' => $admin->user->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticatedAs($admin->user);
    $response->assertRedirect(route('cooperative.dashboard'));
});

test('users with two factor enabled are redirected to two factor challenge', function () {
    $this->skipUnlessFortifyHas(Features::twoFactorAuthentication());

    Features::twoFactorAuthentication([
        'confirm' => true,
        'confirmPassword' => true,
    ]);

    $user = User::factory()->withTwoFactor()->create();

    $response = $this->post(route('login'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response->assertRedirect(route('two-factor.login'));
    $response->assertSessionHas('login.id', $user->id);
    $this->assertGuest();
});

test('users can not authenticate with invalid password', function () {
    $user = User::factory()->create();

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $this->assertGuest();
});

test('users can logout', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('logout'));

    $response->assertRedirect(route('home'));

    $this->assertGuest();
});

test('users are rate limited', function () {
    $user = User::factory()->create();

    RateLimiter::increment(md5('login'.implode('|', [$user->email, '127.0.0.1'])), amount: 5);

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $response->assertTooManyRequests();
});
