import {
    Head,
    Link,
    router,
} from '@inertiajs/react';

import {
    Plus,
    ShieldCheck,
    Trash2,
    Users,
} from 'lucide-react';

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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Roles',
        href: '/dashboard/roles',
    },
];

export default function RolesIndex({
    roles,
    can,
}: Props) {
    const removeRole = (role: Role) => {
        if (
            !window.confirm(
                `¿Eliminar el rol "${role.name}"?`,
            )
        ) {
            return;
        }

        router.delete(
            `/dashboard/roles/${role.id}`,
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">
                            Roles
                        </h1>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Administra los roles y los
                            permisos de acceso.
                        </p>
                    </div>

                    {can.create && (
                        <Link
                            href="/dashboard/roles/crear"
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
                        >
                            <Plus className="size-4" />

                            Nuevo rol
                        </Link>
                    )}
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {roles.map((role) => (
                        <div
                            key={role.id}
                            className="rounded-xl border bg-card p-5 shadow-sm"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3">

                                    <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10">
                                        <ShieldCheck className="size-5 text-primary" />
                                    </div>

                                    <div>
                                        <h2 className="font-semibold capitalize">
                                            {role.name}
                                        </h2>

                                        {role.protected && (
                                            <span className="text-xs text-muted-foreground">
                                                Rol protegido
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 grid grid-cols-2 gap-3">
                                <div className="rounded-lg border p-3">
                                    <div className="flex items-center gap-2">
                                        <Users className="size-4 text-muted-foreground" />

                                        <span className="text-xl font-bold">
                                            {role.users_count}
                                        </span>
                                    </div>

                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Usuarios
                                    </p>
                                </div>

                                <div className="rounded-lg border p-3">
                                    <div className="text-xl font-bold">
                                        {role.permissions_count}
                                    </div>

                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Permisos
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 flex gap-2">
                                {can.update && (
                                    <Link
                                        href={`/dashboard/roles/${role.id}/editar`}
                                        className="inline-flex h-9 flex-1 items-center justify-center rounded-md border text-sm font-medium hover:bg-muted"
                                    >
                                        Administrar
                                    </Link>
                                )}

                                {can.delete &&
                                    !role.protected && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeRole(role)
                                        }
                                        className="inline-flex size-9 items-center justify-center rounded-md border text-red-500 hover:bg-red-500/10"
                                    >
                                        <Trash2 className="size-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}