import {
    Head,
    useForm,
} from '@inertiajs/react';

import {
    CalendarDays,
    Clock3,
    Globe2,
    Languages,
    LayoutDashboard,
    Save,
    Settings,
    TextCursorInput,
} from 'lucide-react';

import {
    FormEvent,
} from 'react';

import {
    useTranslation,
} from '@/hooks/use-translation';

import AppLayout from '@/layouts/app-layout';

import {
    type BreadcrumbItem,
} from '@/types';

interface SystemSettings {
    panel_name: string;
    short_name: string;
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

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-start gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-card">
                        <Settings className="size-5" />
                    </div>

                    <div>
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
                    className="space-y-6"
                >
                    <section className="rounded-xl border bg-card shadow-sm">
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

                        <div className="grid gap-5 p-5 md:grid-cols-2">
                            <div className="space-y-2">
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

                            <div className="space-y-2">
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

                    <section className="rounded-xl border bg-card shadow-sm">
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

                        <div className="grid gap-5 p-5 md:grid-cols-2 xl:grid-cols-3">
                            <div className="space-y-2">
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
                                    className="h-10 w-full rounded-md border bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
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

                            <div className="space-y-2">
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
                                    className="h-10 w-full rounded-md border bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
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

                            <div className="space-y-2">
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
                                    className="h-10 w-full rounded-md border bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
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

                            <div className="space-y-2">
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
                                    className="h-10 w-full rounded-md border bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
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

                            <div className="space-y-2">
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
                                    className="h-10 w-full rounded-md border bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
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
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
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
