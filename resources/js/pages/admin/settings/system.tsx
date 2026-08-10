import {
    Head,
    useForm,
} from '@inertiajs/react';

import {
    CalendarDays,
    Check,
    CheckCircle2,
    Clock3,
    CreditCard,
    Globe2,
    Languages,
    ImageIcon,
    LayoutDashboard,
    LoaderCircle,
    MonitorCog,
    Palette,
    PanelLeft,
    RotateCcw,
    Sparkles,
    Save,
    Undo2,
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

    const labels =
        form.data.locale === 'en'
            ? {
                  controlCenter: 'Control center',
                  summary:
                      'Manage CIVAN identity, branding, visual appearance and regional preferences from one place.',
                  unsaved: 'Unsaved changes',
                  saved: 'Settings saved successfully',
                  allSaved: 'Everything is saved',
                  pending:
                      'You have changes that have not been saved yet.',
                  discard: 'Discard changes',
                  readonly:
                      'You have read-only access to these settings.',
                  preview: 'Live panel preview',
                  previewHint:
                      'Changes are reflected here before saving.',
                  lightLogo: 'Light logo',
                  darkLogo: 'Dark logo',
                  favicon: 'Favicon',
                  appearanceSummary: 'Current appearance',
                  locale: 'Language',
                  records: 'Rows',
                  primary: 'Primary',
                  dashboard: 'Dashboard',
                  users: 'Users',
                  settingsNav: 'Settings',
                  activeModule: 'Active module',
                  exampleCard: 'Example card',
                  exampleText: 'This preview updates while you customize CIVAN.',
              }
            : {
                  controlCenter: 'Centro de control',
                  summary:
                      'Administra la identidad, marca, apariencia visual y preferencias regionales de CIVAN desde un solo lugar.',
                  unsaved: 'Cambios sin guardar',
                  saved: 'Configuración guardada correctamente',
                  allSaved: 'Todo está guardado',
                  pending:
                      'Tienes cambios que todavía no han sido guardados.',
                  discard: 'Descartar cambios',
                  readonly:
                      'Tienes acceso de solo lectura a esta configuración.',
                  preview: 'Vista previa en vivo',
                  previewHint:
                      'Los cambios se reflejan aquí antes de guardar.',
                  lightLogo: 'Logo claro',
                  darkLogo: 'Logo oscuro',
                  favicon: 'Favicon',
                  appearanceSummary: 'Apariencia actual',
                  locale: 'Idioma',
                  records: 'Registros',
                  primary: 'Principal',
                  dashboard: 'Dashboard',
                  users: 'Usuarios',
                  settingsNav: 'Sistema',
                  activeModule: 'Módulo activo',
                  exampleCard: 'Tarjeta de ejemplo',
                  exampleText: 'Esta vista se actualiza mientras personalizas CIVAN.',
              };

    const savedPrimaryColor =
        normalizeHexColor(
            settings.primary_color,
        );

    const savedSidebarColor =
        normalizeHexColor(
            settings.sidebar_color,
            '#FAFAFA',
        );

    const savedBackgroundColor =
        normalizeHexColor(
            settings.background_color,
            '#FFFFFF',
        );

    const savedCardColor =
        normalizeHexColor(
            settings.card_color,
            '#FFFFFF',
        );

    const hasChanges =
        form.data.panel_name !== settings.panel_name ||
        form.data.short_name !== settings.short_name ||
        form.data.logo_light !== null ||
        form.data.logo_dark !== null ||
        form.data.favicon !== null ||
        form.data.remove_logo_light ||
        form.data.remove_logo_dark ||
        form.data.remove_favicon ||
        form.data.logo_size !==
            Number(
                settings.logo_size ?? 75,
            ) ||
        form.data.primary_color.toUpperCase() !==
            savedPrimaryColor.toUpperCase() ||
        form.data.sidebar_color.toUpperCase() !==
            savedSidebarColor.toUpperCase() ||
        form.data.sidebar_shape !== settings.sidebar_shape ||
        form.data.background_color_mode !==
            settings.background_color_mode ||
        form.data.background_color.toUpperCase() !==
            savedBackgroundColor.toUpperCase() ||
        form.data.card_color_mode !==
            settings.card_color_mode ||
        form.data.card_color.toUpperCase() !==
            savedCardColor.toUpperCase() ||
        form.data.card_style !== settings.card_style ||
        form.data.timezone !== settings.timezone ||
        form.data.locale !== settings.locale ||
        form.data.date_format !== settings.date_format ||
        form.data.time_format !== settings.time_format ||
        form.data.per_page !== settings.per_page;

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

    const discardChanges = () => {
        form.setData(
            'panel_name',
            settings.panel_name,
        );

        form.setData(
            'short_name',
            settings.short_name,
        );

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

        form.setData(
            'logo_size',
            Number(
                settings.logo_size ?? 75,
            ),
        );

        form.setData(
            'primary_color',
            savedPrimaryColor,
        );

        form.setData(
            'sidebar_color',
            savedSidebarColor,
        );

        form.setData(
            'sidebar_shape',
            settings.sidebar_shape,
        );

        form.setData(
            'background_color_mode',
            settings.background_color_mode,
        );

        form.setData(
            'background_color',
            savedBackgroundColor,
        );

        form.setData(
            'card_color_mode',
            settings.card_color_mode,
        );

        form.setData(
            'card_color',
            savedCardColor,
        );

        form.setData(
            'card_style',
            settings.card_style,
        );

        form.setData(
            'timezone',
            settings.timezone,
        );

        form.setData(
            'locale',
            settings.locale,
        );

        form.setData(
            'date_format',
            settings.date_format,
        );

        form.setData(
            'time_format',
            settings.time_format,
        );

        form.setData(
            'per_page',
            settings.per_page,
        );

        form.clearErrors();

        applySystemAppearance({
            primary_color:
                savedPrimaryColor,
            sidebar_color:
                savedSidebarColor,
            sidebar_shape:
                settings.sidebar_shape,
            background_color_mode:
                settings.background_color_mode,
            background_color:
                savedBackgroundColor,
            card_color_mode:
                settings.card_color_mode,
            card_color:
                savedCardColor,
            card_style:
                settings.card_style,
        });
    };

    const submit = (
        event:
            FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        if (
            !can.update ||
            !hasChanges
        ) {
            return;
        }

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
                <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
                    <div className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-primary/10 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-24 left-1/3 size-48 rounded-full bg-primary/[0.06] blur-3xl" />

                    <div className="relative flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex min-w-0 items-start gap-4">
                            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary shadow-sm">
                                <Settings className="size-5" />
                            </div>

                            <div className="min-w-0">
                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
                                        {labels.controlCenter}
                                    </span>

                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                            form.recentlySuccessful
                                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                : hasChanges
                                                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                                  : 'bg-muted text-muted-foreground'
                                        }`}
                                    >
                                        {form.recentlySuccessful ? (
                                            <CheckCircle2 className="size-3" />
                                        ) : (
                                            <Check className="size-3" />
                                        )}

                                        {form.recentlySuccessful
                                            ? labels.saved
                                            : hasChanges
                                              ? labels.unsaved
                                              : labels.allSaved}
                                    </span>
                                </div>

                                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                    {t(
                                        'settings.title',
                                    )}
                                </h1>

                                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                                    {labels.summary}
                                </p>
                            </div>
                        </div>

                        <div className="grid shrink-0 grid-cols-3 gap-2 lg:min-w-[360px]">
                            <div className="min-w-0 rounded-xl border bg-background/70 p-3 backdrop-blur">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Palette className="size-4" />
                                    <span className="truncate text-[10px] font-semibold uppercase tracking-[0.08em]">
                                        {labels.primary}
                                    </span>
                                </div>
                                <p className="mt-2 truncate font-mono text-xs font-semibold">
                                    {form.data.primary_color}
                                </p>
                            </div>

                            <div className="min-w-0 rounded-xl border bg-background/70 p-3 backdrop-blur">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Languages className="size-4" />
                                    <span className="truncate text-[10px] font-semibold uppercase tracking-[0.08em]">
                                        {labels.locale}
                                    </span>
                                </div>
                                <p className="mt-2 truncate text-xs font-semibold">
                                    {form.data.locale.toUpperCase()}
                                </p>
                            </div>

                            <div className="min-w-0 rounded-xl border bg-background/70 p-3 backdrop-blur">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <LayoutDashboard className="size-4" />
                                    <span className="truncate text-[10px] font-semibold uppercase tracking-[0.08em]">
                                        {labels.records}
                                    </span>
                                </div>
                                <p className="mt-2 truncate text-xs font-semibold">
                                    {form.data.per_page}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {!can.update && (
                    <div className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] p-4 text-sm text-amber-700 dark:text-amber-300">
                        <MonitorCog className="mt-0.5 size-4 shrink-0" />
                        {labels.readonly}
                    </div>
                )}

                {Object.keys(
                    form.errors,
                ).length > 0 && (
                    <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 shadow-sm">
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

                    <section className="min-w-0 overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
                        <div className="border-b border-border/70 bg-muted/15 p-5 sm:p-6">
                            <div className="flex items-center gap-3">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border bg-background text-primary shadow-sm">
                                    <LayoutDashboard className="size-4" />
                                </div>

                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-[10px] font-bold text-primary">
                                            01
                                        </span>

                                        <h2 className="font-semibold">
                                            {t(
                                                'settings.identity',
                                            )}
                                        </h2>
                                    </div>
                                </div>
                            </div>

                            <p className="mt-1 text-sm text-muted-foreground">
                                {t(
                                    'settings.identity_description',
                                )}
                            </p>
                        </div>

                        <div className="grid gap-5 p-5 sm:p-6 min-[720px]:grid-cols-2">
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
                                        className="h-11 w-full rounded-xl border bg-background pl-10 pr-3 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
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
                                    className="h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
                                />

                                {form.errors.short_name && (
                                    <p className="text-sm text-destructive">
                                        {form.errors.short_name}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Branding */}

                        <div className="border-t border-border/70 p-5 sm:p-6">
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

                                <div className="min-w-0 rounded-2xl border border-border/70 bg-background/30 p-4 transition hover:border-primary/20">
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

                                    <div className="mt-3 flex h-32 items-center justify-center overflow-hidden rounded-xl border bg-white p-3">
                                        {logoLightPreview ? (
                                            <img
                                                src={
                                                    logoLightPreview
                                                }
                                                alt={t(
                                                    'settings.logo_light',
                                                )}
                                                className="max-h-full object-contain object-center"
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
                                        <label className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 text-xs font-semibold transition hover:border-primary/30 hover:bg-primary/[0.04]">
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
                                                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border px-3 text-xs font-semibold text-destructive transition hover:border-destructive/30 hover:bg-destructive/10"
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

                                <div className="min-w-0 rounded-2xl border border-border/70 bg-background/30 p-4 transition hover:border-primary/20">
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

                                    <div className="mt-3 flex h-32 items-center justify-center overflow-hidden rounded-xl border bg-zinc-950 p-3">
                                        {logoDarkPreview ? (
                                            <img
                                                src={
                                                    logoDarkPreview
                                                }
                                                alt={t(
                                                    'settings.logo_dark',
                                                )}
                                                className="max-h-full object-contain object-center"
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
                                        <label className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 text-xs font-semibold transition hover:border-primary/30 hover:bg-primary/[0.04]">
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
                                                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border px-3 text-xs font-semibold text-destructive transition hover:border-destructive/30 hover:bg-destructive/10"
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

                                <div className="min-w-0 rounded-2xl border border-border/70 bg-background/30 p-4 transition hover:border-primary/20">
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

                                    <div className="mt-3 flex h-32 items-center justify-center overflow-hidden rounded-xl border bg-background p-4">
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
                                        <label className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 text-xs font-semibold transition hover:border-primary/30 hover:bg-primary/[0.04]">
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
                                                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border px-3 text-xs font-semibold text-destructive transition hover:border-destructive/30 hover:bg-destructive/10"
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

                            <div className="mt-5 rounded-2xl border border-border/70 bg-muted/15 p-4 sm:p-5">
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

                                    <span className="shrink-0 rounded-xl border bg-background px-3 py-1.5 font-mono text-xs font-semibold">
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

                    <section className="min-w-0 overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
                        <div className="border-b border-border/70 bg-muted/15 p-5 sm:p-6">
                            <div className="flex items-center gap-3">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border bg-background text-primary shadow-sm">
                                    <Palette className="size-4" />
                                </div>

                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-[10px] font-bold text-primary">
                                            02
                                        </span>

                                        <h2 className="font-semibold">
                                            {t(
                                                'settings.appearance',
                                            )}
                                        </h2>
                                    </div>
                                </div>
                            </div>

                            <p className="mt-1 text-sm text-muted-foreground">
                                {t(
                                    'settings.appearance_description',
                                )}
                            </p>
                        </div>

                        <div className="grid min-w-0 gap-7 p-5 sm:p-6 min-[1050px]:grid-cols-[minmax(0,1fr)_minmax(340px,430px)]">
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
                                            className="flex h-11 w-full cursor-pointer items-center gap-3 rounded-xl border bg-background px-3 transition hover:border-primary/30 min-[480px]:w-auto"
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
                                            className="h-11 w-full min-w-0 rounded-xl border bg-background px-3 font-mono text-sm uppercase outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60 min-[480px]:max-w-44"
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
                                                        className={`flex min-w-0 items-center gap-2 rounded-xl border p-3 text-left transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60 ${
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
                                            className={`rounded-xl border p-3.5 text-left transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60 ${
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
                                            className={`rounded-xl border p-3.5 text-left transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60 ${
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
                                                    className="flex h-11 w-full cursor-pointer items-center gap-3 rounded-xl border bg-background px-3 transition hover:border-primary/30 min-[480px]:w-auto"
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
                                                    className="h-11 w-full min-w-0 rounded-xl border bg-background px-3 font-mono text-sm uppercase outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60 min-[480px]:max-w-44"
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
                                                                className={`flex min-w-0 items-center gap-2 rounded-xl border p-3 text-left transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60 ${
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
                                                className={`flex items-center justify-center gap-2 rounded-xl border p-3.5 text-xs font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60 ${
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
                                                className={`flex items-center justify-center gap-2 rounded-xl border p-3.5 text-xs font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60 ${
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
                                            <div className="rounded-xl border border-dashed border-primary/25 bg-primary/[0.05] p-3.5">
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
                                            className="flex h-11 w-full cursor-pointer items-center gap-3 rounded-xl border bg-background px-3 transition hover:border-primary/30 min-[480px]:w-auto"
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
                                            className="h-11 w-full min-w-0 rounded-xl border bg-background px-3 font-mono text-sm uppercase outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60 min-[480px]:max-w-44"
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
                                                        className={`flex min-w-0 items-center gap-2 rounded-xl border p-3 text-left transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60 ${
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
                                            className={`flex items-center gap-3 rounded-xl border p-3.5 text-left transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60 ${
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
                                            className={`flex items-center gap-3 rounded-xl border p-3.5 text-left transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60 ${
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
                                            className={`rounded-xl border p-3.5 text-left transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60 ${
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
                                            className={`rounded-xl border p-3.5 text-left transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60 ${
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
                                                    className="flex h-11 w-full cursor-pointer items-center gap-3 rounded-xl border bg-background px-3 transition hover:border-primary/30 min-[480px]:w-auto"
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
                                                    className="h-11 w-full min-w-0 rounded-xl border bg-background px-3 font-mono text-sm uppercase outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60 min-[480px]:max-w-44"
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
                                                                className={`flex min-w-0 items-center gap-2 rounded-xl border p-3 text-left transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60 ${
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
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-medium">
                                            {labels.preview}
                                        </p>

                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            {labels.previewHint}
                                        </p>
                                    </div>

                                    <Sparkles className="size-4 text-primary" />
                                </div>

                                <PanelPreview
                                    panelName={form.data.panel_name}
                                    shortName={form.data.short_name}
                                    primaryColor={form.data.primary_color}
                                    sidebarColor={form.data.sidebar_color}
                                    sidebarShape={form.data.sidebar_shape}
                                    backgroundColorMode={form.data.background_color_mode}
                                    backgroundColor={form.data.background_color}
                                    cardColorMode={form.data.card_color_mode}
                                    cardColor={form.data.card_color}
                                    cardStyle={form.data.card_style}
                                    logoLight={logoLightPreview}
                                    logoDark={logoDarkPreview}
                                    logoSize={form.data.logo_size}
                                    labels={labels}
                                />
                            </div>
                        </div>
                    </section>

                    {/* ======================================================
                        REGIONAL
                    ======================================================= */}

                    <section className="min-w-0 overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
                        <div className="border-b border-border/70 bg-muted/15 p-5 sm:p-6">
                            <div className="flex items-center gap-3">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border bg-background text-primary shadow-sm">
                                    <Globe2 className="size-4" />
                                </div>

                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-[10px] font-bold text-primary">
                                            03
                                        </span>

                                        <h2 className="font-semibold">
                                            {t(
                                                'settings.regional',
                                            )}
                                        </h2>
                                    </div>
                                </div>
                            </div>

                            <p className="mt-1 text-sm text-muted-foreground">
                                {t(
                                    'settings.regional_description',
                                )}
                            </p>
                        </div>

                        <div className="grid min-w-0 gap-5 p-5 sm:p-6 min-[720px]:grid-cols-2 min-[1200px]:grid-cols-3">
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
                                    className="h-11 w-full min-w-0 rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
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
                                    className="h-11 w-full min-w-0 rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
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
                                    className="h-11 w-full min-w-0 rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
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
                                    className="h-11 w-full min-w-0 rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
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
                                    className="h-11 w-full min-w-0 rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
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
                        <div className="sticky bottom-4 z-30">
                            <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/95 p-3 shadow-xl backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex min-w-0 items-center gap-3 px-1">
                                    <div
                                        className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${
                                            form.recentlySuccessful
                                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                : hasChanges
                                                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                                  : 'bg-muted text-muted-foreground'
                                        }`}
                                    >
                                        {form.recentlySuccessful ? (
                                            <CheckCircle2 className="size-4" />
                                        ) : hasChanges ? (
                                            <Sparkles className="size-4" />
                                        ) : (
                                            <Check className="size-4" />
                                        )}
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold">
                                            {form.recentlySuccessful
                                                ? labels.saved
                                                : hasChanges
                                                  ? labels.unsaved
                                                  : labels.allSaved}
                                        </p>

                                        {hasChanges && (
                                            <p className="truncate text-xs text-muted-foreground">
                                                {labels.pending}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 sm:flex-row">
                                    <button
                                        type="button"
                                        onClick={
                                            discardChanges
                                        }
                                        disabled={
                                            form.processing ||
                                            !hasChanges
                                        }
                                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <Undo2 className="size-4" />
                                        {labels.discard}
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={
                                            form.processing ||
                                            !hasChanges
                                        }
                                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {form.processing ? (
                                            <LoaderCircle className="size-4 animate-spin" />
                                        ) : (
                                            <Save className="size-4" />
                                        )}

                                        {form.processing
                                            ? t(
                                                  'settings.saving',
                                              )
                                            : t(
                                                  'settings.save',
                                              )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </AppLayout>
    );
}

/* ==========================================================================
   VISTA PREVIA DEL PANEL
   ========================================================================== */

function PanelPreview({
    panelName,
    shortName,
    primaryColor,
    sidebarColor,
    sidebarShape,
    backgroundColorMode,
    backgroundColor,
    cardColorMode,
    cardColor,
    cardStyle,
    logoLight,
    logoDark,
    logoSize,
    labels,
}: {
    panelName: string;
    shortName: string;
    primaryColor: string;
    sidebarColor: string;
    sidebarShape: 'normal' | 'rounded';
    backgroundColorMode: 'auto' | 'custom';
    backgroundColor: string;
    cardColorMode: 'auto' | 'custom';
    cardColor: string;
    cardStyle: 'solid' | 'glass';
    logoLight: string | null;
    logoDark: string | null;
    logoSize: number;
    labels: {
        preview: string;
        previewHint: string;
        dashboard: string;
        users: string;
        settingsNav: string;
        activeModule: string;
        exampleCard: string;
        exampleText: string;
    };
}) {
    const safePrimary = isValidHex(primaryColor)
        ? primaryColor
        : '#7C3AED';

    const safeSidebar = isValidHex(sidebarColor)
        ? sidebarColor
        : '#111827';

    const sidebarIsDark = isDarkColor(safeSidebar);

    const previewLogo = sidebarIsDark
        ? logoDark ?? logoLight
        : logoLight ?? logoDark;

    const previewBackground =
        backgroundColorMode === 'custom' &&
        isValidHex(backgroundColor)
            ? backgroundColor
            : undefined;

    const customCardColor =
        cardColorMode === 'custom' &&
        isValidHex(cardColor)
            ? cardColor
            : undefined;

    const previewCardBackground = customCardColor
        ? cardStyle === 'glass'
            ? hexToRgba(customCardColor, 0.72)
            : customCardColor
        : undefined;

    const cardTextDark = customCardColor
        ? !isDarkColor(customCardColor)
        : false;

    return (
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-background shadow-sm">
            {/* Barra superior */}
            <div className="flex items-center justify-between border-b border-border/70 bg-card/70 px-4 py-3 backdrop-blur">
                <div className="flex min-w-0 items-center gap-3">
                    <div
                        className="flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-black text-white shadow-sm"
                        style={{
                            backgroundColor: safePrimary,
                        }}
                    >
                        {shortName
                            .trim()
                            .charAt(0)
                            .toUpperCase() || 'C'}
                    </div>

                    <div className="min-w-0">
                        <p className="truncate text-xs font-semibold">
                            {panelName || 'CIVAN Panel'}
                        </p>

                        <p className="truncate text-[10px] text-muted-foreground">
                            {labels.preview}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="hidden font-mono text-[9px] text-muted-foreground sm:inline">
                        {safePrimary.toUpperCase()}
                    </span>

                    <span
                        className="size-2 rounded-full shadow-sm"
                        style={{
                            backgroundColor: safePrimary,
                        }}
                    />
                </div>
            </div>

            {/* Mini aplicación */}
            <div
                className="grid min-h-[330px] grid-cols-[108px_minmax(0,1fr)] p-2"
                style={
                    previewBackground
                        ? {
                              backgroundColor: previewBackground,
                          }
                        : undefined
                }
            >
                <aside
                    className={[
                        'flex min-w-0 flex-col border border-black/5 p-2 shadow-sm transition-all',
                        sidebarShape === 'rounded'
                            ? 'rounded-xl'
                            : 'rounded-sm',
                    ].join(' ')}
                    style={{
                        backgroundColor: safeSidebar,
                        color: sidebarIsDark
                            ? '#F8FAFC'
                            : '#18181B',
                    }}
                >
                    {/* Logo */}
                    <div className="mb-4 flex h-11 items-center justify-center overflow-hidden px-1">
                        {previewLogo ? (
                            <img
                                src={previewLogo}
                                alt={panelName || 'CIVAN'}
                                className="max-h-full object-contain object-center"
                                style={{
                                    width: `${Math.min(
                                        100,
                                        Math.max(50, logoSize),
                                    )}%`,
                                }}
                            />
                        ) : (
                            <div
                                className="flex size-8 items-center justify-center rounded-lg text-xs font-black text-white"
                                style={{
                                    backgroundColor: safePrimary,
                                }}
                            >
                                {shortName
                                    .trim()
                                    .charAt(0)
                                    .toUpperCase() || 'C'}
                            </div>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <div
                            className="rounded-lg px-2 py-2 text-[9px] font-semibold"
                            style={{
                                backgroundColor: hexToRgba(
                                    safePrimary,
                                    sidebarIsDark ? 0.28 : 0.14,
                                ),
                                color: sidebarIsDark
                                    ? '#FFFFFF'
                                    : safePrimary,
                            }}
                        >
                            {labels.dashboard}
                        </div>

                        <div
                            className="rounded-lg px-2 py-2 text-[9px] opacity-70"
                        >
                            {labels.users}
                        </div>

                        <div
                            className="rounded-lg px-2 py-2 text-[9px] opacity-70"
                        >
                            {labels.settingsNav}
                        </div>
                    </div>

                    <div className="mt-auto pt-4">
                        <div className="h-1.5 w-10 rounded-full bg-current opacity-10" />
                        <div className="mt-2 h-1.5 w-14 rounded-full bg-current opacity-10" />
                    </div>
                </aside>

                <main className="min-w-0 p-3 sm:p-4">
                    {/* Encabezado del contenido */}
                    <div className="mb-4 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <div
                                className="h-2.5 w-24 rounded-full"
                                style={{
                                    backgroundColor: hexToRgba(
                                        safePrimary,
                                        0.2,
                                    ),
                                }}
                            />

                            <div className="mt-2 h-2 w-32 max-w-full rounded-full bg-foreground/10" />
                        </div>

                        <button
                            type="button"
                            className="h-7 shrink-0 rounded-lg px-3 text-[9px] font-semibold text-white shadow-sm"
                            style={{
                                backgroundColor: safePrimary,
                            }}
                        >
                            {shortName || 'CIVAN'}
                        </button>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                        <PreviewCard
                            title={labels.exampleCard}
                            primaryColor={safePrimary}
                            backgroundColor={previewCardBackground}
                            glass={cardStyle === 'glass'}
                            darkText={cardTextDark}
                        />

                        <PreviewCard
                            title={labels.activeModule}
                            primaryColor={safePrimary}
                            backgroundColor={previewCardBackground}
                            glass={cardStyle === 'glass'}
                            darkText={cardTextDark}
                            action
                        />
                    </div>

                    <div
                        className={[
                            'mt-3 rounded-xl border p-3 shadow-sm',
                            cardStyle === 'glass'
                                ? 'backdrop-blur-xl'
                                : '',
                            !previewCardBackground
                                ? cardStyle === 'glass'
                                    ? 'bg-card/70'
                                    : 'bg-card'
                                : '',
                        ].join(' ')}
                        style={
                            previewCardBackground
                                ? {
                                      backgroundColor:
                                          previewCardBackground,
                                  }
                                : undefined
                        }
                    >
                        <div className="flex items-center gap-2">
                            <span
                                className="size-2 rounded-full"
                                style={{
                                    backgroundColor: safePrimary,
                                }}
                            />

                            <div className="h-2 w-20 rounded-full bg-foreground/10" />
                        </div>

                        <div className="mt-3 grid grid-cols-3 gap-2">
                            <div className="h-8 rounded-lg border bg-background/50" />
                            <div className="h-8 rounded-lg border bg-background/50" />
                            <div className="h-8 rounded-lg border bg-background/50" />
                        </div>
                    </div>

                    <p className="mt-3 text-[9px] leading-4 text-muted-foreground">
                        {labels.exampleText}
                    </p>
                </main>
            </div>
        </div>
    );
}

function PreviewCard({
    title,
    primaryColor,
    backgroundColor,
    glass,
    darkText,
    action = false,
}: {
    title: string;
    primaryColor: string;
    backgroundColor?: string;
    glass: boolean;
    darkText: boolean;
    action?: boolean;
}) {
    return (
        <div
            className={[
                'rounded-xl border p-3 shadow-sm',
                glass ? 'backdrop-blur-xl' : '',
                !backgroundColor
                    ? glass
                        ? 'bg-card/70'
                        : 'bg-card'
                    : '',
            ].join(' ')}
            style={
                backgroundColor
                    ? {
                          backgroundColor,
                          color: darkText
                              ? '#18181B'
                              : '#F8FAFC',
                      }
                    : undefined
            }
        >
            <div className="flex items-center justify-between gap-2">
                <span className="truncate text-[9px] font-semibold">
                    {title}
                </span>

                <span
                    className="size-2 shrink-0 rounded-full"
                    style={{
                        backgroundColor: primaryColor,
                    }}
                />
            </div>

            {action ? (
                <button
                    type="button"
                    className="mt-3 flex h-7 w-full items-center justify-center rounded-lg text-[9px] font-semibold text-white"
                    style={{
                        backgroundColor: primaryColor,
                    }}
                >
                    CIVAN
                </button>
            ) : (
                <>
                    <div className="mt-3 h-2 w-14 rounded-full bg-current opacity-10" />
                    <div className="mt-2 h-2 w-20 rounded-full bg-current opacity-10" />
                </>
            )}
        </div>
    );
}

function isValidHex(value: string): boolean {
    return /^#[0-9A-Fa-f]{6}$/.test(value);
}

function isDarkColor(value: string): boolean {
    if (!isValidHex(value)) {
        return false;
    }

    const red = parseInt(value.slice(1, 3), 16);
    const green = parseInt(value.slice(3, 5), 16);
    const blue = parseInt(value.slice(5, 7), 16);

    const luminance =
        (0.299 * red +
            0.587 * green +
            0.114 * blue) /
        255;

    return luminance < 0.55;
}

function hexToRgba(
    value: string,
    alpha: number,
): string {
    if (!isValidHex(value)) {
        return `rgba(124, 58, 237, ${alpha})`;
    }

    const red = parseInt(value.slice(1, 3), 16);
    const green = parseInt(value.slice(3, 5), 16);
    const blue = parseInt(value.slice(5, 7), 16);

    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

