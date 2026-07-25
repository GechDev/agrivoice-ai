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
        /** @var Report $report */
        $report = $this->resource;

        return [
            'id' => $report->id,
            'crop' => $report->crop->value,
            'market' => $report->market->slug->value,
            'price' => (float) $report->price,
            'reportedAt' => $report->reported_at->toIso8601String(),
            // The feed calls this "source": it is the kind of reporter behind
            // the price, which is what a viewer needs to judge it.
            'source' => $report->reporter_type->value,
            'agentName' => $report->agent->name,
            'isFlagged' => $report->is_flagged,
            'createdAt' => $report->created_at?->toIso8601String(),
        ];
    }
}
