<?php

namespace App\Models;

use App\Enums\CooperativeAdminRole;
use Database\Factories\CooperativeAdminFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $cooperative_id
 * @property int $user_id
 * @property CooperativeAdminRole $role
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Cooperative $cooperative
 * @property-read User $user
 */
class CooperativeAdmin extends Model
{
    /** @use HasFactory<CooperativeAdminFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'cooperative_id',
        'user_id',
        'role',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'role' => CooperativeAdminRole::class,
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
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
