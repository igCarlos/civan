<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\PermissionController;
use App\Http\Controllers\Admin\RoleController;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'active',])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::prefix('dashboard')
    ->name('admin.')
    ->group(function () {
        // ##############################
        //  USUARIOS
        // ##############################
        Route::get(
            '/usuarios',
            [UserController::class, 'index']
        )
        ->middleware('can:users.view')
        ->name('users.index');

        Route::get(
            '/usuarios/crear',
            [UserController::class, 'create']
        )
        ->middleware('can:users.view')
        ->name('users.create');

        Route::post(
            '/usuarios',
            [UserController::class, 'store']
        )
        ->middleware('can:users.view')
        ->name('users.store');

        Route::get(
            '/usuarios/{user}/editar',
            [UserController::class, 'edit']
        )
        ->middleware('can:users.update')
        ->name('users.edit');

        Route::put(
            '/usuarios/{user}',
            [UserController::class, 'update']
        )
        ->middleware('can:users.update')
        ->name('users.update');

        Route::delete(
            '/usuarios/{user}',
            [UserController::class, 'destroy']
        )
        ->middleware('can:users.view')
        ->name('users.destroy');

        // ##############################
        //  PERMISOS
        // ##############################

        Route::get(
            '/permisos',
            [PermissionController::class, 'index']
        )
        ->middleware('can:permissions.view')
        ->name('permissions.index');

        // ##############################
        //  ROLES
        // ##############################
        Route::get(
            '/roles',
            [RoleController::class, 'index']
        )
        ->middleware('can:roles.view')
        ->name('roles.index');

        Route::get(
            '/roles/crear',
            [RoleController::class, 'create']
        )
        ->middleware('can:roles.view')
        ->name('roles.create');

        Route::post(
            '/roles',
            [RoleController::class, 'store']
        )
        ->middleware('can:roles.view')
        ->name('roles.store');

        Route::get(
            '/roles/{role}/editar',
            [RoleController::class, 'edit']
        )
        ->middleware('can:roles.view')
        ->name('roles.edit');

        Route::put(
            '/roles/{role}',
            [RoleController::class, 'update']
        )
        ->middleware('can:roles.view')
        ->name('roles.update');

        Route::delete(
            '/roles/{role}',
            [RoleController::class, 'destroy']
        )
        ->middleware('can:roles.view')
        ->name('roles.destroy');

    });


});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
