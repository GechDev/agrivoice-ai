import type { SVGAttributes } from 'react';

import { cn } from '@/lib/utils';

type AppLogoIconProps = SVGAttributes<SVGSVGElement>;

/**
 * AgriVoice brand mark — inline SVG so it never depends on Vite asset URLs
 * and stays sharp at every size (sidebar, auth, marketing).
 */
export default function AppLogoIcon({ className, ...props }: AppLogoIconProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 64 64"
            fill="none"
            role="img"
            aria-label="AgriVoice"
            className={cn('shrink-0', className)}
            {...props}
        >
            <rect width="64" height="64" rx="32" fill="#0F3D33" />
            <path
                d="M18 44c0-12 8-22 18-26 1.5 8 1 16-2 23-3 7-9 11-16 11v-8z"
                fill="#C9A24A"
            />
            <path
                d="M18 44c3-1 7-4 9-9"
                stroke="#0F3D33"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            <path
                d="M46 20c0 12-8 22-18 26-1.5-8-1-16 2-23 3-7 9-11 16-11v8z"
                fill="#E8E2D6"
            />
            <path
                d="M46 20c-3 1-7 4-9 9"
                stroke="#0F3D33"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            <circle cx="24" cy="32" r="2.2" fill="#C9A24A" />
            <circle cx="32" cy="32" r="2.2" fill="#3D7A4A" />
            <circle cx="40" cy="32" r="2.2" fill="#8B5E3C" />
            <path
                d="M24 32h16"
                stroke="#E8E2D6"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    );
}
