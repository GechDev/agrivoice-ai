export type Crop = 'teff' | 'coffee';
export type Market = 'adama' | 'addis_ababa' | 'jimma';
export type Trend = 'up' | 'down' | 'stable';
export type ReporterType = 'official' | 'crowd';

export interface PriceSnapshot {
    crop: Crop;
    market: Market;
    price: number; // ETB per quintal (aggregated)
    confidence: number; // 0-100
    reportCount: number;
    lastUpdated: string; // ISO
    trend: Trend;
}

export interface ReportRowData {
    id: number;
    crop: Crop;
    market: Market;
    price: number;
    reportedAt: string; // ISO
    source: ReporterType;
    agentName: string; // attribution
    isFlagged: boolean;
    createdAt: string; // ISO
}

/** The agent whose session is entering data, from ReportController@create. */
export interface AgentSummary {
    id: number;
    name: string;
}

export interface MarketOption {
    slug: Market;
    name: string;
    region: string;
    latitude: number;
    longitude: number;
}
