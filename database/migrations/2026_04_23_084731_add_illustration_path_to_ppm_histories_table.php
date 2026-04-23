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
        Schema::table('ppm_histories', function (Blueprint $table) {
            //
            $table->string('illustration_path')->nullable()->after('checklist_results');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ppm_histories', function (Blueprint $table) {
            //
            $table->dropColumn('illustration_path');
        });
    }
};
