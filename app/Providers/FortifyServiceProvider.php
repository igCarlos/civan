<?php

namespace App\Providers;

use App\Actions\Fortify\CreateNewUser;
use App\Actions\Fortify\ResetUserPassword;
use App\Actions\Fortify\UpdateUserPassword;
use App\Actions\Fortify\UpdateUserProfileInformation;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Laravel\Fortify\Actions\RedirectIfTwoFactorAuthenticatable;
use Laravel\Fortify\Fortify;

class FortifyServiceProvider extends ServiceProvider
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
        | Acciones de Fortify
        |--------------------------------------------------------------------------
        */

        Fortify::createUsersUsing(
            CreateNewUser::class
        );

        Fortify::updateUserProfileInformationUsing(
            UpdateUserProfileInformation::class
        );

        Fortify::updateUserPasswordsUsing(
            UpdateUserPassword::class
        );

        Fortify::resetUserPasswordsUsing(
            ResetUserPassword::class
        );

        Fortify::redirectUserForTwoFactorAuthenticationUsing(
            RedirectIfTwoFactorAuthenticatable::class
        );

        /*
        |--------------------------------------------------------------------------
        | Vista del desafío 2FA
        |--------------------------------------------------------------------------
        |
        | Fortify necesita saber qué debe renderizar cuando el usuario llega a:
        |
        | GET /two-factor-challenge
        |
        | Como CIVAN usa Inertia + React, devolvemos nuestra página React.
        |
        */

        Fortify::twoFactorChallengeView(
            fn () => Inertia::render(
                'auth/two-factor-challenge'
            )
        );

        /*
        |--------------------------------------------------------------------------
        | Rate Limiter - Login
        |--------------------------------------------------------------------------
        */

        RateLimiter::for(
            'login',
            function (Request $request) {
                $throttleKey =
                    Str::transliterate(
                        Str::lower(
                            $request->input(
                                Fortify::username()
                            )
                        )
                        .'|'
                        .$request->ip()
                    );

                return Limit::perMinute(5)
                    ->by($throttleKey);
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Rate Limiter - Two Factor Authentication
        |--------------------------------------------------------------------------
        */

        RateLimiter::for(
            'two-factor',
            function (Request $request) {
                $loginId =
                    $request
                        ->session()
                        ->get('login.id');

                return Limit::perMinute(5)
                    ->by(
                        ($loginId ?: 'guest')
                        .'|'
                        .$request->ip()
                    );
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Rate Limiter - Passkeys
        |--------------------------------------------------------------------------
        */

        RateLimiter::for(
            'passkeys',
            function (Request $request) {
                $credentialId =
                    $request->input(
                        'credential.id'
                    );

                return Limit::perMinute(10)
                    ->by(
                        (
                            $credentialId
                            ?: $request
                                ->session()
                                ->getId()
                        )
                        .'|'
                        .$request->ip()
                    );
            }
        );
    }
}
