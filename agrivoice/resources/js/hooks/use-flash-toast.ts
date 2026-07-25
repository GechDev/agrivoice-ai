import { router, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import type { FlashToast, SharedFlash } from '@/types/ui';

let initialSharedFlashHandled = false;
let lastToastedSuccess: string | null = null;
let lastToastedError: string | null = null;

function toastSharedFlash(flash: SharedFlash | undefined): void {
    if (!flash) {
        return;
    }

    if (typeof flash.success === 'string' && flash.success !== '') {
        if (flash.success !== lastToastedSuccess) {
            lastToastedSuccess = flash.success;
            toast.success(flash.success);
        }
    } else {
        lastToastedSuccess = null;
    }

    if (typeof flash.error === 'string' && flash.error !== '') {
        if (flash.error !== lastToastedError) {
            lastToastedError = flash.error;
            toast.error(flash.error);
        }
    } else {
        lastToastedError = null;
    }
}

/**
 * Subscribes to Inertia flash events and displays them as toast notifications.
 *
 * The server can send flash data via session()->flash('toast', [...]).
 * This hook listens for the Inertia 'flash' event and renders the
 * toast using sonner. Used for server-side notifications like
 * "Password updated" or "Settings saved."
 */
export function useFlashToast(): void {
    const page = usePage();

    useEffect(() => {
        if (initialSharedFlashHandled) {
            return;
        }

        initialSharedFlashHandled = true;
        toastSharedFlash(page.props.flash);
    }, [page.props.flash]);

    useEffect(() => {
        const removeFlashListener = router.on('flash', (event) => {
            const flash = (event as CustomEvent).detail?.flash as
                (SharedFlash & { toast?: FlashToast }) | undefined;

            if (!flash) {
                return;
            }

            const data = flash.toast;

            if (data?.type && data.message) {
                toast[data.type](data.message);
            }
        });

        const removeSuccessListener = router.on('success', (event) => {
            const nextFlash = (event as CustomEvent).detail?.page?.props
                ?.flash as SharedFlash | undefined;

            toastSharedFlash(nextFlash);
        });

        return () => {
            removeFlashListener();
            removeSuccessListener();
        };
    }, []);
}
