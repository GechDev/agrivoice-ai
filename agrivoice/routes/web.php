<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ReportController;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::get('/language/{locale}', function (string $locale) {
    if (in_array($locale, ['en', 'am', 'om'])) {
        app()->setLocale($locale);

        return Redirect::back()->withCookie(cookie()->forever('locale', $locale));
    }

    return Redirect::back();
})->name('language.switch');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', DashboardController::class)->name('dashboard');
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    Route::post('/reports/{report}/flag', [ReportController::class, 'flag'])->name('reports.flag');
});

require __DIR__.'/portal.php';
require __DIR__.'/settings.php';
