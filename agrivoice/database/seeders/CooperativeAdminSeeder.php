<?php

namespace Database\Seeders;

use App\Enums\CooperativeAdminRole;
use App\Models\Cooperative;
use App\Models\CooperativeAdmin;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Local/dev helper — prefer CooperativeDemoSeeder via DatabaseSeeder.
 * Kept in sync with CooperativeDemoSeeder credentials for ad-hoc seeding.
 */
class CooperativeAdminSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(CooperativeSeeder::class);

        $cooperative = Cooperative::query()->where('name', 'Oromia Coffee Growers')->firstOrFail();

        $owner = User::query()->updateOrCreate(
            ['email' => CooperativeDemoSeeder::OWNER_EMAIL],
            [
                'name' => 'Cooperative Owner',
                'password' => Hash::make(CooperativeDemoSeeder::OWNER_PASSWORD),
                'email_verified_at' => now(),
            ],
        );

        CooperativeAdmin::query()->updateOrCreate(
            ['user_id' => $owner->id],
            [
                'cooperative_id' => $cooperative->id,
                'role' => CooperativeAdminRole::Owner,
            ],
        );
    }
}
