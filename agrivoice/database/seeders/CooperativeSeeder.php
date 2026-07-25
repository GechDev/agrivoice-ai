<?php

namespace Database\Seeders;

use App\Enums\Crop;
use App\Models\Cooperative;
use Illuminate\Database\Seeder;

/**
 * Local/dev helper — not called by DatabaseSeeder.
 */
class CooperativeSeeder extends Seeder
{
    public function run(): void
    {
        Cooperative::query()->updateOrCreate(
            ['name' => 'Oromia Coffee Growers'],
            [
                'region' => 'Oromia',
                'default_crops' => [Crop::Coffee->value, Crop::Teff->value],
            ],
        );

        Cooperative::query()->updateOrCreate(
            ['name' => 'Adama Teff Union'],
            [
                'region' => 'Oromia',
                'default_crops' => [Crop::Teff->value],
            ],
        );
    }
}
