import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

/**
 * A choice option with a label, optional description, and optional icon.
 *
 * Used by both the crop picker and the reporter-type picker in the
 * entry form. The generic TValue parameter allows the same component
 * to handle both Crop and ReporterType values.
 */
export type Choice<TValue extends string> = {
    value: TValue;
    label: string;
    description?: string;
    icon?: LucideIcon;
};

type ChoiceGroupProps<TValue extends string> = {
    /** Groups the native radio inputs for arrow-key navigation. */
    name: string;
    /** Screen-reader legend for the fieldset. */
    legend: string;
    /** Currently selected value. */
    value: TValue;
    /** Available choices to render as tappable cards. */
    choices: readonly Choice<TValue>[];
    /** Callback when the user selects a choice. */
    onChange: (value: TValue) => void;
    className?: string;
};

/**
 * Accessible radio card group built on native `<input type="radio">`.
 *
 * Why native radios instead of custom state?
 * 1. Arrow-key navigation works for free (browser native)
 * 2. Screen readers announce the group correctly via <fieldset>/<legend>
 * 3. The `has-[:checked]` CSS selector handles selection styling without JS
 *
 * Each card is a `<label>` wrapping a visually-hidden radio input.
 * When clicked, the radio fires onChange → parent updates state →
 * the `has-[:checked]` selector applies the selected style.
 *
 * Used for:
 * - Crop picker (7 options with icons)
 * - Reporter type picker (2 options with descriptions)
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
