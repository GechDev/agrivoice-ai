<?php

namespace App\Enums;

enum Trend: string
{
    case Up = 'up';
    case Down = 'down';
    case Stable = 'stable';
}
