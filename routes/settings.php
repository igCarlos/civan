<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SessionController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', 'settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');
    Route::put('settings/password', [PasswordController::class, 'update'])->name('password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance');

    Route::get(
                '/settings/2fa',
                fn () => Inertia::render(
                    'settings/2FA'
                )
            )->name('settings.2fa');

     Route::get(
            '/settings/sessions',
            [
                SessionController::class,
                'index',
            ]
        )->name(
            'sessions.index'
        );

        /*
        | Esta ruta debe estar ANTES de sessions/{sessionId}.
        */
        Route::delete(
            'settings/sessions/others',
            [
                SessionController::class,
                'destroyOthers',
            ]
        )->name(
            'sessions.destroy-others'
        );

        Route::delete(
            'settings/sessions/{sessionId}',
            [
                SessionController::class,
                'destroy',
            ]
        )->name(
            'sessions.destroy'
        );
});
