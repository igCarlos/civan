<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();

            // Datos personales
            $table->string('name');
            $table->string('username')
                ->nullable()
                ->unique();

            $table->string('email')
                ->unique();

            $table->string('phone', 30)
                ->nullable();

            // Perfil
            $table->string('avatar')
                ->nullable();

            $table->string('timezone', 50)
                ->nullable();

            $table->string('locale', 10)
                ->default('es');

            // Estado
            $table->string('status', 20)
                ->default('active');

            // Seguridad
            $table->timestamp('email_verified_at')
                ->nullable();

            $table->string('password');

            $table->boolean('must_change_password')
                ->default(false);

            $table->timestamp('password_changed_at')
                ->nullable();

            // Actividad
            $table->timestamp('last_login_at')
                ->nullable();

            $table->string('last_login_ip', 45)
                ->nullable();

            $table->timestamp('last_seen_at')
                ->nullable();

            $table->rememberToken();

            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();

            $table->foreignId('user_id')
                ->nullable()
                ->index();

            $table->string('ip_address', 45)
                ->nullable();

            $table->text('user_agent')
                ->nullable();

            $table->longText('payload');

            $table->integer('last_activity')
                ->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};