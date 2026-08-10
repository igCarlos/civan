<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use App\Services\SystemDateTimeService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\SystemSetting;

class AuditController extends Controller
{
    /**
     * Listado general de auditoría.
     */
    public function index(
        Request $request,
        SystemDateTimeService $dateTime
    ): Response {
        abort_unless(
            $request->user()->can(
                'audit_logs.view'
            ),
            403
        );

        /*
        |--------------------------------------------------------------------------
        | Filtros
        |--------------------------------------------------------------------------
        */

        $search = trim(
            (string) $request->input(
                'search',
                ''
            )
        );

        $event = trim(
            (string) $request->input(
                'event',
                ''
            )
        );

        $module = trim(
            (string) $request->input(
                'module',
                ''
            )
        );

        $actorId =
            $request->input(
                'actor_id'
            );

        $dateFrom =
            $request->input(
                'date_from'
            );

        $dateTo =
            $request->input(
                'date_to'
            );

        /*
        |--------------------------------------------------------------------------
        | Fechas del filtro: zona local -> UTC
        |--------------------------------------------------------------------------
        |
        | El usuario elige días según system.timezone.
        | La base de datos se consulta usando UTC.
        |
        */

        $dateFromUtc =
            $dateTime
                ->localDayStartUtc(
                    $dateFrom
                );

        $dateToUtc =
            $dateTime
                ->localDayEndUtc(
                    $dateTo
                );

        $perPage = (int) SystemSetting::valueOf(
            'system.per_page',
            20
        );

        /*
        |--------------------------------------------------------------------------
        | Consulta
        |--------------------------------------------------------------------------
        */

        $logs = AuditLog::query()
            ->with([
                'actor:id,name,email',
            ])

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

            ->when(
                $event !== '',
                fn ($query) =>
                    $query->where(
                        'event',
                        $event
                    )
            )

            ->when(
                $module !== '',
                fn ($query) =>
                    $query->where(
                        'module',
                        $module
                    )
            )

            ->when(
                $actorId,
                fn ($query) =>
                    $query->where(
                        'actor_id',
                        $actorId
                    )
            )

            ->when(
                $dateFromUtc,
                fn ($query) =>
                    $query->where(
                        'created_at',
                        '>=',
                        $dateFromUtc
                    )
            )

            ->when(
                $dateToUtc,
                fn ($query) =>
                    $query->where(
                        'created_at',
                        '<=',
                        $dateToUtc
                    )
            )

            ->latest('created_at')
            ->paginate($perPage)
            ->withQueryString()
            ->through(
                function (
                    AuditLog $log
                ) use (
                    $dateTime
                ) {
                    return [
                        'id' =>
                            $log->id,

                        'event' =>
                            $log->event,

                        'module' =>
                            $log->module,

                        /*
                         * Se conserva como fallback.
                         * La interfaz puede generar una descripción traducida
                         * a partir del código del evento.
                         */
                        'description' =>
                            $log->description,

                        'actor' =>
                            $log->actor
                                ? [
                                    'id' =>
                                        $log->actor->id,

                                    'name' =>
                                        $log->actor->name,

                                    'email' =>
                                        $log->actor->email,
                                ]
                                : null,

                        'subject_type' =>
                            $log->subject_type,

                        'subject_id' =>
                            $log->subject_id,

                        'old_values' =>
                            $log->old_values
                            ?? [],

                        'new_values' =>
                            $log->new_values
                            ?? [],

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
                        | Presentación regional
                        |--------------------------------------------------------------------------
                        |
                        | created_at de DB representa un instante UTC.
                        | Solo aquí lo convertimos a la zona configurada.
                        |
                        */

                        'created_at' =>
                            $dateTime->format(
                                $log->created_at
                            ),

                        'created_at_human' =>
                            $dateTime->human(
                                $log->created_at
                            ),
                    ];
                }
            );

        $users = User::query()
            ->orderBy('name')
            ->get([
                'id',
                'name',
            ]);

        $events = AuditLog::query()
            ->whereNotNull(
                'event'
            )
            ->distinct()
            ->orderBy(
                'event'
            )
            ->pluck(
                'event'
            )
            ->values();

        $modules = AuditLog::query()
            ->whereNotNull(
                'module'
            )
            ->distinct()
            ->orderBy(
                'module'
            )
            ->pluck(
                'module'
            )
            ->values();

        return Inertia::render(
            'admin/audit/index',
            [
                'logs' =>
                    $logs,

                'users' =>
                    $users,

                'events' =>
                    $events,

                'modules' =>
                    $modules,

                'filters' => [
                    'search' =>
                        $search,

                    'event' =>
                        $event,

                    'module' =>
                        $module,

                    'actor_id' =>
                        $actorId,

                    'date_from' =>
                        $dateFrom,

                    'date_to' =>
                        $dateTo,
                ],

                'can' => [
                    'export' =>
                        $request
                            ->user()
                            ->can(
                                'audit_logs.export'
                            ),

                    'retentionUpdate' =>
                        $request
                            ->user()
                            ->can(
                                'audit_logs.retention.update'
                            ),
                ],
            ]
        );
    }
}
