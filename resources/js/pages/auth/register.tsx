import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    AtSign,
    Check,
    Eye,
    EyeOff,
    LoaderCircle,
    LockKeyhole,
    Mail,
    Phone,
    ShieldCheck,
    Sparkles,
    UserRound,
} from 'lucide-react';
import {
    type CSSProperties,
    type FormEventHandler,
    type ReactNode,
    useMemo,
    useState,
} from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface RegisterForm {
    name: string;
    username: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation: string;
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

export default function Register() {
    const { system } = usePage().props as SharedProps;

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
    } = useForm<RegisterForm>({
        name: '',
        username: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
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

    const passwordChecks = useMemo(
        () => ({
            length: data.password.length >= 8,
            uppercase: /[A-Z]/.test(data.password),
            lowercase: /[a-z]/.test(data.password),
            number: /\d/.test(data.password),
            matches:
                data.password.length > 0 &&
                data.password === data.password_confirmation,
        }),
        [
            data.password,
            data.password_confirmation,
        ],
    );

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        post(route('register'), {
            onFinish: () =>
                reset(
                    'password',
                    'password_confirmation',
                ),
        });
    };

    return (
        <>
            <Head title="Crear cuenta">
                {system?.favicon && (
                    <link
                        rel="icon"
                        href={system.favicon}
                    />
                )}
            </Head>

            <main className="relative min-h-screen overflow-hidden bg-[#f8f8fb] text-zinc-950 dark:bg-[#09090b] dark:text-white">
                {/* Fondo decorativo */}
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

                <div className="relative mx-auto grid min-h-screen w-full max-w-[1600px] lg:grid-cols-[0.9fr_1.1fr]">
                    {/* Presentación */}
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

                        <div className="relative z-10 max-w-xl py-12">
                            <div
                                className="mb-7 inline-flex items-center gap-2 rounded-full border bg-white/70 px-3.5 py-2 text-xs font-semibold shadow-sm backdrop-blur-xl dark:bg-white/[0.05]"
                                style={{
                                    borderColor: `${primaryColor}38`,
                                    color: primaryColor,
                                }}
                            >
                                <Sparkles className="h-3.5 w-3.5" />
                                Comienza con CIVAN
                            </div>

                            <h1 className="max-w-xl text-5xl font-semibold tracking-[-0.055em] text-zinc-950 xl:text-6xl dark:text-white">
                                Crea tu cuenta.
                                <span
                                    className="block"
                                    style={{
                                        color: primaryColor,
                                    }}
                                >
                                    Empieza a construir.
                                </span>
                            </h1>

                            <p className="mt-6 max-w-lg text-base leading-8 text-zinc-600 dark:text-zinc-400">
                                Regístrate para acceder a una base
                                administrativa moderna, segura y preparada
                                para adaptarse a tus proyectos.
                            </p>

                            <div className="mt-10 space-y-3">
                                <Benefit
                                    text="Acceso centralizado a tu panel"
                                    primaryColor={primaryColor}
                                />
                                <Benefit
                                    text="Gestión preparada para roles y permisos"
                                    primaryColor={primaryColor}
                                />
                                <Benefit
                                    text="Interfaz moderna y personalizable"
                                    primaryColor={primaryColor}
                                />
                            </div>
                        </div>

                        <div className="relative z-10 flex items-center justify-between text-xs text-zinc-500">
                            <span>
                                © {new Date().getFullYear()} {shortName}
                            </span>

                            <span className="flex items-center gap-2">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                Registro seguro
                            </span>
                        </div>
                    </section>

                    {/* Formulario */}
                    <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-10 xl:px-16">
                        <div className="w-full max-w-[660px]">
                            {/* Logo móvil */}
                            <div className="mb-8 flex justify-center lg:hidden">
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

                            <div className="mb-7">
                                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                    <div
                                        className="h-1.5 w-1.5 rounded-full"
                                        style={{
                                            backgroundColor: primaryColor,
                                        }}
                                    />
                                    Nueva cuenta
                                </div>

                                <h2 className="text-3xl font-semibold tracking-[-0.04em] text-zinc-950 sm:text-[2.15rem] dark:text-white">
                                    Crea tu cuenta
                                </h2>

                                <p className="mt-3 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                                    Completa tus datos para acceder a{' '}
                                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                                        {panelName}
                                    </span>
                                    .
                                </p>
                            </div>

                            <form
                                className="space-y-5"
                                onSubmit={submit}
                            >
                                {/* Nombre + usuario */}
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <Field
                                        id="name"
                                        label="Nombre completo"
                                        icon={
                                            <UserRound className="h-[18px] w-[18px]" />
                                        }
                                        error={errors.name}
                                    >
                                        <Input
                                            id="name"
                                            type="text"
                                            required
                                            autoFocus
                                            tabIndex={1}
                                            autoComplete="name"
                                            value={data.name}
                                            onChange={(event) =>
                                                setData(
                                                    'name',
                                                    event.target.value,
                                                )
                                            }
                                            disabled={processing}
                                            placeholder="Carlos Ivan"
                                            className={inputClass}
                                            style={
                                                {
                                                    '--tw-ring-color':
                                                        `${primaryColor}35`,
                                                } as CSSProperties
                                            }
                                        />
                                    </Field>

                                    <Field
                                        id="username"
                                        label="Nombre de usuario"
                                        icon={
                                            <AtSign className="h-[18px] w-[18px]" />
                                        }
                                        error={errors.username}
                                    >
                                        <Input
                                            id="username"
                                            type="text"
                                            required
                                            tabIndex={2}
                                            autoComplete="username"
                                            value={data.username}
                                            onChange={(event) =>
                                                setData(
                                                    'username',
                                                    normalizeUsername(
                                                        event.target.value,
                                                    ),
                                                )
                                            }
                                            disabled={processing}
                                            placeholder="carlosivan"
                                            className={inputClass}
                                            style={
                                                {
                                                    '--tw-ring-color':
                                                        `${primaryColor}35`,
                                                } as CSSProperties
                                            }
                                        />
                                    </Field>
                                </div>

                                {/* Email + teléfono */}
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <Field
                                        id="email"
                                        label="Correo electrónico"
                                        icon={
                                            <Mail className="h-[18px] w-[18px]" />
                                        }
                                        error={errors.email}
                                    >
                                        <Input
                                            id="email"
                                            type="email"
                                            required
                                            tabIndex={3}
                                            autoComplete="email"
                                            value={data.email}
                                            onChange={(event) =>
                                                setData(
                                                    'email',
                                                    event.target.value,
                                                )
                                            }
                                            disabled={processing}
                                            placeholder="nombre@correo.com"
                                            className={inputClass}
                                            style={
                                                {
                                                    '--tw-ring-color':
                                                        `${primaryColor}35`,
                                                } as CSSProperties
                                            }
                                        />
                                    </Field>

                                    <Field
                                        id="phone"
                                        label="Teléfono"
                                        optional
                                        icon={
                                            <Phone className="h-[18px] w-[18px]" />
                                        }
                                        error={errors.phone}
                                    >
                                        <Input
                                            id="phone"
                                            type="tel"
                                            tabIndex={4}
                                            autoComplete="tel"
                                            value={data.phone}
                                            onChange={(event) =>
                                                setData(
                                                    'phone',
                                                    event.target.value,
                                                )
                                            }
                                            disabled={processing}
                                            placeholder="+505 8888 8888"
                                            className={inputClass}
                                            style={
                                                {
                                                    '--tw-ring-color':
                                                        `${primaryColor}35`,
                                                } as CSSProperties
                                            }
                                        />
                                    </Field>
                                </div>

                                {/* Contraseñas */}
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <Field
                                        id="password"
                                        label="Contraseña"
                                        icon={
                                            <LockKeyhole className="h-[18px] w-[18px]" />
                                        }
                                        error={errors.password}
                                    >
                                        <PasswordInput
                                            id="password"
                                            value={data.password}
                                            show={showPassword}
                                            onToggle={() =>
                                                setShowPassword(
                                                    (value) => !value,
                                                )
                                            }
                                            onChange={(value) =>
                                                setData(
                                                    'password',
                                                    value,
                                                )
                                            }
                                            disabled={processing}
                                            tabIndex={5}
                                            placeholder="Crea una contraseña"
                                            primaryColor={primaryColor}
                                        />
                                    </Field>

                                    <Field
                                        id="password_confirmation"
                                        label="Confirmar contraseña"
                                        icon={
                                            <LockKeyhole className="h-[18px] w-[18px]" />
                                        }
                                        error={
                                            errors.password_confirmation
                                        }
                                    >
                                        <PasswordInput
                                            id="password_confirmation"
                                            value={
                                                data.password_confirmation
                                            }
                                            show={showConfirmation}
                                            onToggle={() =>
                                                setShowConfirmation(
                                                    (value) => !value,
                                                )
                                            }
                                            onChange={(value) =>
                                                setData(
                                                    'password_confirmation',
                                                    value,
                                                )
                                            }
                                            disabled={processing}
                                            tabIndex={6}
                                            placeholder="Repite la contraseña"
                                            primaryColor={primaryColor}
                                        />
                                    </Field>
                                </div>

                                {/* Requisitos */}
                                <div className="rounded-2xl border border-zinc-200/80 bg-white/55 p-4 dark:border-white/10 dark:bg-white/[0.025]">
                                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-500">
                                        Seguridad de la contraseña
                                    </p>

                                    <div className="grid gap-x-4 gap-y-2 sm:grid-cols-2">
                                        <PasswordCheck
                                            valid={
                                                passwordChecks.length
                                            }
                                            label="Mínimo 8 caracteres"
                                        />
                                        <PasswordCheck
                                            valid={
                                                passwordChecks.uppercase
                                            }
                                            label="Una letra mayúscula"
                                        />
                                        <PasswordCheck
                                            valid={
                                                passwordChecks.lowercase
                                            }
                                            label="Una letra minúscula"
                                        />
                                        <PasswordCheck
                                            valid={
                                                passwordChecks.number
                                            }
                                            label="Al menos un número"
                                        />
                                        <PasswordCheck
                                            valid={
                                                passwordChecks.matches
                                            }
                                            label="Las contraseñas coinciden"
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="group h-12 w-full rounded-xl border-0 text-[15px] font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:brightness-105 disabled:translate-y-0 disabled:opacity-60"
                                    style={{
                                        backgroundColor:
                                            primaryColor,
                                        boxShadow:
                                            `0 12px 30px ${primaryColor}2e`,
                                    }}
                                    tabIndex={7}
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <>
                                            <LoaderCircle className="h-4 w-4 animate-spin" />
                                            Creando cuenta...
                                        </>
                                    ) : (
                                        <>
                                            Crear cuenta
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
                                        ¿Ya tienes una cuenta?
                                    </span>
                                </div>
                            </div>

                            <div className="text-center text-sm text-zinc-500 dark:text-zinc-400">
                                ¿Ya estás registrado?{' '}
                                <Link
                                    href={route('login')}
                                    tabIndex={8}
                                    className="font-semibold transition-opacity hover:opacity-75"
                                    style={{
                                        color: primaryColor,
                                    }}
                                >
                                    Iniciar sesión
                                </Link>
                            </div>

                            <div className="mt-8 flex items-center justify-center gap-2 text-[11px] text-zinc-400 dark:text-zinc-600">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                Tus credenciales se almacenan de forma segura
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}

const inputClass =
    'h-12 rounded-xl border-zinc-200 bg-white/80 pl-11 text-[15px] shadow-sm outline-none transition-all placeholder:text-zinc-400 focus-visible:ring-2 dark:border-white/10 dark:bg-white/[0.045] dark:placeholder:text-zinc-600';

function Field({
    id,
    label,
    optional = false,
    icon,
    error,
    children,
}: {
    id: string;
    label: string;
    optional?: boolean;
    icon: ReactNode;
    error?: string;
    children: ReactNode;
}) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
                <Label
                    htmlFor={id}
                    className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                    {label}
                </Label>

                {optional && (
                    <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-400 dark:text-zinc-600">
                        Opcional
                    </span>
                )}
            </div>

            <div className="group relative">
                <div className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-zinc-600 dark:group-focus-within:text-zinc-300">
                    {icon}
                </div>

                {children}
            </div>

            <InputError message={error} />
        </div>
    );
}

function PasswordInput({
    id,
    value,
    show,
    onToggle,
    onChange,
    disabled,
    tabIndex,
    placeholder,
    primaryColor,
}: {
    id: string;
    value: string;
    show: boolean;
    onToggle: () => void;
    onChange: (value: string) => void;
    disabled: boolean;
    tabIndex: number;
    placeholder: string;
    primaryColor: string;
}) {
    return (
        <>
            <Input
                id={id}
                type={show ? 'text' : 'password'}
                required
                tabIndex={tabIndex}
                autoComplete="new-password"
                value={value}
                onChange={(event) =>
                    onChange(event.target.value)
                }
                disabled={disabled}
                placeholder={placeholder}
                className={`${inputClass} pr-11`}
                style={
                    {
                        '--tw-ring-color':
                            `${primaryColor}35`,
                    } as CSSProperties
                }
            />

            <button
                type="button"
                tabIndex={-1}
                onClick={onToggle}
                className="absolute right-4 top-1/2 z-10 -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-700 dark:hover:text-zinc-200"
                aria-label={
                    show
                        ? 'Ocultar contraseña'
                        : 'Mostrar contraseña'
                }
            >
                {show ? (
                    <EyeOff className="h-[18px] w-[18px]" />
                ) : (
                    <Eye className="h-[18px] w-[18px]" />
                )}
            </button>
        </>
    );
}

function PasswordCheck({
    valid,
    label,
}: {
    valid: boolean;
    label: string;
}) {
    return (
        <div
            className={[
                'flex items-center gap-2 text-xs transition-colors',
                valid
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-zinc-400 dark:text-zinc-600',
            ].join(' ')}
        >
            <span
                className={[
                    'flex h-4 w-4 items-center justify-center rounded-full border',
                    valid
                        ? 'border-emerald-500/30 bg-emerald-500/10'
                        : 'border-zinc-300 dark:border-white/10',
                ].join(' ')}
            >
                {valid && (
                    <Check className="h-2.5 w-2.5" />
                )}
            </span>

            {label}
        </div>
    );
}

function Benefit({
    text,
    primaryColor,
}: {
    text: string;
    primaryColor: string;
}) {
    return (
        <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
            <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                style={{
                    color: primaryColor,
                    backgroundColor:
                        `${primaryColor}12`,
                }}
            >
                <Check className="h-3.5 w-3.5" />
            </span>

            {text}
        </div>
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
                    background:
                        `linear-gradient(135deg, ${primaryColor}, ${primaryColor}b8)`,
                    boxShadow:
                        `0 10px 25px ${primaryColor}35`,
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

function normalizeUsername(value: string): string {
    return value
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[^a-z0-9_-]/g, '');
}
