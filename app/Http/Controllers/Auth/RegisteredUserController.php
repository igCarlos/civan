<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Mostrar el formulario de registro.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Registrar una nueva cuenta.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'username' => [
                'required',
                'string',
                'max:100',
                'alpha_dash',
                'unique:users,username',
            ],

            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                'unique:users,email',
            ],

            'phone' => [
                'nullable',
                'string',
                'max:30',
            ],

            'password' => [
                'required',
                'confirmed',
                Rules\Password::min(8)
                    ->mixedCase()
                    ->numbers(),
            ],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'username' => $validated['username'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?: null,

            /*
             * Registro público:
             * la cuenta queda activa inmediatamente.
             *
             * Si luego quieres aprobación manual,
             * cambia "active" por "pending" y bloquea
             * el login para usuarios pendientes.
             */
            'status' => 'active',

            /*
             * User.php ya puede manejar:
             * 'password' => 'hashed'
             */
            'password' => $validated['password'],

            'must_change_password' => false,
            'password_changed_at' => now(),
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect()->intended(
            route('dashboard', absolute: false)
        );
    }
}
