<?php

namespace Database\Seeders;

use App\Enums\InvoiceStatus;
use App\Models\Cooperative;
use App\Models\Invoice;
use Illuminate\Database\Seeder;

/**
 * Local/dev mock billing data — not called by DatabaseSeeder.
 */
class InvoiceSeeder extends Seeder
{
    public function run(): void
    {
        $cooperative = Cooperative::query()->first();

        if ($cooperative === null || Invoice::query()->forCooperative($cooperative->id)->exists()) {
            return;
        }

        foreach (range(1, 6) as $month) {
            Invoice::factory()->create([
                'cooperative_id' => $cooperative->id,
                'amount' => 6000,
                'status' => $month === 1 ? InvoiceStatus::Due : InvoiceStatus::Paid,
                'issued_at' => now()->subMonths($month - 1)->startOfMonth(),
            ]);
        }
    }
}
