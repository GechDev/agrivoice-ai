<?php

use App\Models\Market;
use App\Models\User;

test('guests can visit the public live dashboard', function () {
    Market::factory()->adama()->create();
    Market::factory()->addisAbaba()->create();
    Market::factory()->jimma()->create();

    $this->get(route('dashboard'))->assertOk();
});

test('authenticated users can visit the dashboard', function () {
    Market::factory()->adama()->create();
    Market::factory()->addisAbaba()->create();
    Market::factory()->jimma()->create();

    $user = User::factory()->create();
    $this->actingAs($user);

    $this->get(route('dashboard'))->assertOk();
});
