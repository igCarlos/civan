<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class UpdateUserLastSeen
{
    /**
     * Actualiza la última actividad del usuario.
     */
    public function handle(
        Request $request,
        Closure $next
    ): Response {
        $user = $request->user();

        if ($user) {

            /*
            |--------------------------------------------------------------------------
            | Evitar escribir en BD en cada petición
            |--------------------------------------------------------------------------
            |
            | Solo actualizamos last_seen_at cuando:
            |
            | - nunca se ha registrado
            | - o han pasado al menos 60 segundos
            |
            */

            $shouldUpdate =
                ! $user->last_seen_at
                || $user->last_seen_at->lt(
                    now()->subMinute()
                );

            if ($shouldUpdate) {

                /*
                |--------------------------------------------------------------------------
                | Usamos DB directamente
                |--------------------------------------------------------------------------
                |
                | Así no modificamos updated_at del usuario
                | y tampoco dispararemos eventos/observers del modelo.
                |
                */

                DB::table('users')
                    ->where(
                        'id',
                        $user->id
                    )
                    ->update([
                        'last_seen_at' => now(),
                    ]);

                /*
                |--------------------------------------------------------------------------
                | Actualizar también el modelo actual en memoria
                |--------------------------------------------------------------------------
                */

                $user->last_seen_at = now();
            }
        }

        return $next($request);
    }
}