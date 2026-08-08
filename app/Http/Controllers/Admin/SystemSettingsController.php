<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use App\Services\AuditService;
use DateTimeZone;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SystemSettingsController extends Controller
{
    /**
     * Mostrar configuración general del sistema.
     */
    public function index(
        Request $request
    ): Response {
        abort_unless(
            $request->user()->can(
                'settings.view'
            ),
            403
        );

        return Inertia::render(
            'admin/settings/system',
            [
                'settings' => [
                    'panel_name' =>
                        SystemSetting::valueOf(
                            'system.panel_name',
                            'CIVAN Panel'
                        ),

                    'short_name' =>
                        SystemSetting::valueOf(
                            'system.short_name',
                            'CIVAN'
                        ),

                    /*
                    |--------------------------------------------------------------------------
                    | Apariencia
                    |--------------------------------------------------------------------------
                    */

                    'primary_color' =>
                        SystemSetting::valueOf(
                            'system.primary_color',
                            '#18181B'
                        ),

                    'sidebar_color' =>
                        SystemSetting::valueOf(
                            'system.sidebar_color',
                            '#FAFAFA'
                        ),

                    'sidebar_shape' =>
                        SystemSetting::valueOf(
                            'system.sidebar_shape',
                            'normal'
                        ),

                    'background_color_mode' =>
                        SystemSetting::valueOf(
                            'system.background_color_mode',
                            'auto'
                        ),

                    'background_color' =>
                        SystemSetting::valueOf(
                            'system.background_color',
                            '#FFFFFF'
                        ),

                    'card_color_mode' =>
                        SystemSetting::valueOf(
                            'system.card_color_mode',
                            'auto'
                        ),

                    'card_color' =>
                        SystemSetting::valueOf(
                            'system.card_color',
                            '#FFFFFF'
                        ),

                    'card_style' =>
                        SystemSetting::valueOf(
                            'system.card_style',
                            'solid'
                        ),

                    /*
                    |--------------------------------------------------------------------------
                    | Regional
                    |--------------------------------------------------------------------------
                    */

                    'timezone' =>
                        SystemSetting::valueOf(
                            'system.timezone',
                            'UTC'
                        ),

                    'locale' =>
                        SystemSetting::valueOf(
                            'system.locale',
                            config(
                                'app.locale',
                                'es'
                            )
                        ),

                    'date_format' =>
                        SystemSetting::valueOf(
                            'system.date_format',
                            'd/m/Y'
                        ),

                    'time_format' =>
                        SystemSetting::valueOf(
                            'system.time_format',
                            'H:i'
                        ),

                    'per_page' =>
                        SystemSetting::valueOf(
                            'system.per_page',
                            20
                        ),
                ],

                'options' => [
                    'timezones' =>
                        DateTimeZone::listIdentifiers(),

                    'locales' => [
                        [
                            'value' => 'es',
                            'label' => 'Español',
                        ],
                        [
                            'value' => 'en',
                            'label' => 'English',
                        ],
                    ],

                    'date_formats' => [
                        [
                            'value' => 'd/m/Y',
                            'label' => '31/12/2026',
                        ],
                        [
                            'value' => 'Y-m-d',
                            'label' => '2026-12-31',
                        ],
                        [
                            'value' => 'm/d/Y',
                            'label' => '12/31/2026',
                        ],
                    ],

                    'time_formats' => [
                        [
                            'value' => 'H:i',
                            'label' => '23:45',
                        ],
                        [
                            'value' => 'h:i A',
                            'label' => '11:45 PM',
                        ],
                    ],

                    'per_page_options' => [
                        10,
                        20,
                        25,
                        50,
                        100,
                    ],
                ],

                'can' => [
                    'update' =>
                        $request->user()->can(
                            'settings.update'
                        ),
                ],
            ]
        );
    }

    /**
     * Actualizar configuración general.
     */
    public function update(
        Request $request
    ): RedirectResponse {
        abort_unless(
            $request->user()->can(
                'settings.update'
            ),
            403
        );

        $validated =
            $request->validate([
                'panel_name' => [
                    'required',
                    'string',
                    'max:100',
                ],

                'short_name' => [
                    'required',
                    'string',
                    'max:30',
                ],

                'primary_color' => [
                    'required',
                    'string',
                    'regex:/^#[0-9A-Fa-f]{6}$/',
                ],

                'sidebar_color' => [
                    'required',
                    'string',
                    'regex:/^#[0-9A-Fa-f]{6}$/',
                ],

                'sidebar_shape' => [
                    'required',
                    'string',
                    'in:normal,rounded',
                ],

                'background_color_mode' => [
                    'required',
                    'string',
                    'in:auto,custom',
                ],

                'background_color' => [
                    'required',
                    'string',
                    'regex:/^#[0-9A-Fa-f]{6}$/',
                ],

                'card_color_mode' => [
                    'required',
                    'string',
                    'in:auto,custom',
                ],

                'card_color' => [
                    'required',
                    'string',
                    'regex:/^#[0-9A-Fa-f]{6}$/',
                ],

                'card_style' => [
                    'required',
                    'string',
                    'in:solid,glass',
                ],

                'timezone' => [
                    'required',
                    'string',
                    'timezone',
                ],

                'locale' => [
                    'required',
                    'string',
                    'in:es,en',
                ],

                'date_format' => [
                    'required',
                    'string',
                    'in:d/m/Y,Y-m-d,m/d/Y',
                ],

                'time_format' => [
                    'required',
                    'string',
                    'in:H:i,h:i A',
                ],

                'per_page' => [
                    'required',
                    'integer',
                    'in:10,20,25,50,100',
                ],
            ]);

        /*
        |--------------------------------------------------------------------------
        | Normalizar color
        |--------------------------------------------------------------------------
        */

        $validated['primary_color'] =
            strtoupper(
                $validated['primary_color']
            );

        $validated['sidebar_color'] =
            strtoupper(
                $validated['sidebar_color']
            );

        $validated['background_color'] =
            strtoupper(
                $validated['background_color']
            );

        $validated['card_color'] =
            strtoupper(
                $validated['card_color']
            );

        /*
        |--------------------------------------------------------------------------
        | Estado anterior
        |--------------------------------------------------------------------------
        */

        $oldValues = [
            'panel_name' =>
                SystemSetting::valueOf(
                    'system.panel_name',
                    'CIVAN Panel'
                ),

            'short_name' =>
                SystemSetting::valueOf(
                    'system.short_name',
                    'CIVAN'
                ),

            'primary_color' =>
                SystemSetting::valueOf(
                    'system.primary_color',
                    '#18181B'
                ),

            'sidebar_color' =>
                SystemSetting::valueOf(
                    'system.sidebar_color',
                    '#FAFAFA'
                ),

            'sidebar_shape' =>
                SystemSetting::valueOf(
                    'system.sidebar_shape',
                    'normal'
                ),

            'background_color_mode' =>
                SystemSetting::valueOf(
                    'system.background_color_mode',
                    'auto'
                ),

            'background_color' =>
                SystemSetting::valueOf(
                    'system.background_color',
                    '#FFFFFF'
                ),

            'card_color_mode' =>
                SystemSetting::valueOf(
                    'system.card_color_mode',
                    'auto'
                ),

            'card_color' =>
                SystemSetting::valueOf(
                    'system.card_color',
                    '#FFFFFF'
                ),

            'card_style' =>
                SystemSetting::valueOf(
                    'system.card_style',
                    'solid'
                ),

            'timezone' =>
                SystemSetting::valueOf(
                    'system.timezone',
                    'UTC'
                ),

            'locale' =>
                SystemSetting::valueOf(
                    'system.locale',
                    config(
                        'app.locale',
                        'es'
                    )
                ),

            'date_format' =>
                SystemSetting::valueOf(
                    'system.date_format',
                    'd/m/Y'
                ),

            'time_format' =>
                SystemSetting::valueOf(
                    'system.time_format',
                    'H:i'
                ),

            'per_page' =>
                SystemSetting::valueOf(
                    'system.per_page',
                    20
                ),
        ];

        /*
        |--------------------------------------------------------------------------
        | Guardar configuración
        |--------------------------------------------------------------------------
        */

        SystemSetting::put(
            'system.panel_name',
            $validated['panel_name'],
            'system',
            'string'
        );

        SystemSetting::put(
            'system.short_name',
            $validated['short_name'],
            'system',
            'string'
        );

        SystemSetting::put(
            'system.primary_color',
            $validated['primary_color'],
            'system',
            'string'
        );

        SystemSetting::put(
            'system.sidebar_color',
            $validated['sidebar_color'],
            'system',
            'string'
        );

        SystemSetting::put(
            'system.sidebar_shape',
            $validated['sidebar_shape'],
            'system',
            'string'
        );

        SystemSetting::put(
            'system.background_color_mode',
            $validated['background_color_mode'],
            'system',
            'string'
        );

        SystemSetting::put(
            'system.background_color',
            $validated['background_color'],
            'system',
            'string'
        );

        SystemSetting::put(
            'system.card_color_mode',
            $validated['card_color_mode'],
            'system',
            'string'
        );

        SystemSetting::put(
            'system.card_color',
            $validated['card_color'],
            'system',
            'string'
        );

        SystemSetting::put(
            'system.card_style',
            $validated['card_style'],
            'system',
            'string'
        );

        SystemSetting::put(
            'system.timezone',
            $validated['timezone'],
            'system',
            'string'
        );

        SystemSetting::put(
            'system.locale',
            $validated['locale'],
            'system',
            'string'
        );

        SystemSetting::put(
            'system.date_format',
            $validated['date_format'],
            'system',
            'string'
        );

        SystemSetting::put(
            'system.time_format',
            $validated['time_format'],
            'system',
            'string'
        );

        SystemSetting::put(
            'system.per_page',
            $validated['per_page'],
            'system',
            'integer'
        );

        /*
        |--------------------------------------------------------------------------
        | Cambios reales
        |--------------------------------------------------------------------------
        */

        $newValues = [
            'panel_name' =>
                $validated['panel_name'],

            'short_name' =>
                $validated['short_name'],

            'primary_color' =>
                $validated['primary_color'],

            'sidebar_color' =>
                $validated['sidebar_color'],

            'sidebar_shape' =>
                $validated['sidebar_shape'],

            'background_color_mode' =>
                $validated['background_color_mode'],

            'background_color' =>
                $validated['background_color'],

            'card_color_mode' =>
                $validated['card_color_mode'],

            'card_color' =>
                $validated['card_color'],

            'card_style' =>
                $validated['card_style'],

            'timezone' =>
                $validated['timezone'],

            'locale' =>
                $validated['locale'],

            'date_format' =>
                $validated['date_format'],

            'time_format' =>
                $validated['time_format'],

            'per_page' =>
                (int) $validated['per_page'],
        ];

        $changedOld = [];
        $changedNew = [];

        foreach (
            $newValues as $key => $value
        ) {
            if (
                (string) $oldValues[$key] !==
                (string) $value
            ) {
                $changedOld[$key] =
                    $oldValues[$key];

                $changedNew[$key] =
                    $value;
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Auditoría
        |--------------------------------------------------------------------------
        */

        if (! empty($changedNew)) {
            app(AuditService::class)->log(
                event:
                    'system_settings_update',

                module:
                    'settings',

                description:
                    'Actualizó la configuración general del sistema.',

                oldValues:
                    $changedOld,

                newValues:
                    $changedNew,

                actor:
                    $request->user(),
            );
        }

        return back()->with(
            'success',
            'Configuración del sistema actualizada correctamente.'
        );
    }
}
