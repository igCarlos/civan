import {
    Head,
    Link,
    router,
} from '@inertiajs/react';

import {
    Activity,
    CalendarDays,
    ChevronDown,
    ChevronUp,
    CircleDot,
    Download,
    FileSpreadsheet,
    FileText,
    Globe2,
    LogIn,
    LogOut,
    Pencil,
    PlusCircle,
    RotateCcw,
    Search,
    Settings,
    ShieldCheck,
    Trash2,
    UserCog,
} from 'lucide-react';

import {
    FormEvent,
    useEffect,
    useState,
} from 'react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

/*
|--------------------------------------------------------------------------
| Tipos
|--------------------------------------------------------------------------
*/

interface Actor {
    id: number;
    name: string;
    email: string;
}

interface AuditLog {
    id: number;

    event: string;
    module: string | null;

    description: string | null;

    actor: Actor | null;

    subject_type: string | null;
    subject_id: number | null;

    old_values: Record<string, unknown>;
    new_values: Record<string, unknown>;

    ip_address: string | null;
    user_agent: string | null;

    method: string | null;
    route: string | null;
    url: string | null;

    created_at: string | null;
    created_at_human: string | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Logs {
    data: AuditLog[];

    current_page: number;
    last_page: number;

    from: number | null;
    to: number | null;
    total: number;

    links: PaginationLink[];
}

interface User {
    id: number;
    name: string;
}

interface Filters {
    search: string;
    event: string;
    module: string;

    actor_id: number | string | null;

    date_from: string | null;
    date_to: string | null;
}

interface Props {
    logs: Logs;

    users: User[];

    events: string[];
    modules: string[];

    filters: Filters;

    can?: {
        export: boolean;
        retentionUpdate?: boolean;
    };
}

/*
|--------------------------------------------------------------------------
| Breadcrumbs
|--------------------------------------------------------------------------
*/

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Auditoría',
        href: '/dashboard/auditoria',
    },
];

/*
|--------------------------------------------------------------------------
| Etiquetas
|--------------------------------------------------------------------------
*/

const eventLabels: Record<string, string> = {
    login: 'Inicio de sesión',
    logout: 'Cierre de sesión',

    create: 'Creación',
    update: 'Edición',
    delete: 'Eliminación',

    role_change: 'Cambio de roles',
    status_change: 'Cambio de estado',

    permission_change: 'Cambio de permisos',
    permission_sync: 'Sincronización de permisos',
    audit_export: 'Exportación de auditoría',
    audit_prune: 'Limpieza de auditoría',
    audit_retention_update: 'Cambio de retención',

    page_view: 'Navegación',
};

const moduleLabels: Record<string, string> = {
    authentication: 'Autenticación',

    users: 'Usuarios',
    roles: 'Roles',
    permissions: 'Permisos',

    audit_logs: 'Auditoría',

    websites: 'Sitios web',
    domains: 'Dominios',
    databases: 'Bases de datos',

    server: 'Servidor',
};

const fieldLabels: Record<string, string> = {
    id: 'ID',

    name: 'Nombre',
    username: 'Usuario',
    email: 'Correo electrónico',
    phone: 'Teléfono',

    status: 'Estado',

    roles: 'Roles',

    permissions: 'Permisos',

    created_count: 'Permisos creados',
    created_permissions: 'Permisos nuevos',

    format: 'Formato',
    filters: 'Filtros aplicados',

    retention_days: 'Días de retención',
    page_view_retention_days: 'Días de retención',
    cutoff: 'Fecha límite',
    deleted_count: 'Registros eliminados',
};

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function getEventLabel(event: string) {
    return eventLabels[event] ?? event;
}

function getModuleLabel(module: string | null) {
    if (!module) {
        return 'Sistema';
    }

    return moduleLabels[module] ?? module;
}

function getFieldLabel(field: string) {
    return fieldLabels[field] ?? field;
}

function formatValue(value: unknown): string {
    if (
        value === null ||
        value === undefined ||
        value === ''
    ) {
        return '—';
    }

    if (typeof value === 'boolean') {
        return value ? 'Sí' : 'No';
    }

    if (Array.isArray(value)) {
        if (value.length === 0) {
            return 'Ninguno';
        }

        return value
            .map((item) => String(item))
            .join(', ');
    }

    if (typeof value === 'object') {
        return JSON.stringify(
            value,
            null,
            2,
        );
    }

    if (value === 'active') {
        return 'Activo';
    }

    if (value === 'pending') {
        return 'Pendiente';
    }

    if (value === 'suspended') {
        return 'Suspendido';
    }

    return String(value);
}

function getChangedFields(log: AuditLog) {
    return Array.from(
        new Set([
            ...Object.keys(
                log.old_values ?? {},
            ),

            ...Object.keys(
                log.new_values ?? {},
            ),
        ]),
    );
}

/*
|--------------------------------------------------------------------------
| Icono de evento
|--------------------------------------------------------------------------
*/

function EventIcon({
    event,
}: {
    event: string;
}) {
    const className = 'size-5';

    switch (event) {
        case 'login':
            return (
                <LogIn
                    className={className}
                />
            );

        case 'logout':
            return (
                <LogOut
                    className={className}
                />
            );

        case 'create':
            return (
                <PlusCircle
                    className={className}
                />
            );

        case 'update':
            return (
                <Pencil
                    className={className}
                />
            );

        case 'delete':
            return (
                <Trash2
                    className={className}
                />
            );

        case 'role_change':
            return (
                <UserCog
                    className={className}
                />
            );

        case 'status_change':
            return (
                <ShieldCheck
                    className={className}
                />
            );

        default:
            return (
                <CircleDot
                    className={className}
                />
            );
    }
}

/*
|--------------------------------------------------------------------------
| Componente
|--------------------------------------------------------------------------
*/

export default function AuditIndex({
    logs,
    users,
    events,
    modules,
    filters,
    can,
}: Props) {
    /*
    |--------------------------------------------------------------------------
    | Filtros
    |--------------------------------------------------------------------------
    */

    const [
        search,
        setSearch,
    ] = useState(
        filters.search ?? '',
    );

    const [
        isRefreshing,
        setIsRefreshing,
    ] = useState(false);

    const [
        event,
        setEvent,
    ] = useState(
        filters.event ?? '',
    );

    const [
        module,
        setModule,
    ] = useState(
        filters.module ?? '',
    );

    const [
        actorId,
        setActorId,
    ] = useState(
        filters.actor_id
            ? String(filters.actor_id)
            : '',
    );

    const [
        dateFrom,
        setDateFrom,
    ] = useState(
        filters.date_from ?? '',
    );

    const [
        dateTo,
        setDateTo,
    ] = useState(
        filters.date_to ?? '',
    );

    /*
    |--------------------------------------------------------------------------
    | Registros abiertos
    |--------------------------------------------------------------------------
    */

    const [
        expanded,
        setExpanded,
    ] = useState<number[]>([]);

    /*
    |--------------------------------------------------------------------------
    | Actualización automática
    |--------------------------------------------------------------------------
    |
    | Consulta nuevos registros cada 15 segundos.
    | Si la pestaña no está visible, no hace peticiones.
    |
    */

    useEffect(() => {
        const refreshAudit = () => {
            if (
                document.visibilityState !==
                'visible'
            ) {
                return;
            }

            router.reload({
                only: [
                    'logs',
                    'events',
                    'modules',
                ],

                preserveState: true,
                preserveScroll: true,

                onStart: () => {
                    setIsRefreshing(true);
                },

                onFinish: () => {
                    setIsRefreshing(false);
                },
            });
        };

        /*
        |--------------------------------------------------------------------------
        | Actualizar cada 15 segundos
        |--------------------------------------------------------------------------
        */

        const interval =
            window.setInterval(
                refreshAudit,
                15_000,
            );

        /*
        |--------------------------------------------------------------------------
        | Actualizar inmediatamente al volver a la pestaña
        |--------------------------------------------------------------------------
        */

        const handleVisibilityChange =
            () => {
                if (
                    document.visibilityState ===
                    'visible'
                ) {
                    refreshAudit();
                }
            };

        document.addEventListener(
            'visibilitychange',
            handleVisibilityChange,
        );

        /*
        |--------------------------------------------------------------------------
        | Limpiar
        |--------------------------------------------------------------------------
        */

        return () => {
            window.clearInterval(
                interval,
            );

            document.removeEventListener(
                'visibilitychange',
                handleVisibilityChange,
            );
        };
    }, []);

    /*
    |--------------------------------------------------------------------------
    | Buscar
    |--------------------------------------------------------------------------
    */

    const submit = (
        eventSubmit: FormEvent<HTMLFormElement>,
    ) => {
        eventSubmit.preventDefault();

        router.get(
            '/dashboard/auditoria',
            {
                search:
                    search || undefined,

                event:
                    event || undefined,

                module:
                    module || undefined,

                actor_id:
                    actorId || undefined,

                date_from:
                    dateFrom || undefined,

                date_to:
                    dateTo || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Limpiar filtros
    |--------------------------------------------------------------------------
    */

    const resetFilters = () => {
        setSearch('');
        setEvent('');
        setModule('');
        setActorId('');
        setDateFrom('');
        setDateTo('');

        router.get(
            '/dashboard/auditoria',
            {},
            {
                preserveState: false,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Exportar
    |--------------------------------------------------------------------------
    |
    | Conserva exactamente los filtros seleccionados en pantalla.
    |
    */

    const exportReport = (
        format:
            | 'csv'
            | 'excel'
            | 'pdf',
    ) => {
        const params =
            new URLSearchParams();

        if (search.trim()) {
            params.set(
                'search',
                search.trim(),
            );
        }

        if (event) {
            params.set(
                'event',
                event,
            );
        }

        if (module) {
            params.set(
                'module',
                module,
            );
        }

        if (actorId) {
            params.set(
                'actor_id',
                actorId,
            );
        }

        if (dateFrom) {
            params.set(
                'date_from',
                dateFrom,
            );
        }

        if (dateTo) {
            params.set(
                'date_to',
                dateTo,
            );
        }

        const query =
            params.toString();

        const url =
            `/dashboard/auditoria/exportar/${format}` +
            (query ? `?${query}` : '');

        window.location.href =
            url;
    };

    /*
    |--------------------------------------------------------------------------
    | Abrir detalle
    |--------------------------------------------------------------------------
    */

    const toggleExpanded = (
        id: number,
    ) => {
        setExpanded((current) => {
            if (current.includes(id)) {
                return current.filter(
                    (item) => item !== id,
                );
            }

            return [
                ...current,
                id,
            ];
        });
    };

    return (
        <AppLayout
            breadcrumbs={breadcrumbs}
        >
            <Head title="Auditoría" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">

                {/* Encabezado */}

                <div>
                    <div className="flex items-center gap-3">
                        <div className="flex size-11 items-center justify-center rounded-xl border bg-card">
                            <Activity className="size-5" />
                        </div>

                        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">
                                    Auditoría
                                </h1>

                                <p className="text-sm text-muted-foreground">
                                    Actividad y seguridad del sistema.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span
                                        className={`size-2 rounded-full ${
                                            isRefreshing
                                                ? 'animate-pulse bg-yellow-500'
                                                : 'bg-green-500'
                                        }`}
                                    />

                                    {isRefreshing
                                        ? 'Actualizando...'
                                        : 'Actualización automática'}
                                </div>

                                <Link
                                    href="/dashboard/auditoria/retencion"
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md border bg-background px-4 text-sm font-medium hover:bg-muted"
                                    title="Configurar retención de auditoría"
                                >
                                    <Settings className="size-4" />

                                    Retención
                                </Link>

                                {can?.export && (
                                    <details className="relative">
                                        <summary className="inline-flex h-10 cursor-pointer list-none items-center justify-center gap-2 rounded-md border bg-background px-4 text-sm font-medium hover:bg-muted">
                                            <Download className="size-4" />

                                            Exportar

                                            <ChevronDown className="size-4" />
                                        </summary>

                                        <div className="absolute right-0 z-30 mt-2 w-52 overflow-hidden rounded-lg border bg-popover p-1 text-popover-foreground shadow-lg">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    exportReport(
                                                        'csv',
                                                    )
                                                }
                                                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-muted"
                                            >
                                                <Download className="size-4" />

                                                <span>
                                                    CSV
                                                </span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    exportReport(
                                                        'excel',
                                                    )
                                                }
                                                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-muted"
                                            >
                                                <FileSpreadsheet className="size-4" />

                                                <span>
                                                    Excel (.xlsx)
                                                </span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    exportReport(
                                                        'pdf',
                                                    )
                                                }
                                                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-muted"
                                            >
                                                <FileText className="size-4" />

                                                <span>
                                                    PDF
                                                </span>
                                            </button>
                                        </div>
                                    </details>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

                {/* Estadística */}

                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border bg-card p-5 shadow-sm">
                        <p className="text-sm text-muted-foreground">
                            Registros
                        </p>

                        <p className="mt-2 text-2xl font-bold">
                            {logs.total}
                        </p>
                    </div>

                    <div className="rounded-xl border bg-card p-5 shadow-sm">
                        <p className="text-sm text-muted-foreground">
                            Módulos registrados
                        </p>

                        <p className="mt-2 text-2xl font-bold">
                            {modules.length}
                        </p>
                    </div>

                    <div className="rounded-xl border bg-card p-5 shadow-sm">
                        <p className="text-sm text-muted-foreground">
                            Tipos de eventos
                        </p>

                        <p className="mt-2 text-2xl font-bold">
                            {events.length}
                        </p>
                    </div>
                </div>

                {/* Filtros */}

                <section className="rounded-xl border bg-card shadow-sm">
                    <div className="border-b p-5">
                        <h2 className="font-semibold">
                            Filtros
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Busca actividad por usuario,
                            evento, módulo o fecha.
                        </p>
                    </div>

                    <form
                        onSubmit={submit}
                        className="p-5"
                    >
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

                            {/* Buscar */}

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Buscar
                                </label>

                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Usuario, acción..."
                                        className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>
                            </div>

                            {/* Usuario */}

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Usuario
                                </label>

                                <select
                                    value={actorId}
                                    onChange={(e) =>
                                        setActorId(
                                            e.target.value,
                                        )
                                    }
                                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                                >
                                    <option value="">
                                        Todos
                                    </option>

                                    {users.map(
                                        (user) => (
                                            <option
                                                key={
                                                    user.id
                                                }
                                                value={
                                                    user.id
                                                }
                                            >
                                                {
                                                    user.name
                                                }
                                            </option>
                                        ),
                                    )}
                                </select>
                            </div>

                            {/* Evento */}

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Evento
                                </label>

                                <select
                                    value={event}
                                    onChange={(e) =>
                                        setEvent(
                                            e.target.value,
                                        )
                                    }
                                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                                >
                                    <option value="">
                                        Todos
                                    </option>

                                    {events.map(
                                        (
                                            eventItem,
                                        ) => (
                                            <option
                                                key={
                                                    eventItem
                                                }
                                                value={
                                                    eventItem
                                                }
                                            >
                                                {getEventLabel(
                                                    eventItem,
                                                )}
                                            </option>
                                        ),
                                    )}
                                </select>
                            </div>

                            {/* Módulo */}

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Módulo
                                </label>

                                <select
                                    value={module}
                                    onChange={(e) =>
                                        setModule(
                                            e.target.value,
                                        )
                                    }
                                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                                >
                                    <option value="">
                                        Todos
                                    </option>

                                    {modules.map(
                                        (
                                            moduleItem,
                                        ) => (
                                            <option
                                                key={
                                                    moduleItem
                                                }
                                                value={
                                                    moduleItem
                                                }
                                            >
                                                {getModuleLabel(
                                                    moduleItem,
                                                )}
                                            </option>
                                        ),
                                    )}
                                </select>
                            </div>

                            {/* Desde */}

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Desde
                                </label>

                                <div className="relative">
                                    <CalendarDays className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                                    <input
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) =>
                                            setDateFrom(
                                                e.target.value,
                                            )
                                        }
                                        className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm"
                                    />
                                </div>
                            </div>

                            {/* Hasta */}

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Hasta
                                </label>

                                <div className="relative">
                                    <CalendarDays className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                                    <input
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) =>
                                            setDateTo(
                                                e.target.value,
                                            )
                                        }
                                        className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-3">
                            <button
                                type="submit"
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
                            >
                                <Search className="size-4" />

                                Buscar
                            </button>

                            <button
                                type="button"
                                onClick={
                                    resetFilters
                                }
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border bg-background px-4 text-sm font-medium hover:bg-muted"
                            >
                                <RotateCcw className="size-4" />

                                Limpiar
                            </button>
                        </div>
                    </form>
                </section>

                {/* Actividad */}

                <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <div className="border-b p-5">
                        <h2 className="font-semibold">
                            Actividad registrada
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            {logs.total === 1
                                ? '1 actividad encontrada'
                                : `${logs.total} actividades encontradas`}
                        </p>
                    </div>

                    {logs.data.length === 0 ? (
                        <div className="flex min-h-56 flex-col items-center justify-center p-8 text-center">
                            <Activity className="mb-4 size-10 text-muted-foreground" />

                            <h3 className="font-semibold">
                                No hay actividad
                            </h3>

                            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                                No existen registros
                                que coincidan con los
                                filtros seleccionados.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {logs.data.map(
                                (log) => {
                                    const isOpen =
                                        expanded.includes(
                                            log.id,
                                        );

                                    const changedFields =
                                        getChangedFields(
                                            log,
                                        );

                                    return (
                                        <article
                                            key={
                                                log.id
                                            }
                                            className="p-5"
                                        >
                                            <div className="flex gap-4">

                                                {/* Icono */}

                                                <div className="flex size-10 shrink-0 items-center justify-center rounded-full border bg-muted/40">
                                                    <EventIcon
                                                        event={
                                                            log.event
                                                        }
                                                    />
                                                </div>

                                                {/* Contenido */}

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-col justify-between gap-2 sm:flex-row">
                                                        <div>
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <span className="font-semibold">
                                                                    {log
                                                                        .actor
                                                                        ?.name ??
                                                                        'Sistema'}
                                                                </span>

                                                                <span className="rounded-md bg-muted px-2 py-0.5 text-xs">
                                                                    {getEventLabel(
                                                                        log.event,
                                                                    )}
                                                                </span>
                                                            </div>

                                                            <p className="mt-1 text-sm">
                                                                {log.description ??
                                                                    getEventLabel(
                                                                        log.event,
                                                                    )}
                                                            </p>
                                                        </div>

                                                        <div className="shrink-0 text-left sm:text-right">
                                                            <p className="text-sm font-medium">
                                                                {log.created_at_human ??
                                                                    '—'}
                                                            </p>

                                                            <p className="text-xs text-muted-foreground">
                                                                {log.created_at ??
                                                                    ''}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Resumen */}

                                                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                                                        <span>
                                                            {getModuleLabel(
                                                                log.module,
                                                            )}
                                                        </span>

                                                        {log.ip_address && (
                                                            <span>
                                                                IP:{' '}
                                                                {
                                                                    log.ip_address
                                                                }
                                                            </span>
                                                        )}

                                                        {log.method && (
                                                            <span>
                                                                {
                                                                    log.method
                                                                }
                                                            </span>
                                                        )}

                                                        {log.subject_id && (
                                                            <span>
                                                                Registro
                                                                #{' '}
                                                                {
                                                                    log.subject_id
                                                                }
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Cambios rápidos */}

                                                    {changedFields.length >
                                                        0 && (
                                                        <div className="mt-4 rounded-lg border bg-muted/20">
                                                            <div className="divide-y">
                                                                {changedFields
                                                                    .slice(
                                                                        0,
                                                                        3,
                                                                    )
                                                                    .map(
                                                                        (
                                                                            field,
                                                                        ) => (
                                                                            <div
                                                                                key={
                                                                                    field
                                                                                }
                                                                                className="grid gap-2 p-3 text-sm sm:grid-cols-[150px_1fr_40px_1fr]"
                                                                            >
                                                                                <span className="font-medium">
                                                                                    {getFieldLabel(
                                                                                        field,
                                                                                    )}
                                                                                </span>

                                                                                <span className="break-words text-muted-foreground">
                                                                                    {formatValue(
                                                                                        log
                                                                                            .old_values?.[
                                                                                            field
                                                                                        ],
                                                                                    )}
                                                                                </span>

                                                                                <span className="text-center text-muted-foreground">
                                                                                    →
                                                                                </span>

                                                                                <span className="break-words font-medium">
                                                                                    {formatValue(
                                                                                        log
                                                                                            .new_values?.[
                                                                                            field
                                                                                        ],
                                                                                    )}
                                                                                </span>
                                                                            </div>
                                                                        ),
                                                                    )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Ver detalle */}

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            toggleExpanded(
                                                                log.id,
                                                            )
                                                        }
                                                        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
                                                    >
                                                        {isOpen ? (
                                                            <>
                                                                <ChevronUp className="size-4" />
                                                                Ocultar
                                                                detalles
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ChevronDown className="size-4" />
                                                                Ver
                                                                detalles
                                                            </>
                                                        )}
                                                    </button>

                                                    {/* Detalle */}

                                                    {isOpen && (
                                                        <div className="mt-4 grid gap-4 xl:grid-cols-2">

                                                            {/* Información */}

                                                            <div className="rounded-lg border p-4">
                                                                <h4 className="font-semibold">
                                                                    Información
                                                                    de la
                                                                    actividad
                                                                </h4>

                                                                <dl className="mt-4 space-y-3 text-sm">
                                                                    <div>
                                                                        <dt className="text-muted-foreground">
                                                                            Usuario
                                                                        </dt>

                                                                        <dd className="font-medium">
                                                                            {log
                                                                                .actor
                                                                                ?.name ??
                                                                                'Sistema'}
                                                                        </dd>
                                                                    </div>

                                                                    {log
                                                                        .actor
                                                                        ?.email && (
                                                                        <div>
                                                                            <dt className="text-muted-foreground">
                                                                                Correo
                                                                            </dt>

                                                                            <dd>
                                                                                {
                                                                                    log
                                                                                        .actor
                                                                                        .email
                                                                                }
                                                                            </dd>
                                                                        </div>
                                                                    )}

                                                                    <div>
                                                                        <dt className="text-muted-foreground">
                                                                            Evento
                                                                        </dt>

                                                                        <dd>
                                                                            {getEventLabel(
                                                                                log.event,
                                                                            )}
                                                                        </dd>
                                                                    </div>

                                                                    <div>
                                                                        <dt className="text-muted-foreground">
                                                                            Módulo
                                                                        </dt>

                                                                        <dd>
                                                                            {getModuleLabel(
                                                                                log.module,
                                                                            )}
                                                                        </dd>
                                                                    </div>

                                                                    {log.subject_type && (
                                                                        <div>
                                                                            <dt className="text-muted-foreground">
                                                                                Tipo
                                                                                afectado
                                                                            </dt>

                                                                            <dd className="break-all">
                                                                                {
                                                                                    log.subject_type
                                                                                }
                                                                            </dd>
                                                                        </div>
                                                                    )}

                                                                    {log.subject_id && (
                                                                        <div>
                                                                            <dt className="text-muted-foreground">
                                                                                ID
                                                                                afectado
                                                                            </dt>

                                                                            <dd>
                                                                                {
                                                                                    log.subject_id
                                                                                }
                                                                            </dd>
                                                                        </div>
                                                                    )}
                                                                </dl>
                                                            </div>

                                                            {/* Información técnica */}

                                                            <div className="rounded-lg border p-4">
                                                                <h4 className="font-semibold">
                                                                    Información
                                                                    técnica
                                                                </h4>

                                                                <dl className="mt-4 space-y-3 text-sm">
                                                                    {log.ip_address && (
                                                                        <div>
                                                                            <dt className="flex items-center gap-2 text-muted-foreground">
                                                                                <Globe2 className="size-4" />

                                                                                IP
                                                                            </dt>

                                                                            <dd className="mt-1">
                                                                                {
                                                                                    log.ip_address
                                                                                }
                                                                            </dd>
                                                                        </div>
                                                                    )}

                                                                    {log.method && (
                                                                        <div>
                                                                            <dt className="text-muted-foreground">
                                                                                Método
                                                                            </dt>

                                                                            <dd>
                                                                                {
                                                                                    log.method
                                                                                }
                                                                            </dd>
                                                                        </div>
                                                                    )}

                                                                    {log.route && (
                                                                        <div>
                                                                            <dt className="text-muted-foreground">
                                                                                Ruta
                                                                            </dt>

                                                                            <dd className="break-all">
                                                                                {
                                                                                    log.route
                                                                                }
                                                                            </dd>
                                                                        </div>
                                                                    )}

                                                                    {log.url && (
                                                                        <div>
                                                                            <dt className="text-muted-foreground">
                                                                                URL
                                                                            </dt>

                                                                            <dd className="break-all">
                                                                                {
                                                                                    log.url
                                                                                }
                                                                            </dd>
                                                                        </div>
                                                                    )}

                                                                    {log.user_agent && (
                                                                        <div>
                                                                            <dt className="text-muted-foreground">
                                                                                Navegador
                                                                                /
                                                                                dispositivo
                                                                            </dt>

                                                                            <dd className="mt-1 break-words text-xs">
                                                                                {
                                                                                    log.user_agent
                                                                                }
                                                                            </dd>
                                                                        </div>
                                                                    )}
                                                                </dl>
                                                            </div>

                                                            {/* Todos los cambios */}

                                                            {changedFields.length >
                                                                0 && (
                                                                <div className="rounded-lg border p-4 xl:col-span-2">
                                                                    <h4 className="font-semibold">
                                                                        Cambios
                                                                        realizados
                                                                    </h4>

                                                                    <div className="mt-4 overflow-x-auto">
                                                                        <table className="w-full text-sm">
                                                                            <thead>
                                                                                <tr className="border-b text-left">
                                                                                    <th className="pb-3 pr-4 font-medium">
                                                                                        Campo
                                                                                    </th>

                                                                                    <th className="pb-3 pr-4 font-medium">
                                                                                        Antes
                                                                                    </th>

                                                                                    <th className="pb-3 font-medium">
                                                                                        Después
                                                                                    </th>
                                                                                </tr>
                                                                            </thead>

                                                                            <tbody className="divide-y">
                                                                                {changedFields.map(
                                                                                    (
                                                                                        field,
                                                                                    ) => (
                                                                                        <tr
                                                                                            key={
                                                                                                field
                                                                                            }
                                                                                        >
                                                                                            <td className="py-3 pr-4 font-medium">
                                                                                                {getFieldLabel(
                                                                                                    field,
                                                                                                )}
                                                                                            </td>

                                                                                            <td className="py-3 pr-4 text-muted-foreground">
                                                                                                {formatValue(
                                                                                                    log
                                                                                                        .old_values?.[
                                                                                                        field
                                                                                                    ],
                                                                                                )}
                                                                                            </td>

                                                                                            <td className="py-3">
                                                                                                {formatValue(
                                                                                                    log
                                                                                                        .new_values?.[
                                                                                                        field
                                                                                                    ],
                                                                                                )}
                                                                                            </td>
                                                                                        </tr>
                                                                                    ),
                                                                                )}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </article>
                                    );
                                },
                            )}
                        </div>
                    )}

                    {/* Paginación */}

                    {logs.last_page > 1 && (
                        <div className="flex flex-col gap-4 border-t p-5 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-muted-foreground">
                                Mostrando{' '}
                                {logs.from ?? 0} -{' '}
                                {logs.to ?? 0} de{' '}
                                {logs.total}
                            </p>

                            <div className="flex flex-wrap gap-1">
                                {logs.links.map(
                                    (
                                        link,
                                        index,
                                    ) => (
                                        <button
                                            key={
                                                index
                                            }
                                            type="button"
                                            disabled={
                                                !link.url
                                            }
                                            onClick={() => {
                                                if (
                                                    link.url
                                                ) {
                                                    router.visit(
                                                        link.url,
                                                        {
                                                            preserveScroll:
                                                                true,
                                                        },
                                                    );
                                                }
                                            }}
                                            className={[
                                                'min-w-9 rounded-md border px-3 py-2 text-sm',

                                                link.active
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-background hover:bg-muted',

                                                !link.url
                                                    ? 'cursor-not-allowed opacity-40'
                                                    : '',
                                            ].join(
                                                ' ',
                                            )}
                                            dangerouslySetInnerHTML={{
                                                __html:
                                                    link.label,
                                            }}
                                        />
                                    ),
                                )}
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </AppLayout>
    );
}