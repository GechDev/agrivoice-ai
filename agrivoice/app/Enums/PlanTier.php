<?php

namespace App\Enums;

use App\Concerns\HasEnumValues;

enum PlanTier: string
{
    use HasEnumValues;

    case Starter = 'starter';
    case Growth = 'growth';
    case Scale = 'scale';

    public function label(): string
    {
        return match ($this) {
            self::Starter => 'Starter',
            self::Growth => 'Growth',
            self::Scale => 'Scale',
        };
    }

    public function monthlyPrice(): int
    {
        return match ($this) {
            self::Starter => 2500,
            self::Growth => 6000,
            self::Scale => 12000,
        };
    }

    public function memberLimit(): int
    {
        return match ($this) {
            self::Starter => 100,
            self::Growth => 500,
            self::Scale => 2000,
        };
    }
}
