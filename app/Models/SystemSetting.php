<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    protected $fillable = [
        'group',
        'key',
        'value',
        'type',
    ];

    /**
     * Obtener un valor convertido al tipo almacenado.
     */
    public static function valueOf(
        string $key,
        mixed $default = null
    ): mixed {
        $setting =
            static::query()
                ->where(
                    'key',
                    $key
                )
                ->first();

        if (! $setting) {
            return $default;
        }

        return match (
            $setting->type
        ) {
            'integer' =>
                (int) $setting->value,

            'boolean' =>
                filter_var(
                    $setting->value,
                    FILTER_VALIDATE_BOOLEAN
                ),

            'float' =>
                (float) $setting->value,

            'json' =>
                json_decode(
                    $setting->value ?? 'null',
                    true
                ),

            default =>
                $setting->value,
        };
    }

    /**
     * Crear o actualizar una configuración.
     */
    public static function put(
        string $key,
        mixed $value,
        string $group = 'general',
        string $type = 'string'
    ): self {
        $storedValue = match ($type) {
            'boolean' =>
                $value
                    ? '1'
                    : '0',

            'json' =>
                json_encode(
                    $value,
                    JSON_UNESCAPED_UNICODE
                    | JSON_UNESCAPED_SLASHES
                ),

            default =>
                (string) $value,
        };

        return static::query()
            ->updateOrCreate(
                [
                    'key' =>
                        $key,
                ],
                [
                    'group' =>
                        $group,

                    'value' =>
                        $storedValue,

                    'type' =>
                        $type,
                ]
            );
    }
}
