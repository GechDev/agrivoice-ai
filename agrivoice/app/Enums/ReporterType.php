<?php

namespace App\Enums;

use App\Concerns\HasEnumValues;

enum ReporterType: string
{
    use HasEnumValues;

    case Official = 'official';
    case Crowd = 'crowd';

    public function label(): string
    {
        return match ($this) {
            self::Official => 'Official',
            self::Crowd => 'Crowd',
        };
    }
}
