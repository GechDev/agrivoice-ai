<?php

namespace App\Enums;

use App\Concerns\HasEnumValues;

enum CooperativeAdminRole: string
{
    use HasEnumValues;

    case Owner = 'owner';
    case Staff = 'staff';

    public function label(): string
    {
        return match ($this) {
            self::Owner => 'Owner',
            self::Staff => 'Staff',
        };
    }
}
