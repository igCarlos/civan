import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    BadgeCheck,
    CheckCircle2,
    LoaderCircle,
    Mail,
    Save,
    ShieldCheck,
    UserRound,
} from 'lucide-react';
import { type FormEventHandler, useMemo } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Perfil',
        href: '/settings/profile',
    },
];

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<SharedData>().props;

    const {
        data,
        setData,
        patch,
        errors,
        processing,
        recentlySuccessful,
    } = useForm({
        name: auth.user.name,
        email: auth.user.email,
    });

    const initials = useMemo(() => {
        return auth.user.name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((word) => word.charAt(0).toUpperCase())
            .join('');
    }, [auth.user.name]);

    const emailVerified =
        auth.user.email_verified_at !== null;

    const hasChanges =
        data.name !== auth.user.name ||
        data.email !== auth.user.email;

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        patch(route('profile.update'), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Configuración del perfil" />

            <SettingsLayout>
                <div className="mx-auto w-full max-w-3xl space-y-6">
                    <HeadingSmall
                        title="Información del perfil"
                        description="Administra la información principal asociada a tu cuenta."
                    />

                    {/* Resumen del perfil */}
                    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
                        <div className="border-b border-border/70 bg-muted/20 px-5 py-5 sm:px-6">
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                                <div className="relative">
                                    <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-xl font-bold text-primary ring-1 ring-primary/15">
                                        {initials || (
                                            <UserRound className="size-6" />
                                        )}
                                    </div>

                                    {emailVerified && (
                                        <div
                                            className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full border-2 border-card bg-emerald-500 text-white"
                                            title="Correo verificado"
                                        >
                                            <BadgeCheck className="size-3.5" />
                                        </div>
                                    )}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="truncate text-lg font-semibold text-foreground">
                                            {auth.user.name}
                                        </h2>

                                        <span
                                            className={[
                                                'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold',
                                                emailVerified
                                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
                                            ].join(' ')}
                                        >
                                            {emailVerified
                                                ? 'Correo verificado'
                                                : 'Correo pendiente'}
                                        </span>
                                    </div>

                                    <div className="mt-1.5 flex items-center gap-2 text-sm text-muted-foreground">
                                        <Mail className="size-3.5 shrink-0" />
                                        <span className="truncate">
                                            {auth.user.email}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <ShieldCheck className="size-4 text-primary" />
                                    Cuenta protegida
                                </div>
                            </div>
                        </div>

                        {/* Formulario */}
                        <form
                            onSubmit={submit}
                            className="space-y-6 p-5 sm:p-6"
                        >
                            <div className="grid gap-5 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        Nombre completo
                                    </Label>

                                    <div className="relative">
                                        <UserRound className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                                        <Input
                                            id="name"
                                            className="h-11 rounded-xl pl-10"
                                            value={data.name}
                                            onChange={(event) =>
                                                setData(
                                                    'name',
                                                    event.target.value,
                                                )
                                            }
                                            required
                                            autoComplete="name"
                                            placeholder="Tu nombre completo"
                                            disabled={processing}
                                        />
                                    </div>

                                    <InputError
                                        message={errors.name}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">
                                        Correo electrónico
                                    </Label>

                                    <div className="relative">
                                        <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                                        <Input
                                            id="email"
                                            type="email"
                                            className="h-11 rounded-xl pl-10"
                                            value={data.email}
                                            onChange={(event) =>
                                                setData(
                                                    'email',
                                                    event.target.value,
                                                )
                                            }
                                            required
                                            autoComplete="username"
                                            placeholder="nombre@correo.com"
                                            disabled={processing}
                                        />
                                    </div>

                                    <InputError
                                        message={errors.email}
                                    />
                                </div>
                            </div>

                            {/* Verificación */}
                            {mustVerifyEmail && !emailVerified && (
                                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                            <Mail className="size-4" />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-sm font-semibold text-foreground">
                                                Verifica tu correo electrónico
                                            </h3>

                                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                                Tu dirección de correo todavía no
                                                ha sido verificada. Esto puede
                                                limitar algunas funciones de tu
                                                cuenta.
                                            </p>

                                            <Link
                                                href={route(
                                                    'verification.send',
                                                )}
                                                method="post"
                                                as="button"
                                                className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-primary transition-opacity hover:opacity-75"
                                            >
                                                Reenviar correo de verificación
                                            </Link>

                                            {status ===
                                                'verification-link-sent' && (
                                                <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-2.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                                    <CheckCircle2 className="size-4 shrink-0" />
                                                    Se envió un nuevo enlace de
                                                    verificación a tu correo.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {mustVerifyEmail && emailVerified && (
                                <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.045] p-4">
                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                        <BadgeCheck className="size-4" />
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-foreground">
                                            Correo electrónico verificado
                                        </p>

                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            Tu dirección de correo ha sido
                                            confirmada correctamente.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Guardar */}
                            <div className="flex flex-col gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center">
                                <Button
                                    type="submit"
                                    disabled={
                                        processing ||
                                        !hasChanges
                                    }
                                    className="h-10 rounded-xl px-5"
                                >
                                    {processing ? (
                                        <>
                                            <LoaderCircle className="size-4 animate-spin" />
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="size-4" />
                                            Guardar cambios
                                        </>
                                    )}
                                </Button>

                                {!hasChanges &&
                                    !recentlySuccessful && (
                                        <span className="text-xs text-muted-foreground">
                                            No hay cambios pendientes.
                                        </span>
                                    )}

                                <Transition
                                    show={recentlySuccessful}
                                    enter="transition duration-200 ease-out"
                                    enterFrom="translate-y-1 opacity-0"
                                    enterTo="translate-y-0 opacity-100"
                                    leave="transition duration-150 ease-in"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                >
                                    <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                        <CheckCircle2 className="size-4" />
                                        Perfil actualizado correctamente
                                    </div>
                                </Transition>
                            </div>
                        </form>
                    </div>

                    {/* Nota de seguridad */}
                    <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-muted/20 p-4">
                        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />

                        <p className="text-sm leading-6 text-muted-foreground">
                            Si cambias tu dirección de correo electrónico,
                            puede ser necesario verificarla nuevamente antes
                            de acceder a funciones protegidas.
                        </p>
                    </div>

                    {/* Eliminación */}
                    <div className="pt-2">
                        <DeleteUser />
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
