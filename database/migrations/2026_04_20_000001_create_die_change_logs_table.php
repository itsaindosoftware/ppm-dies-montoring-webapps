<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('die_change_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('die_id')->constrained('dies')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('part_number', 50)->nullable();
            $table->string('part_name', 200)->nullable();
            $table->json('changed_fields');
            $table->timestamps();

            $table->index(['die_id', 'created_at']);
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('die_change_logs');
    }
};