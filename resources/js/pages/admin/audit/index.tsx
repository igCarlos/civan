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

import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import { type TranslationKey } from '@/i18n/translations';
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
| Etiquetas traducibles
|--------------------------------------------------------------------------
*/

type Translator = (
    key: TranslationKey,
) => string;

const eventLabelKeys: Record<
    string,
    TranslationKey
> = {
    login: 'audit.event.login',
    logout: 'audit.event.logout',

    create: 'audit.event.create',
    update: 'audit.event.update',
    delete: 'audit.event.delete',

    role_change: 'audit.event.role_change',
    status_change: 'audit.event.status_change',

    permission_change:
        'audit.event.permission_change',

    permission_sync:
        'audit.event.permission_sync',

    audit_export:
        'audit.event.audit_export',

    audit_prune:
        'audit.event.audit_prune',

    audit_retention_update:
        'audit.event.audit_retention_update',

    system_settings_update:
        'audit.event.system_settings_update',

    page_view:
        'audit.event.page_view',
};

const moduleLabelKeys: Record<
    string,
    TranslationKey
> = {
    authentication:
        'modules.authentication',

    users:
        'modules.users',

    roles:
        'modules.roles',

    permissions:
        'modules.permissions',

    audit_logs:
        'modules.audit_logs',

    settings:
        'modules.settings',

    websites:
        'modules.websites',

    domains:
        'modules.domains',

    databases:
        'modules.databases',

    server:
        'modules.server',
};

const fieldLabelKeys: Record<
    string,
    TranslationKey
> = {
    id:
        'audit.field.id',

    name:
        'audit.field.name',

    username:
        'audit.field.username',

    email:
        'audit.field.email',

    phone:
        'audit.field.phone',

    status:
        'audit.field.status',

    roles:
        'audit.field.roles',

    permissions:
        'audit.field.permissions',

    panel_name:
        'audit.field.panel_name',

    logo_light:
        'audit.field.logo_light',

    logo_dark:
        'audit.field.logo_dark',

    favicon:
        'audit.field.favicon',

    logo_size:
        'audit.field.logo_size',

    short_name:
        'audit.field.short_name',

    timezone:
        'audit.field.timezone',

    locale:
        'audit.field.locale',

    date_format:
        'audit.field.date_format',

    time_format:
        'audit.field.time_format',

    per_page:
        'audit.field.per_page',

    primary_color:
        'audit.field.primary_color',

    sidebar_color:
        'audit.field.sidebar_color',

    sidebar_shape:
        'audit.field.sidebar_shape',

    background_color_mode:
        'audit.field.background_color_mode',

    background_color:
        'audit.field.background_color',

    default_theme:
        'audit.field.default_theme',

    card_color_mode:
        'audit.field.card_color_mode',

    card_color:
        'audit.field.card_color',

    card_style:
        'audit.field.card_style',

    created_count:
        'audit.field.created_count',

    created_permissions:
        'audit.field.created_permissions',

    format:
        'audit.field.format',

    filters:
        'audit.field.filters',

    retention_days:
        'audit.field.retention_days',

    page_view_retention_days:
        'audit.field.retention_days',

    cutoff:
        'audit.field.cutoff',

    deleted_count:
        'audit.field.deleted_count',
};

function getEventLabel(
    event: string,
    t: Translator,
): string {
    const key =
        eventLabelKeys[event];

    return key
        ? t(key)
        : event;
}

const descriptionLabelKeys: Record<
    string,
    TranslationKey
> = {
    system_settings_update:
        'audit.description.system_settings_update',
};

function getDescription(
    log: AuditLog,
    t: Translator,
): string {
    const key =
        descriptionLabelKeys[
            log.event
        ];

    if (key) {
        return t(key);
    }

    return (
        log.description ??
        getEventLabel(
            log.event,
            t,
        )
    );
}

function getModuleLabel(
    module: string | null,
    t: Translator,
): string {
    if (!module) {
        return t(
            'audit.system',
        );
    }

    const key =
        moduleLabelKeys[module];

    return key
        ? t(key)
        : module;
}

function getFieldLabel(
    field: string,
    t: Translator,
): string {
    const key =
        fieldLabelKeys[field];

    return key
        ? t(key)
        : field;
}

function formatValue(
    value: unknown,
    t: Translator,
): string {
    if (
        value === null ||
        value === undefined ||
        value === ''
    ) {
        return '—';
    }

    if (
        typeof value ===
        'boolean'
    ) {
        return value
            ? t('common.yes')
            : t('common.no');
    }

    if (
        Array.isArray(value)
    ) {
        if (
            value.length === 0
        ) {
            return t(
                'audit.none',
            );
        }

        return value
            .map(
                (item) =>
                    String(item),
            )
            .join(', ');
    }

    if (
        typeof value ===
        'object'
    ) {
        return JSON.stringify(
            value,
            null,
            2,
        );
    }

    if (
        value === 'es'
    ) {
        return t(
            'locale.es',
        );
    }

    if (
        value === 'en'
    ) {
        return t(
            'locale.en',
        );
    }

    if (
        value === 'active'
    ) {
        return t(
            'users.status.active',
        );
    }

    if (
        value === 'pending'
    ) {
        return t(
            'users.status.pending',
        );
    }

    if (
        value === 'suspended'
    ) {
        return t(
            'users.status.suspended',
        );
    }

    return String(value);
}

function getChangedFields(
    log: AuditLog,
) {
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
    const { t } =
        useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t(
                'audit.title',
            ),
            href: '/dashboard/auditoria',
        },
    ];
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

    const paginationLabel = (
        label: string,
    ): string => {
        const normalized =
            label
                .replace(
                    /&laquo;|&raquo;/g,
                    '',
                )
                .replace(
                    /«|»/g,
                    '',
                )
                .trim()
                .toLowerCase();

        if (
            normalized.includes(
                'previous',
            ) ||
            normalized.includes(
                'anterior',
            )
        ) {
            return `« ${t(
                'pagination.previous',
            )}`;
        }

        if (
            normalized.includes(
                'next',
            ) ||
            normalized.includes(
                'siguiente',
            )
        ) {
            return `${t(
                'pagination.next',
            )} »`;
        }

        return label;
    };

    return (
        <AppLayout
            breadcrumbs={breadcrumbs}
        >
            <Head title={t('audit.title')} />

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
                                    {t('audit.title')}
                                </h1>

                                <p className="text-sm text-muted-foreground">
                                    {t('audit.description')}
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
                                        ? t('audit.refreshing')
                                        : t('audit.auto_refresh')}
                                </div>

                                <Link
                                    href="/dashboard/auditoria/retencion"
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md border bg-background px-4 text-sm font-medium hover:bg-muted"
                                    title={t('audit.retention_title')}
                                >
                                    <Settings className="size-4" />

                                    {t('audit.retention')}
                                </Link>

                                {can?.export && (
                                    <details className="relative">
                                        <summary className="inline-flex h-10 cursor-pointer list-none items-center justify-center gap-2 rounded-md border bg-background px-4 text-sm font-medium hover:bg-muted">
                                            <Download className="size-4" />

                                            {t('audit.export')}

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
                            {t('audit.records')}
                        </p>

                        <p className="mt-2 text-2xl font-bold">
                            {logs.total}
                        </p>
                    </div>

                    <div className="rounded-xl border bg-card p-5 shadow-sm">
                        <p className="text-sm text-muted-foreground">
                            {t('audit.registered_modules')}
                        </p>

                        <p className="mt-2 text-2xl font-bold">
                            {modules.length}
                        </p>
                    </div>

                    <div className="rounded-xl border bg-card p-5 shadow-sm">
                        <p className="text-sm text-muted-foreground">
                            {t('audit.event_types')}
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
                            {t('audit.filters')}
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            {t('audit.filters_description')}
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
                                    {t('common.search')}
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
                                        placeholder={t('audit.search_placeholder')}
                                        className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>
                            </div>

                            {/* Usuario */}

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    {t('audit.user')}
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
                                        {t('audit.all')}
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
                                    {t('audit.event')}
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
                                        {t('audit.all')}
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
                                                    t,
                                                )}
                                            </option>
                                        ),
                                    )}
                                </select>
                            </div>

                            {/* Módulo */}

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    {t('audit.module')}
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
                                        {t('audit.all')}
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
                                                    t,
                                                )}
                                            </option>
                                        ),
                                    )}
                                </select>
                            </div>

                            {/* Desde */}

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    {t('audit.from')}
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
                                    {t('audit.to')}
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

                                {t('common.search')}
                            </button>

                            <button
                                type="button"
                                onClick={
                                    resetFilters
                                }
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border bg-background px-4 text-sm font-medium hover:bg-muted"
                            >
                                <RotateCcw className="size-4" />

                                {t('audit.clear')}
                            </button>
                        </div>
                    </form>
                </section>

                {/* Actividad */}

                <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <div className="border-b p-5">
                        <h2 className="font-semibold">
                            {t('audit.activity_registered')}
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            {logs.total === 1
                                ? `1 ${t(
                                      'audit.activity_found_singular',
                                  )}`
                                : `${logs.total} ${t(
                                      'audit.activity_found_plural',
                                  )}`}
                        </p>
                    </div>

                    {logs.data.length === 0 ? (
                        <div className="flex min-h-56 flex-col items-center justify-center p-8 text-center">
                            <Activity className="mb-4 size-10 text-muted-foreground" />

                            <h3 className="font-semibold">
                                {t('audit.no_activity')}
                            </h3>

                            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                                {t('audit.no_activity_description')}
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
                                                                        t('audit.system')}
                                                                </span>

                                                                <span className="rounded-md bg-muted px-2 py-0.5 text-xs">
                                                                    {getEventLabel(
                                                                        log.event,
                                                                        t,
                                                                    )}
                                                                </span>
                                                            </div>

                                                            <p className="mt-1 text-sm">
                                                                {getDescription(
                                                                    log,
                                                                    t,
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
                                                                t,
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
                                                                {t('audit.record')}
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
                                                                                        t,
                                                                                    )}
                                                                                </span>

                                                                                <span className="break-words text-muted-foreground">
                                                                                    {formatValue(
                                                                                        log
                                                                                            .old_values?.[
                                                                                            field
                                                                                        ],
                                                                                        t,
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
                                                                                        t,
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
                                                                {t('audit.hide_details')}
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ChevronDown className="size-4" />
                                                                {t('audit.view_details')}
                                                            </>
                                                        )}
                                                    </button>

                                                    {/* Detalle */}

                                                    {isOpen && (
                                                        <div className="mt-4 grid gap-4 xl:grid-cols-2">

                                                            {/* Información */}

                                                            <div className="rounded-lg border p-4">
                                                                <h4 className="font-semibold">
                                                                    {t('audit.activity_information')}
                                                                </h4>

                                                                <dl className="mt-4 space-y-3 text-sm">
                                                                    <div>
                                                                        <dt className="text-muted-foreground">
                                                                            {t('audit.user')}
                                                                        </dt>

                                                                        <dd className="font-medium">
                                                                            {log
                                                                                .actor
                                                                                ?.name ??
                                                                                t('audit.system')}
                                                                        </dd>
                                                                    </div>

                                                                    {log
                                                                        .actor
                                                                        ?.email && (
                                                                        <div>
                                                                            <dt className="text-muted-foreground">
                                                                                {t('audit.email')}
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
                                                                            {t('audit.event')}
                                                                        </dt>

                                                                        <dd>
                                                                            {getEventLabel(
                                                                                log.event,
                                                                                t,
                                                                            )}
                                                                        </dd>
                                                                    </div>

                                                                    <div>
                                                                        <dt className="text-muted-foreground">
                                                                            {t('audit.module')}
                                                                        </dt>

                                                                        <dd>
                                                                            {getModuleLabel(
                                                                                log.module,
                                                                                t,
                                                                            )}
                                                                        </dd>
                                                                    </div>

                                                                    {log.subject_type && (
                                                                        <div>
                                                                            <dt className="text-muted-foreground">
                                                                                {t('audit.affected_type')}
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
                                                                                {t('audit.affected_id')}
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
                                                                    {t('audit.technical_information')}
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
                                                                                {t('audit.method')}
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
                                                                                {t('audit.route')}
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
                                                                                {t('audit.browser_device')}
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
                                                                        {t('audit.changes_made')}
                                                                    </h4>

                                                                    <div className="mt-4 overflow-x-auto">
                                                                        <table className="w-full text-sm">
                                                                            <thead>
                                                                                <tr className="border-b text-left">
                                                                                    <th className="pb-3 pr-4 font-medium">
                                                                                        {t('audit.field')}
                                                                                    </th>

                                                                                    <th className="pb-3 pr-4 font-medium">
                                                                                        {t('audit.before')}
                                                                                    </th>

                                                                                    <th className="pb-3 font-medium">
                                                                                        {t('audit.after')}
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
                                                                                                    t,
                                                                                                )}
                                                                                            </td>

                                                                                            <td className="py-3 pr-4 text-muted-foreground">
                                                                                                {formatValue(
                                                                                                    log
                                                                                                        .old_values?.[
                                                                                                        field
                                                                                                    ],
                                                                                                    t,
                                                                                                )}
                                                                                            </td>

                                                                                            <td className="py-3">
                                                                                                {formatValue(
                                                                                                    log
                                                                                                        .new_values?.[
                                                                                                        field
                                                                                                    ],
                                                                                                    t,
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
                                {t('users.showing')}{' '}
                                {logs.from ?? 0} -{' '}
                                {logs.to ?? 0}{' '}
                                {t('users.of')}{' '}
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
                                        >
                                            {paginationLabel(
                                                link.label,
                                            )}
                                        </button>
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