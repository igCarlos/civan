import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Eye,
    EyeOff,
    LoaderCircle,
    LockKeyhole,
    Mail,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
}

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

type SharedProps = {
    system?: {
        panel_name?: string;
        short_name?: string;
        logo_light?: string | null;
        logo_dark?: string | null;
        favicon?: string | null;
        primary_color?: string | null;
    };
};

export default function Login({
    status,
    canResetPassword,
}: LoginProps) {
    const { system } = usePage().props as SharedProps;
    const [showPassword, setShowPassword] = useState(false);

    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
    } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    const panelName = system?.panel_name ?? 'CIVAN Panel';
    const shortName = system?.short_name ?? 'CIVAN';
    const primaryColor = system?.primary_color ?? '#7C3AED';

    const lightLogo =
        system?.logo_light ??
        system?.logo_dark ??
        null;

    const darkLogo =
        system?.logo_dark ??
        system?.logo_light ??
        null;

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Iniciar sesión">
                {system?.favicon && (
                    <link
                        rel="icon"
                        href={system.favicon}
                    />
                )}
            </Head>

            <main className="relative min-h-screen overflow-hidden bg-[#f8f8fb] text-zinc-950 dark:bg-[#09090b] dark:text-white">
                {/* Luces decorativas */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div
                        className="absolute -left-32 -top-32 h-[430px] w-[430px] rounded-full opacity-[0.14] blur-[120px] dark:opacity-[0.22]"
                        style={{
                            backgroundColor: primaryColor,
                        }}
                    />
                    <div
                        className="absolute -bottom-44 right-[-120px] h-[480px] w-[480px] rounded-full opacity-[0.10] blur-[140px] dark:opacity-[0.16]"
                        style={{
                            backgroundColor: primaryColor,
                        }}
                    />

                    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(24,24,27,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(24,24,27,0.035)_1px,transparent_1px)] bg-[size:42px_42px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)]" />
                </div>

                <div className="relative mx-auto grid min-h-screen w-full max-w-[1600px] lg:grid-cols-[1.05fr_0.95fr]">
                    {/* Panel izquierdo */}
                    <section className="relative hidden min-h-screen overflow-hidden border-r border-zinc-200/70 p-10 lg:flex lg:flex-col lg:justify-between dark:border-white/10">
                        <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px] dark:bg-white/[0.015]" />

                        <div className="relative z-10">
                            <Link
                                href="/"
                                className="inline-flex items-center"
                                aria-label={panelName}
                            >
                                <BrandLogo
                                    lightLogo={lightLogo}
                                    darkLogo={darkLogo}
                                    panelName={panelName}
                                    shortName={shortName}
                                    primaryColor={primaryColor}
                                    large
                                />
                            </Link>
                        </div>

                        <div className="relative z-10 max-w-2xl py-12">
                            <div
                                className="mb-7 inline-flex items-center gap-2 rounded-full border bg-white/70 px-3.5 py-2 text-xs font-semibold shadow-sm backdrop-blur-xl dark:bg-white/[0.05]"
                                style={{
                                    borderColor: `${primaryColor}38`,
                                    color: primaryColor,
                                }}
                            >
                                <Sparkles className="h-3.5 w-3.5" />
                                Panel administrativo base
                            </div>

                            <h1 className="max-w-xl text-5xl font-semibold tracking-[-0.055em] text-zinc-950 xl:text-6xl dark:text-white">
                                Tu proyecto empieza
                                <span
                                    className="block"
                                    style={{ color: primaryColor }}
                                >
                                    con una buena base.
                                </span>
                            </h1>

                            <p className="mt-6 max-w-xl text-base leading-8 text-zinc-600 dark:text-zinc-400">
                                Administra usuarios, roles, permisos y configuraciones
                                desde una estructura moderna, modular y preparada para
                                crecer junto a tu aplicación.
                            </p>

                            <div className="mt-10 grid max-w-xl gap-3 sm:grid-cols-2">
                                <Feature
                                    icon={
                                        <ShieldCheck className="h-4 w-4" />
                                    }
                                    title="Roles y permisos"
                                    description="Control de acceso organizado desde el inicio."
                                    primaryColor={primaryColor}
                                />

                                <Feature
                                    icon={
                                        <Sparkles className="h-4 w-4" />
                                    }
                                    title="Base personalizable"
                                    description="Adapta CIVAN a cualquier tipo de proyecto."
                                    primaryColor={primaryColor}
                                />
                            </div>
                        </div>

                        <div className="relative z-10 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-500">
                            <span>
                                © {new Date().getFullYear()} {shortName}
                            </span>

                            <span className="flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                                </span>
                                Sistema disponible
                            </span>
                        </div>
                    </section>

                    {/* Login */}
                    <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12 xl:px-20">
                        <div className="w-full max-w-[460px]">
                            {/* Logo móvil */}
                            <div className="mb-10 flex justify-center lg:hidden">
                                <Link
                                    href="/"
                                    aria-label={panelName}
                                >
                                    <BrandLogo
                                        lightLogo={lightLogo}
                                        darkLogo={darkLogo}
                                        panelName={panelName}
                                        shortName={shortName}
                                        primaryColor={primaryColor}
                                    />
                                </Link>
                            </div>

                            <div className="mb-8">
                                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                    <div
                                        className="h-1.5 w-1.5 rounded-full"
                                        style={{
                                            backgroundColor: primaryColor,
                                        }}
                                    />
                                    Acceso seguro
                                </div>

                                <h2 className="text-3xl font-semibold tracking-[-0.04em] text-zinc-950 sm:text-[2.15rem] dark:text-white">
                                    Bienvenido de nuevo
                                </h2>

                                <p className="mt-3 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                                    Ingresa tus credenciales para acceder a{' '}
                                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                                        {panelName}
                                    </span>
                                    .
                                </p>
                            </div>

                            {status && (
                                <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                                    {status}
                                </div>
                            )}

                            <form
                                className="space-y-5"
                                onSubmit={submit}
                            >
                                {/* Email */}
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="email"
                                        className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
                                    >
                                        Correo electrónico
                                    </Label>

                                    <div className="group relative">
                                        <Mail className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-zinc-600 dark:group-focus-within:text-zinc-300" />

                                        <Input
                                            id="email"
                                            type="email"
                                            required
                                            autoFocus
                                            tabIndex={1}
                                            autoComplete="email"
                                            value={data.email}
                                            onChange={(event) =>
                                                setData(
                                                    'email',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="nombre@correo.com"
                                            className="h-12 rounded-xl border-zinc-200 bg-white/80 pl-11 text-[15px] shadow-sm outline-none transition-all placeholder:text-zinc-400 focus-visible:ring-2 dark:border-white/10 dark:bg-white/[0.045] dark:placeholder:text-zinc-600"
                                            style={{
                                                '--tw-ring-color': `${primaryColor}35`,
                                            } as React.CSSProperties}
                                        />
                                    </div>

                                    <InputError message={errors.email} />
                                </div>

                                {/* Password */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-4">
                                        <Label
                                            htmlFor="password"
                                            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
                                        >
                                            Contraseña
                                        </Label>

                                        {canResetPassword && (
                                            <Link
                                                href={route(
                                                    'password.request',
                                                )}
                                                tabIndex={5}
                                                className="text-xs font-semibold transition-opacity hover:opacity-75"
                                                style={{
                                                    color: primaryColor,
                                                }}
                                            >
                                                ¿Olvidaste tu contraseña?
                                            </Link>
                                        )}
                                    </div>

                                    <div className="group relative">
                                        <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-zinc-600 dark:group-focus-within:text-zinc-300" />

                                        <Input
                                            id="password"
                                            type={
                                                showPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            required
                                            tabIndex={2}
                                            autoComplete="current-password"
                                            value={data.password}
                                            onChange={(event) =>
                                                setData(
                                                    'password',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Tu contraseña"
                                            className="h-12 rounded-xl border-zinc-200 bg-white/80 px-11 text-[15px] shadow-sm outline-none transition-all placeholder:text-zinc-400 focus-visible:ring-2 dark:border-white/10 dark:bg-white/[0.045] dark:placeholder:text-zinc-600"
                                            style={{
                                                '--tw-ring-color': `${primaryColor}35`,
                                            } as React.CSSProperties}
                                        />

                                        <button
                                            type="button"
                                            tabIndex={-1}
                                            onClick={() =>
                                                setShowPassword(
                                                    (value) => !value,
                                                )
                                            }
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-700 dark:hover:text-zinc-200"
                                            aria-label={
                                                showPassword
                                                    ? 'Ocultar contraseña'
                                                    : 'Mostrar contraseña'
                                            }
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-[18px] w-[18px]" />
                                            ) : (
                                                <Eye className="h-[18px] w-[18px]" />
                                            )}
                                        </button>
                                    </div>

                                    <InputError
                                        message={errors.password}
                                    />
                                </div>

                                {/* Remember */}
                                <div className="flex items-center">
                                    <label
                                        htmlFor="remember"
                                        className="flex cursor-pointer items-center gap-3"
                                    >
                                        <Checkbox
                                            id="remember"
                                            name="remember"
                                            checked={data.remember}
                                            onCheckedChange={(checked) =>
                                                setData(
                                                    'remember',
                                                    checked === true,
                                                )
                                            }
                                            tabIndex={3}
                                        />

                                        <span className="select-none text-sm text-zinc-600 dark:text-zinc-400">
                                            Mantener sesión iniciada
                                        </span>
                                    </label>
                                </div>

                                <Button
                                    type="submit"
                                    className="group mt-2 h-12 w-full rounded-xl border-0 text-[15px] font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:brightness-105 disabled:translate-y-0 disabled:opacity-60"
                                    style={{
                                        backgroundColor: primaryColor,
                                        boxShadow: `0 12px 30px ${primaryColor}2e`,
                                    }}
                                    tabIndex={4}
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <>
                                            <LoaderCircle className="h-4 w-4 animate-spin" />
                                            Ingresando...
                                        </>
                                    ) : (
                                        <>
                                            Iniciar sesión
                                            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                                        </>
                                    )}
                                </Button>
                            </form>

                            <div className="relative my-7">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-zinc-200 dark:border-white/10" />
                                </div>

                                <div className="relative flex justify-center">
                                    <span className="bg-[#f8f8fb] px-3 text-xs text-zinc-400 dark:bg-[#09090b] dark:text-zinc-600">
                                        ¿Primera vez aquí?
                                    </span>
                                </div>
                            </div>

                            <div className="text-center text-sm text-zinc-500 dark:text-zinc-400">
                                ¿No tienes una cuenta?{' '}
                                <Link
                                    href={route('register')}
                                    tabIndex={5}
                                    className="font-semibold transition-opacity hover:opacity-75"
                                    style={{
                                        color: primaryColor,
                                    }}
                                >
                                    Crear cuenta
                                </Link>
                            </div>

                            <div className="mt-10 flex items-center justify-center gap-2 text-[11px] text-zinc-400 dark:text-zinc-600">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                Acceso protegido por {shortName}
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}

function BrandLogo({
    lightLogo,
    darkLogo,
    panelName,
    shortName,
    primaryColor,
    large = false,
}: {
    lightLogo: string | null;
    darkLogo: string | null;
    panelName: string;
    shortName: string;
    primaryColor: string;
    large?: boolean;
}) {
    const hasLogo = Boolean(
        lightLogo ||
        darkLogo,
    );

    if (hasLogo) {
        return (
            <div
                className={
                    large
                        ? 'relative flex h-20 w-[280px] items-center justify-start overflow-hidden'
                        : 'relative flex h-16 w-[230px] items-center justify-center overflow-hidden'
                }
            >
                {lightLogo && (
                    <img
                        src={lightLogo}
                        alt={panelName}
                        className="h-full w-full object-contain object-center dark:hidden"
                    />
                )}

                {darkLogo && (
                    <img
                        src={darkLogo}
                        alt={panelName}
                        className="hidden h-full w-full object-contain object-center dark:block"
                    />
                )}
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3">
            <span
                className="flex h-11 w-11 items-center justify-center rounded-2xl text-lg font-black text-white shadow-lg"
                style={{
                    background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}b8)`,
                    boxShadow: `0 10px 25px ${primaryColor}35`,
                }}
            >
                C
            </span>

            <div className="leading-none">
                <div className="text-lg font-black tracking-[0.12em] text-zinc-950 dark:text-white">
                    {shortName}
                </div>
                <div className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-400">
                    Admin base
                </div>
            </div>
        </div>
    );
}

function Feature({
    icon,
    title,
    description,
    primaryColor,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    primaryColor: string;
}) {
    return (
        <div className="rounded-2xl border border-zinc-200/80 bg-white/65 p-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.035]">
            <div
                className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl"
                style={{
                    color: primaryColor,
                    backgroundColor: `${primaryColor}12`,
                }}
            >
                {icon}
            </div>

            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {title}
            </div>

            <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-500">
                {description}
            </p>
        </div>
    );
}
