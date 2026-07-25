import { createInertiaApp } from '@inertiajs/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

/**
 * Inertia app bootstrap — the entry point for all client-side rendering.
 *
 * This file configures three things:
 *
 * 1. LAYOUT ROUTING: Maps page component names to layout wrappers.
 *    The layout resolver uses a prefix-based switch:
 *    - "welcome" → no layout (full-bleed landing page)
 *    - "portal/*" → no layout (portal has its own PortalLayout)
 *    - "auth/*" → AuthLayout (centered card layout)
 *    - "settings/*" → AppLayout + SettingsLayout (nested)
 *    - everything else → AppLayout (sidebar + header)
 *
 * 2. GLOBAL PROVIDERS: Wraps the entire app in TooltipProvider and
 *    Toaster (sonner) for toast notifications.
 *
 * 3. THEME: initializeTheme() reads the appearance cookie and applies
 *    the correct dark/light class before React renders, preventing
 *    a flash of wrong theme.
 */
createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name === 'welcome':
                return null;
            // Portal pages render their own layout (PortalLayout) because
            // agents are not Fortify-authenticated users — the app shell's
            // account menu doesn't apply to them.
            case name.startsWith('portal/'):
                return null;
            case name.startsWith('auth/'):
                return AuthLayout;
            case name.startsWith('settings/'):
                return [AppLayout, SettingsLayout];
            default:
                return AppLayout;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        // Grey progress bar — matches the claymorphism theme
        color: '#4B5563',
    },
});

// Read the appearance cookie and apply dark/light class before render.
// Must run after createInertiaApp to avoid a flash of unstyled content.
initializeTheme();
