<?php

namespace App\Models;

use App\Enums\Crop;
use Database\Factories\CooperativeFactory;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string $region
 * @property list<string> $default_crops
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Collection<int, CooperativeAdmin> $admins
 * @property-read Collection<int, CooperativeMember> $members
 */
class Cooperative extends Model
{
    /** @use HasFactory<CooperativeFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'region',
        'default_crops',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'default_crops' => 'array',
        ];
    }

    /**
     * @return HasMany<CooperativeAdmin, $this>
     */
    public function admins(): HasMany
    {
        return $this->hasMany(CooperativeAdmin::class);
    }

    /**
     * @return HasMany<CooperativeMember, $this>
     */
    public function members(): HasMany
    {
        return $this->hasMany(CooperativeMember::class);
    }

    /**
     * @return list<Crop>
     */
    public function defaultCropEnums(): array
    {
        return collect($this->default_crops ?? [])
            ->map(fn (string $crop): Crop => Crop::from($crop))
            ->values()
            ->all();
    }
}
