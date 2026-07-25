<?php

use App\Http\Controllers\AgentAuthController;
use App\Http\Controllers\ReportController;
use Illuminate\Support\Facades\Route;

Route::get('portal/login', [AgentAuthController::class, 'create'])
    ->name('portal.login');

Route::post('portal/login', [AgentAuthController::class, 'store'])
    ->middleware('throttle:10,1')
    ->name('portal.login.store');

Route::middleware('agent')->group(function (): void {
    Route::get('portal', [ReportController::class, 'create'])->name('portal.entry');
    Route::post('portal/logout', [AgentAuthController::class, 'destroy'])->name('portal.logout');

    Route::post('reports', [ReportController::class, 'store'])
        ->middleware('throttle:30,1')
        ->name('reports.store');
});
