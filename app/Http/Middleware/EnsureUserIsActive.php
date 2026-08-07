<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsActive
{
    public function handle(
        Request $request,
        Closure $next
    ): Response {
        $user = $request->user();

       if ($user && $user->status !== 'active') {

            Auth::logout();

            $request->session()->invalidate();

            $request->session()->regenerateToken();

            $message = match ($user->status) {
                'suspended' =>
                    'Tu cuenta ha sido suspendida. Contacta al administrador.',

                'pending' =>
                    'Tu cuenta todavía está pendiente de activación.',

                default =>
                    'Tu cuenta no tiene acceso al sistema.',
            };

            return redirect()
                ->route('login')
                ->withErrors([
                    'email' => $message,
                ]);
        }

        return $next($request);
    }
}