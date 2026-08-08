<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class AuditLog extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = [
        'actor_id',

        'event',
        'module',

        'subject_type',
        'subject_id',

        'description',

        'old_values',
        'new_values',

        'ip_address',
        'user_agent',

        'method',
        'route',
        'url',
    ];

    protected function casts(): array
    {
        return [
            'old_values' => 'array',
            'new_values' => 'array',

            'created_at' => 'datetime',
        ];
    }

    /**
     * Usuario que realizó la acción.
     */
    public function actor(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'actor_id'
        );
    }

    /**
     * Registro afectado.
     *
     * Puede ser:
     *
     * User
     * Website
     * Role
     * etc.
     */
    public function subject(): MorphTo
    {
        return $this->morphTo();
    }
}