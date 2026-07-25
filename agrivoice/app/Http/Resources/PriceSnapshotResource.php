<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

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
class PriceSnapshotResource extends JsonResource
{
    /**
     * Transform the resource into an array.
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
