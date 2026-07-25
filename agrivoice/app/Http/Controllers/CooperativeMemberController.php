<?php

namespace App\Http\Controllers;

use App\Actions\BulkInviteCooperativeMembers;
use App\Actions\InviteCooperativeMember;
use App\Enums\CooperativeMemberStatus;
use App\Http\Requests\BulkInviteMembersRequest;
use App\Http\Requests\InviteMemberRequest;
use App\Models\CooperativeMember;
use App\Services\CooperativeMembersService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Inertia\Inertia;
use Inertia\Response;

class CooperativeMemberController extends CooperativeController
{
    public function __construct(private CooperativeMembersService $members) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', CooperativeMember::class);

        return Inertia::render(
            'Cooperative/Members/Index',
            $this->members->pagePayload($this->cooperative($request), $request),
        );
    }

    public function show(Request $request, CooperativeMember $member): Response
    {
        $this->authorize('view', $member);

        return Inertia::render(
            'Cooperative/Members/Index',
            $this->members->pagePayload($this->cooperative($request), $request, $member),
        );
    }

    public function store(
        InviteMemberRequest $request,
        InviteCooperativeMember $invite,
    ): RedirectResponse {
        $this->authorize('create', CooperativeMember::class);

        $invite->handle($request->resolvedCooperative(), $request->validated());

        return back()->with('success', 'Member invited successfully.');
    }

    public function bulkInvite(
        BulkInviteMembersRequest $request,
        BulkInviteCooperativeMembers $bulkInvite,
    ): RedirectResponse {
        $this->authorize('create', CooperativeMember::class);

        $csv = $request->file('csv');

        if (! $csv instanceof UploadedFile) {
            abort(422);
        }

        $summary = $bulkInvite->handle(
            $this->cooperative($request),
            $csv,
        );

        return back()
            ->with('success', 'Bulk invite finished.')
            ->with('bulkInviteSummary', $summary);
    }

    public function remove(Request $request, CooperativeMember $member): RedirectResponse
    {
        $this->authorize('remove', $member);

        $member->forceFill([
            'status' => CooperativeMemberStatus::Removed,
        ])->save();

        return back()->with('success', 'Member removed.');
    }
}
