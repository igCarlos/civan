<?php

namespace App\Services;

use App\Models\SystemSetting;

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

            'timezone' =>
                (string) $values->get(
                    'system.timezone',
                    config(
                        'app.timezone',
                        'UTC'
                    )
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
}
