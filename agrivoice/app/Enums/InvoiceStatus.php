<?php

namespace App\Enums;

use App\Concerns\HasEnumValues;

enum InvoiceStatus: string
{
    use HasEnumValues;

    case Paid = 'paid';
    case Due = 'due';
    case Overdue = 'overdue';

    public function label(): string
    {
        return match ($this) {
            self::Paid => 'Paid',
            self::Due => 'Due',
            self::Overdue => 'Overdue',
        };
    }
}
