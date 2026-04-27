<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE ppm_histories MODIFY maintenance_type ENUM('routine','repair','overhaul','emergency','4lc_maintenance') NOT NULL DEFAULT 'routine'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('ppm_histories')
            ->where('maintenance_type', '4lc_maintenance')
            ->update(['maintenance_type' => 'routine']);

        DB::statement("ALTER TABLE ppm_histories MODIFY maintenance_type ENUM('routine','repair','overhaul','emergency') NOT NULL DEFAULT 'routine'");
    }
};
