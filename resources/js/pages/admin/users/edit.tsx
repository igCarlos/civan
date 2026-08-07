import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Save,
    Shield,
    UserRoundPen,
} from 'lucide-react';
import { FormEvent } from 'react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Role {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    username: string | null;
    email: string;
    phone: string | null;
    status: string;
    roles: Role[];
}

interface Props {
    user: User;

    roles: Role[];

    can: {
        assignRoles: boolean;
    };
}

export default function EditUser({
    user,
    roles,
    can,
}: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Usuarios',
            href: '/dashboard/usuarios',
        },
        {
            title: user.name,
            href: `/dashboard/usuarios/${user.id}/editar`,
        },
    ];

    const form = useForm({
        name: user.name ?? '',
        username: user.username ?? '',
        email: user.email ?? '',
        phone: user.phone ?? '',

        status: user.status ?? 'active',

        role_ids:
            user.roles?.map((role) => role.id) ?? [],
    });

    const toggleRole = (roleId: number) => {
        if (form.data.role_ids.includes(roleId)) {
            form.setData(
                'role_ids',
                form.data.role_ids.filter(
                    (id) => id !== roleId,
                ),
            );

            return;
        }

        form.setData('role_ids', [
            ...form.data.role_ids,
            roleId,
        ]);
    };

    const submit = (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        form.put(
            `/dashboard/usuarios/${user.id}`,
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar ${user.name}`} />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Encabezado */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard/usuarios"
                        className="inline-flex size-10 items-center justify-center rounded-md border hover:bg-muted"
                    >
                        <ArrowLeft className="size-4" />
                    </Link>

                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Editar usuario
                        </h1>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Modifica la información de{' '}
                            <span className="font-medium text-foreground">
                                {user.name}
                            </span>
                            .
                        </p>
                    </div>
                </div>

                <form
                    onSubmit={submit}
                    className="grid gap-6 xl:grid-cols-[1fr_380px]"
                >
                    {/* Columna principal */}
                    <div className="space-y-6">
                        {/* Información */}
                        <section className="rounded-xl border bg-card shadow-sm">
                            <div className="border-b p-5">
                                <div className="flex items-center gap-3">
                                    <UserRoundPen className="size-5" />

                                    <div>
                                        <h2 className="font-semibold">
                                            Información
                                        </h2>

                                        <p className="text-sm text-muted-foreground">
                                            Datos principales del
                                            usuario.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-5 p-5 md:grid-cols-2">
                                {/* Nombre */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Nombre *
                                    </label>

                                    <input
                                        value={form.data.name}
                                        onChange={(event) =>
                                            form.setData(
                                                'name',
                                                event.target.value,
                                            )
                                        }
                                        className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="Carlos Ivan"
                                    />

                                    {form.errors.name && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {form.errors.name}
                                        </p>
                                    )}
                                </div>

                                {/* Usuario */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Usuario
                                    </label>

                                    <input
                                        value={form.data.username}
                                        onChange={(event) =>
                                            form.setData(
                                                'username',
                                                event.target.value,
                                            )
                                        }
                                        className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="carlos"
                                    />

                                    {form.errors.username && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {form.errors.username}
                                        </p>
                                    )}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Correo electrónico *
                                    </label>

                                    <input
                                        type="email"
                                        value={form.data.email}
                                        onChange={(event) =>
                                            form.setData(
                                                'email',
                                                event.target.value,
                                            )
                                        }
                                        className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="usuario@ejemplo.com"
                                    />

                                    {form.errors.email && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {form.errors.email}
                                        </p>
                                    )}
                                </div>

                                {/* Teléfono */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Teléfono
                                    </label>

                                    <input
                                        value={form.data.phone}
                                        onChange={(event) =>
                                            form.setData(
                                                'phone',
                                                event.target.value,
                                            )
                                        }
                                        className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="+505 ..."
                                    />

                                    {form.errors.phone && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {form.errors.phone}
                                        </p>
                                    )}
                                </div>

                                {/* Estado */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Estado
                                    </label>

                                    <select
                                        value={form.data.status}
                                        onChange={(event) =>
                                            form.setData(
                                                'status',
                                                event.target.value,
                                            )
                                        }
                                        className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                                    >
                                        <option value="active">
                                            Activo
                                        </option>

                                        <option value="pending">
                                            Pendiente
                                        </option>

                                        <option value="suspended">
                                            Suspendido
                                        </option>
                                    </select>

                                    {form.errors.status && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {form.errors.status}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Columna derecha */}
                    <div className="space-y-6">
                        {/* Roles */}
                        <section className="rounded-xl border bg-card shadow-sm">
                            <div className="border-b p-5">
                                <div className="flex items-center gap-3">
                                    <Shield className="size-5" />

                                    <div>
                                        <h2 className="font-semibold">
                                            Roles
                                        </h2>

                                        <p className="text-sm text-muted-foreground">
                                            Define el nivel de acceso.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 p-5">
                                {can.assignRoles ? (
                                    roles.map((role) => (
                                        <label
                                            key={role.id}
                                            className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-muted/50"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={form.data.role_ids.includes(
                                                    role.id,
                                                )}
                                                onChange={() =>
                                                    toggleRole(
                                                        role.id,
                                                    )
                                                }
                                                className="size-4"
                                            />

                                            <div className="flex-1">
                                                <p className="text-sm font-medium capitalize">
                                                    {role.name}
                                                </p>
                                            </div>
                                        </label>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        No tienes permiso para
                                        asignar roles.
                                    </p>
                                )}

                                {form.errors.role_ids && (
                                    <p className="text-sm text-red-500">
                                        {form.errors.role_ids}
                                    </p>
                                )}
                            </div>
                        </section>

                        {/* Guardar */}
                        <section className="rounded-xl border bg-card p-5 shadow-sm">
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
                            >
                                <Save className="size-4" />

                                {form.processing
                                    ? 'Guardando...'
                                    : 'Guardar cambios'}
                            </button>

                            <Link
                                href="/dashboard/usuarios"
                                className="mt-2 inline-flex h-10 w-full items-center justify-center rounded-md border text-sm font-medium hover:bg-muted"
                            >
                                Cancelar
                            </Link>
                        </section>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}