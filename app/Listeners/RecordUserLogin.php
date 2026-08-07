<?php

namespace App\Listeners;

use App\Models\User;
use Illuminate\Auth\Events\Login;


class RecordUserLogin
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
       public function handle(Login $event): void
    {
        if (! $event->user instanceof User) {
            return;
        }

        $event->user->forceFill([
            'last_login_at' => now(),
            'last_login_ip' => request()->ip(),
            'last_seen_at' => now(),
        ])->saveQuietly();
    }
}
