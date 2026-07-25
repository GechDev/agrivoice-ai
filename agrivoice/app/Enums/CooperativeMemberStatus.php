<?php

namespace App\Enums;

use App\Concerns\HasEnumValues;

enum CooperativeMemberStatus: string
{
    use HasEnumValues;

    case Active = 'active';
    case Invited = 'invited';
    case Removed = 'removed';

    public function label(): string
    {
        return match ($this) {
            self::Active => 'Active',
            self::Invited => 'Invited',
            self::Removed => 'Removed',
        };
    }
}
