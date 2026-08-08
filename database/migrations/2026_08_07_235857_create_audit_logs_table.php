<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();

            /*
            |--------------------------------------------------------------------------
            | Usuario que realizó la acción
            |--------------------------------------------------------------------------
            */

            $table->foreignId('actor_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            /*
            |--------------------------------------------------------------------------
            | Acción
            |--------------------------------------------------------------------------
            |
            | login
            | logout
            | create
            | update
            | delete
            | role_change
            | status_change
            | etc.
            |
            */

            $table->string('event', 50)->index();

            /*
            |--------------------------------------------------------------------------
            | Módulo
            |--------------------------------------------------------------------------
            |
            | users
            | roles
            | permissions
            | websites
            | etc.
            |
            */

            $table->string('module', 100)
                ->nullable()
                ->index();

            /*
            |--------------------------------------------------------------------------
            | Registro afectado
            |--------------------------------------------------------------------------
            */

            $table->string('subject_type')
                ->nullable();

            $table->unsignedBigInteger('subject_id')
                ->nullable();

            $table->index([
                'subject_type',
                'subject_id',
            ]);

            /*
            |--------------------------------------------------------------------------
            | Descripción
            |--------------------------------------------------------------------------
            */

            $table->text('description')
                ->nullable();

            /*
            |--------------------------------------------------------------------------
            | Cambios
            |--------------------------------------------------------------------------
            */

            $table->json('old_values')
                ->nullable();

            $table->json('new_values')
                ->nullable();

            /*
            |--------------------------------------------------------------------------
            | Información técnica
            |--------------------------------------------------------------------------
            */

            $table->string('ip_address', 45)
                ->nullable();

            $table->text('user_agent')
                ->nullable();

            $table->string('method', 10)
                ->nullable();

            $table->string('route')
                ->nullable();

            $table->text('url')
                ->nullable();

            /*
            |--------------------------------------------------------------------------
            | Fecha
            |--------------------------------------------------------------------------
            |
            | No necesitamos updated_at.
            | Una auditoría no debería editarse.
            |
            */

            $table->timestamp('created_at')
                ->useCurrent();

            $table->index([
                'actor_id',
                'created_at',
            ]);

            $table->index([
                'module',
                'created_at',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};