/**
 * AgriVoice domain utilities — labels, formatting, and constants.
 *
 * This file is the front-end's single source of truth for:
 * - Crop/market/reporter-type display labels
 * - Price formatting (ETB with thousands separators)
 * - Date/time formatting ("Today", "3h ago", "15 Jan")
 * - Price input parsing (strips commas from "8,500" → 8500)
 *
 * Import these instead of re-deriving labels or formatting inline.
 * Keeps the UI consistent and avoids "Teff" vs "TEFF" vs "teff"
 * inconsistencies across components.
 */

import type { Crop, Market, ReporterType } from '@/types';

/** All supported crops, in display order. */
export const CROPS: readonly Crop[] = [
    'teff',
    'coffee',
    'maize',
    'wheat',
    'sesame',
    'pulses',
    'sorghum',
] as const;

/** Reporter types for the entry form's radio group. */
export const REPORTER_TYPES: readonly ReporterType[] = [
    'crowd',
    'official',
] as const;

/** PascalCase display labels for crops. */
const CROP_LABELS: Record<Crop, string> = {
    teff: 'Teff',
    coffee: 'Coffee',
    maize: 'Maize',
    wheat: 'Wheat',
    sesame: 'Sesame',
    pulses: 'Pulses',
    sorghum: 'Sorghum',
};

/** Human-readable market names (handles the underscore → space mapping). */
const MARKET_LABELS: Record<Market, string> = {
    adama: 'Adama',
    addis_ababa: 'Addis Ababa',
    jimma: 'Jimma',
};

/** Capitalised reporter type labels for the UI. */
const REPORTER_TYPE_LABELS: Record<ReporterType, string> = {
    official: 'Official',
    crowd: 'Crowd',
};

/**
 * Longer descriptions shown in the entry form's reporter-type picker.
 * These help non-technical agents understand the difference between
 * "Official" (a published price sheet) and "Crowd" (a farmer's
 * actual transaction).
 */
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

/**
 * Format an ETB price with thousands separators, no decimals.
 *
 * Uses Intl.NumberFormat for locale-aware formatting. Ethiopian
 * prices are whole numbers (no cents), so maximumFractionDigits is 0.
 * Example: 8600 → "8,600"
 */
const priceFormatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
});

/** Format a price for display. Unit (ETB/quintal) is rendered separately. */
export function formatPrice(price: number): string {
    return priceFormatter.format(price);
}

/**
 * Parse a user-typed price string into a number.
 *
 * Strips commas and spaces so "8,500" or "8 500" → 8500.
 * Mirrors the server-side StoreReportRequest::prepareForValidation().
 */
export function parsePriceInput(value: string): number {
    return Number(value.replace(/[,\s]/gu, ''));
}

/**
 * Format an ISO date as a human-readable observed-on label.
 *
 * - Today → "Today"
 * - Yesterday → "Yesterday"
 * - Older → "15 Jan" (day + abbreviated month)
 *
 * Uses en-GB format (day before month) which is standard in Ethiopia.
 */
const dayFormatter = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
});

type TranslateFn = (
    key: string,
    replacements?: Record<string, string>,
) => string;

export function formatObservedOn(
    isoDate: string,
    t: TranslateFn = (key) => key,
): string {
    const observedOn = new Date(isoDate);
    const daysAgo = wholeDaysBetween(observedOn, new Date());

    if (daysAgo === 0) {
        return t('Today');
    }

    if (daysAgo === 1) {
        return t('Yesterday');
    }

    return dayFormatter.format(observedOn);
}

/**
 * Format a timestamp as a relative time label.
 *
 * - < 45 seconds → "just now"
 * - < 60 minutes → "12m ago"
 * - < 24 hours → "3h ago"
 * - ≥ 24 hours → "2d ago"
 *
 * Used in the live report list and dashboard "last updated" indicators.
 */
export function formatTimeAgo(
    isoDate: string,
    t: TranslateFn = (key) => key,
): string {
    const elapsedSeconds = Math.max(
        0,
        (Date.now() - new Date(isoDate).getTime()) / 1000,
    );

    if (elapsedSeconds < 45) {
        return t('Just now');
    }

    const elapsedMinutes = Math.round(elapsedSeconds / 60);

    if (elapsedMinutes < 60) {
        return t(':count m ago', { count: String(elapsedMinutes) });
    }

    const elapsedHours = Math.round(elapsedMinutes / 60);

    if (elapsedHours < 24) {
        return t(':count h ago', { count: String(elapsedHours) });
    }

    return t(':count d ago', {
        count: String(Math.round(elapsedHours / 24)),
    });
}

/**
 * Get today's date as a YYYY-MM-DD string for <input type="date">.
 *
 * Converts from the browser's UTC timezone to local midnight so the
 * date picker shows "today" correctly regardless of the user's
 * timezone offset.
 */
export function todayAsInputValue(): string {
    const now = new Date();
    const localMidnight = new Date(
        now.getTime() - now.getTimezoneOffset() * 60_000,
    );

    return localMidnight.toISOString().slice(0, 10);
}

/**
 * Calculate whole days between two dates (ignoring time components).
 *
 * Uses UTC midnight-to-midnight to avoid DST edge cases where the
 * same day could be counted as 0 or 1 days depending on timezone.
 */
function wholeDaysBetween(from: Date, to: Date): number {
    const fromMidnight = Date.UTC(
        from.getFullYear(),
        from.getMonth(),
        from.getDate(),
    );
    const toMidnight = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());

    return Math.round((toMidnight - fromMidnight) / 86_400_000);
}
