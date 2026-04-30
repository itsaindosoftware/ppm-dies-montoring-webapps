<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('dies', function (Blueprint $table) {
            $table->string('lot4_alert_status', 50)->nullable()->after('ppm_alert_status');
            $table->timestamp('lot4_schedule_approved_at')->nullable()->after('schedule_approved_at');
            $table->string('lot4_schedule_approved_by', 100)->nullable()->after('lot4_schedule_approved_at');
            $table->timestamp('lot4_started_at')->nullable()->after('ppm_started_at');
            $table->timestamp('lot4_finished_at')->nullable()->after('ppm_finished_at');
            $table->index('lot4_alert_status');
        });

        DB::statement("\n            UPDATE dies
            SET lot4_alert_status = CASE
                WHEN ppm_alert_status IN ('4lc_scheduled', '4lc_approved', 'transferred_to_mtn_4lc', '4lc_in_progress', '4lc_completed')
                    THEN ppm_alert_status
                ELSE lot4_alert_status
            END,
            lot4_schedule_approved_at = CASE
                WHEN ppm_alert_status IN ('4lc_approved', 'transferred_to_mtn_4lc', '4lc_in_progress', '4lc_completed')
                    THEN schedule_approved_at
                ELSE lot4_schedule_approved_at
            END,
            lot4_schedule_approved_by = CASE
                WHEN ppm_alert_status IN ('4lc_approved', 'transferred_to_mtn_4lc', '4lc_in_progress', '4lc_completed')
                    THEN schedule_approved_by
                ELSE lot4_schedule_approved_by
            END,
            lot4_started_at = CASE
                WHEN ppm_alert_status IN ('4lc_in_progress', '4lc_completed')
                    THEN ppm_started_at
                ELSE lot4_started_at
            END,
            lot4_finished_at = CASE
                WHEN ppm_alert_status = '4lc_completed'
                    THEN ppm_finished_at
                ELSE lot4_finished_at
            END
        ");

        DB::statement("\n            UPDATE dies
            SET ppm_alert_status = NULL
            WHERE ppm_alert_status IN ('4lc_scheduled', '4lc_approved', 'transferred_to_mtn_4lc', '4lc_in_progress', '4lc_completed')
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dies', function (Blueprint $table) {
            $table->dropIndex(['lot4_alert_status']);
            $table->dropColumn([
                'lot4_alert_status',
                'lot4_schedule_approved_at',
                'lot4_schedule_approved_by',
                'lot4_started_at',
                'lot4_finished_at',
            ]);
        });
    }
};
