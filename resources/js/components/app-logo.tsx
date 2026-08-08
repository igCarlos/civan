import {
    usePage,
} from '@inertiajs/react';

import AppLogoIcon from './app-logo-icon';

type SharedProps = {
    system?: {
        panel_name?: string;
        short_name?: string;
        logo_light?: string | null;
        logo_dark?: string | null;
        favicon?: string | null;
        logo_size?: number | string | null;
    };
};

type LogoImageProps = {
    src: string;
    alt: string;
    dark?: boolean;
    size: number;
};

function clampLogoSize(
    value:
        | number
        | string
        | null
        | undefined,
): number {
    const parsed =
        Number(value);

    if (
        Number.isNaN(
            parsed,
        )
    ) {
        return 75;
    }

    return Math.min(
        100,
        Math.max(
            50,
            parsed,
        ),
    );
}

/**
 * Logo horizontal centrado.
 *
 * La imagen fuente puede tener mucho margen alrededor; object-cover +
 * scale permite ocupar mejor la cabecera del sidebar sin deformarla.
 */
function LogoImage({
    src,
    alt,
    dark = false,
    size,
}: LogoImageProps) {
    return (
        <div
            className={[
                'relative mx-auto flex h-11 max-w-[calc(100%-1.5rem)] items-center justify-center overflow-hidden',
                dark
                    ? 'hidden dark:block'
                    : 'dark:hidden',
            ].join(' ')}
            style={{
                width:
                    `${size}%`,
            }}
        >
            <img
                src={src}
                alt={alt}
                className="absolute inset-0 size-full object-cover object-center"
            />
        </div>
    );
}

export default function AppLogo() {
    const {
        system,
    } = usePage().props as SharedProps;

    const panelName =
        system?.panel_name ??
        'CIVAN';

    const logoSize =
        clampLogoSize(
            system?.logo_size,
        );

    /*
    |--------------------------------------------------------------------------
    | Fallback entre logos
    |--------------------------------------------------------------------------
    */

    const lightLogo =
        system?.logo_light ??
        system?.logo_dark ??
        null;

    const darkLogo =
        system?.logo_dark ??
        system?.logo_light ??
        null;

    const hasCustomLogo =
        Boolean(
            lightLogo ||
                darkLogo
        );

    const collapsedIcon =
        system?.favicon ??
        null;

    return (
        <div className="flex min-h-16 w-full min-w-0 items-center justify-center py-2">
            {hasCustomLogo ? (
                <>
                    {/* Sidebar expandido */}

                    <div className="flex min-h-12 w-full min-w-0 items-center justify-center group-data-[collapsible=icon]:hidden">
                        {lightLogo && (
                            <LogoImage
                                src={
                                    lightLogo
                                }
                                alt={
                                    panelName
                                }
                                size={
                                    logoSize
                                }
                            />
                        )}

                        {darkLogo && (
                            <LogoImage
                                src={
                                    darkLogo
                                }
                                alt={
                                    panelName
                                }
                                dark
                                size={
                                    logoSize
                                }
                            />
                        )}
                    </div>

                    {/* Sidebar colapsado */}

                    <div className="hidden size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg group-data-[collapsible=icon]:flex">
                        {collapsedIcon ? (
                            <img
                                src={
                                    collapsedIcon
                                }
                                alt={
                                    panelName
                                }
                                className="size-8 object-contain"
                            />
                        ) : (
                            <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                                <AppLogoIcon className="size-5 fill-current" />
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <>
                    {/* Fallback sin logo personalizado */}

                    <div className="flex aspect-square size-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                        {collapsedIcon ? (
                            <img
                                src={
                                    collapsedIcon
                                }
                                alt={
                                    panelName
                                }
                                className="size-8 object-contain"
                            />
                        ) : (
                            <AppLogoIcon className="size-5 fill-current" />
                        )}
                    </div>

                    <div className="ml-2 grid min-w-0 flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                        <span className="truncate font-semibold">
                            {panelName}
                        </span>
                    </div>
                </>
            )}
        </div>
    );
}
