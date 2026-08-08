<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Retención de auditoría
    |--------------------------------------------------------------------------
    |
    | Por ahora únicamente se eliminan eventos de navegación (page_view).
    | Los eventos importantes como login, logout, create, update, delete,
    | role_change, permission_change, audit_export, etc. se conservan.
    |
    */

    'retention' => [

        'page_view_days' =>
            (int) env(
                'AUDIT_PAGE_VIEW_RETENTION_DAYS',
                30
            ),

        'chunk_size' =>
            (int) env(
                'AUDIT_PRUNE_CHUNK_SIZE',
                1000
            ),

    ],

];