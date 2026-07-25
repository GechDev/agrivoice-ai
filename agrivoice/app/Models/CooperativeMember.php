<?php

namespace App\Models;

use App\Enums\CooperativeMemberStatus;
use Database\Factories\CooperativeMemberFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $cooperative_id
 * @property int|null $farmer_id
 * @property string|null $name
 * @property string $phone_number
 * @property CooperativeMemberStatus $status
 * @property Carbon|null $joined_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Cooperative $cooperative
 * @property-read User|null $farmer
 * @property-read Collection<int, MemberQuery> $queries
 * @property-read Collection<int, Report> $reports
 * @property-read int|null $queries_count
 * @property-read int|null $reports_count
 * @property-read Carbon|string|null $reports_max_reported_at
 * @property-read Carbon|string|null $queries_max_queried_at
 */
class CooperativeMember extends Model
{
    /** @use HasFactory<CooperativeMemberFactory> */
    use HasFactory;

    /**
     * @var array<string, mixed>
     */
    protected $attributes = [
        'status' => 'invited',
    ];

    /**
     * @var list<string>
     */
    protected $fillable = [
        'cooperative_id',
        'farmer_id',
        'name',
        'phone_number',
        'status',
        'joined_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => CooperativeMemberStatus::class,
            'joined_at' => 'datetime',
        ];
    }

    /**
     * Display name: invited name, then linked farmer, then a default label.
     */
    public function displayName(): string
    {
        if (filled($this->name)) {
            return (string) $this->name;
        }

        if ($this->farmer !== null && filled($this->farmer->name)) {
            return $this->farmer->name;
        }

        return 'Invited member';
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
    public function farmer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'farmer_id');
    }

    /**
     * @return HasMany<MemberQuery, $this>
     */
    public function queries(): HasMany
    {
        return $this->hasMany(MemberQuery::class);
    }

    /**
     * @return HasMany<Report, $this>
     */
    public function reports(): HasMany
    {
        return $this->hasMany(Report::class);
    }

    /**
     * @param  Builder<CooperativeMember>  $query
     * @return Builder<CooperativeMember>
     */
    public function scopeForCooperative(Builder $query, int $id): Builder
    {
        return $query->where('cooperative_id', $id);
    }

    /**
     * @param  Builder<CooperativeMember>  $query
     * @return Builder<CooperativeMember>
     */
    public function scopeNotRemoved(Builder $query): Builder
    {
        return $query->where('status', '!=', CooperativeMemberStatus::Removed);
    }
}
