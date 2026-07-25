<?php

namespace App\Http\Requests;

use App\Models\Cooperative;
use App\Models\CooperativeMember;
use App\Rules\EthiopianMobileNumber;
use App\Support\EthiopianPhoneNumber;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class InviteMemberRequest extends FormRequest
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
        $cooperative = $this->resolvedCooperative();

        return [
            'name' => ['nullable', 'string', 'max:255'],
            'phone_number' => [
                'required',
                'string',
                new EthiopianMobileNumber,
                Rule::unique('cooperative_members', 'phone_number')
                    ->where('cooperative_id', $cooperative->id),
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'phone_number.unique' => 'This phone number is already invited to your cooperative.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $phone = $this->input('phone_number');

        if (! is_string($phone)) {
            return;
        }

        $normalized = EthiopianPhoneNumber::tryFrom($phone);

        if ($normalized !== null) {
            $this->merge([
                'phone_number' => $normalized->value,
            ]);
        }
    }

    public function resolvedCooperative(): Cooperative
    {
        $cooperative = $this->attributes->get('cooperative');

        if (! $cooperative instanceof Cooperative) {
            abort(403);
        }

        return $cooperative;
    }
}
