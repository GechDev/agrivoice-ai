<?php

namespace App\Http\Requests;

use App\Enums\Crop;
use App\Enums\MarketSlug;
use App\Enums\ReportStatus;
use App\Models\Report;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

class CooperativeReportFilterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('viewAny', Report::class) ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'crop' => ['nullable', 'string', Rule::in(Crop::values())],
            'market' => ['nullable', 'string', Rule::in(MarketSlug::values())],
            'status' => ['nullable', 'string', Rule::in(ReportStatus::values())],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
        ];
    }

    /**
     * @return array{
     *     crop: string|null,
     *     market: string|null,
     *     status: string|null,
     *     from: string|null,
     *     to: string|null
     * }
     */
    public function filters(): array
    {
        $validated = $this->validated();

        return [
            'crop' => $validated['crop'] ?? null,
            'market' => $validated['market'] ?? null,
            'status' => $validated['status'] ?? null,
            'from' => isset($validated['from'])
                ? Carbon::parse($validated['from'])->toDateString()
                : null,
            'to' => isset($validated['to'])
                ? Carbon::parse($validated['to'])->toDateString()
                : null,
        ];
    }
}
