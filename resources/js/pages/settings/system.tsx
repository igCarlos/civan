import {
    Head,
    useForm,
} from '@inertiajs/react';

import {
    CalendarDays,
    Check,
    Clock3,
    Globe2,
    Languages,
    LayoutDashboard,
    Palette,
    RotateCcw,
    Save,
    Settings,
    TextCursorInput,
} from 'lucide-react';

import {
    FormEvent,
    useEffect,
} from 'react';

import {
    useTranslation,
} from '@/hooks/use-translation';

import AppLayout from '@/layouts/app-layout';

import {
    applySystemPrimaryColor,
    normalizeHexColor,
} from '@/lib/system-theme';

import {
    type BreadcrumbItem,
} from '@/types';

interface SystemSettings {
    panel_name: string;
    short_name: string;
    primary_color: string;
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

            primary_color:
                normalizeHexColor(
                    settings.primary_color,
                ),

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
        if (
            /^#[0-9A-Fa-f]{6}$/.test(
                form.data.primary_color,
            )
        ) {
            applySystemPrimaryColor(
                form.data.primary_color,
            );
        }
    }, [
        form.data.primary_color,
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

        form.put(
            '/dashboard/configuracion/sistema',
            {
                preserveScroll: true,
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
                                                    applySystemPrimaryColor(
                                                        value,
                                                    );
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
