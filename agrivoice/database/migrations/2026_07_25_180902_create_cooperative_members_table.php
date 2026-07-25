<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cooperative_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cooperative_id')->constrained()->cascadeOnDelete();
            $table->foreignId('farmer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('phone_number');
            $table->string('status')->default('invited');
            $table->timestamp('joined_at')->nullable();
            $table->timestamps();

            $table->index(['cooperative_id', 'status']);
            $table->index('farmer_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cooperative_members');
    }
};
