<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\AuditService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;


class RoleController extends Controller
{
    /**
     * Listado de roles.
     */
    public function index(Request $request): Response
    {
        abort_unless(
            $request->user()->can('roles.view'),
            403
        );

        $roles = Role::query()
            ->where('guard_name', 'web')
            ->withCount([
                'permissions',
                'users',
            ])
            ->orderBy('name')
            ->get()
            ->map(fn (Role $role) => [
                'id' => $role->id,
                'name' => $role->name,

                'permissions_count' =>
                    $role->permissions_count,

                'users_count' =>
                    $role->users_count,

                'protected' =>
                    $role->name === 'administrador',
            ]);

        return Inertia::render(
            'admin/roles/index',
            [
                'roles' => $roles,

                'can' => [
                    'create' =>
                        $request->user()->can('roles.create'),

                    'update' =>
                        $request->user()->can('roles.update'),

                    'delete' =>
                        $request->user()->can('roles.delete'),
                ],
            ]
        );
    }

    /**
     * Formulario para crear rol.
     */
    public function create(Request $request): Response
    {
        abort_unless(
            $request->user()->can('roles.create'),
            403
        );

        return Inertia::render(
            'admin/roles/create',
            [
                'modules' =>
                    $this->permissionModules(),
            ]
        );
    }

    /**
     * Crear rol.
     */
    public function store(
        Request $request
    ): RedirectResponse {
        abort_unless(
            $request->user()->can('roles.create'),
            403
        );

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:100',

                Rule::unique(
                    'roles',
                    'name'
                )->where(
                    fn ($query) =>
                        $query->where(
                            'guard_name',
                            'web'
                        )
                ),
            ],

            'permission_ids' => [
                'nullable',
                'array',
            ],

            'permission_ids.*' => [
                'integer',

                Rule::exists(
                    'permissions',
                    'id'
                )->where(
                    fn ($query) =>
                        $query->where(
                            'guard_name',
                            'web'
                        )
                ),
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | Crear rol
        |--------------------------------------------------------------------------
        */

        $role = Role::create([
            'name' => strtolower(
                trim($validated['name'])
            ),

            'guard_name' => 'web',
        ]);

        /*
        |--------------------------------------------------------------------------
        | Asignar permisos
        |--------------------------------------------------------------------------
        */

        $permissions = Permission::query()
            ->where('guard_name', 'web')
            ->whereIn(
                'id',
                $validated['permission_ids'] ?? []
            )
            ->get();

        $role->syncPermissions(
            $permissions
        );

        app(PermissionRegistrar::class)
            ->forgetCachedPermissions();

        /*
        |--------------------------------------------------------------------------
        | Auditoría: creación de rol
        |--------------------------------------------------------------------------
        */

        $role->load('permissions');

        app(AuditService::class)->log(
            event: 'create',

            subject: $role,

            module: 'roles',

            description:
                "Creó el rol {$role->name}.",

            newValues: [
                'name' =>
                    $role->name,

                'guard_name' =>
                    $role->guard_name,

                'permissions' =>
                    $role->permissions
                        ->pluck('name')
                        ->sort()
                        ->values()
                        ->all(),
            ],
        );

        return redirect()
            ->route('admin.roles.index')
            ->with(
                'success',
                'Rol creado correctamente.'
            );
    }

    /**
     * Formulario para editar rol.
     */
    public function edit(
        Request $request,
        Role $role
    ): Response {
        abort_unless(
            $request->user()->can('roles.update'),
            403
        );

        /*
        |--------------------------------------------------------------------------
        | Solamente roles del guard web
        |--------------------------------------------------------------------------
        */

        abort_unless(
            $role->guard_name === 'web',
            404
        );

        $role->load('permissions');

        return Inertia::render(
            'admin/roles/edit',
            [
                'role' => [
                    'id' => $role->id,

                    'name' => $role->name,

                    'protected' =>
                        $role->name === 'administrador',

                    'permission_ids' =>
                        $role->permissions
                            ->pluck('id')
                            ->values(),
                ],

                'modules' =>
                    $this->permissionModules(),
            ]
        );
    }

    /**
     * Actualizar rol.
     */
    public function update(
        Request $request,
        Role $role
    ): RedirectResponse {
        abort_unless(
            $request->user()->can('roles.update'),
            403
        );

        /*
        |--------------------------------------------------------------------------
        | Solamente roles del guard web
        |--------------------------------------------------------------------------
        */

        abort_unless(
            $role->guard_name === 'web',
            404
        );

        $isAdministrator =
            $role->name === 'administrador';

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:100',

                Rule::unique(
                    'roles',
                    'name'
                )
                    ->ignore($role->id)
                    ->where(
                        fn ($query) =>
                            $query->where(
                                'guard_name',
                                'web'
                            )
                    ),
            ],

            'permission_ids' => [
                'nullable',
                'array',
            ],

            'permission_ids.*' => [
                'integer',

                Rule::exists(
                    'permissions',
                    'id'
                )->where(
                    fn ($query) =>
                        $query->where(
                            'guard_name',
                            'web'
                        )
                ),
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | Estado anterior
        |--------------------------------------------------------------------------
        */

        $oldName =
            $role->name;

        $oldPermissions =
            $role->permissions()
                ->orderBy('name')
                ->pluck('name')
                ->values()
                ->all();

        /*
        |--------------------------------------------------------------------------
        | Nombre
        |--------------------------------------------------------------------------
        |
        | El administrador no puede renombrarse.
        |
        */

        if (! $isAdministrator) {
            $role->update([
                'name' => strtolower(
                    trim($validated['name'])
                ),
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Permisos
        |--------------------------------------------------------------------------
        |
        | El administrador siempre conserva TODOS los permisos.
        |
        */

        if ($isAdministrator) {
            $role->syncPermissions(
                Permission::query()
                    ->where(
                        'guard_name',
                        'web'
                    )
                    ->get()
            );
        } else {
            $permissions =
                Permission::query()
                    ->where(
                        'guard_name',
                        'web'
                    )
                    ->whereIn(
                        'id',
                        $validated['permission_ids'] ?? []
                    )
                    ->get();

            $role->syncPermissions(
                $permissions
            );
        }

        app(PermissionRegistrar::class)
            ->forgetCachedPermissions();

        /*
        |--------------------------------------------------------------------------
        | Estado nuevo
        |--------------------------------------------------------------------------
        */

        $role->refresh();

        $newName =
            $role->name;

        $newPermissions =
            $role->permissions()
                ->orderBy('name')
                ->pluck('name')
                ->values()
                ->all();

        /*
        |--------------------------------------------------------------------------
        | Auditoría: cambio de nombre
        |--------------------------------------------------------------------------
        */

        if ($oldName !== $newName) {
            app(AuditService::class)->log(
                event: 'update',

                subject: $role,

                module: 'roles',

                description:
                    "Renombró el rol {$oldName} a {$newName}.",

                oldValues: [
                    'name' =>
                        $oldName,
                ],

                newValues: [
                    'name' =>
                        $newName,
                ],
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Auditoría: cambio de permisos del rol
        |--------------------------------------------------------------------------
        */

        if (
            $oldPermissions !==
            $newPermissions
        ) {
            app(AuditService::class)->log(
                event: 'permission_change',

                subject: $role,

                module: 'roles',

                description:
                    "Modificó los permisos del rol {$role->name}.",

                oldValues: [
                    'permissions' =>
                        $oldPermissions,
                ],

                newValues: [
                    'permissions' =>
                        $newPermissions,
                ],
            );
        }

        return redirect()
            ->route('admin.roles.index')
            ->with(
                'success',
                'Rol actualizado correctamente.'
            );
    }

    /**
     * Eliminar rol.
     */
    public function destroy(
        Request $request,
        Role $role
    ): RedirectResponse {
        abort_unless(
            $request->user()->can('roles.delete'),
            403
        );

        /*
        |--------------------------------------------------------------------------
        | Solamente roles del guard web
        |--------------------------------------------------------------------------
        */

        abort_unless(
            $role->guard_name === 'web',
            404
        );

        /*
        |--------------------------------------------------------------------------
        | Proteger administrador
        |--------------------------------------------------------------------------
        */

        if (
            $role->name ===
            'administrador'
        ) {
            return back()
                ->withErrors([
                    'role' =>
                        'El rol administrador no puede eliminarse.',
                ]);
        }

        /*
        |--------------------------------------------------------------------------
        | No eliminar roles asignados
        |--------------------------------------------------------------------------
        */

        if (
            $role->users()
                ->exists()
        ) {
            return back()
                ->withErrors([
                    'role' =>
                        'No puedes eliminar un rol que tiene usuarios asignados.',
                ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Información antes de eliminar
        |--------------------------------------------------------------------------
        */

        $oldValues = [
            'id' =>
                $role->id,

            'name' =>
                $role->name,

            'guard_name' =>
                $role->guard_name,

            'permissions' =>
                $role->permissions()
                    ->orderBy('name')
                    ->pluck('name')
                    ->values()
                    ->all(),
        ];

        /*
        |--------------------------------------------------------------------------
        | Auditoría: eliminación
        |--------------------------------------------------------------------------
        |
        | Se registra antes de eliminar para conservar el nombre
        | y los permisos que tenía el rol.
        |
        */

        app(AuditService::class)->log(
            event: 'delete',

            subject: $role,

            module: 'roles',

            description:
                "Eliminó el rol {$role->name}.",

            oldValues:
                $oldValues,
        );

        /*
        |--------------------------------------------------------------------------
        | Eliminar
        |--------------------------------------------------------------------------
        */

        $role->delete();

        app(PermissionRegistrar::class)
            ->forgetCachedPermissions();

        return back()->with(
            'success',
            'Rol eliminado correctamente.'
        );
    }

    /**
     * Agrupar permisos por módulo.
     */
    private function permissionModules(): array
    {
        return Permission::query()
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

                        'permissions' =>
                            $permissions
                                ->map(
                                    fn (
                                        $permission
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
            ->values()
            ->all();
    }
}
