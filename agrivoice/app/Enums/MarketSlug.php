<?php

namespace App\Enums;

enum MarketSlug: string
{
    case Adama = 'adama';
    case AddisAbaba = 'addis_ababa';
    case Jimma = 'jimma';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
