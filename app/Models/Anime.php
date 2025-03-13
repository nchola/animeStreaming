<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Anime extends Model
{
    use HasFactory;
    protected $fillable = [
        'title',
        'description',
        'episode_count',
        'poster_url',
        'video_url',
    ];
}
