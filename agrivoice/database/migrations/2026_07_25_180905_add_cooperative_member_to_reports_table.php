<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->dropForeign(['agent_id']);
        });

        Schema::table('reports', function (Blueprint $table) {
            $table->foreignId('agent_id')->nullable()->change();
            $table->foreign('agent_id')
                ->references('id')
                ->on('agents')
                ->nullOnDelete();

            $table->foreignId('cooperative_member_id')
                ->nullable()
                ->after('agent_id')
                ->constrained()
                ->nullOnDelete();

            $table->index('cooperative_member_id');
        });
    }

    public function down(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->dropForeign(['cooperative_member_id']);
            $table->dropIndex(['cooperative_member_id']);
            $table->dropColumn('cooperative_member_id');

            $table->dropForeign(['agent_id']);
        });

        Schema::table('reports', function (Blueprint $table) {
            $table->foreignId('agent_id')->nullable(false)->change();
            $table->foreign('agent_id')
                ->references('id')
                ->on('agents')
                ->cascadeOnDelete();
        });
    }
};
