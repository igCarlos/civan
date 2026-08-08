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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Auditoría',
        href: '/dashboard/auditoria',
    },
    {
        title: 'Retención',
        href: '/dashboard/auditoria/retencion',
    },
];

export default function AuditRetention({
    settings,
    stats,
    can,
}: Props) {
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

        const confirmed =
            window.confirm(
                stats.eligible_count > 0
                    ? `Se eliminarán ${stats.eligible_count} registros de navegación anteriores a ${stats.cutoff}. ¿Deseas continuar?`
                    : 'No hay registros vencidos actualmente. ¿Deseas ejecutar la limpieza de todos modos?',
            );

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
            <Head title="Retención de Auditoría" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">

                {/* Encabezado */}

                <div className="flex items-start gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-card">
                        <ShieldCheck className="size-5" />
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Retención de Auditoría
                        </h1>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Controla cuánto tiempo se conserva
                            la navegación registrada en CIVAN.
                            Los eventos importantes no se eliminan.
                        </p>
                    </div>
                </div>

                {/* Estadísticas */}

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-xl border bg-card p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Retención actual
                            </p>

                            <CalendarClock className="size-4 text-muted-foreground" />
                        </div>

                        <p className="mt-2 text-2xl font-bold">
                            {
                                settings
                                    .page_view_retention_days
                            }{' '}
                            días
                        </p>
                    </div>

                    <div className="rounded-xl border bg-card p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Navegaciones
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
                                Listas para limpiar
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
                                Bloque de limpieza
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
                            Política de navegación
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Solo afecta eventos
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
                                Días de retención
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
                                Se eliminarán únicamente
                                navegaciones con más de esta
                                cantidad de días.
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
                                        ? 'Guardando...'
                                        : 'Guardar configuración'}
                                </button>
                            )}
                        </div>
                    </form>
                </section>

                {/* Estado de limpieza */}

                <section className="rounded-xl border bg-card shadow-sm">
                    <div className="border-b p-5">
                        <h2 className="font-semibold">
                            Limpieza
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Revisa qué registros quedarían
                            fuera de la política actual.
                        </p>
                    </div>

                    <div className="grid gap-5 p-5 lg:grid-cols-2">
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Fecha límite
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
                                    Navegación más antigua
                                </p>

                                <p className="mt-1 font-medium">
                                    {
                                        stats
                                            .oldest_page_view
                                        ?? 'No existen registros de navegación'
                                    }
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Registros que se eliminarían
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
                                        ? 'Limpiando...'
                                        : 'Limpiar ahora'}
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                {/* Información */}

                <section className="rounded-xl border border-dashed p-5">
                    <h2 className="font-semibold">
                        Eventos conservados
                    </h2>

                    <p className="mt-2 text-sm text-muted-foreground">
                        Esta política no elimina inicios o
                        cierres de sesión, creación, edición,
                        eliminación, cambios de roles,
                        permisos, sincronizaciones,
                        exportaciones ni otras acciones
                        importantes de seguridad.
                    </p>
                </section>
            </div>
        </AppLayout>
    );
}
