<?php

namespace App\Models;

use App\Enums\Crop;
use Database\Factories\MemberQueryFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $cooperative_member_id
 * @property Crop|null $crop
 * @property int|null $market_id
 * @property string|null $query_text
 * @property string $channel
 * @property Carbon $queried_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read CooperativeMember $cooperativeMember
 * @property-read Market|null $market
 */
class MemberQuery extends Model
{
    /** @use HasFactory<MemberQueryFactory> */
    use HasFactory;

    /**
     * @var array<string, mixed>
     */
    protected $attributes = [
        'channel' => 'voice',
    ];

    /**
     * @var list<string>
     */
    protected $fillable = [
        'cooperative_member_id',
        'crop',
        'market_id',
        'query_text',
        'channel',
        'queried_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'crop' => Crop::class,
            'queried_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<CooperativeMember, $this>
     */
    public function cooperativeMember(): BelongsTo
    {
        return $this->belongsTo(CooperativeMember::class);
    }

    /**
     * @return BelongsTo<Market, $this>
     */
    public function market(): BelongsTo
    {
        return $this->belongsTo(Market::class);
    }

    /**
     * @param  Builder<MemberQuery>  $query
     * @return Builder<MemberQuery>
     */
    public function scopeForCooperative(Builder $query, int $id): Builder
    {
        $membersTable = (new CooperativeMember)->getTable();

        return $query->whereIn('cooperative_member_id', function ($subquery) use ($id, $membersTable): void {
            $subquery->select('id')
                ->from($membersTable)
                ->where('cooperative_id', $id);
        });
    }
}
