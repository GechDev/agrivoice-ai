<?php

use App\Http\Controllers\CooperativeAuthController;
use App\Http\Controllers\CooperativeBillingController;
use App\Http\Controllers\CooperativeDashboardController;
use App\Http\Controllers\CooperativeMemberController;
use App\Http\Controllers\CooperativePriceController;
use App\Http\Controllers\CooperativeReportController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\IvrController;
use App\Http\Controllers\PublicReportController;
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
})->middleware('throttle:60,1')->name('language.switch');

// Public showcase surfaces — projector dashboard + live feed must work without login.
Route::get('/dashboard', DashboardController::class)->name('dashboard');
Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');

Route::middleware('guest')->prefix('cooperative')->name('cooperative.')->group(function () {
    Route::get('/login', [CooperativeAuthController::class, 'createLogin'])->name('login');
    Route::post('/login', [CooperativeAuthController::class, 'login'])
        ->middleware('throttle:cooperative-login')
        ->name('login.store');
    Route::get('/register', [CooperativeAuthController::class, 'createRegister'])->name('register');
    Route::post('/register', [CooperativeAuthController::class, 'register'])
        ->middleware('throttle:cooperative-register')
        ->name('register.store');
});

Route::post('/cooperative/logout', [CooperativeAuthController::class, 'destroy'])
    ->middleware('auth')
    ->name('cooperative.logout');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('/reports/{report}/flag', [ReportController::class, 'flag'])
        ->middleware('throttle:20,1')
        ->name('reports.flag');

    Route::get('/ivr', [IvrController::class, 'index'])->name('ivr.index');
    Route::post('/ivr/speak', [IvrController::class, 'speak'])->name('ivr.speak');

    Route::middleware('cooperative.admin')->prefix('cooperative')->name('cooperative.')->group(function () {
        Route::get('/dashboard', CooperativeDashboardController::class)->name('dashboard');

        Route::get('/reports', [CooperativeReportController::class, 'index'])->name('reports.index');
        Route::get('/reports/export', [CooperativeReportController::class, 'export'])->name('reports.export');
        Route::patch('/reports/{report}/status', [CooperativeReportController::class, 'updateStatus'])->name('reports.status');

        Route::get('/prices', [CooperativePriceController::class, 'index'])->name('prices.index');
        Route::get('/prices/download', [CooperativePriceController::class, 'download'])->name('prices.download');

        Route::get('/billing', [CooperativeBillingController::class, 'index'])->name('billing.index');
        Route::patch('/billing/subscriptions/{subscription}/plan', [CooperativeBillingController::class, 'updatePlan'])->name('billing.plan');
        Route::patch('/billing/subscriptions/{subscription}/payment-method', [CooperativeBillingController::class, 'updatePaymentMethod'])->name('billing.payment-method');
        Route::get('/billing/invoices/{invoice}/download', [CooperativeBillingController::class, 'downloadInvoice'])->name('billing.invoices.download');

        Route::get('/members', [CooperativeMemberController::class, 'index'])->name('members.index');
        Route::post('/members', [CooperativeMemberController::class, 'store'])->name('members.store');
        Route::post('/members/bulk-invite', [CooperativeMemberController::class, 'bulkInvite'])->name('members.bulk-invite');
        Route::get('/members/{member}', [CooperativeMemberController::class, 'show'])->name('members.show');
        Route::patch('/members/{member}/remove', [CooperativeMemberController::class, 'remove'])->name('members.remove');
    });
});

require __DIR__.'/portal.php';
require __DIR__.'/settings.php';

Route::get('/report-price', [PublicReportController::class, 'create'])->name('report-price');
Route::post('/report-price', [PublicReportController::class, 'store'])
    ->middleware('throttle:public-report')
    ->name('report-price.store');
