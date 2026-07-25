<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cooperative_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('plan_tier');
            $table->string('pending_plan_tier')->nullable();
            $table->decimal('price_per_month', 12, 2);
            $table->unsignedInteger('member_limit');
            $table->string('status')->index();
            $table->date('current_period_end');
            $table->string('payment_method_type')->nullable();
            $table->string('payment_method_last_four', 4)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
