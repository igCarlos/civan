<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\File;
use ReflectionClass;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class SyncModelPermissions extends Command
{
    protected $signature = 'permissions:sync-models
                            {--force : Crear permisos sin solicitar confirmación}';

    protected $description =
        'Detecta modelos y crea únicamente los permisos faltantes';

    public function handle(): int
    {
        app(PermissionRegistrar::class)
            ->forgetCachedPermissions();

        $modelsPath = app_path('Models');

        if (! File::exists($modelsPath)) {
            $this->error('No existe el directorio app/Models.');

            return self::FAILURE;
        }

        /*
        |--------------------------------------------------------------------------
        | Buscar modelos
        |--------------------------------------------------------------------------
        */

        $models = $this->discoverModels($modelsPath);

        if (empty($models)) {
            $this->warn(
                'No se encontraron modelos Eloquent en app/Models.'
            );

            return self::SUCCESS;
        }

        $missingPermissions = [];

        $this->newLine();
        $this->info('Analizando modelos...');
        $this->newLine();

        /*
        |--------------------------------------------------------------------------
        | Revisar permisos de modelos
        |--------------------------------------------------------------------------
        */

        foreach ($models as $class) {
            $reflection = new ReflectionClass($class);

            $modelName = $reflection->getShortName();

            /*
             * Modelos excluidos desde config/model-permissions.php
             */
            if (
                in_array(
                    $modelName,
                    config(
                        'model-permissions.excluded_models',
                        []
                    ),
                    true
                )
            ) {
                $this->line(
                    "<fg=yellow>Ignorado:</> {$modelName}"
                );

                continue;
            }

            /** @var Model $model */
            $model = new $class();

            /*
             * Utilizamos la tabla definida por el modelo.
             *
             * User -> users
             */
            $module = $model->getTable();

            $actions = config(
                'model-permissions.actions',
                []
            );

            $extraActions = config(
                "model-permissions.extra_actions.{$modelName}",
                []
            );

            $actions = array_values(
                array_unique([
                    ...$actions,
                    ...$extraActions,
                ])
            );

            $this->info(
                "{$modelName} → {$module}"
            );

            foreach ($actions as $action) {
                $permissionName =
                    "{$module}.{$action}";

                $exists = Permission::query()
                    ->where(
                        'name',
                        $permissionName
                    )
                    ->where(
                        'guard_name',
                        'web'
                    )
                    ->exists();

                if ($exists) {
                    $this->line(
                        "  <fg=green>✓</> {$permissionName}"
                    );

                    continue;
                }

                $this->line(
                    "  <fg=red>✗</> {$permissionName}"
                );

                $missingPermissions[] =
                    $permissionName;
            }

            $this->newLine();
        }

        /*
        |--------------------------------------------------------------------------
        | Revisar permisos administrativos
        |--------------------------------------------------------------------------
        */

        $this->info(
            'Permisos administrativos'
        );

        foreach (
            config(
                'model-permissions.system_permissions',
                []
            ) as $permissionName
        ) {
            $exists = Permission::query()
                ->where(
                    'name',
                    $permissionName
                )
                ->where(
                    'guard_name',
                    'web'
                )
                ->exists();

            if ($exists) {
                $this->line(
                    "  <fg=green>✓</> {$permissionName}"
                );

                continue;
            }

            $this->line(
                "  <fg=red>✗</> {$permissionName}"
            );

            $missingPermissions[] =
                $permissionName;
        }

        /*
        |--------------------------------------------------------------------------
        | Evitar duplicados
        |--------------------------------------------------------------------------
        */

        $missingPermissions = array_values(
            array_unique($missingPermissions)
        );

        $this->newLine();

        /*
        |--------------------------------------------------------------------------
        | No falta nada
        |--------------------------------------------------------------------------
        */

        if (empty($missingPermissions)) {
            $this->info(
                '✓ Todos los permisos están sincronizados.'
            );

            /*
             * Aseguramos que el administrador conserve
             * todos los permisos existentes.
             */
            $this->syncAdministrator();

            return self::SUCCESS;
        }

        /*
        |--------------------------------------------------------------------------
        | Mostrar resumen
        |--------------------------------------------------------------------------
        */

        $total = count($missingPermissions);

        $this->warn(
            "Se encontraron {$total} permisos faltantes."
        );

        $this->newLine();

        foreach ($missingPermissions as $permission) {
            $this->line(
                "  + {$permission}"
            );
        }

        $this->newLine();

        /*
        |--------------------------------------------------------------------------
        | Confirmación
        |--------------------------------------------------------------------------
        */

        if (! $this->option('force')) {
            $confirmed = $this->confirm(
                "¿Deseas crear estos {$total} permisos?",
                false
            );

            if (! $confirmed) {
                $this->warn(
                    'Operación cancelada. No se modificó la base de datos.'
                );

                return self::SUCCESS;
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Crear solamente faltantes
        |--------------------------------------------------------------------------
        */

        $created = 0;

        $this->newLine();
        $this->info('Creando permisos...');
        $this->newLine();

        foreach ($missingPermissions as $permissionName) {
            $permission = Permission::firstOrCreate([
                'name' => $permissionName,
                'guard_name' => 'web',
            ]);

            if ($permission->wasRecentlyCreated) {
                $this->line(
                    "  <fg=green>+</> {$permissionName}"
                );

                $created++;
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Administrador
        |--------------------------------------------------------------------------
        */

        $this->syncAdministrator();

        /*
        |--------------------------------------------------------------------------
        | Limpiar caché Spatie
        |--------------------------------------------------------------------------
        */

        app(PermissionRegistrar::class)
            ->forgetCachedPermissions();

        $this->newLine();

        $this->info(
            "✓ {$created} permisos creados correctamente."
        );

        $this->info(
            '✓ Rol administrador actualizado.'
        );

        return self::SUCCESS;
    }

    /**
     * Busca únicamente modelos Eloquent reales
     * dentro de app/Models.
     */
    private function discoverModels(
        string $modelsPath
    ): array {
        $models = [];

        foreach (File::allFiles($modelsPath) as $file) {
            $relativePath =
                $file->getRelativePathname();

            if (
                ! str_ends_with(
                    $relativePath,
                    '.php'
                )
            ) {
                continue;
            }

            /*
             * Quitar .php
             */
            $relativeClass = substr(
                $relativePath,
                0,
                -4
            );

            /*
             * Convertir:
             *
             * User
             * Admin/User
             *
             * en:
             *
             * App\Models\User
             * App\Models\Admin\User
             */
            $relativeClass = str_replace(
                ['/', '\\'],
                '\\',
                $relativeClass
            );

            $class =
                'App\\Models\\' .
                $relativeClass;

            /*
             * Debe existir
             */
            if (! class_exists($class)) {
                continue;
            }

            /*
             * Debe ser Eloquent Model
             */
            if (
                ! is_subclass_of(
                    $class,
                    Model::class
                )
            ) {
                continue;
            }

            $reflection =
                new ReflectionClass($class);

            /*
             * No procesar modelos abstractos
             */
            if ($reflection->isAbstract()) {
                continue;
            }

            $models[] = $class;
        }

        return $models;
    }

    /**
     * El rol administrador siempre recibe
     * todos los permisos del guard web.
     */
    private function syncAdministrator(): void
    {
        $administrator = Role::firstOrCreate([
            'name' => 'administrador',
            'guard_name' => 'web',
        ]);

        $administrator->syncPermissions(
            Permission::query()
                ->where(
                    'guard_name',
                    'web'
                )
                ->get()
        );
    }
}