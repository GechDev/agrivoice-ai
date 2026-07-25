<?php

namespace App\Enums;

use App\Concerns\HasEnumValues;

enum ReportStatus: string
{
    use HasEnumValues;

    case Pending = 'pending';
    case Verified = 'verified';
    case Disputed = 'disputed';
    case Rejected = 'rejected';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pending',
            self::Verified => 'Verified',
            self::Disputed => 'Disputed',
            self::Rejected => 'Rejected',
        };
    }
}
