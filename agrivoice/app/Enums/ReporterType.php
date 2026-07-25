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

    /**
     * Relative weight when averaging prices (official above crowd).
     */
    public function weight(): float
    {
        return match ($this) {
            self::Official => 1.5,
            self::Crowd => 1.0,
        };
    }
}
