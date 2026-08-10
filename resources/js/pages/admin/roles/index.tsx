import {
    Head,
    Link,
    router,
} from '@inertiajs/react';

import {
    AlertTriangle,
    KeyRound,
    LoaderCircle,
    Plus,
    Shield,
    ShieldCheck,
    Trash2,
    UserRoundCheck,
    Users,
} from 'lucide-react';

import {
    type ReactNode,
    useMemo,
    useState,
} from 'react';

import {
    Alert,
    AlertDescription,
    AlertTitle,
} from '@/components/ui/alert';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Role {
    id: number;
    name: string;
    permissions_count: number;
    users_count: number;
    protected: boolean;
}

interface Props {
    roles: Role[];

    can: {
        create: boolean;
        update: boolean;
        delete: boolean;
    };
}

export default function RolesIndex({
    roles,
    can,
}: Props) {
    const { t } = useTranslation();

    const [
        deleteTarget,
        setDeleteTarget,
    ] = useState<Role | null>(null);

    const [
        deleteProcessing,
        setDeleteProcessing,
    ] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('roles.title'),
            href: '/dashboard/roles',
        },
    ];

    const stats = useMemo(
        () => {
            const users = roles.reduce(
                (
                    total,
                    role,
                ) =>
                    total +
                    role.users_count,
                0,
            );

            const permissions =
                roles.reduce(
                    (
                        total,
                        role,
                    ) =>
                        total +
                        role.permissions_count,
                    0,
                );

            const protectedRoles =
                roles.filter(
                    (role) =>
                        role.protected,
                ).length;

            return {
                roles:
                    roles.length,
                users,
                permissions,
                protectedRoles,
            };
        },
        [
            roles,
        ],
    );

    const openDeleteModal = (
        role: Role,
    ) => {
        if (
            role.protected ||
            deleteProcessing
        ) {
            return;
        }

        setDeleteTarget(
            role,
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
            `/dashboard/roles/${deleteTarget.id}`,
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
                    'roles.title',
                )}
            />

            <div className="flex min-w-0 flex-1 flex-col gap-5 p-3 sm:p-4 lg:gap-6 lg:p-6">
                {/* =========================================================
                    ENCABEZADO
                ========================================================== */}

                <Card className="relative overflow-hidden rounded-2xl">
                    <div className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-primary/10 blur-3xl" />

                    <CardContent className="relative p-5 sm:p-6">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex min-w-0 items-start gap-4">
                                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
                                    <ShieldCheck className="size-5" />
                                </div>

                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                            {t(
                                                'roles.title',
                                            )}
                                        </h1>

                                        <Badge
                                            variant="outline"
                                            className="border-primary/20 bg-primary/10 text-[10px] uppercase tracking-[0.08em] text-primary"
                                        >
                                            Control de acceso
                                        </Badge>
                                    </div>

                                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                                        {t(
                                            'roles.description',
                                        )}
                                    </p>
                                </div>
                            </div>

                            {can.create && (
                                <Button
                                    asChild
                                    className="h-11 w-full rounded-xl px-4 shadow-sm sm:w-auto"
                                >
                                    <Link href="/dashboard/roles/crear">
                                        <Plus className="size-4" />

                                        {t(
                                            'roles.new',
                                        )}
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* =========================================================
                    ESTADÍSTICAS
                ========================================================== */}

                <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        icon={
                            <ShieldCheck className="size-4" />
                        }
                        label="Roles"
                        value={
                            stats.roles
                        }
                    />

                    <StatCard
                        icon={
                            <Users className="size-4" />
                        }
                        label="Usuarios asignados"
                        value={
                            stats.users
                        }
                        tone="success"
                    />

                    <StatCard
                        icon={
                            <KeyRound className="size-4" />
                        }
                        label="Permisos asignados"
                        value={
                            stats.permissions
                        }
                    />

                    <StatCard
                        icon={
                            <Shield className="size-4" />
                        }
                        label="Roles protegidos"
                        value={
                            stats.protectedRoles
                        }
                        tone="warning"
                    />
                </div>

                {/* =========================================================
                    LISTADO DE ROLES
                ========================================================== */}

                <div className="space-y-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-base font-semibold">
                                Roles del sistema
                            </h2>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Administra los niveles de acceso y permisos disponibles.
                            </p>
                        </div>

                        <Badge
                            variant="secondary"
                            className="w-fit rounded-full px-3"
                        >
                            {roles.length}{' '}
                            {roles.length === 1
                                ? 'rol'
                                : 'roles'}
                        </Badge>
                    </div>

                    {roles.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                            {roles.map(
                                (
                                    role,
                                ) => (
                                    <RoleCard
                                        key={
                                            role.id
                                        }
                                        role={
                                            role
                                        }
                                        can={
                                            can
                                        }
                                        t={
                                            t
                                        }
                                        onDelete={
                                            openDeleteModal
                                        }
                                    />
                                ),
                            )}
                        </div>
                    ) : (
                        <EmptyState
                            canCreate={
                                can.create
                            }
                            t={t}
                        />
                    )}
                </div>
            </div>

            {deleteTarget && (
                <DeleteRoleDialog
                    role={
                        deleteTarget
                    }
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
   TARJETA DE ROL
   ========================================================================== */

function RoleCard({
    role,
    can,
    t,
    onDelete,
}: {
    role: Role;
    can: Props['can'];
    t: (key: string) => string;
    onDelete: (
        role: Role,
    ) => void;
}) {
    return (
        <Card className="group relative overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md">
            <div className="pointer-events-none absolute -right-14 -top-14 size-36 rounded-full bg-primary/[0.055] blur-3xl opacity-0 transition-opacity group-hover:opacity-100" />

            <CardHeader className="relative pb-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                        <div
                            className={[
                                'flex size-11 shrink-0 items-center justify-center rounded-xl border transition',
                                role.protected
                                    ? 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                    : 'border-primary/15 bg-primary/10 text-primary',
                            ].join(
                                ' ',
                            )}
                        >
                            {role.protected ? (
                                <Shield className="size-5" />
                            ) : (
                                <ShieldCheck className="size-5" />
                            )}
                        </div>

                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <CardTitle className="truncate text-base capitalize">
                                    {role.name}
                                </CardTitle>

                                {role.protected && (
                                    <Badge
                                        variant="outline"
                                        className="border-amber-500/25 bg-amber-500/10 text-[10px] text-amber-600 dark:text-amber-400"
                                    >
                                        {t(
                                            'roles.protected',
                                        )}
                                    </Badge>
                                )}
                            </div>

                            <CardDescription className="mt-1">
                                ID #{role.id}
                            </CardDescription>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="relative space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <RoleStat
                        icon={
                            <Users className="size-4" />
                        }
                        value={
                            role.users_count
                        }
                        label={t(
                            'roles.users',
                        )}
                    />

                    <RoleStat
                        icon={
                            <KeyRound className="size-4" />
                        }
                        value={
                            role.permissions_count
                        }
                        label={t(
                            'roles.permissions',
                        )}
                    />
                </div>

                {role.protected && (
                    <Alert className="border-amber-500/20 bg-amber-500/[0.045]">
                        <Shield className="size-4 text-amber-600 dark:text-amber-400" />

                        <AlertTitle className="text-xs">
                            Rol protegido
                        </AlertTitle>

                        <AlertDescription className="text-xs">
                            Este rol es esencial para el sistema y no puede eliminarse.
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>

            <CardFooter className="relative gap-2 border-t bg-muted/[0.08] pt-4">
                {can.update && (
                    <Button
                        asChild
                        variant="outline"
                        className="h-10 flex-1 rounded-xl"
                    >
                        <Link
                            href={`/dashboard/roles/${role.id}/editar`}
                        >
                            <ShieldCheck className="size-4" />

                            {t(
                                'roles.manage',
                            )}
                        </Link>
                    </Button>
                )}

                {can.delete &&
                    !role.protected && (
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() =>
                            onDelete(
                                role,
                            )
                        }
                        className="size-10 shrink-0 rounded-xl border-destructive/20 text-destructive hover:bg-destructive/[0.055] hover:text-destructive"
                        title={t(
                            'common.delete',
                        )}
                    >
                        <Trash2 className="size-4" />
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}

/* ==========================================================================
   ESTADÍSTICAS
   ========================================================================== */

function RoleStat({
    icon,
    value,
    label,
}: {
    icon: ReactNode;
    value: number;
    label: string;
}) {
    return (
        <div className="min-w-0 rounded-xl border bg-muted/[0.12] p-3">
            <div className="flex items-center gap-2">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground ring-1 ring-border">
                    {icon}
                </div>

                <span className="text-xl font-bold tracking-tight">
                    {value}
                </span>
            </div>

            <p className="mt-2 truncate text-[11px] font-medium text-muted-foreground">
                {label}
            </p>
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

/* ==========================================================================
   MODAL DE ELIMINACIÓN
   ========================================================================== */

function DeleteRoleDialog({
    role,
    processing,
    onCancel,
    onConfirm,
}: {
    role: Role;
    processing: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}) {
    return (
        <Dialog
            open
            onOpenChange={(
                open,
            ) => {
                if (
                    !open &&
                    !processing
                ) {
                    onCancel();
                }
            }}
        >
            <DialogContent
                className="overflow-hidden rounded-2xl p-0 sm:max-w-md"
                onInteractOutside={(
                    event,
                ) => {
                    if (
                        processing
                    ) {
                        event.preventDefault();
                    }
                }}
                onEscapeKeyDown={(
                    event,
                ) => {
                    if (
                        processing
                    ) {
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
                                    ¿Eliminar rol?
                                </DialogTitle>

                                <DialogDescription className="mt-2 leading-6">
                                    Estás a punto de eliminar el rol{' '}
                                    <span className="font-semibold text-foreground">
                                        {role.name}
                                    </span>
                                    . Esta acción no se puede deshacer.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="mt-5 rounded-xl border border-destructive/15 bg-destructive/[0.035] p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-background text-destructive">
                                <ShieldCheck className="size-4" />
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold capitalize">
                                    {role.name}
                                </p>

                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    {role.users_count}{' '}
                                    {role.users_count === 1
                                        ? 'usuario'
                                        : 'usuarios'}
                                    {' · '}
                                    {role.permissions_count}{' '}
                                    {role.permissions_count === 1
                                        ? 'permiso'
                                        : 'permisos'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {role.users_count >
                        0 && (
                        <Alert
                            variant="destructive"
                            className="mt-4"
                        >
                            <Users className="size-4" />

                            <AlertTitle>
                                Este rol tiene usuarios asignados
                            </AlertTitle>

                            <AlertDescription>
                                Revisa las asignaciones antes de eliminarlo para evitar cambios de acceso inesperados.
                            </AlertDescription>
                        </Alert>
                    )}
                </div>

                <DialogFooter className="border-t bg-muted/[0.12] p-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={
                            onCancel
                        }
                        disabled={
                            processing
                        }
                        className="rounded-xl"
                    >
                        Cancelar
                    </Button>

                    <Button
                        type="button"
                        variant="destructive"
                        onClick={
                            onConfirm
                        }
                        disabled={
                            processing
                        }
                        className="rounded-xl"
                    >
                        {processing ? (
                            <LoaderCircle className="size-4 animate-spin" />
                        ) : (
                            <Trash2 className="size-4" />
                        )}

                        {processing
                            ? 'Eliminando...'
                            : 'Sí, eliminar rol'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

/* ==========================================================================
   EMPTY STATE
   ========================================================================== */

function EmptyState({
    canCreate,
    t,
}: {
    canCreate: boolean;
    t: (key: string) => string;
}) {
    return (
        <Card className="rounded-2xl border-dashed">
            <CardContent className="flex flex-col items-center justify-center px-5 py-14 text-center">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <ShieldCheck className="size-6" />
                </div>

                <h3 className="mt-4 text-base font-semibold">
                    No hay roles creados
                </h3>

                <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
                    Crea el primer rol para comenzar a organizar permisos y niveles de acceso.
                </p>

                {canCreate && (
                    <Button
                        asChild
                        className="mt-5 rounded-xl"
                    >
                        <Link href="/dashboard/roles/crear">
                            <Plus className="size-4" />

                            {t(
                                'roles.new',
                            )}
                        </Link>
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
