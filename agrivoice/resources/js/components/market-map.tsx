import { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';
import { cropLabel } from '@/lib/agrivoice';
import type { MarketMarker, PriceSnapshot } from '@/types';

// Vite breaks Leaflet's default icon URLs by changing the asset paths
// during bundling. We rebind the icons once at module load time so
// markers render correctly. Without this, all markers show broken images.
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

/**
 * Format a price for the map popup.
 *
 * Shows "Collecting data" when there are no reports, otherwise
 * formats as "8,600 ETB/q".
 */
function formatPrice(price: number, count: number): string {
    if (count === 0) {
        return 'Collecting data';
    }

    return `${new Intl.NumberFormat('en-ET', { maximumFractionDigits: 0 }).format(price)} ETB/q`;
}

type MarketMapProps = {
    markets: MarketMarker[];
    snapshots: PriceSnapshot[];
};

/**
 * Interactive Leaflet map showing the three market locations.
 *
 * Each marker shows a popup with the market name, region, and a
 * summary of all crop prices at that market. The popup is HTML
 * (not React) because Leaflet doesn't support React components
 * natively.
 *
 * Map initialization:
 * - Centre: Ethiopia (8.5°N, 38.5°E), zoom level 6
 * - Tile layer: OpenStreetMap (free, no API key needed)
 * - Scroll wheel zoom disabled (prevents accidental zoom on projector)
 * - Markers auto-fit with 40px padding
 *
 * Updates: The markers effect re-runs on every `snapshots` change
 * (which happens every 2.5s via polling). It clears all markers and
 * re-adds them with fresh popup content. This is simpler than
 * diffing individual markers and fast enough for 3 markets.
 */
export function MarketMap({ markets, snapshots }: MarketMapProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const markersRef = useRef<L.LayerGroup | null>(null);

    // Group snapshots by market slug for efficient lookup when building popups
    const snapshotsByMarket = useMemo(() => {
        const map = new Map<string, PriceSnapshot[]>();

        for (const snapshot of snapshots) {
            const list = map.get(snapshot.market) ?? [];
            list.push(snapshot);
            map.set(snapshot.market, list);
        }

        return map;
    }, [snapshots]);

    // Initialize the Leaflet map once on mount, clean up on unmount
    useEffect(() => {
        if (!containerRef.current || mapRef.current) {
            return;
        }

        const map = L.map(containerRef.current, {
            scrollWheelZoom: false,
            zoomControl: true,
        }).setView([8.5, 38.5], 6);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 18,
        }).addTo(map);

        markersRef.current = L.layerGroup().addTo(map);
        mapRef.current = map;

        return () => {
            map.remove();
            mapRef.current = null;
            markersRef.current = null;
        };
    }, []);

    // Rebuild markers whenever markets or snapshots change
    useEffect(() => {
        const map = mapRef.current;
        const layer = markersRef.current;

        if (!map || !layer) {
            return;
        }

        layer.clearLayers();

        const points: L.LatLngTuple[] = [];

        for (const market of markets) {
            const marketSnapshots = snapshotsByMarket.get(market.slug) ?? [];
            // Build an HTML popup with all crop prices at this market
            const lines = marketSnapshots
                .map(
                    (s) =>
                        `<strong>${cropLabel(s.crop)}</strong>: ${formatPrice(s.price, s.reportCount)} · ${s.confidence}% conf · ${s.reportCount} reports`,
                )
                .join('<br/>');

            const marker = L.marker([market.latitude, market.longitude], {
                title: market.name,
            }).bindPopup(
                `<div style="min-width:160px"><strong>${market.name}</strong><br/><span style="color:#666">${market.region}</span><br/><br/>${lines || 'Collecting data'}</div>`,
            );

            layer.addLayer(marker);
            points.push([market.latitude, market.longitude]);
        }

        // Auto-zoom to fit all markers with padding
        if (points.length > 0) {
            map.fitBounds(L.latLngBounds(points), {
                padding: [40, 40],
                maxZoom: 7,
            });
        }
    }, [markets, snapshotsByMarket]);

    return (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-md">
            <div className="border-b border-border px-5 py-3">
                <h2 className="text-sm font-semibold tracking-wide text-card-foreground uppercase">
                    Market map
                </h2>
                <p className="text-xs text-muted-foreground">
                    Adama · Addis Ababa · Jimma
                </p>
            </div>
            <div ref={containerRef} className="h-[320px] w-full md:h-[400px]" />
        </div>
    );
}
