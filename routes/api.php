<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AnimeController;
use Illuminate\Support\Facades\Cache;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::get('/animes', [AnimeController::class, 'index']);
Route::get('/animes/{id}', [AnimeController::class, 'show']);

Route::get('/anime/search/{query}', function ($query) {
    $response = Cache::remember("anime-$query", 3600, function () use ($query) {
        return Http::get("https://api.jikan.moe/v4/anime?q=$query")->json();
    });
    return $response;
});


Route::get('/anime/stream/{id}', function ($id) {
    $response = Http::get("https://api.consumet.org/anime/gogoanime/watch/$id");
    return $response->json();
});
