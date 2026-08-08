import '../css/app.css';

import {
    createInertiaApp,
    router,
} from '@inertiajs/react';

import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { route as routeFn } from 'ziggy-js';

import { initializeTheme } from './hooks/use-appearance';

declare global {
    const route: typeof routeFn;
}

type SharedPageProps = {
    system?: {
        panel_name?: string;
    };
};

/*
|--------------------------------------------------------------------------
| Nombre del panel
|--------------------------------------------------------------------------
|
| Se usa VITE_APP_NAME únicamente como respaldo. Cuando Laravel comparte
| system.panel_name mediante Inertia, ese valor pasa a ser el nombre oficial
| mostrado en las pestañas del navegador.
|
*/

let appName =
    import.meta.env.VITE_APP_NAME ||
    'CIVAN Panel';

createInertiaApp({
    /*
    |--------------------------------------------------------------------------
    | Título del navegador
    |--------------------------------------------------------------------------
    */

    title: (title) =>
        title
            ? `${title} | ${appName}`
            : appName,

    /*
    |--------------------------------------------------------------------------
    | Resolver páginas
    |--------------------------------------------------------------------------
    */

    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob(
                './pages/**/*.tsx',
            ),
        ),

    /*
    |--------------------------------------------------------------------------
    | Inicializar aplicación
    |--------------------------------------------------------------------------
    */

    setup({
        el,
        App,
        props,
    }) {
        /*
        |--------------------------------------------------------------------------
        | Obtener nombre inicial desde system_settings
        |--------------------------------------------------------------------------
        */

        const initialProps =
            props.initialPage.props as
                SharedPageProps;

        if (
            initialProps.system?.panel_name
        ) {
            appName =
                initialProps.system.panel_name;
        }

        /*
        |--------------------------------------------------------------------------
        | Mantener actualizado el nombre al navegar con Inertia
        |--------------------------------------------------------------------------
        |
        | Esto también permite que, si el administrador cambia el nombre del
        | panel desde Configuración del sistema, la pestaña use el nuevo nombre
        | sin depender de VITE_APP_NAME.
        |
        */

        router.on(
            'navigate',
            (event) => {
                const pageProps =
                    event.detail.page.props as
                        SharedPageProps;

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

                /*
                |--------------------------------------------------------------------------
                | Corregir inmediatamente el título actual
                |--------------------------------------------------------------------------
                |
                | Si Head se renderizó antes del evento navigate, sustituimos
                | el nombre anterior para que el cambio sea visible al instante.
                |
                */

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

// This will set light / dark mode on load...
initializeTheme();
