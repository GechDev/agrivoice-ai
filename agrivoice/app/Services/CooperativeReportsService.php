<?php

namespace App\Services;

use App\Enums\Crop;
use App\Enums\ReportStatus;
use App\Models\Cooperative;
use App\Models\Market;
use App\Models\Report;
use App\Models\ReportStatusLog;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CooperativeReportsService
{
    private const PER_PAGE = 20;

    /**
     * @param  array{
     *     crop: string|null,
     *     market: string|null,
     *     status: string|null,
     *     from: string|null,
     *     to: string|null
     * }  $filters
     * @return array{
     *     reports: LengthAwarePaginator,
     *     filters: array{
     *         crop: string|null,
     *         market: string|null,
     *         status: string|null,
     *         from: string|null,
     *         to: string|null
     *     },
     *     cropOptions: list<array{value: string, label: string}>,
     *     marketOptions: list<array{value: string, label: string}>,
     *     statusOptions: list<array{value: string, label: string}>
     * }
     */
    public function pagePayload(Cooperative $cooperative, array $filters): array
    {
        return [
            'reports' => $this->paginateReports($cooperative, $filters),
            'filters' => $filters,
            'cropOptions' => $this->cropOptions(),
            'marketOptions' => $this->marketOptions($cooperative),
            'statusOptions' => $this->statusOptions(),
        ];
    }

    /**
     * Reusable scoped + filtered Eloquent query for index and export.
     *
     * @param  array{
     *     crop: string|null,
     *     market: string|null,
     *     status: string|null,
     *     from: string|null,
     *     to: string|null
     * }  $filters
     * @return Builder<Report>
     */
    public function filteredQuery(Cooperative $cooperative, array $filters): Builder
    {
        $query = Report::query()->forCooperative($cooperative->id);

        if ($filters['crop'] !== null) {
            $query->where('crop', $filters['crop']);
        }

        if ($filters['market'] !== null) {
            $query->whereHas('market', function (Builder $marketQuery) use ($filters): void {
                $marketQuery->where('slug', $filters['market']);
            });
        }

        if ($filters['status'] !== null) {
            $query->where('status', $filters['status']);
        }

        if ($filters['from'] !== null) {
            $query->where(
                'reported_at',
                '>=',
                Carbon::parse($filters['from'])->startOfDay(),
            );
        }

        if ($filters['to'] !== null) {
            $query->where(
                'reported_at',
                '<=',
                Carbon::parse($filters['to'])->endOfDay(),
            );
        }

        return $query;
    }

    /**
     * @param  array{
     *     crop: string|null,
     *     market: string|null,
     *     status: string|null,
     *     from: string|null,
     *     to: string|null
     * }  $filters
     * @return LengthAwarePaginator<int, array<string, mixed>>
     */
    public function paginateReports(Cooperative $cooperative, array $filters): LengthAwarePaginator
    {
        return $this->filteredQuery($cooperative, $filters)
            ->with([
                'market:id,name,slug',
                'cooperativeMember:id,name,phone_number,farmer_id',
                'cooperativeMember.farmer:id,name',
                'statusLogs' => fn ($query) => $query
                    ->with('changedBy:id,name')
                    ->latest('created_at')
                    ->latest('id'),
            ])
            ->latest('reported_at')
            ->latest('id')
            ->paginate(self::PER_PAGE)
            ->withQueryString()
            ->through(fn (Report $report): array => $this->reportRow($report));
    }

    /**
     * @param  array{
     *     crop: string|null,
     *     market: string|null,
     *     status: string|null,
     *     from: string|null,
     *     to: string|null
     * }  $filters
     */
    public function exportCsv(Cooperative $cooperative, array $filters): StreamedResponse
    {
        $filename = 'cooperative-reports-'.now()->format('Y-m-d-His').'.csv';
        $query = $this->filteredQuery($cooperative, $filters)
            ->with([
                'market:id,name,slug',
                'cooperativeMember:id,name,phone_number,farmer_id',
                'cooperativeMember.farmer:id,name',
            ]);

        return response()->streamDownload(function () use ($query): void {
            $handle = fopen('php://output', 'w');

            if ($handle === false) {
                return;
            }

            fwrite($handle, "\xEF\xBB\xBF");

            fputcsv($handle, [
                'id',
                'crop',
                'market',
                'price',
                'reporter_name',
                'reporter_phone',
                'status',
                'reported_at',
            ]);

            // chunkById avoids orderBy/lazyById conflicts when filters are applied.
            $query->orderBy('id')->chunkById(200, function ($reports) use ($handle): void {
                /** @var Report $report */
                foreach ($reports as $report) {
                    fputcsv($handle, [
                        $report->id,
                        $report->crop->value,
                        $report->market->slug->value,
                        $report->price,
                        $report->cooperativeMember?->displayName() ?? '',
                        $report->cooperativeMember?->phone_number ?? '',
                        $report->status->value,
                        $report->reported_at->toIso8601String(),
                    ]);
                }
            });

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    /**
     * @return list<array{value: string, label: string}>
     */
    public function cropOptions(): array
    {
        return array_map(
            fn (Crop $crop): array => [
                'value' => $crop->value,
                'label' => $crop->label(),
            ],
            Crop::cases(),
        );
    }

    /**
     * Markets that appear on this cooperative's reports only (no cross-tenant leakage).
     *
     * @return list<array{value: string, label: string}>
     */
    public function marketOptions(Cooperative $cooperative): array
    {
        $marketIds = Report::query()
            ->forCooperative($cooperative->id)
            ->distinct()
            ->pluck('market_id');

        if ($marketIds->isEmpty()) {
            return [];
        }

        return Market::query()
            ->whereIn('id', $marketIds)
            ->orderBy('name')
            ->get(['id', 'name', 'slug'])
            ->map(fn (Market $market): array => [
                'value' => $market->slug->value,
                'label' => $market->name,
            ])
            ->values()
            ->all();
    }

    /**
     * @return list<array{value: string, label: string}>
     */
    public function statusOptions(): array
    {
        return array_map(
            fn (ReportStatus $status): array => [
                'value' => $status->value,
                'label' => $status->label(),
            ],
            ReportStatus::cases(),
        );
    }

    /**
     * @return array{
     *     id: int,
     *     crop: string,
     *     cropLabel: string,
     *     market: string,
     *     marketLabel: string,
     *     price: float,
     *     reporter: array{id: int, name: string, phoneNumber: string},
     *     reportedAt: string,
     *     status: string,
     *     statusLabel: string,
     *     auditTrail: list<array{
     *         id: int,
     *         oldStatus: string,
     *         newStatus: string,
     *         oldStatusLabel: string,
     *         newStatusLabel: string,
     *         reason: string|null,
     *         changedAt: string,
     *         changedBy: array{id: int, name: string}|null
     *     }>
     * }
     */
    private function reportRow(Report $report): array
    {
        $member = $report->cooperativeMember;

        return [
            'id' => $report->id,
            'crop' => $report->crop->value,
            'cropLabel' => $report->crop->label(),
            'market' => $report->market->slug->value,
            'marketLabel' => $report->market->name,
            'price' => (float) $report->price,
            'reporter' => [
                'id' => (int) $member?->id,
                'name' => $member?->displayName() ?? '',
                'phoneNumber' => $member?->phone_number ?? '',
            ],
            'reportedAt' => $report->reported_at->toIso8601String(),
            'status' => $report->status->value,
            'statusLabel' => $report->status->label(),
            'auditTrail' => $report->statusLogs
                ->map(fn (ReportStatusLog $log): array => $this->auditTrailRow($log))
                ->values()
                ->all(),
        ];
    }

    /**
     * @return array{
     *     id: int,
     *     oldStatus: string,
     *     newStatus: string,
     *     oldStatusLabel: string,
     *     newStatusLabel: string,
     *     reason: string|null,
     *     changedAt: string,
     *     changedBy: array{id: int, name: string}|null
     * }
     */
    private function auditTrailRow(ReportStatusLog $log): array
    {
        return [
            'id' => $log->id,
            'oldStatus' => $log->old_status->value,
            'newStatus' => $log->new_status->value,
            'oldStatusLabel' => $log->old_status->label(),
            'newStatusLabel' => $log->new_status->label(),
            'reason' => $log->reason,
            'changedAt' => $log->created_at?->toIso8601String() ?? '',
            'changedBy' => $log->changedBy !== null
                ? [
                    'id' => $log->changedBy->id,
                    'name' => $log->changedBy->name,
                ]
                : null,
        ];
    }
}
