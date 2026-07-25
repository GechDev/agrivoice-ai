<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->string('crop');
            $table->foreignId('market_id')->constrained()->cascadeOnDelete();
            $table->decimal('price', 10, 2);
            $table->string('reporter_type');
            $table->string('source')->nullable();
            $table->foreignId('agent_id')->constrained()->cascadeOnDelete();
            // When the sale was observed, which is not always when it was entered.
            $table->timestamp('reported_at');
            $table->boolean('is_flagged')->default(false);
            $table->timestamps();

            // The snapshot engine filters on exactly this combination.
            $table->index(['crop', 'market_id', 'reported_at']);
            $table->index('is_flagged');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
