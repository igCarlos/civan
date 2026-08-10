<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Pipeline;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Actions\AttemptToAuthenticate;
use Laravel\Fortify\Actions\PrepareAuthenticatedSession;
use Laravel\Fortify\Contracts\RedirectsIfTwoFactorAuthenticatable;
use Laravel\Fortify\Features;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     *
     * El login pasa por el pipeline de Fortify para comprobar 2FA
     * antes de autenticar definitivamente al usuario.
     */
    public function store(LoginRequest $request): mixed
    {
        return (new Pipeline(app()))
            ->send($request)
            ->through(array_filter([
                Features::enabled(Features::twoFactorAuthentication())
                    ? RedirectsIfTwoFactorAuthenticatable::class
                    : null,

                AttemptToAuthenticate::class,

                PrepareAuthenticatedSession::class,
            ]))
            ->then(
                fn () => redirect()->intended(
                    route('dashboard', absolute: false)
                )
            );
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
