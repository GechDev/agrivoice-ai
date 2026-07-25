<?php

namespace App\Policies;

use App\Models\CooperativeAdmin;
use App\Models\Invoice;
use App\Models\User;

class InvoicePolicy
{
    public function viewAny(User $user): bool
    {
        return CooperativeAdmin::query()->where('user_id', $user->id)->exists();
    }

    public function view(User $user, Invoice $invoice): bool
    {
        return CooperativeAdmin::query()
            ->where('user_id', $user->id)
            ->where('cooperative_id', $invoice->cooperative_id)
            ->exists();
    }
}
