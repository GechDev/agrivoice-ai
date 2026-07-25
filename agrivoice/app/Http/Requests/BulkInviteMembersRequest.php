<?php

namespace App\Http\Requests;

use App\Models\CooperativeMember;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class BulkInviteMembersRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', CooperativeMember::class) ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'csv' => [
                'required',
                'file',
                'extensions:csv,txt',
                'mimes:csv,txt',
                'mimetypes:text/csv,text/plain,application/csv,application/vnd.ms-excel',
                'max:5120',
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'csv.required' => 'Upload a CSV file of members to invite.',
            'csv.mimes' => 'The upload must be a CSV file.',
            'csv.extensions' => 'The upload must be a CSV file.',
            'csv.max' => 'The CSV may not be larger than 5 MB.',
        ];
    }
}
