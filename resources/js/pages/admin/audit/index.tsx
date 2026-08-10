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
    Filter,
    Globe2,
    History,
    KeyRound,
    LogIn,
    LogOut,
    Pencil,
    PlusCircle,
    RefreshCw,
    RotateCcw,
    Search,
    Settings,
    ShieldCheck,
    Trash2,
    UserCog,
    Users,
} from 'lucide-react';

import {
    type FormEvent,
    type ReactNode,
    useEffect,
    useMemo,
    useState,
} from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import { Separator } from '@/components/ui/separator';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

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

const ALL_FILTERS = '__all__';

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
            ? String(
                  filters.actor_id,
              )
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

    const activeFilterCount =
        useMemo(
            () =>
                [
                    filters.search,
                    filters.event,
                    filters.module,
                    filters.actor_id,
                    filters.date_from,
                    filters.date_to,
                ].filter(Boolean).length,
            [
                filters,
            ],
        );

    const visibleActors =
        useMemo(
            () =>
                new Set(
                    logs.data
                        .map(
                            (
                                log,
                            ) =>
                                log.actor
                                    ?.id,
                        )
                        .filter(
                            (
                                id,
                            ): id is number =>
                                typeof id ===
                                'number',
                        ),
                ).size,
            [
                logs.data,
            ],
        );

    /*
    |--------------------------------------------------------------------------
    | Actualización automática
    |--------------------------------------------------------------------------
    |
    | Conserva el comportamiento original:
    | consulta nuevos registros cada 15 segundos si la pestaña está visible.
    |
    */

    useEffect(() => {
        const refreshAudit =
            () => {
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

                    preserveState:
                        true,

                    preserveScroll:
                        true,

                    onStart: () => {
                        setIsRefreshing(
                            true,
                        );
                    },

                    onFinish: () => {
                        setIsRefreshing(
                            false,
                        );
                    },
                });
            };

        const interval =
            window.setInterval(
                refreshAudit,
                15_000,
            );

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
        eventSubmit:
            FormEvent<HTMLFormElement>,
    ) => {
        eventSubmit.preventDefault();

        router.get(
            '/dashboard/auditoria',
            {
                search:
                    search ||
                    undefined,

                event:
                    event ||
                    undefined,

                module:
                    module ||
                    undefined,

                actor_id:
                    actorId ||
                    undefined,

                date_from:
                    dateFrom ||
                    undefined,

                date_to:
                    dateTo ||
                    undefined,
            },
            {
                preserveState:
                    true,

                preserveScroll:
                    true,

                replace:
                    true,
            },
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Limpiar filtros
    |--------------------------------------------------------------------------
    */

    const resetFilters =
        () => {
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
                    preserveState:
                        false,

                    preserveScroll:
                        true,

                    replace:
                        true,
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
            (query
                ? `?${query}`
                : '');

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
        setExpanded(
            (
                current,
            ) => {
                if (
                    current.includes(
                        id,
                    )
                ) {
                    return current.filter(
                        (
                            item,
                        ) =>
                            item !==
                            id,
                    );
                }

                return [
                    ...current,
                    id,
                ];
            },
        );
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
            breadcrumbs={
                breadcrumbs
            }
        >
            <Head
                title={t(
                    'audit.title',
                )}
            />

            <div className="flex min-w-0 flex-1 flex-col gap-5 p-3 sm:p-4 lg:gap-6 lg:p-6">
                {/* =========================================================
                    ENCABEZADO
                ========================================================== */}

                <Card className="relative overflow-hidden rounded-2xl">
                    <div className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-primary/10 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-24 left-1/3 size-52 rounded-full bg-primary/[0.04] blur-3xl" />

                    <CardContent className="relative p-5 sm:p-6">
                        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                            <div className="flex min-w-0 items-start gap-4">
                                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
                                    <Activity className="size-5" />
                                </div>

                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                            {t(
                                                'audit.title',
                                            )}
                                        </h1>

                                        <Badge
                                            variant="outline"
                                            className="border-primary/20 bg-primary/10 text-[10px] uppercase tracking-[0.08em] text-primary"
                                        >
                                            Seguridad
                                        </Badge>
                                    </div>

                                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                                        {t(
                                            'audit.description',
                                        )}
                                    </p>

                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                        <Badge
                                            variant="outline"
                                            className="gap-1.5"
                                        >
                                            <span
                                                className={[
                                                    'size-2 rounded-full',
                                                    isRefreshing
                                                        ? 'animate-pulse bg-amber-500'
                                                        : 'bg-emerald-500',
                                                ].join(
                                                    ' ',
                                                )}
                                            />

                                            {isRefreshing
                                                ? t(
                                                      'audit.refreshing',
                                                  )
                                                : t(
                                                      'audit.auto_refresh',
                                                  )}
                                        </Badge>

                                        {activeFilterCount >
                                            0 && (
                                            <Badge
                                                variant="secondary"
                                                className="gap-1.5"
                                            >
                                                <Filter className="size-3" />
                                                {
                                                    activeFilterCount
                                                }{' '}
                                                filtros activos
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row">
                                <Button
                                    asChild
                                    variant="outline"
                                    className="h-10 rounded-xl"
                                >
                                    <Link
                                        href="/dashboard/auditoria/retencion"
                                        title={t(
                                            'audit.retention_title',
                                        )}
                                    >
                                        <Settings className="size-4" />

                                        {t(
                                            'audit.retention',
                                        )}
                                    </Link>
                                </Button>

                                {can?.export && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger
                                            asChild
                                        >
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="h-10 rounded-xl"
                                            >
                                                <Download className="size-4" />

                                                {t(
                                                    'audit.export',
                                                )}

                                                <ChevronDown className="size-3.5" />
                                            </Button>
                                        </DropdownMenuTrigger>

                                        <DropdownMenuContent
                                            align="end"
                                            className="w-52"
                                        >
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    exportReport(
                                                        'csv',
                                                    )
                                                }
                                            >
                                                <Download className="size-4" />

                                                CSV
                                            </DropdownMenuItem>

                                            <DropdownMenuItem
                                                onClick={() =>
                                                    exportReport(
                                                        'excel',
                                                    )
                                                }
                                            >
                                                <FileSpreadsheet className="size-4" />

                                                Excel (.xlsx)
                                            </DropdownMenuItem>

                                            <DropdownMenuItem
                                                onClick={() =>
                                                    exportReport(
                                                        'pdf',
                                                    )
                                                }
                                            >
                                                <FileText className="size-4" />

                                                PDF
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* =========================================================
                    ESTADÍSTICAS
                ========================================================== */}

                <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        icon={
                            <History className="size-4" />
                        }
                        label={t(
                            'audit.records',
                        )}
                        value={
                            logs.total
                        }
                    />

                    <StatCard
                        icon={
                            <ShieldCheck className="size-4" />
                        }
                        label={t(
                            'audit.registered_modules',
                        )}
                        value={
                            modules.length
                        }
                    />

                    <StatCard
                        icon={
                            <CircleDot className="size-4" />
                        }
                        label={t(
                            'audit.event_types',
                        )}
                        value={
                            events.length
                        }
                        tone="warning"
                    />

                    <StatCard
                        icon={
                            <Users className="size-4" />
                        }
                        label="Actores en esta página"
                        value={
                            visibleActors
                        }
                        tone="success"
                    />
                </div>

                {/* =========================================================
                    FILTROS
                ========================================================== */}

                <Card className="overflow-hidden rounded-2xl">
                    <CardHeader className="border-b bg-muted/[0.08]">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-3">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-background text-primary">
                                    <Filter className="size-4" />
                                </div>

                                <div>
                                    <CardTitle className="text-base">
                                        {t(
                                            'audit.filters',
                                        )}
                                    </CardTitle>

                                    <CardDescription className="mt-1">
                                        {t(
                                            'audit.filters_description',
                                        )}
                                    </CardDescription>
                                </div>
                            </div>

                            {activeFilterCount >
                                0 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={
                                        resetFilters
                                    }
                                    className="w-fit"
                                >
                                    <RotateCcw className="size-3.5" />

                                    {t(
                                        'audit.clear',
                                    )}
                                </Button>
                            )}
                        </div>
                    </CardHeader>

                    <CardContent className="p-4 sm:p-5">
                        <form
                            onSubmit={
                                submit
                            }
                        >
                            <div className="grid min-w-0 gap-4 md:grid-cols-2 2xl:grid-cols-3">
                                {/* Buscar */}

                                <FilterField
                                    label={t(
                                        'common.search',
                                    )}
                                >
                                    <div className="relative">
                                        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                                        <Input
                                            type="text"
                                            value={
                                                search
                                            }
                                            onChange={(
                                                e,
                                            ) =>
                                                setSearch(
                                                    e
                                                        .target
                                                        .value,
                                                )
                                            }
                                            placeholder={t(
                                                'audit.search_placeholder',
                                            )}
                                            className="h-10 rounded-xl pl-9"
                                        />
                                    </div>
                                </FilterField>

                                {/* Usuario */}

                                <FilterField
                                    label={t(
                                        'audit.user',
                                    )}
                                >
                                    <Select
                                        value={
                                            actorId ||
                                            ALL_FILTERS
                                        }
                                        onValueChange={(
                                            value,
                                        ) =>
                                            setActorId(
                                                value ===
                                                    ALL_FILTERS
                                                    ? ''
                                                    : value,
                                            )
                                        }
                                    >
                                        <SelectTrigger className="h-10 w-full rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>

                                        <SelectContent>
                                            <SelectItem
                                                value={
                                                    ALL_FILTERS
                                                }
                                            >
                                                {t(
                                                    'audit.all',
                                                )}
                                            </SelectItem>

                                            {users.map(
                                                (
                                                    user,
                                                ) => (
                                                    <SelectItem
                                                        key={
                                                            user.id
                                                        }
                                                        value={String(
                                                            user.id,
                                                        )}
                                                    >
                                                        {
                                                            user.name
                                                        }
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>
                                </FilterField>

                                {/* Evento */}

                                <FilterField
                                    label={t(
                                        'audit.event',
                                    )}
                                >
                                    <Select
                                        value={
                                            event ||
                                            ALL_FILTERS
                                        }
                                        onValueChange={(
                                            value,
                                        ) =>
                                            setEvent(
                                                value ===
                                                    ALL_FILTERS
                                                    ? ''
                                                    : value,
                                            )
                                        }
                                    >
                                        <SelectTrigger className="h-10 w-full rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>

                                        <SelectContent>
                                            <SelectItem
                                                value={
                                                    ALL_FILTERS
                                                }
                                            >
                                                {t(
                                                    'audit.all',
                                                )}
                                            </SelectItem>

                                            {events.map(
                                                (
                                                    eventItem,
                                                ) => (
                                                    <SelectItem
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
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>
                                </FilterField>

                                {/* Módulo */}

                                <FilterField
                                    label={t(
                                        'audit.module',
                                    )}
                                >
                                    <Select
                                        value={
                                            module ||
                                            ALL_FILTERS
                                        }
                                        onValueChange={(
                                            value,
                                        ) =>
                                            setModule(
                                                value ===
                                                    ALL_FILTERS
                                                    ? ''
                                                    : value,
                                            )
                                        }
                                    >
                                        <SelectTrigger className="h-10 w-full rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>

                                        <SelectContent>
                                            <SelectItem
                                                value={
                                                    ALL_FILTERS
                                                }
                                            >
                                                {t(
                                                    'audit.all',
                                                )}
                                            </SelectItem>

                                            {modules.map(
                                                (
                                                    moduleItem,
                                                ) => (
                                                    <SelectItem
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
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>
                                </FilterField>

                                {/* Desde */}

                                <FilterField
                                    label={t(
                                        'audit.from',
                                    )}
                                >
                                    <div className="relative">
                                        <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                                        <Input
                                            type="date"
                                            value={
                                                dateFrom
                                            }
                                            onChange={(
                                                e,
                                            ) =>
                                                setDateFrom(
                                                    e
                                                        .target
                                                        .value,
                                                )
                                            }
                                            className="h-10 rounded-xl pl-9"
                                        />
                                    </div>
                                </FilterField>

                                {/* Hasta */}

                                <FilterField
                                    label={t(
                                        'audit.to',
                                    )}
                                >
                                    <div className="relative">
                                        <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                                        <Input
                                            type="date"
                                            value={
                                                dateTo
                                            }
                                            onChange={(
                                                e,
                                            ) =>
                                                setDateTo(
                                                    e
                                                        .target
                                                        .value,
                                                )
                                            }
                                            className="h-10 rounded-xl pl-9"
                                        />
                                    </div>
                                </FilterField>
                            </div>

                            <div className="mt-5 flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={
                                        resetFilters
                                    }
                                    className="rounded-xl"
                                >
                                    <RotateCcw className="size-4" />

                                    {t(
                                        'audit.clear',
                                    )}
                                </Button>

                                <Button
                                    type="submit"
                                    className="rounded-xl px-5"
                                >
                                    <Search className="size-4" />

                                    {t(
                                        'common.search',
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* =========================================================
                    ACTIVIDAD
                ========================================================== */}

                <Card className="overflow-hidden rounded-2xl">
                    <CardHeader className="border-b bg-muted/[0.08]">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="text-base">
                                    {t(
                                        'audit.activity_registered',
                                    )}
                                </CardTitle>

                                <CardDescription className="mt-1">
                                    {logs.total ===
                                    1
                                        ? `1 ${t(
                                              'audit.activity_found_singular',
                                          )}`
                                        : `${logs.total} ${t(
                                              'audit.activity_found_plural',
                                          )}`}
                                </CardDescription>
                            </div>

                            <Badge
                                variant="secondary"
                                className="w-fit rounded-full"
                            >
                                {
                                    logs.total
                                }
                            </Badge>
                        </div>
                    </CardHeader>

                    {logs.data.length ===
                    0 ? (
                        <EmptyAudit
                            t={t}
                        />
                    ) : (
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {logs.data.map(
                                    (
                                        log,
                                    ) => {
                                        const isOpen =
                                            expanded.includes(
                                                log.id,
                                            );

                                        const changedFields =
                                            getChangedFields(
                                                log,
                                            );

                                        return (
                                            <AuditEntry
                                                key={
                                                    log.id
                                                }
                                                log={
                                                    log
                                                }
                                                isOpen={
                                                    isOpen
                                                }
                                                changedFields={
                                                    changedFields
                                                }
                                                t={
                                                    t
                                                }
                                                onToggle={() =>
                                                    toggleExpanded(
                                                        log.id,
                                                    )
                                                }
                                            />
                                        );
                                    },
                                )}
                            </div>
                        </CardContent>
                    )}

                    {/* PAGINACIÓN */}

                    {logs.last_page >
                        1 && (
                        <div className="flex min-w-0 flex-col gap-3 border-t bg-muted/[0.08] p-4 lg:flex-row lg:items-center lg:justify-between">
                            <p className="text-sm text-muted-foreground">
                                {t(
                                    'users.showing',
                                )}{' '}
                                {logs.from ??
                                    0}{' '}
                                -{' '}
                                {logs.to ??
                                    0}{' '}
                                {t(
                                    'users.of',
                                )}{' '}
                                {
                                    logs.total
                                }
                            </p>

                            <div className="flex flex-wrap gap-2">
                                {logs.links.map(
                                    (
                                        link,
                                        index,
                                    ) => (
                                        <Button
                                            key={
                                                index
                                            }
                                            type="button"
                                            size="sm"
                                            variant={
                                                link.active
                                                    ? 'default'
                                                    : 'outline'
                                            }
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
                                            className="min-w-9 rounded-xl"
                                        >
                                            {paginationLabel(
                                                link.label,
                                            )}
                                        </Button>
                                    ),
                                )}
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </AppLayout>
    );
}

/* ==========================================================================
   REGISTRO DE AUDITORÍA
   ========================================================================== */

function AuditEntry({
    log,
    isOpen,
    changedFields,
    t,
    onToggle,
}: {
    log: AuditLog;
    isOpen: boolean;
    changedFields: string[];
    t: Translator;
    onToggle: () => void;
}) {
    return (
        <article className="p-4 transition-colors hover:bg-muted/[0.08] sm:p-5">
            <div className="flex min-w-0 gap-3 sm:gap-4">
                <div
                    className={[
                        'flex size-10 shrink-0 items-center justify-center rounded-xl border',
                        eventTone(
                            log.event,
                        ),
                    ].join(
                        ' ',
                    )}
                >
                    <EventIcon
                        event={
                            log.event
                        }
                    />
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="truncate font-semibold">
                                    {log.actor
                                        ?.name ??
                                        t(
                                            'audit.system',
                                        )}
                                </span>

                                <EventBadge
                                    event={
                                        log.event
                                    }
                                    label={getEventLabel(
                                        log.event,
                                        t,
                                    )}
                                />

                                <Badge
                                    variant="outline"
                                    className="text-[10px]"
                                >
                                    {getModuleLabel(
                                        log.module,
                                        t,
                                    )}
                                </Badge>
                            </div>

                            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                                {getDescription(
                                    log,
                                    t,
                                )}
                            </p>
                        </div>

                        <div className="shrink-0 lg:text-right">
                            <p className="text-sm font-medium">
                                {log.created_at_human ??
                                    '—'}
                            </p>

                            <p className="mt-0.5 text-[10px] text-muted-foreground">
                                {log.created_at ??
                                    ''}
                            </p>
                        </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                        {log.ip_address && (
                            <MetaBadge>
                                <Globe2 className="size-3" />
                                {log.ip_address}
                            </MetaBadge>
                        )}

                        {log.method && (
                            <MetaBadge>
                                {
                                    log.method
                                }
                            </MetaBadge>
                        )}

                        {log.subject_id && (
                            <MetaBadge>
                                {t(
                                    'audit.record',
                                )}{' '}
                                #
                                {
                                    log.subject_id
                                }
                            </MetaBadge>
                        )}
                    </div>

                    {/* Cambios rápidos */}

                    {changedFields.length >
                        0 && (
                        <div className="mt-4 overflow-hidden rounded-xl border bg-muted/[0.12]">
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
                                                className="grid gap-2 p-3 text-sm lg:grid-cols-[150px_minmax(0,1fr)_30px_minmax(0,1fr)] lg:items-center"
                                            >
                                                <span className="font-medium">
                                                    {getFieldLabel(
                                                        field,
                                                        t,
                                                    )}
                                                </span>

                                                <ValueBox
                                                    value={formatValue(
                                                        log
                                                            .old_values?.[
                                                            field
                                                        ],
                                                        t,
                                                    )}
                                                    muted
                                                />

                                                <span className="hidden text-center text-muted-foreground lg:block">
                                                    →
                                                </span>

                                                <ValueBox
                                                    value={formatValue(
                                                        log
                                                            .new_values?.[
                                                            field
                                                        ],
                                                        t,
                                                    )}
                                                />
                                            </div>
                                        ),
                                    )}
                            </div>
                        </div>
                    )}

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={
                            onToggle
                        }
                        className="mt-3 -ml-2 rounded-xl text-muted-foreground"
                    >
                        {isOpen ? (
                            <ChevronUp className="size-4" />
                        ) : (
                            <ChevronDown className="size-4" />
                        )}

                        {isOpen
                            ? t(
                                  'audit.hide_details',
                              )
                            : t(
                                  'audit.view_details',
                              )}
                    </Button>

                    {isOpen && (
                        <AuditDetails
                            log={
                                log
                            }
                            changedFields={
                                changedFields
                            }
                            t={
                                t
                            }
                        />
                    )}
                </div>
            </div>
        </article>
    );
}

/* ==========================================================================
   DETALLE
   ========================================================================== */

function AuditDetails({
    log,
    changedFields,
    t,
}: {
    log: AuditLog;
    changedFields: string[];
    t: Translator;
}) {
    return (
        <div className="mt-3 grid min-w-0 gap-4 xl:grid-cols-2">
            <DetailCard
                title={t(
                    'audit.activity_information',
                )}
                icon={
                    <Activity className="size-4" />
                }
            >
                <DetailRow
                    label={t(
                        'audit.user',
                    )}
                    value={
                        log.actor
                            ?.name ??
                        t(
                            'audit.system',
                        )
                    }
                />

                {log.actor
                    ?.email && (
                    <DetailRow
                        label={t(
                            'audit.email',
                        )}
                        value={
                            log.actor
                                .email
                        }
                    />
                )}

                <DetailRow
                    label={t(
                        'audit.event',
                    )}
                    value={getEventLabel(
                        log.event,
                        t,
                    )}
                />

                <DetailRow
                    label={t(
                        'audit.module',
                    )}
                    value={getModuleLabel(
                        log.module,
                        t,
                    )}
                />

                {log.subject_type && (
                    <DetailRow
                        label={t(
                            'audit.affected_type',
                        )}
                        value={
                            log.subject_type
                        }
                        mono
                    />
                )}

                {log.subject_id && (
                    <DetailRow
                        label={t(
                            'audit.affected_id',
                        )}
                        value={String(
                            log.subject_id,
                        )}
                    />
                )}
            </DetailCard>

            <DetailCard
                title={t(
                    'audit.technical_information',
                )}
                icon={
                    <Globe2 className="size-4" />
                }
            >
                {log.ip_address && (
                    <DetailRow
                        label="IP"
                        value={
                            log.ip_address
                        }
                        mono
                    />
                )}

                {log.method && (
                    <DetailRow
                        label={t(
                            'audit.method',
                        )}
                        value={
                            log.method
                        }
                    />
                )}

                {log.route && (
                    <DetailRow
                        label={t(
                            'audit.route',
                        )}
                        value={
                            log.route
                        }
                        mono
                    />
                )}

                {log.url && (
                    <DetailRow
                        label="URL"
                        value={
                            log.url
                        }
                        mono
                    />
                )}

                {log.user_agent && (
                    <DetailRow
                        label={t(
                            'audit.browser_device',
                        )}
                        value={
                            log.user_agent
                        }
                    />
                )}
            </DetailCard>

            {changedFields.length >
                0 && (
                <Card className="overflow-hidden rounded-xl shadow-none xl:col-span-2">
                    <CardHeader className="border-b bg-muted/[0.08]">
                        <CardTitle className="text-sm">
                            {t(
                                'audit.changes_made',
                            )}
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="p-0">
                        <div className="w-full overflow-x-auto">
                            <Table className="min-w-[650px]">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>
                                            {t(
                                                'audit.field',
                                            )}
                                        </TableHead>

                                        <TableHead>
                                            {t(
                                                'audit.before',
                                            )}
                                        </TableHead>

                                        <TableHead>
                                            {t(
                                                'audit.after',
                                            )}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {changedFields.map(
                                        (
                                            field,
                                        ) => (
                                            <TableRow
                                                key={
                                                    field
                                                }
                                            >
                                                <TableCell className="font-medium">
                                                    {getFieldLabel(
                                                        field,
                                                        t,
                                                    )}
                                                </TableCell>

                                                <TableCell className="max-w-[320px] whitespace-pre-wrap break-words text-muted-foreground">
                                                    {formatValue(
                                                        log
                                                            .old_values?.[
                                                            field
                                                        ],
                                                        t,
                                                    )}
                                                </TableCell>

                                                <TableCell className="max-w-[320px] whitespace-pre-wrap break-words font-medium">
                                                    {formatValue(
                                                        log
                                                            .new_values?.[
                                                            field
                                                        ],
                                                        t,
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ),
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

/* ==========================================================================
   COMPONENTES DE APOYO
   ========================================================================== */

function FilterField({
    label,
    children,
}: {
    label: string;
    children: ReactNode;
}) {
    return (
        <div className="min-w-0 space-y-2">
            <Label className="text-xs font-semibold">
                {label}
            </Label>

            {children}
        </div>
    );
}

function StatCard({
    icon,
    label,
    value,
    tone = 'default',
}: {
    icon: ReactNode;
    label: string;
    value: number;
    tone?:
        | 'default'
        | 'success'
        | 'warning';
}) {
    const iconClass =
        tone === 'success'
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            : tone === 'warning'
              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
              : 'bg-primary/10 text-primary';

    return (
        <Card className="rounded-2xl">
            <CardContent className="p-4">
                <div className="flex items-center gap-3">
                    <div
                        className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
                    >
                        {icon}
                    </div>

                    <div className="min-w-0">
                        <p className="text-[10px] font-medium uppercase leading-4 tracking-[0.05em] text-muted-foreground sm:text-[11px]">
                            {label}
                        </p>

                        <p className="mt-1 text-xl font-bold tracking-tight">
                            {value}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function EventBadge({
    event,
    label,
}: {
    event: string;
    label: string;
}) {
    return (
        <Badge
            variant="outline"
            className={[
                'text-[10px]',
                eventBadgeTone(
                    event,
                ),
            ].join(
                ' ',
            )}
        >
            {label}
        </Badge>
    );
}

function MetaBadge({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <Badge
            variant="outline"
            className="gap-1.5 font-normal text-[10px] text-muted-foreground"
        >
            {children}
        </Badge>
    );
}

function ValueBox({
    value,
    muted = false,
}: {
    value: string;
    muted?: boolean;
}) {
    return (
        <div
            className={[
                'min-w-0 whitespace-pre-wrap break-words rounded-lg border bg-background px-2.5 py-2 text-xs',
                muted
                    ? 'text-muted-foreground'
                    : 'font-medium',
            ].join(
                ' ',
            )}
        >
            {value}
        </div>
    );
}

function DetailCard({
    title,
    icon,
    children,
}: {
    title: string;
    icon: ReactNode;
    children: ReactNode;
}) {
    return (
        <Card className="rounded-xl shadow-none">
            <CardHeader className="border-b bg-muted/[0.08]">
                <div className="flex items-center gap-2">
                    <span className="text-primary">
                        {icon}
                    </span>

                    <CardTitle className="text-sm">
                        {title}
                    </CardTitle>
                </div>
            </CardHeader>

            <CardContent className="space-y-3 p-4">
                {children}
            </CardContent>
        </Card>
    );
}

function DetailRow({
    label,
    value,
    mono = false,
}: {
    label: string;
    value: string;
    mono?: boolean;
}) {
    return (
        <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-[0.05em] text-muted-foreground">
                {label}
            </p>

            <p
                className={[
                    'mt-1 break-words text-sm',
                    mono
                        ? 'font-mono text-xs'
                        : 'font-medium',
                ].join(
                    ' ',
                )}
            >
                {value}
            </p>
        </div>
    );
}

function EmptyAudit({
    t,
}: {
    t: Translator;
}) {
    return (
        <CardContent className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <Activity className="size-6" />
            </div>

            <h3 className="mt-4 font-semibold">
                {t(
                    'audit.no_activity',
                )}
            </h3>

            <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
                {t(
                    'audit.no_activity_description',
                )}
            </p>
        </CardContent>
    );
}

/* ==========================================================================
   TONOS DE EVENTOS
   ========================================================================== */

function eventTone(
    event: string,
): string {
    switch (event) {
        case 'login':
            return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';

        case 'logout':
            return 'border-slate-500/20 bg-slate-500/10 text-slate-600 dark:text-slate-400';

        case 'create':
            return 'border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400';

        case 'update':
        case 'role_change':
        case 'status_change':
            return 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400';

        case 'delete':
            return 'border-destructive/20 bg-destructive/10 text-destructive';

        default:
            return 'border-primary/15 bg-primary/10 text-primary';
    }
}

function eventBadgeTone(
    event: string,
): string {
    switch (event) {
        case 'login':
            return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';

        case 'logout':
            return 'border-slate-500/20 bg-slate-500/10 text-slate-600 dark:text-slate-400';

        case 'create':
            return 'border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400';

        case 'update':
        case 'role_change':
        case 'status_change':
            return 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400';

        case 'delete':
            return 'border-destructive/20 bg-destructive/10 text-destructive';

        default:
            return 'border-primary/15 bg-primary/10 text-primary';
    }
}
