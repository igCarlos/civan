import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    AtSign,
    Check,
    CheckCircle2,
    CircleAlert,
    CircleUserRound,
    LoaderCircle,
    Mail,
    Phone,
    RefreshCw,
    Save,
    Shield,
    ShieldCheck,
    Sparkles,
    UserRoundPen,
    X,
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

export default function EditUser({
    user,
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

    const checkRequest =
        useRef<AbortController | null>(null);

    const initials = useMemo(
        () =>
            (form.data.name || user.name)
                .trim()
                .split(/\s+/)
                .slice(0, 2)
                .map((part) =>
                    part
                        .charAt(0)
                        .toUpperCase(),
                )
                .join(''),
        [
            form.data.name,
            user.name,
        ],
    );

    const hasChanges = useMemo(
        () => {
            const originalRoleIds =
                user.roles
                    .map((role) => role.id)
                    .sort((a, b) => a - b);

            const currentRoleIds = [
                ...form.data.role_ids,
            ].sort((a, b) => a - b);

            return (
                form.data.name !==
                    (user.name ?? '') ||
                form.data.username !==
                    (user.username ?? '') ||
                form.data.email !==
                    (user.email ?? '') ||
                form.data.phone !==
                    (user.phone ?? '') ||
                form.data.status !==
                    (user.status ?? 'active') ||
                JSON.stringify(
                    currentRoleIds,
                ) !==
                    JSON.stringify(
                        originalRoleIds,
                    )
            );
        },
        [
            form.data.name,
            form.data.username,
            form.data.email,
            form.data.phone,
            form.data.status,
            form.data.role_ids,
            user,
        ],
    );

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
        const validation =
            validateUsername(
                username,
            );

        if (!username) {
            setUsernameState(
                'idle',
            );
            setUsernameSuggestion(
                null,
            );

            return null;
        }

        if (!validation.valid) {
            setUsernameState(
                'invalid',
            );
            setUsernameSuggestion(
                null,
            );

            return null;
        }

        const normalized =
            username.trim();

        setUsernameState(
            'checking',
        );

        try {
            const params =
                new URLSearchParams({
                    username:
                        normalized,
                    ignore:
                        String(user.id),
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
        user.id,
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
                    'Escribe primero el nombre del usuario para poder generar un nombre de usuario.',
                );

                return;
            }

            form.clearErrors(
                'name',
            );

            setGeneratedUsername(
                true,
            );

            const controller =
                new AbortController();

            checkRequest.current?.abort();
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
                      `${base}_${Math.floor(
                          10 +
                              Math.random() *
                                  90,
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

    const submit = (
        event:
            FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        form.put(
            `/dashboard/usuarios/${user.id}`,
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
                title={`${t(
                    'users.edit.title',
                )} ${user.name}`}
            />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Encabezado */}
                <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                    <div className="relative p-5 sm:p-6">
                        <div className="pointer-events-none absolute -right-12 -top-20 size-56 rounded-full bg-primary/10 blur-3xl" />

                        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex min-w-0 items-center gap-4">
                                <Link
                                    href="/dashboard/usuarios"
                                    className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border bg-background transition hover:bg-muted"
                                    aria-label="Volver a usuarios"
                                >
                                    <ArrowLeft className="size-4" />
                                </Link>

                                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-lg font-bold text-primary ring-1 ring-primary/15">
                                    {initials || (
                                        <CircleUserRound className="size-6" />
                                    )}
                                </div>

                                <div className="min-w-0">
                                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                                        <h1 className="truncate text-2xl font-bold tracking-tight">
                                            {t(
                                                'users.edit.title',
                                            )}
                                        </h1>

                                        <UserStatusBadge
                                            status={
                                                form.data.status
                                            }
                                            t={t}
                                        />
                                    </div>

                                    <p className="max-w-2xl text-sm text-muted-foreground">
                                        {t(
                                            'users.edit.description',
                                        )}{' '}
                                        <span className="font-medium text-foreground">
                                            {user.name}
                                        </span>
                                        .
                                    </p>
                                </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-2 rounded-xl border bg-background/70 px-3 py-2 text-xs text-muted-foreground">
                                <ShieldCheck className="size-4 text-primary" />

                                ID #{user.id}
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
                                    <UserRoundPen className="size-5" />
                                }
                                title={t(
                                    'users.edit.information',
                                )}
                                description={t(
                                    'users.edit.information_description',
                                )}
                            />

                            <div className="grid gap-5 p-5 sm:p-6 md:grid-cols-2">
                                {/* Nombre */}
                                <Field
                                    label={`${t(
                                        'users.edit.name',
                                    )} *`}
                                    error={
                                        form.errors.name
                                    }
                                >
                                    <div className="relative">
                                        <CircleUserRound className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

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

                                {/* Email */}
                                <Field
                                    label={`${t(
                                        'users.edit.email',
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
                                                            'users.edit.username',
                                                        )}
                                                    </label>
                                                </div>

                                                <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                                                    Mínimo 6 caracteres. Debe incluir
                                                    al menos una mayúscula, una minúscula
                                                    y un número. Puede usar guiones y
                                                    guiones bajos. CIVAN comprobará
                                                    automáticamente si está disponible.
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
                                                            event.target.value,
                                                        ),
                                                    );
                                                }}
                                                disabled={
                                                    form.processing
                                                }
                                                className={`${inputClass} pr-36 font-mono`}
                                                placeholder="carlos_ivan"
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

                                {/* Teléfono */}
                                <Field
                                    label={t(
                                        'users.edit.phone',
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

                                {/* Estado */}
                                <Field
                                    label={t(
                                        'users.edit.status',
                                    )}
                                    error={
                                        form.errors.status
                                    }
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
                    </div>

                    {/* Columna derecha */}
                    <div className="space-y-6 xl:sticky xl:top-6">
                        {/* Roles */}
                        <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                            <SectionHeader
                                icon={
                                    <Shield className="size-5" />
                                }
                                title={t(
                                    'users.edit.roles',
                                )}
                                description={t(
                                    'users.edit.roles_description',
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
                                                'users.edit.no_role_permission',
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

                        {/* Resumen y guardar */}
                        <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                            <div className="p-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <ShieldCheck className="size-4" />
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold">
                                            Resumen de la cuenta
                                        </p>

                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            Revisa los cambios antes de guardar.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 space-y-3">
                                    <SummaryRow
                                        label="Usuario"
                                        value={
                                            form.data.username ||
                                            'Sin usuario'
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
                                </div>

                                <div className="mt-5 border-t pt-5">
                                    <button
                                        type="submit"
                                        disabled={
                                            form.processing ||
                                            !hasChanges ||
                                            usernameState ===
                                                'taken' ||
                                            usernameState ===
                                                'invalid' ||
                                            usernameState ===
                                                'checking'
                                        }
                                        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {form.processing ? (
                                            <LoaderCircle className="size-4 animate-spin" />
                                        ) : (
                                            <Save className="size-4" />
                                        )}

                                        {form.processing
                                            ? t(
                                                  'users.edit.saving',
                                              )
                                            : t(
                                                  'users.edit.submit',
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

                                    {!hasChanges && (
                                        <p className="mt-3 text-center text-[11px] text-muted-foreground">
                                            No hay cambios pendientes.
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
    title,
    description,
    aside,
}: {
    icon: ReactNode;
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
                        <h2 className="font-semibold">
                            {title}
                        </h2>

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
                <X className="size-3" />
                No disponible
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
                <p className="mb-2 text-xs font-semibold text-foreground">
                    Requisitos del nombre de usuario
                </p>

                <div className="grid gap-1.5 sm:grid-cols-2">
                    <UsernameRequirement
                        valid={checks.length}
                        text="Mínimo 6 caracteres"
                    />

                    <UsernameRequirement
                        valid={checks.uppercase}
                        text="Una letra mayúscula"
                    />

                    <UsernameRequirement
                        valid={checks.lowercase}
                        text="Una letra minúscula"
                    />

                    <UsernameRequirement
                        valid={checks.number}
                        text="Al menos un número"
                    />

                    <UsernameRequirement
                        valid={checks.characters}
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
                No se pudo comprobar la disponibilidad. Laravel volverá a validarla al guardar.
            </div>
        );
    }

    return null;
}

function UsernameRequirement({
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

function UserStatusBadge({
    status,
    t,
}: {
    status: string;
    t: (key: string) => string;
}) {
    const styles: Record<
        string,
        string
    > = {
        active:
            'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        pending:
            'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        suspended:
            'bg-destructive/10 text-destructive',
    };

    return (
        <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                styles[status] ??
                'bg-muted text-muted-foreground'
            }`}
        >
            {statusLabel(
                status,
                t,
            )}
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

    const number =
        cryptoRandomNumber(
            10,
            99,
        );

    return `${first}${second}${number}`.slice(
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
        value
            .charAt(0)
            .toUpperCase() +
        value
            .slice(1)
            .toLowerCase()
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
