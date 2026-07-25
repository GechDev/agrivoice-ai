import { Link } from '@inertiajs/react';
import AppLogo from '@/components/app-logo';
import { AppearanceToggle } from '@/components/appearance-toggle';
import { LanguageSwitcher } from '@/components/language-switcher';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
            <div className="fixed top-4 right-4 z-50 flex items-center gap-1">
                <AppearanceToggle />
                <LanguageSwitcher />
            </div>
            <div className="w-full max-w-sm av-enter-scale">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-4 av-enter">
                        <Link
                            href={home()}
                            className="flex flex-col items-center gap-3 font-medium"
                        >
                            <AppLogo size="lg" />
                            <span className="sr-only">{title}</span>
                        </Link>

                        <div className="space-y-2 text-center av-enter av-delay-1">
                            <h1 className="text-xl font-medium">{title}</h1>
                            <p className="text-center text-sm text-muted-foreground">
                                {description}
                            </p>
                        </div>
                    </div>
                    <div className="av-enter av-delay-2">{children}</div>
                </div>
            </div>
        </div>
    );
}
