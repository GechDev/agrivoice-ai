<?php

namespace App\Http\Resources;

use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Report
 */
class ReportResource extends JsonResource
{
    /**
     * Matches the ReportRowData type in resources/js/types/agrivoice.ts.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'crop' => $this->crop->value,
            'market' => $this->market->slug->value,
            'price' => (float) $this->price,
            'reportedAt' => $this->reported_at->toIso8601String(),
            // The feed calls this "source": it is the kind of reporter behind
            // the price, which is what a viewer needs to judge it.
            'source' => $this->reporter_type->value,
            'agentName' => $this->agent->name,
            'isFlagged' => $this->is_flagged,
            'createdAt' => $this->created_at->toIso8601String(),
        ];
    }
}
