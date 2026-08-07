import { Head } from '@inertiajs/react';
import {
    KeyRound,
    ShieldCheck,
} from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

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
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Permisos',
        href: '/dashboard/permisos',
    },
];

export default function PermissionsIndex({
    modules,
}: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Permisos" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">

                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Permisos
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Permisos detectados y registrados
                        en CIVAN.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {modules.map((module) => (
                        <section
                            key={module.module}
                            className="overflow-hidden rounded-xl border bg-card shadow-sm"
                        >
                            <div className="flex items-center justify-between border-b bg-muted/30 p-4">
                                <div className="flex items-center gap-3">

                                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                                        <ShieldCheck className="size-4 text-primary" />
                                    </div>

                                    <div>
                                        <h2 className="font-semibold capitalize">
                                            {module.module}
                                        </h2>

                                        <p className="text-xs text-muted-foreground">
                                            {module.count}{' '}
                                            permisos
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1 p-3">
                                {module.permissions.map(
                                    (permission) => (
                                        <div
                                            key={
                                                permission.id
                                            }
                                            className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-muted/50"
                                        >
                                            <KeyRound className="size-3.5 text-muted-foreground" />

                                            <span className="text-sm">
                                                {
                                                    permission.name
                                                }
                                            </span>
                                        </div>
                                    ),
                                )}
                            </div>
                        </section>
                    ))}
                </div>

                {modules.length === 0 && (
                    <div className="rounded-xl border p-10 text-center">
                        <KeyRound className="mx-auto mb-3 size-8 text-muted-foreground" />

                        <p className="font-medium">
                            No existen permisos
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Ejecuta el sincronizador para
                            generar los permisos según tus
                            modelos.
                        </p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}