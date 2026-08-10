import { Head, Link, router } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    ArrowUpDown,
    CalendarDays,
    ChevronDown,
    Clock3,
    Filter,
    History,
    LoaderCircle,
    RotateCcw,
    Search,
    Shield,
    SlidersHorizontal,
    Trash2,
    UserCheck,
    UserPlus,
    UsersRound,
    Wifi,
    X,
} from 'lucide-react';
import {
    type FormEvent,
    type ReactNode,
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    Alert,
    AlertDescription,
    AlertTitle,
} from '@/components/ui/alert';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

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

interface UserFilters {
    search: string;
    status: string;
    presence: string;
    role: string;
    date_from: string;
    date_to: string;
    sort: string;
}

interface Props {
    users: UsersPagination;

    filters: UserFilters;

    filterOptions: {
        roles: string[];
    };

    stats: {
        total: number;
        active: number;
        online: number;
        suspended: number;
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

const ALL_FILTERS = '__all__';

export default function UsersIndex({
    users,
    filters,
    filterOptions,
    stats,
    can,
}: Props) {
    const { t } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('users.title'),
            href: '/dashboard/usuarios',
        },
    ];

    const [search, setSearch] =
        useState(filters.search ?? '');

    const [status, setStatus] =
        useState(filters.status ?? '');

    const [presence, setPresence] =
        useState(filters.presence ?? '');

    const [role, setRole] =
        useState(filters.role ?? '');

    const [dateFrom, setDateFrom] =
        useState(filters.date_from ?? '');

    const [dateTo, setDateTo] =
        useState(filters.date_to ?? '');

    const [sort, setSort] =
        useState(
            filters.sort ?? 'newest',
        );

    const [showFilters, setShowFilters] =
        useState(false);

    const [
        deleteTarget,
        setDeleteTarget,
    ] = useState<UserItem | null>(null);

    const [
        deleteProcessing,
        setDeleteProcessing,
    ] = useState(false);

    const activeFiltersCount =
        useMemo(() => {
            return [
                search,
                status,
                presence,
                role,
                dateFrom,
                dateTo,
                sort !== 'newest'
                    ? sort
                    : '',
            ].filter(Boolean).length;
        }, [
            search,
            status,
            presence,
            role,
            dateFrom,
            dateTo,
            sort,
        ]);

    const hasActiveFilters =
        activeFiltersCount > 0;

    const activeRate =
        stats.total > 0
            ? Math.round(
                  (stats.active /
                      stats.total) *
                      100,
              )
            : 0;

    const onlineRate =
        stats.total > 0
            ? Math.round(
                  (stats.online /
                      stats.total) *
                      100,
              )
            : 0;

    const suspendedRate =
        stats.total > 0
            ? Math.round(
                  (stats.suspended /
                      stats.total) *
                      100,
              )
            : 0;

    const activeFilterChips =
        useMemo(() => {
            const chips: {
                key: string;
                label: string;
            }[] = [];

            if (filters.search) {
                chips.push({
                    key: 'search',
                    label: `Búsqueda: ${filters.search}`,
                });
            }

            if (filters.status) {
                chips.push({
                    key: 'status',
                    label: `Estado: ${statusLabelText(
                        filters.status,
                        t,
                    )}`,
                });
            }

            if (filters.presence) {
                chips.push({
                    key: 'presence',
                    label: `Presencia: ${presenceLabelText(
                        filters.presence,
                        t,
                    )}`,
                });
            }

            if (filters.role) {
                chips.push({
                    key: 'role',
                    label: `Rol: ${filters.role}`,
                });
            }

            if (filters.date_from) {
                chips.push({
                    key: 'date_from',
                    label: `Desde: ${filters.date_from}`,
                });
            }

            if (filters.date_to) {
                chips.push({
                    key: 'date_to',
                    label: `Hasta: ${filters.date_to}`,
                });
            }

            if (
                filters.sort &&
                filters.sort !== 'newest'
            ) {
                chips.push({
                    key: 'sort',
                    label: `Orden: ${sortLabel(
                        filters.sort,
                    )}`,
                });
            }

            return chips;
        }, [
            filters,
            t,
        ]);

    /*
    |--------------------------------------------------------------------------
    | Actualización automática de presencia
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        const refreshUsers = () => {
            if (
                document.visibilityState !==
                'visible'
            ) {
                return;
            }

            router.reload({
                only: [
                    'users',
                    'stats',
                ],
            });
        };

        const interval =
            window.setInterval(
                refreshUsers,
                30_000,
            );

        const handleVisibilityChange =
            () => {
                if (
                    document.visibilityState ===
                    'visible'
                ) {
                    refreshUsers();
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

    const currentPayload = (
        overrides: Partial<UserFilters> = {},
    ) => {
        const values = {
            search,
            status,
            presence,
            role,
            date_from:
                dateFrom,
            date_to:
                dateTo,
            sort,
            ...overrides,
        };

        return Object.fromEntries(
            Object.entries(values).filter(
                ([key, value]) =>
                    value !== '' &&
                    !(
                        key === 'sort' &&
                        value === 'newest'
                    ),
            ),
        );
    };

    const applyFilters = (
        event:
            FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        router.get(
            '/dashboard/usuarios',
            currentPayload(),
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const clearFilters = () => {
        setSearch('');
        setStatus('');
        setPresence('');
        setRole('');
        setDateFrom('');
        setDateTo('');
        setSort('newest');

        router.get(
            '/dashboard/usuarios',
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const removeFilter = (
        key: string,
    ) => {
        const next: Partial<UserFilters> = {};

        switch (key) {
            case 'search':
                setSearch('');
                next.search = '';
                break;

            case 'status':
                setStatus('');
                next.status = '';
                break;

            case 'presence':
                setPresence('');
                next.presence = '';
                break;

            case 'role':
                setRole('');
                next.role = '';
                break;

            case 'date_from':
                setDateFrom('');
                next.date_from = '';
                break;

            case 'date_to':
                setDateTo('');
                next.date_to = '';
                break;

            case 'sort':
                setSort(
                    'newest',
                );
                next.sort =
                    'newest';
                break;
        }

        router.get(
            '/dashboard/usuarios',
            currentPayload(
                next,
            ),
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const removeUser = (
        user: UserItem,
    ) => {
        setDeleteTarget(
            user,
        );
    };

    const cancelDelete = () => {
        if (deleteProcessing) {
            return;
        }

        setDeleteTarget(
            null,
        );
    };

    const confirmDelete = () => {
        if (
            !deleteTarget ||
            deleteProcessing
        ) {
            return;
        }

        setDeleteProcessing(
            true,
        );

        router.delete(
            `/dashboard/usuarios/${deleteTarget.id}`,
            {
                preserveScroll: true,

                onSuccess: () => {
                    setDeleteTarget(
                        null,
                    );
                },

                onFinish: () => {
                    setDeleteProcessing(
                        false,
                    );
                },
            },
        );
    };

    return (
        <AppLayout
            breadcrumbs={
                breadcrumbs
            }
        >
            <Head
                title={t(
                    'users.title',
                )}
            />

            <div className="flex h-full w-full min-w-0 max-w-full flex-1 flex-col gap-4 overflow-x-hidden p-3 sm:gap-5 sm:p-4 lg:gap-6 lg:p-5 xl:p-6">
                {/* =========================================================
                    ENCABEZADO
                ========================================================== */}

                <Card className="relative overflow-hidden rounded-3xl border-primary/10 shadow-sm">
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.075] via-transparent to-transparent" />
                    <div className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-primary/10 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-24 left-1/3 size-56 rounded-full bg-primary/[0.045] blur-3xl" />

                    <CardContent className="relative p-5 sm:p-6 lg:p-7">
                        <div className="flex min-w-0 flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                            <div className="flex min-w-0 items-start gap-4">
                                <div className="relative flex size-13 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-sm">
                                    <UsersRound className="size-5" />

                                    <span className="absolute -bottom-1 -right-1 size-3 rounded-full border-2 border-card bg-emerald-500" />
                                </div>

                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2.5">
                                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                            {t(
                                                'users.title',
                                            )}
                                        </h1>

                                        <Badge
                                            variant="outline"
                                            className="border-primary/20 bg-primary/10 text-[10px] uppercase tracking-[0.08em] text-primary"
                                        >
                                            Administración
                                        </Badge>
                                    </div>

                                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                                        {t(
                                            'users.description',
                                        )}
                                    </p>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <Badge
                                            variant="secondary"
                                            className="gap-1.5 rounded-full px-3"
                                        >
                                            <UsersRound className="size-3" />
                                            {stats.total}{' '}
                                            usuarios
                                        </Badge>

                                        <Badge
                                            variant="outline"
                                            className="gap-1.5 rounded-full"
                                        >
                                            <Wifi className="size-3 text-emerald-500" />
                                            {stats.online}{' '}
                                            en línea
                                        </Badge>

                                        <Badge
                                            variant="outline"
                                            className="gap-1.5 rounded-full"
                                        >
                                            <Clock3 className="size-3" />
                                            Presencia automática
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                                {can.viewAudit && (
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="h-11 rounded-xl"
                                    >
                                        <Link href="/dashboard/auditoria">
                                            <History className="size-4" />
                                            Auditoría
                                        </Link>
                                    </Button>
                                )}

                                {can.create && (
                                    <Button
                                        asChild
                                        className="h-11 rounded-xl px-5 shadow-sm"
                                    >
                                        <Link href="/dashboard/usuarios/crear">
                                            <UserPlus className="size-4" />
                                            {t(
                                                'users.new',
                                            )}
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* =========================================================
                    RESUMEN
                ========================================================== */}

                <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 2xl:grid-cols-4">
                    <StatCard
                        icon={
                            <UsersRound className="size-4" />
                        }
                        label="Usuarios totales"
                        value={
                            stats.total
                        }
                        description="Cuentas registradas"
                    />

                    <StatCard
                        icon={
                            <UserCheck className="size-4" />
                        }
                        label="Activos"
                        value={
                            stats.active
                        }
                        description={`${activeRate}% del total`}
                        tone="success"
                    />

                    <StatCard
                        icon={
                            <Wifi className="size-4" />
                        }
                        label="En línea"
                        value={
                            stats.online
                        }
                        description={`${onlineRate}% conectados`}
                        tone="success"
                    />

                    <StatCard
                        icon={
                            <Shield className="size-4" />
                        }
                        label="Suspendidos"
                        value={
                            stats.suspended
                        }
                        description={`${suspendedRate}% del total`}
                        tone="danger"
                    />
                </div>

                {/* =========================================================
                    BÚSQUEDA + FILTROS
                ========================================================== */}

                <form
                    onSubmit={
                        applyFilters
                    }
                    className="overflow-hidden rounded-2xl border border-primary/10 bg-card shadow-sm ring-1 ring-black/[0.01] dark:ring-white/[0.02]"
                >
                    <div className="flex items-center justify-between gap-3 border-b bg-muted/[0.06] px-4 py-3 sm:px-5">
                        <div>
                            <p className="text-sm font-semibold">
                                Buscar usuarios
                            </p>

                            <p className="mt-0.5 text-xs text-muted-foreground">
                                Busca por nombre, usuario, correo o teléfono.
                            </p>
                        </div>

                        {hasActiveFilters && (
                            <Badge
                                variant="secondary"
                                className="shrink-0 rounded-full"
                            >
                                {activeFiltersCount}{' '}
                                filtros
                            </Badge>
                        )}
                    </div>

                    <div className="flex min-w-0 flex-col gap-3 p-4 sm:p-5 xl:flex-row xl:items-center xl:gap-2">
                        <div className="relative min-w-0 flex-1">
                            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                            <Input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder={t('users.search_placeholder')}
                                className="h-11 rounded-xl pl-10 pr-4"
                            />
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                                setShowFilters((current) => !current)
                            }
                            className={[
                                'h-11 rounded-xl',
                                showFilters || hasActiveFilters
                                    ? 'border-primary/30 bg-primary/[0.055] text-primary hover:bg-primary/[0.08]'
                                    : '',
                            ].join(' ')}
                        >
                            <SlidersHorizontal className="size-4" />
                            Filtros

                            {activeFiltersCount > 0 && (
                                <Badge className="h-5 min-w-5 justify-center rounded-full px-1.5 text-[10px]">
                                    {activeFiltersCount}
                                </Badge>
                            )}

                            <ChevronDown
                                className={[
                                    'size-3.5 transition-transform',
                                    showFilters ? 'rotate-180' : '',
                                ].join(' ')}
                            />
                        </Button>

                        <Button
                            type="submit"
                            className="h-11 rounded-xl px-5"
                        >
                            <Search className="size-4" />
                            {t('common.search')}
                        </Button>
                    </div>

                    {showFilters && (
                        <div className="border-t bg-muted/[0.12] p-4 sm:p-5">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Filter className="size-4 text-primary" />

                                        <h2 className="text-sm font-semibold">
                                            Filtros avanzados
                                        </h2>
                                    </div>

                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Combina varios filtros para encontrar usuarios específicos.
                                    </p>
                                </div>

                                {hasActiveFilters && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearFilters}
                                        className="h-8 px-2 text-xs text-muted-foreground"
                                    >
                                        <RotateCcw className="size-3.5" />
                                        Limpiar
                                    </Button>
                                )}
                            </div>

                            <div className="grid min-w-0 gap-4 md:grid-cols-2 2xl:grid-cols-3">
                                <FilterField
                                    label="Estado"
                                    icon={<Shield className="size-3.5" />}
                                >
                                    <Select
                                        value={status || ALL_FILTERS}
                                        onValueChange={(value) =>
                                            setStatus(
                                                value === ALL_FILTERS
                                                    ? ''
                                                    : value,
                                            )
                                        }
                                    >
                                        <SelectTrigger className="h-10 w-full rounded-xl">
                                            <SelectValue placeholder="Todos los estados" />
                                        </SelectTrigger>

                                        <SelectContent>
                                            <SelectItem value={ALL_FILTERS}>
                                                Todos los estados
                                            </SelectItem>

                                            <SelectItem value="active">
                                                {t('users.status.active')}
                                            </SelectItem>

                                            <SelectItem value="pending">
                                                {t('users.status.pending')}
                                            </SelectItem>

                                            <SelectItem value="suspended">
                                                {t('users.status.suspended')}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FilterField>

                                <FilterField
                                    label="Presencia"
                                    icon={<Activity className="size-3.5" />}
                                >
                                    <Select
                                        value={presence || ALL_FILTERS}
                                        onValueChange={(value) =>
                                            setPresence(
                                                value === ALL_FILTERS
                                                    ? ''
                                                    : value,
                                            )
                                        }
                                    >
                                        <SelectTrigger className="h-10 w-full rounded-xl">
                                            <SelectValue placeholder="Cualquier presencia" />
                                        </SelectTrigger>

                                        <SelectContent>
                                            <SelectItem value={ALL_FILTERS}>
                                                Cualquier presencia
                                            </SelectItem>

                                            <SelectItem value="online">
                                                {t('users.presence.online')}
                                            </SelectItem>

                                            <SelectItem value="away">
                                                {t('users.presence.away')}
                                            </SelectItem>

                                            <SelectItem value="offline">
                                                {t('users.presence.offline')}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FilterField>

                                <FilterField
                                    label="Rol"
                                    icon={<Shield className="size-3.5" />}
                                >
                                    <Select
                                        value={role || ALL_FILTERS}
                                        onValueChange={(value) =>
                                            setRole(
                                                value === ALL_FILTERS
                                                    ? ''
                                                    : value,
                                            )
                                        }
                                    >
                                        <SelectTrigger className="h-10 w-full rounded-xl">
                                            <SelectValue placeholder="Todos los roles" />
                                        </SelectTrigger>

                                        <SelectContent>
                                            <SelectItem value={ALL_FILTERS}>
                                                Todos los roles
                                            </SelectItem>

                                            {filterOptions.roles.map((roleName) => (
                                                <SelectItem
                                                    key={roleName}
                                                    value={roleName}
                                                >
                                                    {roleName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FilterField>

                                <FilterField
                                    label="Creado desde"
                                    icon={
                                        <CalendarDays className="size-3.5" />
                                    }
                                >
                                    <Input
                                        type="date"
                                        value={dateFrom}
                                        onChange={(event) =>
                                            setDateFrom(event.target.value)
                                        }
                                        className="h-10 rounded-xl"
                                    />
                                </FilterField>

                                <FilterField
                                    label="Creado hasta"
                                    icon={
                                        <CalendarDays className="size-3.5" />
                                    }
                                >
                                    <Input
                                        type="date"
                                        value={dateTo}
                                        onChange={(event) =>
                                            setDateTo(event.target.value)
                                        }
                                        className="h-10 rounded-xl"
                                    />
                                </FilterField>

                                <FilterField
                                    label="Ordenar"
                                    icon={<ArrowUpDown className="size-3.5" />}
                                >
                                    <Select
                                        value={sort}
                                        onValueChange={setSort}
                                    >
                                        <SelectTrigger className="h-10 w-full rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>

                                        <SelectContent>
                                            <SelectItem value="newest">
                                                Más recientes primero
                                            </SelectItem>
                                            <SelectItem value="oldest">
                                                Más antiguos primero
                                            </SelectItem>
                                            <SelectItem value="name_asc">
                                                Nombre A → Z
                                            </SelectItem>
                                            <SelectItem value="name_desc">
                                                Nombre Z → A
                                            </SelectItem>
                                            <SelectItem value="last_activity">
                                                Actividad reciente
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FilterField>
                            </div>

                            <div className="mt-4 flex flex-col gap-2 border-t pt-4 sm:flex-row sm:justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={clearFilters}
                                    className="h-10 rounded-xl"
                                >
                                    <RotateCcw className="size-4" />
                                    Restablecer
                                </Button>

                                <Button
                                    type="submit"
                                    className="h-10 rounded-xl px-5"
                                >
                                    <Filter className="size-4" />
                                    Aplicar filtros
                                </Button>
                            </div>
                        </div>
                    )}
                </form>

                {/* Filtros activos */}
                {activeFilterChips.length >
                    0 && (
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">
                            Filtros activos:
                        </span>

                        {activeFilterChips.map(
                            (chip) => (
                                <Button
                                    key={chip.key}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeFilter(chip.key)}
                                    className="h-8 max-w-full rounded-full px-2.5 text-xs"
                                >
                                    <span className="min-w-0 truncate">
                                        {chip.label}
                                    </span>

                                    <X className="size-3 shrink-0" />
                                </Button>
                            ),
                        )}

                        <Button
                            type="button"
                            variant="link"
                            size="sm"
                            onClick={clearFilters}
                            className="h-8 px-1 text-xs"
                        >
                            Limpiar todos
                        </Button>
                    </div>
                )}

                {/* =========================================================
                    LISTADO
                ========================================================== */}

                <div className="w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-primary/10 bg-card shadow-sm">
                    <div className="flex min-w-0 flex-col gap-3 border-b bg-gradient-to-r from-muted/[0.18] to-transparent px-4 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-5">
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="font-semibold">
                                    {t(
                                        'users.all',
                                    )}
                                </h2>

                                <Badge
                                    variant="secondary"
                                    className="rounded-full text-[10px] text-primary"
                                >
                                    {users.total}
                                </Badge>
                            </div>

                            <p className="mt-1 text-sm text-muted-foreground">
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

                        <div className="flex w-fit items-center gap-2 rounded-xl border border-primary/10 bg-background px-3 py-2 text-xs text-muted-foreground shadow-sm">
                            <Clock3 className="size-3.5 text-primary" />

                            {filters.sort ===
                            'oldest'
                                ? 'Antiguos primero'
                                : filters.sort ===
                                    'name_asc'
                                  ? 'Nombre A → Z'
                                  : filters.sort ===
                                      'name_desc'
                                    ? 'Nombre Z → A'
                                    : filters.sort ===
                                        'last_activity'
                                      ? 'Actividad reciente'
                                      : 'Nuevos primero'}
                        </div>
                    </div>

                    {/* MÓVIL */}
                    <div className="divide-y divide-border/70 lg:hidden">
                        {users.data.map(
                            (user) => (
                                <UserMobileCard
                                    key={
                                        user.id
                                    }
                                    user={
                                        user
                                    }
                                    can={
                                        can
                                    }
                                    t={t}
                                    onDelete={
                                        removeUser
                                    }
                                />
                            ),
                        )}

                        {users.data.length ===
                            0 && (
                            <EmptyState
                                t={t}
                                filtered={
                                    activeFilterChips.length >
                                    0
                                }
                                onClear={
                                    clearFilters
                                }
                            />
                        )}
                    </div>

                    {/* DESKTOP / LAPTOP */}
                    <div className="hidden min-w-0 lg:block">
                        <Table className="min-w-[920px] table-fixed">
                            <TableHeader className="sticky top-0 z-10 bg-muted/55 backdrop-blur-sm">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-[25%] px-3 text-[10px] font-semibold uppercase tracking-[0.07em] text-muted-foreground 2xl:px-4">
                                        {t(
                                            'users.column.user',
                                        )}
                                    </TableHead>

                                    <TableHead className="w-[18%] px-3 text-[10px] font-semibold uppercase tracking-[0.07em] text-muted-foreground 2xl:px-4">
                                        {t(
                                            'users.column.roles',
                                        )}
                                    </TableHead>

                                    <TableHead className="w-[10%] px-3 text-[10px] font-semibold uppercase tracking-[0.07em] text-muted-foreground 2xl:px-4">
                                        {t(
                                            'users.column.status',
                                        )}
                                    </TableHead>

                                    <TableHead className="w-[12%] px-3 text-[10px] font-semibold uppercase tracking-[0.07em] text-muted-foreground 2xl:px-4">
                                        {t(
                                            'users.column.presence',
                                        )}
                                    </TableHead>

                                    <TableHead className="w-[17%] px-3 text-[10px] font-semibold uppercase tracking-[0.07em] text-muted-foreground 2xl:px-4">
                                        {t(
                                            'users.column.activity',
                                        )}
                                    </TableHead>

                                    <TableHead className="hidden w-[10%] px-3 text-[10px] font-semibold uppercase tracking-[0.07em] text-muted-foreground xl:table-cell 2xl:px-4">
                                        Creado
                                    </TableHead>

                                    <TableHead className="w-[18%] px-3 text-right text-[10px] font-semibold uppercase tracking-[0.07em] text-muted-foreground 2xl:px-4">
                                        {t(
                                            'common.actions',
                                        )}
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {users.data.map(
                                    (user) => (
                                        <TableRow
                                            key={
                                                user.id
                                            }
                                            className="group transition-colors hover:bg-primary/[0.03] data-[state=selected]:bg-primary/[0.05]"
                                        >
                                            <TableCell className="w-[25%] whitespace-normal px-3 py-4.5 2xl:px-4">
                                                <UserIdentity
                                                    user={
                                                        user
                                                    }
                                                />
                                            </TableCell>

                                            <TableCell className="w-[18%] max-w-[190px] whitespace-normal px-3 py-4 2xl:px-4">
                                                <RoleBadges
                                                    roles={
                                                        user.roles
                                                    }
                                                    noRoleLabel={t(
                                                        'users.no_role',
                                                    )}
                                                />
                                            </TableCell>

                                            <TableCell className="w-[10%] px-3 py-4 2xl:px-4">
                                                <StatusBadge
                                                    status={
                                                        user.status
                                                    }
                                                    label={statusLabelText(
                                                        user.status,
                                                        t,
                                                    )}
                                                />
                                            </TableCell>

                                            <TableCell className="w-[12%] px-3 py-4 2xl:px-4">
                                                <PresenceBadge
                                                    user={
                                                        user
                                                    }
                                                    label={presenceLabelText(
                                                        user.presence,
                                                        t,
                                                    )}
                                                    noActivityLabel={t(
                                                        'users.no_activity',
                                                    )}
                                                    lastActivityLabel={t(
                                                        'users.last_activity',
                                                    )}
                                                />
                                            </TableCell>

                                            <TableCell className="w-[17%] whitespace-normal px-3 py-4 2xl:px-4">
                                                <ActivitySummary
                                                    user={
                                                        user
                                                    }
                                                    t={
                                                        t
                                                    }
                                                />
                                            </TableCell>

                                            <TableCell className="hidden px-3 py-4 xl:table-cell 2xl:px-4">
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted">
                                                        <CalendarDays className="size-3.5" />
                                                    </div>

                                                    <span className="whitespace-nowrap">
                                                        {user.created_at ??
                                                            '—'}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            <TableCell className="w-[18%] px-3 py-4 2xl:px-4">
                                                <UserActions
                                                    user={
                                                        user
                                                    }
                                                    can={
                                                        can
                                                    }
                                                    t={
                                                        t
                                                    }
                                                    onDelete={
                                                        removeUser
                                                    }
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ),
                                )}

                                {users.data.length ===
                                    0 && (
                                    <TableRow className="hover:bg-transparent">
                                        <TableCell
                                            colSpan={
                                                7
                                            }
                                            className="h-auto whitespace-normal p-0"
                                        >
                                            <EmptyState
                                                t={
                                                    t
                                                }
                                                filtered={
                                                    activeFilterChips.length >
                                                    0
                                                }
                                                onClear={
                                                    clearFilters
                                                }
                                            />
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* PAGINACIÓN */}
                    {users.last_page >
                        1 && (
                        <div className="flex min-w-0 flex-col gap-3 border-t bg-muted/[0.08] p-4 lg:flex-row lg:items-center lg:justify-between">
                            <p className="text-sm text-muted-foreground">
                                {t(
                                    'users.showing',
                                )}{' '}
                                {users.from ??
                                    0}{' '}
                                –{' '}
                                {users.to ??
                                    0}{' '}
                                {t(
                                    'users.of',
                                )}{' '}
                                {users.total}
                            </p>

                            <div className="flex flex-wrap gap-2">
                                {users.links.map(
                                    (
                                        link,
                                        index,
                                    ) => (
                                        <Button
                                            key={index}
                                            type="button"
                                            size="sm"
                                            variant={
                                                link.active
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            disabled={!link.url}
                                            onClick={() => {
                                                if (link.url) {
                                                    router.get(
                                                        link.url,
                                                        {},
                                                        {
                                                            preserveState: true,
                                                            preserveScroll: true,
                                                        },
                                                    );
                                                }
                                            }}
                                            className="min-w-9 rounded-xl"
                                        >
                                            {paginationLabel(link.label, t)}
                                        </Button>
                                    ),
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {deleteTarget && (
                <DeleteUserModal
                    user={deleteTarget}
                    processing={
                        deleteProcessing
                    }
                    onCancel={
                        cancelDelete
                    }
                    onConfirm={
                        confirmDelete
                    }
                />
            )}
        </AppLayout>
    );
}

/* ==========================================================================
   COMPONENTES
   ========================================================================== */

function DeleteUserModal({
    user,
    processing,
    onCancel,
    onConfirm,
}: {
    user: UserItem;
    processing: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}) {
    const initials = user.name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('');

    return (
        <Dialog
            open
            onOpenChange={(open) => {
                if (!open && !processing) {
                    onCancel();
                }
            }}
        >
            <DialogContent
                className="overflow-hidden rounded-3xl p-0 sm:max-w-md"
                onInteractOutside={(event) => {
                    if (processing) {
                        event.preventDefault();
                    }
                }}
                onEscapeKeyDown={(event) => {
                    if (processing) {
                        event.preventDefault();
                    }
                }}
            >
                <div className="p-5 sm:p-6">
                    <DialogHeader className="text-left">
                        <div className="flex items-start gap-4">
                            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-1 ring-destructive/15">
                                <AlertTriangle className="size-5" />
                            </div>

                            <div className="min-w-0 flex-1">
                                <Badge
                                    variant="destructive"
                                    className="mb-2 text-[10px] uppercase tracking-[0.1em]"
                                >
                                    Advertencia
                                </Badge>

                                <DialogTitle className="text-lg">
                                    ¿Eliminar usuario?
                                </DialogTitle>

                                <DialogDescription className="mt-2 leading-6">
                                    Esta acción eliminará permanentemente la
                                    cuenta seleccionada. No podrás recuperarla
                                    después.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="mt-5 rounded-xl border border-destructive/15 bg-destructive/[0.035] p-4">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-background text-xs font-bold text-destructive">
                                {initials}
                            </div>

                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold">
                                    {user.name}
                                </p>

                                <p className="truncate text-xs text-muted-foreground">
                                    {user.email}
                                </p>

                                {user.username && (
                                    <p className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground">
                                        @{user.username}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <Alert
                        variant="destructive"
                        className="mt-4"
                    >
                        <Shield className="size-4" />

                        <AlertTitle>
                            Protección de seguridad
                        </AlertTitle>

                        <AlertDescription>
                            El servidor seguirá impidiendo que elimines tu
                            propia cuenta o al último administrador del sistema.
                        </AlertDescription>
                    </Alert>
                </div>

                <DialogFooter className="border-t bg-muted/[0.12] p-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={processing}
                        className="rounded-xl"
                    >
                        Cancelar
                    </Button>

                    <Button
                        type="button"
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={processing}
                        className="rounded-xl"
                    >
                        {processing ? (
                            <LoaderCircle className="size-4 animate-spin" />
                        ) : (
                            <Trash2 className="size-4" />
                        )}

                        {processing
                            ? 'Eliminando...'
                            : 'Sí, eliminar usuario'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function StatCard({
    icon,
    label,
    value,
    description,
    tone = 'default',
}: {
    icon: ReactNode;
    label: string;
    value: number;
    description?: string;
    tone?:
        | 'default'
        | 'success'
        | 'danger';
}) {
    const iconClass =
        tone === 'success'
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            : tone === 'danger'
              ? 'bg-destructive/10 text-destructive'
              : 'bg-primary/10 text-primary';

    const glowClass =
        tone === 'success'
            ? 'bg-emerald-500/10'
            : tone === 'danger'
              ? 'bg-destructive/10'
              : 'bg-primary/10';

    return (
        <Card className="group relative overflow-hidden rounded-2xl border-primary/10 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div
                className={`pointer-events-none absolute -right-8 -top-10 size-28 rounded-full blur-3xl transition-opacity ${glowClass} opacity-40 group-hover:opacity-70`}
            />

            <CardContent className="relative p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-[10px] font-medium uppercase leading-4 tracking-[0.07em] text-muted-foreground sm:text-[11px]">
                            {label}
                        </p>

                        <p className="mt-2 text-2xl font-bold tracking-tight">
                            {value}
                        </p>

                        {description && (
                            <p className="mt-1 text-[11px] text-muted-foreground">
                                {description}
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

function FilterField({
    label,
    icon,
    children,
}: {
    label: string;
    icon: ReactNode;
    children: ReactNode;
}) {
    return (
        <div className="min-w-0 space-y-2">
            <Label className="flex items-center gap-2 text-xs font-semibold">
                <span className="text-muted-foreground">
                    {icon}
                </span>

                {label}
            </Label>

            {children}
        </div>
    );
}

function UserMobileCard({
    user,
    can,
    t,
    onDelete,
}: {
    user: UserItem;
    can: Props['can'];
    t: (key: string) => string;
    onDelete: (
        user: UserItem,
    ) => void;
}) {
    return (
        <article className="min-w-0 p-4 transition-colors hover:bg-muted/[0.08] sm:p-5">
            <div className="flex items-start justify-between gap-3">
                <UserIdentity
                    user={
                        user
                    }
                />

                <StatusBadge
                    status={
                        user.status
                    }
                    label={statusLabelText(
                        user.status,
                        t,
                    )}
                />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                <PresenceBadge
                    user={
                        user
                    }
                    label={presenceLabelText(
                        user.presence,
                        t,
                    )}
                    noActivityLabel={t(
                        'users.no_activity',
                    )}
                    lastActivityLabel={t(
                        'users.last_activity',
                    )}
                />

                <Badge
                    variant="outline"
                    className="gap-1.5 rounded-full text-[10px]"
                >
                    <CalendarDays className="size-3" />

                    {user.created_at ??
                        '—'}
                </Badge>
            </div>

            <div className="mt-4 rounded-xl border border-primary/10 bg-muted/[0.08] p-3.5">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    {t(
                        'users.column.roles',
                    )}
                </p>

                <RoleBadges
                    roles={
                        user.roles
                    }
                    noRoleLabel={t(
                        'users.no_role',
                    )}
                />
            </div>

            <div className="mt-3 rounded-xl border border-primary/10 bg-muted/[0.08] p-3.5">
                <ActivitySummary
                    user={
                        user
                    }
                    t={
                        t
                    }
                    mobile
                />
            </div>

            <div className="mt-4">
                <UserActions
                    user={
                        user
                    }
                    can={
                        can
                    }
                    t={
                        t
                    }
                    onDelete={
                        onDelete
                    }
                    mobile
                />
            </div>
        </article>
    );
}

function UserIdentity({
    user,
}: {
    user: UserItem;
}) {
    const initials =
        user.name
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((part) =>
                part[0]?.toUpperCase(),
            )
            .join('');

    return (
        <div className="flex min-w-0 items-start gap-3">
            <div className="relative flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/[0.07] text-xs font-bold text-primary shadow-sm ring-1 ring-primary/10">
                {initials}

                <span
                    className={[
                        'absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-card',
                        user.presence ===
                        'online'
                            ? 'bg-emerald-500'
                            : user.presence ===
                                'away'
                              ? 'bg-amber-500'
                              : 'bg-zinc-400 dark:bg-zinc-600',
                    ].join(
                        ' ',
                    )}
                />
            </div>

            <div className="min-w-0">
                <p
                    className="truncate text-sm font-semibold"
                    title={
                        user.name
                    }
                >
                    {user.name}
                </p>

                <p
                    className="mt-0.5 truncate text-xs text-muted-foreground"
                    title={
                        user.email
                    }
                >
                    {user.email}
                </p>

                {user.username && (
                    <p className="mt-1 truncate font-mono text-[10px] text-muted-foreground">
                        @{user.username}
                    </p>
                )}
            </div>
        </div>
    );
}

function RoleBadges({
    roles,
    noRoleLabel,
}: {
    roles: string[];
    noRoleLabel: string;
}) {
    if (!roles.length) {
        return (
            <span className="text-xs text-muted-foreground">
                {noRoleLabel}
            </span>
        );
    }

    return (
        <div className="flex flex-wrap gap-1.5">
            {roles.map((role) => (
                <Badge
                    key={role}
                    variant="outline"
                    className="max-w-full gap-1.5 bg-background text-[10px] font-medium"
                >
                    <Shield className="size-3 shrink-0 text-primary" />

                    <span className="truncate capitalize">
                        {role}
                    </span>
                </Badge>
            ))}
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
    const classes: Record<string, string> = {
        active:
            'border-transparent bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        suspended:
            'border-transparent bg-destructive/10 text-destructive',
        pending:
            'border-transparent bg-amber-500/10 text-amber-600 dark:text-amber-400',
    };

    return (
        <Badge
            variant="outline"
            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                classes[status] ??
                'border-transparent bg-muted text-muted-foreground'
            }`}
        >
            {label}
        </Badge>
    );
}

function PresenceBadge({
    user,
    label,
    noActivityLabel,
    lastActivityLabel,
}: {
    user: UserItem;
    label: string;
    noActivityLabel: string;
    lastActivityLabel: string;
}) {
    const badgeClasses = {
        online:
            'border-transparent bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
        away:
            'border-transparent bg-amber-500/10 text-amber-700 dark:text-amber-400',
        offline:
            'border-transparent bg-muted text-muted-foreground',
    };

    const dotClasses = {
        online: 'bg-emerald-500',
        away: 'bg-amber-500',
        offline: 'bg-zinc-400 dark:bg-zinc-600',
    };

    return (
        <Badge
            variant="outline"
            className={`gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${badgeClasses[user.presence]}`}
            title={
                user.last_seen_at
                    ? `${lastActivityLabel}: ${user.last_seen_at}`
                    : noActivityLabel
            }
        >
            <span
                className={`size-2 rounded-full ${dotClasses[user.presence]}`}
            />

            {label}
        </Badge>
    );
}

function ActivitySummary({
    user,
    t,
    mobile = false,
}: {
    user: UserItem;
    t: (key: string) => string;
    mobile?: boolean;
}) {
    return (
        <div
            className={
                mobile
                    ? 'grid gap-3 sm:grid-cols-2'
                    : 'min-w-[165px] space-y-2'
            }
        >
            <div className="flex min-w-0 items-start gap-2">
                <Activity className="mt-0.5 size-3.5 shrink-0 text-primary" />

                <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground">
                        {t(
                            'users.last_activity',
                        )}
                    </p>

                    <p className="truncate text-xs font-medium">
                        {user.last_seen_at_human ??
                            t(
                                'users.never',
                            )}
                    </p>
                </div>
            </div>

            <div className="flex min-w-0 items-start gap-2">
                <Clock3 className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />

                <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground">
                        {t(
                            'users.last_login',
                        )}
                    </p>

                    <p className="truncate text-xs text-muted-foreground">
                        {user.last_login_at_human ??
                            t(
                                'users.never',
                            )}
                    </p>
                </div>
            </div>
        </div>
    );
}

function UserActions({
    user,
    can,
    t,
    onDelete,
    mobile = false,
}: {
    user: UserItem;
    can: Props['can'];
    t: (key: string) => string;
    onDelete: (user: UserItem) => void;
    mobile?: boolean;
}) {
    if (
        !can.viewAudit &&
        !can.update &&
        !can.delete
    ) {
        return null;
    }

    return (
        <div
            className={
                mobile
                    ? 'grid grid-cols-1 gap-2 min-[420px]:grid-cols-2'
                    : 'flex justify-end gap-1.5'
            }
        >
            {can.viewAudit && (
                <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-xl"
                >
                    <Link
                        href={`/dashboard/usuarios/${user.id}/actividad`}
                        title={t('users.view_activity')}
                    >
                        <History className="size-3.5" />

                        <span
                            className={
                                mobile
                                    ? ''
                                    : 'hidden xl:inline'
                            }
                        >
                            {t('users.activity')}
                        </span>
                    </Link>
                </Button>
            )}

            {can.update && (
                <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-xl hover:border-primary/30 hover:bg-primary/[0.035]"
                >
                    <Link href={`/dashboard/usuarios/${user.id}/editar`}>
                        {t('users.manage')}
                    </Link>
                </Button>
            )}

            {can.delete && (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(user)}
                    className={[
                        'h-9 rounded-xl border-destructive/20 text-destructive hover:bg-destructive/[0.055] hover:text-destructive',
                        mobile
                            ? 'min-[420px]:col-span-2'
                            : '',
                    ].join(' ')}
                    title={t('users.delete_title')}
                >
                    <Trash2 className="size-3.5" />

                    {mobile && (
                        <span>
                            {t('users.delete_title')}
                        </span>
                    )}
                </Button>
            )}
        </div>
    );
}

function EmptyState({
    t,
    filtered,
    onClear,
}: {
    t: (key: string) => string;
    filtered: boolean;
    onClear: () => void;
}) {
    return (
        <div className="px-5 py-14 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <Search className="size-5" />
            </div>

            <p className="mt-4 text-sm font-semibold">
                {t(
                    'users.empty',
                )}
            </p>

            {filtered && (
                <>
                    <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
                        No hay usuarios que coincidan con los filtros seleccionados.
                    </p>

                    <Button
                        type="button"
                        variant="link"
                        size="sm"
                        onClick={onClear}
                        className="mt-2"
                    >
                        <RotateCcw className="size-3.5" />
                        Limpiar filtros
                    </Button>
                </>
            )}
        </div>
    );
}

/* ==========================================================================
   HELPERS
   ========================================================================== */

function statusLabelText(
    status: string,
    t: (key: string) => string,
): string {
    switch (status) {
        case 'active':
            return t(
                'users.status.active',
            );

        case 'suspended':
            return t(
                'users.status.suspended',
            );

        case 'pending':
            return t(
                'users.status.pending',
            );

        default:
            return status;
    }
}

function presenceLabelText(
    presence:
        UserItem['presence'] |
        string,
    t: (key: string) => string,
): string {
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

function sortLabel(
    sort: string,
): string {
    switch (sort) {
        case 'oldest':
            return 'Antiguos primero';

        case 'name_asc':
            return 'Nombre A → Z';

        case 'name_desc':
            return 'Nombre Z → A';

        case 'last_activity':
            return 'Actividad reciente';

        default:
            return 'Recientes primero';
    }
}

function paginationLabel(
    label: string,
    t: (key: string) => string,
): string {
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
}
