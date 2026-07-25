<?php

namespace App\Http\Resources;

use App\Models\Market;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Market
 */
class MarketResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'slug' => $this->slug->value,
            'name' => $this->name,
            'region' => $this->region,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
        ];
    }
}
