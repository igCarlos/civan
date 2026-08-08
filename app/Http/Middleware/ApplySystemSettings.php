<?php

namespace App\Http\Middleware;

use App\Services\SystemSettingsService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class ApplySystemSettings
{
    /**
     * Aplicar configuraciones globales de CIVAN antes de procesar la petición.
     *
     * IMPORTANTE:
     * - Laravel y la base de datos trabajan internamente en UTC.
     * - system.timezone es SOLO la zona horaria de presentación.
     * - El idioma sí puede aplicarse globalmente durante la petición.
     */
    public function handle(
        Request $request,
        Closure $next
    ): Response {
        try {
            if (
                ! Schema::hasTable(
                    'system_settings'
                )
            ) {
                return $next(
                    $request
                );
            }

            $settings =
                app(
                    SystemSettingsService::class
                )->general();

            /*
            |--------------------------------------------------------------------------
            | Zona horaria de presentación
            |--------------------------------------------------------------------------
            |
            | NO hacemos:
            |
            | config(['app.timezone' => ...]);
            | date_default_timezone_set(...);
            |
            | Hacerlo provocaría que timestamps guardados en UTC fueran
            | interpretados como si ya pertenecieran a America/Managua,
            | generando errores como "6 hours from now".
            |
            | La conversión se realiza únicamente al presentar fechas mediante
            | SystemDateTimeService.
            |
            */

            /*
            |--------------------------------------------------------------------------
            | Idioma
            |--------------------------------------------------------------------------
            */

            if (
                ! empty(
                    $settings['locale']
                )
            ) {
                config([
                    'app.locale' =>
                        $settings['locale'],
                ]);

                app()->setLocale(
                    $settings['locale']
                );
            }
        } catch (Throwable $exception) {
            /*
            |--------------------------------------------------------------------------
            | No bloquear CIVAN por una configuración global
            |--------------------------------------------------------------------------
            */

            report(
                $exception
            );
        }

        return $next(
            $request
        );
    }
}
