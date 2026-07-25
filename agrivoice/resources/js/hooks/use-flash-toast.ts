import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import type { FlashToast } from '@/types/ui';

/**
 * Subscribes to Inertia flash events and displays them as toast notifications.
 *
 * The server can send flash data via session()->flash('toast', [...]).
 * This hook listens for the Inertia 'flash' event and renders the
 * toast using sonner. Used for server-side notifications like
 * "Password updated" or "Settings saved."
 */
export function useFlashToast(): void {
    useEffect(() => {
        return router.on('flash', (event) => {
            const flash = (event as CustomEvent).detail?.flash;
            const data = flash?.toast as FlashToast | undefined;

            if (!data) {
                return;
            }

            toast[data.type](data.message);
        });
    }, []);
}
