export type CardColorMode =
    | 'auto'
    | 'custom';

export type CardStyle =
    | 'solid'
    | 'glass';

export type BackgroundColorMode =
    | 'auto'
    | 'custom';

export type SidebarShape =
    | 'normal'
    | 'rounded';

export type SystemAppearanceSettings = {
    primary_color?: string | null;
    sidebar_color?: string | null;
    sidebar_shape?: SidebarShape | string | null;
    background_color_mode?: BackgroundColorMode | string | null;
    background_color?: string | null;
    card_color_mode?: CardColorMode | string | null;
    card_color?: string | null;
    card_style?: CardStyle | string | null;
};

type Rgb = {
    red: number;
    green: number;
    blue: number;
};

/**
 * Comprueba y normaliza un color hexadecimal #RRGGBB.
 */
export function normalizeHexColor(
    value: string | null | undefined,
    fallback = '#18181B',
): string {
    const color =
        String(value ?? '')
            .trim()
            .toUpperCase();

    return /^#[0-9A-F]{6}$/.test(color)
        ? color
        : fallback;
}

function hexToRgb(
    color: string,
): Rgb {
    const normalized =
        normalizeHexColor(color)
            .slice(1);

    return {
        red: parseInt(
            normalized.slice(0, 2),
            16,
        ),

        green: parseInt(
            normalized.slice(2, 4),
            16,
        ),

        blue: parseInt(
            normalized.slice(4, 6),
            16,
        ),
    };
}

function componentToHex(
    value: number,
): string {
    return Math.round(
        Math.min(
            255,
            Math.max(
                0,
                value,
            ),
        ),
    )
        .toString(16)
        .padStart(2, '0')
        .toUpperCase();
}

function mixHexColors(
    background: string,
    foreground: string,
    foregroundRatio: number,
): string {
    const bg =
        hexToRgb(background);

    const fg =
        hexToRgb(foreground);

    const ratio =
        Math.min(
            1,
            Math.max(
                0,
                foregroundRatio,
            ),
        );

    return (
        '#' +
        componentToHex(
            bg.red * (1 - ratio) +
                fg.red * ratio,
        ) +
        componentToHex(
            bg.green * (1 - ratio) +
                fg.green * ratio,
        ) +
        componentToHex(
            bg.blue * (1 - ratio) +
                fg.blue * ratio,
        )
    );
}

/**
 * Devuelve blanco o negro dependiendo del contraste del color.
 */
export function getReadableForeground(
    color: string,
): '#FFFFFF' | '#09090B' {
    const {
        red,
        green,
        blue,
    } = hexToRgb(color);

    const luminance =
        (
            0.2126 * red +
            0.7152 * green +
            0.0722 * blue
        ) / 255;

    return luminance > 0.58
        ? '#09090B'
        : '#FFFFFF';
}

/**
 * Aplica únicamente el color principal.
 */
export function applySystemPrimaryColor(
    value: string | null | undefined,
): string {
    if (
        typeof document ===
        'undefined'
    ) {
        return normalizeHexColor(
            value,
        );
    }

    const primary =
        normalizeHexColor(
            value,
        );

    const foreground =
        getReadableForeground(
            primary,
        );

    const root =
        document.documentElement;

    root.style.setProperty(
        '--system-primary',
        primary,
    );

    root.style.setProperty(
        '--primary',
        primary,
    );

    root.style.setProperty(
        '--primary-foreground',
        foreground,
    );

    root.style.setProperty(
        '--ring',
        primary,
    );

    root.style.setProperty(
        '--sidebar-primary',
        primary,
    );

    root.style.setProperty(
        '--sidebar-primary-foreground',
        foreground,
    );

    root.style.setProperty(
        '--sidebar-ring',
        primary,
    );

    return primary;
}

/**
 * Aplica el color de fondo del sidebar y calcula automáticamente
 * contraste, borde y color del elemento activo.
 */
export function applySystemSidebarColor(
    value: string | null | undefined,
    primaryValue?: string | null,
): string {
    if (
        typeof document ===
        'undefined'
    ) {
        return normalizeHexColor(
            value,
            '#FAFAFA',
        );
    }

    const sidebar =
        normalizeHexColor(
            value,
            '#FAFAFA',
        );

    const primary =
        normalizeHexColor(
            primaryValue,
            '#18181B',
        );

    const foreground =
        getReadableForeground(
            sidebar,
        );

    const activeBackground =
        mixHexColors(
            sidebar,
            primary,
            0.16,
        );

    const activeForeground =
        getReadableForeground(
            activeBackground,
        );

    const border =
        mixHexColors(
            sidebar,
            foreground,
            0.12,
        );

    const root =
        document.documentElement;

    root.style.setProperty(
        '--system-sidebar',
        sidebar,
    );

    root.style.setProperty(
        '--sidebar',
        sidebar,
    );

    root.style.setProperty(
        '--system-sidebar-foreground',
        foreground,
    );

    root.style.setProperty(
        '--sidebar-foreground',
        foreground,
    );

    root.style.setProperty(
        '--system-sidebar-border',
        border,
    );

    root.style.setProperty(
        '--sidebar-border',
        border,
    );

    root.style.setProperty(
        '--system-sidebar-accent',
        activeBackground,
    );

    root.style.setProperty(
        '--sidebar-accent',
        activeBackground,
    );

    root.style.setProperty(
        '--system-sidebar-accent-foreground',
        activeForeground,
    );

    root.style.setProperty(
        '--sidebar-accent-foreground',
        activeForeground,
    );

    return sidebar;
}


export function normalizeBackgroundColorMode(
    value:
        | string
        | null
        | undefined,
): BackgroundColorMode {
    return value === 'custom'
        ? 'custom'
        : 'auto';
}

export function normalizeSidebarShape(
    value:
        | string
        | null
        | undefined,
): SidebarShape {
    return value === 'rounded'
        ? 'rounded'
        : 'normal';
}

/**
 * Define si el sidebar mantiene bordes rectos o redondeados.
 */
export function applySystemSidebarShape(
    value:
        | string
        | null
        | undefined,
): SidebarShape {
    const shape =
        normalizeSidebarShape(
            value,
        );

    if (
        typeof document !==
        'undefined'
    ) {
        document.documentElement
            .dataset
            .civanSidebarShape =
                shape;
    }

    return shape;
}

/**
 * Fondo global del panel.
 *
 * Automático:
 *   conserva los tokens claro/oscuro originales del Starter Kit.
 *
 * Personalizado:
 *   ajusta fondo, texto, muted, bordes, inputs y accent para que
 *   el contraste siga siendo correcto incluso con fondos oscuros.
 */
export function applySystemBackgroundAppearance(
    colorMode:
        | string
        | null
        | undefined,
    color:
        | string
        | null
        | undefined,
): void {
    if (
        typeof document ===
        'undefined'
    ) {
        return;
    }

    const root =
        document.documentElement;

    const normalizedMode =
        normalizeBackgroundColorMode(
            colorMode,
        );

    root.dataset
        .civanBackgroundColorMode =
            normalizedMode;

    if (
        normalizedMode ===
        'auto'
    ) {
        [
            '--system-background',
            '--system-background-foreground',
            '--system-background-muted',
            '--system-background-muted-foreground',
            '--system-background-border',
        ].forEach(
            (property) =>
                root.style
                    .removeProperty(
                        property,
                    ),
        );

        /*
         * Restaurar los tokens originales definidos por app.css.
         */
        [
            '--background',
            '--foreground',
            '--muted',
            '--muted-foreground',
            '--border',
            '--input',
            '--accent',
            '--accent-foreground',
        ].forEach(
            (property) =>
                root.style
                    .removeProperty(
                        property,
                    ),
        );

        return;
    }

    /*
     * Mientras el usuario escribe un HEX incompleto no cambiamos el
     * fondo actual. Así evitamos saltos de color en la vista previa.
     */
    const raw =
        String(color ?? '')
            .trim()
            .toUpperCase();

    if (
        !/^#[0-9A-F]{6}$/.test(
            raw,
        )
    ) {
        return;
    }

    const background =
        normalizeHexColor(
            raw,
            '#FFFFFF',
        );

    const foreground =
        getReadableForeground(
            background,
        );

    const muted =
        mixHexColors(
            background,
            foreground,
            0.07,
        );

    const mutedForeground =
        mixHexColors(
            background,
            foreground,
            0.64,
        );

    const border =
        mixHexColors(
            background,
            foreground,
            0.14,
        );

    root.style.setProperty(
        '--system-background',
        background,
    );

    root.style.setProperty(
        '--system-background-foreground',
        foreground,
    );

    root.style.setProperty(
        '--system-background-muted',
        muted,
    );

    root.style.setProperty(
        '--system-background-muted-foreground',
        mutedForeground,
    );

    root.style.setProperty(
        '--system-background-border',
        border,
    );

    /*
     * Reutilizamos los tokens base de shadcn para que toda la interfaz
     * mantenga contraste: fondo general, inputs, bordes y estados hover.
     */
    root.style.setProperty(
        '--background',
        background,
    );

    root.style.setProperty(
        '--foreground',
        foreground,
    );

    root.style.setProperty(
        '--muted',
        muted,
    );

    root.style.setProperty(
        '--muted-foreground',
        mutedForeground,
    );

    root.style.setProperty(
        '--border',
        border,
    );

    root.style.setProperty(
        '--input',
        border,
    );

    root.style.setProperty(
        '--accent',
        muted,
    );

    root.style.setProperty(
        '--accent-foreground',
        foreground,
    );
}

export function normalizeCardColorMode(
    value:
        | string
        | null
        | undefined,
): CardColorMode {
    return value === 'custom'
        ? 'custom'
        : 'auto';
}

export function normalizeCardStyle(
    value:
        | string
        | null
        | undefined,
): CardStyle {
    return value === 'glass'
        ? 'glass'
        : 'solid';
}

/**
 * Configura el aspecto global de las cards.
 *
 * auto:
 *   Respeta --card y --card-foreground del tema claro/oscuro.
 *
 * custom:
 *   Sustituye el color de todas las cards que usan bg-card.
 *
 * glass:
 *   Mantiene el color base pero el CSS lo vuelve translúcido
 *   y agrega blur/saturación.
 */
export function applySystemCardAppearance(
    colorMode:
        | string
        | null
        | undefined,
    color:
        | string
        | null
        | undefined,
    style:
        | string
        | null
        | undefined,
): void {
    if (
        typeof document ===
        'undefined'
    ) {
        return;
    }

    const root =
        document.documentElement;

    const normalizedMode =
        normalizeCardColorMode(
            colorMode,
        );

    const normalizedStyle =
        normalizeCardStyle(
            style,
        );

    root.dataset.civanCardColorMode =
        normalizedMode;

    root.dataset.civanCardStyle =
        normalizedStyle;

    /*
    |--------------------------------------------------------------------------
    | IMPORTANTE
    |--------------------------------------------------------------------------
    |
    | Ya NO sobrescribimos --card ni --card-foreground.
    |
    | Esos tokens pertenecen al tema base de shadcn y también pueden ser
    | utilizados por otras capas del layout. En su lugar CIVAN mantiene sus
    | propias variables --civan-card-* y el CSS las aplica exclusivamente
    | a elementos .bg-card.
    |
    */

    if (
        normalizedMode ===
        'custom'
    ) {
        const card =
            normalizeHexColor(
                color,
                '#FFFFFF',
            );

        const foreground =
            getReadableForeground(
                card,
            );

        /*
         * Texto secundario con contraste suficiente sobre la card.
         */
        const mutedForeground =
            mixHexColors(
                card,
                foreground,
                0.68,
            );

        /*
         * Bordes visibles pero suaves.
         */
        const border =
            mixHexColors(
                card,
                foreground,
                0.16,
            );

        root.style.setProperty(
            '--civan-card-base',
            card,
        );

        root.style.setProperty(
            '--civan-card-foreground',
            foreground,
        );

        root.style.setProperty(
            '--civan-card-muted-foreground',
            mutedForeground,
        );

        root.style.setProperty(
            '--civan-card-border',
            border,
        );

        return;
    }

    /*
    |--------------------------------------------------------------------------
    | Automático
    |--------------------------------------------------------------------------
    |
    | Dejamos que el tema claro/oscuro determine el color original de card.
    |
    */

    root.style.setProperty(
        '--civan-card-base',
        'var(--card)',
    );

    root.style.setProperty(
        '--civan-card-foreground',
        'var(--card-foreground)',
    );

    root.style.setProperty(
        '--civan-card-muted-foreground',
        'var(--muted-foreground)',
    );

    root.style.setProperty(
        '--civan-card-border',
        'var(--border)',
    );
}

/**
 * Aplica la apariencia global de CIVAN.
 */
export function applySystemAppearance(
    settings:
        SystemAppearanceSettings,
): void {
    const primary =
        applySystemPrimaryColor(
            settings.primary_color,
        );

    applySystemSidebarColor(
        settings.sidebar_color,
        primary,
    );

    applySystemSidebarShape(
        settings.sidebar_shape,
    );

    applySystemBackgroundAppearance(
        settings.background_color_mode,
        settings.background_color,
    );

    applySystemCardAppearance(
        settings.card_color_mode,
        settings.card_color,
        settings.card_style,
    );
}
