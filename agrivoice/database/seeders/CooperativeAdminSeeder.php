<?php

namespace Database\Seeders;

use App\Enums\CooperativeAdminRole;
use App\Models\Cooperative;
use App\Models\CooperativeAdmin;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Local/dev helper — not called by DatabaseSeeder.
 */
class CooperativeAdminSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(CooperativeSeeder::class);

        $cooperative = Cooperative::query()->where('name', 'Oromia Coffee Growers')->firstOrFail();

        $owner = User::factory()->create([
            'name' => 'Cooperative Owner',
            'email' => 'coop-owner@example.com',
        ]);

        CooperativeAdmin::query()->updateOrCreate(
            ['user_id' => $owner->id],
            [
                'cooperative_id' => $cooperative->id,
                'role' => CooperativeAdminRole::Owner,
            ],
        );
    }
}
