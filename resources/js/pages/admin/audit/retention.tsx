import {
    Head,
    Link,
    router,
    useForm,
} from '@inertiajs/react';

import {
    Activity,
    AlertTriangle,
    ArrowLeft,
    CalendarClock,
    CheckCircle2,
    Clock3,
    Database,
    Eraser,
    HardDrive,
    LoaderCircle,
    Save,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';

import {
    type FormEvent,
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

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import {
    type BreadcrumbItem,
} from '@/types';

interface Settings {
    page_view_retention_days: number;
    chunk_size: number;
}

interface Stats {
    page_view_total: number;
    eligible_count: number;
    cutoff: string;
    cutoff_iso: string;
    oldest_page_view: string | null;
}

interface Props {
    settings: Settings;

    stats: Stats;

    can: {
        update: boolean;
    };
}

export default function AuditRetention({
    settings,
    stats,
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
        {
            title: t(
                'audit.retention.title',
            ),
            href: '/dashboard/auditoria/retencion',
        },
    ];

    const [
        pruning,
        setPruning,
    ] = useState(false);

    const [
        pruneDialogOpen,
        setPruneDialogOpen,
    ] = useState(false);

    const form =
        useForm({
            page_view_retention_days:
                settings
                    .page_view_retention_days,
        });

    const retentionPercentage =
        useMemo(
            () => {
                const days =
                    Number(
                        form.data
                            .page_view_retention_days,
                    );

                if (
                    !Number.isFinite(
                        days,
                    )
                ) {
                    return 0;
                }

                return Math.min(
                    100,
                    Math.max(
                        0,
                        (days /
                            3650) *
                            100,
                    ),
                );
            },
            [
                form.data
                    .page_view_retention_days,
            ],
        );

    const eligiblePercentage =
        stats.page_view_total >
        0
            ? Math.round(
                  (stats.eligible_count /
                      stats.page_view_total) *
                      100,
              )
            : 0;

    const submit = (
        event:
            FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        form.put(
            '/dashboard/auditoria/retencion',
            {
                preserveScroll:
                    true,
            },
        );
    };

    const openPruneDialog =
        () => {
            if (
                pruning ||
                !can.update
            ) {
                return;
            }

            setPruneDialogOpen(
                true,
            );
        };

    const closePruneDialog =
        () => {
            if (pruning) {
                return;
            }

            setPruneDialogOpen(
                false,
            );
        };

    const pruneNow = () => {
        if (
            pruning ||
            !can.update
        ) {
            return;
        }

        router.post(
            '/dashboard/auditoria/retencion/limpiar',
            {},
            {
                preserveScroll:
                    true,

                onStart: () => {
                    setPruning(
                        true,
                    );
                },

                onSuccess: () => {
                    setPruneDialogOpen(
                        false,
                    );
                },

                onFinish: () => {
                    setPruning(
                        false,
                    );
                },
            },
        );
    };

    const pruneMessage =
        stats.eligible_count >
        0
            ? t(
                  'audit.retention.confirm_with_records',
              )
                  .replace(
                      '{count}',
                      String(
                          stats.eligible_count,
                      ),
                  )
                  .replace(
                      '{cutoff}',
                      stats.cutoff,
                  )
            : t(
                  'audit.retention.confirm_without_records',
              );

    return (
        <AppLayout
            breadcrumbs={
                breadcrumbs
            }
        >
            <Head
                title={t(
                    'audit.retention.title',
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
                        <div className="flex min-w-0 items-start gap-4">
                            <Button
                                asChild
                                variant="outline"
                                size="icon"
                                className="size-10 shrink-0 rounded-xl"
                            >
                                <Link
                                    href="/dashboard/auditoria"
                                    aria-label="Volver a auditoría"
                                >
                                    <ArrowLeft className="size-4" />
                                </Link>
                            </Button>

                            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
                                <ShieldCheck className="size-5" />
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                        {t(
                                            'audit.retention.title',
                                        )}
                                    </h1>

                                    <Badge
                                        variant="outline"
                                        className="border-primary/20 bg-primary/10 text-[10px] uppercase tracking-[0.08em] text-primary"
                                    >
                                        Política de datos
                                    </Badge>
                                </div>

                                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                                    {t(
                                        'audit.retention.description',
                                    )}
                                </p>

                                <div className="mt-3 flex flex-wrap gap-2">
                                    <Badge
                                        variant="outline"
                                        className="gap-1.5"
                                    >
                                        <CalendarClock className="size-3" />

                                        {
                                            settings
                                                .page_view_retention_days
                                        }{' '}
                                        {t(
                                            'audit.retention.days',
                                        )}
                                    </Badge>

                                    <Badge
                                        variant="outline"
                                        className="gap-1.5"
                                    >
                                        <Database className="size-3" />

                                        {
                                            stats.page_view_total
                                        }{' '}
                                        page_view
                                    </Badge>

                                    {stats.eligible_count >
                                        0 && (
                                        <Badge
                                            variant="outline"
                                            className="gap-1.5 border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                        >
                                            <Eraser className="size-3" />

                                            {
                                                stats.eligible_count
                                            }{' '}
                                            listos para limpiar
                                        </Badge>
                                    )}
                                </div>
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
                            <CalendarClock className="size-4" />
                        }
                        label={t(
                            'audit.retention.current',
                        )}
                        value={`${settings.page_view_retention_days} ${t(
                            'audit.retention.days',
                        )}`}
                    />

                    <StatCard
                        icon={
                            <Activity className="size-4" />
                        }
                        label={t(
                            'audit.retention.page_views',
                        )}
                        value={String(
                            stats.page_view_total,
                        )}
                        tone="success"
                    />

                    <StatCard
                        icon={
                            <Eraser className="size-4" />
                        }
                        label={t(
                            'audit.retention.ready_to_prune',
                        )}
                        value={String(
                            stats.eligible_count,
                        )}
                        tone={
                            stats.eligible_count >
                            0
                                ? 'warning'
                                : 'success'
                        }
                    />

                    <StatCard
                        icon={
                            <Database className="size-4" />
                        }
                        label={t(
                            'audit.retention.chunk_size',
                        )}
                        value={String(
                            settings.chunk_size,
                        )}
                    />
                </div>

                {/* =========================================================
                    CONTENIDO
                ========================================================== */}

                <div className="grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
                    <div className="min-w-0 space-y-6">
                        {/* =================================================
                            CONFIGURACIÓN
                        ================================================== */}

                        <Card className="overflow-hidden rounded-2xl">
                            <CardHeader className="border-b bg-muted/[0.08]">
                                <div className="flex items-start gap-3">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-background text-primary">
                                        <CalendarClock className="size-4" />
                                    </div>

                                    <div>
                                        <CardTitle className="text-base">
                                            {t(
                                                'audit.retention.policy_title',
                                            )}
                                        </CardTitle>

                                        <CardDescription className="mt-1 leading-6">
                                            {t(
                                                'audit.retention.policy_description',
                                            )}{' '}
                                            <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground">
                                                page_view
                                            </code>
                                            .
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>

                            <form
                                onSubmit={
                                    submit
                                }
                            >
                                <CardContent className="p-5 sm:p-6">
                                    <div className="max-w-xl space-y-5">
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="page_view_retention_days"
                                            >
                                                {t(
                                                    'audit.retention.retention_days',
                                                )}
                                            </Label>

                                            <div className="relative">
                                                <CalendarClock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                                                <Input
                                                    id="page_view_retention_days"
                                                    type="number"
                                                    min={
                                                        1
                                                    }
                                                    max={
                                                        3650
                                                    }
                                                    value={
                                                        form
                                                            .data
                                                            .page_view_retention_days
                                                    }
                                                    onChange={(
                                                        event,
                                                    ) =>
                                                        form.setData(
                                                            'page_view_retention_days',
                                                            Number(
                                                                event
                                                                    .target
                                                                    .value,
                                                            ),
                                                        )
                                                    }
                                                    disabled={
                                                        !can.update ||
                                                        form.processing
                                                    }
                                                    className="h-11 rounded-xl pl-10 pr-16"
                                                />

                                                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                                                    {t(
                                                        'audit.retention.days',
                                                    )}
                                                </span>
                                            </div>

                                            {form.errors
                                                .page_view_retention_days && (
                                                <p className="text-sm text-destructive">
                                                    {
                                                        form
                                                            .errors
                                                            .page_view_retention_days
                                                    }
                                                </p>
                                            )}

                                            <p className="text-xs leading-5 text-muted-foreground">
                                                {t(
                                                    'audit.retention.retention_help',
                                                )}
                                            </p>
                                        </div>

                                        <div className="rounded-xl border bg-muted/[0.08] p-4">
                                            <div className="flex items-center justify-between gap-4">
                                                <div>
                                                    <p className="text-xs font-semibold">
                                                        Ventana de retención configurada
                                                    </p>

                                                    <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                                                        Rango permitido: 1 a 3650 días.
                                                    </p>
                                                </div>

                                                <Badge
                                                    variant="secondary"
                                                    className="shrink-0 rounded-full"
                                                >
                                                    {
                                                        form
                                                            .data
                                                            .page_view_retention_days
                                                    }{' '}
                                                    días
                                                </Badge>
                                            </div>

                                            <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                                                <div
                                                    className="h-full rounded-full bg-primary transition-all duration-300"
                                                    style={{
                                                        width: `${retentionPercentage}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>

                                <CardFooter className="border-t bg-muted/[0.08]">
                                    {can.update ? (
                                        <Button
                                            type="submit"
                                            disabled={
                                                form.processing
                                            }
                                            className="h-10 rounded-xl"
                                        >
                                            {form.processing ? (
                                                <LoaderCircle className="size-4 animate-spin" />
                                            ) : (
                                                <Save className="size-4" />
                                            )}

                                            {form.processing
                                                ? t(
                                                      'audit.retention.saving',
                                                  )
                                                : t(
                                                      'audit.retention.save',
                                                  )}
                                        </Button>
                                    ) : (
                                        <p className="text-xs text-muted-foreground">
                                            No tienes permiso para modificar esta configuración.
                                        </p>
                                    )}
                                </CardFooter>
                            </form>
                        </Card>

                        {/* =================================================
                            LIMPIEZA
                        ================================================== */}

                        <Card className="overflow-hidden rounded-2xl">
                            <CardHeader className="border-b bg-muted/[0.08]">
                                <div className="flex items-start gap-3">
                                    <div
                                        className={[
                                            'flex size-10 shrink-0 items-center justify-center rounded-xl border',
                                            stats.eligible_count >
                                            0
                                                ? 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                                : 'bg-background text-primary',
                                        ].join(
                                            ' ',
                                        )}
                                    >
                                        <Eraser className="size-4" />
                                    </div>

                                    <div>
                                        <CardTitle className="text-base">
                                            {t(
                                                'audit.retention.cleanup_title',
                                            )}
                                        </CardTitle>

                                        <CardDescription className="mt-1">
                                            {t(
                                                'audit.retention.cleanup_description',
                                            )}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="p-5 sm:p-6">
                                <div className="grid gap-4 md:grid-cols-3">
                                    <InfoBlock
                                        icon={
                                            <Clock3 className="size-4" />
                                        }
                                        label={t(
                                            'audit.retention.cutoff',
                                        )}
                                        value={
                                            stats.cutoff
                                        }
                                    />

                                    <InfoBlock
                                        icon={
                                            <Activity className="size-4" />
                                        }
                                        label={t(
                                            'audit.retention.oldest_page_view',
                                        )}
                                        value={
                                            stats.oldest_page_view ??
                                            t(
                                                'audit.retention.no_page_views',
                                            )
                                        }
                                    />

                                    <InfoBlock
                                        icon={
                                            <Eraser className="size-4" />
                                        }
                                        label={t(
                                            'audit.retention.eligible_records',
                                        )}
                                        value={String(
                                            stats.eligible_count,
                                        )}
                                        emphasize={
                                            stats.eligible_count >
                                            0
                                        }
                                    />
                                </div>

                                <Separator className="my-5" />

                                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                                    <div>
                                        <div className="flex items-center justify-between gap-4 text-xs">
                                            <span className="text-muted-foreground">
                                                Registros que cumplen la política
                                            </span>

                                            <span className="font-semibold">
                                                {
                                                    eligiblePercentage
                                                }
                                                %
                                            </span>
                                        </div>

                                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                                            <div
                                                className={[
                                                    'h-full rounded-full transition-all duration-300',
                                                    stats.eligible_count >
                                                    0
                                                        ? 'bg-amber-500'
                                                        : 'bg-emerald-500',
                                                ].join(
                                                    ' ',
                                                )}
                                                style={{
                                                    width: `${eligiblePercentage}%`,
                                                }}
                                            />
                                        </div>

                                        <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
                                            {stats.eligible_count >
                                            0
                                                ? `${stats.eligible_count} de ${stats.page_view_total} registros page_view están fuera de la ventana de retención.`
                                                : 'No hay registros pendientes de limpieza según la política actual.'}
                                        </p>
                                    </div>

                                    {can.update && (
                                        <Button
                                            type="button"
                                            variant={
                                                stats.eligible_count >
                                                0
                                                    ? 'destructive'
                                                    : 'outline'
                                            }
                                            onClick={
                                                openPruneDialog
                                            }
                                            disabled={
                                                pruning
                                            }
                                            className="h-10 rounded-xl"
                                        >
                                            {pruning ? (
                                                <LoaderCircle className="size-4 animate-spin" />
                                            ) : (
                                                <Eraser className="size-4" />
                                            )}

                                            {pruning
                                                ? t(
                                                      'audit.retention.pruning',
                                                  )
                                                : t(
                                                      'audit.retention.prune_now',
                                                  )}
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* =================================================
                            INFORMACIÓN PRESERVADA
                        ================================================== */}

                        <Alert className="border-primary/20 bg-primary/[0.035]">
                            <ShieldCheck className="size-4 text-primary" />

                            <AlertTitle>
                                {t(
                                    'audit.retention.preserved_title',
                                )}
                            </AlertTitle>

                            <AlertDescription>
                                {t(
                                    'audit.retention.preserved_description',
                                )}
                            </AlertDescription>
                        </Alert>
                    </div>

                    {/* =====================================================
                        RESUMEN LATERAL
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
                                            Resumen de retención
                                        </CardTitle>

                                        <CardDescription className="mt-1">
                                            Estado actual de la política de auditoría.
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <SummaryRow
                                    label="Retención"
                                    value={`${form.data.page_view_retention_days} días`}
                                />

                                <SummaryRow
                                    label="Total page_view"
                                    value={String(
                                        stats.page_view_total,
                                    )}
                                />

                                <SummaryRow
                                    label="Elegibles"
                                    value={String(
                                        stats.eligible_count,
                                    )}
                                />

                                <SummaryRow
                                    label="Tamaño por lote"
                                    value={String(
                                        settings.chunk_size,
                                    )}
                                />

                                <Separator />

                                <div className="rounded-xl bg-muted/30 p-3">
                                    <div className="flex items-start gap-2">
                                        <HardDrive className="mt-0.5 size-4 shrink-0 text-primary" />

                                        <div>
                                            <p className="text-xs font-semibold">
                                                Limpieza por lotes
                                            </p>

                                            <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                                                El sistema procesa hasta {settings.chunk_size} registros por lote durante la limpieza.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {stats.eligible_count >
                                0 ? (
                                    <Alert className="border-amber-500/25 bg-amber-500/[0.055]">
                                        <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />

                                        <AlertTitle>
                                            Limpieza disponible
                                        </AlertTitle>

                                        <AlertDescription>
                                            Hay registros anteriores al límite configurado que pueden eliminarse.
                                        </AlertDescription>
                                    </Alert>
                                ) : (
                                    <div className="flex items-center gap-2 rounded-xl bg-emerald-500/[0.06] p-3 text-xs text-emerald-700 dark:text-emerald-400">
                                        <CheckCircle2 className="size-4 shrink-0" />

                                        La retención está al día.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <PruneDialog
                open={
                    pruneDialogOpen
                }
                pruning={
                    pruning
                }
                eligibleCount={
                    stats.eligible_count
                }
                totalCount={
                    stats.page_view_total
                }
                cutoff={
                    stats.cutoff
                }
                message={
                    pruneMessage
                }
                onCancel={
                    closePruneDialog
                }
                onConfirm={
                    pruneNow
                }
                t={t}
            />
        </AppLayout>
    );
}

/* ==========================================================================
   ESTADÍSTICAS
   ========================================================================== */

function StatCard({
    icon,
    label,
    value,
    tone = 'default',
}: {
    icon: ReactNode;
    label: string;
    value: string;
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

                        <p className="mt-1 truncate text-xl font-bold tracking-tight">
                            {value}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

/* ==========================================================================
   BLOQUES DE INFORMACIÓN
   ========================================================================== */

function InfoBlock({
    icon,
    label,
    value,
    emphasize = false,
}: {
    icon: ReactNode;
    label: string;
    value: string;
    emphasize?: boolean;
}) {
    return (
        <div
            className={[
                'min-w-0 rounded-xl border p-4',
                emphasize
                    ? 'border-amber-500/20 bg-amber-500/[0.045]'
                    : 'bg-muted/[0.08]',
            ].join(
                ' ',
            )}
        >
            <div className="flex items-center gap-2 text-muted-foreground">
                {icon}

                <p className="truncate text-[10px] font-medium uppercase tracking-[0.05em]">
                    {label}
                </p>
            </div>

            <p
                className={[
                    'mt-2 break-words font-semibold',
                    emphasize
                        ? 'text-xl text-amber-600 dark:text-amber-400'
                        : 'text-sm',
                ].join(
                    ' ',
                )}
            >
                {value}
            </p>
        </div>
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

            <span className="min-w-0 break-words text-right font-medium">
                {value}
            </span>
        </div>
    );
}

/* ==========================================================================
   MODAL DE LIMPIEZA
   ========================================================================== */

function PruneDialog({
    open,
    pruning,
    eligibleCount,
    totalCount,
    cutoff,
    message,
    onCancel,
    onConfirm,
    t,
}: {
    open: boolean;
    pruning: boolean;
    eligibleCount: number;
    totalCount: number;
    cutoff: string;
    message: string;
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
                    !pruning
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
                        pruning
                    ) {
                        event.preventDefault();
                    }
                }}
                onEscapeKeyDown={(
                    event,
                ) => {
                    if (
                        pruning
                    ) {
                        event.preventDefault();
                    }
                }}
            >
                <div className="p-5 sm:p-6">
                    <DialogHeader className="text-left">
                        <div className="flex items-start gap-4">
                            <div
                                className={[
                                    'flex size-12 shrink-0 items-center justify-center rounded-2xl ring-1',
                                    eligibleCount >
                                    0
                                        ? 'bg-destructive/10 text-destructive ring-destructive/15'
                                        : 'bg-primary/10 text-primary ring-primary/15',
                                ].join(
                                    ' ',
                                )}
                            >
                                {eligibleCount >
                                0 ? (
                                    <AlertTriangle className="size-5" />
                                ) : (
                                    <Eraser className="size-5" />
                                )}
                            </div>

                            <div className="min-w-0 flex-1">
                                <Badge
                                    variant={
                                        eligibleCount >
                                        0
                                            ? 'destructive'
                                            : 'outline'
                                    }
                                    className="mb-2 text-[10px] uppercase tracking-[0.1em]"
                                >
                                    Limpieza manual
                                </Badge>

                                <DialogTitle className="text-lg">
                                    ¿Ejecutar limpieza ahora?
                                </DialogTitle>

                                <DialogDescription className="mt-2 leading-6">
                                    {message}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                        <div className="rounded-xl border bg-muted/[0.12] p-3">
                            <p className="text-[10px] uppercase tracking-[0.05em] text-muted-foreground">
                                Elegibles
                            </p>

                            <p className="mt-1 text-xl font-bold">
                                {
                                    eligibleCount
                                }
                            </p>
                        </div>

                        <div className="rounded-xl border bg-muted/[0.12] p-3">
                            <p className="text-[10px] uppercase tracking-[0.05em] text-muted-foreground">
                                Total
                            </p>

                            <p className="mt-1 text-xl font-bold">
                                {
                                    totalCount
                                }
                            </p>
                        </div>
                    </div>

                    <div className="mt-3 rounded-xl border bg-muted/[0.08] p-3">
                        <p className="text-[10px] uppercase tracking-[0.05em] text-muted-foreground">
                            Fecha límite
                        </p>

                        <p className="mt-1 text-sm font-semibold">
                            {cutoff}
                        </p>
                    </div>

                    {eligibleCount >
                        0 && (
                        <Alert
                            variant="destructive"
                            className="mt-4"
                        >
                            <AlertTriangle className="size-4" />

                            <AlertTitle>
                                Acción irreversible
                            </AlertTitle>

                            <AlertDescription>
                                Los registros eliminados por esta limpieza no podrán recuperarse desde el panel.
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
                            pruning
                        }
                        className="rounded-xl"
                    >
                        Cancelar
                    </Button>

                    <Button
                        type="button"
                        variant={
                            eligibleCount >
                            0
                                ? 'destructive'
                                : 'default'
                        }
                        onClick={
                            onConfirm
                        }
                        disabled={
                            pruning
                        }
                        className="rounded-xl"
                    >
                        {pruning ? (
                            <LoaderCircle className="size-4 animate-spin" />
                        ) : (
                            <Eraser className="size-4" />
                        )}

                        {pruning
                            ? t(
                                  'audit.retention.pruning',
                              )
                            : t(
                                  'audit.retention.prune_now',
                              )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
