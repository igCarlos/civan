<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(
            Inspiring::quotes()->random()
        )->explode('-');

        $user = $request->user();

        return [
            ...parent::share($request),

            'name' => config('app.name'),

            'quote' => [
                'message' => trim($message),
                'author' => trim($author),
            ],

            'auth' => [
                'user' => $user,

                'roles' => $user
                    ? $user->getRoleNames()
                        ->values()
                        ->all()
                    : [],

                'permissions' => $user
                    ? $user->getAllPermissions()
                        ->pluck('name')
                        ->values()
                        ->all()
                    : [],
            ],

            'sidebarOpen' =>
                $request->cookie('sidebar_state') !== 'false',
        ];
    }
}