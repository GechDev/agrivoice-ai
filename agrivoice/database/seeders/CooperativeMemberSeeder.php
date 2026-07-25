<?php

namespace Database\Seeders;

use App\Enums\CooperativeMemberStatus;
use App\Models\Cooperative;
use App\Models\CooperativeMember;
use Illuminate\Database\Seeder;

/**
 * Local/dev helper — not called by DatabaseSeeder.
 */
class CooperativeMemberSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(CooperativeSeeder::class);

        $cooperative = Cooperative::query()->where('name', 'Oromia Coffee Growers')->firstOrFail();

        CooperativeMember::factory()
            ->count(5)
            ->active()
            ->recycle($cooperative)
            ->create();

        CooperativeMember::factory()
            ->count(3)
            ->invited()
            ->recycle($cooperative)
            ->create();

        CooperativeMember::factory()
            ->removed()
            ->recycle($cooperative)
            ->create([
                'status' => CooperativeMemberStatus::Removed,
            ]);
    }
}
