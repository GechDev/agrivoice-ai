/**
 * AgriVoice domain types.
 *
 * These TypeScript interfaces mirror the shapes produced by backend
 * Eloquent Resources (ReportResource, MarketResource, PriceSnapshotResource).
 * Any field rename on the backend must be reflected here, and vice versa.
 *
 * The naming convention is camelCase (TypeScript standard), while the
 * backend database uses snake_case. The mapping happens in the Resources.
 */

/** Supported commodity crops — must stay in sync with App\Enums\Crop */
export type Crop =
    'teff' | 'coffee' | 'maize' | 'wheat' | 'sesame' | 'pulses' | 'sorghum';

/** Market location slugs — must stay in sync with App\Enums\MarketSlug */
export type MarketSlug = 'adama' | 'addis_ababa' | 'jimma';

/** Alias for MarketSlug — used in PriceSnapshot where "market" is the location */
export type Market = MarketSlug;

/** Price trend direction — must stay in sync with App\Enums\Trend */
export type Trend = 'up' | 'down' | 'stable';

/** Who supplied the price report — must stay in sync with App\Enums\ReporterType */
export type ReporterType = 'official' | 'crowd';

/**
 * A computed price aggregate for one crop×market tile on the dashboard.
 *
 * Produced by SnapshotService on the backend, serialised via
 * PriceSnapshotResource. The dashboard renders one PriceCard per
 * snapshot. The `price` field is a recency-weighted average across
 * all unflagged reports in the trailing 14-day window.
 */
export interface PriceSnapshot {
    crop: Crop;
    market: MarketSlug;
    /** Recency-weighted average ETB/quintal — 0 means no data */
    price: number;
    /** 0–100 confidence score based on count + recency + agreement */
    confidence: number;
    /** Number of unflagged reports contributing to this snapshot */
    reportCount: number;
    /** ISO 8601 timestamp of the most recent report, or null if no data */
    lastUpdated: string | null;
    trend: Trend;
    /** Percentage change from previous 7-day period, or null if insufficient data */
    changePercent: number | null;
}

export interface PriceHistoryPoint {
    date: string;
    price: number;
}

export interface PriceExplorerFilters {
    crop: Crop | null;
    market: MarketSlug | null;
    trend: Trend | null;
    sort: 'crop' | 'market' | 'price' | 'change' | 'confidence' | 'updated';
    direction: 'asc' | 'desc';
    chart_crop: Crop | null;
    chart_market: MarketSlug | null;
}

/**
 * Reference data for a market location on the Leaflet map.
 *
 * Sent by DashboardController as the `markets` prop. The map renders
 * one marker per entry. Clicking a marker filters the live list to
 * that market.
 */
export interface MarketMarker {
    slug: MarketSlug;
    name: string;
    region: string;
    latitude: number;
    longitude: number;
    /** Approximate reporting radius used to scatter submission pins */
    catchmentRadiusKm?: number;
}

/**
 * A visualised crowd-report pin inside the selected market catchment.
 *
 * Reports do not store GPS yet — these points are deterministic stand-ins
 * so the dashboard map can show where submissions are treated as coming from.
 */
export interface SubmissionLocation {
    id: number;
    latitude: number;
    longitude: number;
    /** Crop represented by this submission pin */
    crop: Crop;
}

/**
 * A single price report in the live report list.
 *
 * Produced by ReportResource on the backend. The `source` field carries
 * the reporter_type value ("official" or "crowd") — the naming mismatch
 * is intentional: the front-end cares about "where did this price come
 * from?" (source), not the database column name.
 */
export interface ReportRowData {
    id: number;
    crop: Crop;
    market: MarketSlug;
    /** ETB per quintal — cast to float by ReportResource */
    price: number;
    /** ISO 8601 timestamp of when the price was observed */
    reportedAt: string;
    /** Reporter type: "official" (WFP/ECX) or "crowd" (farmer-reported) */
    source: ReporterType;
    /** Denormalised agent name — avoids a second query for the relationship */
    agentName: string;
    /** Whether this report has been flagged as an outlier */
    isFlagged: boolean;
    /** When the report was entered into the system, or null for seeded data */
    createdAt: string | null;
}

/**
 * Minimal agent identity passed to the portal entry form.
 *
 * Only includes id and name — PIN is never sent to the front-end.
 */
export interface AgentSummary {
    id: number;
    name: string;
}

/**
 * Market reference data for the entry form's market picker.
 *
 * Same shape as MarketMarker but used in a different context (form
 * vs. map).
 */
export interface MarketOption {
    slug: MarketSlug;
    name: string;
    region: string;
    latitude: number;
    longitude: number;
}
