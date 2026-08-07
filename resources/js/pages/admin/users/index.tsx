import { Head, Link, router } from '@inertiajs/react';
import { Search, Shield, Trash2, UserPlus } from 'lucide-react';
import { FormEvent, useState } from 'react';

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
    last_login_at: string | null;
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

interface Props {
    users: UsersPagination;

    filters: {
        search: string;
    };

    can: {
        create: boolean;
        update: boolean;
        delete: boolean;
        updateRoles: boolean;
        updateStatus: boolean;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Usuarios',
        href: '/dashboard/usuarios',
    },
];

function statusLabel(status: string) {
    switch (status) {
        case 'active':
            return 'Activo';

        case 'suspended':
            return 'Suspendido';

        case 'pending':
            return 'Pendiente';

        default:
            return status;
    }
}

function statusClass(status: string) {
    switch (status) {
        case 'active':
            return 'bg-green-500/10 text-green-600 dark:text-green-400';

        case 'suspended':
            return 'bg-red-500/10 text-red-600 dark:text-red-400';

        case 'pending':
            return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';

        default:
            return 'bg-muted text-muted-foreground';
    }
}

export default function UsersIndex({
    users,
    filters,
    can,
}: Props) {
    const [search, setSearch] = useState(
        filters.search ?? '',
    );

    const submitSearch = (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        router.get(
            '/dashboard/usuarios',
            {
                search,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const removeUser = (user: UserItem) => {
        if (
            !window.confirm(
                `¿Seguro que deseas eliminar a ${user.name}?`,
            )
        ) {
            return;
        }

        router.delete(
            `/dashboard/usuarios/${user.id}`,
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Usuarios" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Encabezado */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Usuarios
                        </h1>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Administra las cuentas y sus
                            accesos a CIVAN.
                        </p>
                    </div>

                    {can.create && (
                        <Link
                            href="/dashboard/usuarios/crear"
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
                        >
                            <UserPlus className="size-4" />

                            Nuevo usuario
                        </Link>
                    )}
                </div>

                {/* Buscador */}
                <form
                    onSubmit={submitSearch}
                    className="flex max-w-xl gap-2"
                >
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                        <input
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value,
                                )
                            }
                            placeholder="Buscar nombre, usuario o correo..."
                            className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <button
                        type="submit"
                        className="h-10 rounded-md border px-4 text-sm font-medium hover:bg-muted"
                    >
                        Buscar
                    </button>
                </form>

                {/* Información */}
                <div className="rounded-xl border bg-card shadow-sm">
                    <div className="flex items-center justify-between border-b px-5 py-4">
                        <div>
                            <h2 className="font-semibold">
                                Todos los usuarios
                            </h2>

                            <p className="text-sm text-muted-foreground">
                                {users.total} usuarios
                                registrados
                            </p>
                        </div>
                    </div>

                    {/* Tabla */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b bg-muted/40">
                                <tr className="text-left text-xs font-medium uppercase text-muted-foreground">
                                    <th className="px-5 py-3">
                                        Usuario
                                    </th>

                                    <th className="px-5 py-3">
                                        Roles
                                    </th>

                                    <th className="px-5 py-3">
                                        Estado
                                    </th>

                                    <th className="px-5 py-3">
                                        Último acceso
                                    </th>

                                    <th className="px-5 py-3 text-right">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y">
                                {users.data.map(
                                    (user) => (
                                        <tr
                                            key={user.id}
                                            className="hover:bg-muted/30"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="font-medium">
                                                    {
                                                        user.name
                                                    }
                                                </div>

                                                <div className="text-sm text-muted-foreground">
                                                    {
                                                        user.email
                                                    }
                                                </div>

                                                {user.username && (
                                                    <div className="text-xs text-muted-foreground">
                                                        @
                                                        {
                                                            user.username
                                                        }
                                                    </div>
                                                )}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {user.roles
                                                        .length >
                                                    0 ? (
                                                        user.roles.map(
                                                            (
                                                                role,
                                                            ) => (
                                                                <span
                                                                    key={
                                                                        role
                                                                    }
                                                                    className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs"
                                                                >
                                                                    <Shield className="size-3" />

                                                                    {
                                                                        role
                                                                    }
                                                                </span>
                                                            ),
                                                        )
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">
                                                            Sin
                                                            rol
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
                                                        user.status,
                                                    )}`}
                                                >
                                                    {statusLabel(
                                                        user.status,
                                                    )}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 text-sm text-muted-foreground">
                                                {user.last_login_at ??
                                                    'Nunca'}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex justify-end gap-2">
                                                    {can.update && (
                                                        <Link
                                                            href={`/dashboard/usuarios/${user.id}/editar`}
                                                            className="rounded-md border px-3 py-2 text-xs font-medium hover:bg-muted"
                                                        >
                                                            Administrar
                                                        </Link>
                                                    )}

                                                    {can.delete && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeUser(
                                                                    user,
                                                                )
                                                            }
                                                            className="inline-flex size-9 items-center justify-center rounded-md border text-red-500 hover:bg-red-500/10"
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ),
                                )}

                                {users.data.length ===
                                    0 && (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-5 py-12 text-center text-sm text-muted-foreground"
                                        >
                                            No se encontraron
                                            usuarios.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación */}
                    {users.last_page > 1 && (
                        <div className="flex flex-wrap gap-2 border-t p-4">
                            {users.links.map(
                                (link, index) => (
                                    <button
                                        key={index}
                                        disabled={!link.url}
                                        onClick={() => {
                                            if (
                                                link.url
                                            ) {
                                                router.get(
                                                    link.url,
                                                    {},
                                                    {
                                                        preserveState:
                                                            true,
                                                    },
                                                );
                                            }
                                        }}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                        className={`rounded-md border px-3 py-1.5 text-sm ${
                                            link.active
                                                ? 'bg-primary text-primary-foreground'
                                                : 'hover:bg-muted'
                                        } disabled:opacity-40`}
                                    />
                                ),
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}