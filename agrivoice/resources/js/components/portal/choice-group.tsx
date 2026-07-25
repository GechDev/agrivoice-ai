import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

export type Choice<TValue extends string> = {
    value: TValue;
    label: string;
    description?: string;
    icon?: LucideIcon;
};

type ChoiceGroupProps<TValue extends string> = {
    /** Groups the radios, which is what gives arrow-key navigation for free. */
    name: string;
    legend: string;
    value: TValue;
    choices: readonly Choice<TValue>[];
    onChange: (value: TValue) => void;
    className?: string;
};

/**
 * A set of selectable cards built on native radios, so an agent can move
 * through the options from the keyboard without leaving the form.
 */
export default function ChoiceGroup<TValue extends string>({
    name,
    legend,
    value,
    choices,
    onChange,
    className,
}: ChoiceGroupProps<TValue>) {
    return (
        <fieldset>
            <legend className="sr-only">{legend}</legend>

            <div className={cn('grid gap-3', className)}>
                {choices.map((choice) => {
                    const Icon = choice.icon;

                    return (
                        <label
                            key={choice.value}
                            className={cn(
                                'flex cursor-pointer items-center gap-3 rounded-2xl border bg-card p-3.5 transition-colors',
                                'hover:border-primary/40 hover:bg-accent/40',
                                'has-[:checked]:border-primary has-[:checked]:bg-primary/5',
                                'has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50',
                            )}
                        >
                            <input
                                type="radio"
                                name={name}
                                value={choice.value}
                                checked={value === choice.value}
                                onChange={() => onChange(choice.value)}
                                className="sr-only"
                            />

                            {Icon && (
                                <span
                                    className={cn(
                                        'flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors',
                                        value === choice.value
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted text-muted-foreground',
                                    )}
                                >
                                    <Icon className="size-4" />
                                </span>
                            )}

                            <span className="min-w-0">
                                <span className="block text-sm font-medium">
                                    {choice.label}
                                </span>
                                {choice.description && (
                                    <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                                        {choice.description}
                                    </span>
                                )}
                            </span>
                        </label>
                    );
                })}
            </div>
        </fieldset>
    );
}
