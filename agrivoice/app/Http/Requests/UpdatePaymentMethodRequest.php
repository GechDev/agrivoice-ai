<?php

namespace App\Http\Requests;

use App\Models\Subscription;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePaymentMethodRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $subscription = $this->route('subscription');

        return $subscription instanceof Subscription
            && ($this->user()?->can('update', $subscription) ?? false);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'type' => ['required', 'string', Rule::in(['Telebirr', 'Bank transfer', 'Chapa test'])],
            'last_four' => ['required', 'digits:4'],
        ];
    }
}
