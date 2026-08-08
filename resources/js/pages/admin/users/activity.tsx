import { Head, Link, router } from '@inertiajs/react';
import {
    Activity,
    ArrowLeft,
    ChevronDown,
    ChevronUp,
    Clock3,
    Globe2,
    History,
    LogIn,
    LogOut,
    Pencil,
    PlusCircle,
    Shield,
    ShieldCheck,
    Trash2,
    UserCog,
} from 'lucide-react';
import { useEffect, useState } from 'react';

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

function statusClass(status: string) {
    switch (status) {
        case 'active':
            return 'bg-green-500/10 text-green-600 dark:text-green-400';

        case 'pending':
            return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';

        case 'suspended':
            return 'bg-red-500/10 text-red-600 dark:text-red-400';

        default:
            return 'bg-muted text-muted-foreground';
    }
}

function presenceLabel(
    presence: UserItem['presence'],
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

function presenceClass(
    presence: UserItem['presence'],
) {
    switch (presence) {
        case 'online':
            return 'bg-green-500';

        case 'away':
            return 'bg-yellow-500';

        case 'offline':
        default:
            return 'bg-zinc-400 dark:bg-zinc-600';
    }
}

function relationLabel(
    relation: ActivityItem['relation'],
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
                <Activity
                    className={className}
                />
            );
    }
}

export default function UserActivity({
    user,
    activities,
    can,
}: Props) {
    const { t } = useTranslation();

    const [
        expanded,
        setExpanded,
    ] = useState<number[]>([]);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('users.title'),
            href: '/dashboard/usuarios',
        },
        {
            title: user.name,
            href: `/dashboard/usuarios/${user.id}/editar`,
        },
        {
            title: t('users.activity.title'),
            href: `/dashboard/usuarios/${user.id}/actividad`,
        },
    ];

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
        setExpanded((current) =>
            current.includes(id)
                ? current.filter(
                    (item) => item !== id,
                )
                : [...current, id],
        );
    };

    const paginationLabel = (
        label: string,
    ): string => {
        const normalized = label
            .replace(/&laquo;|&raquo;/g, '')
            .replace(/«|»/g, '')
            .trim()
            .toLowerCase();

        if (
            normalized.includes('previous') ||
            normalized.includes('anterior')
        ) {
            return `« ${t(
                'pagination.previous',
            )}`;
        }

        if (
            normalized.includes('next') ||
            normalized.includes('siguiente')
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
            <Head
                title={`${t('users.activity.title')} - ${user.name}`}
            />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Encabezado */}

                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-3">
                        <Link
                            href="/dashboard/usuarios"
                            className="mt-1 inline-flex size-9 shrink-0 items-center justify-center rounded-md border hover:bg-muted"
                        >
                            <ArrowLeft className="size-4" />
                        </Link>

                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-2xl font-bold tracking-tight">
                                    {user.name}
                                </h1>

                                <span
                                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
                                        user.status,
                                    )}`}
                                >
                                    {statusLabel(
                                        user.status,
                                        t,
                                    )}
                                </span>
                            </div>

                            <p className="mt-1 text-sm text-muted-foreground">
                                {t(
                                    'users.activity.description',
                                )}
                            </p>
                        </div>
                    </div>

                    {can.updateUser && (
                        <Link
                            href={`/dashboard/usuarios/${user.id}/editar`}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border px-4 text-sm font-medium hover:bg-muted"
                        >
                            <Pencil className="size-4" />
                            {t(
                                'users.activity.manage_user',
                            )}
                        </Link>
                    )}
                </div>

                {/* Resumen */}

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-xl border bg-card p-5 shadow-sm">
                        <p className="text-sm text-muted-foreground">
                            {t(
                                'users.activity.presence',
                            )}
                        </p>

                        <div className="mt-3 flex items-center gap-2">
                            <span
                                className={`size-2.5 rounded-full ${presenceClass(
                                    user.presence,
                                )}`}
                            />

                            <span className="font-semibold">
                                {presenceLabel(
                                    user.presence,
                                    t,
                                )}
                            </span>
                        </div>

                        <p className="mt-2 text-xs text-muted-foreground">
                            {user.last_seen_at_human ??
                                t(
                                    'users.no_activity',
                                )}
                        </p>
                    </div>

                    <div className="rounded-xl border bg-card p-5 shadow-sm">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock3 className="size-4" />
                            {t(
                                'users.last_login',
                            )}
                        </div>

                        <p className="mt-3 font-semibold">
                            {user.last_login_at_human ??
                                t(
                                    'users.never',
                                )}
                        </p>

                        <p className="mt-2 text-xs text-muted-foreground">
                            {user.last_login_at ?? '—'}
                        </p>
                    </div>

                    <div className="rounded-xl border bg-card p-5 shadow-sm">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <History className="size-4" />
                            {t(
                                'users.activity.activities',
                            )}
                        </div>

                        <p className="mt-3 text-2xl font-bold">
                            {activities.total}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                            {t(
                                'users.activity.related_records',
                            )}
                        </p>
                    </div>

                    <div className="rounded-xl border bg-card p-5 shadow-sm">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Shield className="size-4" />
                            {t(
                                'users.activity.roles',
                            )}
                        </div>

                        <div className="mt-3 flex flex-wrap gap-1">
                            {user.roles.length ? (
                                user.roles.map(
                                    (role) => (
                                        <span
                                            key={role}
                                            className="rounded-full border px-2 py-1 text-xs"
                                        >
                                            {role}
                                        </span>
                                    ),
                                )
                            ) : (
                                <span className="text-sm text-muted-foreground">
                                    {t(
                                        'users.no_role',
                                    )}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Identidad */}

                <div className="rounded-xl border bg-card p-5 shadow-sm">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <p className="text-xs text-muted-foreground">
                                {t(
                                'users.activity.email',
                            )}
                            </p>

                            <p className="mt-1 text-sm font-medium">
                                {user.email}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-muted-foreground">
                                {t(
                                'users.activity.username',
                            )}
                            </p>

                            <p className="mt-1 text-sm font-medium">
                                {user.username
                                    ? `@${user.username}`
                                    : '—'}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-muted-foreground">
                                {t(
                                'users.last_activity',
                            )}
                            </p>

                            <p className="mt-1 text-sm font-medium">
                                {user.last_seen_at ??
                                    t(
                                    'users.never',
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Historial */}

                <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <div className="border-b p-5">
                        <h2 className="font-semibold">
                            {t(
                                'users.activity.history',
                            )}
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            {t(
                                'users.activity.history_description',
                            )}
                        </p>
                    </div>

                    {activities.data.length ===
                    0 ? (
                        <div className="flex min-h-56 flex-col items-center justify-center p-8 text-center">
                            <History className="mb-3 size-10 text-muted-foreground" />

                            <h3 className="font-semibold">
                                {t(
                                    'users.activity.empty_title',
                                )}
                            </h3>

                            <p className="mt-1 text-sm text-muted-foreground">
                                {t(
                                    'users.activity.empty_description',
                                )}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {activities.data.map(
                                (activity) => {
                                    const isOpen =
                                        expanded.includes(
                                            activity.id,
                                        );

                                    const fields =
                                        changedFields(
                                            activity,
                                        );

                                    return (
                                        <article
                                            key={
                                                activity.id
                                            }
                                            className="p-5"
                                        >
                                            <div className="flex gap-4">
                                                <div className="flex size-10 shrink-0 items-center justify-center rounded-full border bg-muted/40">
                                                    <EventIcon
                                                        event={
                                                            activity.event
                                                        }
                                                    />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                                                        <div>
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <span className="font-semibold">
                                                                    {eventLabel(
                                                                        activity.event,
                                                                        t,
                                                                    )}
                                                                </span>

                                                                <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                                                                    {relationLabel(
                                                                        activity.relation,
                                                                        t,
                                                                    )}
                                                                </span>
                                                            </div>

                                                            <p className="mt-1 text-sm">
                                                                {activityDescription(
                                                                    activity,
                                                                    t,
                                                                )}
                                                            </p>

                                                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                                                <span>
                                                                    {moduleLabel(
                                                                        activity.module,
                                                                        t,
                                                                    )}
                                                                </span>

                                                                {activity.actor && (
                                                                    <span>
                                                                        {t(
                                                                            'users.activity.by',
                                                                        )}
                                                                        :{' '}
                                                                        {
                                                                            activity
                                                                                .actor
                                                                                .name
                                                                        }
                                                                    </span>
                                                                )}

                                                                {activity.ip_address && (
                                                                    <span>
                                                                        IP:{' '}
                                                                        {
                                                                            activity.ip_address
                                                                        }
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="shrink-0 sm:text-right">
                                                            <p className="text-sm font-medium">
                                                                {activity.created_at_human ??
                                                                    '—'}
                                                            </p>

                                                            <p className="text-xs text-muted-foreground">
                                                                {activity.created_at ??
                                                                    ''}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {fields.length >
                                                        0 && (
                                                        <div className="mt-4 rounded-lg border bg-muted/20">
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
                                                                                className="grid gap-2 p-3 text-sm sm:grid-cols-[140px_1fr_30px_1fr]"
                                                                            >
                                                                                <span className="font-medium">
                                                                                    {fieldLabel(
                                                                                        field,
                                                                                        t,
                                                                                    )}
                                                                                </span>

                                                                                <span className="break-words text-muted-foreground">
                                                                                    {formatValue(
                                                                                        activity
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
                                                                                        activity
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

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            toggleExpanded(
                                                                activity.id,
                                                            )
                                                        }
                                                        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
                                                    >
                                                        {isOpen ? (
                                                            <>
                                                                <ChevronUp className="size-4" />
                                                                {t(
                                                                    'users.activity.hide_details',
                                                                )}
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ChevronDown className="size-4" />
                                                                {t(
                                                                    'users.activity.show_details',
                                                                )}
                                                            </>
                                                        )}
                                                    </button>

                                                    {isOpen && (
                                                        <div className="mt-4 grid gap-4 lg:grid-cols-2">
                                                            <div className="rounded-lg border p-4">
                                                                <h4 className="font-semibold">
                                                                    {t(
                                                                        'users.activity.details_activity',
                                                                    )}
                                                                </h4>

                                                                <dl className="mt-4 space-y-3 text-sm">
                                                                    <div>
                                                                        <dt className="text-muted-foreground">
                                                                            {t(
                                                                                'users.activity.actor',
                                                                            )}
                                                                        </dt>
                                                                        <dd>
                                                                            {activity
                                                                                .actor
                                                                                ?.name ??
                                                                                t(
                                                                                    'users.activity.system',
                                                                                )}
                                                                        </dd>
                                                                    </div>

                                                                    <div>
                                                                        <dt className="text-muted-foreground">
                                                                            {t(
                                                                                'users.activity.relation',
                                                                            )}
                                                                        </dt>
                                                                        <dd>
                                                                            {relationLabel(
                                                                                activity.relation,
                                                                                t,
                                                                            )}
                                                                        </dd>
                                                                    </div>

                                                                    <div>
                                                                        <dt className="text-muted-foreground">
                                                                            {t(
                                                                                'users.activity.module',
                                                                            )}
                                                                        </dt>
                                                                        <dd>
                                                                            {moduleLabel(
                                                                                activity.module,
                                                                                t,
                                                                            )}
                                                                        </dd>
                                                                    </div>

                                                                    {activity.subject_id && (
                                                                        <div>
                                                                            <dt className="text-muted-foreground">
                                                                                {t(
                                                                                    'users.activity.affected_record',
                                                                                )}
                                                                            </dt>
                                                                            <dd>
                                                                                #
                                                                                {
                                                                                    activity.subject_id
                                                                                }
                                                                            </dd>
                                                                        </div>
                                                                    )}
                                                                </dl>
                                                            </div>

                                                            <div className="rounded-lg border p-4">
                                                                <h4 className="font-semibold">
                                                                    {t(
                                                                        'users.activity.technical_info',
                                                                    )}
                                                                </h4>

                                                                <dl className="mt-4 space-y-3 text-sm">
                                                                    {activity.ip_address && (
                                                                        <div>
                                                                            <dt className="flex items-center gap-2 text-muted-foreground">
                                                                                <Globe2 className="size-4" />
                                                                                IP
                                                                            </dt>

                                                                            <dd className="mt-1">
                                                                                {
                                                                                    activity.ip_address
                                                                                }
                                                                            </dd>
                                                                        </div>
                                                                    )}

                                                                    {activity.method && (
                                                                        <div>
                                                                            <dt className="text-muted-foreground">
                                                                                {t(
                                                                                    'users.activity.method',
                                                                                )}
                                                                            </dt>
                                                                            <dd>
                                                                                {
                                                                                    activity.method
                                                                                }
                                                                            </dd>
                                                                        </div>
                                                                    )}

                                                                    {activity.route && (
                                                                        <div>
                                                                            <dt className="text-muted-foreground">
                                                                                {t(
                                                                                    'users.activity.route',
                                                                                )}
                                                                            </dt>
                                                                            <dd className="break-all">
                                                                                {
                                                                                    activity.route
                                                                                }
                                                                            </dd>
                                                                        </div>
                                                                    )}

                                                                    {activity.url && (
                                                                        <div>
                                                                            <dt className="text-muted-foreground">
                                                                                URL
                                                                            </dt>
                                                                            <dd className="break-all">
                                                                                {
                                                                                    activity.url
                                                                                }
                                                                            </dd>
                                                                        </div>
                                                                    )}
                                                                </dl>
                                                            </div>

                                                            {fields.length >
                                                                0 && (
                                                                <div className="rounded-lg border p-4 lg:col-span-2">
                                                                    <h4 className="font-semibold">
                                                                        {t(
                                                                            'users.activity.all_changes',
                                                                        )}
                                                                    </h4>

                                                                    <div className="mt-4 overflow-x-auto">
                                                                        <table className="w-full text-sm">
                                                                            <thead>
                                                                                <tr className="border-b text-left">
                                                                                    <th className="pb-3 pr-4">
                                                                                        {t(
                                                                                            'users.activity.field',
                                                                                        )}
                                                                                    </th>
                                                                                    <th className="pb-3 pr-4">
                                                                                        {t(
                                                                                            'users.activity.before',
                                                                                        )}
                                                                                    </th>
                                                                                    <th className="pb-3">
                                                                                        {t(
                                                                                            'users.activity.after',
                                                                                        )}
                                                                                    </th>
                                                                                </tr>
                                                                            </thead>

                                                                            <tbody className="divide-y">
                                                                                {fields.map(
                                                                                    (
                                                                                        field,
                                                                                    ) => (
                                                                                        <tr
                                                                                            key={
                                                                                                field
                                                                                            }
                                                                                        >
                                                                                            <td className="py-3 pr-4 font-medium">
                                                                                                {fieldLabel(
                                                                                                    field,
                                                                                                    t,
                                                                                                )}
                                                                                            </td>

                                                                                            <td className="py-3 pr-4 text-muted-foreground">
                                                                                                {formatValue(
                                                                                                    activity
                                                                                                        .old_values?.[
                                                                                                        field
                                                                                                    ],
                                                                                                    t,
                                                                                                )}
                                                                                            </td>

                                                                                            <td className="py-3">
                                                                                                {formatValue(
                                                                                                    activity
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

                    {activities.last_page >
                        1 && (
                        <div className="flex flex-col gap-3 border-t p-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-muted-foreground">
                                {t('users.showing')}{' '}
                                {activities.from ?? 0} -{' '}
                                {activities.to ?? 0}{' '}
                                {t('users.of')}{' '}
                                {activities.total}
                            </p>

                            <div className="flex flex-wrap gap-2">
                                {activities.links.map(
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
                                            className={`rounded-md border px-3 py-1.5 text-sm ${
                                                link.active
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'hover:bg-muted'
                                            } disabled:opacity-40`}
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
