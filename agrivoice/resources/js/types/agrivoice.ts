export type Crop = 'teff' | 'coffee';
export type MarketSlug = 'adama' | 'addis_ababa' | 'jimma';
export type Trend = 'up' | 'down' | 'stable';
export type ReporterType = 'official' | 'crowd';

export interface PriceSnapshot {
    crop: Crop;
    market: MarketSlug;
    price: number;
    confidence: number;
    reportCount: number;
    lastUpdated: string | null;
    trend: Trend;
    changePercent: number | null;
}

export interface MarketMarker {
    slug: MarketSlug;
    name: string;
    region: string;
    latitude: number;
    longitude: number;
}
