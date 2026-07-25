<?php

namespace App\Rules;

use App\Support\EthiopianPhoneNumber;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Translation\PotentiallyTranslatedString;

class EthiopianMobileNumber implements ValidationRule
{
    /**
     * @param  Closure(string, ?string=): PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) || ! EthiopianPhoneNumber::isCanonical($value)) {
            $fail('Enter a valid Ethiopian mobile number (09…, 07…, or +251…).');
        }
    }
}
