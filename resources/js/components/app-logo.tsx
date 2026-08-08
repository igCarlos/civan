import {
    usePage,
} from '@inertiajs/react';

import AppLogoIcon from './app-logo-icon';

type SystemSettings = {
    panel_name?: string;
    short_name?: string;
};

export default function AppLogo() {
    const {
        system,
    } = usePage<{
        system?: SystemSettings;
    }>().props;

    const panelName =
        system?.panel_name ??
        'CIVAN Panel';

    return (
        <>
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-md">
                <AppLogoIcon className="size-5 text-white dark:text-black" />
            </div>

            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-none font-semibold">
                    {panelName}
                </span>
            </div>
        </>
    );
}
