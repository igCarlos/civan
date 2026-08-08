import '../css/app.css';
import '../css/civan-dynamic-theme.css';

import {
    createInertiaApp,
    router,
} from '@inertiajs/react';

import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { route as routeFn } from 'ziggy-js';

import { initializeTheme } from './hooks/use-appearance';

import {
    applySystemAppearance,
} from './lib/system-theme';

declare global {
    const route: typeof routeFn;
}

type SharedPageProps = {
    system?: {
        panel_name?: string;
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
            props.initialPage.props as
                SharedPageProps;

        /*
        |--------------------------------------------------------------------------
        | Nombre inicial
        |--------------------------------------------------------------------------
        */

        if (
            initialProps.system?.panel_name
        ) {
            appName =
                initialProps.system.panel_name;
        }

        /*
        |--------------------------------------------------------------------------
        | Apariencia personal claro / oscuro
        |--------------------------------------------------------------------------
        |
        | Primero dejamos que el Starter Kit determine claro/oscuro.
        | Luego CIVAN aplica sus personalizaciones globales.
        |
        | Esto es importante para:
        | - fondo automático
        | - cards automáticas
        | - fondo personalizado
        | - sidebar
        |
        */

        initializeTheme();

        /*
        |--------------------------------------------------------------------------
        | Apariencia global guardada
        |--------------------------------------------------------------------------
        |
        | ESTA LLAMADA es la que hace que los valores guardados en
        | system_settings vuelvan a aplicarse después de F5 / Ctrl+R.
        |
        */

        applyAppearance(
            initialProps.system,
        );

        /*
        |--------------------------------------------------------------------------
        | Navegaciones Inertia
        |--------------------------------------------------------------------------
        */

        router.on(
            'navigate',
            (event) => {
                const pageProps =
                    event.detail.page.props as
                        SharedPageProps;

                /*
                |--------------------------------------------------------------------------
                | Reaplicar apariencia
                |--------------------------------------------------------------------------
                |
                | También restaura la configuración guardada si el administrador
                | hizo cambios de vista previa pero salió sin guardar.
                |
                */

                applyAppearance(
                    pageProps.system,
                );

                /*
                |--------------------------------------------------------------------------
                | Nombre del panel
                |--------------------------------------------------------------------------
                */

                const nextAppName =
                    pageProps.system?.panel_name;

                if (
                    !nextAppName ||
                    nextAppName === appName
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
            createRoot(el);

        root.render(
            <App {...props} />,
        );
    },

    progress: {
        color: '#4B5563',
    },
});
