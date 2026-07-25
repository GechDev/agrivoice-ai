<?php

namespace App\Services;

use App\Models\Agent;
use App\Models\Market;
use App\Models\Report;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\Date;

class ReportEntryService
{
    /**
     * Marks rows an agent typed into the portal, as opposed to the seeded
     * reference rows that came from WFP/ECX price sheets.
     */
    public const PORTAL_SOURCE = 'agent_portal';

    /**
     * Turn a validated entry-form payload into an attributed report.
     *
     * @param  array<string, mixed>  $data
     */
    public function record(array $data, Agent $agent): Report
    {
        $market = Market::where('slug', $data['market'])->firstOrFail();

        return Report::create([
            'crop' => $data['crop'],
            'market_id' => $market->id,
            'price' => $data['price'],
            'reporter_type' => $data['reporter_type'],
            'source' => self::PORTAL_SOURCE,
            // Identity comes from the session; a form field would be forgeable.
            'agent_id' => $agent->id,
            'reported_at' => $this->resolveReportedAt((string) $data['reported_at']),
            'is_flagged' => false,
        ]);
    }

    /**
     * A date input carries no time. For a same-day report keep the real clock
     * time, so recency weighting can still order a burst of entries.
     */
    private function resolveReportedAt(string $reportedAt): CarbonInterface
    {
        $observedOn = Date::parse($reportedAt);

        return $observedOn->isToday() ? Date::now() : $observedOn->startOfDay();
    }
}
