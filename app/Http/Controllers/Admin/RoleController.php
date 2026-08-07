<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
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

    public function create(Request $request): Response
    {
        abort_unless(
            $request->user()->can('roles.create'),
            403
        );

        return Inertia::render(
            'admin/roles/create',
            [
                'modules' => $this->permissionModules(),
            ]
        );
    }

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
                'exists:permissions,id',
            ],
        ]);

        $role = Role::create([
            'name' => strtolower(
                trim($validated['name'])
            ),

            'guard_name' => 'web',
        ]);

        $permissions = Permission::query()
            ->where('guard_name', 'web')
            ->whereIn(
                'id',
                $validated['permission_ids'] ?? []
            )
            ->get();

        $role->syncPermissions($permissions);

        app(PermissionRegistrar::class)
            ->forgetCachedPermissions();

        return redirect()
            ->route('admin.roles.index')
            ->with(
                'success',
                'Rol creado correctamente.'
            );
    }

    public function edit(
        Request $request,
        Role $role
    ): Response {
        abort_unless(
            $request->user()->can('roles.update'),
            403
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

    public function update(
        Request $request,
        Role $role
    ): RedirectResponse {
        abort_unless(
            $request->user()->can('roles.update'),
            403
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
                'exists:permissions,id',
            ],
        ]);

        /*
         * El administrador no puede renombrarse.
         */
        if (! $isAdministrator) {
            $role->update([
                'name' => strtolower(
                    trim($validated['name'])
                ),
            ]);
        }

        /*
         * El administrador siempre conserva
         * TODOS los permisos.
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
        }

        app(PermissionRegistrar::class)
            ->forgetCachedPermissions();

        return redirect()
            ->route('admin.roles.index')
            ->with(
                'success',
                'Rol actualizado correctamente.'
            );
    }

    public function destroy(
        Request $request,
        Role $role
    ): RedirectResponse {
        abort_unless(
            $request->user()->can('roles.delete'),
            403
        );

        if ($role->name === 'administrador') {
            return back()->withErrors([
                'role' =>
                    'El rol administrador no puede eliminarse.',
            ]);
        }

        if ($role->users()->exists()) {
            return back()->withErrors([
                'role' =>
                    'No puedes eliminar un rol que tiene usuarios asignados.',
            ]);
        }

        $role->delete();

        app(PermissionRegistrar::class)
            ->forgetCachedPermissions();

        return back()->with(
            'success',
            'Rol eliminado correctamente.'
        );
    }

    private function permissionModules(): array
    {
        return Permission::query()
            ->where('guard_name', 'web')
            ->orderBy('name')
            ->get()
            ->groupBy(function (Permission $permission) {
                return explode(
                    '.',
                    $permission->name
                )[0];
            })
            ->map(function ($permissions, $module) {
                return [
                    'module' => $module,

                    'permissions' =>
                        $permissions
                            ->map(fn ($permission) => [
                                'id' => $permission->id,
                                'name' => $permission->name,

                                'action' =>
                                    str($permission->name)
                                        ->after('.')
                                        ->toString(),
                            ])
                            ->values(),
                ];
            })
            ->values()
            ->all();
    }
}