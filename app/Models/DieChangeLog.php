<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DieChangeLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'die_id',
        'user_id',
        'part_number',
        'part_name',
        'changed_fields',
    ];

    protected $casts = [
        'changed_fields' => 'array',
    ];

    public function die()
    {
        return $this->belongsTo(DieModel::class, 'die_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}