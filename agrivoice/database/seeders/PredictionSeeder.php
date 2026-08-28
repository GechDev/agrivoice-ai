<?php

namespace Database\Seeders;

use App\Enums\Crop;
use App\Enums\Trend;
use App\Models\Market;
use App\Models\Prediction;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

/**
 * Local/dev helper — not called by DatabaseSeeder.
 */
class PredictionSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(MarketSeeder::class);

        $markets = Market::query()->get();

        if ($markets->isEmpty()) {
            return;
        }

        foreach (Crop::cases() as $crop) {
            foreach ($markets as $market) {
                for ($daysAhead = 0; $daysAhead <= 30; $daysAhead++) {
                    $date = Carbon::today()->addDays($daysAhead);

                    Prediction::query()->updateOrCreate(
                        [
                            'crop' => $crop,
                            'market_id' => $market->id,
                            'predicted_for' => $date->toDateString(),
                        ],
                        [
                            'predicted_price' => fake()->numberBetween(9_000, 18_000),
                            'trend' => fake()->randomElement(Trend::cases()),
                            'confidence_score' => fake()->numberBetween(50, 90),
                            'generated_at' => now()->subHour(),
                        ],
                    );
                }
            }
        }
    }
}
