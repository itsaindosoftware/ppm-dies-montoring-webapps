<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('die_processes', function (Blueprint $table) {
            $table->enum('lot_check_status', ['pending', 'in_progress', 'completed'])
                ->default('pending')
                ->after('ppm_status');
            $table->timestamp('lot_check_started_at')->nullable()->after('lot_check_status');
            $table->timestamp('lot_check_completed_at')->nullable()->after('lot_check_started_at');
            $table->foreignId('lot_check_history_id')
                ->nullable()
                ->constrained('ppm_histories')
                ->nullOnDelete()
                ->after('lot_check_completed_at');
            $table->string('lot_check_completed_by')->nullable()->after('lot_check_history_id');
            $table->index(['die_id', 'lot_check_status']);
        });

        DB::table('die_processes')->update([
            'lot_check_status' => DB::raw('ppm_status'),
            'lot_check_started_at' => DB::raw('ppm_started_at'),
            'lot_check_completed_at' => DB::raw('ppm_completed_at'),
            'lot_check_history_id' => DB::raw('ppm_history_id'),
            'lot_check_completed_by' => DB::raw('completed_by'),
        ]);
    }

    public function down(): void
    {
        Schema::table('die_processes', function (Blueprint $table) {
            $table->dropIndex(['die_id', 'lot_check_status']);
            $table->dropConstrainedForeignId('lot_check_history_id');
            $table->dropColumn([
                'lot_check_status',
                'lot_check_started_at',
                'lot_check_completed_at',
                'lot_check_completed_by',
            ]);
        });
    }
};
