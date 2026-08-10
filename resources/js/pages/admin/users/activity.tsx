import {
    Head,
    Link,
    router,
} from '@inertiajs/react';

import {
    Activity,
    ArrowLeft,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Clock3,
    Globe2,
    History,
    LogIn,
    LogOut,
    Pencil,
    PlusCircle,
    RefreshCw,
    Shield,
    ShieldCheck,
    Sparkles,
    Trash2,
    UserCog,
    UserRound,
    Wifi,
} from 'lucide-react';

import {
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
import { type TranslationKey } from '@/i18n/translations';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Actor {
    id: number;
    name: string;
    email: string;
}

interface ActivityItem {
    id: number;
    event: string;
    module: string | null;
    description: string | null;

    relation:
        | 'performed'
        | 'affected'
        | 'self';

    actor: Actor | null;

    subject_type: string | null;
    subject_id: number | null;

    old_values: Record<string, unknown>;
    new_values: Record<string, unknown>;

    ip_address: string | null;
    method: string | null;
    route: string | null;
    url: string | null;
    user_agent: string | null;

    created_at: string | null;
    created_at_human: string | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface ActivitiesPagination {
    data: ActivityItem[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    links: PaginationLink[];
}

interface UserItem {
    id: number;
    name: string;
    username: string | null;
    email: string;
    status: string;
    roles: string[];

    presence:
        | 'online'
        | 'away'
        | 'offline';

    last_login_at: string | null;
    last_login_at_human: string | null;

    last_seen_at: string | null;
    last_seen_at_human: string | null;
}

interface Props {
    user: UserItem;
    activities: ActivitiesPagination;

    can: {
        updateUser: boolean;
    };
}

type Translate = (
    key: TranslationKey,
) => string;

const eventLabelKeys: Record<
    string,
    TranslationKey
> = {
    login: 'users.activity.event.login',
    logout: 'users.activity.event.logout',
    create: 'users.activity.event.create',
    update: 'users.activity.event.update',
    delete: 'users.activity.event.delete',
    role_change:
        'users.activity.event.role_change',
    status_change:
        'users.activity.event.status_change',
    permission_change:
        'users.activity.event.permission_change',
    page_view:
        'users.activity.event.page_view',
    audit_export:
        'users.activity.event.audit_export',
    audit_prune:
        'users.activity.event.audit_prune',
    audit_retention_update:
        'users.activity.event.audit_retention_update',
    permission_sync:
        'users.activity.event.permission_sync',
    system_settings_update:
        'users.activity.event.system_settings_update',
};

const moduleLabelKeys: Record<
    string,
    TranslationKey
> = {
    authentication:
        'users.activity.module.authentication',
    users: 'users.activity.module.users',
    roles: 'users.activity.module.roles',
    permissions:
        'users.activity.module.permissions',
    audit_logs:
        'users.activity.module.audit_logs',
    websites:
        'users.activity.module.websites',
    domains:
        'users.activity.module.domains',
    databases:
        'users.activity.module.databases',
    server:
        'users.activity.module.server',
    settings:
        'users.activity.module.settings',
};

const fieldLabelKeys: Record<
    string,
    TranslationKey
> = {
    id: 'users.activity.field.id',
    name: 'users.activity.field.name',
    username:
        'users.activity.field.username',
    email: 'users.activity.field.email',
    phone: 'users.activity.field.phone',
    status: 'users.activity.field.status',
    roles: 'users.activity.field.roles',
    permissions:
        'users.activity.field.permissions',
    panel_name:
        'users.activity.field.panel_name',
    short_name:
        'users.activity.field.short_name',
    timezone:
        'users.activity.field.timezone',
    locale:
        'users.activity.field.locale',
    date_format:
        'users.activity.field.date_format',
    time_format:
        'users.activity.field.time_format',
    per_page:
        'users.activity.field.per_page',
    retention_days:
        'users.activity.field.retention_days',
    cutoff:
        'users.activity.field.cutoff',
    deleted_count:
        'users.activity.field.deleted_count',
    format:
        'users.activity.field.format',
    filters:
        'users.activity.field.filters',
};

function eventLabel(
    event: string,
    t: Translate,
) {
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
        'users.activity.description.system_settings_update',
};

function activityDescription(
    activity: ActivityItem,
    t: Translate,
): string {
    const key =
        descriptionLabelKeys[
            activity.event
        ];

    if (key) {
        return t(key);
    }

    return (
        activity.description ??
        eventLabel(
            activity.event,
            t,
        )
    );
}

function moduleLabel(
    module: string | null,
    t: Translate,
) {
    if (!module) {
        return t(
            'users.activity.system',
        );
    }

    const key =
        moduleLabelKeys[module];

    return key
        ? t(key)
        : module;
}

function fieldLabel(
    field: string,
    t: Translate,
) {
    const key =
        fieldLabelKeys[field];

    return key
        ? t(key)
        : field;
}

function formatValue(
    value: unknown,
    t: Translate,
): string {
    if (
        value === null ||
        value === undefined ||
        value === ''
    ) {
        return '—';
    }

    if (Array.isArray(value)) {
        return value.length
            ? value.join(', ')
            : t('common.none');
    }

    if (typeof value === 'boolean') {
        return value
            ? t('common.yes')
            : t('common.no');
    }

    if (typeof value === 'object') {
        return JSON.stringify(
            value,
            null,
            2,
        );
    }

    if (value === 'es') {
        return t(
            'locale.es',
        );
    }

    if (value === 'en') {
        return t(
            'locale.en',
        );
    }

    if (value === 'active') {
        return t(
            'users.status.active',
        );
    }

    if (value === 'pending') {
        return t(
            'users.status.pending',
        );
    }

    if (value === 'suspended') {
        return t(
            'users.status.suspended',
        );
    }

    return String(value);
}

function statusLabel(
    status: string,
    t: Translate,
) {
    switch (status) {
        case 'active':
            return t(
                'users.status.active',
            );

        case 'pending':
            return t(
                'users.status.pending',
            );

        case 'suspended':
            return t(
                'users.status.suspended',
            );

        default:
            return status;
    }
}

function presenceLabel(
    presence:
        UserItem['presence'],
    t: Translate,
) {
    switch (presence) {
        case 'online':
            return t(
                'users.presence.online',
            );

        case 'away':
            return t(
                'users.presence.away',
            );

        case 'offline':
        default:
            return t(
                'users.presence.offline',
            );
    }
}

function relationLabel(
    relation:
        ActivityItem['relation'],
    t: Translate,
) {
    switch (relation) {
        case 'performed':
            return t(
                'users.activity.relation.performed',
            );

        case 'affected':
            return t(
                'users.activity.relation.affected',
            );

        case 'self':
            return t(
                'users.activity.relation.self',
            );
    }
}

function changedFields(
    activity: ActivityItem,
) {
    return Array.from(
        new Set([
            ...Object.keys(
                activity.old_values ?? {},
            ),
            ...Object.keys(
                activity.new_values ?? {},
            ),
        ]),
    );
}

function EventIcon({
    event,
}: {
    event: string;
}) {
    const className =
        'size-4';

    switch (event) {
        case 'login':
            return (
                <LogIn
                    className={
                        className
                    }
                />
            );

        case 'logout':
            return (
                <LogOut
                    className={
                        className
                    }
                />
            );

        case 'create':
            return (
                <PlusCircle
                    className={
                        className
                    }
                />
            );

        case 'update':
            return (
                <Pencil
                    className={
                        className
                    }
                />
            );

        case 'delete':
            return (
                <Trash2
                    className={
                        className
                    }
                />
            );

        case 'role_change':
            return (
                <UserCog
                    className={
                        className
                    }
                />
            );

        case 'status_change':
            return (
                <ShieldCheck
                    className={
                        className
                    }
                />
            );

        default:
            return (
                <Activity
                    className={
                        className
                    }
                />
            );
    }
}

export default function UserActivity({
    user,
    activities,
    can,
}: Props) {
    const { t } =
        useTranslation();

    const [
        expanded,
        setExpanded,
    ] = useState<number[]>([]);

    const [
        isRefreshing,
        setIsRefreshing,
    ] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t(
                'users.title',
            ),
            href: '/dashboard/usuarios',
        },
        {
            title: user.name,
            href: `/dashboard/usuarios/${user.id}/editar`,
        },
        {
            title: t(
                'users.activity.title',
            ),
            href: `/dashboard/usuarios/${user.id}/actividad`,
        },
    ];

    const initials =
        useMemo(
            () =>
                user.name
                    .split(' ')
                    .filter(Boolean)
                    .slice(0, 2)
                    .map(
                        (
                            part,
                        ) =>
                            part[0]
                                ?.toUpperCase(),
                    )
                    .join(''),
            [
                user.name,
            ],
        );

    const currentPageChanges =
        useMemo(
            () =>
                activities.data.filter(
                    (
                        activity,
                    ) =>
                        changedFields(
                            activity,
                        ).length >
                        0,
                ).length,
            [
                activities.data,
            ],
        );

    const currentPageSecurityEvents =
        useMemo(
            () =>
                activities.data.filter(
                    (
                        activity,
                    ) =>
                        [
                            'login',
                            'logout',
                            'status_change',
                            'role_change',
                            'permission_change',
                        ].includes(
                            activity.event,
                        ),
                ).length,
            [
                activities.data,
            ],
        );

    /*
    |--------------------------------------------------------------------------
    | Actualización automática
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        const refresh = () => {
            if (
                document.visibilityState !==
                'visible'
            ) {
                return;
            }

            router.reload({
                only: [
                    'user',
                    'activities',
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
                refresh,
                15_000,
            );

        const handleVisibilityChange =
            () => {
                if (
                    document.visibilityState ===
                    'visible'
                ) {
                    refresh();
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

    const toggleExpanded = (
        id: number,
    ) => {
        setExpanded(
            (
                current,
            ) =>
                current.includes(
                    id,
                )
                    ? current.filter(
                          (
                              item,
                          ) =>
                              item !==
                              id,
                      )
                    : [
                          ...current,
                          id,
                      ],
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
                title={`${t(
                    'users.activity.title',
                )} - ${user.name}`}
            />

            <div className="flex min-w-0 flex-1 flex-col gap-5 p-3 sm:p-4 lg:gap-6 lg:p-6">
                {/* =========================================================
                    ENCABEZADO
                ========================================================== */}

                <Card className="relative overflow-hidden rounded-3xl border-primary/10 shadow-sm">
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.07] via-transparent to-transparent" />
                    <div className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-primary/10 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-24 left-1/3 size-52 rounded-full bg-primary/[0.04] blur-3xl" />

                    <CardContent className="relative p-5 sm:p-6 lg:p-7">
                        <div className="flex min-w-0 flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                            <div className="flex min-w-0 items-start gap-4">
                                <Button
                                    asChild
                                    variant="outline"
                                    size="icon"
                                    className="size-10 shrink-0 rounded-xl"
                                >
                                    <Link
                                        href="/dashboard/usuarios"
                                        aria-label="Volver a usuarios"
                                    >
                                        <ArrowLeft className="size-4" />
                                    </Link>
                                </Button>

                                <div className="relative flex size-13 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-sm font-bold text-primary shadow-sm">
                                    {initials}

                                    <span
                                        className={[
                                            'absolute -bottom-1 -right-1 size-3.5 rounded-full border-2 border-card',
                                            presenceDotClass(
                                                user.presence,
                                            ),
                                        ].join(
                                            ' ',
                                        )}
                                    />
                                </div>

                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                            {user.name}
                                        </h1>

                                        <StatusBadge
                                            status={
                                                user.status
                                            }
                                            label={statusLabel(
                                                user.status,
                                                t,
                                            )}
                                        />
                                    </div>

                                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                                        {t(
                                            'users.activity.description',
                                        )}
                                    </p>

                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <Badge
                                            variant="outline"
                                            className="gap-1.5 rounded-full"
                                        >
                                            <Wifi className="size-3" />

                                            {presenceLabel(
                                                user.presence,
                                                t,
                                            )}
                                        </Badge>

                                        <Badge
                                            variant="outline"
                                            className="gap-1.5 rounded-full"
                                        >
                                            <History className="size-3" />

                                            {
                                                activities.total
                                            }{' '}
                                            actividades
                                        </Badge>

                                        <Badge
                                            variant="outline"
                                            className="gap-1.5 rounded-full"
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
                                                ? 'Actualizando...'
                                                : 'Actualización automática'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {can.updateUser && (
                                <Button
                                    asChild
                                    variant="outline"
                                    className="h-11 rounded-xl"
                                >
                                    <Link
                                        href={`/dashboard/usuarios/${user.id}/editar`}
                                    >
                                        <Pencil className="size-4" />

                                        {t(
                                            'users.activity.manage_user',
                                        )}
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* =========================================================
                    RESUMEN
                ========================================================== */}

                <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 2xl:grid-cols-4">
                    <StatCard
                        icon={
                            <Wifi className="size-4" />
                        }
                        label={t(
                            'users.activity.presence',
                        )}
                        value={presenceLabel(
                            user.presence,
                            t,
                        )}
                        description={
                            user.last_seen_at_human ??
                            t(
                                'users.no_activity',
                            )
                        }
                        tone={
                            user.presence ===
                            'online'
                                ? 'success'
                                : user.presence ===
                                    'away'
                                  ? 'warning'
                                  : 'default'
                        }
                    />

                    <StatCard
                        icon={
                            <Clock3 className="size-4" />
                        }
                        label={t(
                            'users.last_login',
                        )}
                        value={
                            user.last_login_at_human ??
                            t(
                                'users.never',
                            )
                        }
                        description={
                            user.last_login_at ??
                            '—'
                        }
                    />

                    <StatCard
                        icon={
                            <History className="size-4" />
                        }
                        label={t(
                            'users.activity.activities',
                        )}
                        value={String(
                            activities.total,
                        )}
                        description={t(
                            'users.activity.related_records',
                        )}
                    />

                    <StatCard
                        icon={
                            <Shield className="size-4" />
                        }
                        label={t(
                            'users.activity.roles',
                        )}
                        value={String(
                            user.roles.length,
                        )}
                        description={
                            user.roles.length
                                ? user.roles.join(
                                      ', ',
                                  )
                                : t(
                                      'users.no_role',
                                  )
                        }
                        tone="primary"
                    />
                </div>

                {/* =========================================================
                    IDENTIDAD
                ========================================================== */}

                <Card className="overflow-hidden rounded-2xl border-primary/10 shadow-sm">
                    <CardHeader className="border-b bg-muted/[0.08]">
                        <div className="flex items-start gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-background text-primary">
                                <UserRound className="size-4" />
                            </div>

                            <div>
                                <CardTitle className="text-base">
                                    Información del usuario
                                </CardTitle>

                                <CardDescription className="mt-1">
                                    Datos de identidad y actividad reciente.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-5 sm:p-6">
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            <IdentityItem
                                label={t(
                                    'users.activity.email',
                                )}
                                value={
                                    user.email
                                }
                            />

                            <IdentityItem
                                label={t(
                                    'users.activity.username',
                                )}
                                value={
                                    user.username
                                        ? `@${user.username}`
                                        : '—'
                                }
                                mono
                            />

                            <IdentityItem
                                label={t(
                                    'users.last_activity',
                                )}
                                value={
                                    user.last_seen_at ??
                                    t(
                                        'users.never',
                                    )
                                }
                            />

                            <IdentityItem
                                label={t(
                                    'users.activity.roles',
                                )}
                            >
                                <RoleBadges
                                    roles={
                                        user.roles
                                    }
                                    emptyLabel={t(
                                        'users.no_role',
                                    )}
                                />
                            </IdentityItem>
                        </div>
                    </CardContent>
                </Card>

                {/* =========================================================
                    INSIGHTS DE LA PÁGINA ACTUAL
                ========================================================== */}

                <div className="grid gap-3 md:grid-cols-2">
                    <MiniInsight
                        icon={
                            <Sparkles className="size-4" />
                        }
                        title="Cambios detectados"
                        value={
                            currentPageChanges
                        }
                        description="Registros de esta página que modificaron uno o más campos."
                    />

                    <MiniInsight
                        icon={
                            <ShieldCheck className="size-4" />
                        }
                        title="Eventos de seguridad"
                        value={
                            currentPageSecurityEvents
                        }
                        description="Inicios, cierres y cambios de acceso visibles en esta página."
                    />
                </div>

                {/* =========================================================
                    HISTORIAL
                ========================================================== */}

                <Card className="overflow-hidden rounded-2xl border-primary/10 shadow-sm">
                    <CardHeader className="border-b bg-gradient-to-r from-muted/[0.16] to-transparent">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="text-base">
                                    {t(
                                        'users.activity.history',
                                    )}
                                </CardTitle>

                                <CardDescription className="mt-1">
                                    {t(
                                        'users.activity.history_description',
                                    )}
                                </CardDescription>
                            </div>

                            <Badge
                                variant="secondary"
                                className="w-fit rounded-full px-3"
                            >
                                {
                                    activities.total
                                }{' '}
                                registros
                            </Badge>
                        </div>
                    </CardHeader>

                    {activities.data.length ===
                    0 ? (
                        <EmptyActivity
                            t={t}
                        />
                    ) : (
                        <CardContent className="p-0">
                            <div className="divide-y divide-border/70">
                                {activities.data.map(
                                    (
                                        activity,
                                    ) => {
                                        const isOpen =
                                            expanded.includes(
                                                activity.id,
                                            );

                                        const fields =
                                            changedFields(
                                                activity,
                                            );

                                        return (
                                            <ActivityEntry
                                                key={
                                                    activity.id
                                                }
                                                activity={
                                                    activity
                                                }
                                                fields={
                                                    fields
                                                }
                                                isOpen={
                                                    isOpen
                                                }
                                                t={
                                                    t
                                                }
                                                onToggle={() =>
                                                    toggleExpanded(
                                                        activity.id,
                                                    )
                                                }
                                            />
                                        );
                                    },
                                )}
                            </div>
                        </CardContent>
                    )}

                    {activities.last_page >
                        1 && (
                        <div className="flex min-w-0 flex-col gap-3 border-t bg-muted/[0.08] p-4 lg:flex-row lg:items-center lg:justify-between">
                            <p className="text-sm text-muted-foreground">
                                {t(
                                    'users.showing',
                                )}{' '}
                                {activities.from ??
                                    0}{' '}
                                –{' '}
                                {activities.to ??
                                    0}{' '}
                                {t(
                                    'users.of',
                                )}{' '}
                                {
                                    activities.total
                                }
                            </p>

                            <div className="flex flex-wrap gap-2">
                                {activities.links.map(
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
   ENTRADA DE ACTIVIDAD
   ========================================================================== */

function ActivityEntry({
    activity,
    fields,
    isOpen,
    t,
    onToggle,
}: {
    activity: ActivityItem;
    fields: string[];
    isOpen: boolean;
    t: Translate;
    onToggle: () => void;
}) {
    return (
        <article className="relative p-4 transition-colors hover:bg-muted/[0.08] sm:p-5">
            <div className="flex min-w-0 gap-3 sm:gap-4">
                <div className="relative shrink-0">
                    <div
                        className={[
                            'flex size-10 items-center justify-center rounded-xl border',
                            eventTone(
                                activity.event,
                            ),
                        ].join(
                            ' ',
                        )}
                    >
                        <EventIcon
                            event={
                                activity.event
                            }
                        />
                    </div>

                    <div className="absolute bottom-[-18px] left-1/2 hidden h-[18px] w-px -translate-x-1/2 bg-border sm:block" />
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <EventBadge
                                    event={
                                        activity.event
                                    }
                                    label={eventLabel(
                                        activity.event,
                                        t,
                                    )}
                                />

                                <RelationBadge
                                    relation={
                                        activity.relation
                                    }
                                    label={relationLabel(
                                        activity.relation,
                                        t,
                                    )}
                                />

                                <Badge
                                    variant="outline"
                                    className="text-[10px]"
                                >
                                    {moduleLabel(
                                        activity.module,
                                        t,
                                    )}
                                </Badge>
                            </div>

                            <p className="mt-2 max-w-3xl text-sm leading-6">
                                {activityDescription(
                                    activity,
                                    t,
                                )}
                            </p>

                            <div className="mt-3 flex flex-wrap gap-2">
                                {activity.actor && (
                                    <MetaBadge>
                                        <UserRound className="size-3" />

                                        {t(
                                            'users.activity.by',
                                        )}
                                        :{' '}
                                        {
                                            activity
                                                .actor
                                                .name
                                        }
                                    </MetaBadge>
                                )}

                                {activity.ip_address && (
                                    <MetaBadge>
                                        <Globe2 className="size-3" />

                                        {
                                            activity.ip_address
                                        }
                                    </MetaBadge>
                                )}

                                {activity.method && (
                                    <MetaBadge>
                                        {
                                            activity.method
                                        }
                                    </MetaBadge>
                                )}

                                {activity.subject_id && (
                                    <MetaBadge>
                                        #
                                        {
                                            activity.subject_id
                                        }
                                    </MetaBadge>
                                )}
                            </div>
                        </div>

                        <div className="shrink-0 lg:text-right">
                            <p className="text-sm font-semibold">
                                {activity.created_at_human ??
                                    '—'}
                            </p>

                            <p className="mt-0.5 text-[10px] text-muted-foreground">
                                {activity.created_at ??
                                    ''}
                            </p>
                        </div>
                    </div>

                    {fields.length >
                        0 && (
                        <QuickChanges
                            activity={
                                activity
                            }
                            fields={
                                fields
                            }
                            t={
                                t
                            }
                        />
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
                                  'users.activity.hide_details',
                              )
                            : t(
                                  'users.activity.show_details',
                              )}
                    </Button>

                    {isOpen && (
                        <ActivityDetails
                            activity={
                                activity
                            }
                            fields={
                                fields
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
   CAMBIOS RÁPIDOS
   ========================================================================== */

function QuickChanges({
    activity,
    fields,
    t,
}: {
    activity: ActivityItem;
    fields: string[];
    t: Translate;
}) {
    return (
        <div className="mt-4 overflow-hidden rounded-xl border bg-muted/[0.10]">
            <div className="divide-y">
                {fields
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
                                className="grid gap-2 p-3 text-sm lg:grid-cols-[140px_minmax(0,1fr)_30px_minmax(0,1fr)] lg:items-center"
                            >
                                <span className="font-medium">
                                    {fieldLabel(
                                        field,
                                        t,
                                    )}
                                </span>

                                <ValueBox
                                    value={formatValue(
                                        activity
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
                                        activity
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
    );
}

/* ==========================================================================
   DETALLES
   ========================================================================== */

function ActivityDetails({
    activity,
    fields,
    t,
}: {
    activity: ActivityItem;
    fields: string[];
    t: Translate;
}) {
    return (
        <div className="mt-3 grid min-w-0 gap-4 xl:grid-cols-2">
            <DetailCard
                title={t(
                    'users.activity.details_activity',
                )}
                icon={
                    <Activity className="size-4" />
                }
            >
                <DetailRow
                    label={t(
                        'users.activity.actor',
                    )}
                    value={
                        activity.actor
                            ?.name ??
                        t(
                            'users.activity.system',
                        )
                    }
                />

                {activity.actor
                    ?.email && (
                    <DetailRow
                        label="Email"
                        value={
                            activity.actor
                                .email
                        }
                    />
                )}

                <DetailRow
                    label={t(
                        'users.activity.relation',
                    )}
                    value={relationLabel(
                        activity.relation,
                        t,
                    )}
                />

                <DetailRow
                    label={t(
                        'users.activity.module',
                    )}
                    value={moduleLabel(
                        activity.module,
                        t,
                    )}
                />

                {activity.subject_type && (
                    <DetailRow
                        label="Tipo afectado"
                        value={
                            activity.subject_type
                        }
                        mono
                    />
                )}

                {activity.subject_id && (
                    <DetailRow
                        label={t(
                            'users.activity.affected_record',
                        )}
                        value={`#${activity.subject_id}`}
                    />
                )}
            </DetailCard>

            <DetailCard
                title={t(
                    'users.activity.technical_info',
                )}
                icon={
                    <Globe2 className="size-4" />
                }
            >
                {activity.ip_address && (
                    <DetailRow
                        label="IP"
                        value={
                            activity.ip_address
                        }
                        mono
                    />
                )}

                {activity.method && (
                    <DetailRow
                        label={t(
                            'users.activity.method',
                        )}
                        value={
                            activity.method
                        }
                    />
                )}

                {activity.route && (
                    <DetailRow
                        label={t(
                            'users.activity.route',
                        )}
                        value={
                            activity.route
                        }
                        mono
                    />
                )}

                {activity.url && (
                    <DetailRow
                        label="URL"
                        value={
                            activity.url
                        }
                        mono
                    />
                )}

                {activity.user_agent && (
                    <DetailRow
                        label="Navegador / dispositivo"
                        value={
                            activity.user_agent
                        }
                    />
                )}
            </DetailCard>

            {fields.length >
                0 && (
                <Card className="overflow-hidden rounded-xl shadow-none xl:col-span-2">
                    <CardHeader className="border-b bg-muted/[0.08]">
                        <CardTitle className="text-sm">
                            {t(
                                'users.activity.all_changes',
                            )}
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="p-0">
                        <Table className="min-w-[680px]">
                            <TableHeader className="bg-muted/30">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-[24%]">
                                        {t(
                                            'users.activity.field',
                                        )}
                                    </TableHead>

                                    <TableHead className="w-[38%]">
                                        {t(
                                            'users.activity.before',
                                        )}
                                    </TableHead>

                                    <TableHead className="w-[38%]">
                                        {t(
                                            'users.activity.after',
                                        )}
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {fields.map(
                                    (
                                        field,
                                    ) => (
                                        <TableRow
                                            key={
                                                field
                                            }
                                        >
                                            <TableCell className="whitespace-normal font-medium">
                                                {fieldLabel(
                                                    field,
                                                    t,
                                                )}
                                            </TableCell>

                                            <TableCell className="max-w-[340px] whitespace-pre-wrap break-words text-muted-foreground">
                                                {formatValue(
                                                    activity
                                                        .old_values?.[
                                                        field
                                                    ],
                                                    t,
                                                )}
                                            </TableCell>

                                            <TableCell className="max-w-[340px] whitespace-pre-wrap break-words font-medium">
                                                {formatValue(
                                                    activity
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
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

/* ==========================================================================
   COMPONENTES VISUALES
   ========================================================================== */

function StatCard({
    icon,
    label,
    value,
    description,
    tone = 'default',
}: {
    icon: ReactNode;
    label: string;
    value: string;
    description?: string;
    tone?:
        | 'default'
        | 'success'
        | 'warning'
        | 'primary';
}) {
    const iconClass =
        tone === 'success'
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            : tone === 'warning'
              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
              : 'bg-primary/10 text-primary';

    return (
        <Card className="group relative overflow-hidden rounded-2xl border-primary/10 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-[10px] font-medium uppercase tracking-[0.07em] text-muted-foreground">
                            {label}
                        </p>

                        <p
                            className="mt-2 truncate text-xl font-bold tracking-tight"
                            title={
                                value
                            }
                        >
                            {value}
                        </p>

                        {description && (
                            <p
                                className="mt-1 truncate text-[11px] text-muted-foreground"
                                title={
                                    description
                                }
                            >
                                {
                                    description
                                }
                            </p>
                        )}
                    </div>

                    <div
                        className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
                    >
                        {icon}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function MiniInsight({
    icon,
    title,
    value,
    description,
}: {
    icon: ReactNode;
    title: string;
    value: number;
    description: string;
}) {
    return (
        <Card className="rounded-2xl border-primary/10 shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    {icon}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                        <p className="text-xl font-bold">
                            {value}
                        </p>

                        <p className="text-sm font-semibold">
                            {title}
                        </p>
                    </div>

                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {description}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

function IdentityItem({
    label,
    value,
    mono = false,
    children,
}: {
    label: string;
    value?: string;
    mono?: boolean;
    children?: ReactNode;
}) {
    return (
        <div className="min-w-0 rounded-xl border bg-muted/[0.07] p-3.5">
            <p className="text-[10px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
                {label}
            </p>

            {children ?? (
                <p
                    className={[
                        'mt-1.5 break-words text-sm font-medium',
                        mono
                            ? 'font-mono text-xs'
                            : '',
                    ].join(
                        ' ',
                    )}
                >
                    {value}
                </p>
            )}
        </div>
    );
}

function RoleBadges({
    roles,
    emptyLabel,
}: {
    roles: string[];
    emptyLabel: string;
}) {
    if (!roles.length) {
        return (
            <p className="mt-1.5 text-sm text-muted-foreground">
                {emptyLabel}
            </p>
        );
    }

    return (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
            {roles.map(
                (
                    role,
                ) => (
                    <Badge
                        key={
                            role
                        }
                        variant="outline"
                        className="gap-1.5 rounded-full capitalize"
                    >
                        <Shield className="size-3 text-primary" />

                        {role}
                    </Badge>
                ),
            )}
        </div>
    );
}

function StatusBadge({
    status,
    label,
}: {
    status: string;
    label: string;
}) {
    const classes: Record<
        string,
        string
    > = {
        active:
            'border-transparent bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        pending:
            'border-transparent bg-amber-500/10 text-amber-600 dark:text-amber-400',
        suspended:
            'border-transparent bg-destructive/10 text-destructive',
    };

    return (
        <Badge
            variant="outline"
            className={`rounded-full ${
                classes[status] ??
                'border-transparent bg-muted text-muted-foreground'
            }`}
        >
            {label}
        </Badge>
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

function RelationBadge({
    relation,
    label,
}: {
    relation:
        ActivityItem['relation'];
    label: string;
}) {
    const classes =
        relation ===
        'performed'
            ? 'border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400'
            : relation ===
                'affected'
              ? 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400'
              : 'border-primary/20 bg-primary/10 text-primary';

    return (
        <Badge
            variant="outline"
            className={`text-[10px] ${classes}`}
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

function EmptyActivity({
    t,
}: {
    t: Translate;
}) {
    return (
        <CardContent className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <History className="size-6" />
            </div>

            <h3 className="mt-4 font-semibold">
                {t(
                    'users.activity.empty_title',
                )}
            </h3>

            <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
                {t(
                    'users.activity.empty_description',
                )}
            </p>
        </CardContent>
    );
}

/* ==========================================================================
   COLORES
   ========================================================================== */

function presenceDotClass(
    presence:
        UserItem['presence'],
): string {
    switch (presence) {
        case 'online':
            return 'bg-emerald-500';

        case 'away':
            return 'bg-amber-500';

        case 'offline':
        default:
            return 'bg-zinc-400 dark:bg-zinc-600';
    }
}

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
    return eventTone(
        event,
    );
}
