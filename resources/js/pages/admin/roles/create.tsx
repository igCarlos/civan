import {
    Head,
    Link,
    useForm,
} from '@inertiajs/react';

import {
    ArrowLeft,
    Check,
    KeyRound,
    LoaderCircle,
    Plus,
    Shield,
    ShieldCheck,
    ShieldPlus,
    Sparkles,
} from 'lucide-react';

import {
    type FormEvent,
    useMemo,
} from 'react';

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

import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Permission {
    id: number;
    name: string;
    action: string;
}

interface Module {
    module: string;
    permissions: Permission[];
}

interface Props {
    modules: Module[];
}

export default function CreateRole({
    modules,
}: Props) {
    const { t } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('roles.title'),
            href: '/dashboard/roles',
        },
        {
            title: t('roles.create.title'),
            href: '/dashboard/roles/crear',
        },
    ];

    const form = useForm({
        name: '',
        permission_ids: [] as number[],
    });

    const totalPermissions =
        useMemo(
            () =>
                modules.reduce(
                    (
                        total,
                        module,
                    ) =>
                        total +
                        module.permissions.length,
                    0,
                ),
            [
                modules,
            ],
        );

    const selectedCount =
        form.data.permission_ids.length;

    const selectedPercentage =
        totalPermissions > 0
            ? Math.round(
                  (selectedCount /
                      totalPermissions) *
                      100,
              )
            : 0;

    const selectedModules =
        useMemo(
            () =>
                modules.filter(
                    (module) =>
                        module.permissions.some(
                            (permission) =>
                                form.data.permission_ids.includes(
                                    permission.id,
                                ),
                        ),
                ).length,
            [
                modules,
                form.data.permission_ids,
            ],
        );

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

    const permissionActionLabel = (
        action: string,
    ): string => {
        switch (action) {
            case 'view':
                return t(
                    'permissions.action.view',
                );

            case 'create':
                return t(
                    'permissions.action.create',
                );

            case 'update':
                return t(
                    'permissions.action.update',
                );

            case 'delete':
                return t(
                    'permissions.action.delete',
                );

            case 'sync':
                return t(
                    'permissions.action.sync',
                );

            case 'export':
                return t(
                    'permissions.action.export',
                );

            case 'roles.update':
                return t(
                    'permissions.action.roles_update',
                );

            case 'status.update':
                return t(
                    'permissions.action.status_update',
                );

            case 'retention.update':
                return t(
                    'permissions.action.retention_update',
                );

            default:
                return action;
        }
    };

    const togglePermission = (
        permissionId: number,
    ) => {
        if (
            form.data.permission_ids.includes(
                permissionId,
            )
        ) {
            form.setData(
                'permission_ids',
                form.data.permission_ids.filter(
                    (id) =>
                        id !==
                        permissionId,
                ),
            );

            return;
        }

        form.setData(
            'permission_ids',
            [
                ...form.data.permission_ids,
                permissionId,
            ],
        );
    };

    const toggleModule = (
        module: Module,
    ) => {
        const ids =
            module.permissions.map(
                (
                    permission,
                ) =>
                    permission.id,
            );

        const allSelected =
            ids.every((id) =>
                form.data.permission_ids.includes(
                    id,
                ),
            );

        if (allSelected) {
            form.setData(
                'permission_ids',
                form.data.permission_ids.filter(
                    (id) =>
                        !ids.includes(
                            id,
                        ),
                ),
            );

            return;
        }

        form.setData(
            'permission_ids',
            Array.from(
                new Set([
                    ...form.data.permission_ids,
                    ...ids,
                ]),
            ),
        );
    };

    const submit = (
        event:
            FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        form.post(
            '/dashboard/roles',
            {
                preserveScroll:
                    true,
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
                    'roles.create.title',
                )}
            />

            <div className="flex min-w-0 flex-1 flex-col gap-5 p-3 sm:p-4 lg:gap-6 lg:p-6">
                {/* =========================================================
                    ENCABEZADO
                ========================================================== */}

                <Card className="relative overflow-hidden rounded-2xl">
                    <div className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-primary/10 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-20 left-1/3 size-44 rounded-full bg-primary/[0.05] blur-3xl" />

                    <CardContent className="relative p-5 sm:p-6">
                        <div className="flex min-w-0 items-start gap-4">
                            <Button
                                asChild
                                variant="outline"
                                size="icon"
                                className="size-10 shrink-0 rounded-xl"
                            >
                                <Link
                                    href="/dashboard/roles"
                                    aria-label="Volver a roles"
                                >
                                    <ArrowLeft className="size-4" />
                                </Link>
                            </Button>

                            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
                                <ShieldPlus className="size-5" />
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                        {t(
                                            'roles.create.title',
                                        )}
                                    </h1>

                                    <Badge
                                        variant="outline"
                                        className="border-primary/20 bg-primary/10 text-[10px] uppercase tracking-[0.08em] text-primary"
                                    >
                                        Nuevo rol
                                    </Badge>
                                </div>

                                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                                    {t(
                                        'roles.create.description',
                                    )}
                                </p>

                                <div className="mt-3 flex flex-wrap gap-2">
                                    <Badge
                                        variant="outline"
                                        className="gap-1.5"
                                    >
                                        <Shield className="size-3" />
                                        {modules.length}{' '}
                                        {modules.length === 1
                                            ? 'módulo'
                                            : 'módulos'}
                                    </Badge>

                                    <Badge
                                        variant="outline"
                                        className="gap-1.5"
                                    >
                                        <KeyRound className="size-3" />
                                        {selectedCount}{' '}
                                        seleccionados
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <form
                    onSubmit={submit}
                    className="grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]"
                >
                    {/* =====================================================
                        COLUMNA PRINCIPAL
                    ====================================================== */}

                    <div className="min-w-0 space-y-6">
                        {/* Nombre */}

                        <Card className="rounded-2xl">
                            <CardHeader>
                                <div className="flex items-start gap-3">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-background text-primary">
                                        <ShieldCheck className="size-4" />
                                    </div>

                                    <div className="min-w-0">
                                        <CardTitle className="text-base">
                                            Información del rol
                                        </CardTitle>

                                        <CardDescription className="mt-1">
                                            Define el nombre que identificará este nivel de acceso.
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent>
                                <div className="max-w-xl space-y-2">
                                    <Label htmlFor="role-name">
                                        {t(
                                            'roles.create.name',
                                        )}{' '}
                                        *
                                    </Label>

                                    <Input
                                        id="role-name"
                                        value={
                                            form.data.name
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            form.setData(
                                                'name',
                                                event
                                                    .target
                                                    .value,
                                            )
                                        }
                                        placeholder={t(
                                            'roles.create.name_placeholder',
                                        )}
                                        disabled={
                                            form.processing
                                        }
                                        className="h-11 rounded-xl"
                                        autoFocus
                                    />

                                    {form.errors.name && (
                                        <p className="text-sm text-destructive">
                                            {
                                                form.errors.name
                                            }
                                        </p>
                                    )}

                                    <p className="text-xs leading-5 text-muted-foreground">
                                        Usa un nombre claro que represente la función o nivel de acceso del rol.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Permisos */}

                        <Card className="overflow-hidden rounded-2xl">
                            <CardHeader className="border-b bg-muted/[0.08]">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-background text-primary">
                                            <KeyRound className="size-4" />
                                        </div>

                                        <div>
                                            <CardTitle className="text-base">
                                                {t(
                                                    'roles.create.permissions',
                                                )}
                                            </CardTitle>

                                            <CardDescription className="mt-1">
                                                {t(
                                                    'roles.create.permissions_description',
                                                )}
                                            </CardDescription>
                                        </div>
                                    </div>

                                    <Badge
                                        variant="secondary"
                                        className="w-fit rounded-full px-3"
                                    >
                                        {selectedCount}
                                        /
                                        {
                                            totalPermissions
                                        }{' '}
                                        seleccionados
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="p-4 sm:p-5">
                                {modules.length >
                                0 ? (
                                    <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
                                        {modules.map(
                                            (
                                                module,
                                            ) => {
                                                const moduleIds =
                                                    module.permissions.map(
                                                        (
                                                            permission,
                                                        ) =>
                                                            permission.id,
                                                    );

                                                const selectedModuleCount =
                                                    moduleIds.filter(
                                                        (
                                                            id,
                                                        ) =>
                                                            form.data.permission_ids.includes(
                                                                id,
                                                            ),
                                                    ).length;

                                                const allSelected =
                                                    moduleIds.length >
                                                        0 &&
                                                    selectedModuleCount ===
                                                        moduleIds.length;

                                                const partiallySelected =
                                                    selectedModuleCount >
                                                        0 &&
                                                    !allSelected;

                                                return (
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
                                                        selectedCount={
                                                            selectedModuleCount
                                                        }
                                                        allSelected={
                                                            allSelected
                                                        }
                                                        partiallySelected={
                                                            partiallySelected
                                                        }
                                                        selectedPermissionIds={
                                                            form
                                                                .data
                                                                .permission_ids
                                                        }
                                                        allLabel={t(
                                                            'roles.create.all',
                                                        )}
                                                        actionLabel={
                                                            permissionActionLabel
                                                        }
                                                        onToggleModule={() =>
                                                            toggleModule(
                                                                module,
                                                            )
                                                        }
                                                        onTogglePermission={
                                                            togglePermission
                                                        }
                                                    />
                                                );
                                            },
                                        )}
                                    </div>
                                ) : (
                                    <div className="rounded-xl border border-dashed p-8 text-center">
                                        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                                            <KeyRound className="size-5" />
                                        </div>

                                        <p className="mt-3 text-sm font-semibold">
                                            No hay permisos disponibles
                                        </p>

                                        <p className="mt-1 text-xs text-muted-foreground">
                                            No se encontraron módulos con permisos para asignar.
                                        </p>
                                    </div>
                                )}

                                {form.errors.permission_ids && (
                                    <p className="mt-4 text-sm text-destructive">
                                        {
                                            form.errors
                                                .permission_ids
                                        }
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* =====================================================
                        RESUMEN / ACCIONES
                    ====================================================== */}

                    <div className="space-y-6 xl:sticky xl:top-6">
                        <Card className="rounded-2xl">
                            <CardHeader>
                                <div className="flex items-start gap-3">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <Sparkles className="size-4" />
                                    </div>

                                    <div>
                                        <CardTitle className="text-sm">
                                            Resumen del nuevo rol
                                        </CardTitle>

                                        <CardDescription className="mt-1">
                                            Revisa la configuración antes de crear.
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <SummaryRow
                                    label="Nombre"
                                    value={
                                        form.data.name ||
                                        'Sin definir'
                                    }
                                />

                                <SummaryRow
                                    label="Módulos disponibles"
                                    value={String(
                                        modules.length,
                                    )}
                                />

                                <SummaryRow
                                    label="Módulos con acceso"
                                    value={String(
                                        selectedModules,
                                    )}
                                />

                                <SummaryRow
                                    label="Permisos"
                                    value={`${selectedCount}/${totalPermissions}`}
                                />

                                <Separator />

                                <div>
                                    <div className="mb-2 flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground">
                                            Cobertura de permisos
                                        </span>

                                        <span className="font-semibold">
                                            {
                                                selectedPercentage
                                            }
                                            %
                                        </span>
                                    </div>

                                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full rounded-full bg-primary transition-all duration-300"
                                            style={{
                                                width: `${selectedPercentage}%`,
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="rounded-xl bg-muted/30 p-3">
                                    <div className="flex items-start gap-2">
                                        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />

                                        <div>
                                            <p className="text-xs font-semibold">
                                                Acceso controlado
                                            </p>

                                            <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                                                El rol solo tendrá acceso a los permisos que selecciones.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>

                            <CardFooter className="flex-col gap-2 border-t bg-muted/[0.08]">
                                <Button
                                    type="submit"
                                    disabled={
                                        form.processing
                                    }
                                    className="h-11 w-full rounded-xl"
                                >
                                    {form.processing ? (
                                        <LoaderCircle className="size-4 animate-spin" />
                                    ) : (
                                        <ShieldPlus className="size-4" />
                                    )}

                                    {form.processing
                                        ? t(
                                              'roles.create.creating',
                                          )
                                        : t(
                                              'roles.create.submit',
                                          )}
                                </Button>

                                <Button
                                    asChild
                                    type="button"
                                    variant="outline"
                                    className="h-10 w-full rounded-xl"
                                >
                                    <Link href="/dashboard/roles">
                                        {t(
                                            'common.cancel',
                                        )}
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

/* ==========================================================================
   MÓDULO DE PERMISOS
   ========================================================================== */

function PermissionModuleCard({
    module,
    label,
    selectedCount,
    allSelected,
    partiallySelected,
    selectedPermissionIds,
    allLabel,
    actionLabel,
    onToggleModule,
    onTogglePermission,
}: {
    module: Module;
    label: string;
    selectedCount: number;
    allSelected: boolean;
    partiallySelected: boolean;
    selectedPermissionIds: number[];
    allLabel: string;
    actionLabel: (
        action: string,
    ) => string;
    onToggleModule: () => void;
    onTogglePermission: (
        permissionId: number,
    ) => void;
}) {
    return (
        <Card
            className={[
                'overflow-hidden rounded-xl shadow-none transition',
                allSelected
                    ? 'border-primary/35 ring-1 ring-primary/10'
                    : partiallySelected
                      ? 'border-primary/20'
                      : '',
            ].join(
                ' ',
            )}
        >
            <CardHeader className="border-b bg-muted/[0.12] p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <div
                                className={[
                                    'flex size-8 shrink-0 items-center justify-center rounded-lg',
                                    allSelected
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-primary/10 text-primary',
                                ].join(
                                    ' ',
                                )}
                            >
                                <ShieldCheck className="size-4" />
                            </div>

                            <div className="min-w-0">
                                <CardTitle className="truncate text-sm">
                                    {label}
                                </CardTitle>

                                <CardDescription className="mt-0.5 text-[11px]">
                                    {selectedCount}
                                    /
                                    {
                                        module.permissions
                                            .length
                                    }{' '}
                                    seleccionados
                                </CardDescription>
                            </div>
                        </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                        <Label
                            htmlFor={`module-${module.module}`}
                            className="cursor-pointer text-[11px]"
                        >
                            {allLabel}
                        </Label>

                        <Checkbox
                            id={`module-${module.module}`}
                            checked={
                                allSelected
                            }
                            onCheckedChange={() =>
                                onToggleModule()
                            }
                        />
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-1 p-2">
                {module.permissions.map(
                    (
                        permission,
                    ) => {
                        const selected =
                            selectedPermissionIds.includes(
                                permission.id,
                            );

                        return (
                            <label
                                key={
                                    permission.id
                                }
                                htmlFor={`permission-${permission.id}`}
                                className={[
                                    'flex cursor-pointer items-center gap-3 rounded-lg border border-transparent p-2.5 transition',
                                    'hover:border-border hover:bg-muted/40',
                                    selected
                                        ? 'bg-primary/[0.035]'
                                        : '',
                                ].join(
                                    ' ',
                                )}
                            >
                                <Checkbox
                                    id={`permission-${permission.id}`}
                                    checked={
                                        selected
                                    }
                                    onCheckedChange={() =>
                                        onTogglePermission(
                                            permission.id,
                                        )
                                    }
                                />

                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="truncate text-sm font-medium">
                                            {actionLabel(
                                                permission.action,
                                            )}
                                        </p>

                                        {selected && (
                                            <Badge
                                                variant="secondary"
                                                className="shrink-0 px-1.5 py-0 text-[9px] text-primary"
                                            >
                                                <Check className="mr-1 size-2.5" />
                                                Activo
                                            </Badge>
                                        )}
                                    </div>

                                    <p
                                        className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground"
                                        title={
                                            permission.name
                                        }
                                    >
                                        {
                                            permission.name
                                        }
                                    </p>
                                </div>
                            </label>
                        );
                    },
                )}
            </CardContent>
        </Card>
    );
}

/* ==========================================================================
   RESUMEN
   ========================================================================== */

function SummaryRow({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-start justify-between gap-4 text-xs">
            <span className="shrink-0 text-muted-foreground">
                {label}
            </span>

            <span className="min-w-0 break-words text-right font-medium capitalize">
                {value}
            </span>
        </div>
    );
}
