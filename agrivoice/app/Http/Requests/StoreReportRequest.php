<?php

namespace App\Http\Requests;

use App\Enums\Crop;
use App\Enums\MarketSlug;
use App\Enums\ReporterType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Validates the data-entry form for a new price report.
 *
 * This is the contract between the portal form and the backend.
 * Every field is required; there are no optional overrides.
 *
 * Key design decisions:
 * - crop/market validated against enum values (not database lookups)
 *   to fail fast with clear messages before hitting the DB
 * - price strips commas/spaces in prepareForValidation() because
 *   Ethiopian agents type "8,500" as habit
 * - reported_at uses "tomorrow" as the upper bound (not today) to
 *   account for the UTC+3 timezone difference between the app server
 *   and Ethiopian local time
 * - The oldest reportable date is 365 days back, preventing accidental
 *   year-mistype outliers from contaminating historical data
 */
class StoreReportRequest extends FormRequest
{
    /**
     * Maximum age of a backdated report in days.
     * Prevents a mistyped year (e.g. 2020 instead of 2024) from
     * injecting false historical data.
     */
    private const MAX_AGE_IN_DAYS = 365;

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'crop' => ['required', Rule::in(Crop::values())],
            'market' => ['required', Rule::in(MarketSlug::values())],
            'price' => ['required', 'numeric', 'gt:0', 'lt:100000'],
            'reporter_type' => ['required', Rule::in(ReporterType::values())],
            'reported_at' => [
                'required',
                'date',
                'after_or_equal:'.now()->subDays(self::MAX_AGE_IN_DAYS)->toDateString(),
                // Upper bound is "tomorrow" not "today" because the app clock
                // runs in UTC while agents report in Ethiopian time (UTC+3).
                // At 10 PM Ethiopian time it's only 7 PM UTC — "today" in UTC
                // would reject a same-day report entered in the evening.
                'before_or_equal:'.now()->addDay()->toDateString(),
            ],
        ];
    }

    /**
     * Plain-language error messages for non-technical field agents.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'crop.required' => 'Pick a crop.',
            'crop.in' => 'Pick one of: teff, coffee, maize, wheat, sesame, pulses, or sorghum.',
            'market.required' => 'Pick a market.',
            'market.in' => 'This showcase only tracks Adama, Addis Ababa and Jimma.',
            'reporter_type.in' => 'A price is either an official quote or a crowd report.',
            'price.required' => 'Enter the price the farmer was offered.',
            'price.numeric' => 'Enter the price as a number, in ETB per quintal.',
            'price.gt' => 'The price has to be greater than 0.',
            'price.lt' => 'That price looks too high for one quintal — please re-check it.',
            'reporter_type.required' => 'Say where this price came from.',
            'reported_at.required' => 'When was this price observed?',
            'reported_at.after_or_equal' => 'That date is too far in the past to be useful.',
            'reported_at.before_or_equal' => 'A price cannot be reported for a future date.',
        ];
    }

    /**
     * Strip commas and spaces from the price before validation.
     *
     * Ethiopian agents type "8,500" out of habit (thousands separator).
     * This converts it to "8500" so the numeric validation passes.
     * Without this, every price entry would fail with "not a number."
     */
    protected function prepareForValidation(): void
    {
        $price = $this->input('price');

        if (is_string($price)) {
            $this->merge(['price' => str_replace([',', ' '], '', $price)]);
        }
    }
}
