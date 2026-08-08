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

const eventLabels: Record<string, string> = {
    login: 'Inicio de sesión',
    logout: 'Cierre de sesión',
    create: 'Creación',
    update: 'Edición',
    delete: 'Eliminación',
    role_change: 'Cambio de roles',
    status_change: 'Cambio de estado',
    permission_change: 'Cambio de permisos',
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
    email: 'Correo',
    phone: 'Teléfono',
    status: 'Estado',
    roles: 'Roles',
    permissions: 'Permisos',
};

function eventLabel(event: string) {
    return eventLabels[event] ?? event;
}

function moduleLabel(
    module: string | null,
) {
    if (!module) {
        return 'Sistema';
    }

    return moduleLabels[module] ?? module;
}

function fieldLabel(field: string) {
    return fieldLabels[field] ?? field;
}

function formatValue(
    value: unknown,
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
            : 'Ninguno';
    }

    if (typeof value === 'boolean') {
        return value ? 'Sí' : 'No';
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

function statusLabel(status: string) {
    switch (status) {
        case 'active':
            return 'Activo';

        case 'pending':
            return 'Pendiente';

        case 'suspended':
            return 'Suspendido';

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
) {
    switch (presence) {
        case 'online':
            return 'En línea';

        case 'away':
            return 'Ausente';

        case 'offline':
        default:
            return 'Desconectado';
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
) {
    switch (relation) {
        case 'performed':
            return 'Realizada por el usuario';

        case 'affected':
            return 'Sobre el usuario';

        case 'self':
            return 'Actividad propia';
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
    const [
        expanded,
        setExpanded,
    ] = useState<number[]>([]);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Usuarios',
            href: '/dashboard/usuarios',
        },
        {
            title: user.name,
            href: `/dashboard/usuarios/${user.id}/editar`,
        },
        {
            title: 'Actividad',
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

    return (
        <AppLayout
            breadcrumbs={breadcrumbs}
        >
            <Head
                title={`Actividad - ${user.name}`}
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
                                    )}
                                </span>
                            </div>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Historial de actividad y
                                seguridad del usuario.
                            </p>
                        </div>
                    </div>

                    {can.updateUser && (
                        <Link
                            href={`/dashboard/usuarios/${user.id}/editar`}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border px-4 text-sm font-medium hover:bg-muted"
                        >
                            <Pencil className="size-4" />
                            Administrar usuario
                        </Link>
                    )}
                </div>

                {/* Resumen */}

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-xl border bg-card p-5 shadow-sm">
                        <p className="text-sm text-muted-foreground">
                            Presencia
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
                                )}
                            </span>
                        </div>

                        <p className="mt-2 text-xs text-muted-foreground">
                            {user.last_seen_at_human ??
                                'Sin actividad registrada'}
                        </p>
                    </div>

                    <div className="rounded-xl border bg-card p-5 shadow-sm">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock3 className="size-4" />
                            Último inicio
                        </div>

                        <p className="mt-3 font-semibold">
                            {user.last_login_at_human ??
                                'Nunca'}
                        </p>

                        <p className="mt-2 text-xs text-muted-foreground">
                            {user.last_login_at ?? '—'}
                        </p>
                    </div>

                    <div className="rounded-xl border bg-card p-5 shadow-sm">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <History className="size-4" />
                            Actividades
                        </div>

                        <p className="mt-3 text-2xl font-bold">
                            {activities.total}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                            Registros relacionados
                        </p>
                    </div>

                    <div className="rounded-xl border bg-card p-5 shadow-sm">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Shield className="size-4" />
                            Roles
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
                                    Sin rol
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
                                Correo
                            </p>

                            <p className="mt-1 text-sm font-medium">
                                {user.email}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-muted-foreground">
                                Usuario
                            </p>

                            <p className="mt-1 text-sm font-medium">
                                {user.username
                                    ? `@${user.username}`
                                    : '—'}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-muted-foreground">
                                Última actividad
                            </p>

                            <p className="mt-1 text-sm font-medium">
                                {user.last_seen_at ??
                                    'Nunca'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Historial */}

                <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <div className="border-b p-5">
                        <h2 className="font-semibold">
                            Historial de actividad
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Acciones realizadas por el
                            usuario y acciones realizadas
                            sobre su cuenta.
                        </p>
                    </div>

                    {activities.data.length ===
                    0 ? (
                        <div className="flex min-h-56 flex-col items-center justify-center p-8 text-center">
                            <History className="mb-3 size-10 text-muted-foreground" />

                            <h3 className="font-semibold">
                                Sin actividad
                            </h3>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Todavía no existen
                                registros relacionados con
                                este usuario.
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
                                                                    )}
                                                                </span>

                                                                <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                                                                    {relationLabel(
                                                                        activity.relation,
                                                                    )}
                                                                </span>
                                                            </div>

                                                            <p className="mt-1 text-sm">
                                                                {activity.description ??
                                                                    eventLabel(
                                                                        activity.event,
                                                                    )}
                                                            </p>

                                                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                                                <span>
                                                                    {moduleLabel(
                                                                        activity.module,
                                                                    )}
                                                                </span>

                                                                {activity.actor && (
                                                                    <span>
                                                                        Por:{' '}
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
                                                                                    )}
                                                                                </span>

                                                                                <span className="break-words text-muted-foreground">
                                                                                    {formatValue(
                                                                                        activity
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
                                                                                        activity
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

                                                    {isOpen && (
                                                        <div className="mt-4 grid gap-4 lg:grid-cols-2">
                                                            <div className="rounded-lg border p-4">
                                                                <h4 className="font-semibold">
                                                                    Actividad
                                                                </h4>

                                                                <dl className="mt-4 space-y-3 text-sm">
                                                                    <div>
                                                                        <dt className="text-muted-foreground">
                                                                            Actor
                                                                        </dt>
                                                                        <dd>
                                                                            {activity
                                                                                .actor
                                                                                ?.name ??
                                                                                'Sistema'}
                                                                        </dd>
                                                                    </div>

                                                                    <div>
                                                                        <dt className="text-muted-foreground">
                                                                            Relación
                                                                        </dt>
                                                                        <dd>
                                                                            {relationLabel(
                                                                                activity.relation,
                                                                            )}
                                                                        </dd>
                                                                    </div>

                                                                    <div>
                                                                        <dt className="text-muted-foreground">
                                                                            Módulo
                                                                        </dt>
                                                                        <dd>
                                                                            {moduleLabel(
                                                                                activity.module,
                                                                            )}
                                                                        </dd>
                                                                    </div>

                                                                    {activity.subject_id && (
                                                                        <div>
                                                                            <dt className="text-muted-foreground">
                                                                                Registro
                                                                                afectado
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
                                                                    Información
                                                                    técnica
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
                                                                                Método
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
                                                                                Ruta
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
                                                                        Todos
                                                                        los
                                                                        cambios
                                                                    </h4>

                                                                    <div className="mt-4 overflow-x-auto">
                                                                        <table className="w-full text-sm">
                                                                            <thead>
                                                                                <tr className="border-b text-left">
                                                                                    <th className="pb-3 pr-4">
                                                                                        Campo
                                                                                    </th>
                                                                                    <th className="pb-3 pr-4">
                                                                                        Antes
                                                                                    </th>
                                                                                    <th className="pb-3">
                                                                                        Después
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
                                                                                                )}
                                                                                            </td>

                                                                                            <td className="py-3 pr-4 text-muted-foreground">
                                                                                                {formatValue(
                                                                                                    activity
                                                                                                        .old_values?.[
                                                                                                        field
                                                                                                    ],
                                                                                                )}
                                                                                            </td>

                                                                                            <td className="py-3">
                                                                                                {formatValue(
                                                                                                    activity
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

                    {activities.last_page >
                        1 && (
                        <div className="flex flex-col gap-3 border-t p-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-muted-foreground">
                                Mostrando{' '}
                                {activities.from ?? 0} -{' '}
                                {activities.to ?? 0} de{' '}
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
                                            dangerouslySetInnerHTML={{
                                                __html:
                                                    link.label,
                                            }}
                                            className={`rounded-md border px-3 py-1.5 text-sm ${
                                                link.active
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'hover:bg-muted'
                                            } disabled:opacity-40`}
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
