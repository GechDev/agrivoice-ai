import { createInertiaApp } from '@inertiajs/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import { handleInitialSharedFlash } from '@/hooks/use-flash-toast';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';
import type { SharedFlash } from '@/types/ui';

const appName = 'AgriVoice';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name === 'welcome':
                return null;
            case name === 'report-price':
                return null;
            // Agents are not Laravel-authenticated users, so the portal brings
            // its own chrome instead of the app shell's account menu.
            case name.startsWith('portal/'):
                return null;
            case name.startsWith('auth/'):
                return AuthLayout;
            case name.startsWith('Cooperative/auth/'):
            case name.startsWith('cooperative/auth/'):
                return AuthLayout;
            case name.startsWith('settings/'):
                return [AppLayout, SettingsLayout];
            default:
                return AppLayout;
        }
    },
    strictMode: true,
    withApp(app, { page, ssr }) {
        // Toaster sits outside the Inertia tree, so initial flash must be
        // read from withApp instead of usePage().
        if (!ssr) {
            handleInitialSharedFlash(
                page.props.flash as SharedFlash | undefined,
            );
        }

        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        color: 'oklch(0.42 0.13 145)',
    },
});

// This will set light / dark mode on load...
initializeTheme();
