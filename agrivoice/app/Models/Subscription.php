<?php

namespace App\Models;

use App\Enums\PlanTier;
use App\Enums\SubscriptionStatus;
use Database\Factories\SubscriptionFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $cooperative_id
 * @property PlanTier $plan_tier
 * @property PlanTier|null $pending_plan_tier
 * @property string $price_per_month
 * @property int $member_limit
 * @property SubscriptionStatus $status
 * @property Carbon $current_period_end
 * @property string|null $payment_method_type
 * @property string|null $payment_method_last_four
 * @property-read Cooperative $cooperative
 */
class Subscription extends Model
{
    /** @use HasFactory<SubscriptionFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'cooperative_id',
        'plan_tier',
        'pending_plan_tier',
        'price_per_month',
        'member_limit',
        'status',
        'current_period_end',
        'payment_method_type',
        'payment_method_last_four',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'plan_tier' => PlanTier::class,
            'pending_plan_tier' => PlanTier::class,
            'price_per_month' => 'decimal:2',
            'member_limit' => 'integer',
            'status' => SubscriptionStatus::class,
            'current_period_end' => 'date',
        ];
    }

    /**
     * @return BelongsTo<Cooperative, $this>
     */
    public function cooperative(): BelongsTo
    {
        return $this->belongsTo(Cooperative::class);
    }

    /**
     * @param  Builder<Subscription>  $query
     * @return Builder<Subscription>
     */
    public function scopeForCooperative(Builder $query, int $cooperativeId): Builder
    {
        return $query->where('cooperative_id', $cooperativeId);
    }
}
