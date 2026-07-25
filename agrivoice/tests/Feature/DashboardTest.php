<?php

use App\Models\Market;
use App\Models\User;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    Market::factory()->adama()->create();
    Market::factory()->addisAbaba()->create();
    Market::factory()->jimma()->create();

    $user = User::factory()->create();
    $this->actingAs($user);

    $this->get(route('dashboard'))->assertOk();
});
