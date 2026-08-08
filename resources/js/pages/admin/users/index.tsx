import { Head, Link, router } from '@inertiajs/react';
import {
    Activity,
    Clock3,
    History,
    Search,
    Shield,
    Trash2,
    UserPlus,
} from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface UserItem {
    id: number;
    name: string;
    username: string | null;
    email: string;
    phone: string | null;
    status: string;
    roles: string[];
    presence: 'online' | 'away' | 'offline';
    last_login_at: string | null;
    last_login_at_human: string | null;
    last_seen_at: string | null;
    last_seen_at_human: string | null;
    created_at: string | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface UsersPagination {
    data: UserItem[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    links: PaginationLink[];
}

interface Props {
    users: UsersPagination;

    filters: {
        search: string;
    };

    can: {
        create: boolean;
        update: boolean;
        delete: boolean;
        updateRoles: boolean;
        updateStatus: boolean;
        viewAudit: boolean;
    };
}

function statusClass(status: string) {
    switch (status) {
        case 'active':
            return 'bg-green-500/10 text-green-600 dark:text-green-400';
        case 'suspended':
            return 'bg-red-500/10 text-red-600 dark:text-red-400';
        case 'pending':
            return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
        default:
            return 'bg-muted text-muted-foreground';
    }
}

function presenceDotClass(
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

function presenceBadgeClass(
    presence: UserItem['presence'],
) {
    switch (presence) {
        case 'online':
            return 'bg-green-500/10 text-green-700 dark:text-green-400';
        case 'away':
            return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
        case 'offline':
        default:
            return 'bg-muted text-muted-foreground';
    }
}

export default function UsersIndex({
    users,
    filters,
    can,
}: Props) {
    const { t } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('users.title'),
            href: '/dashboard/usuarios',
        },
    ];

    const [search, setSearch] = useState(
        filters.search ?? '',
    );

    const statusLabel = (
        status: string,
    ): string => {
        switch (status) {
            case 'active':
                return t('users.status.active');
            case 'suspended':
                return t('users.status.suspended');
            case 'pending':
                return t('users.status.pending');
            default:
                return status;
        }
    };

    const presenceLabel = (
        presence: UserItem['presence'],
    ): string => {
        switch (presence) {
            case 'online':
                return t('users.presence.online');
            case 'away':
                return t('users.presence.away');
            case 'offline':
            default:
                return t('users.presence.offline');
        }
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
            return `« ${t('pagination.previous')}`;
        }

        if (
            normalized.includes('next') ||
            normalized.includes('siguiente')
        ) {
            return `${t('pagination.next')} »`;
        }

        return label;
    };

    /*
    |--------------------------------------------------------------------------
    | Actualización automática de presencia
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        const refreshUsers = () => {
            if (document.visibilityState !== 'visible') {
                return;
            }

            router.reload({
                only: ['users'],
            });
        };

        const interval = window.setInterval(
            refreshUsers,
            30_000,
        );

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                refreshUsers();
            }
        };

        document.addEventListener(
            'visibilitychange',
            handleVisibilityChange,
        );

        return () => {
            window.clearInterval(interval);

            document.removeEventListener(
                'visibilitychange',
                handleVisibilityChange,
            );
        };
    }, []);

    const submitSearch = (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        router.get(
            '/dashboard/usuarios',
            {
                search,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const removeUser = (user: UserItem) => {
        if (
            !window.confirm(
                `${t('users.delete_confirm')} ${user.name}?`,
            )
        ) {
            return;
        }

        router.delete(
            `/dashboard/usuarios/${user.id}`,
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('users.title')} />

            <div className="flex h-full w-full min-w-0 max-w-full flex-1 flex-col gap-5 overflow-x-hidden p-3 min-[480px]:p-4 min-[720px]:gap-6 min-[720px]:p-5 min-[1024px]:p-6">
                <div className="flex min-w-0 flex-col gap-4 min-[720px]:flex-row min-[720px]:items-center min-[720px]:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            {t('users.title')}
                        </h1>

                        <p className="mt-1 text-sm text-muted-foreground">
                            {t('users.description')}
                        </p>
                    </div>

                    {can.create && (
                        <Link
                            href="/dashboard/usuarios/crear"
                            className="inline-flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground min-[480px]:w-auto"
                        >
                            <UserPlus className="size-4" />
                            {t('users.new')}
                        </Link>
                    )}
                </div>

                <form
                    onSubmit={submitSearch}
                    className="flex w-full min-w-0 max-w-xl flex-col gap-2 min-[480px]:flex-row"
                >
                    <div className="relative min-w-0 flex-1">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                        <input
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value,
                                )
                            }
                            placeholder={t(
                                'users.search_placeholder',
                            )}
                            className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <button
                        type="submit"
                        className="h-10 w-full shrink-0 rounded-md border px-4 text-sm font-medium hover:bg-muted min-[480px]:w-auto"
                    >
                        {t('common.search')}
                    </button>
                </form>

                <div className="w-full min-w-0 max-w-full overflow-hidden rounded-xl border bg-card shadow-sm">
                    <div className="flex min-w-0 items-center justify-between border-b px-4 py-4 min-[720px]:px-5">
                        <div>
                            <h2 className="font-semibold">
                                {t('users.all')}
                            </h2>

                            <p className="text-sm text-muted-foreground">
                                {users.total}{' '}
                                {users.total === 1
                                    ? t(
                                          'users.registered_singular',
                                      )
                                    : t(
                                          'users.registered_plural',
                                      )}
                            </p>
                        </div>
                    </div>

                    {/* =========================================================
                        MENOS DE 720px
                        Tarjetas adaptables para móvil.
                    ========================================================== */}
                    <div className="divide-y min-[720px]:hidden">
                        {users.data.map((user) => (
                            <article
                                key={user.id}
                                className="min-w-0 p-4"
                            >
                                {/* Identidad */}
                                <div className="flex min-w-0 items-start gap-3">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full border bg-muted/40 text-xs font-semibold">
                                        {user.name
                                            .split(' ')
                                            .filter(Boolean)
                                            .slice(0, 2)
                                            .map(
                                                (part) =>
                                                    part[0]?.toUpperCase(),
                                            )
                                            .join('')}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p
                                            className="truncate font-semibold"
                                            title={user.name}
                                        >
                                            {user.name}
                                        </p>

                                        <p
                                            className="break-all text-sm text-muted-foreground"
                                            title={user.email}
                                        >
                                            {user.email}
                                        </p>

                                        {user.username && (
                                            <p className="mt-0.5 break-all text-xs text-muted-foreground">
                                                @{user.username}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Estado y presencia */}
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <span
                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
                                            user.status,
                                        )}`}
                                    >
                                        {statusLabel(user.status)}
                                    </span>

                                    <span
                                        className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium ${presenceBadgeClass(
                                            user.presence,
                                        )}`}
                                        title={
                                            user.last_seen_at
                                                ? `${t(
                                                      'users.last_activity',
                                                  )}: ${user.last_seen_at}`
                                                : t(
                                                      'users.no_activity',
                                                  )
                                        }
                                    >
                                        <span
                                            className={`size-2 shrink-0 rounded-full ${presenceDotClass(
                                                user.presence,
                                            )}`}
                                        />

                                        {presenceLabel(
                                            user.presence,
                                        )}
                                    </span>
                                </div>

                                {/* Roles */}
                                <div className="mt-4">
                                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                        {t('users.column.roles')}
                                    </p>

                                    <div className="flex min-w-0 flex-wrap gap-1.5">
                                        {user.roles.length > 0 ? (
                                            user.roles.map((role) => (
                                                <span
                                                    key={role}
                                                    className="inline-flex max-w-full items-center gap-1 rounded-full border px-2 py-1 text-xs"
                                                >
                                                    <Shield className="size-3 shrink-0" />

                                                    <span className="truncate">
                                                        {role}
                                                    </span>
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-sm text-muted-foreground">
                                                {t('users.no_role')}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Actividad */}
                                <div className="mt-4 grid min-w-0 gap-3 rounded-lg border bg-muted/20 p-3 min-[480px]:grid-cols-2">
                                    <div
                                        className="flex min-w-0 items-start gap-2"
                                        title={
                                            user.last_seen_at ??
                                            undefined
                                        }
                                    >
                                        <Activity className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                                        <div className="min-w-0">
                                            <p className="text-xs text-muted-foreground">
                                                {t(
                                                    'users.last_activity',
                                                )}
                                            </p>

                                            <p className="break-words text-sm font-medium">
                                                {user.last_seen_at_human ??
                                                    t(
                                                        'users.never',
                                                    )}
                                            </p>
                                        </div>
                                    </div>

                                    <div
                                        className="flex min-w-0 items-start gap-2"
                                        title={
                                            user.last_login_at ??
                                            undefined
                                        }
                                    >
                                        <Clock3 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                                        <div className="min-w-0">
                                            <p className="text-xs text-muted-foreground">
                                                {t(
                                                    'users.last_login',
                                                )}
                                            </p>

                                            <p className="break-words text-sm text-muted-foreground">
                                                {user.last_login_at_human ??
                                                    t(
                                                        'users.never',
                                                    )}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Acciones */}
                                {(can.viewAudit ||
                                    can.update ||
                                    can.delete) && (
                                    <div className="mt-4 grid min-w-0 grid-cols-1 gap-2 min-[480px]:grid-cols-2">
                                        {can.viewAudit && (
                                            <Link
                                                href={`/dashboard/usuarios/${user.id}/actividad`}
                                                className="inline-flex h-10 min-w-0 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium hover:bg-muted"
                                                title={t(
                                                    'users.view_activity',
                                                )}
                                            >
                                                <History className="size-4 shrink-0" />

                                                <span className="truncate">
                                                    {t(
                                                        'users.activity',
                                                    )}
                                                </span>
                                            </Link>
                                        )}

                                        {can.update && (
                                            <Link
                                                href={`/dashboard/usuarios/${user.id}/editar`}
                                                className="inline-flex h-10 min-w-0 items-center justify-center rounded-md border px-3 text-sm font-medium hover:bg-muted"
                                            >
                                                <span className="truncate">
                                                    {t(
                                                        'users.manage',
                                                    )}
                                                </span>
                                            </Link>
                                        )}

                                        {can.delete && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeUser(
                                                        user,
                                                    )
                                                }
                                                className="inline-flex h-10 min-w-0 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium text-red-500 hover:bg-red-500/10 min-[480px]:col-span-2"
                                                title={t(
                                                    'users.delete_title',
                                                )}
                                            >
                                                <Trash2 className="size-4 shrink-0" />

                                                <span className="truncate">
                                                    {t(
                                                        'users.delete_title',
                                                    )}
                                                </span>
                                            </button>
                                        )}
                                    </div>
                                )}
                            </article>
                        ))}

                        {users.data.length === 0 && (
                            <div className="px-5 py-12 text-center text-sm text-muted-foreground">
                                {t('users.empty')}
                            </div>
                        )}
                    </div>

                    {/* =========================================================
                        720px EN ADELANTE
                        Tabla compacta y adaptable.
                    ========================================================== */}
                    <div className="hidden w-full max-w-full overflow-x-auto min-[720px]:block">
                        <table className="w-full table-fixed">
                            <thead className="border-b bg-muted/40">
                                <tr className="text-left text-[11px] font-medium uppercase text-muted-foreground min-[900px]:text-xs">
                                    <th className="w-[24%] px-3 py-3 min-[900px]:px-4">
                                        {t(
                                            'users.column.user',
                                        )}
                                    </th>

                                    <th className="w-[12%] px-3 py-3 min-[900px]:px-4">
                                        {t(
                                            'users.column.roles',
                                        )}
                                    </th>

                                    <th className="w-[10%] px-3 py-3 min-[900px]:px-4">
                                        {t(
                                            'users.column.status',
                                        )}
                                    </th>

                                    <th className="w-[12%] px-3 py-3 min-[900px]:px-4">
                                        {t(
                                            'users.column.presence',
                                        )}
                                    </th>

                                    <th className="w-[19%] px-3 py-3 min-[900px]:px-4">
                                        {t(
                                            'users.column.activity',
                                        )}
                                    </th>

                                    <th className="w-[23%] px-3 py-3 text-right min-[900px]:px-4">
                                        {t(
                                            'common.actions',
                                        )}
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y">
                                {users.data.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="hover:bg-muted/30"
                                    >
                                        <td className="min-w-0 px-3 py-4 min-[900px]:px-4">
                                            <div className="flex min-w-0 items-start gap-2 min-[900px]:gap-3">
                                                <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full border bg-muted/40 text-[10px] font-semibold min-[900px]:size-9 min-[900px]:text-xs">
                                                    {user.name
                                                        .split(' ')
                                                        .filter(Boolean)
                                                        .slice(0, 2)
                                                        .map(
                                                            (
                                                                part,
                                                            ) =>
                                                                part[0]?.toUpperCase(),
                                                        )
                                                        .join('')}
                                                </div>

                                                <div className="min-w-0">
                                                    <div
                                                        className="truncate text-sm font-medium"
                                                        title={
                                                            user.name
                                                        }
                                                    >
                                                        {user.name}
                                                    </div>

                                                    <div
                                                        className="truncate text-xs text-muted-foreground min-[900px]:text-sm"
                                                        title={
                                                            user.email
                                                        }
                                                    >
                                                        {user.email}
                                                    </div>

                                                    {user.username && (
                                                        <div className="truncate text-[10px] text-muted-foreground min-[900px]:text-xs">
                                                            @{user.username}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="min-w-0 px-3 py-4 min-[900px]:px-4">
                                            <div className="flex flex-wrap gap-1">
                                                {user.roles.length >
                                                0 ? (
                                                    user.roles.map(
                                                        (role) => (
                                                            <span
                                                                key={
                                                                    role
                                                                }
                                                                className="inline-flex max-w-full items-center gap-1 rounded-full border px-1.5 py-1 text-[10px] min-[900px]:px-2 min-[900px]:text-xs"
                                                            >
                                                                <Shield className="size-3 shrink-0" />

                                                                <span className="truncate">
                                                                    {
                                                                        role
                                                                    }
                                                                </span>
                                                            </span>
                                                        ),
                                                    )
                                                ) : (
                                                    <span className="text-xs text-muted-foreground min-[900px]:text-sm">
                                                        {t(
                                                            'users.no_role',
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        <td className="min-w-0 px-3 py-4 min-[900px]:px-4">
                                            <span
                                                className={`inline-flex max-w-full truncate rounded-full px-2 py-1 text-[10px] font-medium min-[900px]:px-2.5 min-[900px]:text-xs ${statusClass(
                                                    user.status,
                                                )}`}
                                            >
                                                {statusLabel(
                                                    user.status,
                                                )}
                                            </span>
                                        </td>

                                        <td className="min-w-0 px-3 py-4 min-[900px]:px-4">
                                            <div
                                                className={`inline-flex max-w-full items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-medium min-[900px]:gap-2 min-[900px]:px-2.5 min-[900px]:text-xs ${presenceBadgeClass(
                                                    user.presence,
                                                )}`}
                                                title={
                                                    user.last_seen_at
                                                        ? `${t(
                                                              'users.last_activity',
                                                          )}: ${user.last_seen_at}`
                                                        : t(
                                                              'users.no_activity',
                                                          )
                                                }
                                            >
                                                <span
                                                    className={`size-2 shrink-0 rounded-full ${presenceDotClass(
                                                        user.presence,
                                                    )}`}
                                                />

                                                <span className="truncate">
                                                    {presenceLabel(
                                                        user.presence,
                                                    )}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="min-w-0 px-3 py-4 min-[900px]:px-4">
                                            <div className="min-w-0 space-y-2 text-xs min-[900px]:text-sm">
                                                <div
                                                    className="flex min-w-0 items-start gap-1.5 min-[900px]:gap-2"
                                                    title={
                                                        user.last_seen_at ??
                                                        undefined
                                                    }
                                                >
                                                    <Activity className="mt-0.5 size-3.5 shrink-0 text-muted-foreground min-[900px]:size-4" />

                                                    <div className="min-w-0">
                                                        <p className="truncate text-[10px] text-muted-foreground min-[900px]:text-xs">
                                                            {t(
                                                                'users.last_activity',
                                                            )}
                                                        </p>

                                                        <p className="break-words font-medium">
                                                            {user.last_seen_at_human ??
                                                                t(
                                                                    'users.never',
                                                                )}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div
                                                    className="flex min-w-0 items-start gap-1.5 min-[900px]:gap-2"
                                                    title={
                                                        user.last_login_at ??
                                                        undefined
                                                    }
                                                >
                                                    <Clock3 className="mt-0.5 size-3.5 shrink-0 text-muted-foreground min-[900px]:size-4" />

                                                    <div className="min-w-0">
                                                        <p className="truncate text-[10px] text-muted-foreground min-[900px]:text-xs">
                                                            {t(
                                                                'users.last_login',
                                                            )}
                                                        </p>

                                                        <p className="break-words text-muted-foreground">
                                                            {user.last_login_at_human ??
                                                                t(
                                                                    'users.never',
                                                                )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="min-w-0 px-3 py-4 min-[900px]:px-4">
                                            <div className="flex flex-wrap justify-end gap-1.5 min-[900px]:gap-2">
                                                {can.viewAudit && (
                                                    <Link
                                                        href={`/dashboard/usuarios/${user.id}/actividad`}
                                                        className="inline-flex size-8 shrink-0 items-center justify-center rounded-md border hover:bg-muted min-[900px]:h-auto min-[900px]:w-auto min-[900px]:gap-1.5 min-[900px]:px-2.5 min-[900px]:py-2 min-[900px]:text-xs min-[1100px]:px-3"
                                                        title={t(
                                                            'users.view_activity',
                                                        )}
                                                    >
                                                        <History className="size-3.5 shrink-0" />

                                                        <span className="hidden min-[900px]:inline">
                                                            {t(
                                                                'users.activity',
                                                            )}
                                                        </span>
                                                    </Link>
                                                )}

                                                {can.update && (
                                                    <Link
                                                        href={`/dashboard/usuarios/${user.id}/editar`}
                                                        className="inline-flex h-8 shrink-0 items-center justify-center rounded-md border px-2 text-[10px] font-medium hover:bg-muted min-[900px]:h-auto min-[900px]:px-2.5 min-[900px]:py-2 min-[900px]:text-xs min-[1100px]:px-3"
                                                    >
                                                        <span className="max-w-[70px] truncate min-[1100px]:max-w-none">
                                                            {t(
                                                                'users.manage',
                                                            )}
                                                        </span>
                                                    </Link>
                                                )}

                                                {can.delete && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeUser(
                                                                user,
                                                            )
                                                        }
                                                        className="inline-flex size-8 shrink-0 items-center justify-center rounded-md border text-red-500 hover:bg-red-500/10 min-[900px]:size-9"
                                                        title={t(
                                                            'users.delete_title',
                                                        )}
                                                    >
                                                        <Trash2 className="size-3.5 min-[900px]:size-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {users.data.length ===
                                    0 && (
                                    <tr>
                                        <td
                                            colSpan={
                                                6
                                            }
                                            className="px-5 py-12 text-center text-sm text-muted-foreground"
                                        >
                                            {t(
                                                'users.empty',
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {users.last_page > 1 && (
                        <div className="flex min-w-0 flex-col gap-3 border-t p-4 min-[720px]:flex-row min-[720px]:items-center min-[720px]:justify-between">
                            <p className="text-sm text-muted-foreground">
                                {t('users.showing')}{' '}
                                {users.from ?? 0} -{' '}
                                {users.to ?? 0}{' '}
                                {t('users.of')}{' '}
                                {users.total}
                            </p>

                            <div className="flex flex-wrap gap-2">
                                {users.links.map(
                                    (link, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            disabled={!link.url}
                                            onClick={() => {
                                                if (link.url) {
                                                    router.get(
                                                        link.url,
                                                        {},
                                                        {
                                                            preserveState:
                                                                true,
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
                </div>
            </div>
        </AppLayout>
    );
}
