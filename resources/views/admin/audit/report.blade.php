<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">

    <title>
        Reporte de Auditoría - CIVAN
    </title>

    <style>
        @page {
            margin: 24px 24px 30px 24px;
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            color: #111827;
            font-family: DejaVu Sans, sans-serif;
            font-size: 9px;
            line-height: 1.35;
        }

        .header {
            margin-bottom: 14px;
            padding-bottom: 10px;
            border-bottom: 2px solid #111827;
        }

        .brand {
            font-size: 20px;
            font-weight: 700;
            letter-spacing: 0.5px;
        }

        .title {
            margin-top: 3px;
            font-size: 13px;
            font-weight: 700;
        }

        .muted {
            color: #6b7280;
        }

        .meta {
            margin-top: 8px;
        }

        .meta span {
            display: inline-block;
            margin-right: 18px;
        }

        .filters {
            margin-bottom: 14px;
            padding: 8px 10px;
            border: 1px solid #d1d5db;
            border-radius: 5px;
            background: #f9fafb;
        }

        .filters-title {
            margin-bottom: 4px;
            font-weight: 700;
        }

        .filter-item {
            display: inline-block;
            margin-right: 16px;
            margin-bottom: 3px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        thead {
            display: table-header-group;
        }

        tr {
            page-break-inside: avoid;
        }

        th,
        td {
            padding: 5px 5px;
            border: 1px solid #d1d5db;
            vertical-align: top;
        }

        th {
            background: #f3f4f6;
            font-weight: 700;
            text-align: left;
        }

        .col-id {
            width: 4%;
        }

        .col-date {
            width: 11%;
        }

        .col-user {
            width: 12%;
        }

        .col-event {
            width: 10%;
        }

        .col-module {
            width: 9%;
        }

        .col-description {
            width: 34%;
        }

        .col-ip {
            width: 10%;
        }

        .col-method {
            width: 6%;
        }

        .empty {
            padding: 30px;
            border: 1px solid #d1d5db;
            text-align: center;
        }

        .footer-note {
            margin-top: 10px;
            color: #6b7280;
            font-size: 8px;
        }
    </style>
</head>

<body>
    <div class="header">
        <div class="brand">
            CIVAN
        </div>

        <div class="title">
            Reporte de Auditoría
        </div>

        <div class="meta muted">
            <span>
                Generado:
                {{ $generatedAt->format('d/m/Y H:i:s') }}
            </span>

            <span>
                Registros:
                {{ $logs->count() }}
            </span>
        </div>
    </div>

    @php
        $activeFilters = [];

        if (!empty($filters['search'])) {
            $activeFilters[] =
                'Búsqueda: ' .
                $filters['search'];
        }

        if (!empty($filters['event'])) {
            $activeFilters[] =
                'Evento: ' .
                $filters['event'];
        }

        if (!empty($filters['module'])) {
            $activeFilters[] =
                'Módulo: ' .
                $filters['module'];
        }

        if (!empty($filters['actor_id'])) {
            $activeFilters[] =
                'Usuario: ' .
                (
                    $filters['actor_name']
                    ?? ('ID ' . $filters['actor_id'])
                );
        }

        if (!empty($filters['date_from'])) {
            $activeFilters[] =
                'Desde: ' .
                \Carbon\Carbon::parse(
                    $filters['date_from']
                )->format('d/m/Y');
        }

        if (!empty($filters['date_to'])) {
            $activeFilters[] =
                'Hasta: ' .
                \Carbon\Carbon::parse(
                    $filters['date_to']
                )->format('d/m/Y');
        }
    @endphp

    <div class="filters">
        <div class="filters-title">
            Filtros aplicados
        </div>

        @if (count($activeFilters) === 0)
            <span class="muted">
                Sin filtros. Se incluyen todos los registros.
            </span>
        @else
            @foreach ($activeFilters as $filter)
                <span class="filter-item">
                    {{ $filter }}
                </span>
            @endforeach
        @endif
    </div>

    @if ($logs->isEmpty())
        <div class="empty">
            No existen registros que coincidan con los filtros seleccionados.
        </div>
    @else
        <table>
            <thead>
                <tr>
                    <th class="col-id">
                        ID
                    </th>

                    <th class="col-date">
                        Fecha
                    </th>

                    <th class="col-user">
                        Usuario
                    </th>

                    <th class="col-event">
                        Evento
                    </th>

                    <th class="col-module">
                        Módulo
                    </th>

                    <th class="col-description">
                        Descripción
                    </th>

                    <th class="col-ip">
                        IP
                    </th>

                    <th class="col-method">
                        Método
                    </th>
                </tr>
            </thead>

            <tbody>
                @foreach ($logs as $log)
                    <tr>
                        <td>
                            {{ $log->id }}
                        </td>

                        <td>
                            {{ $log->created_at?->format('d/m/Y H:i:s') ?? '—' }}
                        </td>

                        <td>
                            {{ $log->actor?->name ?? 'Sistema' }}

                            @if ($log->actor?->email)
                                <br>

                                <span class="muted">
                                    {{ $log->actor->email }}
                                </span>
                            @endif
                        </td>

                        <td>
                            {{ $log->event }}
                        </td>

                        <td>
                            {{ $log->module ?? 'Sistema' }}
                        </td>

                        <td>
                            {{ $log->description ?? '—' }}
                        </td>

                        <td>
                            {{ $log->ip_address ?? '—' }}
                        </td>

                        <td>
                            {{ $log->method ?? '—' }}
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    <div class="footer-note">
        CIVAN Panel · Reporte generado automáticamente.
        Los archivos CSV y Excel contienen información técnica adicional
        como valores anteriores/nuevos, ruta, URL y agente de usuario.
    </div>
</body>
</html>
