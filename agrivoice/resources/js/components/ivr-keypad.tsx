import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type IvrMenuOption = {
    key: string;
    crop: string | null;
    label: string;
};

type IvrKeypadProps = {
    options: IvrMenuOption[];
    disabled?: boolean;
    activeKey?: string | null;
    listening?: boolean;
    onSelect: (key: string) => void;
};

export function IvrKeypad({
    options,
    disabled = false,
    activeKey = null,
    listening = false,
    onSelect,
}: IvrKeypadProps) {
    useEffect(() => {
        function onKeyDown(event: KeyboardEvent) {
            if (disabled && event.key !== '5') {
                return;
            }

            if (['1', '2', '3', '4', '5'].includes(event.key)) {
                event.preventDefault();
                onSelect(event.key);
            }
        }

        window.addEventListener('keydown', onKeyDown);

        return () => window.removeEventListener('keydown', onKeyDown);
    }, [disabled, onSelect]);

    return (
        <div
            className="grid w-full max-w-xs grid-cols-3 gap-4"
            role="group"
            aria-label="IVR keypad"
        >
            {options.map((option) => (
                <Button
                    key={option.key}
                    type="button"
                    size="lg"
                    variant={activeKey === option.key ? 'default' : 'outline'}
                    disabled={disabled && option.key !== '5'}
                    onClick={() => onSelect(option.key)}
                    className={cn(
                        'h-24 rounded-3xl text-3xl font-bold tabular-nums shadow-md',
                        option.key === '5' && 'col-span-3 sm:col-span-1 sm:col-start-2',
                        listening &&
                            option.key === '5' &&
                            'animate-pulse ring-2 ring-primary',
                    )}
                >
                    {option.key}
                </Button>
            ))}
        </div>
    );
}
