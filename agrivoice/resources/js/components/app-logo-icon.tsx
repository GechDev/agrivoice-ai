import type { ImgHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

type AppLogoIconProps = ImgHTMLAttributes<HTMLImageElement>;

/**
 * AgriVoice brand mark served from /public/logo.png.
 */
export default function AppLogoIcon({
    className,
    alt = 'AgriVoice',
    ...props
}: AppLogoIconProps) {
    return (
        <img
            src="/logo.png"
            alt={alt}
            className={cn('object-contain', className)}
            {...props}
        />
    );
}
