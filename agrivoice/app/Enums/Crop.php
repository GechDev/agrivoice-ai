<?php

namespace App\Enums;

enum Crop: string
{
    case Teff = 'teff';
    case Coffee = 'coffee';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
