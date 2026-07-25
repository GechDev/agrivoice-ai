<?php

namespace Database\Seeders;

use App\Enums\Crop;
use App\Models\Cooperative;
use App\Models\CooperativeMember;
use App\Models\Market;
use App\Models\MemberQuery;
use Illuminate\Database\Seeder;

/**
 * Local/dev helper — not called by DatabaseSeeder.
 */
class MemberQuerySeeder extends Seeder
{
    public function run(): void
    {
        $this->call([MarketSeeder::class, CooperativeMemberSeeder::class]);

        $cooperative = Cooperative::query()->where('name', 'Oromia Coffee Growers')->firstOrFail();
        $members = CooperativeMember::query()->forCooperative($cooperative->id)->notRemoved()->get();
        $markets = Market::query()->get();

        if ($members->isEmpty() || $markets->isEmpty()) {
            return;
        }

        MemberQuery::factory()
            ->count(20)
            ->recycle($members)
            ->create([
                'crop' => Crop::Coffee,
                'market_id' => $markets->random()->id,
            ]);
    }
}
