<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use App\Services\AuditService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AuditExportController extends Controller
{
    /**
     * Exportar auditoría a CSV.
     */
    public function csv(
        Request $request
    ): StreamedResponse {
        $this->authorizeExport(
            $request
        );

        /*
        |--------------------------------------------------------------------------
        | Snapshot
        |--------------------------------------------------------------------------
        |
        | Guardamos el último ID existente antes de registrar la exportación.
        | Así el propio evento audit_export no termina dentro del archivo
        | que se está generando.
        |
        */

        $snapshotId =
            (int) (
                AuditLog::query()
                    ->max('id')
                ?? 0
            );

        $query =
            $this->filteredQuery(
                $request
            )
                ->where(
                    'id',
                    '<=',
                    $snapshotId
                );

        $filters =
            $this->resolvedFilters(
                $request
            );

        $this->logExport(
            $request,
            'CSV',
            $filters
        );

        $filename =
            'auditoria-' .
            now()->format(
                'Y-m-d_H-i-s'
            ) .
            '.csv';

        return response()->streamDownload(
            function () use ($query) {
                $handle = fopen(
                    'php://output',
                    'w'
                );

                if ($handle === false) {
                    return;
                }

                /*
                |--------------------------------------------------------------------------
                | BOM UTF-8
                |--------------------------------------------------------------------------
                |
                | Mejora la compatibilidad con Excel al abrir el CSV.
                |
                */

                fwrite(
                    $handle,
                    "\xEF\xBB\xBF"
                );

                /*
                |--------------------------------------------------------------------------
                | Encabezados
                |--------------------------------------------------------------------------
                */

                fputcsv(
                    $handle,
                    $this->headers(),
                    ';'
                );

                /*
                |--------------------------------------------------------------------------
                | Registros
                |--------------------------------------------------------------------------
                */

                foreach (
                    $query
                        ->orderByDesc('id')
                        ->cursor()
                    as $log
                ) {
                    fputcsv(
                        $handle,
                        $this->row(
                            $log
                        ),
                        ';'
                    );
                }

                fclose(
                    $handle
                );
            },
            $filename,
            [
                'Content-Type' =>
                    'text/csv; charset=UTF-8',
            ]
        );
    }

    /**
     * Exportar auditoría a Excel XLSX.
     */
    public function excel(
        Request $request
    ): BinaryFileResponse {
        $this->authorizeExport(
            $request
        );

        $snapshotId =
            (int) (
                AuditLog::query()
                    ->max('id')
                ?? 0
            );

        $query =
            $this->filteredQuery(
                $request
            )
                ->where(
                    'id',
                    '<=',
                    $snapshotId
                );

        $filters =
            $this->resolvedFilters(
                $request
            );

        $this->logExport(
            $request,
            'Excel',
            $filters
        );

        $spreadsheet =
            new Spreadsheet();

        $spreadsheet
            ->getProperties()
            ->setCreator('CIVAN')
            ->setTitle(
                'Reporte de Auditoría'
            )
            ->setSubject(
                'Auditoría del sistema CIVAN'
            );

        $sheet =
            $spreadsheet
                ->getActiveSheet();

        $sheet->setTitle(
            'Auditoría'
        );

        /*
        |--------------------------------------------------------------------------
        | Encabezados
        |--------------------------------------------------------------------------
        */

        $headers =
            $this->headers();

        $sheet->fromArray(
            $headers,
            null,
            'A1'
        );

        $lastColumn =
            $sheet
                ->getHighestColumn();

        $sheet
            ->getStyle(
                "A1:{$lastColumn}1"
            )
            ->getFont()
            ->setBold(true);

        $sheet
            ->getStyle(
                "A1:{$lastColumn}1"
            )
            ->getAlignment()
            ->setHorizontal(
                Alignment::HORIZONTAL_CENTER
            );

        $sheet
            ->getStyle(
                "A1:{$lastColumn}1"
            )
            ->getBorders()
            ->getBottom()
            ->setBorderStyle(
                Border::BORDER_THIN
            );

        $sheet->freezePane(
            'A2'
        );

        /*
        |--------------------------------------------------------------------------
        | Registros
        |--------------------------------------------------------------------------
        */

        $rowNumber = 2;

        foreach (
            $query
                ->orderByDesc('id')
                ->cursor()
            as $log
        ) {
            $sheet->fromArray(
                $this->row(
                    $log
                ),
                null,
                "A{$rowNumber}"
            );

            $rowNumber++;
        }

        /*
        |--------------------------------------------------------------------------
        | Filtro automático
        |--------------------------------------------------------------------------
        */

        if ($rowNumber > 2) {
            $sheet->setAutoFilter(
                "A1:{$lastColumn}" .
                ($rowNumber - 1)
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Ajustes visuales
        |--------------------------------------------------------------------------
        */

        foreach (
            range(
                'A',
                $lastColumn
            )
            as $column
        ) {
            $sheet
                ->getColumnDimension(
                    $column
                )
                ->setAutoSize(true);
        }

        $sheet
            ->getStyle(
                "A1:{$lastColumn}" .
                max(
                    1,
                    $rowNumber - 1
                )
            )
            ->getAlignment()
            ->setVertical(
                Alignment::VERTICAL_TOP
            )
            ->setWrapText(true);

        /*
        |--------------------------------------------------------------------------
        | Guardar temporalmente
        |--------------------------------------------------------------------------
        */

        $tempBase =
            tempnam(
                sys_get_temp_dir(),
                'civan-audit-'
            );

        if ($tempBase === false) {
            abort(
                500,
                'No se pudo crear el archivo temporal.'
            );
        }

        $tempFile =
            $tempBase .
            '.xlsx';

        @unlink(
            $tempBase
        );

        $writer =
            new Xlsx(
                $spreadsheet
            );

        $writer->save(
            $tempFile
        );

        $spreadsheet
            ->disconnectWorksheets();

        unset(
            $spreadsheet
        );

        $filename =
            'auditoria-' .
            now()->format(
                'Y-m-d_H-i-s'
            ) .
            '.xlsx';

        return response()
            ->download(
                $tempFile,
                $filename,
                [
                    'Content-Type' =>
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                ]
            )
            ->deleteFileAfterSend(
                true
            );
    }

    /**
     * Exportar auditoría a PDF.
     */
    public function pdf(
        Request $request
    ) {
        $this->authorizeExport(
            $request
        );

        /*
        |--------------------------------------------------------------------------
        | Consulta
        |--------------------------------------------------------------------------
        |
        | El PDF está pensado como reporte legible.
        | CSV y Excel contienen todos los campos técnicos.
        |
        */

        $snapshotId =
            (int) (
                AuditLog::query()
                    ->max('id')
                ?? 0
            );

        $query =
            $this->filteredQuery(
                $request
            )
                ->where(
                    'id',
                    '<=',
                    $snapshotId
                );

        $logs =
            $query
                ->orderByDesc('id')
                ->get();

        /*
        |--------------------------------------------------------------------------
        | Filtros mostrados en el reporte
        |--------------------------------------------------------------------------
        */

        $filters =
            $this->resolvedFilters(
                $request
            );

        /*
        |--------------------------------------------------------------------------
        | Auditoría de exportación
        |--------------------------------------------------------------------------
        */

        $this->logExport(
            $request,
            'PDF',
            $filters
        );

        $pdf =
            Pdf::loadView(
                'admin.audit.report',
                [
                    'logs' =>
                        $logs,

                    'filters' =>
                        $filters,

                    'generatedAt' =>
                        now(),
                ]
            )
                ->setPaper(
                    'a4',
                    'landscape'
                );

        $filename =
            'auditoria-' .
            now()->format(
                'Y-m-d_H-i-s'
            ) .
            '.pdf';

        return $pdf->download(
            $filename
        );
    }

    /**
     * Verificar permiso de exportación.
     */
    private function authorizeExport(
        Request $request
    ): void {
        abort_unless(
            $request->user()->can(
                'audit_logs.export'
            ),
            403
        );
    }

    /**
     * Construir la consulta con filtros.
     */
    private function filteredQuery(
        Request $request
    ): Builder {
        $query =
            AuditLog::query()
                ->with([
                    'actor:id,name,email',
                ]);

        $this->applyFilters(
            $query,
            $request
        );

        return $query;
    }

    /**
     * Aplicar los mismos filtros de la pantalla de Auditoría.
     */
    private function applyFilters(
        Builder $query,
        Request $request
    ): void {
        /*
        |--------------------------------------------------------------------------
        | Buscar
        |--------------------------------------------------------------------------
        */

        $search = trim(
            (string) $request->input(
                'search',
                ''
            )
        );

        if ($search !== '') {
            $query->where(
                function (
                    Builder $query
                ) use (
                    $search
                ) {
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
                            function (
                                Builder $query
                            ) use (
                                $search
                            ) {
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

        /*
        |--------------------------------------------------------------------------
        | Evento
        |--------------------------------------------------------------------------
        */

        if (
            $request->filled(
                'event'
            )
        ) {
            $query->where(
                'event',
                $request->input(
                    'event'
                )
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Módulo
        |--------------------------------------------------------------------------
        */

        if (
            $request->filled(
                'module'
            )
        ) {
            $query->where(
                'module',
                $request->input(
                    'module'
                )
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Usuario
        |--------------------------------------------------------------------------
        */

        if (
            $request->filled(
                'actor_id'
            )
        ) {
            $query->where(
                'actor_id',
                $request->integer(
                    'actor_id'
                )
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Fecha desde
        |--------------------------------------------------------------------------
        */

        if (
            $request->filled(
                'date_from'
            )
        ) {
            $query->whereDate(
                'created_at',
                '>=',
                $request->input(
                    'date_from'
                )
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Fecha hasta
        |--------------------------------------------------------------------------
        */

        if (
            $request->filled(
                'date_to'
            )
        ) {
            $query->whereDate(
                'created_at',
                '<=',
                $request->input(
                    'date_to'
                )
            );
        }
    }

    /**
     * Resolver los filtros activos y el nombre del usuario seleccionado.
     */
    private function resolvedFilters(
        Request $request
    ): array {
        $actorId =
            $request->filled(
                'actor_id'
            )
                ? $request->integer(
                    'actor_id'
                )
                : null;

        $actorName = null;

        if ($actorId) {
            $actorName =
                User::query()
                    ->whereKey(
                        $actorId
                    )
                    ->value(
                        'name'
                    );
        }

        return [
            'search' =>
                trim(
                    (string) $request->input(
                        'search',
                        ''
                    )
                ),

            'event' =>
                trim(
                    (string) $request->input(
                        'event',
                        ''
                    )
                ),

            'module' =>
                trim(
                    (string) $request->input(
                        'module',
                        ''
                    )
                ),

            'actor_id' =>
                $actorId,

            'actor_name' =>
                $actorName,

            'date_from' =>
                $request->input(
                    'date_from'
                ),

            'date_to' =>
                $request->input(
                    'date_to'
                ),
        ];
    }

    /**
     * Registrar quién exportó la auditoría y en qué formato.
     */
    private function logExport(
        Request $request,
        string $format,
        array $filters
    ): void {
        $activeFilters =
            array_filter(
                $filters,
                fn ($value) =>
                    $value !== null
                    && $value !== ''
            );

        app(AuditService::class)->log(
            event: 'audit_export',

            module: 'audit_logs',

            description:
                "Exportó la auditoría en formato {$format}.",

            newValues: [
                'format' =>
                    $format,

                'filters' =>
                    $activeFilters,
            ],

            actor:
                $request->user(),
        );
    }

    /**
     * Encabezados compartidos entre CSV y Excel.
     */
    private function headers(): array
    {
        return [
            'ID',
            'Fecha',
            'Usuario',
            'Correo',
            'Evento',
            'Módulo',
            'Descripción',
            'Tipo afectado',
            'ID afectado',
            'Valores anteriores',
            'Valores nuevos',
            'IP',
            'Método',
            'Ruta',
            'URL',
            'Navegador / dispositivo',
        ];
    }

    /**
     * Convertir un registro de auditoría en una fila exportable.
     */
    private function row(
        AuditLog $log
    ): array {
        return [
            $log->id,

            $log->created_at
                ?->format(
                    'd/m/Y H:i:s'
                ),

            $log->actor
                ?->name
                ?? 'Sistema',

            $log->actor
                ?->email
                ?? '',

            $log->event,

            $log->module,

            $log->description,

            $log->subject_type,

            $log->subject_id,

            $this->jsonValue(
                $log->old_values
            ),

            $this->jsonValue(
                $log->new_values
            ),

            $log->ip_address,

            $log->method,

            $log->route,

            $log->url,

            $log->user_agent,
        ];
    }

    /**
     * JSON legible para CSV y Excel.
     */
    private function jsonValue(
        mixed $value
    ): string {
        if (
            $value === null ||
            $value === [] ||
            $value === ''
        ) {
            return '';
        }

        $encoded =
            json_encode(
                $value,
                JSON_UNESCAPED_UNICODE
                | JSON_UNESCAPED_SLASHES
            );

        return $encoded === false
            ? ''
            : $encoded;
    }
}
