<?php

namespace Database\Factories;

use App\Enums\Crop;
use App\Enums\ReporterType;
use App\Enums\ReportStatus;
use App\Models\Agent;
use App\Models\CooperativeMember;
use App\Models\Market;
use App\Models\Report;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Report>
 */
class ReportFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'crop' => fake()->randomElement(Crop::cases()),
            'market_id' => Market::factory(),
            'price' => fake()->numberBetween(8_000, 20_000),
            'reporter_type' => fake()->randomElement(ReporterType::cases()),
            'source' => fake()->optional()->randomElement(['wfp', 'ecx', 'farmer', 'user']),
            'agent_id' => Agent::factory(),
            'cooperative_member_id' => null,
            'reported_at' => fake()->dateTimeBetween('-14 days', 'now'),
            'is_flagged' => false,
            'status' => ReportStatus::Verified,
        ];
    }

    public function flagged(): static
    {
        return $this->state(fn () => ['is_flagged' => true]);
    }

    public function official(): static
    {
        return $this->state(fn () => ['reporter_type' => ReporterType::Official]);
    }

    public function crowd(): static
    {
        return $this->state(fn () => ['reporter_type' => ReporterType::Crowd]);
    }

    public function teff(): static
    {
        return $this->state(fn () => ['crop' => Crop::Teff]);
    }

    public function coffee(): static
    {
        return $this->state(fn () => ['crop' => Crop::Coffee]);
    }

    public function maize(): static
    {
        return $this->state(fn () => ['crop' => Crop::Maize]);
    }

    public function wheat(): static
    {
        return $this->state(fn () => ['crop' => Crop::Wheat]);
    }

    public function sesame(): static
    {
        return $this->state(fn () => ['crop' => Crop::Sesame]);
    }

    public function pulses(): static
    {
        return $this->state(fn () => ['crop' => Crop::Pulses]);
    }

    public function sorghum(): static
    {
        return $this->state(fn () => ['crop' => Crop::Sorghum]);
    }

    public function pending(): static
    {
        return $this->state(fn () => ['status' => ReportStatus::Pending]);
    }

    public function verified(): static
    {
        return $this->state(fn () => ['status' => ReportStatus::Verified]);
    }

    public function disputed(): static
    {
        return $this->state(fn () => ['status' => ReportStatus::Disputed]);
    }

    public function rejected(): static
    {
        return $this->state(fn () => ['status' => ReportStatus::Rejected]);
    }

    public function fromMember(CooperativeMember $member): static
    {
        return $this->state(fn (): array => [
            'cooperative_member_id' => $member->id,
            'agent_id' => null,
            'reporter_type' => ReporterType::Crowd,
            'source' => 'cooperative_member',
        ]);
    }
}
