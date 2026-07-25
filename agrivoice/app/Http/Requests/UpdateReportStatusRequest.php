<?php

namespace App\Http\Requests;

use App\Enums\ReportStatus;
use App\Models\Report;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateReportStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        $report = $this->route('report');

        return $report instanceof Report
            && ($this->user()?->can('update', $report) ?? false);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'status' => ['required', 'string', Rule::in(ReportStatus::values())],
            'reason' => [
                Rule::requiredIf(fn (): bool => in_array(
                    $this->input('status'),
                    [ReportStatus::Disputed->value, ReportStatus::Rejected->value],
                    true,
                )),
                'nullable',
                'string',
                'max:1000',
            ],
        ];
    }

    /**
     * @return array<int, callable(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                $report = $this->route('report');

                if (! $report instanceof Report) {
                    return;
                }

                $status = ReportStatus::tryFrom((string) $this->input('status'));

                if ($status !== null && $status === $report->status) {
                    $validator->errors()->add('status', 'The report already has this status.');
                }
            },
        ];
    }

    public function status(): ReportStatus
    {
        return ReportStatus::from((string) $this->validated('status'));
    }

    public function reason(): ?string
    {
        $reason = $this->validated('reason');

        return is_string($reason) && $reason !== '' ? $reason : null;
    }
}
