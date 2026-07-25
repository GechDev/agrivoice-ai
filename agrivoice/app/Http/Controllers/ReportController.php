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
 * Reports are where the crowd data enters the system. Entry (create/store)
 * belongs to the data-entry portal; the public feed and moderation actions
 * (index/flag) belong to the live-list slice.
 */
class ReportController extends Controller
{
    /**
     * How many of the agent's own entries the portal shows back to them.
     */
    private const RECENT_ENTRY_LIMIT = 8;

    /**
     * Live data list — newest reports with agent attribution.
     */
    public function index(): Response
    {
        $reports = Report::query()
            ->with(['agent', 'market'])
            ->latest('reported_at')
            ->latest('id')
            ->limit(50)
            ->get();

        return Inertia::render('reports', [
            'reports' => ReportResource::collection($reports)->resolve(),
        ]);
    }

    public function create(AgentSession $agentSession): Response
    {
        $agent = $agentSession->agentOrFail();

        return Inertia::render('portal/entry', [
            'agent' => [
                'id' => $agent->id,
                'name' => $agent->name,
            ],
            // resolve() so the props are plain arrays rather than a wrapped
            // resource envelope the React side would have to unwrap.
            'markets' => MarketResource::collection(Market::orderBy('name')->get())->resolve(),
            'recentReports' => ReportResource::collection($this->recentEntriesFor($agent))->resolve(),
            'entriesToday' => $agent->reports()->whereDate('created_at', today())->count(),
        ]);
    }

    public function store(
        StoreReportRequest $request,
        AgentSession $agentSession,
        ReportEntryService $reportEntry,
    ): RedirectResponse {
        $reportEntry->record($request->validated(), $agentSession->agentOrFail());

        // Back to the form, which re-reads the agent's entries with the new row
        // on top and leaves them ready to type the next price.
        return redirect()->route('portal.entry');
    }

    /**
     * Flag an outlier so SnapshotService excludes it from aggregates.
     */
    public function flag(Report $report, FlagReport $flagReport): RedirectResponse
    {
        $flagReport->handle($report);

        return back();
    }

    /**
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
