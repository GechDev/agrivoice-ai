<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::post('/language', function (Request $request) {
    $locale = $request->input('locale', 'en');

    if (in_array($locale, ['en', 'am', 'om'])) {
        app()->setLocale($locale);
    }

    return Redirect::back()->withCookie(cookie()->forever('locale', $locale));
})->name('language.switch');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
