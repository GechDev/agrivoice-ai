<?php

namespace Database\Factories;

use App\Enums\InvoiceStatus;
use App\Models\Cooperative;
use App\Models\Invoice;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Invoice>
 */
class InvoiceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'cooperative_id' => Cooperative::factory(),
            'amount' => fake()->randomElement([2500, 6000, 12000]),
            'status' => InvoiceStatus::Paid,
            'issued_at' => fake()->dateTimeBetween('-1 year', 'now'),
            'pdf_path' => null,
        ];
    }

    public function overdue(): static
    {
        return $this->state(fn (): array => [
            'status' => InvoiceStatus::Overdue,
        ]);
    }

    public function due(): static
    {
        return $this->state(fn (): array => [
            'status' => InvoiceStatus::Due,
        ]);
    }
}
