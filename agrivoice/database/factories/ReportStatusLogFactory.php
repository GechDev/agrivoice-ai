<?php

namespace Database\Factories;

use App\Enums\ReportStatus;
use App\Models\Report;
use App\Models\ReportStatusLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ReportStatusLog>
 */
class ReportStatusLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'report_id' => Report::factory(),
            'changed_by' => User::factory(),
            'old_status' => ReportStatus::Pending,
            'new_status' => ReportStatus::Verified,
            'reason' => null,
            'created_at' => now(),
        ];
    }

    public function disputed(): static
    {
        return $this->state(fn (): array => [
            'old_status' => ReportStatus::Pending,
            'new_status' => ReportStatus::Disputed,
            'reason' => fake()->sentence(),
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn (): array => [
            'old_status' => ReportStatus::Pending,
            'new_status' => ReportStatus::Rejected,
            'reason' => fake()->sentence(),
        ]);
    }
}
