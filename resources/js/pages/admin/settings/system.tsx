import {
    Head,
    useForm,
} from '@inertiajs/react';

import {
    CalendarDays,
    Check,
    Clock3,
    CreditCard,
    Globe2,
    Languages,
    ImageIcon,
    LayoutDashboard,
    Palette,
    PanelLeft,
    RotateCcw,
    Sparkles,
    Save,
    Upload,
    X,
    Settings,
    TextCursorInput,
} from 'lucide-react';

import {
    FormEvent,
    useEffect,
    useState,
} from 'react';

import {
    useTranslation,
} from '@/hooks/use-translation';

import AppLayout from '@/layouts/app-layout';

import {
    applySystemAppearance,
    normalizeHexColor,
} from '@/lib/system-theme';

import {
    type BreadcrumbItem,
} from '@/types';

interface SystemSettings {
    panel_name: string;
    short_name: string;
    logo_light: string | null;
    logo_dark: string | null;
    favicon: string | null;
    logo_size: number;
    primary_color: string;
    sidebar_color: string;
    sidebar_shape: 'normal' | 'rounded';
    background_color_mode: 'auto' | 'custom';
    background_color: string;
    card_color_mode: 'auto' | 'custom';
    card_color: string;
    card_style: 'solid' | 'glass';
    timezone: string;
    locale: string;
    date_format: string;
    time_format: string;
    per_page: number;
}

interface SelectOption {
    value: string;
    label: string;
}

interface Options {
    timezones: string[];
    locales: SelectOption[];
    date_formats: SelectOption[];
    time_formats: SelectOption[];
    per_page_options: number[];
}

interface Props {
    settings: SystemSettings;
    options: Options;

    can: {
        update: boolean;
    };
}

const COLOR_PRESETS = [
    {
        value: '#18181B',
        key: 'settings.color.civan',
    },
    {
        value: '#2563EB',
        key: 'settings.color.blue',
    },
    {
        value: '#7C3AED',
        key: 'settings.color.violet',
    },
    {
        value: '#059669',
        key: 'settings.color.green',
    },
    {
        value: '#EA580C',
        key: 'settings.color.orange',
    },
    {
        value: '#E11D48',
        key: 'settings.color.rose',
    },
] as const;


const SIDEBAR_PRESETS = [
    {
        value: '#FAFAFA',
        key: 'settings.sidebar.light',
    },
    {
        value: '#F4F4F5',
        key: 'settings.sidebar.soft',
    },
    {
        value: '#18181B',
        key: 'settings.sidebar.dark',
    },
    {
        value: '#111827',
        key: 'settings.sidebar.slate',
    },
] as const;



const BACKGROUND_PRESETS = [
    {
        value: '#FFFFFF',
        key: 'settings.background.white',
    },
    {
        value: '#F8FAFC',
        key: 'settings.background.soft',
    },
    {
        value: '#F4F4F5',
        key: 'settings.background.gray',
    },
    {
        value: '#0F172A',
        key: 'settings.background.navy',
    },
    {
        value: '#111827',
        key: 'settings.background.slate',
    },
] as const;

const CARD_PRESETS = [
    {
        value: '#FFFFFF',
        key: 'settings.card.white',
    },
    {
        value: '#F4F4F5',
        key: 'settings.card.soft',
    },
    {
        value: '#18181B',
        key: 'settings.card.dark',
    },
    {
        value: '#EFF6FF',
        key: 'settings.card.blue_soft',
    },
    {
        value: '#F5F3FF',
        key: 'settings.card.violet_soft',
    },
] as const;


function useObjectUrl(
    file: File | null,
): string | null {
    const [
        url,
        setUrl,
    ] = useState<string | null>(
        null,
    );

    useEffect(() => {
        if (!file) {
            setUrl(
                null,
            );

            return;
        }

        const nextUrl =
            URL.createObjectURL(
                file,
            );

        setUrl(
            nextUrl,
        );

        return () => {
            URL.revokeObjectURL(
                nextUrl,
            );
        };
    }, [
        file,
    ]);

    return url;
}

export default function SystemSettingsPage({
    settings,
    options,
    can,
}: Props) {
    const {
        t,
    } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t(
                'nav.configuration',
            ),
            href: '/dashboard/configuracion/sistema',
        },
        {
            title: t(
                'nav.system',
            ),
            href: '/dashboard/configuracion/sistema',
        },
    ];

    const form =
        useForm({
            panel_name:
                settings.panel_name,

            short_name:
                settings.short_name,

            /*
            |--------------------------------------------------------------------------
            | Archivos de branding
            |--------------------------------------------------------------------------
            */

            logo_light:
                null as File | null,

            logo_dark:
                null as File | null,

            favicon:
                null as File | null,

            remove_logo_light:
                false,

            remove_logo_dark:
                false,

            remove_favicon:
                false,

            logo_size:
                Number(
                    settings.logo_size ??
                    75,
                ),

            /*
            |--------------------------------------------------------------------------
            | Apariencia
            |--------------------------------------------------------------------------
            */

            primary_color:
                normalizeHexColor(
                    settings.primary_color,
                ),

            sidebar_color:
                normalizeHexColor(
                    settings.sidebar_color,
                    '#FAFAFA',
                ),

            sidebar_shape:
                settings.sidebar_shape,

            background_color_mode:
                settings.background_color_mode,

            background_color:
                normalizeHexColor(
                    settings.background_color,
                    '#FFFFFF',
                ),

            card_color_mode:
                settings.card_color_mode,

            card_color:
                normalizeHexColor(
                    settings.card_color,
                    '#FFFFFF',
                ),

            card_style:
                settings.card_style,

            timezone:
                settings.timezone,

            locale:
                settings.locale,

            date_format:
                settings.date_format,

            time_format:
                settings.time_format,

            per_page:
                settings.per_page,
        });


    const logoLightObjectUrl =
        useObjectUrl(
            form.data.logo_light,
        );

    const logoDarkObjectUrl =
        useObjectUrl(
            form.data.logo_dark,
        );

    const faviconObjectUrl =
        useObjectUrl(
            form.data.favicon,
        );

    const logoLightPreview =
        logoLightObjectUrl ??
        (
            form.data.remove_logo_light
                ? null
                : settings.logo_light
        );

    const logoDarkPreview =
        logoDarkObjectUrl ??
        (
            form.data.remove_logo_dark
                ? null
                : settings.logo_dark
        );

    const faviconPreview =
        faviconObjectUrl ??
        (
            form.data.remove_favicon
                ? null
                : settings.favicon
        );

    /*
    |--------------------------------------------------------------------------
    | Vista previa global en tiempo real
    |--------------------------------------------------------------------------
    |
    | Al elegir un color, el panel completo cambia antes de guardar.
    | Al navegar a otra página, app.tsx vuelve a aplicar el valor guardado
    | que llega desde system_settings.
    |
    */

    useEffect(() => {
        const primaryValid =
            /^#[0-9A-Fa-f]{6}$/.test(
                form.data.primary_color,
            );

        const sidebarValid =
            /^#[0-9A-Fa-f]{6}$/.test(
                form.data.sidebar_color,
            );

        if (
            primaryValid &&
            sidebarValid
        ) {
            applySystemAppearance({
                primary_color:
                    form.data.primary_color,

                sidebar_color:
                    form.data.sidebar_color,

                sidebar_shape:
                    form.data.sidebar_shape,

                background_color_mode:
                    form.data.background_color_mode,

                background_color:
                    form.data.background_color,

                card_color_mode:
                    form.data.card_color_mode,

                card_color:
                    form.data.card_color,

                card_style:
                    form.data.card_style,
            });
        }
    }, [
        form.data.primary_color,
        form.data.sidebar_color,
        form.data.sidebar_shape,
        form.data.background_color_mode,
        form.data.background_color,
        form.data.card_color_mode,
        form.data.card_color,
        form.data.card_style,
    ]);

    const changePrimaryColor = (
        value: string,
    ) => {
        const normalized =
            normalizeHexColor(
                value,
                form.data.primary_color,
            );

        form.setData(
            'primary_color',
            normalized,
        );
    };

    const submit = (
        event:
            FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        form.post(
            '/dashboard/configuracion/sistema',
            {
                preserveScroll:
                    true,

                preserveState:
                    true,

                forceFormData:
                    true,

                onSuccess:
                    () => {
                        /*
                        |--------------------------------------------------------------------------
                        | Limpiar únicamente archivos temporales
                        |--------------------------------------------------------------------------
                        |
                        | Los valores reales vuelven desde Laravel mediante Inertia.
                        |
                        */

                        form.setData(
                            'logo_light',
                            null,
                        );

                        form.setData(
                            'logo_dark',
                            null,
                        );

                        form.setData(
                            'favicon',
                            null,
                        );

                        form.setData(
                            'remove_logo_light',
                            false,
                        );

                        form.setData(
                            'remove_logo_dark',
                            false,
                        );

                        form.setData(
                            'remove_favicon',
                            false,
                        );
                    },

                onError:
                    (errors) => {
                        console.error(
                            'Error al guardar la configuración de CIVAN:',
                            errors,
                        );
                    },
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
                    'settings.title',
                )}
            />

            <div className="flex w-full min-w-0 flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex min-w-0 items-start gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-card">
                        <Settings className="size-5" />
                    </div>

                    <div className="min-w-0">
                        <h1 className="text-2xl font-bold tracking-tight">
                            {t(
                                'settings.title',
                            )}
                        </h1>

                        <p className="mt-1 text-sm text-muted-foreground">
                            {t(
                                'settings.description',
                            )}
                        </p>
                    </div>
                </div>

                {Object.keys(
                    form.errors,
                ).length > 0 && (
                    <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4">
                        <p className="font-medium text-destructive">
                            {t(
                                'settings.save_error_title',
                            )}
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                            {t(
                                'settings.save_error_description',
                            )}
                        </p>

                        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-destructive">
                            {Object.entries(
                                form.errors,
                            ).map(
                                ([
                                    field,
                                    message,
                                ]) => (
                                    <li
                                        key={
                                            field
                                        }
                                    >
                                        {
                                            message
                                        }
                                    </li>
                                ),
                            )}
                        </ul>
                    </div>
                )}

                <form
                    onSubmit={submit}
                    className="min-w-0 space-y-6"
                >
                    {/* ======================================================
                        IDENTIDAD
                    ======================================================= */}

                    <section className="min-w-0 overflow-hidden rounded-xl border bg-card shadow-sm">
                        <div className="border-b p-5">
                            <div className="flex items-center gap-2">
                                <LayoutDashboard className="size-4" />

                                <h2 className="font-semibold">
                                    {t(
                                        'settings.identity',
                                    )}
                                </h2>
                            </div>

                            <p className="mt-1 text-sm text-muted-foreground">
                                {t(
                                    'settings.identity_description',
                                )}
                            </p>
                        </div>

                        <div className="grid gap-5 p-5 min-[720px]:grid-cols-2">
                            <div className="min-w-0 space-y-2">
                                <label
                                    htmlFor="panel_name"
                                    className="text-sm font-medium"
                                >
                                    {t(
                                        'settings.panel_name',
                                    )}
                                </label>

                                <div className="relative">
                                    <TextCursorInput className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                                    <input
                                        id="panel_name"
                                        type="text"
                                        value={
                                            form.data.panel_name
                                        }
                                        onChange={(event) =>
                                            form.setData(
                                                'panel_name',
                                                event.target.value,
                                            )
                                        }
                                        disabled={
                                            !can.update ||
                                            form.processing
                                        }
                                        className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                                    />
                                </div>

                                {form.errors.panel_name && (
                                    <p className="text-sm text-destructive">
                                        {form.errors.panel_name}
                                    </p>
                                )}
                            </div>

                            <div className="min-w-0 space-y-2">
                                <label
                                    htmlFor="short_name"
                                    className="text-sm font-medium"
                                >
                                    {t(
                                        'settings.short_name',
                                    )}
                                </label>

                                <input
                                    id="short_name"
                                    type="text"
                                    value={
                                        form.data.short_name
                                    }
                                    onChange={(event) =>
                                        form.setData(
                                            'short_name',
                                            event.target.value,
                                        )
                                    }
                                    disabled={
                                        !can.update ||
                                        form.processing
                                    }
                                    className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                                />

                                {form.errors.short_name && (
                                    <p className="text-sm text-destructive">
                                        {form.errors.short_name}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Branding */}

                        <div className="border-t p-5">
                            <div className="mb-4">
                                <div className="flex items-center gap-2">
                                    <ImageIcon className="size-4" />

                                    <h3 className="text-sm font-semibold">
                                        {t(
                                            'settings.branding',
                                        )}
                                    </h3>
                                </div>

                                <p className="mt-1 text-xs text-muted-foreground">
                                    {t(
                                        'settings.branding_description',
                                    )}
                                </p>
                            </div>

                            <div className="grid min-w-0 gap-4 min-[720px]:grid-cols-2 min-[1200px]:grid-cols-3">
                                {/* Logo claro */}

                                <div className="min-w-0 rounded-xl border p-4">
                                    <div>
                                        <p className="text-sm font-medium">
                                            {t(
                                                'settings.logo_light',
                                            )}
                                        </p>

                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {t(
                                                'settings.logo_light_description',
                                            )}
                                        </p>
                                    </div>

                                    <div className="mt-3 h-28 overflow-hidden rounded-lg border bg-white">
                                        {logoLightPreview ? (
                                            <img
                                                src={
                                                    logoLightPreview
                                                }
                                                alt={t(
                                                    'settings.logo_light',
                                                )}
                                                className="h-full object-cover object-center"
                                                style={{
                                                    width:
                                                        `${form.data.logo_size}%`,
                                                }}
                                            />
                                        ) : (
                                            <span className="text-xs text-zinc-500">
                                                {t(
                                                    'settings.no_logo',
                                                )}
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-3 space-y-2">
                                        <label className="inline-flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-md border px-3 text-xs font-medium hover:bg-muted">
                                            <Upload className="size-3.5" />

                                            {t(
                                                'settings.select_image',
                                            )}

                                            <input
                                                type="file"
                                                accept="image/png,image/jpeg,image/webp"
                                                className="hidden"
                                                disabled={
                                                    !can.update ||
                                                    form.processing
                                                }
                                                onChange={(event) => {
                                                    const file =
                                                        event.target.files?.[
                                                            0
                                                        ] ??
                                                        null;

                                                    form.setData(
                                                        'logo_light',
                                                        file,
                                                    );

                                                    if (file) {
                                                        form.setData(
                                                            'remove_logo_light',
                                                            false,
                                                        );
                                                    }

                                                    event.currentTarget.value =
                                                        '';
                                                }}
                                            />
                                        </label>

                                        {logoLightPreview && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    form.setData(
                                                        'logo_light',
                                                        null,
                                                    );

                                                    form.setData(
                                                        'remove_logo_light',
                                                        true,
                                                    );
                                                }}
                                                disabled={
                                                    !can.update ||
                                                    form.processing
                                                }
                                                className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border px-3 text-xs font-medium text-destructive hover:bg-destructive/10"
                                            >
                                                <X className="size-3.5" />

                                                {t(
                                                    'settings.remove_image',
                                                )}
                                            </button>
                                        )}

                                        {form.errors.logo_light && (
                                            <p className="text-xs text-destructive">
                                                {
                                                    form.errors.logo_light
                                                }
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Logo oscuro */}

                                <div className="min-w-0 rounded-xl border p-4">
                                    <div>
                                        <p className="text-sm font-medium">
                                            {t(
                                                'settings.logo_dark',
                                            )}
                                        </p>

                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {t(
                                                'settings.logo_dark_description',
                                            )}
                                        </p>
                                    </div>

                                    <div className="mt-3 h-28 overflow-hidden rounded-lg border bg-zinc-950">
                                        {logoDarkPreview ? (
                                            <img
                                                src={
                                                    logoDarkPreview
                                                }
                                                alt={t(
                                                    'settings.logo_dark',
                                                )}
                                                className="h-full object-cover object-center"
                                                style={{
                                                    width:
                                                        `${form.data.logo_size}%`,
                                                }}
                                            />
                                        ) : (
                                            <span className="text-xs text-zinc-400">
                                                {t(
                                                    'settings.no_logo',
                                                )}
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-3 space-y-2">
                                        <label className="inline-flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-md border px-3 text-xs font-medium hover:bg-muted">
                                            <Upload className="size-3.5" />

                                            {t(
                                                'settings.select_image',
                                            )}

                                            <input
                                                type="file"
                                                accept="image/png,image/jpeg,image/webp"
                                                className="hidden"
                                                disabled={
                                                    !can.update ||
                                                    form.processing
                                                }
                                                onChange={(event) => {
                                                    const file =
                                                        event.target.files?.[
                                                            0
                                                        ] ??
                                                        null;

                                                    form.setData(
                                                        'logo_dark',
                                                        file,
                                                    );

                                                    if (file) {
                                                        form.setData(
                                                            'remove_logo_dark',
                                                            false,
                                                        );
                                                    }

                                                    event.currentTarget.value =
                                                        '';
                                                }}
                                            />
                                        </label>

                                        {logoDarkPreview && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    form.setData(
                                                        'logo_dark',
                                                        null,
                                                    );

                                                    form.setData(
                                                        'remove_logo_dark',
                                                        true,
                                                    );
                                                }}
                                                disabled={
                                                    !can.update ||
                                                    form.processing
                                                }
                                                className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border px-3 text-xs font-medium text-destructive hover:bg-destructive/10"
                                            >
                                                <X className="size-3.5" />

                                                {t(
                                                    'settings.remove_image',
                                                )}
                                            </button>
                                        )}

                                        {form.errors.logo_dark && (
                                            <p className="text-xs text-destructive">
                                                {
                                                    form.errors.logo_dark
                                                }
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Favicon */}

                                <div className="min-w-0 rounded-xl border p-4">
                                    <div>
                                        <p className="text-sm font-medium">
                                            {t(
                                                'settings.favicon',
                                            )}
                                        </p>

                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {t(
                                                'settings.favicon_description',
                                            )}
                                        </p>
                                    </div>

                                    <div className="mt-3 flex h-24 items-center justify-center overflow-hidden rounded-lg border bg-background p-4">
                                        {faviconPreview ? (
                                            <img
                                                src={
                                                    faviconPreview
                                                }
                                                alt={t(
                                                    'settings.favicon',
                                                )}
                                                className="size-12 object-contain"
                                            />
                                        ) : (
                                            <span className="text-xs text-muted-foreground">
                                                {t(
                                                    'settings.no_favicon',
                                                )}
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-3 space-y-2">
                                        <label className="inline-flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-md border px-3 text-xs font-medium hover:bg-muted">
                                            <Upload className="size-3.5" />

                                            {t(
                                                'settings.select_image',
                                            )}

                                            <input
                                                type="file"
                                                accept=".png,.jpg,.jpeg,.webp,.ico,image/x-icon"
                                                className="hidden"
                                                disabled={
                                                    !can.update ||
                                                    form.processing
                                                }
                                                onChange={(event) => {
                                                    const file =
                                                        event.target.files?.[
                                                            0
                                                        ] ??
                                                        null;

                                                    form.setData(
                                                        'favicon',
                                                        file,
                                                    );

                                                    if (file) {
                                                        form.setData(
                                                            'remove_favicon',
                                                            false,
                                                        );
                                                    }

                                                    event.currentTarget.value =
                                                        '';
                                                }}
                                            />
                                        </label>

                                        {faviconPreview && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    form.setData(
                                                        'favicon',
                                                        null,
                                                    );

                                                    form.setData(
                                                        'remove_favicon',
                                                        true,
                                                    );
                                                }}
                                                disabled={
                                                    !can.update ||
                                                    form.processing
                                                }
                                                className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border px-3 text-xs font-medium text-destructive hover:bg-destructive/10"
                                            >
                                                <X className="size-3.5" />

                                                {t(
                                                    'settings.remove_image',
                                                )}
                                            </button>
                                        )}

                                        {form.errors.favicon && (
                                            <p className="text-xs text-destructive">
                                                {
                                                    form.errors.favicon
                                                }
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 rounded-xl border p-4">
                                <div className="flex flex-col gap-3 min-[640px]:flex-row min-[640px]:items-center min-[640px]:justify-between">
                                    <div>
                                        <p className="text-sm font-medium">
                                            {t(
                                                'settings.logo_size',
                                            )}
                                        </p>

                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {t(
                                                'settings.logo_size_description',
                                            )}
                                        </p>
                                    </div>

                                    <span className="shrink-0 rounded-md border bg-background px-2.5 py-1 font-mono text-xs">
                                        {
                                            form.data.logo_size
                                        }%
                                    </span>
                                </div>

                                <div className="mt-4 flex items-center gap-3">
                                    <span className="shrink-0 text-xs text-muted-foreground">
                                        {t(
                                            'settings.logo_size.small',
                                        )}
                                    </span>

                                    <input
                                        type="range"
                                        min={50}
                                        max={100}
                                        step={5}
                                        value={
                                            form.data.logo_size
                                        }
                                        onChange={(event) =>
                                            form.setData(
                                                'logo_size',
                                                Number(
                                                    event.target.value,
                                                ),
                                            )
                                        }
                                        disabled={
                                            !can.update ||
                                            form.processing
                                        }
                                        className="h-2 min-w-0 flex-1 cursor-pointer accent-primary disabled:cursor-not-allowed disabled:opacity-60"
                                    />

                                    <span className="shrink-0 text-xs text-muted-foreground">
                                        {t(
                                            'settings.logo_size.large',
                                        )}
                                    </span>
                                </div>

                                {form.errors.logo_size && (
                                    <p className="mt-2 text-xs text-destructive">
                                        {
                                            form.errors.logo_size
                                        }
                                    </p>
                                )}
                            </div>

                            <p className="mt-4 text-xs text-muted-foreground">
                                {t(
                                    'settings.branding_hint',
                                )}
                            </p>
                        </div>
                    </section>

                    {/* ======================================================
                        APARIENCIA
                    ======================================================= */}

                    <section className="min-w-0 overflow-hidden rounded-xl border bg-card shadow-sm">
                        <div className="border-b p-5">
                            <div className="flex items-center gap-2">
                                <Palette className="size-4" />

                                <h2 className="font-semibold">
                                    {t(
                                        'settings.appearance',
                                    )}
                                </h2>
                            </div>

                            <p className="mt-1 text-sm text-muted-foreground">
                                {t(
                                    'settings.appearance_description',
                                )}
                            </p>
                        </div>

                        <div className="grid min-w-0 gap-6 p-5 min-[900px]:grid-cols-[minmax(0,1fr)_minmax(280px,380px)]">
                            <div className="min-w-0 space-y-6">
                                <div className="space-y-2">
                                    <label
                                        htmlFor="primary_color"
                                        className="text-sm font-medium"
                                    >
                                        {t(
                                            'settings.primary_color',
                                        )}
                                    </label>

                                    <p className="text-xs text-muted-foreground">
                                        {t(
                                            'settings.primary_color_description',
                                        )}
                                    </p>

                                    <div className="flex min-w-0 flex-col gap-2 min-[480px]:flex-row">
                                        <label
                                            htmlFor="primary_color_picker"
                                            className="flex h-10 w-full cursor-pointer items-center gap-3 rounded-md border bg-background px-3 min-[480px]:w-auto"
                                        >
                                            <input
                                                id="primary_color_picker"
                                                type="color"
                                                value={
                                                    /^#[0-9A-Fa-f]{6}$/.test(
                                                        form.data.primary_color,
                                                    )
                                                        ? form.data.primary_color
                                                        : normalizeHexColor(
                                                              settings.primary_color,
                                                          )
                                                }
                                                onChange={(event) =>
                                                    changePrimaryColor(
                                                        event.target.value,
                                                    )
                                                }
                                                disabled={
                                                    !can.update ||
                                                    form.processing
                                                }
                                                className="size-6 cursor-pointer appearance-none overflow-hidden rounded border-0 bg-transparent p-0 disabled:cursor-not-allowed"
                                            />

                                            <span className="text-sm">
                                                {t(
                                                    'settings.custom_color',
                                                )}
                                            </span>
                                        </label>

                                        <input
                                            id="primary_color"
                                            type="text"
                                            value={
                                                form.data.primary_color
                                            }
                                            onChange={(event) => {
                                                const value =
                                                    event.target.value
                                                        .trim()
                                                        .toUpperCase();

                                                form.setData(
                                                    'primary_color',
                                                    value,
                                                );

                                                if (
                                                    /^#[0-9A-F]{6}$/.test(
                                                        value,
                                                    )
                                                ) {
                                                    applySystemAppearance({
                                                        primary_color:
                                                            value,

                                                        sidebar_color:
                                                            form.data.sidebar_color,

                                                        sidebar_shape:
                                                            form.data.sidebar_shape,

                                                        background_color_mode:
                                                            form.data.background_color_mode,

                                                        background_color:
                                                            form.data.background_color,

                                                        card_color_mode:
                                                            form.data.card_color_mode,

                                                        card_color:
                                                            form.data.card_color,

                                                        card_style:
                                                            form.data.card_style,
                                                    });
                                                }
                                            }}
                                            disabled={
                                                !can.update ||
                                                form.processing
                                            }
                                            maxLength={7}
                                            placeholder="#18181B"
                                            className="h-10 w-full min-w-0 rounded-md border bg-background px-3 font-mono text-sm uppercase outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60 min-[480px]:max-w-44"
                                        />
                                    </div>

                                    {form.errors.primary_color && (
                                        <p className="text-sm text-destructive">
                                            {form.errors.primary_color}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <p className="text-sm font-medium">
                                        {t(
                                            'settings.color_presets',
                                        )}
                                    </p>

                                    <div className="grid grid-cols-2 gap-2 min-[480px]:grid-cols-3">
                                        {COLOR_PRESETS.map(
                                            (preset) => {
                                                const selected =
                                                    form.data.primary_color
                                                        .toUpperCase() ===
                                                    preset.value;

                                                return (
                                                    <button
                                                        key={
                                                            preset.value
                                                        }
                                                        type="button"
                                                        onClick={() =>
                                                            changePrimaryColor(
                                                                preset.value,
                                                            )
                                                        }
                                                        disabled={
                                                            !can.update ||
                                                            form.processing
                                                        }
                                                        className={`flex min-w-0 items-center gap-2 rounded-lg border p-2.5 text-left transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60 ${
                                                            selected
                                                                ? 'border-primary ring-2 ring-primary/20'
                                                                : ''
                                                        }`}
                                                    >
                                                        <span
                                                            className="flex size-7 shrink-0 items-center justify-center rounded-full border"
                                                            style={{
                                                                backgroundColor:
                                                                    preset.value,
                                                            }}
                                                        >
                                                            {selected && (
                                                                <Check className="size-4 text-white drop-shadow" />
                                                            )}
                                                        </span>

                                                        <span className="min-w-0">
                                                            <span className="block truncate text-xs font-medium">
                                                                {t(
                                                                    preset.key,
                                                                )}
                                                            </span>

                                                            <span className="block font-mono text-[10px] text-muted-foreground">
                                                                {
                                                                    preset.value
                                                                }
                                                            </span>
                                                        </span>
                                                    </button>
                                                );
                                            },
                                        )}
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        changePrimaryColor(
                                            '#18181B',
                                        )
                                    }
                                    disabled={
                                        !can.update ||
                                        form.processing
                                    }
                                    className="inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3 text-xs font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <RotateCcw className="size-3.5" />

                                    {t(
                                        'settings.restore_default_color',
                                    )}
                                </button>

                                {/* Cards */}

                                <div className="space-y-4 border-t pt-5">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="size-4" />

                                            <p className="text-sm font-medium">
                                                {t(
                                                    'settings.card_color',
                                                )}
                                            </p>
                                        </div>

                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {t(
                                                'settings.card_color_description',
                                            )}
                                        </p>
                                    </div>

                                    {/* Automático / personalizado */}

                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                form.setData(
                                                    'card_color_mode',
                                                    'auto',
                                                )
                                            }
                                            disabled={
                                                !can.update ||
                                                form.processing
                                            }
                                            className={`rounded-lg border p-3 text-left transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60 ${
                                                form.data.card_color_mode ===
                                                'auto'
                                                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                                    : ''
                                            }`}
                                        >
                                            <p className="text-xs font-medium">
                                                {t(
                                                    'settings.card.auto',
                                                )}
                                            </p>

                                            <p className="mt-1 text-[10px] text-muted-foreground">
                                                {t(
                                                    'settings.card.auto_description',
                                                )}
                                            </p>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                form.setData(
                                                    'card_color_mode',
                                                    'custom',
                                                )
                                            }
                                            disabled={
                                                !can.update ||
                                                form.processing
                                            }
                                            className={`rounded-lg border p-3 text-left transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60 ${
                                                form.data.card_color_mode ===
                                                'custom'
                                                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                                    : ''
                                            }`}
                                        >
                                            <p className="text-xs font-medium">
                                                {t(
                                                    'settings.card.custom',
                                                )}
                                            </p>

                                            <p className="mt-1 text-[10px] text-muted-foreground">
                                                {t(
                                                    'settings.card.custom_description',
                                                )}
                                            </p>
                                        </button>
                                    </div>

                                    {form.data.card_color_mode ===
                                        'custom' && (
                                        <>
                                            <div className="flex min-w-0 flex-col gap-2 min-[480px]:flex-row">
                                                <label
                                                    htmlFor="card_color_picker"
                                                    className="flex h-10 w-full cursor-pointer items-center gap-3 rounded-md border bg-background px-3 min-[480px]:w-auto"
                                                >
                                                    <input
                                                        id="card_color_picker"
                                                        type="color"
                                                        value={
                                                            /^#[0-9A-Fa-f]{6}$/.test(
                                                                form.data.card_color,
                                                            )
                                                                ? form.data.card_color
                                                                : '#FFFFFF'
                                                        }
                                                        onChange={(event) =>
                                                            form.setData(
                                                                'card_color',
                                                                normalizeHexColor(
                                                                    event.target.value,
                                                                    form.data.card_color,
                                                                ),
                                                            )
                                                        }
                                                        disabled={
                                                            !can.update ||
                                                            form.processing
                                                        }
                                                        className="size-6 cursor-pointer appearance-none overflow-hidden rounded border-0 bg-transparent p-0 disabled:cursor-not-allowed"
                                                    />

                                                    <span className="text-sm">
                                                        {t(
                                                            'settings.custom_color',
                                                        )}
                                                    </span>
                                                </label>

                                                <input
                                                    id="card_color"
                                                    type="text"
                                                    value={
                                                        form.data.card_color
                                                    }
                                                    onChange={(event) =>
                                                        form.setData(
                                                            'card_color',
                                                            event.target.value
                                                                .trim()
                                                                .toUpperCase(),
                                                        )
                                                    }
                                                    disabled={
                                                        !can.update ||
                                                        form.processing
                                                    }
                                                    maxLength={7}
                                                    placeholder="#FFFFFF"
                                                    className="h-10 w-full min-w-0 rounded-md border bg-background px-3 font-mono text-sm uppercase outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60 min-[480px]:max-w-44"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 min-[480px]:grid-cols-3">
                                                {CARD_PRESETS.map(
                                                    (preset) => {
                                                        const selected =
                                                            form.data.card_color
                                                                .toUpperCase() ===
                                                            preset.value;

                                                        return (
                                                            <button
                                                                key={
                                                                    preset.value
                                                                }
                                                                type="button"
                                                                onClick={() => {
                                                                    form.setData(
                                                                        'card_color_mode',
                                                                        'custom',
                                                                    );

                                                                    form.setData(
                                                                        'card_color',
                                                                        preset.value,
                                                                    );
                                                                }}
                                                                disabled={
                                                                    !can.update ||
                                                                    form.processing
                                                                }
                                                                className={`flex min-w-0 items-center gap-2 rounded-lg border p-2.5 text-left transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60 ${
                                                                    selected
                                                                        ? 'border-primary ring-2 ring-primary/20'
                                                                        : ''
                                                                }`}
                                                            >
                                                                <span
                                                                    className="size-7 shrink-0 rounded-md border"
                                                                    style={{
                                                                        backgroundColor:
                                                                            preset.value,
                                                                    }}
                                                                />

                                                                <span className="truncate text-xs font-medium">
                                                                    {t(
                                                                        preset.key,
                                                                    )}
                                                                </span>
                                                            </button>
                                                        );
                                                    },
                                                )}
                                            </div>

                                            {form.errors.card_color && (
                                                <p className="text-sm text-destructive">
                                                    {
                                                        form.errors.card_color
                                                    }
                                                </p>
                                            )}
                                        </>
                                    )}

                                    {/* Estilo de card */}

                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm font-medium">
                                                {t(
                                                    'settings.card_style',
                                                )}
                                            </p>

                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {t(
                                                    'settings.card_style_description',
                                                )}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    form.setData(
                                                        'card_style',
                                                        'solid',
                                                    )
                                                }
                                                disabled={
                                                    !can.update ||
                                                    form.processing
                                                }
                                                className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-xs font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60 ${
                                                    form.data.card_style ===
                                                    'solid'
                                                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                                        : ''
                                                }`}
                                            >
                                                <CreditCard className="size-4" />

                                                {t(
                                                    'settings.card.solid',
                                                )}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    form.setData(
                                                        'card_style',
                                                        'glass',
                                                    )
                                                }
                                                disabled={
                                                    !can.update ||
                                                    form.processing
                                                }
                                                className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-xs font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60 ${
                                                    form.data.card_style ===
                                                    'glass'
                                                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                                        : ''
                                                }`}
                                            >
                                                <Sparkles className="size-4" />

                                                {t(
                                                    'settings.card.glass',
                                                )}
                                            </button>
                                        </div>

                                        {form.data.card_style ===
                                            'glass' && (
                                            <div className="rounded-lg border border-dashed bg-primary/5 p-3">
                                                <div className="flex items-start gap-2">
                                                    <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />

                                                    <p className="text-xs text-muted-foreground">
                                                        {t(
                                                            'settings.card.glass_description',
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="min-w-0 space-y-6">
                                {/* Color del sidebar */}

                                <div className="space-y-2">
                                    <label
                                        htmlFor="sidebar_color"
                                        className="flex items-center gap-2 text-sm font-medium"
                                    >
                                        <PanelLeft className="size-4" />

                                        {t(
                                            'settings.sidebar_color',
                                        )}
                                    </label>

                                    <p className="text-xs text-muted-foreground">
                                        {t(
                                            'settings.sidebar_color_description',
                                        )}
                                    </p>

                                    <div className="flex min-w-0 flex-col gap-2 min-[480px]:flex-row">
                                        <label
                                            htmlFor="sidebar_color_picker"
                                            className="flex h-10 w-full cursor-pointer items-center gap-3 rounded-md border bg-background px-3 min-[480px]:w-auto"
                                        >
                                            <input
                                                id="sidebar_color_picker"
                                                type="color"
                                                value={
                                                    /^#[0-9A-Fa-f]{6}$/.test(
                                                        form.data.sidebar_color,
                                                    )
                                                        ? form.data.sidebar_color
                                                        : normalizeHexColor(
                                                              settings.sidebar_color,
                                                              '#FAFAFA',
                                                          )
                                                }
                                                onChange={(event) => {
                                                    const value =
                                                        normalizeHexColor(
                                                            event.target.value,
                                                            form.data.sidebar_color,
                                                        );

                                                    form.setData(
                                                        'sidebar_color',
                                                        value,
                                                    );
                                                }}
                                                disabled={
                                                    !can.update ||
                                                    form.processing
                                                }
                                                className="size-6 cursor-pointer appearance-none overflow-hidden rounded border-0 bg-transparent p-0 disabled:cursor-not-allowed"
                                            />

                                            <span className="text-sm">
                                                {t(
                                                    'settings.custom_color',
                                                )}
                                            </span>
                                        </label>

                                        <input
                                            id="sidebar_color"
                                            type="text"
                                            value={
                                                form.data.sidebar_color
                                            }
                                            onChange={(event) => {
                                                const value =
                                                    event.target.value
                                                        .trim()
                                                        .toUpperCase();

                                                form.setData(
                                                    'sidebar_color',
                                                    value,
                                                );
                                            }}
                                            disabled={
                                                !can.update ||
                                                form.processing
                                            }
                                            maxLength={7}
                                            placeholder="#FAFAFA"
                                            className="h-10 w-full min-w-0 rounded-md border bg-background px-3 font-mono text-sm uppercase outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60 min-[480px]:max-w-44"
                                        />
                                    </div>

                                    {form.errors.sidebar_color && (
                                        <p className="text-sm text-destructive">
                                            {form.errors.sidebar_color}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <p className="text-sm font-medium">
                                        {t(
                                            'settings.sidebar_presets',
                                        )}
                                    </p>

                                    <div className="grid grid-cols-2 gap-2">
                                        {SIDEBAR_PRESETS.map(
                                            (preset) => {
                                                const selected =
                                                    form.data.sidebar_color
                                                        .toUpperCase() ===
                                                    preset.value;

                                                return (
                                                    <button
                                                        key={
                                                            preset.value
                                                        }
                                                        type="button"
                                                        onClick={() =>
                                                            form.setData(
                                                                'sidebar_color',
                                                                preset.value,
                                                            )
                                                        }
                                                        disabled={
                                                            !can.update ||
                                                            form.processing
                                                        }
                                                        className={`flex min-w-0 items-center gap-2 rounded-lg border p-2.5 text-left transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60 ${
                                                            selected
                                                                ? 'border-primary ring-2 ring-primary/20'
                                                                : ''
                                                        }`}
                                                    >
                                                        <span
                                                            className="size-7 shrink-0 rounded-md border"
                                                            style={{
                                                                backgroundColor:
                                                                    preset.value,
                                                            }}
                                                        />

                                                        <span className="min-w-0">
                                                            <span className="block truncate text-xs font-medium">
                                                                {t(
                                                                    preset.key,
                                                                )}
                                                            </span>

                                                            <span className="block font-mono text-[10px] text-muted-foreground">
                                                                {
                                                                    preset.value
                                                                }
                                                            </span>
                                                        </span>
                                                    </button>
                                                );
                                            },
                                        )}
                                    </div>
                                </div>

                                {/* Forma del sidebar */}

                                <div className="space-y-3 border-t pt-5">
                                    <div>
                                        <p className="text-sm font-medium">
                                            {t(
                                                'settings.sidebar_shape',
                                            )}
                                        </p>

                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {t(
                                                'settings.sidebar_shape_description',
                                            )}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                form.setData(
                                                    'sidebar_shape',
                                                    'normal',
                                                )
                                            }
                                            disabled={
                                                !can.update ||
                                                form.processing
                                            }
                                            className={`flex items-center gap-3 rounded-lg border p-3 text-left transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60 ${
                                                form.data.sidebar_shape ===
                                                'normal'
                                                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                                    : ''
                                            }`}
                                        >
                                            <span className="h-8 w-5 shrink-0 border bg-sidebar" />

                                            <span className="text-xs font-medium">
                                                {t(
                                                    'settings.sidebar_shape.normal',
                                                )}
                                            </span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                form.setData(
                                                    'sidebar_shape',
                                                    'rounded',
                                                )
                                            }
                                            disabled={
                                                !can.update ||
                                                form.processing
                                            }
                                            className={`flex items-center gap-3 rounded-lg border p-3 text-left transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60 ${
                                                form.data.sidebar_shape ===
                                                'rounded'
                                                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                                    : ''
                                            }`}
                                        >
                                            <span className="h-8 w-5 shrink-0 rounded-lg border bg-sidebar" />

                                            <span className="text-xs font-medium">
                                                {t(
                                                    'settings.sidebar_shape.rounded',
                                                )}
                                            </span>
                                        </button>
                                    </div>

                                    {form.errors.sidebar_shape && (
                                        <p className="text-sm text-destructive">
                                            {form.errors.sidebar_shape}
                                        </p>
                                    )}
                                </div>

                                {/* Fondo del panel */}

                                <div className="space-y-4 border-t pt-5">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Palette className="size-4" />

                                            <p className="text-sm font-medium">
                                                {t(
                                                    'settings.background_color',
                                                )}
                                            </p>
                                        </div>

                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {t(
                                                'settings.background_color_description',
                                            )}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                form.setData(
                                                    'background_color_mode',
                                                    'auto',
                                                )
                                            }
                                            disabled={
                                                !can.update ||
                                                form.processing
                                            }
                                            className={`rounded-lg border p-3 text-left transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60 ${
                                                form.data.background_color_mode ===
                                                'auto'
                                                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                                    : ''
                                            }`}
                                        >
                                            <p className="text-xs font-medium">
                                                {t(
                                                    'settings.background.auto',
                                                )}
                                            </p>

                                            <p className="mt-1 text-[10px] text-muted-foreground">
                                                {t(
                                                    'settings.background.auto_description',
                                                )}
                                            </p>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                form.setData(
                                                    'background_color_mode',
                                                    'custom',
                                                )
                                            }
                                            disabled={
                                                !can.update ||
                                                form.processing
                                            }
                                            className={`rounded-lg border p-3 text-left transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60 ${
                                                form.data.background_color_mode ===
                                                'custom'
                                                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                                    : ''
                                            }`}
                                        >
                                            <p className="text-xs font-medium">
                                                {t(
                                                    'settings.background.custom',
                                                )}
                                            </p>

                                            <p className="mt-1 text-[10px] text-muted-foreground">
                                                {t(
                                                    'settings.background.custom_description',
                                                )}
                                            </p>
                                        </button>
                                    </div>

                                    {form.data.background_color_mode ===
                                        'custom' && (
                                        <>
                                            <div className="flex min-w-0 flex-col gap-2 min-[480px]:flex-row">
                                                <label
                                                    htmlFor="background_color_picker"
                                                    className="flex h-10 w-full cursor-pointer items-center gap-3 rounded-md border bg-background px-3 min-[480px]:w-auto"
                                                >
                                                    <input
                                                        id="background_color_picker"
                                                        type="color"
                                                        value={
                                                            /^#[0-9A-Fa-f]{6}$/.test(
                                                                form.data.background_color,
                                                            )
                                                                ? form.data.background_color
                                                                : '#FFFFFF'
                                                        }
                                                        onChange={(event) =>
                                                            form.setData(
                                                                'background_color',
                                                                normalizeHexColor(
                                                                    event.target.value,
                                                                    form.data.background_color,
                                                                ),
                                                            )
                                                        }
                                                        disabled={
                                                            !can.update ||
                                                            form.processing
                                                        }
                                                        className="size-6 cursor-pointer appearance-none overflow-hidden rounded border-0 bg-transparent p-0 disabled:cursor-not-allowed"
                                                    />

                                                    <span className="text-sm">
                                                        {t(
                                                            'settings.custom_color',
                                                        )}
                                                    </span>
                                                </label>

                                                <input
                                                    id="background_color"
                                                    type="text"
                                                    value={
                                                        form.data.background_color
                                                    }
                                                    onChange={(event) =>
                                                        form.setData(
                                                            'background_color',
                                                            event.target.value
                                                                .trim()
                                                                .toUpperCase(),
                                                        )
                                                    }
                                                    disabled={
                                                        !can.update ||
                                                        form.processing
                                                    }
                                                    maxLength={7}
                                                    placeholder="#FFFFFF"
                                                    className="h-10 w-full min-w-0 rounded-md border bg-background px-3 font-mono text-sm uppercase outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60 min-[480px]:max-w-44"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                {BACKGROUND_PRESETS.map(
                                                    (preset) => {
                                                        const selected =
                                                            form.data.background_color
                                                                .toUpperCase() ===
                                                            preset.value;

                                                        return (
                                                            <button
                                                                key={
                                                                    preset.value
                                                                }
                                                                type="button"
                                                                onClick={() =>
                                                                    form.setData(
                                                                        'background_color',
                                                                        preset.value,
                                                                    )
                                                                }
                                                                disabled={
                                                                    !can.update ||
                                                                    form.processing
                                                                }
                                                                className={`flex min-w-0 items-center gap-2 rounded-lg border p-2.5 text-left transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60 ${
                                                                    selected
                                                                        ? 'border-primary ring-2 ring-primary/20'
                                                                        : ''
                                                                }`}
                                                            >
                                                                <span
                                                                    className="size-7 shrink-0 rounded-md border"
                                                                    style={{
                                                                        backgroundColor:
                                                                            preset.value,
                                                                    }}
                                                                />

                                                                <span className="truncate text-xs font-medium">
                                                                    {t(
                                                                        preset.key,
                                                                    )}
                                                                </span>
                                                            </button>
                                                        );
                                                    },
                                                )}
                                            </div>

                                            {form.errors.background_color && (
                                                <p className="text-sm text-destructive">
                                                    {
                                                        form.errors.background_color
                                                    }
                                                </p>
                                            )}
                                        </>
                                    )}

                                    {form.errors.background_color_mode && (
                                        <p className="text-sm text-destructive">
                                            {form.errors.background_color_mode}
                                        </p>
                                    )}
                                </div>

                            </div>

                            {/* Vista previa */}

                            <div className="min-w-0">
                                <p className="mb-3 text-sm font-medium">
                                    {t(
                                        'settings.preview',
                                    )}
                                </p>

                                <div className="overflow-hidden rounded-xl border bg-background">
                                    <div className="border-b px-4 py-3">
                                        <p className="font-semibold">
                                            {t(
                                                'settings.preview_title',
                                            )}
                                        </p>

                                        <p className="text-xs text-muted-foreground">
                                            {t(
                                                'settings.preview_description',
                                            )}
                                        </p>
                                    </div>

                                    <div className="space-y-4 p-4">
                                        <button
                                            type="button"
                                            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
                                        >
                                            {t(
                                                'settings.preview_button',
                                            )}
                                        </button>

                                        <div className="space-y-2">
                                            <div className="h-10 rounded-md border px-3 py-2 text-sm ring-2 ring-ring/30">
                                                {t(
                                                    'settings.preview_input',
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2 rounded-md bg-sidebar-accent px-3 py-2 text-sm font-medium text-sidebar-accent-foreground">
                                                <Palette className="size-4" />

                                                {t(
                                                    'settings.preview_active',
                                                )}
                                            </div>
                                        </div>

                                        <div className="rounded-xl border bg-card p-4 shadow-sm">
                                            <div className="flex items-center gap-2">
                                                <CreditCard className="size-4 text-primary" />

                                                <p className="text-sm font-semibold">
                                                    {t(
                                                        'settings.preview_card',
                                                    )}
                                                </p>
                                            </div>

                                            <p className="mt-2 text-xs text-muted-foreground">
                                                {form.data.card_style ===
                                                'glass'
                                                    ? t(
                                                          'settings.preview_card_glass',
                                                      )
                                                    : t(
                                                          'settings.preview_card_solid',
                                                      )}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="size-3 rounded-full bg-primary" />

                                            <span className="text-xs text-muted-foreground">
                                                {
                                                    form.data.primary_color
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ======================================================
                        REGIONAL
                    ======================================================= */}

                    <section className="min-w-0 overflow-hidden rounded-xl border bg-card shadow-sm">
                        <div className="border-b p-5">
                            <div className="flex items-center gap-2">
                                <Globe2 className="size-4" />

                                <h2 className="font-semibold">
                                    {t(
                                        'settings.regional',
                                    )}
                                </h2>
                            </div>

                            <p className="mt-1 text-sm text-muted-foreground">
                                {t(
                                    'settings.regional_description',
                                )}
                            </p>
                        </div>

                        <div className="grid min-w-0 gap-5 p-5 min-[720px]:grid-cols-2 min-[1200px]:grid-cols-3">
                            <div className="min-w-0 space-y-2">
                                <label
                                    htmlFor="timezone"
                                    className="flex items-center gap-2 text-sm font-medium"
                                >
                                    <Globe2 className="size-4" />

                                    {t(
                                        'settings.timezone',
                                    )}
                                </label>

                                <select
                                    id="timezone"
                                    value={
                                        form.data.timezone
                                    }
                                    onChange={(event) =>
                                        form.setData(
                                            'timezone',
                                            event.target.value,
                                        )
                                    }
                                    disabled={
                                        !can.update ||
                                        form.processing
                                    }
                                    className="h-10 w-full min-w-0 rounded-md border bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {options.timezones.map(
                                        (timezone) => (
                                            <option
                                                key={timezone}
                                                value={timezone}
                                            >
                                                {timezone}
                                            </option>
                                        ),
                                    )}
                                </select>

                                {form.errors.timezone && (
                                    <p className="text-sm text-destructive">
                                        {form.errors.timezone}
                                    </p>
                                )}
                            </div>

                            <div className="min-w-0 space-y-2">
                                <label
                                    htmlFor="locale"
                                    className="flex items-center gap-2 text-sm font-medium"
                                >
                                    <Languages className="size-4" />

                                    {t(
                                        'settings.language',
                                    )}
                                </label>

                                <select
                                    id="locale"
                                    value={
                                        form.data.locale
                                    }
                                    onChange={(event) =>
                                        form.setData(
                                            'locale',
                                            event.target.value,
                                        )
                                    }
                                    disabled={
                                        !can.update ||
                                        form.processing
                                    }
                                    className="h-10 w-full min-w-0 rounded-md border bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <option value="es">
                                        {t(
                                            'settings.spanish',
                                        )}
                                    </option>

                                    <option value="en">
                                        {t(
                                            'settings.english',
                                        )}
                                    </option>
                                </select>

                                {form.errors.locale && (
                                    <p className="text-sm text-destructive">
                                        {form.errors.locale}
                                    </p>
                                )}
                            </div>

                            <div className="min-w-0 space-y-2">
                                <label
                                    htmlFor="per_page"
                                    className="text-sm font-medium"
                                >
                                    {t(
                                        'settings.per_page',
                                    )}
                                </label>

                                <select
                                    id="per_page"
                                    value={
                                        form.data.per_page
                                    }
                                    onChange={(event) =>
                                        form.setData(
                                            'per_page',
                                            Number(
                                                event.target.value,
                                            ),
                                        )
                                    }
                                    disabled={
                                        !can.update ||
                                        form.processing
                                    }
                                    className="h-10 w-full min-w-0 rounded-md border bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {options
                                        .per_page_options
                                        .map(
                                            (value) => (
                                                <option
                                                    key={value}
                                                    value={value}
                                                >
                                                    {value}
                                                </option>
                                            ),
                                        )}
                                </select>
                            </div>

                            <div className="min-w-0 space-y-2">
                                <label
                                    htmlFor="date_format"
                                    className="flex items-center gap-2 text-sm font-medium"
                                >
                                    <CalendarDays className="size-4" />

                                    {t(
                                        'settings.date_format',
                                    )}
                                </label>

                                <select
                                    id="date_format"
                                    value={
                                        form.data.date_format
                                    }
                                    onChange={(event) =>
                                        form.setData(
                                            'date_format',
                                            event.target.value,
                                        )
                                    }
                                    disabled={
                                        !can.update ||
                                        form.processing
                                    }
                                    className="h-10 w-full min-w-0 rounded-md border bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {options
                                        .date_formats
                                        .map(
                                            (option) => (
                                                <option
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </option>
                                            ),
                                        )}
                                </select>
                            </div>

                            <div className="min-w-0 space-y-2">
                                <label
                                    htmlFor="time_format"
                                    className="flex items-center gap-2 text-sm font-medium"
                                >
                                    <Clock3 className="size-4" />

                                    {t(
                                        'settings.time_format',
                                    )}
                                </label>

                                <select
                                    id="time_format"
                                    value={
                                        form.data.time_format
                                    }
                                    onChange={(event) =>
                                        form.setData(
                                            'time_format',
                                            event.target.value,
                                        )
                                    }
                                    disabled={
                                        !can.update ||
                                        form.processing
                                    }
                                    className="h-10 w-full min-w-0 rounded-md border bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {options
                                        .time_formats
                                        .map(
                                            (option) => (
                                                <option
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </option>
                                            ),
                                        )}
                                </select>
                            </div>
                        </div>
                    </section>

                    {can.update && (
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={
                                    form.processing
                                }
                                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60 min-[480px]:w-auto"
                            >
                                <Save className="size-4" />

                                {form.processing
                                    ? t(
                                          'settings.saving',
                                      )
                                    : t(
                                          'settings.save',
                                      )}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </AppLayout>
    );
}
