<?php

namespace App\Services;

use App\Models\SystemSetting;
use Illuminate\Support\Facades\Storage;

class SystemSettingsService
{
    /**
     * Obtener la configuración general del sistema
     * realizando una sola consulta a system_settings.
     */
    public function general(): array
    {
        $values =
            SystemSetting::query()
                ->where(
                    'group',
                    'system'
                )
                ->whereIn(
                    'key',
                    [
                        'system.panel_name',
                        'system.short_name',
                        'system.logo_light',
                        'system.logo_dark',
                        'system.favicon',
                        'system.logo_size',
                        'system.primary_color',
                        'system.sidebar_color',
                        'system.sidebar_shape',
                        'system.background_color_mode',
                        'system.background_color',
                        'system.card_color_mode',
                        'system.card_color',
                        'system.card_style',
                        'system.timezone',
                        'system.locale',
                        'system.date_format',
                        'system.time_format',
                        'system.per_page',
                    ]
                )
                ->pluck(
                    'value',
                    'key'
                );

        return [
            'panel_name' =>
                (string) $values->get(
                    'system.panel_name',
                    'CIVAN Panel'
                ),

            'short_name' =>
                (string) $values->get(
                    'system.short_name',
                    'CIVAN'
                ),

            /*
            |--------------------------------------------------------------------------
            | Identidad visual
            |--------------------------------------------------------------------------
            */

            'logo_light' =>
                $this->publicAssetUrl(
                    $values->get(
                        'system.logo_light'
                    )
                ),

            'logo_dark' =>
                $this->publicAssetUrl(
                    $values->get(
                        'system.logo_dark'
                    )
                ),

            'favicon' =>
                $this->publicAssetUrl(
                    $values->get(
                        'system.favicon'
                    )
                ),

            'logo_size' =>
                max(
                    50,
                    min(
                        100,
                        (int) $values->get(
                            'system.logo_size',
                            75
                        )
                    )
                ),

            /*
            |--------------------------------------------------------------------------
            | Apariencia
            |--------------------------------------------------------------------------
            */

            'primary_color' =>
                (string) $values->get(
                    'system.primary_color',
                    '#18181B'
                ),

            'sidebar_color' =>
                (string) $values->get(
                    'system.sidebar_color',
                    '#FAFAFA'
                ),

            'sidebar_shape' =>
                (string) $values->get(
                    'system.sidebar_shape',
                    'normal'
                ),

            'background_color_mode' =>
                (string) $values->get(
                    'system.background_color_mode',
                    'auto'
                ),

            'background_color' =>
                (string) $values->get(
                    'system.background_color',
                    '#FFFFFF'
                ),

            'card_color_mode' =>
                (string) $values->get(
                    'system.card_color_mode',
                    'auto'
                ),

            'card_color' =>
                (string) $values->get(
                    'system.card_color',
                    '#FFFFFF'
                ),

            'card_style' =>
                (string) $values->get(
                    'system.card_style',
                    'solid'
                ),

            /*
            |--------------------------------------------------------------------------
            | Regional
            |--------------------------------------------------------------------------
            */

            'timezone' =>
                (string) $values->get(
                    'system.timezone',
                    'UTC'
                ),

            'locale' =>
                (string) $values->get(
                    'system.locale',
                    config(
                        'app.locale',
                        'es'
                    )
                ),

            'date_format' =>
                (string) $values->get(
                    'system.date_format',
                    'd/m/Y'
                ),

            'time_format' =>
                (string) $values->get(
                    'system.time_format',
                    'H:i'
                ),

            'per_page' =>
                max(
                    1,
                    (int) $values->get(
                        'system.per_page',
                        20
                    )
                ),
        ];
    }

    /**
     * Convertir una ruta del disco public en URL web.
     */
    private function publicAssetUrl(
        mixed $path
    ): ?string {
        $path = trim(
            (string) ($path ?? '')
        );

        if ($path === '') {
            return null;
        }

        return Storage::disk(
            'public'
        )->url(
            $path
        );
    }
}
