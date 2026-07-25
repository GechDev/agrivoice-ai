import { usePage } from '@inertiajs/react';

/**
 * Client-side translation hook backed by server-side Flash translations.
 *
 * How it works:
 * 1. HandleInertiaRequests middleware shares a `translations` prop
 *    containing all Flash translation strings for the current locale.
 * 2. This hook reads that prop and returns a lookup function.
 * 3. Components call `t('Dashboard')` — if the key exists in the
 *    translations map, it returns the translated value; otherwise it
 *    returns the key itself (acts as passthrough).
 *
 * Supports placeholder replacement: `t(':name is :age', { name: 'Nati', age: '25' })`
 * replaces `:name` and `:age` in the translated string.
 *
 * This is a lightweight i18n system — no ICU message format, no
 * pluralisation. It exists because the starter kit already ships
 * with Flash translations and we need a way to access them from
 * React components.
 */
export function useTranslations() {
    const { translations } = usePage().props;

    return (key: string, replacements?: Record<string, string>): string => {
        let text = (translations as Record<string, string>)?.[key] ?? key;

        if (replacements) {
            for (const [k, v] of Object.entries(replacements)) {
                text = text.replace(`:${k}`, v);
            }
        }

        return text;
    };
}
