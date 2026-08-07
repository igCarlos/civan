import {
    Head,
    Link,
    useForm,
} from '@inertiajs/react';

import {
    ArrowLeft,
    Save,
    ShieldAlert,
} from 'lucide-react';

import { FormEvent } from 'react';

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

interface Role {
    id: number;
    name: string;
    protected: boolean;
    permission_ids: number[];
}

interface Props {
    role: Role;
    modules: Module[];
}

export default function EditRole({
    role,
    modules,
}: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Roles',
            href: '/dashboard/roles',
        },
        {
            title: role.name,
            href: `/dashboard/roles/${role.id}/editar`,
        },
    ];

    /*
    |--------------------------------------------------------------------------
    | Formulario
    |--------------------------------------------------------------------------
    |
    | A diferencia de create.tsx, iniciamos con
    | los datos que ya tiene el rol.
    |
    */

    const form = useForm({
        name: role.name,

        permission_ids:
            role.permission_ids ?? [],
    });

    /*
    |--------------------------------------------------------------------------
    | Seleccionar permiso individual
    |--------------------------------------------------------------------------
    */

    const togglePermission = (
        permissionId: number,
    ) => {
        /*
         * El rol administrador está protegido.
         */
        if (role.protected) {
            return;
        }

        if (
            form.data.permission_ids.includes(
                permissionId,
            )
        ) {
            form.setData(
                'permission_ids',
                form.data.permission_ids.filter(
                    (id) => id !== permissionId,
                ),
            );

            return;
        }

        form.setData('permission_ids', [
            ...form.data.permission_ids,
            permissionId,
        ]);
    };

    /*
    |--------------------------------------------------------------------------
    | Seleccionar todos los permisos de un módulo
    |--------------------------------------------------------------------------
    */

    const toggleModule = (
        module: Module,
    ) => {
        if (role.protected) {
            return;
        }

        const ids = module.permissions.map(
            (permission) => permission.id,
        );

        const allSelected = ids.every((id) =>
            form.data.permission_ids.includes(id),
        );

        /*
         * Si todos estaban seleccionados,
         * quitamos todos.
         */
        if (allSelected) {
            form.setData(
                'permission_ids',

                form.data.permission_ids.filter(
                    (id) => !ids.includes(id),
                ),
            );

            return;
        }

        /*
         * De lo contrario agregamos todos,
         * evitando duplicados.
         */
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

    /*
    |--------------------------------------------------------------------------
    | Guardar
    |--------------------------------------------------------------------------
    */

    const submit = (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        form.put(
            `/dashboard/roles/${role.id}`,
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar rol - ${role.name}`} />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">

                {/* Encabezado */}
                <div className="flex items-center gap-4">

                    <Link
                        href="/dashboard/roles"
                        className="inline-flex size-10 items-center justify-center rounded-md border hover:bg-muted"
                    >
                        <ArrowLeft className="size-4" />
                    </Link>

                    <div>
                        <h1 className="text-2xl font-bold">
                            Editar rol
                        </h1>

                        <p className="text-sm text-muted-foreground">
                            Administra el nombre y los
                            permisos de este rol.
                        </p>
                    </div>
                </div>

                {/* Advertencia administrador */}
                {role.protected && (
                    <div className="flex gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">

                        <ShieldAlert className="mt-0.5 size-5 shrink-0 text-yellow-600" />

                        <div>
                            <p className="font-medium">
                                Rol protegido
                            </p>

                            <p className="mt-1 text-sm text-muted-foreground">
                                El rol administrador no puede
                                cambiar de nombre ni perder
                                permisos.
                            </p>
                        </div>
                    </div>
                )}

                <form
                    onSubmit={submit}
                    className="space-y-6"
                >

                    {/* Nombre */}
                    <section className="rounded-xl border bg-card p-5 shadow-sm">

                        <label
                            htmlFor="role-name"
                            className="mb-2 block text-sm font-medium"
                        >
                            Nombre del rol *
                        </label>

                        <input
                            id="role-name"
                            value={form.data.name}
                            disabled={role.protected}
                            onChange={(event) =>
                                form.setData(
                                    'name',
                                    event.target.value,
                                )
                            }
                            className="h-10 w-full max-w-lg rounded-md border bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                        />

                        {form.errors.name && (
                            <p className="mt-2 text-sm text-red-500">
                                {form.errors.name}
                            </p>
                        )}
                    </section>

                    {/* Permisos */}
                    <section className="rounded-xl border bg-card shadow-sm">

                        <div className="flex flex-col gap-2 border-b p-5 sm:flex-row sm:items-center sm:justify-between">

                            <div>
                                <h2 className="font-semibold">
                                    Permisos
                                </h2>

                                <p className="text-sm text-muted-foreground">
                                    Selecciona las acciones que
                                    podrá realizar este rol.
                                </p>
                            </div>

                            <div className="text-sm text-muted-foreground">
                                {
                                    form.data.permission_ids
                                        .length
                                }{' '}
                                seleccionados
                            </div>
                        </div>

                        <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">

                            {modules.map((module) => {

                                const moduleIds =
                                    module.permissions.map(
                                        (permission) =>
                                            permission.id,
                                    );

                                const selectedCount =
                                    moduleIds.filter((id) =>
                                        form.data.permission_ids.includes(
                                            id,
                                        ),
                                    ).length;

                                const allSelected =
                                    moduleIds.length > 0 &&
                                    selectedCount ===
                                        moduleIds.length;

                                return (
                                    <div
                                        key={module.module}
                                        className="overflow-hidden rounded-lg border"
                                    >

                                        {/* Módulo */}
                                        <div className="flex items-center justify-between gap-3 border-b bg-muted/30 px-4 py-3">

                                            <div>
                                                <h3 className="font-semibold capitalize">
                                                    {
                                                        module.module
                                                    }
                                                </h3>

                                                <p className="text-xs text-muted-foreground">
                                                    {
                                                        selectedCount
                                                    }
                                                    /
                                                    {
                                                        moduleIds.length
                                                    }{' '}
                                                    seleccionados
                                                </p>
                                            </div>

                                            <label
                                                className={`flex items-center gap-2 text-xs ${
                                                    role.protected
                                                        ? 'cursor-not-allowed opacity-60'
                                                        : 'cursor-pointer'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        allSelected
                                                    }
                                                    disabled={
                                                        role.protected
                                                    }
                                                    onChange={() =>
                                                        toggleModule(
                                                            module,
                                                        )
                                                    }
                                                    className="size-4"
                                                />

                                                Todos
                                            </label>
                                        </div>

                                        {/* Permisos */}
                                        <div className="space-y-1 p-3">

                                            {module.permissions.map(
                                                (permission) => {

                                                    const selected =
                                                        form.data.permission_ids.includes(
                                                            permission.id,
                                                        );

                                                    return (
                                                        <label
                                                            key={
                                                                permission.id
                                                            }
                                                            className={`flex items-center gap-3 rounded-md p-2 ${
                                                                role.protected
                                                                    ? 'cursor-not-allowed'
                                                                    : 'cursor-pointer hover:bg-muted'
                                                            }`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={
                                                                    selected
                                                                }
                                                                disabled={
                                                                    role.protected
                                                                }
                                                                onChange={() =>
                                                                    togglePermission(
                                                                        permission.id,
                                                                    )
                                                                }
                                                                className="size-4"
                                                            />

                                                            <div className="min-w-0">
                                                                <p className="text-sm font-medium">
                                                                    {
                                                                        permission.action
                                                                    }
                                                                </p>

                                                                <p className="truncate text-xs text-muted-foreground">
                                                                    {
                                                                        permission.name
                                                                    }
                                                                </p>
                                                            </div>
                                                        </label>
                                                    );
                                                },
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {form.errors.permission_ids && (
                            <p className="px-5 pb-5 text-sm text-red-500">
                                {
                                    form.errors
                                        .permission_ids
                                }
                            </p>
                        )}
                    </section>

                    {/* Acciones */}
                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                        <Link
                            href="/dashboard/roles"
                            className="inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium hover:bg-muted"
                        >
                            Cancelar
                        </Link>

                        <button
                            type="submit"
                            disabled={
                                form.processing ||
                                !form.isDirty
                            }
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Save className="size-4" />

                            {form.processing
                                ? 'Guardando...'
                                : 'Guardar cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}