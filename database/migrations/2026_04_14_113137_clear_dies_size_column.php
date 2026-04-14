<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Clear all data from dies_size column
        DB::table('dies')->update(['dies_size' => null]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No reversal needed - we can't restore deleted data
    }
};
