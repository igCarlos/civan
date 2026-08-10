import '../css/app.css';
import '../css/civan-dynamic-theme.css';

import {
    createInertiaApp,
    router,
} from '@inertiajs/react';

import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { route as routeFn } from 'ziggy-js';

import RateLimitAlert from '@/components/ui/rate-limit-alert';

import { initializeTheme } from './hooks/use-appearance';

import {
    applySystemAppearance,
} from './lib/system-theme';

declare global {
    const route: typeof routeFn;

    interface Window {
        __civanRateLimitListenerInstalled?: boolean;
    }
}

type SharedPageProps = {
    system?: {
        panel_name?: string;
        logo_light?: string | null;
        logo_dark?: string | null;
        favicon?: string | null;
        primary_color?: string;
        sidebar_color?: string;
        sidebar_shape?: string;
        background_color_mode?: string;
        background_color?: string;
        card_color_mode?: string;
        card_color?: string;
        card_style?: string;
    };
};

interface InertiaHttpExceptionDetail {
    response?: {
        status?: number;
        headers?: unknown;
    };
}

let appName =
    import.meta.env.VITE_APP_NAME ||
    'CIVAN Panel';

/**
 * Aplicar toda la apariencia global enviada por Laravel.
 */
function applyAppearance(
    system:
        | SharedPageProps['system']
        | undefined,
): void {
    applySystemAppearance({
        primary_color:
            system?.primary_color,

        sidebar_color:
            system?.sidebar_color,

        sidebar_shape:
            system?.sidebar_shape,

        background_color_mode:
            system?.background_color_mode,

        background_color:
            system?.background_color,

        card_color_mode:
            system?.card_color_mode,

        card_color:
            system?.card_color,

        card_style:
            system?.card_style,
    });
}

/*
|--------------------------------------------------------------------------
| Favicon dinámico
|--------------------------------------------------------------------------
*/

const initialFavicon =
    (
        document.querySelector(
            'link[rel~="icon"]',
        ) as HTMLLinkElement | null
    )?.href ??
    '/favicon.ico';

function applyFavicon(
    favicon:
        | string
        | null
        | undefined,
): void {
    let link =
        document.querySelector(
            'link[data-civan-favicon]',
        ) as HTMLLinkElement | null;

    if (!link) {
        link =
            document.querySelector(
                'link[rel~="icon"]',
            ) as HTMLLinkElement | null;
    }

    if (!link) {
        link =
            document.createElement(
                'link',
            );

        link.rel =
            'icon';

        document.head.appendChild(
            link,
        );
    }

    link.dataset.civanFavicon =
        'true';

    link.href =
        favicon ||
        initialFavicon;
}

/*
|--------------------------------------------------------------------------
| Helpers del Rate Limiter
|--------------------------------------------------------------------------
*/

function getHeaderValue(
    headers: unknown,
    name: string,
): string | null {
    if (
        !headers ||
        typeof headers !==
            'object'
    ) {
        return null;
    }

    const source =
        headers as {
            get?: (
                key: string,
            ) =>
                | string
                | null
                | undefined;

            [key: string]:
                unknown;
        };

    if (
        typeof source.get ===
        'function'
    ) {
        const value =
            source.get(
                name,
            ) ??
            source.get(
                name.toLowerCase(),
            );

        if (
            value !== null &&
            value !== undefined
        ) {
            return String(
                value,
            );
        }
    }

    const direct =
        source[name] ??
        source[
            name.toLowerCase()
        ];

    if (
        direct === null ||
        direct === undefined
    ) {
        return null;
    }

    if (
        Array.isArray(
            direct,
        )
    ) {
        return String(
            direct[0] ??
                '',
        );
    }

    return String(
        direct,
    );
}

function dispatchRateLimitAlert(
    detail:
        InertiaHttpExceptionDetail,
): void {
    const response =
        detail.response;

    if (
        response?.status !==
        429
    ) {
        return;
    }

    const retryAfterRaw =
        getHeaderValue(
            response.headers,
            'Retry-After',
        );

    const retryAfter =
        Math.max(
            1,
            Number.parseInt(
                retryAfterRaw ??
                    '60',
                10,
            ) ||
                60,
        );

    window.dispatchEvent(
        new CustomEvent(
            'civan:rate-limit',
            {
                detail: {
                    id:
                        `${Date.now()}-${Math.random()}`,

                    retryAfter,

                    title:
                        'Demasiadas solicitudes',

                    message:
                        `Has alcanzado el límite de solicitudes. ` +
                        `Intenta nuevamente en ${retryAfter} ` +
                        `${retryAfter === 1 ? 'segundo' : 'segundos'}.`,
                },
            },
        ),
    );
}

/*
|--------------------------------------------------------------------------
| Capturar HTTP 429 globalmente
|--------------------------------------------------------------------------
|
| Inertia v3 usa:
|   inertia:httpException
|
| Inertia v2 usaba:
|   inertia:invalid
|
| Escuchamos ambos para mantener CIVAN compatible.
|
*/

function installRateLimitListener(): void {
    if (
        window
            .__civanRateLimitListenerInstalled
    ) {
        return;
    }

    window.__civanRateLimitListenerInstalled =
        true;

    const handleHttpException =
        (
            nativeEvent:
                Event,
        ) => {
            const event =
                nativeEvent as
                    CustomEvent<InertiaHttpExceptionDetail>;

            if (
                event.detail
                    ?.response
                    ?.status !==
                429
            ) {
                return;
            }

            /*
            |--------------------------------------------------------------------------
            | Evitar el modal de error de Inertia
            |--------------------------------------------------------------------------
            */

            event.preventDefault();

            dispatchRateLimitAlert(
                event.detail,
            );
        };

    document.addEventListener(
        'inertia:httpException',
        handleHttpException,
    );

    document.addEventListener(
        'inertia:invalid',
        handleHttpException,
    );
}

createInertiaApp({
    title: (title) =>
        title
            ? `${title} | ${appName}`
            : appName,

    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob(
                './pages/**/*.tsx',
            ),
        ),

    setup({
        el,
        App,
        props,
    }) {
        const initialProps =
            props.initialPage
                .props as
                SharedPageProps;

        /*
        |--------------------------------------------------------------------------
        | Nombre inicial
        |--------------------------------------------------------------------------
        */

        if (
            initialProps.system
                ?.panel_name
        ) {
            appName =
                initialProps
                    .system
                    .panel_name;
        }

        /*
        |--------------------------------------------------------------------------
        | Apariencia personal claro / oscuro
        |--------------------------------------------------------------------------
        */

        initializeTheme();

        /*
        |--------------------------------------------------------------------------
        | Apariencia global guardada
        |--------------------------------------------------------------------------
        */

        applyAppearance(
            initialProps.system,
        );

        applyFavicon(
            initialProps.system
                ?.favicon,
        );

        /*
        |--------------------------------------------------------------------------
        | Rate Limiter global
        |--------------------------------------------------------------------------
        |
        | Se instala antes de renderizar React para garantizar que CIVAN pueda
        | cancelar el modal de respuesta inválida de Inertia.
        |
        */

        installRateLimitListener();

        /*
        |--------------------------------------------------------------------------
        | Navegaciones Inertia
        |--------------------------------------------------------------------------
        */

        router.on(
            'navigate',
            (event) => {
                const pageProps =
                    event.detail
                        .page
                        .props as
                        SharedPageProps;

                applyAppearance(
                    pageProps.system,
                );

                applyFavicon(
                    pageProps.system
                        ?.favicon,
                );

                /*
                |--------------------------------------------------------------------------
                | Nombre del panel
                |--------------------------------------------------------------------------
                */

                const nextAppName =
                    pageProps.system
                        ?.panel_name;

                if (
                    !nextAppName ||
                    nextAppName ===
                        appName
                ) {
                    return;
                }

                const previousAppName =
                    appName;

                appName =
                    nextAppName;

                const pipeSuffix =
                    ` | ${previousAppName}`;

                const dashSuffix =
                    ` - ${previousAppName}`;

                let pageTitle =
                    document.title;

                if (
                    pageTitle.endsWith(
                        pipeSuffix,
                    )
                ) {
                    pageTitle =
                        pageTitle.slice(
                            0,
                            -pipeSuffix.length,
                        );
                } else if (
                    pageTitle.endsWith(
                        dashSuffix,
                    )
                ) {
                    pageTitle =
                        pageTitle.slice(
                            0,
                            -dashSuffix.length,
                        );
                }

                document.title =
                    pageTitle
                        ? `${pageTitle} | ${appName}`
                        : appName;
            },
        );

        const root =
            createRoot(
                el,
            );

        /*
        |--------------------------------------------------------------------------
        | Alert global
        |--------------------------------------------------------------------------
        |
        | Está fuera de AppLayout. Por eso también puede mostrarse en login,
        | register, forgot-password, etc.
        |
        */

        root.render(
            <>
                <RateLimitAlert />

                <App
                    {...props}
                />
            </>,
        );
    },

    progress: {
        color: '#4B5563',
    },
});
