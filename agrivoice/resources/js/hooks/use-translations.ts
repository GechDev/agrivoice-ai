import { usePage } from '@inertiajs/react';

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
