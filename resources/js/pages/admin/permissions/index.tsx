import {
    Head,
    router,
} from '@inertiajs/react';

import {
    AlertTriangle,
    Boxes,
    CheckCircle2,
    KeyRound,
    LoaderCircle,
    RefreshCw,
    Shield,
    ShieldCheck,
    Sparkles,
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

import { Separator } from '@/components/ui/separator';

import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

/*
|--------------------------------------------------------------------------
| Tipos
|--------------------------------------------------------------------------
*/

interface Permission {
    id: number;
    name: string;
}

interface PermissionModule {
    module: string;
    count: number;
    permissions: Permission[];
}

interface Props {
    modules: PermissionModule[];

    can: {
        update: boolean;
        sync: boolean;
    };
}

/*
|--------------------------------------------------------------------------
| Página
|--------------------------------------------------------------------------
*/

export default function PermissionsIndex({
    modules,
    can,
}: Props) {
    const { t } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t(
                'permissions.title',
            ),
            href: '/dashboard/permisos',
        },
    ];

    /*
    |--------------------------------------------------------------------------
    | Estado de sincronización
    |--------------------------------------------------------------------------
    */

    const [
        syncing,
        setSyncing,
    ] = useState(false);

    const [
        syncDialogOpen,
        setSyncDialogOpen,
    ] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | Etiquetas
    |--------------------------------------------------------------------------
    */

    const moduleLabel = (
        module: string,
    ): string => {
        switch (module) {
            case 'authentication':
                return t(
                    'modules.authentication',
                );

            case 'users':
                return t(
                    'modules.users',
                );

            case 'roles':
                return t(
                    'modules.roles',
                );

            case 'permissions':
                return t(
                    'modules.permissions',
                );

            case 'audit_logs':
                return t(
                    'modules.audit_logs',
                );

            case 'settings':
                return t(
                    'modules.settings',
                );

            case 'websites':
                return t(
                    'modules.websites',
                );

            case 'domains':
                return t(
                    'modules.domains',
                );

            case 'databases':
                return t(
                    'modules.databases',
                );

            case 'server':
                return t(
                    'modules.server',
                );

            default:
                return module;
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Estadísticas
    |--------------------------------------------------------------------------
    */

    const totalPermissions =
        useMemo(
            () =>
                modules.reduce(
                    (
                        total,
                        module,
                    ) =>
                        total +
                        module.count,
                    0,
                ),
            [
                modules,
            ],
        );

    const largestModule =
        useMemo(
            () => {
                if (
                    modules.length ===
                    0
                ) {
                    return null;
                }

                return [
                    ...modules,
                ].sort(
                    (
                        first,
                        second,
                    ) =>
                        second.count -
                        first.count,
                )[0];
            },
            [
                modules,
            ],
        );

    /*
    |--------------------------------------------------------------------------
    | Sincronizar permisos
    |--------------------------------------------------------------------------
    */

    const openSyncDialog = () => {
        if (
            syncing ||
            !can.sync
        ) {
            return;
        }

        setSyncDialogOpen(
            true,
        );
    };

    const closeSyncDialog = () => {
        if (syncing) {
            return;
        }

        setSyncDialogOpen(
            false,
        );
    };

    const syncPermissions = () => {
        if (
            syncing ||
            !can.sync
        ) {
            return;
        }

        router.post(
            '/dashboard/permisos/sincronizar',
            {},
            {
                preserveScroll:
                    true,

                onStart: () => {
                    setSyncing(
                        true,
                    );
                },

                onSuccess: () => {
                    setSyncDialogOpen(
                        false,
                    );
                },

                onFinish: () => {
                    setSyncing(
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
                    'permissions.title',
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
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex min-w-0 items-start gap-4">
                                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
                                    <KeyRound className="size-5" />
                                </div>

                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                            {t(
                                                'permissions.title',
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
                                            'permissions.description',
                                        )}
                                    </p>

                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <Badge
                                            variant="outline"
                                            className="gap-1.5"
                                        >
                                            <Boxes className="size-3" />

                                            {
                                                modules.length
                                            }{' '}
                                            {modules.length ===
                                            1
                                                ? t(
                                                      'permissions.module_singular',
                                                  )
                                                : t(
                                                      'permissions.module_plural',
                                                  )}
                                        </Badge>

                                        <Badge
                                            variant="outline"
                                            className="gap-1.5"
                                        >
                                            <KeyRound className="size-3" />

                                            {
                                                totalPermissions
                                            }{' '}
                                            {totalPermissions ===
                                            1
                                                ? t(
                                                      'permissions.registered_singular',
                                                  )
                                                : t(
                                                      'permissions.registered_plural',
                                                  )}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {can.sync && (
                                <Button
                                    type="button"
                                    onClick={
                                        openSyncDialog
                                    }
                                    disabled={
                                        syncing
                                    }
                                    className="h-11 w-full rounded-xl px-4 shadow-sm sm:w-auto"
                                >
                                    {syncing ? (
                                        <LoaderCircle className="size-4 animate-spin" />
                                    ) : (
                                        <RefreshCw className="size-4" />
                                    )}

                                    {syncing
                                        ? t(
                                              'permissions.syncing',
                                          )
                                        : t(
                                              'permissions.sync',
                                          )}
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* =========================================================
                    ESTADÍSTICAS
                ========================================================== */}

                <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 xl:grid-cols-3">
                    <StatCard
                        icon={
                            <Boxes className="size-4" />
                        }
                        label="Módulos"
                        value={
                            modules.length
                        }
                    />

                    <StatCard
                        icon={
                            <KeyRound className="size-4" />
                        }
                        label="Permisos registrados"
                        value={
                            totalPermissions
                        }
                        tone="success"
                    />

                    <StatCard
                        icon={
                            <ShieldCheck className="size-4" />
                        }
                        label="Módulo más amplio"
                        value={
                            largestModule
                                ? largestModule.count
                                : 0
                        }
                        description={
                            largestModule
                                ? moduleLabel(
                                      largestModule.module,
                                  )
                                : 'Sin módulos'
                        }
                        tone="warning"
                    />
                </div>

                {/* =========================================================
                    INFORMACIÓN
                ========================================================== */}

                <Alert className="border-primary/20 bg-primary/[0.035]">
                    <Shield className="size-4 text-primary" />

                    <AlertTitle>
                        Permisos del sistema
                    </AlertTitle>

                    <AlertDescription>
                        Estos permisos son utilizados por los roles para definir qué acciones puede realizar cada usuario dentro de CIVAN.
                    </AlertDescription>
                </Alert>

                {/* =========================================================
                    MÓDULOS
                ========================================================== */}

                {modules.length >
                0 ? (
                    <div className="space-y-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-base font-semibold">
                                    Módulos registrados
                                </h2>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Revisa los permisos generados para cada área del sistema.
                                </p>
                            </div>

                            <Badge
                                variant="secondary"
                                className="w-fit rounded-full px-3"
                            >
                                {
                                    totalPermissions
                                }{' '}
                                permisos
                            </Badge>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                            {modules.map(
                                (
                                    module,
                                ) => (
                                    <PermissionModuleCard
                                        key={
                                            module.module
                                        }
                                        module={
                                            module
                                        }
                                        label={moduleLabel(
                                            module.module,
                                        )}
                                        totalPermissions={
                                            totalPermissions
                                        }
                                    />
                                ),
                            )}
                        </div>
                    </div>
                ) : (
                    <EmptyPermissions
                        canSync={
                            can.sync
                        }
                        syncing={
                            syncing
                        }
                        onSync={
                            openSyncDialog
                        }
                        t={t}
                    />
                )}
            </div>

            <SyncPermissionsDialog
                open={
                    syncDialogOpen
                }
                syncing={
                    syncing
                }
                moduleCount={
                    modules.length
                }
                permissionCount={
                    totalPermissions
                }
                onCancel={
                    closeSyncDialog
                }
                onConfirm={
                    syncPermissions
                }
                t={t}
            />
        </AppLayout>
    );
}

/* ==========================================================================
   TARJETA DE MÓDULO
   ========================================================================== */

function PermissionModuleCard({
    module,
    label,
    totalPermissions,
}: {
    module: PermissionModule;
    label: string;
    totalPermissions: number;
}) {
    const percentage =
        totalPermissions > 0
            ? Math.round(
                  (module.count /
                      totalPermissions) *
                      100,
              )
            : 0;

    return (
        <Card className="group relative overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md">
            <div className="pointer-events-none absolute -right-14 -top-14 size-36 rounded-full bg-primary/[0.055] blur-3xl opacity-0 transition-opacity group-hover:opacity-100" />

            <CardHeader className="relative border-b bg-muted/[0.08]">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary">
                            <ShieldCheck className="size-4" />
                        </div>

                        <div className="min-w-0">
                            <CardTitle className="truncate text-base">
                                {label}
                            </CardTitle>

                            <CardDescription className="mt-1">
                                {module.count}{' '}
                                {module.count ===
                                1
                                    ? 'permiso'
                                    : 'permisos'}
                            </CardDescription>
                        </div>
                    </div>

                    <Badge
                        variant="secondary"
                        className="shrink-0 rounded-full"
                    >
                        {
                            module.count
                        }
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="relative p-3">
                <div className="space-y-1">
                    {module.permissions.map(
                        (
                            permission,
                        ) => (
                            <div
                                key={
                                    permission.id
                                }
                                className="group/permission flex min-w-0 items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 transition hover:border-border hover:bg-muted/40"
                            >
                                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition group-hover/permission:bg-primary/10 group-hover/permission:text-primary">
                                    <KeyRound className="size-3.5" />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p
                                        className="truncate font-mono text-xs font-medium"
                                        title={
                                            permission.name
                                        }
                                    >
                                        {
                                            permission.name
                                        }
                                    </p>

                                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                                        ID #{permission.id}
                                    </p>
                                </div>

                                <CheckCircle2 className="size-3.5 shrink-0 text-emerald-500/70" />
                            </div>
                        ),
                    )}
                </div>

                <Separator className="my-3" />

                <div>
                    <div className="mb-2 flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>
                            Participación global
                        </span>

                        <span className="font-semibold text-foreground">
                            {percentage}%
                        </span>
                    </div>

                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{
                                width: `${percentage}%`,
                            }}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

/* ==========================================================================
   ESTADÍSTICAS
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
    value: number;
    description?: string;
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

                        <div className="mt-1 flex items-baseline gap-2">
                            <p className="text-xl font-bold tracking-tight">
                                {value}
                            </p>

                            {description && (
                                <p className="truncate text-[10px] text-muted-foreground">
                                    {description}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

/* ==========================================================================
   MODAL SINCRONIZAR
   ========================================================================== */

function SyncPermissionsDialog({
    open,
    syncing,
    moduleCount,
    permissionCount,
    onCancel,
    onConfirm,
    t,
}: {
    open: boolean;
    syncing: boolean;
    moduleCount: number;
    permissionCount: number;
    onCancel: () => void;
    onConfirm: () => void;
    t: (key: string) => string;
}) {
    return (
        <Dialog
            open={open}
            onOpenChange={(
                value,
            ) => {
                if (
                    !value &&
                    !syncing
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
                        syncing
                    ) {
                        event.preventDefault();
                    }
                }}
                onEscapeKeyDown={(
                    event,
                ) => {
                    if (
                        syncing
                    ) {
                        event.preventDefault();
                    }
                }}
            >
                <div className="p-5 sm:p-6">
                    <DialogHeader className="text-left">
                        <div className="flex items-start gap-4">
                            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                                <RefreshCw className="size-5" />
                            </div>

                            <div className="min-w-0 flex-1">
                                <Badge
                                    variant="outline"
                                    className="mb-2 border-primary/20 bg-primary/10 text-[10px] uppercase tracking-[0.1em] text-primary"
                                >
                                    Sincronización
                                </Badge>

                                <DialogTitle className="text-lg">
                                    ¿Sincronizar permisos?
                                </DialogTitle>

                                <DialogDescription className="mt-2 leading-6">
                                    {t(
                                        'permissions.sync_confirm',
                                    )}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                        <div className="rounded-xl border bg-muted/[0.12] p-3">
                            <p className="text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                                Módulos actuales
                            </p>

                            <p className="mt-1 text-xl font-bold">
                                {
                                    moduleCount
                                }
                            </p>
                        </div>

                        <div className="rounded-xl border bg-muted/[0.12] p-3">
                            <p className="text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                                Permisos actuales
                            </p>

                            <p className="mt-1 text-xl font-bold">
                                {
                                    permissionCount
                                }
                            </p>
                        </div>
                    </div>

                    <Alert className="mt-4 border-amber-500/25 bg-amber-500/[0.055]">
                        <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />

                        <AlertTitle>
                            Revisión recomendada
                        </AlertTitle>

                        <AlertDescription>
                            Después de sincronizar, revisa los roles para confirmar que los nuevos permisos estén asignados correctamente.
                        </AlertDescription>
                    </Alert>
                </div>

                <DialogFooter className="border-t bg-muted/[0.12] p-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={
                            onCancel
                        }
                        disabled={
                            syncing
                        }
                        className="rounded-xl"
                    >
                        Cancelar
                    </Button>

                    <Button
                        type="button"
                        onClick={
                            onConfirm
                        }
                        disabled={
                            syncing
                        }
                        className="rounded-xl"
                    >
                        {syncing ? (
                            <LoaderCircle className="size-4 animate-spin" />
                        ) : (
                            <RefreshCw className="size-4" />
                        )}

                        {syncing
                            ? t(
                                  'permissions.syncing',
                              )
                            : t(
                                  'permissions.sync',
                              )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

/* ==========================================================================
   ESTADO VACÍO
   ========================================================================== */

function EmptyPermissions({
    canSync,
    syncing,
    onSync,
    t,
}: {
    canSync: boolean;
    syncing: boolean;
    onSync: () => void;
    t: (key: string) => string;
}) {
    return (
        <Card className="rounded-2xl border-dashed">
            <CardContent className="flex flex-col items-center justify-center px-5 py-14 text-center">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <KeyRound className="size-6" />
                </div>

                <h3 className="mt-4 text-base font-semibold">
                    {t(
                        'permissions.empty_title',
                    )}
                </h3>

                <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">
                    {t(
                        'permissions.empty_description',
                    )}
                </p>

                {canSync && (
                    <Button
                        type="button"
                        onClick={
                            onSync
                        }
                        disabled={
                            syncing
                        }
                        className="mt-5 rounded-xl"
                    >
                        {syncing ? (
                            <LoaderCircle className="size-4 animate-spin" />
                        ) : (
                            <RefreshCw className="size-4" />
                        )}

                        {syncing
                            ? t(
                                  'permissions.syncing',
                              )
                            : t(
                                  'permissions.sync',
                              )}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
