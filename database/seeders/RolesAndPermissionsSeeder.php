<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)
            ->forgetCachedPermissions();

        $permissions = [

            // Dashboard
            'dashboard.view',

            // Usuarios
            'users.view',
            'users.create',
            'users.update',
            'users.delete',
            'users.roles.update',

            // Roles
            'roles.view',
            'roles.create',
            'roles.update',
            'roles.delete',

            // Permisos
            'permissions.view',
            'permissions.update',

            // Sitios web
            'websites.view',
            'websites.create',
            'websites.update',
            'websites.delete',
            'websites.activate',
            'websites.deactivate',
            'websites.files',

            // Cuotas
            'websites.quota.view',
            'websites.quota.update',

            // Bases de datos
            'databases.view',
            'databases.create',
            'databases.update',
            'databases.delete',

            // SSL
            'ssl.view',
            'ssl.create',
            'ssl.delete',

            // Servidor
            'server.view',
            'server.manage',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web',
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Administrador
        |--------------------------------------------------------------------------
        */

        $admin = Role::firstOrCreate([
            'name' => 'administrador',
            'guard_name' => 'web',
        ]);

        $admin->syncPermissions(
            Permission::all()
        );

        /*
        |--------------------------------------------------------------------------
        | Cliente
        |--------------------------------------------------------------------------
        */

        $cliente = Role::firstOrCreate([
            'name' => 'cliente',
            'guard_name' => 'web',
        ]);

        $cliente->syncPermissions([
            'dashboard.view',

            'websites.view',
            'websites.files',

            'websites.quota.view',

            'databases.view',

            'ssl.view',
        ]);

        app(PermissionRegistrar::class)
            ->forgetCachedPermissions();
    }
}