<?php

namespace App\Services;

use App\Models\Agent;
use App\Models\Market;
use App\Models\Report;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\Date;

/**
 * Converts a validated entry-form payload into a persisted Report.
 *
 * This service is the ONLY place where Report::create() happens for
 * portal-submitted data. It handles three critical concerns:
 *
 * 1. ATTRIBUTION: agent_id comes from the AgentSession, never from
 *    the form. This prevents a malicious agent from impersonating
 *    another by adding a hidden "agent_id" field to the HTML.
 *
 * 2. SOURCE TAGGING: Every portal report is stamped with
 *    source = "agent_portal" so we can distinguish crowd data from
 *    seeded reference data (source = null or "wfp"/"ecx") in
 *    downstream analytics.
 *
 * 3. DATE RESOLUTION: The form collects a date string (no time).
 *    Same-day reports get the current clock time so a burst of
 *    entries during a demo still sorts by recency. Backdated reports
 *    get start-of-day (midnight) to avoid false recency.
 */
class ReportEntryService
{
    /**
     * Source tag for portal-submitted reports.
     * Distinguishes crowd-entered data from seeded reference data.
     */
    public const PORTAL_SOURCE = 'agent_portal';

    /**
     * Create a Report from validated form data.
     *
     * The $data array is already validated by StoreReportRequest:
     * - crop: Crop enum value
     * - market: MarketSlug string (resolved to FK via slug lookup)
     * - price: numeric, > 0, < 100000
     * - reporter_type: ReporterType enum value
     * - reported_at: date string within the last year, not future
     *
     * @param  array<string, mixed>  $data  Validated form payload
     * @param  Agent  $agent  Authenticated agent from the session
     */
    public function record(array $data, Agent $agent): Report
    {
        // Resolve the market slug to a database ID.
        // The form sends the slug string ("adama"), not the numeric ID,
        // because slugs are stable and human-readable.
        $market = Market::where('slug', $data['market'])->firstOrFail();

        return Report::create([
            'crop' => $data['crop'],
            'market_id' => $market->id,
            'price' => $data['price'],
            'reporter_type' => $data['reporter_type'],
            'source' => self::PORTAL_SOURCE,
            // agent_id comes from the session — NOT from the form.
            // Even if a tampered form includes an "agent_id" field,
            // StoreReportRequest strips it and we use the real identity.
            'agent_id' => $agent->id,
            'reported_at' => $this->resolveReportedAt((string) $data['reported_at']),
            'is_flagged' => false,
        ]);
    }

    /**
     * Resolve a date-only string into a full timestamp.
     *
     * The form only collects a date (no time component). We need a
     * full datetime for the reported_at column, but we have to decide
     * what time to use:
     *
     * - SAME DAY (today): Use the current clock time. This preserves
     *   recency ordering so a burst of entries during a live demo
     *   still shows the most recent one first. Without this, all
     *   same-day entries would sort identically.
     *
     * - BACKDATED (before today): Use midnight (start of day). This
     *   avoids giving old reports false recency — a report from 3
     *   days ago shouldn't appear "brand new" just because we don't
     *   know the exact time.
     */
    private function resolveReportedAt(string $reportedAt): CarbonInterface
    {
        $observedOn = Date::parse($reportedAt);

        return $observedOn->isToday() ? Date::now() : $observedOn->startOfDay();
    }
}
