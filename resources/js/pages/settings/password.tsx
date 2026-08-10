import InputError from '@/components/input-error';
import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
import {
    Check,
    CheckCircle2,
    Copy,
    Eye,
    EyeOff,
    KeyRound,
    LoaderCircle,
    RefreshCw,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';
import {
    type FormEventHandler,
    useMemo,
    useRef,
    useState,
} from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Seguridad',
        href: '/settings/password',
    },
];

export default function Password() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] =
        useState(false);
    const [copied, setCopied] = useState(false);

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const passwordChecks = useMemo(
        () => ({
            length: data.password.length >= 12,
            uppercase: /[A-Z]/.test(data.password),
            lowercase: /[a-z]/.test(data.password),
            number: /\d/.test(data.password),
            symbol: /[^A-Za-z0-9]/.test(data.password),
            matches:
                data.password.length > 0 &&
                data.password === data.password_confirmation,
        }),
        [data.password, data.password_confirmation],
    );

    const securityScore = Object.values(passwordChecks).filter(Boolean).length;

    const updatePassword: FormEventHandler = (event) => {
        event.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,

            onSuccess: () => {
                reset();
                setCopied(false);
                setShowCurrentPassword(false);
                setShowPassword(false);
                setShowPasswordConfirmation(false);
            },

            onError: (formErrors) => {
                if (formErrors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (formErrors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    const generatePassword = () => {
        const generated = createSecurePassword(18);

        setData('password', generated);
        setData('password_confirmation', generated);

        setShowPassword(true);
        setShowPasswordConfirmation(true);
        setCopied(false);

        requestAnimationFrame(() => {
            passwordInput.current?.focus();
        });
    };

    const copyGeneratedPassword = async () => {
        if (!data.password || !navigator.clipboard) {
            return;
        }

        await navigator.clipboard.writeText(data.password);

        setCopied(true);

        window.setTimeout(() => {
            setCopied(false);
        }, 1800);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Seguridad de la cuenta" />

            <SettingsLayout>
                <div className="mx-auto w-full max-w-3xl space-y-6">
                    <HeadingSmall
                        title="Contraseña y seguridad"
                        description="Actualiza la contraseña de tu cuenta o genera una nueva contraseña segura."
                    />

                    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
                        {/* Encabezado */}
                        <div className="border-b border-border/70 bg-muted/20 px-5 py-5 sm:px-6">
                            <div className="flex items-start gap-4">
                                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <ShieldCheck className="size-5" />
                                </div>

                                <div className="min-w-0">
                                    <h2 className="text-base font-semibold text-foreground">
                                        Cambiar contraseña
                                    </h2>

                                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                        Utiliza una contraseña única y difícil de
                                        adivinar. Puedes escribirla manualmente o
                                        dejar que CIVAN genere una por ti.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <form
                            onSubmit={updatePassword}
                            className="space-y-6 p-5 sm:p-6"
                        >
                            {/* Contraseña actual */}
                            <div className="space-y-2">
                                <Label htmlFor="current_password">
                                    Contraseña actual
                                </Label>

                                <div className="relative">
                                    <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                                    <Input
                                        id="current_password"
                                        ref={currentPasswordInput}
                                        value={data.current_password}
                                        onChange={(event) =>
                                            setData(
                                                'current_password',
                                                event.target.value,
                                            )
                                        }
                                        type={
                                            showCurrentPassword
                                                ? 'text'
                                                : 'password'
                                        }
                                        className="h-11 rounded-xl pl-10 pr-11"
                                        autoComplete="current-password"
                                        placeholder="Ingresa tu contraseña actual"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowCurrentPassword(
                                                (value) => !value,
                                            )
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                        aria-label={
                                            showCurrentPassword
                                                ? 'Ocultar contraseña actual'
                                                : 'Mostrar contraseña actual'
                                        }
                                    >
                                        {showCurrentPassword ? (
                                            <EyeOff className="size-4" />
                                        ) : (
                                            <Eye className="size-4" />
                                        )}
                                    </button>
                                </div>

                                <InputError
                                    message={errors.current_password}
                                />
                            </div>

                            <div className="h-px bg-border/70" />

                            {/* Generador */}
                            <div className="rounded-2xl border border-primary/15 bg-primary/[0.035] p-4 sm:p-5">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                            <Sparkles className="size-4" />
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-semibold text-foreground">
                                                Generador de contraseña
                                            </h3>

                                            <p className="mt-1 max-w-xl text-xs leading-5 text-muted-foreground">
                                                Genera una contraseña aleatoria de 18
                                                caracteres con mayúsculas, minúsculas,
                                                números y símbolos.
                                            </p>
                                        </div>
                                    </div>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="shrink-0 rounded-xl"
                                        onClick={generatePassword}
                                    >
                                        <RefreshCw className="size-4" />
                                        Generar contraseña
                                    </Button>
                                </div>
                            </div>

                            {/* Nueva contraseña */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between gap-3">
                                    <Label htmlFor="password">
                                        Nueva contraseña
                                    </Label>

                                    {data.password && (
                                        <button
                                            type="button"
                                            onClick={copyGeneratedPassword}
                                            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary transition hover:opacity-75"
                                        >
                                            {copied ? (
                                                <>
                                                    <Check className="size-3.5" />
                                                    Copiada
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="size-3.5" />
                                                    Copiar
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>

                                <div className="relative">
                                    <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                                    <Input
                                        id="password"
                                        ref={passwordInput}
                                        value={data.password}
                                        onChange={(event) => {
                                            setData(
                                                'password',
                                                event.target.value,
                                            );
                                            setCopied(false);
                                        }}
                                        type={showPassword ? 'text' : 'password'}
                                        className="h-11 rounded-xl pl-10 pr-11 font-mono"
                                        autoComplete="new-password"
                                        placeholder="Escribe o genera una contraseña"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword((value) => !value)
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                        aria-label={
                                            showPassword
                                                ? 'Ocultar nueva contraseña'
                                                : 'Mostrar nueva contraseña'
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeOff className="size-4" />
                                        ) : (
                                            <Eye className="size-4" />
                                        )}
                                    </button>
                                </div>

                                <InputError message={errors.password} />
                            </div>

                            {/* Confirmación */}
                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation">
                                    Confirmar nueva contraseña
                                </Label>

                                <div className="relative">
                                    <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                                    <Input
                                        id="password_confirmation"
                                        value={data.password_confirmation}
                                        onChange={(event) =>
                                            setData(
                                                'password_confirmation',
                                                event.target.value,
                                            )
                                        }
                                        type={
                                            showPasswordConfirmation
                                                ? 'text'
                                                : 'password'
                                        }
                                        className="h-11 rounded-xl pl-10 pr-11 font-mono"
                                        autoComplete="new-password"
                                        placeholder="Repite la nueva contraseña"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPasswordConfirmation(
                                                (value) => !value,
                                            )
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                        aria-label={
                                            showPasswordConfirmation
                                                ? 'Ocultar confirmación'
                                                : 'Mostrar confirmación'
                                        }
                                    >
                                        {showPasswordConfirmation ? (
                                            <EyeOff className="size-4" />
                                        ) : (
                                            <Eye className="size-4" />
                                        )}
                                    </button>
                                </div>

                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            {/* Indicador de seguridad */}
                            {data.password && (
                                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                                    <div className="mb-4 flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">
                                                Seguridad de la contraseña
                                            </p>

                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Cumple los siguientes requisitos antes
                                                de guardar.
                                            </p>
                                        </div>

                                        <SecurityBadge score={securityScore} />
                                    </div>

                                    <div className="mb-4 grid grid-cols-6 gap-1.5">
                                        {Array.from({ length: 6 }).map(
                                            (_, index) => (
                                                <div
                                                    key={index}
                                                    className={[
                                                        'h-1.5 rounded-full transition-colors',
                                                        index < securityScore
                                                            ? securityScore >= 5
                                                                ? 'bg-emerald-500'
                                                                : securityScore >= 3
                                                                  ? 'bg-amber-500'
                                                                  : 'bg-destructive'
                                                            : 'bg-border',
                                                    ].join(' ')}
                                                />
                                            ),
                                        )}
                                    </div>

                                    <div className="grid gap-2 sm:grid-cols-2">
                                        <PasswordRequirement
                                            valid={passwordChecks.length}
                                            text="12 caracteres o más"
                                        />
                                        <PasswordRequirement
                                            valid={passwordChecks.uppercase}
                                            text="Una letra mayúscula"
                                        />
                                        <PasswordRequirement
                                            valid={passwordChecks.lowercase}
                                            text="Una letra minúscula"
                                        />
                                        <PasswordRequirement
                                            valid={passwordChecks.number}
                                            text="Al menos un número"
                                        />
                                        <PasswordRequirement
                                            valid={passwordChecks.symbol}
                                            text="Al menos un símbolo"
                                        />
                                        <PasswordRequirement
                                            valid={passwordChecks.matches}
                                            text="Las contraseñas coinciden"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Acciones */}
                            <div className="flex flex-col gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="h-10 rounded-xl px-5"
                                >
                                    {processing ? (
                                        <>
                                            <LoaderCircle className="size-4 animate-spin" />
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <ShieldCheck className="size-4" />
                                            Guardar contraseña
                                        </>
                                    )}
                                </Button>

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
                                        Contraseña actualizada correctamente
                                    </div>
                                </Transition>
                            </div>
                        </form>
                    </div>

                    {/* Recomendación */}
                    <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
                        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />

                        <p className="leading-6">
                            Evita reutilizar esta contraseña en otros servicios.
                            Si utilizas el generador de CIVAN, guárdala en un gestor
                            de contraseñas antes de salir de esta página.
                        </p>
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}

function PasswordRequirement({
    valid,
    text,
}: {
    valid: boolean;
    text: string;
}) {
    return (
        <div
            className={[
                'flex items-center gap-2 text-xs transition-colors',
                valid
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-muted-foreground',
            ].join(' ')}
        >
            <span
                className={[
                    'flex size-4 shrink-0 items-center justify-center rounded-full border',
                    valid
                        ? 'border-emerald-500/30 bg-emerald-500/10'
                        : 'border-border bg-background',
                ].join(' ')}
            >
                {valid && <Check className="size-2.5" />}
            </span>

            {text}
        </div>
    );
}

function SecurityBadge({
    score,
}: {
    score: number;
}) {
    if (score >= 5) {
        return (
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                Segura
            </span>
        );
    }

    if (score >= 3) {
        return (
            <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                Media
            </span>
        );
    }

    return (
        <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-[11px] font-semibold text-destructive">
            Débil
        </span>
    );
}

function createSecurePassword(length = 18): string {
    const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lowercase = 'abcdefghijkmnopqrstuvwxyz';
    const numbers = '23456789';
    const symbols = '!@#$%&*+-_=.?';

    const all =
        uppercase +
        lowercase +
        numbers +
        symbols;

    const password = [
        randomCharacter(uppercase),
        randomCharacter(lowercase),
        randomCharacter(numbers),
        randomCharacter(symbols),
    ];

    while (password.length < length) {
        password.push(
            randomCharacter(all),
        );
    }

    return secureShuffle(password).join('');
}

function randomCharacter(characters: string): string {
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);

    return characters[
        values[0] % characters.length
    ];
}

function secureShuffle(values: string[]): string[] {
    const result = [...values];

    for (
        let index = result.length - 1;
        index > 0;
        index--
    ) {
        const randomValue =
            new Uint32Array(1);

        crypto.getRandomValues(
            randomValue,
        );

        const target =
            randomValue[0] %
            (index + 1);

        [
            result[index],
            result[target],
        ] = [
            result[target],
            result[index],
        ];
    }

    return result;
}
