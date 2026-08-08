<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;
use Throwable;

class PermissionController extends Controller
{
    /**
     * Listado de permisos.
     */
    public function index(
        Request $request
    ): Response {
        abort_unless(
            $request->user()->can('permissions.view'),
            403
        );

        /*
        |--------------------------------------------------------------------------
        | Permisos agrupados por módulo
        |--------------------------------------------------------------------------
        */

        $modules = Permission::query()
            ->where(
                'guard_name',
                'web'
            )
            ->orderBy('name')
            ->get()
            ->groupBy(
                function (
                    Permission $permission
                ) {
                    return explode(
                        '.',
                        $permission->name
                    )[0];
                }
            )
            ->map(
                function (
                    $permissions,
                    $module
                ) {
                    return [
                        'module' =>
                            $module,

                        'count' =>
                            $permissions->count(),

                        'permissions' =>
                            $permissions
                                ->map(
                                    fn (
                                        Permission $permission
                                    ) => [
                                        'id' =>
                                            $permission->id,

                                        'name' =>
                                            $permission->name,

                                        'action' =>
                                            str(
                                                $permission->name
                                            )
                                                ->after('.')
                                                ->toString(),
                                    ]
                                )
                                ->values(),
                    ];
                }
            )
            ->values();

        /*
        |--------------------------------------------------------------------------
        | Vista
        |--------------------------------------------------------------------------
        */

        return Inertia::render(
            'admin/permissions/index',
            [
                'modules' =>
                    $modules,

                'can' => [
                    'update' =>
                        $request->user()->can(
                            'permissions.update'
                        ),

                    'sync' =>
                        $request->user()->can(
                            'permissions.sync'
                        ),
                ],
            ]
        );
    }

    /**
     * Sincronizar permisos automáticamente.
     */
    public function sync(
        Request $request
    ): RedirectResponse {
        abort_unless(
            $request->user()->can('permissions.sync'),
            403
        );

        /*
        |--------------------------------------------------------------------------
        | Cantidad antes de sincronizar
        |--------------------------------------------------------------------------
        */

        $before = Permission::query()
            ->where(
                'guard_name',
                'web'
            )
            ->count();

        try {
            /*
            |--------------------------------------------------------------------------
            | Ejecutar comando
            |--------------------------------------------------------------------------
            |
            | Equivale a:
            |
            | php artisan permissions:sync-models --force
            |
            */

            $exitCode = Artisan::call(
                'permissions:sync-models',
                [
                    '--force' => true,
                ]
            );

            /*
            |--------------------------------------------------------------------------
            | Verificar resultado
            |--------------------------------------------------------------------------
            */

            if ($exitCode !== 0) {
                return back()->withErrors([
                    'permissions' =>
                        'No se pudo completar la sincronización de permisos.',
                ]);
            }

            /*
            |--------------------------------------------------------------------------
            | Limpiar caché de Spatie
            |--------------------------------------------------------------------------
            */

            app(PermissionRegistrar::class)
                ->forgetCachedPermissions();

            /*
            |--------------------------------------------------------------------------
            | Cantidad después
            |--------------------------------------------------------------------------
            */

            $after = Permission::query()
                ->where(
                    'guard_name',
                    'web'
                )
                ->count();

            $created =
                max(
                    0,
                    $after - $before
                );

            /*
            |--------------------------------------------------------------------------
            | Respuesta
            |--------------------------------------------------------------------------
            */

            if ($created === 0) {
                return back()->with(
                    'success',
                    'Todos los permisos ya estaban sincronizados.'
                );
            }

            return back()->with(
                'success',
                $created === 1
                    ? 'Se creó 1 permiso nuevo correctamente.'
                    : "Se crearon {$created} permisos nuevos correctamente."
            );

        } catch (Throwable $exception) {

            report($exception);

            return back()->withErrors([
                'permissions' =>
                    'Ocurrió un error al sincronizar los permisos.',
            ]);
        }
    }
}