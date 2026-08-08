<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Services\AuditService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class TrackNavigation
{
    /**
     * Registrar navegación del usuario.
     */
    public function handle(
        Request $request,
        Closure $next
    ): Response {
        /*
        |--------------------------------------------------------------------------
        | Primero procesar la petición
        |--------------------------------------------------------------------------
        */

        $response = $next($request);

        $user = $request->user();

        if (! $user) {
            return $response;
        }

        /*
        |--------------------------------------------------------------------------
        | Solamente GET
        |--------------------------------------------------------------------------
        */

        if (! $request->isMethod('GET')) {
            return $response;
        }

        /*
        |--------------------------------------------------------------------------
        | Ignorar actualizaciones parciales de Inertia
        |--------------------------------------------------------------------------
        |
        | Esto evita registrar los router.reload() que usamos para:
        |
        | - presencia
        | - auditoría automática
        | - actividad automática
        |
        */

        if (
            $request->headers->has(
                'X-Inertia-Partial-Data'
            )
            || $request->headers->has(
                'X-Inertia-Partial-Component'
            )
        ) {
            return $response;
        }

        /*
        |--------------------------------------------------------------------------
        | Ruta actual
        |--------------------------------------------------------------------------
        */

        $routeName =
            $request->route()?->getName();

        if (! $routeName) {
            return $response;
        }

        /*
        |--------------------------------------------------------------------------
        | Determinar información de navegación
        |--------------------------------------------------------------------------
        */

        $navigation =
            $this->navigationData(
                $request,
                $routeName
            );

        /*
        |--------------------------------------------------------------------------
        | Ruta no monitorizada
        |--------------------------------------------------------------------------
        */

        if (! $navigation) {
            return $response;
        }

        /*
        |--------------------------------------------------------------------------
        | Evitar registros duplicados
        |--------------------------------------------------------------------------
        |
        | Si entra repetidamente a la misma ruta en menos de 2 minutos,
        | solamente guardaremos una visita.
        |
        */

        $cacheKey = sprintf(
            'audit-navigation:%s:%s:%s',
            $user->id,
            $routeName,
            md5($request->path())
        );

        $firstVisit = Cache::add(
            $cacheKey,
            true,
            now()->addMinutes(2)
        );

        if (! $firstVisit) {
            return $response;
        }

        /*
        |--------------------------------------------------------------------------
        | Guardar auditoría
        |--------------------------------------------------------------------------
        */

        app(AuditService::class)->log(
            event: 'page_view',

            subject:
                $navigation['subject'] ?? null,

            module:
                $navigation['module'],

            description:
                $navigation['description'],

            actor:
                $user,
        );

        return $response;
    }

    /**
     * Información correspondiente a cada página.
     */
    private function navigationData(
        Request $request,
        string $routeName
    ): ?array {
        /*
        |--------------------------------------------------------------------------
        | Dashboard
        |--------------------------------------------------------------------------
        */

        if ($routeName === 'dashboard') {
            return [
                'module' => 'dashboard',

                'description' =>
                    'Entró al Dashboard.',
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | Usuarios
        |--------------------------------------------------------------------------
        */

        if ($routeName === 'admin.users.index') {
            return [
                'module' => 'users',

                'description' =>
                    'Entró al módulo Usuarios.',
            ];
        }

        if ($routeName === 'admin.users.create') {
            return [
                'module' => 'users',

                'description' =>
                    'Abrió el formulario para crear un usuario.',
            ];
        }

        if ($routeName === 'admin.users.edit') {
            $subject =
                $request->route('user');

            return [
                'module' => 'users',

                'subject' =>
                    $subject instanceof User
                        ? $subject
                        : null,

                'description' =>
                    $subject instanceof User
                        ? "Abrió la administración del usuario {$subject->name}."
                        : 'Abrió la administración de un usuario.',
            ];
        }

        if ($routeName === 'admin.users.activity') {
            $subject =
                $request->route('user');

            return [
                'module' => 'users',

                'subject' =>
                    $subject instanceof User
                        ? $subject
                        : null,

                'description' =>
                    $subject instanceof User
                        ? "Consultó la actividad del usuario {$subject->name}."
                        : 'Consultó la actividad de un usuario.',
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | Roles
        |--------------------------------------------------------------------------
        */

        if ($routeName === 'admin.roles.index') {
            return [
                'module' => 'roles',

                'description' =>
                    'Entró al módulo Roles.',
            ];
        }

        if ($routeName === 'admin.roles.create') {
            return [
                'module' => 'roles',

                'description' =>
                    'Abrió el formulario para crear un rol.',
            ];
        }

        if ($routeName === 'admin.roles.edit') {
            return [
                'module' => 'roles',

                'description' =>
                    'Abrió la edición de un rol.',
            ];
        }

        if ($routeName === 'admin.roles.show') {
            return [
                'module' => 'roles',

                'description' =>
                    'Consultó los detalles de un rol.',
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | Permisos
        |--------------------------------------------------------------------------
        */

        if ($routeName === 'admin.permissions.index') {
            return [
                'module' => 'permissions',

                'description' =>
                    'Entró al módulo Permisos.',
            ];
        }

        if ($routeName === 'admin.permissions.edit') {
            return [
                'module' => 'permissions',

                'description' =>
                    'Abrió la edición de permisos.',
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | Auditoría
        |--------------------------------------------------------------------------
        */

        if ($routeName === 'admin.audit.index') {
            return [
                'module' => 'audit_logs',

                'description' =>
                    'Entró al módulo Auditoría.',
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | No registrar otras rutas
        |--------------------------------------------------------------------------
        */

        return null;
    }
}