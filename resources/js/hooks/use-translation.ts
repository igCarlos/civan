import {
    usePage,
} from '@inertiajs/react';

import {
    translations,
    type Locale,
    type TranslationKey,
} from '@/i18n/translations';

type SharedProps = {
    system?: {
        locale?: string;
    };
};

export function useTranslation() {
    const {
        system,
    } = usePage<SharedProps>().props;

    const locale: Locale =
        system?.locale === 'en'
            ? 'en'
            : 'es';

    const t = (
        key: TranslationKey,
    ): string => {
        return (
            translations[locale][key] ??
            translations.es[key] ??
            key
        );
    };

    return {
        locale,
        t,
    };
}
