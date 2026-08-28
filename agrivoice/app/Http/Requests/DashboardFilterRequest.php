<?php

namespace App\Http\Requests;

use App\Enums\MarketSlug;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Validates the optional market location filter on the public dashboard.
 *
 * Guests and signed-in users both use this page, so authorization is open.
 * An empty/missing market means "all markets".
 */
class DashboardFilterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'market' => ['nullable', 'string', Rule::in(MarketSlug::values())],
        ];
    }

    public function market(): ?MarketSlug
    {
        $market = $this->validated('market');

        if (! is_string($market) || $market === '') {
            return null;
        }

        return MarketSlug::from($market);
    }
}
