<?php

namespace App\Http\Resources;

use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Transforms a Report model into the shape consumed by the live report list.
 *
 * Matches the ReportRowData TypeScript interface in resources/js/types/agrivoice.ts.
 * The front-end destructures this directly — any field rename here must be
 * mirrored in the TypeScript type.
 *
 * Key field mapping decisions:
 * - 'market' sends the slug string ("adama"), not the numeric ID, because
 *   the front-end uses slugs for filter URLs and display labels
 * - 'source' carries reporter_type ("official" or "crowd") — this is the
 *   agreed contract with the live list, even though the column name differs
 * - 'agentName' is denormalised (flattened from the agent relationship)
 *   because the list never needs the full agent object
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
            // The front-end displays "source" as the reporter type label
            // ("Official" / "Crowd"). The field name "source" was chosen
            // because it's what a viewer cares about when judging a price.
            'source' => $report->reporter_type->value,
            'agentName' => $report->agent?->name
                ?? $report->cooperativeMember?->displayName()
                ?? 'Unknown',
            'isFlagged' => $report->is_flagged,
            'createdAt' => $report->created_at?->toIso8601String(),
        ];
    }
}
