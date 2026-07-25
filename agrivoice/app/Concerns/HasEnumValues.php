<?php

namespace App\Concerns;

trait HasEnumValues
{
    /**
     * The backing values, for validation rules and option lists.
     *
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
