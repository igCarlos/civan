<?php

namespace App\Providers;

use App\Services\AuditService;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        /*
        |--------------------------------------------------------------------------
        | LOGIN
        |--------------------------------------------------------------------------
        */

        Event::listen(
            Login::class,
            function (Login $event) {
                $now = now();

                DB::table('users')
                    ->where(
                        'id',
                        $event->user->id
                    )
                    ->update([
                        'last_login_at' => $now,
                        'last_seen_at' => $now,
                    ]);

                /*
                |--------------------------------------------------------------------------
                | Sincronizar instancia actual
                |--------------------------------------------------------------------------
                */

                $event->user->last_login_at =
                    $now;

                $event->user->last_seen_at =
                    $now;

                /*
                |--------------------------------------------------------------------------
                | Auditoría
                |--------------------------------------------------------------------------
                */

                app(AuditService::class)->log(
                    event: 'login',

                    subject: $event->user,

                    module: 'authentication',

                    description:
                        'El usuario inició sesión.',

                    actor: $event->user,
                );
            }
        );

        /*
        |--------------------------------------------------------------------------
        | LOGOUT
        |--------------------------------------------------------------------------
        */

        Event::listen(
            Logout::class,
            function (Logout $event) {
                if (! $event->user) {
                    return;
                }

                DB::table('users')
                    ->where(
                        'id',
                        $event->user->id
                    )
                    ->update([
                        'last_seen_at' =>
                            now(),
                    ]);

                /*
                |--------------------------------------------------------------------------
                | Auditoría
                |--------------------------------------------------------------------------
                */

                app(AuditService::class)->log(
                    event: 'logout',

                    subject: $event->user,

                    module: 'authentication',

                    description:
                        'El usuario cerró sesión.',

                    actor: $event->user,
                );
            }
        );
    }
}
