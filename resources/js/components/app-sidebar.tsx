import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

import { type NavItem } from '@/types';

import {
    Link,
    usePage,
} from '@inertiajs/react';

import {
    Activity,
    BookOpen,
    Folder,
    KeyRound,
    LayoutGrid,
    Settings,
    ShieldCheck,
    Users,
} from 'lucide-react';

import AppLogo from './app-logo';

/*
|--------------------------------------------------------------------------
| Tipo para elementos protegidos por permisos
|--------------------------------------------------------------------------
*/

type PermissionNavItem = NavItem & {
    permission: string;
};

/*
|--------------------------------------------------------------------------
| Menú principal
|--------------------------------------------------------------------------
*/

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutGrid,
    },
];

/*
|--------------------------------------------------------------------------
| Administración
|--------------------------------------------------------------------------
*/

const administrationNavItems: PermissionNavItem[] = [
    {
        title: 'Usuarios',
        url: '/dashboard/usuarios',
        icon: Users,
        permission: 'users.view',
    },

    {
        title: 'Roles',
        url: '/dashboard/roles',
        icon: ShieldCheck,
        permission: 'roles.view',
    },

    {
        title: 'Permisos',
        url: '/dashboard/permisos',
        icon: KeyRound,
        permission: 'permissions.view',
    },

    {
        title: 'Auditoría',
        url: '/dashboard/auditoria',
        icon: Activity,
        permission: 'audit_logs.view',
    },
];

/*
|--------------------------------------------------------------------------
| Configuración
|--------------------------------------------------------------------------
*/

const configurationNavItems: PermissionNavItem[] = [
    {
        title: 'Sistema',
        url: '/dashboard/configuracion/sistema',
        icon: Settings,
        permission: 'settings.view',
    },
];

/*
|--------------------------------------------------------------------------
| Footer
|--------------------------------------------------------------------------
*/

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        url: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },

    {
        title: 'Documentation',
        url: 'https://laravel.com/docs/starter-kits',
        icon: BookOpen,
    },
];

/*
|--------------------------------------------------------------------------
| Sidebar
|--------------------------------------------------------------------------
*/

export function AppSidebar() {
    /*
    |--------------------------------------------------------------------------
    | Obtener permisos enviados por Laravel
    |--------------------------------------------------------------------------
    */

    const { auth } = usePage<{
        auth: {
            user: unknown;
            roles: string[];
            permissions: string[];
        };
    }>().props;

    /*
    |--------------------------------------------------------------------------
    | Verificar permiso
    |--------------------------------------------------------------------------
    */

    const hasPermission = (
        permission: string,
    ): boolean => {
        return (
            auth.permissions?.includes(
                permission,
            ) ?? false
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Filtrar módulos visibles
    |--------------------------------------------------------------------------
    */

    const visibleAdministrationItems =
        administrationNavItems.filter(
            (item) =>
                hasPermission(
                    item.permission,
                ),
        );

    const visibleConfigurationItems =
        configurationNavItems.filter(
            (item) =>
                hasPermission(
                    item.permission,
                ),
        );

    return (
        <Sidebar
            collapsible="icon"
            variant="inset"
        >
            {/* Header */}

            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                        >
                            <Link
                                href="/dashboard"
                                prefetch
                            >
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* Contenido */}

            <SidebarContent>
                {/* General */}

                <NavMain
                    label="General"
                    items={mainNavItems}
                />

                {/* Administración */}

                {visibleAdministrationItems.length >
                    0 && (
                    <NavMain
                        label="Administración"
                        items={
                            visibleAdministrationItems
                        }
                    />
                )}

                {/* Configuración */}

                {visibleConfigurationItems.length >
                    0 && (
                    <NavMain
                        label="Configuración"
                        items={
                            visibleConfigurationItems
                        }
                    />
                )}
            </SidebarContent>

            {/* Footer */}

            <SidebarFooter>
                <NavFooter
                    items={footerNavItems}
                    className="mt-auto"
                />

                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
