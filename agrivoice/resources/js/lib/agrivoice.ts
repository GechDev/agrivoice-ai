import type { Crop, Market, ReporterType } from '@/types';

export const CROPS: readonly Crop[] = ['teff', 'coffee'] as const;
export const REPORTER_TYPES: readonly ReporterType[] = [
    'crowd',
    'official',
] as const;

const CROP_LABELS: Record<Crop, string> = {
    teff: 'Teff',
    coffee: 'Coffee',
};

const MARKET_LABELS: Record<Market, string> = {
    adama: 'Adama',
    addis_ababa: 'Addis Ababa',
    jimma: 'Jimma',
};

const REPORTER_TYPE_LABELS: Record<ReporterType, string> = {
    official: 'Official',
    crowd: 'Crowd',
};

const REPORTER_TYPE_DESCRIPTIONS: Record<ReporterType, string> = {
    official: 'A published quote — a co-op board, ECX or WFP sheet.',
    crowd: 'A price a farmer or trader was actually offered.',
};

export function cropLabel(crop: Crop): string {
    return CROP_LABELS[crop];
}

export function marketLabel(market: Market): string {
    return MARKET_LABELS[market];
}

export function reporterTypeLabel(reporterType: ReporterType): string {
    return REPORTER_TYPE_LABELS[reporterType];
}

export function reporterTypeDescription(reporterType: ReporterType): string {
    return REPORTER_TYPE_DESCRIPTIONS[reporterType];
}

const priceFormatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
});

/** Prices are always ETB per quintal, so the unit is rendered beside them. */
export function formatPrice(price: number): string {
    return priceFormatter.format(price);
}

/** Mirrors the server, which also accepts a typed "8,500". */
export function parsePriceInput(value: string): number {
    return Number(value.replace(/[,\s]/gu, ''));
}

const dayFormatter = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
});

export function formatObservedOn(isoDate: string): string {
    const observedOn = new Date(isoDate);
    const daysAgo = wholeDaysBetween(observedOn, new Date());

    if (daysAgo === 0) {
        return 'Today';
    }

    if (daysAgo === 1) {
        return 'Yesterday';
    }

    return dayFormatter.format(observedOn);
}

export function formatTimeAgo(isoDate: string): string {
    const elapsedSeconds = Math.max(
        0,
        (Date.now() - new Date(isoDate).getTime()) / 1000,
    );

    if (elapsedSeconds < 45) {
        return 'just now';
    }

    const elapsedMinutes = Math.round(elapsedSeconds / 60);

    if (elapsedMinutes < 60) {
        return `${elapsedMinutes}m ago`;
    }

    const elapsedHours = Math.round(elapsedMinutes / 60);

    if (elapsedHours < 24) {
        return `${elapsedHours}h ago`;
    }

    return `${Math.round(elapsedHours / 24)}d ago`;
}

/** Today's date in the YYYY-MM-DD form a date input expects. */
export function todayAsInputValue(): string {
    const now = new Date();
    const localMidnight = new Date(
        now.getTime() - now.getTimezoneOffset() * 60_000,
    );

    return localMidnight.toISOString().slice(0, 10);
}

function wholeDaysBetween(from: Date, to: Date): number {
    const fromMidnight = Date.UTC(
        from.getFullYear(),
        from.getMonth(),
        from.getDate(),
    );
    const toMidnight = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());

    return Math.round((toMidnight - fromMidnight) / 86_400_000);
}
