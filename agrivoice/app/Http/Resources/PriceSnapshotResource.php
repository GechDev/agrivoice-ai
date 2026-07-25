<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Serialises a computed price snapshot for the dashboard.
 *
 * The resource wraps a raw array from SnapshotService (not an Eloquent
 * model), hence the @property-read annotation for IDE support.
 *
 * The shape matches the PriceSnapshot TypeScript interface. The front-end
 * renders one PriceCard per snapshot — the resource normalises the data
 * so the component doesn't need null-coalescing for missing fields.
 */
class PriceSnapshotResource extends JsonResource
{
    /**
     * @property-read array{
     *     crop: string,
     *     market: string,
     *     price: float,
     *     confidence: int,
     *     reportCount: int,
     *     lastUpdated: string|null,
     *     trend: string,
     *     changePercent: float|null
     * } $resource
     */

    /**
     * Transform the resource into an array.
     *
     * Explicit casts ensure the front-end receives consistent types
     * regardless of what SnapshotService returns (e.g. price could
     * come as a string from the DB; this forces it to float).
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var array<string, mixed> $snapshot */
        $snapshot = $this->resource;

        return [
            'crop' => $snapshot['crop'],
            'market' => $snapshot['market'],
            'price' => (float) $snapshot['price'],
            'confidence' => (int) $snapshot['confidence'],
            'reportCount' => (int) $snapshot['reportCount'],
            'lastUpdated' => $snapshot['lastUpdated'],
            'trend' => $snapshot['trend'],
            'changePercent' => $snapshot['changePercent'],
        ];
    }
}
