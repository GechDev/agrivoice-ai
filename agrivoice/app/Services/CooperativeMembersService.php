<?php

namespace App\Services;

use App\Enums\CooperativeMemberStatus;
use App\Enums\ReportStatus;
use App\Models\Cooperative;
use App\Models\CooperativeMember;
use App\Models\MemberQuery;
use App\Models\Report;
use Carbon\CarbonInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class CooperativeMembersService
{
    private const PER_PAGE = 20;

    private const RECENT_LIMIT = 20;

    /**
     * @return array{
     *     members: LengthAwarePaginator,
     *     filters: array{search: string|null, status: string|null},
     *     statusOptions: list<array{value: string, label: string}>,
     *     selectedMember: array<string, mixed>|null
     * }
     */
    public function pagePayload(
        Cooperative $cooperative,
        Request $request,
        ?CooperativeMember $selectedMember = null,
    ): array {
        $filters = $this->resolvedFilters($request);

        return [
            'members' => $this->paginateMembers($cooperative, $filters),
            'filters' => $filters,
            'statusOptions' => $this->statusOptions(),
            'selectedMember' => $selectedMember !== null
                ? $this->memberDetail($selectedMember)
                : null,
        ];
    }

    /**
     * @return array{search: string|null, status: string|null}
     */
    public function resolvedFilters(Request $request): array
    {
        $search = $request->string('search')->trim()->toString();
        $statusInput = $request->string('status')->trim()->toString();
        $status = CooperativeMemberStatus::tryFrom($statusInput);

        return [
            'search' => $search !== '' ? $search : null,
            'status' => $status?->value,
        ];
    }

    /**
     * @param  array{search: string|null, status: string|null}  $filters
     * @return LengthAwarePaginator<int, array<string, mixed>>
     */
    public function paginateMembers(Cooperative $cooperative, array $filters): LengthAwarePaginator
    {
        $query = CooperativeMember::query()
            ->forCooperative($cooperative->id)
            ->with(['farmer:id,name'])
            ->withCount(['queries', 'reports'])
            ->withMax('reports', 'reported_at')
            ->withMax('queries', 'queried_at')
            ->latest('id');

        $this->applyFilters($query, $filters);

        return $query
            ->paginate(self::PER_PAGE)
            ->withQueryString()
            ->through(fn (CooperativeMember $member): array => $this->memberRow($member));
    }

    /**
     * @return array<string, mixed>
     */
    public function memberDetail(CooperativeMember $member): array
    {
        $member = CooperativeMember::query()
            ->with(['farmer:id,name'])
            ->withCount(['queries', 'reports'])
            ->withMax('reports', 'reported_at')
            ->withMax('queries', 'queried_at')
            ->findOrFail($member->id);

        $recentQueries = $member->queries()
            ->with(['market:id,name,slug'])
            ->latest('queried_at')
            ->latest('id')
            ->limit(self::RECENT_LIMIT)
            ->get()
            ->map(fn (MemberQuery $query): array => [
                'id' => $query->id,
                'market' => $query->market?->name,
                'crop' => $query->crop?->value,
                'text' => $query->query_text,
                'channel' => $query->channel,
                'date' => $query->queried_at->toIso8601String(),
            ])
            ->values()
            ->all();

        $recentReports = $member->reports()
            ->with(['market:id,name,slug'])
            ->latest('reported_at')
            ->latest('id')
            ->limit(self::RECENT_LIMIT)
            ->get()
            ->map(fn (Report $report): array => [
                'id' => $report->id,
                'market' => $report->market->name,
                'crop' => $report->crop->value,
                'price' => (float) $report->price,
                'status' => $report->status->value,
                'date' => $report->reported_at->toIso8601String(),
            ])
            ->values()
            ->all();

        $totalReports = (int) $member->reports_count;
        $disputedOrRejected = $member->reports()
            ->whereIn('status', [ReportStatus::Disputed, ReportStatus::Rejected])
            ->count();

        $disputedOrRejectedRate = $totalReports > 0
            ? round(($disputedOrRejected / $totalReports) * 100, 2)
            : 0.0;

        return [
            ...$this->memberRow($member),
            'recentQueries' => $recentQueries,
            'recentReports' => $recentReports,
            'totalReports' => $totalReports,
            'disputedOrRejectedRate' => $disputedOrRejectedRate,
            'frequentDisputes' => $totalReports >= 5 && $disputedOrRejectedRate >= 20,
        ];
    }

    /**
     * @return list<array{value: string, label: string}>
     */
    public function statusOptions(): array
    {
        return array_map(
            fn (CooperativeMemberStatus $status): array => [
                'value' => $status->value,
                'label' => $status->label(),
            ],
            CooperativeMemberStatus::cases(),
        );
    }

    /**
     * @param  Builder<CooperativeMember>  $query
     * @param  array{search: string|null, status: string|null}  $filters
     */
    private function applyFilters(Builder $query, array $filters): void
    {
        if ($filters['status'] !== null) {
            $query->where('status', $filters['status']);
        }

        if ($filters['search'] === null) {
            return;
        }

        $search = $filters['search'];

        $query->where(function (Builder $builder) use ($search): void {
            $builder
                ->where('name', 'like', "%{$search}%")
                ->orWhere('phone_number', 'like', "%{$search}%")
                ->orWhereHas('farmer', function (Builder $farmerQuery) use ($search): void {
                    $farmerQuery->where('name', 'like', "%{$search}%");
                });
        });
    }

    /**
     * @return array{
     *     id: int,
     *     name: string,
     *     phoneNumber: string,
     *     status: string,
     *     joinedAt: string|null,
     *     lastActivityAt: string|null,
     *     queriesCount: int,
     *     reportsCount: int
     * }
     */
    private function memberRow(CooperativeMember $member): array
    {
        return [
            'id' => $member->id,
            'name' => $member->displayName(),
            'phoneNumber' => $member->phone_number,
            'status' => $member->status->value,
            'joinedAt' => $member->joined_at?->toIso8601String(),
            'lastActivityAt' => $this->lastActivityAt($member)?->toIso8601String(),
            'queriesCount' => (int) ($member->queries_count ?? 0),
            'reportsCount' => (int) ($member->reports_count ?? 0),
        ];
    }

    private function lastActivityAt(CooperativeMember $member): ?CarbonInterface
    {
        $candidates = array_filter([
            $this->asCarbon($member->reports_max_reported_at ?? null),
            $this->asCarbon($member->queries_max_queried_at ?? null),
        ]);

        if ($candidates === []) {
            return null;
        }

        return collect($candidates)->sortByDesc(fn (CarbonInterface $date): int => $date->getTimestamp())->first();
    }

    private function asCarbon(mixed $value): ?CarbonInterface
    {
        if ($value instanceof CarbonInterface) {
            return $value;
        }

        if (is_string($value) && $value !== '') {
            return Carbon::parse($value);
        }

        return null;
    }
}
