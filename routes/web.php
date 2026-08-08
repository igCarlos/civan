<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\PermissionController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\AuditController;
use App\Http\Controllers\Admin\UserActivityController;
use App\Http\Controllers\Admin\AuditExportController;

use Inertia\Inertia;


/*
|--------------------------------------------------------------------------
| Inicio
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');


/*
|--------------------------------------------------------------------------
| Rutas protegidas
|--------------------------------------------------------------------------
*/

Route::middleware([
    'auth',
    'active',
    'activity',
    'navigation',
])->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Dashboard
    |--------------------------------------------------------------------------
    */

    Route::get(
        'dashboard',
        function () {
            return Inertia::render(
                'dashboard'
            );
        }
    )->name('dashboard');


    /*
    |--------------------------------------------------------------------------
    | Administración
    |--------------------------------------------------------------------------
    */

    Route::prefix('dashboard')
        ->name('admin.')
        ->group(function () {


            // ##############################
            // AUDITORÍA
            // ##############################

            Route::get(
                '/auditoria',
                [
                    AuditController::class,
                    'index',
                ]
            )
                ->middleware(
                    'can:audit_logs.view'
                )
                ->name(
                    'audit.index'
                );


            /*
            |--------------------------------------------------------------------------
            | Exportar auditoría - CSV
            |--------------------------------------------------------------------------
            */

            Route::get(
                '/auditoria/exportar/csv',
                [
                    AuditExportController::class,
                    'csv',
                ]
            )
                ->middleware(
                    'can:audit_logs.export'
                )
                ->name(
                    'audit.export.csv'
                );


            /*
            |--------------------------------------------------------------------------
            | Exportar auditoría - Excel
            |--------------------------------------------------------------------------
            */

            Route::get(
                '/auditoria/exportar/excel',
                [
                    AuditExportController::class,
                    'excel',
                ]
            )
                ->middleware(
                    'can:audit_logs.export'
                )
                ->name(
                    'audit.export.excel'
                );


            /*
            |--------------------------------------------------------------------------
            | Exportar auditoría - PDF
            |--------------------------------------------------------------------------
            */

            Route::get(
                '/auditoria/exportar/pdf',
                [
                    AuditExportController::class,
                    'pdf',
                ]
            )
                ->middleware(
                    'can:audit_logs.export'
                )
                ->name(
                    'audit.export.pdf'
                );


            // ##############################
            // USUARIOS
            // ##############################

            Route::get(
                '/usuarios',
                [
                    UserController::class,
                    'index',
                ]
            )
                ->middleware(
                    'can:users.view'
                )
                ->name(
                    'users.index'
                );


            Route::get(
                '/usuarios/crear',
                [
                    UserController::class,
                    'create',
                ]
            )
                ->middleware(
                    'can:users.view'
                )
                ->name(
                    'users.create'
                );


            Route::post(
                '/usuarios',
                [
                    UserController::class,
                    'store',
                ]
            )
                ->middleware(
                    'can:users.view'
                )
                ->name(
                    'users.store'
                );


            Route::get(
                '/usuarios/{user}/editar',
                [
                    UserController::class,
                    'edit',
                ]
            )
                ->middleware(
                    'can:users.update'
                )
                ->name(
                    'users.edit'
                );


            Route::put(
                '/usuarios/{user}',
                [
                    UserController::class,
                    'update',
                ]
            )
                ->middleware(
                    'can:users.update'
                )
                ->name(
                    'users.update'
                );


            Route::delete(
                '/usuarios/{user}',
                [
                    UserController::class,
                    'destroy',
                ]
            )
                ->middleware(
                    'can:users.view'
                )
                ->name(
                    'users.destroy'
                );


            /*
            |--------------------------------------------------------------------------
            | Actividad individual
            |--------------------------------------------------------------------------
            */

            Route::get(
                '/usuarios/{user}/actividad',
                [
                    UserActivityController::class,
                    'index',
                ]
            )
                ->middleware(
                    'can:audit_logs.view'
                )
                ->name(
                    'users.activity'
                );


            // ##############################
            // PERMISOS
            // ##############################

            Route::get(
                '/permisos',
                [
                    PermissionController::class,
                    'index',
                ]
            )
                ->middleware(
                    'can:permissions.view'
                )
                ->name(
                    'permissions.index'
                );


            /*
            |--------------------------------------------------------------------------
            | Sincronizar permisos
            |--------------------------------------------------------------------------
            */

            Route::post(
                '/permisos/sincronizar',
                [
                    PermissionController::class,
                    'sync',
                ]
            )
                ->middleware(
                    'can:permissions.sync'
                )
                ->name(
                    'permissions.sync'
                );


            // ##############################
            // ROLES
            // ##############################

            Route::get(
                '/roles',
                [
                    RoleController::class,
                    'index',
                ]
            )
                ->middleware(
                    'can:roles.view'
                )
                ->name(
                    'roles.index'
                );


            Route::get(
                '/roles/crear',
                [
                    RoleController::class,
                    'create',
                ]
            )
                ->middleware(
                    'can:roles.view'
                )
                ->name(
                    'roles.create'
                );


            Route::post(
                '/roles',
                [
                    RoleController::class,
                    'store',
                ]
            )
                ->middleware(
                    'can:roles.view'
                )
                ->name(
                    'roles.store'
                );


            Route::get(
                '/roles/{role}/editar',
                [
                    RoleController::class,
                    'edit',
                ]
            )
                ->middleware(
                    'can:roles.view'
                )
                ->name(
                    'roles.edit'
                );


            Route::put(
                '/roles/{role}',
                [
                    RoleController::class,
                    'update',
                ]
            )
                ->middleware(
                    'can:roles.view'
                )
                ->name(
                    'roles.update'
                );


            Route::delete(
                '/roles/{role}',
                [
                    RoleController::class,
                    'destroy',
                ]
            )
                ->middleware(
                    'can:roles.view'
                )
                ->name(
                    'roles.destroy'
                );
        });
});


/*
|--------------------------------------------------------------------------
| Configuración y autenticación
|--------------------------------------------------------------------------
*/

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';