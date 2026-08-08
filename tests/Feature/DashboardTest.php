<?php

use App\Models\User;
use Spatie\Permission\Models\Role;

test('guests are redirected to the login page', function () {
    $this->get('/dashboard')->assertRedirect('/login');
});

test('authenticated active users can visit the dashboard', function () {
    $role = Role::firstOrCreate([
        'name' => 'administrador',
        'guard_name' => 'web',
    ]);

    $user = User::factory()->create([
        'status' => 'active',
    ]);

    $user->assignRole($role);

    $this->actingAs($user)
        ->get('/dashboard')
        ->assertOk();
});