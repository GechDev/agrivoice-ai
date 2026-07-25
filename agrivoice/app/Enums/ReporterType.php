<?php

namespace App\Enums;

enum ReporterType: string
{
    case Official = 'official';
    case Crowd = 'crowd';

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
