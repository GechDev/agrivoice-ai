import { usePage, router } from '@inertiajs/react';
import { Languages } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import language from '@/routes/language';

const languages = [
    { code: 'en', label: 'English', nativeLabel: 'English' },
    { code: 'am', label: 'Amharic', nativeLabel: 'አማርኛ' },
    { code: 'om', label: 'Afaan Oromoo', nativeLabel: 'Afaan Oromoo' },
];

export function LanguageSwitcher() {
    const { locale } = usePage().props;
    const currentLocale = (locale as string) || 'en';

    function switchLanguage(code: string) {
        if (code === currentLocale) return;

        router.post(language.switch().url, { locale: code });
    }

    const current = languages.find((l) => l.code === currentLocale);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                    <Languages className="size-5" />
                    <span className="sr-only">
                        {current?.nativeLabel ?? 'English'}
                    </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[10rem]">
                <DropdownMenuRadioGroup
                    value={currentLocale}
                    onValueChange={switchLanguage}
                >
                    {languages.map((lang) => (
                        <DropdownMenuRadioItem key={lang.code} value={lang.code}>
                            <span className="flex items-center gap-2">
                                <span>{lang.nativeLabel}</span>
                                <span className="text-muted-foreground text-xs">
                                    {lang.label}
                                </span>
                            </span>
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
