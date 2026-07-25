import type { Auth } from '@/types/auth';
import type { SharedFlash } from '@/types/cooperative-members';

declare module 'react' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            locale: string;
            translations: Record<string, string>;
            flash: SharedFlash;
            [key: string]: unknown;
        };
    }
}
