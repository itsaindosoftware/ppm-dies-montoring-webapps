<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('ppm_schedules', function (Blueprint $table) {
            $table->date('lot4_check_date')->nullable()->after('ppm_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ppm_schedules', function (Blueprint $table) {
            $table->dropColumn('lot4_check_date');
        });
    }
};
