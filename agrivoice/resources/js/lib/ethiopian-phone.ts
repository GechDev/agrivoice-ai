/**
 * Client-side Ethiopian mobile normalization for previews only.
 * Mirrors App\Support\EthiopianPhoneNumber — server validation is authoritative.
 */
const CANONICAL = /^\+251[97]\d{8}$/;

export function tryNormalizeEthiopianPhone(input: string): string | null {
    const cleaned = input.replace(/[\s-]+/g, '');

    if (cleaned === '') {
        return null;
    }

    const local = cleaned.match(/^0([97]\d{8})$/);

    if (local) {
        return `+251${local[1]}`;
    }

    const intl = cleaned.match(/^\+251([97]\d{8})$/);

    if (intl) {
        return `+251${intl[1]}`;
    }

    return null;
}

export function isCanonicalEthiopianPhone(value: string): boolean {
    return CANONICAL.test(value);
}
