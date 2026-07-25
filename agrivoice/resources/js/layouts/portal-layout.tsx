import { Link, router } from '@inertiajs/react';
import { LogOut } from 'lucide-react';
import type { ReactNode } from 'react';

import { AppearanceToggle } from '@/components/appearance-toggle';
import { Button } from '@/components/ui/button';
import { useInitials } from '@/hooks/use-initials';
import type { AgentSummary } from '@/types';

/**
 * Layout wrapper for the data-entry portal.
 *
 * This is a separate layout from the main app shell because portal
 * agents are not Fortify-authenticated users. The sidebar, account
 * menu, and settings links don't apply to them — they just need
 * a minimal header with the agent's identity and a logout button.
 *
 * Layout structure:
 * - Sticky header with: AgriVoice logo · "Field data entry" label ·
 *   appearance toggle · agent avatar + name · logout button
 * - Main content area (centered, max-width 6xl)
 *
 * The logout button fires a POST to /portal/logout (not a link)
 * because logout should be a state-changing action, not a navigation.
 */
type PortalLayoutProps = {
    agent: AgentSummary;
    children: ReactNode;
};

export default function PortalLayout({ agent, children }: PortalLayoutProps) {
    const getInitials = useInitials();

    return (
        <div className="min-h-dvh bg-muted/30">
            <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-md">
                <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/"
                            className="text-lg font-bold tracking-[-0.01em] text-primary"
                        >
                            AgriVoice
                        </Link>
                        <span aria-hidden className="h-4 w-px bg-border" />
                        <span className="text-sm font-medium text-muted-foreground">
                            Field data entry
                        </span>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <AppearanceToggle />
                        <div className="flex items-center gap-2.5 rounded-full border border-border/70 bg-card py-1 pr-3 pl-1">
                            <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                                {getInitials(agent.name)}
                            </span>
                            <span className="text-sm font-medium">
                                {agent.name}
                            </span>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Sign out"
                            title="Sign out"
                            onClick={() => router.post('/portal/logout')}
                        >
                            <LogOut />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
                {children}
            </main>
        </div>
    );
}
