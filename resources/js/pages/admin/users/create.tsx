import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    KeyRound,
    Shield,
    UserPlus,
} from 'lucide-react';
import { FormEvent } from 'react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Role {
    id: number;
    name: string;
}

interface Props {
    roles: Role[];

    can: {
        assignRoles: boolean;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Usuarios',
        href: '/dashboard/usuarios',
    },
    {
        title: 'Nuevo usuario',
        href: '/dashboard/usuarios/crear',
    },
];

export default function CreateUser({
    roles,
    can,
}: Props) {
    const form = useForm({
        name: '',
        username: '',
        email: '',
        phone: '',

        status: 'active',

        password: '',
        password_confirmation: '',

        must_change_password: true,

        role_ids: [] as number[],
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

        form.post('/dashboard/usuarios');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nuevo usuario" />

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
                            Nuevo usuario
                        </h1>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Crea una nueva cuenta para acceder a
                            CIVAN.
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
                                    <UserPlus className="size-5" />

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

                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Usuario
                                    </label>

                                    <input
                                        value={
                                            form.data.username
                                        }
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
                                            {
                                                form.errors
                                                    .username
                                            }
                                        </p>
                                    )}
                                </div>

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
                                </div>
                            </div>
                        </section>

                        {/* Contraseña */}
                        <section className="rounded-xl border bg-card shadow-sm">
                            <div className="border-b p-5">
                                <div className="flex items-center gap-3">
                                    <KeyRound className="size-5" />

                                    <div>
                                        <h2 className="font-semibold">
                                            Seguridad
                                        </h2>

                                        <p className="text-sm text-muted-foreground">
                                            Contraseña inicial de
                                            acceso.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-5 p-5 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Contraseña *
                                    </label>

                                    <input
                                        type="password"
                                        value={
                                            form.data.password
                                        }
                                        onChange={(event) =>
                                            form.setData(
                                                'password',
                                                event.target.value,
                                            )
                                        }
                                        className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                                    />

                                    {form.errors.password && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {
                                                form.errors
                                                    .password
                                            }
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Confirmar contraseña *
                                    </label>

                                    <input
                                        type="password"
                                        value={
                                            form.data
                                                .password_confirmation
                                        }
                                        onChange={(event) =>
                                            form.setData(
                                                'password_confirmation',
                                                event.target.value,
                                            )
                                        }
                                        className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                                    />
                                </div>

                                <label className="flex cursor-pointer items-start gap-3 md:col-span-2">
                                    <input
                                        type="checkbox"
                                        checked={
                                            form.data
                                                .must_change_password
                                        }
                                        onChange={(event) =>
                                            form.setData(
                                                'must_change_password',
                                                event.target.checked,
                                            )
                                        }
                                        className="mt-1 size-4"
                                    />

                                    <div>
                                        <p className="text-sm font-medium">
                                            Forzar cambio de
                                            contraseña
                                        </p>

                                        <p className="text-xs text-muted-foreground">
                                            El usuario deberá crear
                                            una nueva contraseña al
                                            iniciar sesión.
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </section>
                    </div>

                    {/* Roles */}
                    <div className="space-y-6">
                        <section className="rounded-xl border bg-card shadow-sm">
                            <div className="border-b p-5">
                                <div className="flex items-center gap-3">
                                    <Shield className="size-5" />

                                    <div>
                                        <h2 className="font-semibold">
                                            Roles
                                        </h2>

                                        <p className="text-sm text-muted-foreground">
                                            Define el nivel de
                                            acceso.
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
                                                    {
                                                        role.name
                                                    }
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
                                        {
                                            form.errors
                                                .role_ids
                                        }
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
                                <UserPlus className="size-4" />

                                {form.processing
                                    ? 'Creando...'
                                    : 'Crear usuario'}
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