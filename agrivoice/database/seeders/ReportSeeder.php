<?php

namespace Database\Seeders;

use App\Enums\Crop;
use App\Enums\ReporterType;
use App\Models\Agent;
use App\Models\Market;
use App\Models\Report;
use Illuminate\Database\Seeder;

class ReportSeeder extends Seeder
{
    /**
     * Seed a realistic spread of reports so the dashboard is demo-ready.
     * Shared foundation — Gezachew owns live entry; this fills the projector.
     */
    public function run(): void
    {
        $markets = Market::query()->get()->keyBy(fn (Market $m) => $m->slug->value);
        $agents = Agent::query()->get();

        if ($markets->isEmpty() || $agents->isEmpty()) {
            return;
        }

        $basePrices = [
            'teff' => [
                'adama' => 5200,
                'addis_ababa' => 5800,
                'jimma' => 4900,
            ],
            'coffee' => [
                'adama' => 8500,
                'addis_ababa' => 9200,
                'jimma' => 11000,
            ],
        ];

        foreach (Crop::cases() as $crop) {
            foreach ($markets as $slug => $market) {
                $base = $basePrices[$crop->value][$slug];

                // Spread reports over ~2 weeks so trends compute.
                for ($i = 0; $i < 8; $i++) {
                    $daysAgo = (int) round($i * 1.75);
                    $jitter = fake()->numberBetween(-400, 400);
                    // Mild upward drift for teff in Adama; downward for coffee in Jimma.
                    $drift = match (true) {
                        $crop === Crop::Teff && $slug === 'adama' => $i * 40,
                        $crop === Crop::Coffee && $slug === 'jimma' => -$i * 50,
                        default => 0,
                    };

                    Report::query()->create([
                        'crop' => $crop,
                        'market_id' => $market->id,
                        'price' => max(100, $base + $jitter + $drift),
                        'reporter_type' => $i % 3 === 0
                            ? ReporterType::Official
                            : ReporterType::Crowd,
                        'source' => $i % 3 === 0 ? 'ecx' : 'user',
                        'agent_id' => $agents->random()->id,
                        'reported_at' => now()->subDays($daysAgo)->subHours(fake()->numberBetween(0, 12)),
                        'is_flagged' => false,
                    ]);
                }
            }
        }

        // Obvious outliers for the flag-demo story (excluded once Nati flags them).
        Report::query()->create([
            'crop' => Crop::Teff,
            'market_id' => $markets['adama']->id,
            'price' => 150,
            'reporter_type' => ReporterType::Crowd,
            'source' => 'user',
            'agent_id' => $agents->first()->id,
            'reported_at' => now()->subHours(2),
            'is_flagged' => false,
        ]);

        Report::query()->create([
            'crop' => Crop::Coffee,
            'market_id' => $markets['addis_ababa']->id,
            'price' => 45000,
            'reporter_type' => ReporterType::Crowd,
            'source' => 'user',
            'agent_id' => $agents->last()->id,
            'reported_at' => now()->subHours(5),
            'is_flagged' => false,
        ]);
    }
}
