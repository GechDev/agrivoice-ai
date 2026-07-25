<?php

namespace App\Http\Controllers;

use App\Actions\FlagReport;
use App\Http\Requests\StoreReportRequest;
use App\Http\Resources\MarketResource;
use App\Http\Resources\ReportResource;
use App\Models\Agent;
use App\Models\Market;
use App\Models\Report;
use App\Services\AgentSession;
use App\Services\ReportEntryService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Handles the full lifecycle of crowd-sourced price reports.
 *
 * This controller serves two distinct concerns owned by different
 * team members:
 *
 * 1. DATA-ENTRY PORTAL (Gezachew's slice):
 *    - create(): renders the entry form with the agent's recent entries
 *    - store(): persists a new report and redirects back to the form
 *
 * 2. LIVE LIST + MODERATION (Nati's slice):
 *    - index(): the live report list with newest-first ordering
 *    - flag(): marks an outlier so SnapshotService excludes it
 *
 * The create/store pair is behind the 'agent' middleware (requires
 * a signed-in agent). The live list (index) is a public showcase surface;
 * flagging remains behind auth+verified. Data is Inertia props only —
 * there is no public REST API.
 */
class ReportController extends Controller
{
    /**
     * Maximum number of the agent's own entries shown on the portal form.
     * Kept small so the form stays focused on data entry, not history.
     */
    private const RECENT_ENTRY_LIMIT = 8;

    /**
     * Live data list — newest reports with agent attribution.
     *
     * Fetches the 50 most recent reports across all crops and markets.
     * Eager-loads agent and market to avoid N+1 queries when ReportResource
     * serialises the relationships.
     *
     * Ordering: latest reported_at first, then latest id as tiebreaker
     * (two reports with the same timestamp sort by insertion order).
     *
     * The front-end polls this every 2.5s via usePoll(), so new entries
     * from the portal appear in the list within seconds.
     */
    public function index(): Response
    {
        $reports = Report::query()
            ->with(['agent', 'market', 'cooperativeMember.farmer'])
            ->latest('reported_at')
            ->latest('id')
            ->limit(50)
            ->get();

        return Inertia::render('reports', [
            'reports' => ReportResource::collection($reports)->resolve(),
            'canModerate' => auth()->check(),
        ]);
    }

    /**
     * Render the data-entry form for the authenticated agent.
     *
     * Passes three pieces of context:
     * - agent: {id, name} for the form to know who's entering data
     * - markets: reference data for the market picker (ordered alphabetically)
     * - recentReports: the agent's last 8 entries, shown as a "your recent
     *   submissions" list below the form so they can verify their work
     * - entriesToday: count of today's submissions, shown as a progress indicator
     *
     * All data is resolve()'d to plain arrays so Inertia passes them
     * directly as props without a resource wrapper.
     */
    public function create(AgentSession $agentSession): Response
    {
        $agent = $agentSession->agentOrFail();

        return Inertia::render('portal/entry', [
            'agent' => [
                'id' => $agent->id,
                'name' => $agent->name,
            ],
            'markets' => MarketResource::collection(Market::orderBy('name')->get())->resolve(),
            'recentReports' => ReportResource::collection($this->recentEntriesFor($agent))->resolve(),
            'entriesToday' => $agent->reports()->whereDate('created_at', today())->count(),
        ]);
    }

    /**
     * Persist a new price report and redirect back to the entry form.
     *
     * The redirect-back pattern means the agent can immediately enter
     * another price without a full page reload. The form re-fetches
     * recentEntries on mount, so the new report appears in the list.
     *
     * StoreReportRequest handles all validation. ReportEntryService
     * handles attribution and date resolution. This controller just
     * wires them together.
     */
    public function store(
        StoreReportRequest $request,
        AgentSession $agentSession,
        ReportEntryService $reportEntry,
    ): RedirectResponse {
        $reportEntry->record($request->validated(), $agentSession->agentOrFail());

        return redirect()->route('portal.entry');
    }

    /**
     * Flag an outlier report so it's excluded from all aggregates.
     *
     * Delegates to the FlagReport action (idempotent — flagging an
     * already-flagged report is a no-op). Redirects back to the
     * referring page, which is typically the live report list.
     */
    public function flag(Report $report, FlagReport $flagReport): RedirectResponse
    {
        $flagReport->handle($report);

        return back();
    }

    /**
     * Fetch the most recent reports submitted by a specific agent.
     *
     * Used by create() to show the agent their own recent entries on
     * the portal form. Scoped to the agent so one agent doesn't see
     * another agent's submissions in the "your recent" section.
     *
     * @return Collection<int, Report>
     */
    private function recentEntriesFor(Agent $agent): Collection
    {
        return $agent->reports()
            ->with(['market', 'agent'])
            ->latest()
            ->take(self::RECENT_ENTRY_LIMIT)
            ->get();
    }
}
