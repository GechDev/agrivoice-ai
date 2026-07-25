import {
    type CSSProperties,
    type ElementType,
    type ReactNode,
    useEffect,
    useRef,
    useState,
} from 'react';

import { cn } from '@/lib/utils';

type AnimateInProps = {
    children: ReactNode;
    className?: string;
    /** HTML element or component to render as the wrapper */
    as?: ElementType;
    /** Visual variant for the reveal */
    variant?: 'up' | 'scale' | 'fade';
    /** Extra delay in ms before the reveal starts once visible */
    delay?: number;
    /** Stagger index (60ms steps) when revealing lists */
    index?: number;
    /** Only animate the first time it enters the viewport */
    once?: boolean;
};

/**
 * Scroll-triggered entrance animation.
 *
 * Uses IntersectionObserver so landing sections and long pages animate
 * as they come into view — not all at once on load. Respects
 * prefers-reduced-motion via CSS.
 */
export function AnimateIn({
    children,
    className,
    as: Tag = 'div',
    variant = 'up',
    delay = 0,
    index = 0,
    once = true,
}: AnimateInProps) {
    const ref = useRef<HTMLElement | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const node = ref.current;

        if (!node) {
            return;
        }

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setVisible(true);

            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry?.isIntersecting) {
                    setVisible(true);

                    if (once) {
                        observer.unobserve(node);
                    }
                } else if (!once) {
                    setVisible(false);
                }
            },
            { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
        );

        observer.observe(node);

        return () => observer.disconnect();
    }, [once]);

    const revealClass =
        variant === 'scale'
            ? 'av-reveal-scale'
            : variant === 'fade'
              ? 'av-reveal-fade'
              : 'av-reveal';

    const style = {
        '--av-delay': `${delay + index * 60}ms`,
    } as CSSProperties;

    return (
        <Tag
            ref={ref}
            className={cn(revealClass, visible && 'is-visible', className)}
            style={style}
        >
            {children}
        </Tag>
    );
}
