<?php

namespace App\Enums;

use App\Concerns\HasEnumValues;

enum MarketSlug: string
{
    use HasEnumValues;

    case Adama = 'adama';
    case AddisAbaba = 'addis_ababa';
    case Jimma = 'jimma';

    public function label(): string
    {
        return match ($this) {
            self::Adama => 'Adama',
            self::AddisAbaba => 'Addis Ababa',
            self::Jimma => 'Jimma',
        };
    }

    public function region(): string
    {
        return match ($this) {
            self::Adama, self::Jimma => 'Oromia',
            self::AddisAbaba => 'Addis Ababa',
        };
    }

    /**
     * @return array{latitude: float, longitude: float}
     */
    public function coordinates(): array
    {
        return match ($this) {
            self::Adama => ['latitude' => 8.5400, 'longitude' => 39.2675],
            self::AddisAbaba => ['latitude' => 9.0300, 'longitude' => 38.7400],
            self::Jimma => ['latitude' => 7.6733, 'longitude' => 36.8344],
        };
    }
}
