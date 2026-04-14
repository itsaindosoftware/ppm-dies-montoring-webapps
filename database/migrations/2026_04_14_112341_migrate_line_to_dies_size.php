<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Copy data from 'line' column to 'dies_size' column
        DB::table('dies')
            ->whereNotNull('line')
            ->where('line', '!=', '')
            ->update(['dies_size' => DB::raw('`line`')]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Clear dies_size column
        DB::table('dies')->update(['dies_size' => null]);
    }
};
