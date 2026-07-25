<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Validates the agent login form (name + PIN).
 *
 * The name is a required string; the PIN must be exactly 4 digits.
 * Actual authentication (hash check + agent lookup) happens in
 * AgentAuthController::store() — this request only ensures the
 * input is structurally valid before the database is hit.
 */
class AgentLoginRequest extends FormRequest
{
    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'pin' => ['required', 'string', 'digits:4'],
        ];
    }

    /**
     * Plain-language validation messages for the portal UI.
     *
     * These are friendlier than Laravel's default messages because
     * agents are non-technical field workers using the system on
     * tablets during live demos.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Choose which agent you are.',
            'pin.required' => 'Enter your 4-digit PIN.',
            'pin.digits' => 'The PIN is 4 digits.',
        ];
    }

    /**
     * Trim whitespace from the name before validation.
     *
     * Prevents invisible leading/trailing spaces from causing a
     * name mismatch during authentication.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'name' => trim((string) $this->input('name')),
        ]);
    }
}
