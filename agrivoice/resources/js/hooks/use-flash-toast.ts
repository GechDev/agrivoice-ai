import { router } from '@inertiajs/react';
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
 * Toast shared flash props from the first Inertia page load.
 *
 * Called from createInertiaApp's withApp wrapper so Toaster can stay outside
 * the Inertia tree without calling usePage().
 */
export function handleInitialSharedFlash(flash: SharedFlash | undefined): void {
    if (initialSharedFlashHandled) {
        return;
    }

    initialSharedFlashHandled = true;
    toastSharedFlash(flash);
}

/**
 * Subscribes to Inertia flash events and displays them as toast notifications.
 *
 * Uses router events only — safe to call from components rendered outside the
 * Inertia PageContext (e.g. the global Sonner Toaster in withApp).
 */
export function useFlashToast(): void {
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
