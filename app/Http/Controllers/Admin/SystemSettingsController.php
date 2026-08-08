<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use App\Services\AuditService;
use App\Services\SystemSettingsService;
use DateTimeZone;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SystemSettingsController extends Controller
{
    /**
     * Mostrar configuración general del sistema.
     */
    public function index(
        Request $request,
        SystemSettingsService $settingsService
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
                /*
                |--------------------------------------------------------------------------
                | Configuración
                |--------------------------------------------------------------------------
                |
                | SystemSettingsService también convierte las rutas de logo /
                | favicon en URLs públicas para Inertia.
                |
                */

                'settings' =>
                    $settingsService->general(),

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
                /*
                |--------------------------------------------------------------------------
                | Identidad
                |--------------------------------------------------------------------------
                */

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

                /*
                |--------------------------------------------------------------------------
                | Branding
                |--------------------------------------------------------------------------
                |
                | Por seguridad no aceptamos SVG.
                | Los logos pueden ser PNG/JPEG/WebP.
                | El favicon admite además ICO.
                |
                */

                'logo_light' => [
                    'nullable',
                    'file',
                    'mimes:png,jpg,jpeg,webp',
                    'max:5120',
                ],

                'logo_dark' => [
                    'nullable',
                    'file',
                    'mimes:png,jpg,jpeg,webp',
                    'max:5120',
                ],

                'favicon' => [
                    'nullable',
                    'file',
                    'mimes:png,jpg,jpeg,webp,ico',
                    'max:2048',
                ],

                'remove_logo_light' => [
                    'nullable',
                    'boolean',
                ],

                'remove_logo_dark' => [
                    'nullable',
                    'boolean',
                ],

                'remove_favicon' => [
                    'nullable',
                    'boolean',
                ],

                'logo_size' => [
                    'required',
                    'integer',
                    'min:50',
                    'max:100',
                ],

                /*
                |--------------------------------------------------------------------------
                | Apariencia
                |--------------------------------------------------------------------------
                */

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

                /*
                |--------------------------------------------------------------------------
                | Regional
                |--------------------------------------------------------------------------
                */

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
        | Normalizar colores
        |--------------------------------------------------------------------------
        */

        foreach (
            [
                'primary_color',
                'sidebar_color',
                'background_color',
                'card_color',
            ] as $colorKey
        ) {
            $validated[$colorKey] =
                strtoupper(
                    $validated[$colorKey]
                );
        }

        /*
        |--------------------------------------------------------------------------
        | Estado anterior
        |--------------------------------------------------------------------------
        |
        | Para archivos guardamos la ruta interna del disco public.
        |
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

            'logo_light' =>
                $this->settingPath(
                    'system.logo_light'
                ),

            'logo_dark' =>
                $this->settingPath(
                    'system.logo_dark'
                ),

            'favicon' =>
                $this->settingPath(
                    'system.favicon'
                ),

            'logo_size' =>
                SystemSetting::valueOf(
                    'system.logo_size',
                    75
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
        | Guardar valores normales
        |--------------------------------------------------------------------------
        */

        $stringSettings = [
            'system.panel_name' =>
                $validated['panel_name'],

            'system.short_name' =>
                $validated['short_name'],

            'system.primary_color' =>
                $validated['primary_color'],

            'system.sidebar_color' =>
                $validated['sidebar_color'],

            'system.sidebar_shape' =>
                $validated['sidebar_shape'],

            'system.background_color_mode' =>
                $validated[
                    'background_color_mode'
                ],

            'system.background_color' =>
                $validated['background_color'],

            'system.card_color_mode' =>
                $validated['card_color_mode'],

            'system.card_color' =>
                $validated['card_color'],

            'system.card_style' =>
                $validated['card_style'],

            'system.timezone' =>
                $validated['timezone'],

            'system.locale' =>
                $validated['locale'],

            'system.date_format' =>
                $validated['date_format'],

            'system.time_format' =>
                $validated['time_format'],
        ];

        foreach (
            $stringSettings
            as $key => $value
        ) {
            SystemSetting::put(
                $key,
                $value,
                'system',
                'string'
            );
        }

        SystemSetting::put(
            'system.logo_size',
            $validated['logo_size'],
            'system',
            'integer'
        );

        SystemSetting::put(
            'system.per_page',
            $validated['per_page'],
            'system',
            'integer'
        );

        /*
        |--------------------------------------------------------------------------
        | Branding
        |--------------------------------------------------------------------------
        |
        | Si llega un archivo nuevo, tiene prioridad sobre "quitar".
        | El archivo anterior se elimina del disco.
        |
        */

        $logoLight =
            $this->updateAsset(
                request: $request,
                input:
                    'logo_light',
                removeInput:
                    'remove_logo_light',
                settingKey:
                    'system.logo_light',
                currentPath:
                    $oldValues['logo_light'],
                directory:
                    'branding/logos'
            );

        $logoDark =
            $this->updateAsset(
                request: $request,
                input:
                    'logo_dark',
                removeInput:
                    'remove_logo_dark',
                settingKey:
                    'system.logo_dark',
                currentPath:
                    $oldValues['logo_dark'],
                directory:
                    'branding/logos'
            );

        $favicon =
            $this->updateAsset(
                request: $request,
                input:
                    'favicon',
                removeInput:
                    'remove_favicon',
                settingKey:
                    'system.favicon',
                currentPath:
                    $oldValues['favicon'],
                directory:
                    'branding/favicon'
            );

        /*
        |--------------------------------------------------------------------------
        | Estado nuevo
        |--------------------------------------------------------------------------
        */

        $newValues = [
            'panel_name' =>
                $validated['panel_name'],

            'short_name' =>
                $validated['short_name'],

            'logo_light' =>
                $logoLight,

            'logo_dark' =>
                $logoDark,

            'favicon' =>
                $favicon,

            'logo_size' =>
                (int) $validated['logo_size'],

            'primary_color' =>
                $validated['primary_color'],

            'sidebar_color' =>
                $validated['sidebar_color'],

            'sidebar_shape' =>
                $validated['sidebar_shape'],

            'background_color_mode' =>
                $validated[
                    'background_color_mode'
                ],

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

        /*
        |--------------------------------------------------------------------------
        | Cambios reales
        |--------------------------------------------------------------------------
        */

        $changedOld = [];
        $changedNew = [];

        foreach (
            $newValues
            as $key => $value
        ) {
            if (
                (string) (
                    $oldValues[$key]
                    ?? ''
                ) !==
                (string) (
                    $value
                    ?? ''
                )
            ) {
                $changedOld[$key] =
                    $oldValues[$key]
                    ?? null;

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
            app(
                AuditService::class
            )->log(
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

    /**
     * Ruta guardada actualmente para un asset.
     */
    private function settingPath(
        string $key
    ): ?string {
        $value =
            SystemSetting::valueOf(
                $key,
                null
            );

        $path = trim(
            (string) (
                $value
                ?? ''
            )
        );

        return $path !== ''
            ? $path
            : null;
    }

    /**
     * Crear, reemplazar o eliminar un archivo de branding.
     */
    private function updateAsset(
        Request $request,
        string $input,
        string $removeInput,
        string $settingKey,
        ?string $currentPath,
        string $directory
    ): ?string {
        /*
        |--------------------------------------------------------------------------
        | Reemplazar / crear
        |--------------------------------------------------------------------------
        */

        if (
            $request->hasFile(
                $input
            )
        ) {
            $newPath =
                $request
                    ->file($input)
                    ->store(
                        $directory,
                        'public'
                    );

            if (
                $currentPath &&
                $currentPath !==
                    $newPath
            ) {
                Storage::disk(
                    'public'
                )->delete(
                    $currentPath
                );
            }

            SystemSetting::put(
                $settingKey,
                $newPath,
                'system',
                'string'
            );

            return $newPath;
        }

        /*
        |--------------------------------------------------------------------------
        | Eliminar
        |--------------------------------------------------------------------------
        */

        if (
            $request->boolean(
                $removeInput
            )
        ) {
            if ($currentPath) {
                Storage::disk(
                    'public'
                )->delete(
                    $currentPath
                );
            }

            SystemSetting::query()
                ->where(
                    'group',
                    'system'
                )
                ->where(
                    'key',
                    $settingKey
                )
                ->delete();

            return null;
        }

        return $currentPath;
    }
}
