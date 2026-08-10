<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\SystemSetting;

class UserActivityController extends Controller
{
    /**
     * Historial de actividad de un usuario.
     */
    public function index(
        Request $request,
        User $user
    ): Response {
        abort_unless(
            $request->user()->can('audit_logs.view'),
            403
        );

        $user->load('roles:id,name');

        /*
        |--------------------------------------------------------------------------
        | Presencia
        |--------------------------------------------------------------------------
        */

        $presence = 'offline';

        if ($user->last_seen_at) {
            if (
                $user->last_seen_at->gte(
                    now()->subMinutes(2)
                )
            ) {
                $presence = 'online';
            } elseif (
                $user->last_seen_at->gte(
                    now()->subMinutes(10)
                )
            ) {
                $presence = 'away';
            }
        }

        $perPage = (int) SystemSetting::valueOf(
            'system.per_page',
            20
        );

        /*
        |--------------------------------------------------------------------------
        | Actividad
        |--------------------------------------------------------------------------
        |
        | Incluye:
        |
        | 1. Acciones realizadas POR el usuario.
        | 2. Acciones realizadas SOBRE el usuario.
        |
        */

        $activities = AuditLog::query()
            ->with([
                'actor:id,name,email',
            ])
            ->where(function ($query) use ($user) {
                $query
                    ->where(
                        'actor_id',
                        $user->id
                    )
                    ->orWhere(function ($query) use ($user) {
                        $query
                            ->where(
                                'subject_type',
                                User::class
                            )
                            ->where(
                                'subject_id',
                                $user->id
                            );
                    });
            })
            ->latest('created_at')
            ->paginate($perPage)
            ->withQueryString()
            ->through(
                function (AuditLog $log) use ($user) {
                    $performedByUser =
                        (int) $log->actor_id ===
                        (int) $user->id;

                    $affectsUser =
                        $log->subject_type ===
                            User::class
                        && (int) $log->subject_id ===
                            (int) $user->id;

                    $relation = match (true) {
                        $performedByUser && $affectsUser =>
                            'self',

                        $performedByUser =>
                            'performed',

                        default =>
                            'affected',
                    };

                    return [
                        'id' => $log->id,

                        'event' =>
                            $log->event,

                        'module' =>
                            $log->module,

                        'description' =>
                            $log->description,

                        /*
                        |--------------------------------------------------------------------------
                        | Relación con el usuario
                        |--------------------------------------------------------------------------
                        */

                        'relation' =>
                            $relation,

                        /*
                        |--------------------------------------------------------------------------
                        | Actor
                        |--------------------------------------------------------------------------
                        */

                        'actor' => $log->actor
                            ? [
                                'id' =>
                                    $log->actor->id,

                                'name' =>
                                    $log->actor->name,

                                'email' =>
                                    $log->actor->email,
                            ]
                            : null,

                        /*
                        |--------------------------------------------------------------------------
                        | Registro afectado
                        |--------------------------------------------------------------------------
                        */

                        'subject_type' =>
                            $log->subject_type,

                        'subject_id' =>
                            $log->subject_id,

                        /*
                        |--------------------------------------------------------------------------
                        | Cambios
                        |--------------------------------------------------------------------------
                        */

                        'old_values' =>
                            $log->old_values ?? [],

                        'new_values' =>
                            $log->new_values ?? [],

                        /*
                        |--------------------------------------------------------------------------
                        | Información técnica
                        |--------------------------------------------------------------------------
                        */

                        'ip_address' =>
                            $log->ip_address,

                        'method' =>
                            $log->method,

                        'route' =>
                            $log->route,

                        'url' =>
                            $log->url,

                        'user_agent' =>
                            $log->user_agent,

                        /*
                        |--------------------------------------------------------------------------
                        | Fecha
                        |--------------------------------------------------------------------------
                        */

                        'created_at' =>
                            $log->created_at
                                ?->format(
                                    'd/m/Y H:i:s'
                                ),

                        'created_at_human' =>
                            $log->created_at
                                ?->diffForHumans(),
                    ];
                }
            );

        return Inertia::render(
            'admin/users/activity',
            [
                'user' => [
                    'id' =>
                        $user->id,

                    'name' =>
                        $user->name,

                    'username' =>
                        $user->username,

                    'email' =>
                        $user->email,

                    'status' =>
                        $user->status,

                    'roles' =>
                        $user->roles
                            ->pluck('name')
                            ->values(),

                    'presence' =>
                        $presence,

                    'last_login_at' =>
                        $user->last_login_at
                            ?->format(
                                'd/m/Y H:i:s'
                            ),

                    'last_login_at_human' =>
                        $user->last_login_at
                            ?->diffForHumans(),

                    'last_seen_at' =>
                        $user->last_seen_at
                            ?->format(
                                'd/m/Y H:i:s'
                            ),

                    'last_seen_at_human' =>
                        $user->last_seen_at
                            ?->diffForHumans(),
                ],

                'activities' =>
                    $activities,

                'can' => [
                    'updateUser' =>
                        $request->user()->can(
                            'users.update'
                        ),
                ],
            ]
        );
    }
}
