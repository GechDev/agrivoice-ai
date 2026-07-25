<?php

namespace Database\Seeders;

use App\Enums\Crop;
use App\Enums\ReporterType;
use App\Enums\ReportStatus;
use App\Models\Market;
use App\Models\Report;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\LazyCollection;
use RuntimeException;

/**
 * Imports wholesale ETB staple prices from the WFP Ethiopia VAM CSV.
 *
 * The CSV lives at database/data/wfp_food_prices_eth.csv so re-seeding
 * does not depend on a local Downloads path. Only rows that map to
 * AgriVoice markets and Crop enum cases are imported.
 *
 * Run: php artisan db:seed --class=WfpFoodPricesSeeder
 *
 * Re-running deletes previous rows with source=wfp_food_prices first,
 * so the import stays idempotent without duplicating history.
 */
class WfpFoodPricesSeeder extends Seeder
{
    public const SOURCE = 'wfp_food_prices';

    private const CHUNK_SIZE = 500;

    /**
     * Override in tests to point at a small fixture CSV.
     */
    public string $csvPath = '';

    /**
     * WFP market names → AgriVoice market slugs.
     *
     * Nazareth is the historical name for Adama in older WFP series.
     *
     * @var array<string, string>
     */
    private const MARKET_SLUGS = [
        'Addis Ababa' => 'addis_ababa',
        'Jimma' => 'jimma',
        'Nazareth' => 'adama',
    ];

    /**
     * WFP commodity labels → Crop enum values.
     *
     * Processed goods (flour) and food-aid variants are omitted.
     *
     * @var array<string, string>
     */
    private const COMMODITY_CROPS = [
        'Maize (white)' => 'maize',
        'Maize (yellow)' => 'maize',
        'Wheat' => 'wheat',
        'Wheat (white)' => 'wheat',
        'Wheat (mixed)' => 'wheat',
        'Sorghum' => 'sorghum',
        'Sorghum (white)' => 'sorghum',
        'Sorghum (red)' => 'sorghum',
        'Sorghum (mixed)' => 'sorghum',
        'Teff' => 'teff',
        'Teff (white)' => 'teff',
        'Teff (mixed)' => 'teff',
        'Teff (Sergegna)' => 'teff',
        'Teff (red)' => 'teff',
        'Coffee' => 'coffee',
        'Sesame' => 'sesame',
        'Beans (fava)' => 'pulses',
        'Beans (haricot)' => 'pulses',
        'Beans' => 'pulses',
        'Beans (fava, dry)' => 'pulses',
        'Beans (kidney)' => 'pulses',
        'Beans (haricot, white)' => 'pulses',
        'Beans (haricot, red)' => 'pulses',
        'Beans (mung)' => 'pulses',
        'Lentils' => 'pulses',
        'Chickpeas' => 'pulses',
        'Soybeans' => 'pulses',
    ];

    public function run(): void
    {
        $this->call(MarketSeeder::class);

        $path = $this->resolvedCsvPath();

        if (! is_readable($path)) {
            throw new RuntimeException("WFP food prices CSV is not readable at [{$path}].");
        }

        /** @var array<string, int> $marketIds */
        $marketIds = Market::query()->pluck('id', 'slug')->all();

        Report::query()->where('source', self::SOURCE)->delete();

        $now = now()->toDateTimeString();
        $buffer = [];
        $imported = 0;

        LazyCollection::make(function () use ($path) {
            $handle = fopen($path, 'r');

            if ($handle === false) {
                throw new RuntimeException("Unable to open WFP food prices CSV at [{$path}].");
            }

            try {
                $headers = fgetcsv($handle);

                if ($headers === false) {
                    return;
                }

                while (($row = fgetcsv($handle)) !== false) {
                    if ($row === [null] || $row === []) {
                        continue;
                    }

                    yield array_combine($headers, $row);
                }
            } finally {
                fclose($handle);
            }
        })
            ->filter(fn (array $row): bool => $this->shouldImport($row))
            ->each(function (array $row) use (&$buffer, &$imported, $marketIds, $now): void {
                $buffer[] = $this->mapRow($row, $marketIds, $now);

                if (count($buffer) >= self::CHUNK_SIZE) {
                    Report::query()->insert($buffer);
                    $imported += count($buffer);
                    $buffer = [];
                }
            });

        if ($buffer !== []) {
            Report::query()->insert($buffer);
            $imported += count($buffer);
        }

        if ($this->command !== null) {
            $this->command->info("Imported {$imported} WFP wholesale price reports.");
        }
    }

    public function resolvedCsvPath(): string
    {
        if ($this->csvPath !== '') {
            return $this->csvPath;
        }

        return database_path('data/wfp_food_prices_eth.csv');
    }

    /**
     * @param  array<string, string|null>  $row
     */
    private function shouldImport(array $row): bool
    {
        $market = $row['market'] ?? null;
        $commodity = $row['commodity'] ?? null;
        $unit = $row['unit'] ?? null;
        $currency = $row['currency'] ?? null;
        $priceFlag = $row['priceflag'] ?? '';
        $priceType = $row['pricetype'] ?? null;

        if ($market === null || ! isset(self::MARKET_SLUGS[$market])) {
            return false;
        }

        if ($commodity === null || ! isset(self::COMMODITY_CROPS[$commodity])) {
            return false;
        }

        if ($currency !== 'ETB' || $priceType !== 'Wholesale') {
            return false;
        }

        if (! in_array($unit, ['100 KG', 'KG'], true)) {
            return false;
        }

        if (! str_contains((string) $priceFlag, 'actual')) {
            return false;
        }

        $price = $this->pricePerQuintal($row);

        return $price !== null && $price > 0;
    }

    /**
     * @param  array<string, string|null>  $row
     * @param  array<string, int>  $marketIds
     * @return array{
     *     crop: string,
     *     market_id: int,
     *     price: string,
     *     reporter_type: string,
     *     source: string,
     *     agent_id: null,
     *     cooperative_member_id: null,
     *     reported_at: string,
     *     is_flagged: bool,
     *     status: string,
     *     created_at: string,
     *     updated_at: string
     * }
     */
    private function mapRow(array $row, array $marketIds, string $now): array
    {
        $marketSlug = self::MARKET_SLUGS[$row['market']];
        $crop = self::COMMODITY_CROPS[$row['commodity']];
        $price = $this->pricePerQuintal($row);

        return [
            'crop' => Crop::from($crop)->value,
            'market_id' => $marketIds[$marketSlug],
            'price' => number_format($price, 2, '.', ''),
            'reporter_type' => ReporterType::Official->value,
            'source' => self::SOURCE,
            'agent_id' => null,
            'cooperative_member_id' => null,
            'reported_at' => Carbon::parse($row['date'])->startOfDay()->toDateTimeString(),
            'is_flagged' => false,
            'status' => ReportStatus::Verified->value,
            'created_at' => $now,
            'updated_at' => $now,
        ];
    }

    /**
     * Convert WFP unit prices to ETB per quintal (100 KG).
     *
     * @param  array<string, string|null>  $row
     */
    private function pricePerQuintal(array $row): ?float
    {
        $raw = $row['price'] ?? null;

        if ($raw === null || $raw === '' || ! is_numeric($raw)) {
            return null;
        }

        $price = (float) $raw;

        return match ($row['unit'] ?? null) {
            '100 KG' => round($price, 2),
            'KG' => round($price * 100, 2),
            default => null,
        };
    }
}
