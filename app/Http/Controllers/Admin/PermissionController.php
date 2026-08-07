<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller
{
    public function index(
        Request $request
    ): Response {
        abort_unless(
            $request->user()->can('permissions.view'),
            403
        );

        $permissions = Permission::query()
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

                    'count' =>
                        $permissions->count(),

                    'permissions' =>
                        $permissions
                            ->map(fn ($permission) => [
                                'id' =>
                                    $permission->id,

                                'name' =>
                                    $permission->name,
                            ])
                            ->values(),
                ];
            })
            ->values();

        return Inertia::render(
            'admin/permissions/index',
            [
                'modules' => $permissions,

                'can' => [
                    'update' =>
                        $request->user()
                            ->can(
                                'permissions.update'
                            ),
                ],
            ]
        );
    }
}