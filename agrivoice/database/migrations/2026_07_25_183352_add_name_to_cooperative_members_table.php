<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cooperative_members', function (Blueprint $table) {
            $table->string('name')->nullable()->after('farmer_id');
            $table->unique(['cooperative_id', 'phone_number']);
        });
    }

    public function down(): void
    {
        Schema::table('cooperative_members', function (Blueprint $table) {
            $table->dropUnique(['cooperative_id', 'phone_number']);
            $table->dropColumn('name');
        });
    }
};
