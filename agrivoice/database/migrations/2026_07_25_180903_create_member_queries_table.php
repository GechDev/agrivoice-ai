<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('member_queries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cooperative_member_id')->constrained()->cascadeOnDelete();
            $table->string('crop')->nullable();
            $table->foreignId('market_id')->nullable()->constrained()->nullOnDelete();
            $table->text('query_text')->nullable();
            $table->string('channel')->default('voice');
            $table->timestamp('queried_at');
            $table->timestamps();

            $table->index(['cooperative_member_id', 'queried_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('member_queries');
    }
};
