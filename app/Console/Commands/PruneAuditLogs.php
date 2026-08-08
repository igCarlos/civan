<?php

namespace App\Console\Commands;

use App\Services\AuditRetentionService;
use App\Services\AuditService;
use Illuminate\Console\Command;

class PruneAuditLogs extends Command
{
    /**
     * Nombre y opciones del comando.
     */
    protected $signature =
        'audit:prune
        {--dry-run : Mostrar cuántos registros se eliminarían sin borrar nada}';

    /**
     * Descripción.
     */
    protected $description =
        'Elimina registros antiguos de navegación de la auditoría según la política de retención.';

    /**
     * Ejecutar comando.
     */
    public function handle(
        AuditRetentionService $retention
    ): int {
        /*
        |--------------------------------------------------------------------------
        | Obtener configuración desde AuditRetentionService
        |--------------------------------------------------------------------------
        |
        | Este servicio primero consulta system_settings.
        | Si no existe una configuración guardada, usa config/audit.php
        | como valor por defecto.
        |
        */

        $stats =
            $retention->stats();

        $days =
            $stats[
                'retention_days'
            ];

        $cutoff =
            $stats[
                'cutoff'
            ];

        $total =
            $stats[
                'eligible_count'
            ];

        /*
        |--------------------------------------------------------------------------
        | Resumen
        |--------------------------------------------------------------------------
        */

        $this->newLine();

        $this->info(
            'Política de retención de Auditoría'
        );

        $this->line(
            'Evento: page_view'
        );

        $this->line(
            "Retención: {$days} días"
        );

        $this->line(
            'Eliminar anteriores a: ' .
            $cutoff->format(
                'd/m/Y H:i:s'
            )
        );

        $this->line(
            "Registros encontrados: {$total}"
        );

        /*
        |--------------------------------------------------------------------------
        | Nada que limpiar
        |--------------------------------------------------------------------------
        */

        if ($total === 0) {
            $this->newLine();

            $this->info(
                '✓ No existen registros antiguos de navegación para eliminar.'
            );

            return self::SUCCESS;
        }

        /*
        |--------------------------------------------------------------------------
        | Simulación
        |--------------------------------------------------------------------------
        */

        if (
            $this->option(
                'dry-run'
            )
        ) {
            $this->newLine();

            $this->warn(
                "Simulación: se eliminarían {$total} registros."
            );

            $this->info(
                'No se modificó la base de datos.'
            );

            return self::SUCCESS;
        }

        /*
        |--------------------------------------------------------------------------
        | Ejecutar limpieza
        |--------------------------------------------------------------------------
        |
        | La lógica real está centralizada en AuditRetentionService.
        | Así la interfaz web y Artisan usan exactamente la misma política.
        |
        */

        $result =
            $retention->prune();

        /*
        |--------------------------------------------------------------------------
        | Registrar limpieza
        |--------------------------------------------------------------------------
        |
        | Si se ejecuta desde Artisan/Scheduler no existe usuario web
        | autenticado, por lo que aparecerá como "Sistema".
        |
        */

        app(AuditService::class)->log(
            event:
                'audit_prune',

            module:
                'audit_logs',

            description:
                "El sistema eliminó {$result['deleted_count']} registros antiguos de navegación.",

            newValues:
                $result,
        );

        /*
        |--------------------------------------------------------------------------
        | Resultado
        |--------------------------------------------------------------------------
        */

        $this->newLine();

        $this->info(
            "✓ {$result['deleted_count']} registros antiguos de navegación eliminados."
        );

        $this->info(
            '✓ Los demás eventos de auditoría fueron conservados.'
        );

        return self::SUCCESS;
    }
}
