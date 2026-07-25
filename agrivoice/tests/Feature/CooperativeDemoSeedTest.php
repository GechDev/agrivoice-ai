<?php

use App\Models\Cooperative;
use App\Models\CooperativeAdmin;
use App\Models\CooperativeMember;
use App\Models\Invoice;
use App\Models\Report;
use App\Models\Subscription;
use App\Models\User;
use Database\Seeders\CooperativeDemoSeeder;
use Database\Seeders\DatabaseSeeder;

test('database seeder produces a usable cooperative demo login', function () {
    $this->seed(DatabaseSeeder::class);

    $owner = User::query()->where('email', CooperativeDemoSeeder::OWNER_EMAIL)->first();
    expect($owner)->not->toBeNull();

    expect(CooperativeAdmin::query()->where('user_id', $owner->id)->exists())->toBeTrue();
    expect(Cooperative::query()->where('name', 'Oromia Coffee Growers')->exists())->toBeTrue();
    expect(CooperativeMember::query()->count())->toBeGreaterThan(0);
    expect(Report::query()->whereNotNull('cooperative_member_id')->count())->toBeGreaterThan(0);
    expect(Subscription::query()->count())->toBeGreaterThan(0);
    expect(Invoice::query()->count())->toBeGreaterThan(0);

    $this->post(route('cooperative.login.store'), [
        'email' => CooperativeDemoSeeder::OWNER_EMAIL,
        'password' => CooperativeDemoSeeder::OWNER_PASSWORD,
    ])->assertRedirect(route('cooperative.dashboard'));

    $this->assertAuthenticatedAs($owner);
});
