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
        Schema::table('dies', function (Blueprint $table) {
            // Add dies_size column after qty_die
            $table->string('dies_size', 20)->nullable()->after('qty_die');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dies', function (Blueprint $table) {
            $table->dropColumn('dies_size');
        });
    }
};
