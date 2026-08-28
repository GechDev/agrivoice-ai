<?php

namespace App\Http\Requests;

use App\Enums\Crop;
use App\Enums\MarketSlug;
use App\Enums\Trend;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PriceIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'crop' => ['nullable', Rule::in(Crop::values())],
            'market' => ['nullable', Rule::in(MarketSlug::values())],
            'trend' => ['nullable', Rule::in(array_column(Trend::cases(), 'value'))],
            'sort' => ['nullable', Rule::in(['crop', 'market', 'price', 'change', 'confidence', 'updated'])],
            'direction' => ['nullable', Rule::in(['asc', 'desc'])],
            'chart_crop' => ['nullable', Rule::in(Crop::values())],
            'chart_market' => ['nullable', Rule::in(MarketSlug::values())],
        ];
    }
}
