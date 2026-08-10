<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Services\UserAgentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SessionController extends Controller
{
    public function __construct(
        private readonly UserAgentService $userAgentService,
    ) {
    }

    /**
     * Mostrar las sesiones activas del usuario autenticado.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $currentSessionId = $request->session()->getId();

        $table = config('session.table', 'sessions');
        $lifetime = (int) config('session.lifetime', 120);

        $minimumActivity =
            now()
                ->subMinutes($lifetime)
                ->timestamp;

        $sessions =
            DB::table($table)
                ->where(
                    'user_id',
                    $user->getAuthIdentifier()
                )
                ->where(
                    'last_activity',
                    '>=',
                    $minimumActivity
                )
                ->orderByDesc(
                    'last_activity'
                )
                ->get()
                ->map(function ($session) use ($currentSessionId) {
                    $agent =
                        $this
                            ->userAgentService
                            ->parse(
                                $session->user_agent
                            );

                    return [
                        'id' =>
                            $session->id,

                        'ip_address' =>
                            $session->ip_address,

                        'browser' =>
                            $agent['browser'],

                        'platform' =>
                            $agent['platform'],

                        'device' =>
                            $agent['device'],

                        'user_agent' =>
                            $session->user_agent,

                        'last_activity' =>
                            (int) $session->last_activity,

                        'last_activity_iso' =>
                            now()
                                ->setTimestamp(
                                    (int) $session->last_activity
                                )
                                ->toIso8601String(),

                        'is_current' =>
                            hash_equals(
                                (string) $currentSessionId,
                                (string) $session->id
                            ),
                    ];
                })
                ->sortByDesc(
                    fn (array $session) =>
                        $session['is_current']
                            ? PHP_INT_MAX
                            : $session['last_activity']
                )
                ->values();

        return Inertia::render(
            'settings/sessions',
            [
                'sessions' =>
                    $sessions,

                'sessionLifetimeMinutes' =>
                    $lifetime,
            ]
        );
    }

    /**
     * Cerrar una sesión específica del usuario.
     */
    public function destroy(
        Request $request,
        string $sessionId,
    ): RedirectResponse {
        $currentSessionId =
            $request
                ->session()
                ->getId();

        if (
            hash_equals(
                (string) $currentSessionId,
                (string) $sessionId
            )
        ) {
            return back()->withErrors([
                'session' =>
                    'No puedes cerrar la sesión que estás utilizando actualmente.',
            ]);
        }

        $table =
            config(
                'session.table',
                'sessions'
            );

        $deleted =
            DB::table($table)
                ->where(
                    'id',
                    $sessionId
                )
                ->where(
                    'user_id',
                    $request
                        ->user()
                        ->getAuthIdentifier()
                )
                ->delete();

        abort_unless(
            $deleted > 0,
            404
        );

        return back()->with(
            'status',
            'La sesión seleccionada fue cerrada correctamente.'
        );
    }

    /**
     * Cerrar todas las demás sesiones, conservando la actual.
     */
    public function destroyOthers(
        Request $request,
    ): RedirectResponse {
        $table =
            config(
                'session.table',
                'sessions'
            );

        $currentSessionId =
            $request
                ->session()
                ->getId();

        $deleted =
            DB::table($table)
                ->where(
                    'user_id',
                    $request
                        ->user()
                        ->getAuthIdentifier()
                )
                ->where(
                    'id',
                    '!=',
                    $currentSessionId
                )
                ->delete();

        return back()->with(
            'status',
            $deleted === 1
                ? 'Se cerró 1 sesión adicional.'
                : "Se cerraron {$deleted} sesiones adicionales."
        );
    }
}
