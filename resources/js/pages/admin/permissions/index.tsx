import { Head, router } from '@inertiajs/react';

import {
    KeyRound,
    RefreshCw,
    ShieldCheck,
} from 'lucide-react';

import { useState } from 'react';

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
| Breadcrumbs
|--------------------------------------------------------------------------
*/

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Permisos',
        href: '/dashboard/permisos',
    },
];

/*
|--------------------------------------------------------------------------
| Página
|--------------------------------------------------------------------------
*/

export default function PermissionsIndex({
    modules,
    can,
}: Props) {
    /*
    |--------------------------------------------------------------------------
    | Estado de sincronización
    |--------------------------------------------------------------------------
    */

    const [syncing, setSyncing] =
        useState(false);

    /*
    |--------------------------------------------------------------------------
    | Sincronizar permisos
    |--------------------------------------------------------------------------
    */

    const syncPermissions = () => {
        if (syncing) {
            return;
        }

        const confirmed =
            window.confirm(
                '¿Deseas buscar y crear los permisos faltantes del sistema?',
            );

        if (!confirmed) {
            return;
        }

        router.post(
            '/dashboard/permisos/sincronizar',
            {},
            {
                preserveScroll: true,

                onStart: () => {
                    setSyncing(true);
                },

                onFinish: () => {
                    setSyncing(false);
                },
            },
        );
    };

    return (
        <AppLayout
            breadcrumbs={breadcrumbs}
        >
            <Head title="Permisos" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">

                {/* Encabezado */}

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Permisos
                        </h1>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Permisos detectados y
                            registrados en CIVAN.
                        </p>
                    </div>

                    {/* Sincronizar */}

                    {can.sync && (
                        <button
                            type="button"
                            onClick={
                                syncPermissions
                            }
                            disabled={
                                syncing
                            }
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <RefreshCw
                                className={`size-4 ${
                                    syncing
                                        ? 'animate-spin'
                                        : ''
                                }`}
                            />

                            {syncing
                                ? 'Sincronizando...'
                                : 'Sincronizar permisos'}
                        </button>
                    )}
                </div>

                {/* Información */}

                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span>
                        {modules.length}{' '}
                        {modules.length === 1
                            ? 'módulo detectado'
                            : 'módulos detectados'}
                    </span>

                    <span>
                        •
                    </span>

                    <span>
                        {modules.reduce(
                            (
                                total,
                                module,
                            ) =>
                                total +
                                module.count,
                            0,
                        )}{' '}
                        permisos registrados
                    </span>
                </div>

                {/* Módulos */}

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {modules.map(
                        (module) => (
                            <section
                                key={
                                    module.module
                                }
                                className="overflow-hidden rounded-xl border bg-card shadow-sm"
                            >
                                {/* Cabecera del módulo */}

                                <div className="flex items-center justify-between border-b bg-muted/30 p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                                            <ShieldCheck className="size-4 text-primary" />
                                        </div>

                                        <div>
                                            <h2 className="font-semibold capitalize">
                                                {
                                                    module.module
                                                }
                                            </h2>

                                            <p className="text-xs text-muted-foreground">
                                                {
                                                    module.count
                                                }{' '}
                                                {module.count ===
                                                1
                                                    ? 'permiso'
                                                    : 'permisos'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Permisos */}

                                <div className="space-y-1 p-3">
                                    {module.permissions.map(
                                        (
                                            permission,
                                        ) => (
                                            <div
                                                key={
                                                    permission.id
                                                }
                                                className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-muted/50"
                                            >
                                                <KeyRound className="size-3.5 shrink-0 text-muted-foreground" />

                                                <span className="break-all text-sm">
                                                    {
                                                        permission.name
                                                    }
                                                </span>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </section>
                        ),
                    )}
                </div>

                {/* Sin permisos */}

                {modules.length === 0 && (
                    <div className="rounded-xl border p-10 text-center">
                        <KeyRound className="mx-auto mb-3 size-8 text-muted-foreground" />

                        <p className="font-medium">
                            No existen permisos
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Ejecuta el
                            sincronizador para
                            generar los permisos
                            según tus modelos.
                        </p>

                        {can.sync && (
                            <button
                                type="button"
                                onClick={
                                    syncPermissions
                                }
                                disabled={
                                    syncing
                                }
                                className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <RefreshCw
                                    className={`size-4 ${
                                        syncing
                                            ? 'animate-spin'
                                            : ''
                                    }`}
                                />

                                {syncing
                                    ? 'Sincronizando...'
                                    : 'Sincronizar permisos'}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}