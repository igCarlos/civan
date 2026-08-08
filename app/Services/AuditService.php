<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class AuditService
{
    /**
     * Campos que JAMÁS debemos guardar.
     */
    protected array $hiddenFields = [
        'password',
        'password_confirmation',
        'current_password',

        'token',
        'api_token',
        'access_token',
        'refresh_token',

        'secret',
        'client_secret',

        'authorization',
        'cookie',
    ];

    /**
     * Registrar actividad.
     */
    public function log(
        string $event,

        ?Model $subject = null,

        ?string $module = null,

        ?string $description = null,

        array $oldValues = [],

        array $newValues = [],

        ?User $actor = null,
    ): AuditLog {

        /*
        |--------------------------------------------------------------------------
        | Usuario responsable
        |--------------------------------------------------------------------------
        */

        $actor ??= auth()->user();


        /*
        |--------------------------------------------------------------------------
        | Request
        |--------------------------------------------------------------------------
        */

        $request = app()->bound('request')
            ? request()
            : null;


        /*
        |--------------------------------------------------------------------------
        | Crear registro
        |--------------------------------------------------------------------------
        */

        return AuditLog::create([

            'actor_id' =>
                $actor?->id,

            'event' =>
                $event,

            'module' =>
                $module,

            'subject_type' =>
                $subject
                    ? $subject::class
                    : null,

            'subject_id' =>
                $subject?->getKey(),

            'description' =>
                $description,

            'old_values' =>
                $this->sanitize($oldValues),

            'new_values' =>
                $this->sanitize($newValues),

            'ip_address' =>
                $request?->ip(),

            'user_agent' =>
                $request?->userAgent(),

            'method' =>
                $request?->method(),

            'route' =>
                $request?->route()?->getName(),

            'url' =>
                $request?->fullUrl(),
        ]);
    }


    /**
     * Eliminar información sensible.
     */
    protected function sanitize(
        array $values
    ): array {

        foreach ($values as $key => $value) {

            /*
            |--------------------------------------------------------------------------
            | Campo sensible
            |--------------------------------------------------------------------------
            */

            if (
                in_array(
                    strtolower((string) $key),
                    $this->hiddenFields,
                    true
                )
            ) {
                $values[$key] = '[PROTEGIDO]';

                continue;
            }


            /*
            |--------------------------------------------------------------------------
            | Arrays internos
            |--------------------------------------------------------------------------
            */

            if (is_array($value)) {
                $values[$key] =
                    $this->sanitize($value);
            }
        }

        return $values;
    }
}