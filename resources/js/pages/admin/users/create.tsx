import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    AtSign,
    Check,
    CheckCircle2,
    CircleAlert,
    Copy,
    Eye,
    EyeOff,
    KeyRound,
    LoaderCircle,
    Mail,
    Phone,
    RefreshCw,
    Save,
    Shield,
    ShieldCheck,
    Sparkles,
    UserPlus,
} from 'lucide-react';
import {
    type FormEvent,
    type ReactNode,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import { useTranslation } from '@/hooks/use-translation';
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

type UsernameState =
    | 'idle'
    | 'checking'
    | 'available'
    | 'taken'
    | 'invalid'
    | 'error';

interface UsernameCheckResponse {
    available: boolean;
    username: string;
    suggestion?: string | null;
}

export default function CreateUser({
    roles,
    can,
}: Props) {
    const { t } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('users.title'),
            href: '/dashboard/usuarios',
        },
        {
            title: t('users.create.title'),
            href: '/dashboard/usuarios/crear',
        },
    ];

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

    const [
        usernameState,
        setUsernameState,
    ] = useState<UsernameState>('idle');

    const [
        usernameSuggestion,
        setUsernameSuggestion,
    ] = useState<string | null>(null);

    const [
        generatedUsername,
        setGeneratedUsername,
    ] = useState(false);

    const [
        showPassword,
        setShowPassword,
    ] = useState(false);

    const [
        showPasswordConfirmation,
        setShowPasswordConfirmation,
    ] = useState(false);

    const [
        copied,
        setCopied,
    ] = useState(false);

    const checkRequest =
        useRef<AbortController | null>(null);

    const selectedRoles = useMemo(
        () =>
            roles.filter((role) =>
                form.data.role_ids.includes(
                    role.id,
                ),
            ),
        [
            roles,
            form.data.role_ids,
        ],
    );

    const passwordChecks = useMemo(
        () => ({
            length:
                form.data.password.length >= 8,
            uppercase:
                /[A-Z]/.test(
                    form.data.password,
                ),
            lowercase:
                /[a-z]/.test(
                    form.data.password,
                ),
            number:
                /\d/.test(
                    form.data.password,
                ),
            symbol:
                /[^A-Za-z0-9]/.test(
                    form.data.password,
                ),
            matches:
                form.data.password.length > 0 &&
                form.data.password ===
                    form.data.password_confirmation,
        }),
        [
            form.data.password,
            form.data.password_confirmation,
        ],
    );

    const passwordScore =
        Object.values(
            passwordChecks,
        ).filter(Boolean).length;

    const canSubmit =
        !form.processing &&
        usernameState !== 'taken' &&
        usernameState !== 'invalid' &&
        usernameState !== 'checking' &&
        passwordChecks.length &&
        passwordChecks.uppercase &&
        passwordChecks.lowercase &&
        passwordChecks.number &&
        passwordChecks.matches;

    const toggleRole = (
        roleId: number,
    ) => {
        if (
            form.data.role_ids.includes(
                roleId,
            )
        ) {
            form.setData(
                'role_ids',
                form.data.role_ids.filter(
                    (id) => id !== roleId,
                ),
            );

            return;
        }

        form.setData(
            'role_ids',
            [
                ...form.data.role_ids,
                roleId,
            ],
        );
    };

    const checkUsername = async (
        username: string,
        signal?: AbortSignal,
    ): Promise<UsernameCheckResponse | null> => {
        if (!username) {
            setUsernameState(
                'idle',
            );
            setUsernameSuggestion(
                null,
            );

            return null;
        }

        if (
            !validateUsername(
                username,
            ).valid
        ) {
            setUsernameState(
                'invalid',
            );
            setUsernameSuggestion(
                null,
            );

            return null;
        }

        setUsernameState(
            'checking',
        );

        try {
            const params =
                new URLSearchParams({
                    username,
                });

            const response =
                await fetch(
                    `/dashboard/usuarios/verificar-username?${params.toString()}`,
                    {
                        method: 'GET',
                        signal,
                        headers: {
                            Accept:
                                'application/json',
                            'X-Requested-With':
                                'XMLHttpRequest',
                        },
                    },
                );

            if (!response.ok) {
                throw new Error(
                    'No fue posible verificar el nombre de usuario.',
                );
            }

            const result =
                (await response.json()) as UsernameCheckResponse;

            setUsernameState(
                result.available
                    ? 'available'
                    : 'taken',
            );

            setUsernameSuggestion(
                result.suggestion ??
                    null,
            );

            return result;
        } catch (error) {
            if (
                error instanceof DOMException &&
                error.name ===
                    'AbortError'
            ) {
                return null;
            }

            setUsernameState(
                'error',
            );

            return null;
        }
    };

    useEffect(() => {
        const username =
            form.data.username.trim();

        checkRequest.current?.abort();

        if (!username) {
            setUsernameState(
                'idle',
            );
            setUsernameSuggestion(
                null,
            );

            return;
        }

        if (
            !validateUsername(
                username,
            ).valid
        ) {
            setUsernameState(
                'invalid',
            );
            setUsernameSuggestion(
                null,
            );

            return;
        }

        const controller =
            new AbortController();

        checkRequest.current =
            controller;

        const timer =
            window.setTimeout(
                () => {
                    void checkUsername(
                        username,
                        controller.signal,
                    );
                },
                450,
            );

        return () => {
            window.clearTimeout(
                timer,
            );

            controller.abort();
        };
    }, [
        form.data.username,
    ]);

    const generateUsername =
        async () => {
            const base =
                usernameFromName(
                    form.data.name,
                );

            if (!base) {
                form.setError(
                    'name',
                    'Escribe primero el nombre para generar un nombre de usuario.',
                );

                return;
            }

            form.clearErrors(
                'name',
            );

            setGeneratedUsername(
                true,
            );

            checkRequest.current?.abort();

            const controller =
                new AbortController();

            checkRequest.current =
                controller;

            const result =
                await checkUsername(
                    base,
                    controller.signal,
                );

            if (!result) {
                form.setData(
                    'username',
                    base,
                );

                return;
            }

            const candidate =
                result.available
                    ? result.username
                    : result.suggestion ??
                      `${base}_${cryptoRandomNumber(
                          2,
                          999,
                      )}`;

            form.setData(
                'username',
                candidate,
            );

            if (
                result.available ||
                result.suggestion
            ) {
                setUsernameState(
                    'available',
                );

                setUsernameSuggestion(
                    null,
                );
            }
        };

    const applySuggestion = () => {
        if (
            !usernameSuggestion
        ) {
            return;
        }

        setGeneratedUsername(
            true,
        );

        form.setData(
            'username',
            usernameSuggestion,
        );

        setUsernameSuggestion(
            null,
        );
    };

    const generatePassword =
        () => {
            const generated =
                createSecurePassword(
                    18,
                );

            form.setData(
                'password',
                generated,
            );

            form.setData(
                'password_confirmation',
                generated,
            );

            setShowPassword(
                true,
            );

            setShowPasswordConfirmation(
                true,
            );

            setCopied(
                false,
            );
        };

    const copyPassword =
        async () => {
            if (
                !form.data.password ||
                !navigator.clipboard
            ) {
                return;
            }

            await navigator.clipboard.writeText(
                form.data.password,
            );

            setCopied(
                true,
            );

            window.setTimeout(
                () =>
                    setCopied(
                        false,
                    ),
                1600,
            );
        };

    const submit = (
        event:
            FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        form.post(
            '/dashboard/usuarios',
            {
                preserveScroll:
                    true,
            },
        );
    };

    return (
        <AppLayout
            breadcrumbs={
                breadcrumbs
            }
        >
            <Head
                title={t(
                    'users.create.title',
                )}
            />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Encabezado */}
                <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                    <div className="relative p-5 sm:p-6">
                        <div className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-primary/10 blur-3xl" />
                        <div className="pointer-events-none absolute -bottom-20 left-1/3 size-44 rounded-full bg-primary/[0.05] blur-3xl" />

                        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex min-w-0 items-center gap-4">
                                <Link
                                    href="/dashboard/usuarios"
                                    className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border bg-background transition hover:bg-muted"
                                    aria-label="Volver a usuarios"
                                >
                                    <ArrowLeft className="size-4" />
                                </Link>

                                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                                    <UserPlus className="size-6" />
                                </div>

                                <div className="min-w-0">
                                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                                        <h1 className="text-2xl font-bold tracking-tight">
                                            {t(
                                                'users.create.title',
                                            )}
                                        </h1>

                                        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">
                                            Nueva cuenta
                                        </span>
                                    </div>

                                    <p className="max-w-2xl text-sm text-muted-foreground">
                                        {t(
                                            'users.create.description',
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-2 rounded-xl border bg-background/70 px-3 py-2 text-xs text-muted-foreground">
                                <ShieldCheck className="size-4 text-primary" />
                                Creación administrada
                            </div>
                        </div>
                    </div>
                </div>

                <form
                    onSubmit={submit}
                    className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]"
                >
                    {/* Columna principal */}
                    <div className="min-w-0 space-y-6">
                        {/* Información */}
                        <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                            <SectionHeader
                                icon={
                                    <UserPlus className="size-5" />
                                }
                                number="01"
                                title={t(
                                    'users.create.information',
                                )}
                                description={t(
                                    'users.create.information_description',
                                )}
                            />

                            <div className="grid gap-5 p-5 sm:p-6 md:grid-cols-2">
                                <Field
                                    label={`${t(
                                        'users.create.name',
                                    )} *`}
                                    error={
                                        form.errors.name
                                    }
                                >
                                    <div className="relative">
                                        <UserPlus className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                                        <input
                                            value={
                                                form.data.name
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                form.setData(
                                                    'name',
                                                    event
                                                        .target
                                                        .value,
                                                )
                                            }
                                            disabled={
                                                form.processing
                                            }
                                            className={inputClass}
                                            placeholder="Carlos Ivan"
                                            autoComplete="name"
                                        />
                                    </div>
                                </Field>

                                <Field
                                    label={`${t(
                                        'users.create.email',
                                    )} *`}
                                    error={
                                        form.errors.email
                                    }
                                >
                                    <div className="relative">
                                        <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                                        <input
                                            type="email"
                                            value={
                                                form.data.email
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                form.setData(
                                                    'email',
                                                    event
                                                        .target
                                                        .value,
                                                )
                                            }
                                            disabled={
                                                form.processing
                                            }
                                            className={inputClass}
                                            placeholder="usuario@ejemplo.com"
                                            autoComplete="email"
                                        />
                                    </div>
                                </Field>

                                {/* Username */}
                                <div className="md:col-span-2">
                                    <div className="rounded-2xl border border-primary/15 bg-primary/[0.025] p-4 sm:p-5">
                                        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <AtSign className="size-4 text-primary" />

                                                    <label
                                                        htmlFor="username"
                                                        className="text-sm font-semibold"
                                                    >
                                                        {t(
                                                            'users.create.username',
                                                        )}
                                                    </label>
                                                </div>

                                                <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                                                    Mínimo 6 caracteres, una
                                                    mayúscula, una minúscula y un
                                                    número. CIVAN verificará si está
                                                    disponible.
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={
                                                    generateUsername
                                                }
                                                disabled={
                                                    form.processing
                                                }
                                                className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-xl border bg-background px-3 text-xs font-semibold transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                <Sparkles className="size-3.5 text-primary" />
                                                Generar usuario
                                            </button>
                                        </div>

                                        <div className="relative">
                                            <AtSign className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                                            <input
                                                id="username"
                                                value={
                                                    form.data.username
                                                }
                                                onChange={(
                                                    event,
                                                ) => {
                                                    setGeneratedUsername(
                                                        false,
                                                    );

                                                    form.setData(
                                                        'username',
                                                        sanitizeUsername(
                                                            event
                                                                .target
                                                                .value,
                                                        ),
                                                    );
                                                }}
                                                disabled={
                                                    form.processing
                                                }
                                                className={`${inputClass} pr-36 font-mono`}
                                                placeholder="CarlosIvan24"
                                                autoComplete="username"
                                            />

                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <UsernameStatus
                                                    state={
                                                        usernameState
                                                    }
                                                />
                                            </div>
                                        </div>

                                        {form.errors.username && (
                                            <p className="mt-2 text-sm text-destructive">
                                                {
                                                    form.errors.username
                                                }
                                            </p>
                                        )}

                                        <UsernameFeedback
                                            state={
                                                usernameState
                                            }
                                            username={
                                                form.data.username
                                            }
                                            suggestion={
                                                usernameSuggestion
                                            }
                                            generated={
                                                generatedUsername
                                            }
                                            onSuggestion={
                                                applySuggestion
                                            }
                                        />
                                    </div>
                                </div>

                                <Field
                                    label={t(
                                        'users.create.phone',
                                    )}
                                    error={
                                        form.errors.phone
                                    }
                                >
                                    <div className="relative">
                                        <Phone className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                                        <input
                                            value={
                                                form.data.phone
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                form.setData(
                                                    'phone',
                                                    event
                                                        .target
                                                        .value,
                                                )
                                            }
                                            disabled={
                                                form.processing
                                            }
                                            className={inputClass}
                                            placeholder="+505 8888 8888"
                                            autoComplete="tel"
                                        />
                                    </div>
                                </Field>

                                <Field
                                    label={t(
                                        'users.create.status',
                                    )}
                                >
                                    <select
                                        value={
                                            form.data.status
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            form.setData(
                                                'status',
                                                event
                                                    .target
                                                    .value,
                                            )
                                        }
                                        disabled={
                                            form.processing
                                        }
                                        className="h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <option value="active">
                                            {t(
                                                'users.status.active',
                                            )}
                                        </option>

                                        <option value="pending">
                                            {t(
                                                'users.status.pending',
                                            )}
                                        </option>

                                        <option value="suspended">
                                            {t(
                                                'users.status.suspended',
                                            )}
                                        </option>
                                    </select>
                                </Field>
                            </div>
                        </section>

                        {/* Seguridad */}
                        <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                            <SectionHeader
                                icon={
                                    <KeyRound className="size-5" />
                                }
                                number="02"
                                title={t(
                                    'users.create.security',
                                )}
                                description={t(
                                    'users.create.security_description',
                                )}
                            />

                            <div className="space-y-5 p-5 sm:p-6">
                                <div className="rounded-2xl border border-primary/15 bg-primary/[0.025] p-4">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-start gap-3">
                                            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                <Sparkles className="size-4" />
                                            </div>

                                            <div>
                                                <p className="text-sm font-semibold">
                                                    Generador de contraseña
                                                </p>

                                                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                                    Genera una contraseña segura y la
                                                    coloca automáticamente en ambos
                                                    campos.
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={
                                                generatePassword
                                            }
                                            disabled={
                                                form.processing
                                            }
                                            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-xl border bg-background px-3 text-xs font-semibold transition hover:bg-muted"
                                        >
                                            <RefreshCw className="size-3.5" />
                                            Generar contraseña
                                        </button>
                                    </div>
                                </div>

                                <div className="grid gap-5 md:grid-cols-2">
                                    <Field
                                        label={`${t(
                                            'users.create.password',
                                        )} *`}
                                        error={
                                            form.errors.password
                                        }
                                    >
                                        <div className="relative">
                                            <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                                            <input
                                                type={
                                                    showPassword
                                                        ? 'text'
                                                        : 'password'
                                                }
                                                value={
                                                    form.data.password
                                                }
                                                onChange={(
                                                    event,
                                                ) => {
                                                    form.setData(
                                                        'password',
                                                        event
                                                            .target
                                                            .value,
                                                    );

                                                    setCopied(
                                                        false,
                                                    );
                                                }}
                                                disabled={
                                                    form.processing
                                                }
                                                className={`${inputClass} pr-20 font-mono`}
                                                autoComplete="new-password"
                                            />

                                            <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
                                                {form.data.password && (
                                                    <button
                                                        type="button"
                                                        onClick={
                                                            copyPassword
                                                        }
                                                        className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                                        aria-label="Copiar contraseña"
                                                    >
                                                        {copied ? (
                                                            <Check className="size-4" />
                                                        ) : (
                                                            <Copy className="size-4" />
                                                        )}
                                                    </button>
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowPassword(
                                                            (
                                                                value,
                                                            ) =>
                                                                !value,
                                                        )
                                                    }
                                                    className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                                    aria-label="Mostrar u ocultar contraseña"
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="size-4" />
                                                    ) : (
                                                        <Eye className="size-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </Field>

                                    <Field
                                        label={`${t(
                                            'users.create.password_confirmation',
                                        )} *`}
                                    >
                                        <div className="relative">
                                            <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                                            <input
                                                type={
                                                    showPasswordConfirmation
                                                        ? 'text'
                                                        : 'password'
                                                }
                                                value={
                                                    form.data
                                                        .password_confirmation
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    form.setData(
                                                        'password_confirmation',
                                                        event
                                                            .target
                                                            .value,
                                                    )
                                                }
                                                disabled={
                                                    form.processing
                                                }
                                                className={`${inputClass} pr-11 font-mono`}
                                                autoComplete="new-password"
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPasswordConfirmation(
                                                        (
                                                            value,
                                                        ) =>
                                                            !value,
                                                    )
                                                }
                                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                            >
                                                {showPasswordConfirmation ? (
                                                    <EyeOff className="size-4" />
                                                ) : (
                                                    <Eye className="size-4" />
                                                )}
                                            </button>
                                        </div>
                                    </Field>
                                </div>

                                {form.data.password && (
                                    <div className="rounded-2xl border bg-muted/20 p-4">
                                        <div className="mb-4 flex items-center justify-between gap-4">
                                            <div>
                                                <p className="text-sm font-semibold">
                                                    Seguridad de la contraseña
                                                </p>

                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    Verifica que la contraseña cumpla
                                                    los requisitos.
                                                </p>
                                            </div>

                                            <PasswordBadge
                                                score={
                                                    passwordScore
                                                }
                                            />
                                        </div>

                                        <div className="mb-4 grid grid-cols-6 gap-1.5">
                                            {Array.from({
                                                length: 6,
                                            }).map(
                                                (
                                                    _,
                                                    index,
                                                ) => (
                                                    <div
                                                        key={
                                                            index
                                                        }
                                                        className={[
                                                            'h-1.5 rounded-full transition-colors',
                                                            index <
                                                            passwordScore
                                                                ? passwordScore >=
                                                                  5
                                                                    ? 'bg-emerald-500'
                                                                    : passwordScore >=
                                                                        3
                                                                      ? 'bg-amber-500'
                                                                      : 'bg-destructive'
                                                                : 'bg-border',
                                                        ].join(
                                                            ' ',
                                                        )}
                                                    />
                                                ),
                                            )}
                                        </div>

                                        <div className="grid gap-2 sm:grid-cols-2">
                                            <Requirement
                                                valid={
                                                    passwordChecks.length
                                                }
                                                text="8 caracteres o más"
                                            />

                                            <Requirement
                                                valid={
                                                    passwordChecks.uppercase
                                                }
                                                text="Una letra mayúscula"
                                            />

                                            <Requirement
                                                valid={
                                                    passwordChecks.lowercase
                                                }
                                                text="Una letra minúscula"
                                            />

                                            <Requirement
                                                valid={
                                                    passwordChecks.number
                                                }
                                                text="Al menos un número"
                                            />

                                            <Requirement
                                                valid={
                                                    passwordChecks.symbol
                                                }
                                                text="Al menos un símbolo"
                                            />

                                            <Requirement
                                                valid={
                                                    passwordChecks.matches
                                                }
                                                text="Las contraseñas coinciden"
                                            />
                                        </div>
                                    </div>
                                )}

                                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition hover:bg-muted/30">
                                    <input
                                        type="checkbox"
                                        checked={
                                            form.data
                                                .must_change_password
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            form.setData(
                                                'must_change_password',
                                                event
                                                    .target
                                                    .checked,
                                            )
                                        }
                                        disabled={
                                            form.processing
                                        }
                                        className="mt-1 size-4 accent-primary"
                                    />

                                    <div>
                                        <p className="text-sm font-semibold">
                                            {t(
                                                'users.create.force_password_change',
                                            )}
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                            {t(
                                                'users.create.force_password_change_description',
                                            )}
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </section>
                    </div>

                    {/* Columna derecha */}
                    <div className="space-y-6 xl:sticky xl:top-6">
                        {/* Roles */}
                        <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                            <SectionHeader
                                icon={
                                    <Shield className="size-5" />
                                }
                                number="03"
                                title={t(
                                    'users.create.roles',
                                )}
                                description={t(
                                    'users.create.roles_description',
                                )}
                                aside={
                                    can.assignRoles
                                        ? `${form.data.role_ids.length} seleccionados`
                                        : undefined
                                }
                            />

                            <div className="space-y-2 p-4">
                                {can.assignRoles ? (
                                    roles.length > 0 ? (
                                        roles.map(
                                            (role) => {
                                                const selected =
                                                    form.data.role_ids.includes(
                                                        role.id,
                                                    );

                                                return (
                                                    <label
                                                        key={
                                                            role.id
                                                        }
                                                        className={[
                                                            'flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition',
                                                            selected
                                                                ? 'border-primary/40 bg-primary/[0.045] ring-1 ring-primary/10'
                                                                : 'hover:border-primary/20 hover:bg-muted/40',
                                                        ].join(
                                                            ' ',
                                                        )}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={
                                                                selected
                                                            }
                                                            onChange={() =>
                                                                toggleRole(
                                                                    role.id,
                                                                )
                                                            }
                                                            disabled={
                                                                form.processing
                                                            }
                                                            className="sr-only"
                                                        />

                                                        <span
                                                            className={[
                                                                'flex size-8 shrink-0 items-center justify-center rounded-lg border transition',
                                                                selected
                                                                    ? 'border-primary bg-primary text-primary-foreground'
                                                                    : 'bg-background text-muted-foreground',
                                                            ].join(
                                                                ' ',
                                                            )}
                                                        >
                                                            {selected ? (
                                                                <Check className="size-4" />
                                                            ) : (
                                                                <Shield className="size-3.5" />
                                                            )}
                                                        </span>

                                                        <div className="min-w-0 flex-1">
                                                            <p className="truncate text-sm font-medium capitalize">
                                                                {
                                                                    role.name
                                                                }
                                                            </p>

                                                            <p className="mt-0.5 text-[10px] text-muted-foreground">
                                                                ID #{role.id}
                                                            </p>
                                                        </div>
                                                    </label>
                                                );
                                            },
                                        )
                                    ) : (
                                        <p className="p-2 text-sm text-muted-foreground">
                                            No hay roles disponibles.
                                        </p>
                                    )
                                ) : (
                                    <div className="flex items-start gap-3 rounded-xl bg-muted/40 p-3">
                                        <Shield className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                                        <p className="text-sm text-muted-foreground">
                                            {t(
                                                'users.create.no_role_permission',
                                            )}
                                        </p>
                                    </div>
                                )}

                                {form.errors.role_ids && (
                                    <p className="text-sm text-destructive">
                                        {
                                            form.errors.role_ids
                                        }
                                    </p>
                                )}
                            </div>
                        </section>

                        {/* Resumen */}
                        <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                            <div className="p-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <ShieldCheck className="size-4" />
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold">
                                            Resumen del nuevo usuario
                                        </p>

                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            Revisa los datos antes de crear la cuenta.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 space-y-3">
                                    <SummaryRow
                                        label="Nombre"
                                        value={
                                            form.data.name ||
                                            'Sin definir'
                                        }
                                    />

                                    <SummaryRow
                                        label="Usuario"
                                        value={
                                            form.data.username ||
                                            'Sin definir'
                                        }
                                    />

                                    <SummaryRow
                                        label="Estado"
                                        value={
                                            statusLabel(
                                                form.data.status,
                                                t,
                                            )
                                        }
                                    />

                                    <SummaryRow
                                        label="Roles"
                                        value={
                                            selectedRoles.length
                                                ? selectedRoles
                                                      .map(
                                                          (
                                                              role,
                                                          ) =>
                                                              role.name,
                                                      )
                                                      .join(
                                                          ', ',
                                                      )
                                                : 'Sin rol'
                                        }
                                    />

                                    <SummaryRow
                                        label="Cambio de contraseña"
                                        value={
                                            form.data
                                                .must_change_password
                                                ? 'Obligatorio'
                                                : 'No obligatorio'
                                        }
                                    />
                                </div>

                                <div className="mt-5 border-t pt-5">
                                    <button
                                        type="submit"
                                        disabled={
                                            !canSubmit
                                        }
                                        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {form.processing ? (
                                            <LoaderCircle className="size-4 animate-spin" />
                                        ) : (
                                            <UserPlus className="size-4" />
                                        )}

                                        {form.processing
                                            ? t(
                                                  'users.create.creating',
                                              )
                                            : t(
                                                  'users.create.submit',
                                              )}
                                    </button>

                                    <Link
                                        href="/dashboard/usuarios"
                                        className="mt-2 inline-flex h-10 w-full items-center justify-center rounded-xl border text-sm font-medium transition hover:bg-muted"
                                    >
                                        {t(
                                            'common.cancel',
                                        )}
                                    </Link>

                                    {!canSubmit &&
                                        !form.processing && (
                                            <p className="mt-3 text-center text-[11px] leading-4 text-muted-foreground">
                                                Completa los datos de seguridad y
                                                verifica el nombre de usuario para
                                                habilitar la creación.
                                            </p>
                                        )}
                                </div>
                            </div>
                        </section>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

const inputClass =
    'h-11 w-full rounded-xl border bg-background pl-10 pr-3 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-primary/50 focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60';

function SectionHeader({
    icon,
    number,
    title,
    description,
    aside,
}: {
    icon: ReactNode;
    number: string;
    title: string;
    description: string;
    aside?: string;
}) {
    return (
        <div className="border-b bg-muted/15 p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-background text-primary shadow-sm">
                        {icon}
                    </div>

                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-bold text-primary">
                                {number}
                            </span>

                            <h2 className="font-semibold">
                                {title}
                            </h2>
                        </div>

                        <p className="mt-1 text-sm text-muted-foreground">
                            {description}
                        </p>
                    </div>
                </div>

                {aside && (
                    <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">
                        {aside}
                    </span>
                )}
            </div>
        </div>
    );
}

function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: ReactNode;
}) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium">
                {label}
            </label>

            {children}

            {error && (
                <p className="text-sm text-destructive">
                    {error}
                </p>
            )}
        </div>
    );
}

function UsernameStatus({
    state,
}: {
    state: UsernameState;
}) {
    if (state === 'checking') {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2 py-1 text-[10px] font-semibold text-muted-foreground">
                <LoaderCircle className="size-3 animate-spin" />
                Verificando
            </span>
        );
    }

    if (state === 'available') {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-3" />
                Disponible
            </span>
        );
    }

    if (
        state === 'taken' ||
        state === 'invalid'
    ) {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2 py-1 text-[10px] font-semibold text-destructive">
                <CircleAlert className="size-3" />
                Revisar
            </span>
        );
    }

    return null;
}

function UsernameFeedback({
    state,
    username,
    suggestion,
    generated,
    onSuggestion,
}: {
    state: UsernameState;
    username: string;
    suggestion: string | null;
    generated: boolean;
    onSuggestion: () => void;
}) {
    if (!username) {
        return (
            <p className="mt-2 text-xs text-muted-foreground">
                El nombre de usuario es opcional.
            </p>
        );
    }

    if (state === 'available') {
        return (
            <div className="mt-2 flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-3.5" />

                {generated
                    ? `“${username}” fue generado y está disponible.`
                    : `“${username}” está disponible.`}
            </div>
        );
    }

    if (state === 'taken') {
        return (
            <div className="mt-2 rounded-xl border border-destructive/15 bg-destructive/[0.035] p-3">
                <div className="flex items-start gap-2 text-xs text-destructive">
                    <CircleAlert className="mt-0.5 size-3.5 shrink-0" />

                    <span>
                        “{username}” ya está siendo utilizado por otra cuenta.
                    </span>
                </div>

                {suggestion && (
                    <button
                        type="button"
                        onClick={
                            onSuggestion
                        }
                        className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary transition hover:opacity-75"
                    >
                        <RefreshCw className="size-3.5" />
                        Usar sugerencia: @{suggestion}
                    </button>
                )}
            </div>
        );
    }

    if (state === 'invalid') {
        const checks =
            getUsernameChecks(
                username,
            );

        return (
            <div className="mt-3 rounded-xl border bg-background/60 p-3">
                <p className="mb-2 text-xs font-semibold">
                    Requisitos del nombre de usuario
                </p>

                <div className="grid gap-1.5 sm:grid-cols-2">
                    <Requirement
                        valid={
                            checks.length
                        }
                        text="Mínimo 6 caracteres"
                    />

                    <Requirement
                        valid={
                            checks.uppercase
                        }
                        text="Una letra mayúscula"
                    />

                    <Requirement
                        valid={
                            checks.lowercase
                        }
                        text="Una letra minúscula"
                    />

                    <Requirement
                        valid={
                            checks.number
                        }
                        text="Al menos un número"
                    />

                    <Requirement
                        valid={
                            checks.characters
                        }
                        text="Solo letras, números, - y _"
                    />
                </div>
            </div>
        );
    }

    if (state === 'error') {
        return (
            <div className="mt-2 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                <CircleAlert className="size-3.5" />
                No se pudo comprobar la disponibilidad. Laravel volverá a validarla al crear.
            </div>
        );
    }

    return null;
}

function Requirement({
    valid,
    text,
}: {
    valid: boolean;
    text: string;
}) {
    return (
        <div
            className={[
                'flex items-center gap-2 text-[11px]',
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
                {valid && (
                    <Check className="size-2.5" />
                )}
            </span>

            {text}
        </div>
    );
}

function PasswordBadge({
    score,
}: {
    score: number;
}) {
    if (score >= 5) {
        return (
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                Segura
            </span>
        );
    }

    if (score >= 3) {
        return (
            <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                Media
            </span>
        );
    }

    return (
        <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-[10px] font-semibold text-destructive">
            Débil
        </span>
    );
}

function SummaryRow({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-start justify-between gap-4 text-xs">
            <span className="shrink-0 text-muted-foreground">
                {label}
            </span>

            <span className="min-w-0 break-words text-right font-medium capitalize text-foreground">
                {value}
            </span>
        </div>
    );
}

function statusLabel(
    status: string,
    t: (key: string) => string,
): string {
    if (status === 'active') {
        return t(
            'users.status.active',
        );
    }

    if (status === 'pending') {
        return t(
            'users.status.pending',
        );
    }

    if (status === 'suspended') {
        return t(
            'users.status.suspended',
        );
    }

    return status;
}

function sanitizeUsername(
    value: string,
): string {
    return value
        .normalize('NFD')
        .replace(
            /[\u0300-\u036f]/g,
            '',
        )
        .replace(/\s+/g, '_')
        .replace(
            /[^A-Za-z0-9_-]/g,
            '',
        )
        .replace(/_+/g, '_')
        .replace(/^[_-]+/g, '')
        .slice(0, 100);
}

function getUsernameChecks(
    username: string,
) {
    return {
        length:
            username.length >= 6,

        uppercase:
            /[A-Z]/.test(
                username,
            ),

        lowercase:
            /[a-z]/.test(
                username,
            ),

        number:
            /\d/.test(
                username,
            ),

        characters:
            /^[A-Za-z0-9_-]+$/.test(
                username,
            ),
    };
}

function validateUsername(
    username: string,
): {
    valid: boolean;
} {
    const checks =
        getUsernameChecks(
            username,
        );

    return {
        valid:
            checks.length &&
            checks.uppercase &&
            checks.lowercase &&
            checks.number &&
            checks.characters,
    };
}

function usernameFromName(
    name: string,
): string {
    const parts = name
        .normalize('NFD')
        .replace(
            /[\u0300-\u036f]/g,
            '',
        )
        .trim()
        .split(/\s+/)
        .map((part) =>
            part.replace(
                /[^A-Za-z0-9]/g,
                '',
            ),
        )
        .filter(Boolean);

    if (!parts.length) {
        return '';
    }

    const first =
        capitalizeUsernamePart(
            parts[0],
        );

    const second =
        parts.length > 1
            ? capitalizeUsernamePart(
                  parts[1],
              )
            : 'User';

    return `${first}${second}${cryptoRandomNumber(
        10,
        99,
    )}`.slice(
        0,
        100,
    );
}

function capitalizeUsernamePart(
    value: string,
): string {
    if (!value) {
        return '';
    }

    return (
        value.charAt(0).toUpperCase() +
        value.slice(1).toLowerCase()
    );
}

function cryptoRandomNumber(
    min: number,
    max: number,
): number {
    const range =
        max - min + 1;

    const values =
        new Uint32Array(1);

    crypto.getRandomValues(
        values,
    );

    return (
        min +
        (values[0] % range)
    );
}

function createSecurePassword(
    length = 18,
): string {
    const uppercase =
        'ABCDEFGHJKLMNPQRSTUVWXYZ';

    const lowercase =
        'abcdefghijkmnopqrstuvwxyz';

    const numbers =
        '23456789';

    const symbols =
        '!@#$%&*+-_=.?';

    const all =
        uppercase +
        lowercase +
        numbers +
        symbols;

    const password = [
        randomCharacter(
            uppercase,
        ),
        randomCharacter(
            lowercase,
        ),
        randomCharacter(
            numbers,
        ),
        randomCharacter(
            symbols,
        ),
    ];

    while (
        password.length < length
    ) {
        password.push(
            randomCharacter(
                all,
            ),
        );
    }

    return secureShuffle(
        password,
    ).join('');
}

function randomCharacter(
    characters: string,
): string {
    const values =
        new Uint32Array(1);

    crypto.getRandomValues(
        values,
    );

    return characters[
        values[0] %
            characters.length
    ];
}

function secureShuffle(
    values: string[],
): string[] {
    const result = [
        ...values,
    ];

    for (
        let index =
            result.length - 1;
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
