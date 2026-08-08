<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Acciones automáticas
    |--------------------------------------------------------------------------
    */

    'actions' => [
        'view',
        'create',
        'update',
        'delete',
    ],

    /*
    |--------------------------------------------------------------------------
    | Acciones especiales
    |--------------------------------------------------------------------------
    */

    'extra_actions' => [

        'User' => [
            'roles.update',
            'status.update',
            'password.update',
        ],

         'AuditLog' => [
            'export',
            'retention.update',
        ],

    ],

    /*
    |--------------------------------------------------------------------------
    | Modelos que NO generarán permisos
    |--------------------------------------------------------------------------
    */

    'excluded_models' => [
        'SystemSetting',
    ],

    /*
    |--------------------------------------------------------------------------
    | Permisos administrativos
    |--------------------------------------------------------------------------
    */

    'system_permissions' => [

        // Roles
        'roles.view',
        'roles.create',
        'roles.update',
        'roles.delete',

        // Permisos
        'permissions.view',
        'permissions.update',
        'permissions.sync',

        // Configuración
        'settings.view',
        'settings.update',

    ],

];