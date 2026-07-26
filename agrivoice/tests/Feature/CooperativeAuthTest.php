<?php

use App\Models\Cooperative;
use App\Models\CooperativeAdmin;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->withoutVite();
});

test('cooperative login page renders for guests', function () {
    $this->get(route('cooperative.login'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Cooperative/auth/login'));
});

test('cooperative register page renders for guests', function () {
    $this->get(route('cooperative.register'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Cooperative/auth/register')
            ->has('passwordRules'));
});

test('cooperative admin can sign in and reach the cooperative dashboard', function () {
    $user = User::factory()->create([
        'email' => 'owner@gmail.com',
        'password' => Hash::make('password'),
        'email_verified_at' => now(),
    ]);
    $cooperative = Cooperative::factory()->create();
    CooperativeAdmin::factory()->owner()->create([
        'cooperative_id' => $cooperative->id,
        'user_id' => $user->id,
    ]);
    Subscription::factory()->create([
        'cooperative_id' => $cooperative->id,
    ]);

    $this->post(route('cooperative.login.store'), [
        'email' => 'owner@gmail.com',
        'password' => 'password',
    ])->assertRedirect(route('cooperative.dashboard'));

    $this->assertAuthenticatedAs($user);
});

test('non-admin users cannot use the cooperative login', function () {
    User::factory()->create([
        'email' => 'farmer@gmail.com',
        'password' => Hash::make('password'),
    ]);

    $this->from(route('cooperative.login'))
        ->post(route('cooperative.login.store'), [
            'email' => 'farmer@gmail.com',
            'password' => 'password',
        ])
        ->assertRedirect(route('cooperative.login'))
        ->assertSessionHasErrors('email');

    $this->assertGuest();
});

test('cooperative signup creates an owner and continues to plan onboarding', function () {
    $this->post(route('cooperative.register.store'), [
        'name' => 'Abebe Bekele',
        'email' => 'abebe.coop@gmail.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'cooperative_name' => 'Jimma Growers Union',
        'region' => 'Oromia',
    ])->assertRedirect(route('cooperative.onboarding'));

    $user = User::query()->where('email', 'abebe.coop@gmail.com')->first();
    expect($user)->not->toBeNull();
    $this->assertAuthenticatedAs($user);

    $cooperative = Cooperative::query()->where('name', 'Jimma Growers Union')->first();
    expect($cooperative)->not->toBeNull();
    expect(CooperativeAdmin::query()->where('user_id', $user->id)->exists())->toBeTrue();
    expect(Subscription::query()->forCooperative($cooperative->id)->exists())->toBeFalse();
});

test('cooperative admin can log out back to the cooperative login', function () {
    $user = User::factory()->create([
        'email' => 'owner@gmail.com',
        'password' => Hash::make('password'),
        'email_verified_at' => now(),
    ]);
    $cooperative = Cooperative::factory()->create();
    CooperativeAdmin::factory()->owner()->create([
        'cooperative_id' => $cooperative->id,
        'user_id' => $user->id,
    ]);

    $this->actingAs($user)
        ->post(route('cooperative.logout'))
        ->assertRedirect(route('cooperative.login'));

    $this->assertGuest();
});

test('cooperative signup rejects non-gmail emails', function () {
    $this->from(route('cooperative.register'))
        ->post(route('cooperative.register.store'), [
            'name' => 'Abebe Bekele',
            'email' => 'abebe@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'cooperative_name' => 'Jimma Growers Union',
            'region' => 'Oromia',
        ])
        ->assertRedirect(route('cooperative.register'))
        ->assertSessionHasErrors('email');

    $this->assertGuest();
});
