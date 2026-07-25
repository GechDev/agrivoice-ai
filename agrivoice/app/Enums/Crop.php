<?php

namespace App\Enums;

use App\Concerns\HasEnumValues;

enum Crop: string
{
    use HasEnumValues;

    case Teff = 'teff';
    case Coffee = 'coffee';

    public function label(): string
    {
        return match ($this) {
            self::Teff => 'Teff',
            self::Coffee => 'Coffee',
        };
    }
}
