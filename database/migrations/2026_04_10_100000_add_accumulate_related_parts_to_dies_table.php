<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('dies', function (Blueprint $table) {
            $table->boolean('accumulate_related_parts')->default(false)->after('is_4lot_check')
                ->comment('If true, stroke accumulation is shared across dies with the same base part number');
        });
    }

    public function down(): void
    {
        Schema::table('dies', function (Blueprint $table) {
            $table->dropColumn('accumulate_related_parts');
        });
    }
};
