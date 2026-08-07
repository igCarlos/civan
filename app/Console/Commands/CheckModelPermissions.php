<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\File;
use ReflectionClass;
use Spatie\Permission\Models\Permission;

class CheckModelPermissions extends Command
{
    protected $signature = 'permissions:check-models
                            {--details : Mostrar todos los permisos de cada modelo}';

    protected $description =
        'Verifica los modelos existentes y muestra cuáles tienen permisos faltantes';

    public function handle(): int
    {
        $modelsPath = app_path('Models');

        if (! File::exists($modelsPath)) {
            $this->error('No existe el directorio app/Models.');

            return self::FAILURE;
        }

        $models = $this->discoverModels($modelsPath);

        if (empty($models)) {
            $this->warn('No se encontraron modelos Eloquent en app/Models.');

            return self::SUCCESS;
        }

        $this->newLine();
        $this->info('Analizando modelos...');
        $this->newLine();

        $modelsCount = 0;
        $completeModels = 0;
        $incompleteModels = 0;

        $expectedCount = 0;
        $existingCount = 0;
        $missingCount = 0;

        $summaryRows = [];

        foreach ($models as $class) {
            $reflection = new ReflectionClass($class);
            $modelName = $reflection->getShortName();

            /*
            |--------------------------------------------------------------------------
            | Modelos excluidos
            |--------------------------------------------------------------------------
            */

            if (
                in_array(
                    $modelName,
                    config('model-permissions.excluded_models', []),
                    true
                )
            ) {
                continue;
            }

            /** @var Model $model */
            $model = new $class();

            /*
             * Nombre REAL de la tabla:
             *
             * User    -> users
             * Website -> websites
             */
            $module = $model->getTable();

            /*
            |--------------------------------------------------------------------------
            | Acciones
            |--------------------------------------------------------------------------
            */

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

            /*
            |--------------------------------------------------------------------------
            | Permisos esperados
            |--------------------------------------------------------------------------
            */

            $expectedPermissions = array_map(
                fn (string $action) =>
                    "{$module}.{$action}",
                $actions
            );

            /*
            |--------------------------------------------------------------------------
            | Permisos existentes
            |--------------------------------------------------------------------------
            */

            $existingPermissions = Permission::query()
                ->where('guard_name', 'web')
                ->whereIn('name', $expectedPermissions)
                ->pluck('name')
                ->all();

            $missingPermissions = array_values(
                array_diff(
                    $expectedPermissions,
                    $existingPermissions
                )
            );

            $modelsCount++;

            $expected = count($expectedPermissions);
            $existing = count($existingPermissions);
            $missing = count($missingPermissions);

            $expectedCount += $expected;
            $existingCount += $existing;
            $missingCount += $missing;

            if ($missing === 0) {
                $completeModels++;
                $status = '✓ Completo';
            } else {
                $incompleteModels++;
                $status = "✗ Faltan {$missing}";
            }

            $summaryRows[] = [
                $modelName,
                $module,
                $expected,
                $existing,
                $missing,
                $status,
            ];

            /*
            |--------------------------------------------------------------------------
            | Mostrar detalle
            |--------------------------------------------------------------------------
            */

            if ($this->option('details')) {
                $this->info(
                    "{$modelName} → {$module}"
                );

                foreach ($expectedPermissions as $permission) {
                    if (
                        in_array(
                            $permission,
                            $existingPermissions,
                            true
                        )
                    ) {
                        $this->line(
                            "  <fg=green>✓</> {$permission}"
                        );
                    } else {
                        $this->line(
                            "  <fg=red>✗</> {$permission}"
                        );
                    }
                }

                $this->newLine();
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Tabla resumen
        |--------------------------------------------------------------------------
        */

        $this->table(
            [
                'Modelo',
                'Tabla',
                'Esperados',
                'Existentes',
                'Faltantes',
                'Estado',
            ],
            $summaryRows
        );

        /*
        |--------------------------------------------------------------------------
        | Permisos del sistema
        |--------------------------------------------------------------------------
        */

        $systemPermissions = config(
            'model-permissions.system_permissions',
            []
        );

        $existingSystemPermissions = Permission::query()
            ->where('guard_name', 'web')
            ->whereIn('name', $systemPermissions)
            ->pluck('name')
            ->all();

        $missingSystemPermissions = array_values(
            array_diff(
                $systemPermissions,
                $existingSystemPermissions
            )
        );

        $this->newLine();
        $this->info('Permisos administrativos');

        if (empty($missingSystemPermissions)) {
            $this->line(
                '<fg=green>✓ Todos los permisos administrativos existen.</>'
            );
        } else {
            foreach ($missingSystemPermissions as $permission) {
                $this->line(
                    "  <fg=red>✗</> {$permission}"
                );
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Resumen final
        |--------------------------------------------------------------------------
        */

        $totalMissing =
            $missingCount +
            count($missingSystemPermissions);

        $this->newLine();
        $this->info('RESUMEN');
        $this->newLine();

        $this->line(
            "Modelos encontrados:        {$modelsCount}"
        );

        $this->line(
            "Modelos completos:          {$completeModels}"
        );

        $this->line(
            "Modelos con faltantes:      {$incompleteModels}"
        );

        $this->line(
            "Permisos esperados modelos: {$expectedCount}"
        );

        $this->line(
            "Permisos existentes:        {$existingCount}"
        );

        $this->line(
            "Permisos faltantes modelos: {$missingCount}"
        );

        $this->line(
            'Permisos sistema faltantes: ' .
            count($missingSystemPermissions)
        );

        $this->newLine();

        if ($totalMissing > 0) {
            $this->warn(
                "Hay {$totalMissing} permisos pendientes."
            );

            $this->newLine();

            $this->line(
                'Ejecuta:'
            );

            $this->line(
                '<fg=cyan>php artisan permissions:sync-models</>'
            );

            return self::FAILURE;
        }

        $this->info(
            '✓ Todos los modelos tienen sus permisos.'
        );

        return self::SUCCESS;
    }

    /**
     * Busca solamente modelos dentro de app/Models.
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

            $class =
                'App\\Models\\' .
                str_replace(
                    ['/', '\\', '.php'],
                    ['\\', '\\', ''],
                    $relativePath
                );

            if (! class_exists($class)) {
                continue;
            }

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

            if ($reflection->isAbstract()) {
                continue;
            }

            $models[] = $class;
        }

        return $models;
    }
}