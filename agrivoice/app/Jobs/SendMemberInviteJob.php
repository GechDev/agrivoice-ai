<?php

namespace App\Jobs;

use App\Models\CooperativeMember;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Throwable;

class SendMemberInviteJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    /**
     * @var list<int>
     */
    public array $backoff = [10, 30, 60];

    public function __construct(public int $cooperativeMemberId) {}

    public function handle(): void
    {
        $member = CooperativeMember::query()->find($this->cooperativeMemberId);

        if ($member === null) {
            return;
        }

        Log::info('Dispatching cooperative member invite', [
            'cooperative_member_id' => $member->id,
            'phone_number' => $member->phone_number,
        ]);

        // TODO: integrate SMS provider
    }

    public function failed(?Throwable $exception): void
    {
        Log::error('Failed to send cooperative member invite', [
            'cooperative_member_id' => $this->cooperativeMemberId,
            'error' => $exception?->getMessage(),
        ]);
    }
}
