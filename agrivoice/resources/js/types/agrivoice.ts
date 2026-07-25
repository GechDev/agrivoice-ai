export type Crop = 'teff' | 'coffee';
export type MarketSlug = 'adama' | 'addis_ababa' | 'jimma';
export type Market = MarketSlug;
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

export interface ReportRowData {
    id: number;
    crop: Crop;
    market: MarketSlug;
    price: number;
    reportedAt: string;
    source: ReporterType;
    agentName: string;
    isFlagged: boolean;
    createdAt: string | null;
}

/** The agent whose session is entering data, from ReportController@create. */
export interface AgentSummary {
    id: number;
    name: string;
}

export interface MarketOption {
    slug: MarketSlug;
    name: string;
    region: string;
    latitude: number;
    longitude: number;
}
