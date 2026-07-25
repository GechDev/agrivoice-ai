export type PriceTrend = 'up' | 'down' | 'stable' | 'unavailable';

export type CooperativePriceRow = {
    crop: string;
    cropLabel: string;
    market: string;
    currentPrice: number | null;
    regionalAverage: number | null;
    regionalMarketCount: number;
    comparisonPercentage: number | null;
    trend: PriceTrend;
    trendPercentage: number | null;
    asOf: string | null;
};

export type CooperativePriceSummary = {
    cooperative: {
        name: string;
        region: string;
    };
    period: {
        from: string;
        to: string;
        label: string;
    };
    definition: string;
    regionalMarketsCount: number;
    rows: CooperativePriceRow[];
};
