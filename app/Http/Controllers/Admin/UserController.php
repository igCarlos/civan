<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;
use App\Models\SystemSetting;
use Illuminate\Http\JsonResponse;

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

        /*
        |--------------------------------------------------------------------------
        | Filtros
        |--------------------------------------------------------------------------
        */

        $search = trim(
            (string) $request->input('search', '')
        );

        $status = trim(
            (string) $request->input('status', '')
        );

        $presence = trim(
            (string) $request->input('presence', '')
        );

        $role = trim(
            (string) $request->input('role', '')
        );

        $dateFrom = trim(
            (string) $request->input('date_from', '')
        );

        $dateTo = trim(
            (string) $request->input('date_to', '')
        );

        $sort = trim(
            (string) $request->input('sort', 'newest')
        );

        /*
        |--------------------------------------------------------------------------
        | Valores permitidos
        |--------------------------------------------------------------------------
        */

        $allowedStatuses = [
            'active',
            'pending',
            'suspended',
        ];

        $allowedPresence = [
            'online',
            'away',
            'offline',
        ];

        $allowedSorts = [
            'newest',
            'oldest',
            'name_asc',
            'name_desc',
            'last_activity',
        ];

        if (! in_array($status, $allowedStatuses, true)) {
            $status = '';
        }

        if (! in_array($presence, $allowedPresence, true)) {
            $presence = '';
        }

        if (! in_array($sort, $allowedSorts, true)) {
            $sort = 'newest';
        }

        if (
            $dateFrom !== ''
            && ! preg_match('/^\d{4}-\d{2}-\d{2}$/', $dateFrom)
        ) {
            $dateFrom = '';
        }

        if (
            $dateTo !== ''
            && ! preg_match('/^\d{4}-\d{2}-\d{2}$/', $dateTo)
        ) {
            $dateTo = '';
        }

        /*
        |--------------------------------------------------------------------------
        | Registros por página
        |--------------------------------------------------------------------------
        |
        | Se respeta la configuración global definida en Configuración
        | del sistema.
        |
        */

        $perPage = (int) SystemSetting::valueOf(
            'system.per_page',
            20
        );

        if (
            ! in_array(
                $perPage,
                [10, 20, 25, 50, 100],
                true
            )
        ) {
            $perPage = 20;
        }

        /*
        |--------------------------------------------------------------------------
        | Límites de presencia
        |--------------------------------------------------------------------------
        |
        | online  = actividad en últimos 2 minutos
        | away    = actividad entre 2 y 10 minutos
        | offline = sin actividad o más de 10 minutos
        |
        */

        $onlineLimit = now()->copy()->subMinutes(2);
        $awayLimit = now()->copy()->subMinutes(10);

        /*
        |--------------------------------------------------------------------------
        | Consulta principal
        |--------------------------------------------------------------------------
        */

        $query = User::query()
            ->with('roles:id,name')

            /*
            | Búsqueda general
            */
            ->when(
                $search !== '',
                function ($query) use ($search) {
                    $query->where(
                        function ($query) use ($search) {
                            $query
                                ->where(
                                    'name',
                                    'like',
                                    "%{$search}%"
                                )
                                ->orWhere(
                                    'username',
                                    'like',
                                    "%{$search}%"
                                )
                                ->orWhere(
                                    'email',
                                    'like',
                                    "%{$search}%"
                                )
                                ->orWhere(
                                    'phone',
                                    'like',
                                    "%{$search}%"
                                );
                        }
                    );
                }
            )

            /*
            | Estado
            */
            ->when(
                $status !== '',
                fn ($query) =>
                    $query->where(
                        'status',
                        $status
                    )
            )

            /*
            | Rol
            */
            ->when(
                $role !== '',
                fn ($query) =>
                    $query->whereHas(
                        'roles',
                        fn ($roleQuery) =>
                            $roleQuery->where(
                                'name',
                                $role
                            )
                    )
            )

            /*
            | Fecha de creación desde
            */
            ->when(
                $dateFrom !== '',
                fn ($query) =>
                    $query->whereDate(
                        'created_at',
                        '>=',
                        $dateFrom
                    )
            )

            /*
            | Fecha de creación hasta
            */
            ->when(
                $dateTo !== '',
                fn ($query) =>
                    $query->whereDate(
                        'created_at',
                        '<=',
                        $dateTo
                    )
            );

        /*
        |--------------------------------------------------------------------------
        | Filtro por presencia
        |--------------------------------------------------------------------------
        */

        if ($presence === 'online') {
            $query->where(
                'last_seen_at',
                '>=',
                $onlineLimit
            );
        }

        if ($presence === 'away') {
            $query
                ->whereNotNull('last_seen_at')
                ->where(
                    'last_seen_at',
                    '<',
                    $onlineLimit
                )
                ->where(
                    'last_seen_at',
                    '>=',
                    $awayLimit
                );
        }

        if ($presence === 'offline') {
            $query->where(
                function ($query) use ($awayLimit) {
                    $query
                        ->whereNull('last_seen_at')
                        ->orWhere(
                            'last_seen_at',
                            '<',
                            $awayLimit
                        );
                }
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Orden
        |--------------------------------------------------------------------------
        |
        | Por defecto: más recientes primero.
        | Cada usuario recién creado aparecerá al inicio de la primera página.
        |
        */

        match ($sort) {
            'oldest' =>
                $query
                    ->orderBy('created_at', 'asc')
                    ->orderBy('id', 'asc'),

            'name_asc' =>
                $query
                    ->orderBy('name', 'asc')
                    ->orderBy('id', 'desc'),

            'name_desc' =>
                $query
                    ->orderBy('name', 'desc')
                    ->orderBy('id', 'desc'),

            'last_activity' =>
                $query
                    ->orderByDesc('last_seen_at')
                    ->orderByDesc('id'),

            default =>
                $query
                    ->orderByDesc('created_at')
                    ->orderByDesc('id'),
        };

        /*
        |--------------------------------------------------------------------------
        | Paginación
        |--------------------------------------------------------------------------
        */

        $users = $query
            ->paginate($perPage)
            ->withQueryString()
            ->through(function (User $user) {
                /*
                |--------------------------------------------------------------------------
                | Presencia del usuario
                |--------------------------------------------------------------------------
                */

                $presence = 'offline';

                if ($user->last_seen_at) {
                    if (
                        $user->last_seen_at->gte(
                            now()->subMinutes(2)
                        )
                    ) {
                        $presence = 'online';

                    } elseif (
                        $user->last_seen_at->gte(
                            now()->subMinutes(10)
                        )
                    ) {
                        $presence = 'away';
                    }
                }

                return [
                    'id' => $user->id,

                    'name' => $user->name,

                    'username' => $user->username,

                    'email' => $user->email,

                    'phone' => $user->phone,

                    'status' => $user->status,

                    /*
                    |--------------------------------------------------------------------------
                    | Roles
                    |--------------------------------------------------------------------------
                    */

                    'roles' => $user->roles
                        ->pluck('name')
                        ->values(),

                    /*
                    |--------------------------------------------------------------------------
                    | Presencia
                    |--------------------------------------------------------------------------
                    */

                    'presence' => $presence,

                    /*
                    |--------------------------------------------------------------------------
                    | Último inicio de sesión
                    |--------------------------------------------------------------------------
                    */

                    'last_login_at' =>
                        $user->last_login_at
                            ?->format('d/m/Y H:i:s'),

                    'last_login_at_human' =>
                        $user->last_login_at
                            ?->diffForHumans(),

                    /*
                    |--------------------------------------------------------------------------
                    | Última actividad
                    |--------------------------------------------------------------------------
                    */

                    'last_seen_at' =>
                        $user->last_seen_at
                            ?->format('d/m/Y H:i:s'),

                    'last_seen_at_human' =>
                        $user->last_seen_at
                            ?->diffForHumans(),

                    /*
                    |--------------------------------------------------------------------------
                    | Creación
                    |--------------------------------------------------------------------------
                    */

                    'created_at' =>
                        $user->created_at
                            ?->format('d/m/Y H:i'),
                ];
            });

        /*
        |--------------------------------------------------------------------------
        | Estadísticas globales
        |--------------------------------------------------------------------------
        |
        | Estas estadísticas NO dependen de los filtros del listado.
        |
        */

        $stats = [
            'total' =>
                User::query()->count(),

            'active' =>
                User::query()
                    ->where('status', 'active')
                    ->count(),

            'online' =>
                User::query()
                    ->where(
                        'last_seen_at',
                        '>=',
                        now()->subMinutes(2)
                    )
                    ->count(),

            'suspended' =>
                User::query()
                    ->where('status', 'suspended')
                    ->count(),
        ];

        /*
        |--------------------------------------------------------------------------
        | Roles disponibles para filtros
        |--------------------------------------------------------------------------
        */

        $filterRoles = Role::query()
            ->where('guard_name', 'web')
            ->orderBy('name')
            ->pluck('name')
            ->values();

        /*
        |--------------------------------------------------------------------------
        | Respuesta Inertia
        |--------------------------------------------------------------------------
        */

        return Inertia::render(
            'admin/users/index',
            [
                'users' => $users,

                'filters' => [
                    'search' => $search,
                    'status' => $status,
                    'presence' => $presence,
                    'role' => $role,
                    'date_from' => $dateFrom,
                    'date_to' => $dateTo,
                    'sort' => $sort,
                ],

                'filterOptions' => [
                    'roles' => $filterRoles,
                ],

                'stats' => $stats,

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

                    'viewAudit' =>
                        $request->user()->can('audit_logs.view'),
                ],
            ]
        );
    }

    /**
     * Mostrar formulario para crear usuario.
     */
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

    /**
     * Crear usuario.
     */
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

        /*
        |--------------------------------------------------------------------------
        | Verificar permiso para crear con un estado diferente de active
        |--------------------------------------------------------------------------
        */

        if (
            $validated['status'] !== 'active'
            && ! $request->user()->can('users.status.update')
        ) {
            abort(403);
        }

        /*
        |--------------------------------------------------------------------------
        | Crear usuario
        |--------------------------------------------------------------------------
        */

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

        /*
        |--------------------------------------------------------------------------
        | Auditoría: creación de usuario
        |--------------------------------------------------------------------------
        */

        app(AuditService::class)->log(
            event: 'create',
            subject: $user,
            module: 'users',
            description: "Creó al usuario {$user->name}.",
            newValues: [
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'phone' => $user->phone,
                'status' => $user->status,

                'roles' => $user
                    ->getRoleNames()
                    ->values()
                    ->all(),
            ],
        );

        return redirect()
            ->route('admin.users.index')
            ->with(
                'success',
                'Usuario creado correctamente.'
            );
    }

    /**
     * Mostrar formulario para editar usuario.
     */
    public function edit(
        Request $request,
        User $user
    ): Response {
        abort_unless(
            $request->user()->can('users.update'),
            403
        );

        $user->load('roles:id,name');

        $roles = Role::query()
            ->where('guard_name', 'web')
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('admin/users/edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'phone' => $user->phone,
                'status' => $user->status,

                'roles' => $user->roles
                    ->map(fn ($role) => [
                        'id' => $role->id,
                        'name' => $role->name,
                    ])
                    ->values(),
            ],

            'roles' => $roles,

            'can' => [
                'assignRoles' =>
                    $request->user()->can('users.roles.update'),

                'updateStatus' =>
                    $request->user()->can('users.status.update'),
            ],
        ]);
    }

    /**
     * Actualizar usuario.
     */
    public function update(
        Request $request,
        User $user
    ): RedirectResponse {
        abort_unless(
            $request->user()->can('users.update'),
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
                'min:6',
                'max:100',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z0-9_-]+$/',
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

            'role_ids' => [
                'nullable',
                'array',
            ],

            'role_ids.*' => [
                'integer',
                'exists:roles,id',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | Estado anterior
        |--------------------------------------------------------------------------
        */

        $before = [
            'name' => $user->name,
            'username' => $user->username,
            'email' => $user->email,
            'phone' => $user->phone,
            'status' => $user->status,
        ];

        $oldRoles = $user
            ->getRoleNames()
            ->sort()
            ->values()
            ->all();

        /*
        |--------------------------------------------------------------------------
        | Verificar permiso para cambiar estado
        |--------------------------------------------------------------------------
        */

        if (
            $validated['status'] !== $user->status
            && ! $request->user()->can('users.status.update')
        ) {
            abort(403);
        }

        /*
        |--------------------------------------------------------------------------
        | Actualizar información básica
        |--------------------------------------------------------------------------
        */

        $user->update([
            'name' => $validated['name'],
            'username' => $validated['username'] ?: null,
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?: null,
            'status' => $validated['status'],
        ]);

        $user->refresh();

        $after = [
            'name' => $user->name,
            'username' => $user->username,
            'email' => $user->email,
            'phone' => $user->phone,
            'status' => $user->status,
        ];

        /*
        |--------------------------------------------------------------------------
        | Auditoría: cambios de datos
        |--------------------------------------------------------------------------
        |
        | Guardamos solamente los campos que realmente cambiaron.
        |
        */

        $changedOldValues = [];
        $changedNewValues = [];

        foreach ($before as $field => $oldValue) {
            $newValue = $after[$field];

            if ($oldValue !== $newValue) {
                $changedOldValues[$field] = $oldValue;
                $changedNewValues[$field] = $newValue;
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Auditoría: cambio de estado
        |--------------------------------------------------------------------------
        */

        if ($before['status'] !== $after['status']) {
            app(AuditService::class)->log(
                event: 'status_change',
                subject: $user,
                module: 'users',
                description:
                    "Cambió el estado de {$user->name}.",
                oldValues: [
                    'status' => $before['status'],
                ],
                newValues: [
                    'status' => $after['status'],
                ],
            );

            unset(
                $changedOldValues['status'],
                $changedNewValues['status']
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Auditoría: edición general
        |--------------------------------------------------------------------------
        */

        if (! empty($changedOldValues)) {
            app(AuditService::class)->log(
                event: 'update',
                subject: $user,
                module: 'users',
                description:
                    "Editó al usuario {$user->name}.",
                oldValues: $changedOldValues,
                newValues: $changedNewValues,
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Actualizar roles
        |--------------------------------------------------------------------------
        */

        if (
            $request->user()->can('users.roles.update')
            && array_key_exists('role_ids', $validated)
        ) {
            $roleIds = $validated['role_ids'] ?? [];

            $roleNames = Role::query()
                ->where('guard_name', 'web')
                ->whereIn('id', $roleIds)
                ->pluck('name')
                ->all();

            /*
            |--------------------------------------------------------------------------
            | Proteger al último administrador
            |--------------------------------------------------------------------------
            */

            if (
                $user->hasRole('administrador')
                && ! in_array(
                    'administrador',
                    $roleNames,
                    true
                )
            ) {
                $otherAdministratorExists =
                    User::role('administrador')
                        ->whereKeyNot($user->id)
                        ->exists();

                if (! $otherAdministratorExists) {
                    return back()
                        ->withErrors([
                            'role_ids' =>
                                'No puedes quitar el rol administrador al último administrador del sistema.',
                        ])
                        ->withInput();
                }
            }

            $user->syncRoles($roleNames);

            $newRoles = $user
                ->fresh()
                ->getRoleNames()
                ->sort()
                ->values()
                ->all();

            /*
            |--------------------------------------------------------------------------
            | Auditoría: cambio de roles
            |--------------------------------------------------------------------------
            */

            if ($oldRoles !== $newRoles) {
                app(AuditService::class)->log(
                    event: 'role_change',
                    subject: $user,
                    module: 'users',
                    description:
                        "Modificó los roles de {$user->name}.",
                    oldValues: [
                        'roles' => $oldRoles,
                    ],
                    newValues: [
                        'roles' => $newRoles,
                    ],
                );
            }
        }

        return redirect()
            ->route('admin.users.index')
            ->with(
                'success',
                'Usuario actualizado correctamente.'
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

        /*
        |--------------------------------------------------------------------------
        | Auditoría: eliminación
        |--------------------------------------------------------------------------
        |
        | Se registra ANTES de borrar al usuario para conservar
        | sus datos y roles en el historial.
        |
        */

        app(AuditService::class)->log(
            event: 'delete',
            subject: $user,
            module: 'users',
            description:
                "Eliminó al usuario {$user->name}.",
            oldValues: [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'phone' => $user->phone,
                'status' => $user->status,

                'roles' => $user
                    ->getRoleNames()
                    ->values()
                    ->all(),
            ],
        );

        $user->delete();

        return back()->with(
            'success',
            'Usuario eliminado correctamente.'
        );
    }

    /**
     * Verificar disponibilidad de nombre de usuario.
     */
    public function checkUsername(Request $request): JsonResponse
    {
        abort_unless(
            $request->user()->can('users.update'),
            403
        );

        $validated = $request->validate([
            'username' => [
                'required',
                'string',
                'min:6',
                'max:100',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z0-9_-]+$/',
            ],

            'ignore' => [
                'nullable',
                'integer',
                'exists:users,id',
            ],
        ]);

        $username =
            $validated['username'];

        $ignoreId =
            $validated['ignore'] ?? null;

        $exists = User::query()
            ->where('username', $username)
            ->when(
                $ignoreId,
                fn ($query) =>
                    $query->where(
                        'id',
                        '!=',
                        $ignoreId
                    )
            )
            ->exists();

        $suggestion = null;

        if ($exists) {
            $base = substr(
                $username,
                0,
                90
            );

            for (
                $number = 2;
                $number <= 999;
                $number++
            ) {
                $candidate =
                    "{$base}_{$number}";

                $candidateExists =
                    User::query()
                        ->where(
                            'username',
                            $candidate
                        )
                        ->when(
                            $ignoreId,
                            fn ($query) =>
                                $query->whereKeyNot(
                                    $ignoreId
                                )
                        )
                        ->exists();

                if (! $candidateExists) {
                    $suggestion =
                        $candidate;

                    break;
                }
            }
        }

        return response()->json([
            'username' =>
                $username,

            'available' =>
                ! $exists,

            'suggestion' =>
                $suggestion,
        ]);
    }



}
