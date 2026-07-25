<?php

namespace App\Http\Resources;

use App\Models\Market;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Serialises a Market model for the entry form and dashboard map.
 *
 * Sends slug (not numeric ID) as the identifier because the front-end
 * uses slugs for URL parameters and enum lookups. Coordinates are
 * included for the Leaflet map markers on the dashboard.
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
