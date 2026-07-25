<?php

namespace App\Support;

/**
 * Canonical Ethiopian mobile numbers: +251 followed by 9 digits starting with 9 or 7.
 */
final readonly class EthiopianPhoneNumber
{
    private const PATTERN = '/^\+251[97]\d{8}$/';

    private function __construct(public string $value) {}

    /**
     * Accept 09XXXXXXXX, 07XXXXXXXX, +2519XXXXXXXX, +2517XXXXXXXX (spaces/hyphens ignored).
     */
    public static function tryFrom(string $input): ?self
    {
        $normalized = self::normalize($input);

        if ($normalized === null) {
            return null;
        }

        return new self($normalized);
    }

    public static function isCanonical(string $value): bool
    {
        return preg_match(self::PATTERN, $value) === 1;
    }

    public function __toString(): string
    {
        return $this->value;
    }

    private static function normalize(string $input): ?string
    {
        $cleaned = preg_replace('/[\s\-]+/', '', $input);

        if (! is_string($cleaned) || $cleaned === '') {
            return null;
        }

        if (preg_match('/^0([97]\d{8})$/', $cleaned, $matches) === 1) {
            return '+251'.$matches[1];
        }

        if (preg_match('/^\+251([97]\d{8})$/', $cleaned, $matches) === 1) {
            return '+251'.$matches[1];
        }

        return null;
    }
}
