import {
    Head,
    Link,
    useForm,
} from '@inertiajs/react';

import {
    ArrowLeft,
    ShieldPlus,
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

interface Props {
    modules: Module[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Roles',
        href: '/dashboard/roles',
    },
    {
        title: 'Nuevo rol',
        href: '/dashboard/roles/crear',
    },
];

export default function CreateRole({
    modules,
}: Props) {
    const form = useForm({
        name: '',
        permission_ids: [] as number[],
    });

    const togglePermission = (
        permissionId: number,
    ) => {
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

    const toggleModule = (
        module: Module,
    ) => {
        const ids = module.permissions.map(
            (permission) => permission.id,
        );

        const allSelected = ids.every((id) =>
            form.data.permission_ids.includes(id),
        );

        if (allSelected) {
            form.setData(
                'permission_ids',
                form.data.permission_ids.filter(
                    (id) => !ids.includes(id),
                ),
            );

            return;
        }

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

    const submit = (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        form.post('/dashboard/roles');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nuevo rol" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">

                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard/roles"
                        className="inline-flex size-10 items-center justify-center rounded-md border hover:bg-muted"
                    >
                        <ArrowLeft className="size-4" />
                    </Link>

                    <div>
                        <h1 className="text-2xl font-bold">
                            Nuevo rol
                        </h1>

                        <p className="text-sm text-muted-foreground">
                            Crea un rol y selecciona sus permisos.
                        </p>
                    </div>
                </div>

                <form
                    onSubmit={submit}
                    className="space-y-6"
                >
                    <section className="rounded-xl border bg-card p-5 shadow-sm">
                        <label className="mb-2 block text-sm font-medium">
                            Nombre del rol *
                        </label>

                        <input
                            value={form.data.name}
                            onChange={(event) =>
                                form.setData(
                                    'name',
                                    event.target.value,
                                )
                            }
                            placeholder="Ej: soporte"
                            className="h-10 w-full max-w-lg rounded-md border bg-background px-3 text-sm"
                        />

                        {form.errors.name && (
                            <p className="mt-2 text-sm text-red-500">
                                {form.errors.name}
                            </p>
                        )}
                    </section>

                    <section className="rounded-xl border bg-card shadow-sm">
                        <div className="border-b p-5">
                            <h2 className="font-semibold">
                                Permisos
                            </h2>

                            <p className="text-sm text-muted-foreground">
                                Selecciona qué podrá hacer este rol.
                            </p>
                        </div>

                        <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
                            {modules.map((module) => {
                                const allSelected =
                                    module.permissions.every(
                                        (permission) =>
                                            form.data.permission_ids.includes(
                                                permission.id,
                                            ),
                                    );

                                return (
                                    <div
                                        key={module.module}
                                        className="overflow-hidden rounded-lg border"
                                    >
                                        <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
                                            <h3 className="font-semibold capitalize">
                                                {module.module}
                                            </h3>

                                            <label className="flex cursor-pointer items-center gap-2 text-xs">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        allSelected
                                                    }
                                                    onChange={() =>
                                                        toggleModule(
                                                            module,
                                                        )
                                                    }
                                                />

                                                Todos
                                            </label>
                                        </div>

                                        <div className="space-y-1 p-3">
                                            {module.permissions.map(
                                                (permission) => (
                                                    <label
                                                        key={
                                                            permission.id
                                                        }
                                                        className="flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-muted"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={form.data.permission_ids.includes(
                                                                permission.id,
                                                            )}
                                                            onChange={() =>
                                                                togglePermission(
                                                                    permission.id,
                                                                )
                                                            }
                                                        />

                                                        <div>
                                                            <p className="text-sm font-medium">
                                                                {
                                                                    permission.action
                                                                }
                                                            </p>

                                                            <p className="text-xs text-muted-foreground">
                                                                {
                                                                    permission.name
                                                                }
                                                            </p>
                                                        </div>
                                                    </label>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    <div className="flex justify-end gap-3">
                        <Link
                            href="/dashboard/roles"
                            className="inline-flex h-10 items-center rounded-md border px-4 text-sm font-medium hover:bg-muted"
                        >
                            Cancelar
                        </Link>

                        <button
                            type="submit"
                            disabled={form.processing}
                            className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground disabled:opacity-50"
                        >
                            <ShieldPlus className="size-4" />

                            {form.processing
                                ? 'Creando...'
                                : 'Crear rol'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}