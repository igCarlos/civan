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

import {
    useTranslation,
} from '@/hooks/use-translation';

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

type PermissionNavItem = NavItem & {
    permission: string;
};

export function AppSidebar() {
    const {
        auth,
    } = usePage<{
        auth: {
            user: unknown;
            roles: string[];
            permissions: string[];
        };
    }>().props;

    const {
        t,
    } = useTranslation();

    const hasPermission = (
        permission: string,
    ): boolean => {
        return (
            auth.permissions?.includes(
                permission,
            ) ?? false
        );
    };

    const mainNavItems: NavItem[] = [
        {
            title: t(
                'nav.dashboard',
            ),
            url: '/dashboard',
            icon: LayoutGrid,
        },
    ];

    const administrationNavItems: PermissionNavItem[] = [
        {
            title: t(
                'nav.users',
            ),
            url: '/dashboard/usuarios',
            icon: Users,
            permission: 'users.view',
        },

        {
            title: t(
                'nav.roles',
            ),
            url: '/dashboard/roles',
            icon: ShieldCheck,
            permission: 'roles.view',
        },

        {
            title: t(
                'nav.permissions',
            ),
            url: '/dashboard/permisos',
            icon: KeyRound,
            permission: 'permissions.view',
        },

        {
            title: t(
                'nav.audit',
            ),
            url: '/dashboard/auditoria',
            icon: Activity,
            permission: 'audit_logs.view',
        },
    ];

    const configurationNavItems: PermissionNavItem[] = [
        {
            title: t(
                'nav.system',
            ),
            url: '/dashboard/configuracion/sistema',
            icon: Settings,
            permission: 'settings.view',
        },
    ];

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

            <SidebarContent>
                <NavMain
                    label={t(
                        'nav.general',
                    )}
                    items={
                        mainNavItems
                    }
                />

                {visibleAdministrationItems.length >
                    0 && (
                    <NavMain
                        label={t(
                            'nav.administration',
                        )}
                        items={
                            visibleAdministrationItems
                        }
                    />
                )}

                {visibleConfigurationItems.length >
                    0 && (
                    <NavMain
                        label={t(
                            'nav.configuration',
                        )}
                        items={
                            visibleConfigurationItems
                        }
                    />
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter
                    items={
                        footerNavItems
                    }
                    className="mt-auto"
                />

                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
