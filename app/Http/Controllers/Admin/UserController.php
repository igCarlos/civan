<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;


class UserController extends Controller
{
    /**
     * Listado de usuarios.
     */
    public function index(Request $request): Response
    {
        abort_unless(
            $request->user()->can('users.view'),
            403
        );

        $search = trim(
            (string) $request->input('search', '')
        );

        $users = User::query()
            ->with('roles:id,name')

            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('username', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
            })

            ->orderBy('name')

            ->paginate(10)

            ->withQueryString()

            ->through(function (User $user) {
                return [
                    'id' => $user->id,

                    'name' => $user->name,

                    'username' => $user->username,

                    'email' => $user->email,

                    'phone' => $user->phone,

                    'status' => $user->status,

                    'roles' => $user->roles
                        ->pluck('name')
                        ->values(),

                    'last_login_at' =>
                        $user->last_login_at?->diffForHumans(),

                    'created_at' =>
                        $user->created_at?->format('d/m/Y'),
                ];
            });

        return Inertia::render(
            'admin/users/index',
            [
                'users' => $users,

                'filters' => [
                    'search' => $search,
                ],

                'can' => [
                    'create' =>
                        $request->user()->can('users.create'),

                    'update' =>
                        $request->user()->can('users.update'),

                    'delete' =>
                        $request->user()->can('users.delete'),

                    'updateRoles' =>
                        $request->user()->can('users.roles.update'),

                    'updateStatus' =>
                        $request->user()->can('users.status.update'),
                ],
            ]
        );
    }



    public function create(Request $request): Response
    {
        abort_unless(
            $request->user()->can('users.create'),
            403
        );

        $roles = Role::query()
            ->where('guard_name', 'web')
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('admin/users/create', [
            'roles' => $roles,

            'can' => [
                'assignRoles' =>
                    $request->user()->can('users.roles.update'),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        abort_unless(
            $request->user()->can('users.create'),
            403
        );

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'username' => [
                'nullable',
                'string',
                'max:100',
                'alpha_dash',
                'unique:users,username',
            ],

            'email' => [
                'required',
                'email',
                'max:255',
                'unique:users,email',
            ],

            'phone' => [
                'nullable',
                'string',
                'max:30',
            ],

            'status' => [
                'required',
                Rule::in([
                    'active',
                    'pending',
                    'suspended',
                ]),
            ],

            'password' => [
                'required',
                'confirmed',
                Password::defaults(),
            ],

            'must_change_password' => [
                'boolean',
            ],

            'role_ids' => [
                'nullable',
                'array',
            ],

            'role_ids.*' => [
                'integer',
                'exists:roles,id',
            ],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'username' => $validated['username'] ?: null,
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?: null,
            'status' => $validated['status'],

            /*
            * User.php ya tiene:
            * 'password' => 'hashed'
            */
            'password' => $validated['password'],

            'must_change_password' =>
                (bool) ($validated['must_change_password'] ?? false),

            'password_changed_at' => now(),
        ]);

        /*
        |--------------------------------------------------------------------------
        | Asignar roles
        |--------------------------------------------------------------------------
        |
        | Aunque alguien pueda crear usuarios, solamente podrá
        | asignar roles si tiene users.roles.update.
        |
        */

        if (
            $request->user()->can('users.roles.update')
            && ! empty($validated['role_ids'])
        ) {
            $roleNames = Role::query()
                ->where('guard_name', 'web')
                ->whereIn('id', $validated['role_ids'])
                ->pluck('name')
                ->all();

            $user->syncRoles($roleNames);
        }

        return redirect()
            ->route('admin.users.index')
            ->with(
                'success',
                'Usuario creado correctamente.'
            );
    }

    public function edit(User $user)
    {
        $user->load('roles:id,name');

        return Inertia::render('admin/users/edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'phone' => $user->phone,
                'status' => $user->status,
                'roles' => $user->roles->map(fn ($role) => [
                    'id' => $role->id,
                    'name' => $role->name,
                ])->values(),
            ],

            'roles' => Role::query()
                ->select('id', 'name')
                ->orderBy('name')
                ->get(),

            'can' => [
                'assignRoles' => auth()
                    ->user()
                    ->can('users.roles.update'),
            ],
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],

            'username' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('users', 'username')
                    ->ignore($user->id),
            ],

            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')
                    ->ignore($user->id),
            ],

            'phone' => [
                'nullable',
                'string',
                'max:50',
            ],

            'status' => [
                'required',
                Rule::in([
                    'active',
                    'pending',
                    'suspended',
                ]),
            ],

            'role_ids' => [
                'nullable',
                'array',
            ],

            'role_ids.*' => [
                'integer',
                'exists:roles,id',
            ],
        ]);

        $data = [
            'name' => $validated['name'],
            'username' => $validated['username'] ?? null,
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'status' => $validated['status'],
        ];

        $user->update($data);

        if (
            auth()->user()->can('assign_roles')
            && isset($validated['role_ids'])
        ) {
            $roles = Role::whereIn(
                'id',
                $validated['role_ids'],
            )->pluck('name');

            $user->syncRoles($roles);
        }

        return redirect()
            ->route('admin.users.index')
            ->with(
                'success',
                'Usuario actualizado correctamente.',
            );
    }

    /**
     * Eliminar usuario.
     */
    public function destroy(
        Request $request,
        User $user
    ): RedirectResponse {
        abort_unless(
            $request->user()->can('users.delete'),
            403
        );

        /*
         * No puedes eliminar tu propia cuenta.
         */
        if ($request->user()->is($user)) {
            return back()->withErrors([
                'user' =>
                    'No puedes eliminar tu propia cuenta.',
            ]);
        }

        /*
         * Protección del último administrador.
         */
        if ($user->hasRole('administrador')) {
            $otherAdministratorExists =
                User::role('administrador')
                    ->whereKeyNot($user->id)
                    ->exists();

            if (! $otherAdministratorExists) {
                return back()->withErrors([
                    'user' =>
                        'No puedes eliminar al último administrador.',
                ]);
            }
        }

        $user->delete();

        return back()->with(
            'success',
            'Usuario eliminado correctamente.'
        );
    }
}