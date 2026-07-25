import type { ImgHTMLAttributes } from 'react';

import logoUrl from '@/assets/logo.png';
import { cn } from '@/lib/utils';

type AppLogoIconProps = ImgHTMLAttributes<HTMLImageElement>;

/**
 * AgriVoice brand mark — Vite-bundled so it always loads with the app UI.
 * Source asset is a square padded mark for clean circular / rounded crops.
 */
export default function AppLogoIcon({
    className,
    alt = 'AgriVoice',
    ...props
}: AppLogoIconProps) {
    return (
        <img
            src={logoUrl}
            alt={alt}
            className={cn('shrink-0 object-cover', className)}
            {...props}
        />
    );
}
