<?php

namespace App\Enums;

use App\Concerns\HasEnumValues;

enum SubscriptionStatus: string
{
    use HasEnumValues;

    case Active = 'active';
    case PastDue = 'past_due';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Active => 'Active',
            self::PastDue => 'Past due',
            self::Cancelled => 'Cancelled',
        };
    }
}
