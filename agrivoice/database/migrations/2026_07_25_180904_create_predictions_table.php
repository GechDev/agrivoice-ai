<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('predictions', function (Blueprint $table) {
            $table->id();
            $table->string('crop');
            $table->foreignId('market_id')->constrained()->cascadeOnDelete();
            $table->decimal('predicted_price', 10, 2);
            $table->string('trend');
            $table->unsignedTinyInteger('confidence_score');
            $table->date('predicted_for');
            $table->timestamp('generated_at');
            $table->timestamps();

            $table->index(['crop', 'market_id', 'predicted_for']);
            $table->index('generated_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('predictions');
    }
};
