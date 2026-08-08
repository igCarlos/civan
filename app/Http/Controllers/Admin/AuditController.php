<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditController extends Controller
{
    /**
     * Listado general de auditoría.
     */
    public function index(Request $request): Response
    {
        abort_unless(
            $request->user()->can('audit_logs.view'),
            403
        );

        /*
        |--------------------------------------------------------------------------
        | Filtros
        |--------------------------------------------------------------------------
        */

        $search = trim(
            (string) $request->input('search', '')
        );

        $event = trim(
            (string) $request->input('event', '')
        );

        $module = trim(
            (string) $request->input('module', '')
        );

        $actorId = $request->input('actor_id');

        $dateFrom = $request->input('date_from');

        $dateTo = $request->input('date_to');


        /*
        |--------------------------------------------------------------------------
        | Consulta
        |--------------------------------------------------------------------------
        */

        $logs = AuditLog::query()

            ->with([
                'actor:id,name,email',
            ])

            /*
            |--------------------------------------------------------------------------
            | Buscar
            |--------------------------------------------------------------------------
            */

            ->when(
                $search !== '',
                function ($query) use ($search) {

                    $query->where(
                        function ($query) use ($search) {

                            $query
                                ->where(
                                    'description',
                                    'like',
                                    "%{$search}%"
                                )

                                ->orWhere(
                                    'event',
                                    'like',
                                    "%{$search}%"
                                )

                                ->orWhere(
                                    'module',
                                    'like',
                                    "%{$search}%"
                                )

                                ->orWhereHas(
                                    'actor',
                                    function ($query) use ($search) {

                                        $query
                                            ->where(
                                                'name',
                                                'like',
                                                "%{$search}%"
                                            )

                                            ->orWhere(
                                                'email',
                                                'like',
                                                "%{$search}%"
                                            );
                                    }
                                );
                        }
                    );
                }
            )


            /*
            |--------------------------------------------------------------------------
            | Evento
            |--------------------------------------------------------------------------
            */

            ->when(
                $event !== '',
                fn ($query) =>
                    $query->where(
                        'event',
                        $event
                    )
            )


            /*
            |--------------------------------------------------------------------------
            | Módulo
            |--------------------------------------------------------------------------
            */

            ->when(
                $module !== '',
                fn ($query) =>
                    $query->where(
                        'module',
                        $module
                    )
            )


            /*
            |--------------------------------------------------------------------------
            | Usuario
            |--------------------------------------------------------------------------
            */

            ->when(
                $actorId,
                fn ($query) =>
                    $query->where(
                        'actor_id',
                        $actorId
                    )
            )


            /*
            |--------------------------------------------------------------------------
            | Fecha desde
            |--------------------------------------------------------------------------
            */

            ->when(
                $dateFrom,
                fn ($query) =>
                    $query->whereDate(
                        'created_at',
                        '>=',
                        $dateFrom
                    )
            )


            /*
            |--------------------------------------------------------------------------
            | Fecha hasta
            |--------------------------------------------------------------------------
            */

            ->when(
                $dateTo,
                fn ($query) =>
                    $query->whereDate(
                        'created_at',
                        '<=',
                        $dateTo
                    )
            )

            ->latest('created_at')

            ->paginate(20)

            ->withQueryString()

            ->through(function (AuditLog $log) {

                return [
                    'id' => $log->id,

                    'event' => $log->event,

                    'module' => $log->module,

                    'description' =>
                        $log->description,

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

                    'user_agent' =>
                        $log->user_agent,

                    'method' =>
                        $log->method,

                    'route' =>
                        $log->route,

                    'url' =>
                        $log->url,

                    /*
                    |--------------------------------------------------------------------------
                    | Fechas
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
            });


        /*
        |--------------------------------------------------------------------------
        | Usuarios para filtro
        |--------------------------------------------------------------------------
        */

        $users = User::query()
            ->orderBy('name')
            ->get([
                'id',
                'name',
            ]);


        /*
        |--------------------------------------------------------------------------
        | Eventos existentes
        |--------------------------------------------------------------------------
        */

        $events = AuditLog::query()
            ->whereNotNull('event')
            ->distinct()
            ->orderBy('event')
            ->pluck('event')
            ->values();


        /*
        |--------------------------------------------------------------------------
        | Módulos existentes
        |--------------------------------------------------------------------------
        */

        $modules = AuditLog::query()
            ->whereNotNull('module')
            ->distinct()
            ->orderBy('module')
            ->pluck('module')
            ->values();


        return Inertia::render(
            'admin/audit/index',
            [
                'logs' => $logs,

                'users' => $users,

                'events' => $events,

                'modules' => $modules,

                'filters' => [
                    'search' => $search,

                    'event' => $event,

                    'module' => $module,

                    'actor_id' => $actorId,

                    'date_from' => $dateFrom,

                    'date_to' => $dateTo,
                ],

                /*
                |--------------------------------------------------------------------------
                | Permisos de la vista
                |--------------------------------------------------------------------------
                */

                'can' => [
                    'export' =>
                        $request->user()->can(
                            'audit_logs.export'
                        ),
                ],
            ]
        );
    }
}