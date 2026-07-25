<?php

namespace App\Http\Controllers;

use App\Actions\FlagReport;
use App\Http\Resources\ReportResource;
use App\Models\Report;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
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

    /**
     * Flag an outlier so Tsegaye's SnapshotService excludes it.
     */
    public function flag(Report $report, FlagReport $flagReport): RedirectResponse
    {
        $flagReport->handle($report);

        return back();
    }
}
