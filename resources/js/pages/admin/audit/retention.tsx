import {
    Head,
    router,
    useForm,
} from '@inertiajs/react';

import {
    Activity,
    CalendarClock,
    Database,
    Eraser,
    Save,
    ShieldCheck,
} from 'lucide-react';

import {
    FormEvent,
    useState,
} from 'react';

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
    const { t } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('audit.title'),
            href: '/dashboard/auditoria',
        },
        {
            title: t('audit.retention.title'),
            href: '/dashboard/auditoria/retencion',
        },
    ];

    const [
        pruning,
        setPruning,
    ] = useState(false);

    const form =
        useForm({
            page_view_retention_days:
                settings
                    .page_view_retention_days,
        });

    const submit = (
        event:
            FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        form.put(
            '/dashboard/auditoria/retencion',
            {
                preserveScroll: true,
            },
        );
    };

    const pruneNow = () => {
        if (
            pruning ||
            !can.update
        ) {
            return;
        }

        const message =
            stats.eligible_count > 0
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

        const confirmed =
            window.confirm(message);

        if (!confirmed) {
            return;
        }

        router.post(
            '/dashboard/auditoria/retencion/limpiar',
            {},
            {
                preserveScroll: true,

                onStart: () => {
                    setPruning(true);
                },

                onFinish: () => {
                    setPruning(false);
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
                    'audit.retention.title',
                )}
            />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Encabezado */}

                <div className="flex items-start gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-card">
                        <ShieldCheck className="size-5" />
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            {t(
                                'audit.retention.title',
                            )}
                        </h1>

                        <p className="mt-1 text-sm text-muted-foreground">
                            {t(
                                'audit.retention.description',
                            )}
                        </p>
                    </div>
                </div>

                {/* Estadísticas */}

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-xl border bg-card p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                {t(
                                    'audit.retention.current',
                                )}
                            </p>

                            <CalendarClock className="size-4 text-muted-foreground" />
                        </div>

                        <p className="mt-2 text-2xl font-bold">
                            {
                                settings
                                    .page_view_retention_days
                            }{' '}
                            {t(
                                'audit.retention.days',
                            )}
                        </p>
                    </div>

                    <div className="rounded-xl border bg-card p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                {t(
                                    'audit.retention.page_views',
                                )}
                            </p>

                            <Activity className="size-4 text-muted-foreground" />
                        </div>

                        <p className="mt-2 text-2xl font-bold">
                            {
                                stats
                                    .page_view_total
                            }
                        </p>
                    </div>

                    <div className="rounded-xl border bg-card p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                {t(
                                    'audit.retention.ready_to_prune',
                                )}
                            </p>

                            <Eraser className="size-4 text-muted-foreground" />
                        </div>

                        <p className="mt-2 text-2xl font-bold">
                            {
                                stats
                                    .eligible_count
                            }
                        </p>
                    </div>

                    <div className="rounded-xl border bg-card p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                {t(
                                    'audit.retention.chunk_size',
                                )}
                            </p>

                            <Database className="size-4 text-muted-foreground" />
                        </div>

                        <p className="mt-2 text-2xl font-bold">
                            {
                                settings
                                    .chunk_size
                            }
                        </p>
                    </div>
                </div>

                {/* Configuración */}

                <section className="rounded-xl border bg-card shadow-sm">
                    <div className="border-b p-5">
                        <h2 className="font-semibold">
                            {t(
                                'audit.retention.policy_title',
                            )}
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            {t(
                                'audit.retention.policy_description',
                            )}
                            <span className="mx-1 rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                                page_view
                            </span>
                            .
                        </p>
                    </div>

                    <form
                        onSubmit={submit}
                        className="p-5"
                    >
                        <div className="max-w-md space-y-2">
                            <label
                                htmlFor="page_view_retention_days"
                                className="text-sm font-medium"
                            >
                                {t(
                                    'audit.retention.retention_days',
                                )}
                            </label>

                            <input
                                id="page_view_retention_days"
                                type="number"
                                min={1}
                                max={3650}
                                value={
                                    form.data
                                        .page_view_retention_days
                                }
                                onChange={(event) =>
                                    form.setData(
                                        'page_view_retention_days',
                                        Number(
                                            event.target.value,
                                        ),
                                    )
                                }
                                disabled={
                                    !can.update ||
                                    form.processing
                                }
                                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                            />

                            {form.errors
                                .page_view_retention_days && (
                                <p className="text-sm text-destructive">
                                    {
                                        form.errors
                                            .page_view_retention_days
                                    }
                                </p>
                            )}

                            <p className="text-xs text-muted-foreground">
                                {t(
                                    'audit.retention.retention_help',
                                )}
                            </p>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-3">
                            {can.update && (
                                <button
                                    type="submit"
                                    disabled={
                                        form.processing
                                    }
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <Save className="size-4" />

                                    {form.processing
                                        ? t(
                                              'audit.retention.saving',
                                          )
                                        : t(
                                              'audit.retention.save',
                                          )}
                                </button>
                            )}
                        </div>
                    </form>
                </section>

                {/* Estado de limpieza */}

                <section className="rounded-xl border bg-card shadow-sm">
                    <div className="border-b p-5">
                        <h2 className="font-semibold">
                            {t(
                                'audit.retention.cleanup_title',
                            )}
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            {t(
                                'audit.retention.cleanup_description',
                            )}
                        </p>
                    </div>

                    <div className="grid gap-5 p-5 lg:grid-cols-2">
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    {t(
                                        'audit.retention.cutoff',
                                    )}
                                </p>

                                <p className="mt-1 font-medium">
                                    {
                                        stats
                                            .cutoff
                                    }
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    {t(
                                        'audit.retention.oldest_page_view',
                                    )}
                                </p>

                                <p className="mt-1 font-medium">
                                    {
                                        stats
                                            .oldest_page_view
                                        ?? t(
                                            'audit.retention.no_page_views',
                                        )
                                    }
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    {t(
                                        'audit.retention.eligible_records',
                                    )}
                                </p>

                                <p className="mt-1 text-2xl font-bold">
                                    {
                                        stats
                                            .eligible_count
                                    }
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start lg:justify-end">
                            {can.update && (
                                <button
                                    type="button"
                                    onClick={
                                        pruneNow
                                    }
                                    disabled={
                                        pruning
                                    }
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md border bg-background px-4 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <Eraser className="size-4" />

                                    {pruning
                                        ? t(
                                              'audit.retention.pruning',
                                          )
                                        : t(
                                              'audit.retention.prune_now',
                                          )}
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                {/* Información */}

                <section className="rounded-xl border border-dashed p-5">
                    <h2 className="font-semibold">
                        {t(
                            'audit.retention.preserved_title',
                        )}
                    </h2>

                    <p className="mt-2 text-sm text-muted-foreground">
                        {t(
                            'audit.retention.preserved_description',
                        )}
                    </p>
                </section>
            </div>
        </AppLayout>
    );
}
