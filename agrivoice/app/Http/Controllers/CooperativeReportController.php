<?php

namespace App\Http\Controllers;

use App\Actions\ChangeReportStatus;
use App\Http\Requests\CooperativeReportFilterRequest;
use App\Http\Requests\UpdateReportStatusRequest;
use App\Models\Report;
use App\Models\User;
use App\Services\CooperativeReportsService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CooperativeReportController extends CooperativeController
{
    public function __construct(private CooperativeReportsService $reports) {}

    public function index(CooperativeReportFilterRequest $request): Response
    {
        $this->authorize('viewAny', Report::class);

        return Inertia::render(
            'Cooperative/Reports/Index',
            $this->reports->pagePayload(
                $this->cooperative($request),
                $request->filters(),
            ),
        );
    }

    public function export(CooperativeReportFilterRequest $request): StreamedResponse
    {
        $this->authorize('viewAny', Report::class);

        return $this->reports->exportCsv(
            $this->cooperative($request),
            $request->filters(),
        );
    }

    public function updateStatus(
        UpdateReportStatusRequest $request,
        Report $report,
        ChangeReportStatus $changeReportStatus,
    ): RedirectResponse {
        $this->authorize('update', $report);

        /** @var User $user */
        $user = $request->user();

        $changeReportStatus->handle(
            $report,
            $request->status(),
            $request->reason(),
            $user,
        );

        return back()->with('success', 'Report status updated.');
    }
}
