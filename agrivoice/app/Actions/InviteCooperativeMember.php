<?php

namespace App\Actions;

use App\Enums\CooperativeMemberStatus;
use App\Jobs\SendMemberInviteJob;
use App\Models\Cooperative;
use App\Models\CooperativeMember;
use Illuminate\Support\Facades\DB;

class InviteCooperativeMember
{
    /**
     * @param  array{name?: string|null, phone_number: string}  $data
     */
    public function handle(Cooperative $cooperative, array $data): CooperativeMember
    {
        return DB::transaction(function () use ($cooperative, $data): CooperativeMember {
            $member = CooperativeMember::query()->create([
                'cooperative_id' => $cooperative->id,
                'name' => $data['name'] ?? null,
                'phone_number' => $data['phone_number'],
                'status' => CooperativeMemberStatus::Invited,
                'farmer_id' => null,
                'joined_at' => null,
            ]);

            DB::afterCommit(fn () => SendMemberInviteJob::dispatch($member->id));

            return $member;
        });
    }
}
