<?php

namespace App\Http\Requests;

use App\Enums\Crop;
use App\Enums\MarketSlug;
use App\Enums\ReporterType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreReportRequest extends FormRequest
{
    /**
     * The oldest observation an agent can still report, so a mistyped year
     * cannot drag a market's history back by decades.
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
                // Tomorrow rather than today: the app clock runs in UTC while
                // agents report in Ethiopian local time, which is UTC+3.
                'before_or_equal:'.now()->addDay()->toDateString(),
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'crop.required' => 'Pick a crop.',
            'crop.in' => 'This showcase only tracks teff and coffee.',
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

    protected function prepareForValidation(): void
    {
        $price = $this->input('price');

        if (is_string($price)) {
            // Agents type "8,500" out of habit; that is a number, not an error.
            $this->merge(['price' => str_replace([',', ' '], '', $price)]);
        }
    }
}
