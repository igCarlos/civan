<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use App\Services\AuditRetentionService;
use App\Services\AuditService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditRetentionController extends Controller
{
    /**
     * Configuración de retención.
     */
    public function index(
        Request $request,
        AuditRetentionService $retention
    ): Response {
        abort_unless(
            $request->user()->can(
                'audit_logs.view'
            ),
            403
        );

        $stats =
            $retention->stats();

        return Inertia::render(
            'admin/audit/retention',
            [
                'settings' => [
                    'page_view_retention_days' =>
                        $stats[
                            'retention_days'
                        ],

                    'chunk_size' =>
                        $retention
                            ->chunkSize(),
                ],

                'stats' => [
                    'page_view_total' =>
                        $stats[
                            'page_view_total'
                        ],

                    'eligible_count' =>
                        $stats[
                            'eligible_count'
                        ],

                    'cutoff' =>
                        $stats['cutoff']
                            ->format(
                                'd/m/Y H:i:s'
                            ),

                    'cutoff_iso' =>
                        $stats['cutoff']
                            ->format(
                                'Y-m-d H:i:s'
                            ),

                    'oldest_page_view' =>
                        $stats[
                            'oldest_page_view'
                        ]
                            ?->format(
                                'd/m/Y H:i:s'
                            ),
                ],

                'can' => [
                    'update' =>
                        $request->user()->can(
                            'audit_logs.retention.update'
                        ),
                ],
            ]
        );
    }

    /**
     * Guardar días de retención.
     */
    public function update(
        Request $request,
        AuditRetentionService $retention
    ): RedirectResponse {
        abort_unless(
            $request->user()->can(
                'audit_logs.retention.update'
            ),
            403
        );

        $validated =
            $request->validate([
                'page_view_retention_days' => [
                    'required',
                    'integer',
                    'min:1',
                    'max:3650',
                ],
            ]);

        $oldDays =
            $retention
                ->pageViewRetentionDays();

        $newDays =
            (int) $validated[
                'page_view_retention_days'
            ];

        SystemSetting::put(
            AuditRetentionService::PAGE_VIEW_RETENTION_KEY,
            $newDays,
            'audit',
            'integer'
        );

        /*
        |--------------------------------------------------------------------------
        | Auditoría
        |--------------------------------------------------------------------------
        */

        if ($oldDays !== $newDays) {
            app(AuditService::class)->log(
                event:
                    'audit_retention_update',

                module:
                    'audit_logs',

                description:
                    "Cambió la retención de navegación de {$oldDays} a {$newDays} días.",

                oldValues: [
                    'page_view_retention_days' =>
                        $oldDays,
                ],

                newValues: [
                    'page_view_retention_days' =>
                        $newDays,
                ],

                actor:
                    $request->user(),
            );
        }

        return back()->with(
            'success',
            'Configuración de retención actualizada correctamente.'
        );
    }

    /**
     * Ejecutar limpieza manual.
     */
    public function prune(
        Request $request,
        AuditRetentionService $retention
    ): RedirectResponse {
        abort_unless(
            $request->user()->can(
                'audit_logs.retention.update'
            ),
            403
        );

        $result =
            $retention->prune();

        app(AuditService::class)->log(
            event:
                'audit_prune',

            module:
                'audit_logs',

            description:
                "Ejecutó una limpieza manual de auditoría y eliminó {$result['deleted_count']} registros antiguos de navegación.",

            newValues:
                $result,

            actor:
                $request->user(),
        );

        return back()->with(
            'success',
            $result['deleted_count'] === 1
                ? 'Se eliminó 1 registro antiguo de navegación.'
                : "Se eliminaron {$result['deleted_count']} registros antiguos de navegación."
        );
    }
}
