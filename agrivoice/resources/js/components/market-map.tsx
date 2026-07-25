/**
 * Interactive Leaflet map showing all tracked markets with price popups.
 *
 * Each market gets a marker at its geographic coordinates. Clicking a marker
 * opens a popup listing every crop's latest price, confidence score, and
 * report count for that market. The map auto-fits bounds to encompass all
 * markers with padding, so it works whether there are 1 or 10 markets.
 *
 * Design decisions:
 * - `scrollWheelZoom: false` prevents accidental zoom when scrolling the dashboard.
 * - OpenStreetMap tiles (map imagery only — no app data API; allowlisted in CSP).
 * - Marker icons are imported from the leaflet package and merged into
 *   `L.Icon.Default` to fix the well-known webpack/vite bundling issue.
 * - Price/snapshot data is Inertia props from DashboardController — never fetched
 *   from a public REST endpoint.
 * - Markers are managed via a `L.LayerGroup` — on each props update the layer
 *   is cleared and rebuilt rather than diffing, which is fine for ≤10 markets.
 *
 * Props come from DashboardController via PriceSnapshotResource and
 * MarketMarkerResource. The snapshots array is pre-grouped by market in the
 * `useMemo` below to avoid O(n²) lookups during marker creation.
 */
import { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';
import { useTranslations } from '@/hooks/use-translations';
import { cropLabel, formatPrice, marketLabel } from '@/lib/agrivoice';
import type { MarketMarker, PriceSnapshot } from '@/types';

/**
 * Fix Leaflet's default marker icons when bundled by Vite/Webpack.
 * Without this, markers appear as broken images because the default
 * icon URLs point to a path that doesn't exist in the bundle.
 */
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

type MarketMapProps = {
    markets: MarketMarker[];
    snapshots: PriceSnapshot[];
};

export function MarketMap({ markets, snapshots }: MarketMapProps) {
    const t = useTranslations();
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const markersRef = useRef<L.LayerGroup | null>(null);

    /**
     * Pre-group snapshots by market slug so marker creation is O(n) instead of O(n²).
     * The map is rebuilt from scratch on every props change (see useEffect below),
     * which is acceptable for the small number of markets in this demo.
     */
    const snapshotsByMarket = useMemo(() => {
        const map = new Map<string, PriceSnapshot[]>();

        for (const snapshot of snapshots) {
            const list = map.get(snapshot.market) ?? [];
            list.push(snapshot);
            map.set(snapshot.market, list);
        }

        return map;
    }, [snapshots]);

    /**
     * Initialize the Leaflet map once on mount. The empty dependency array
     * ensures this only runs a single time — subsequent re-renders update
     * markers via the second useEffect, not the map instance itself.
     *
     * Centered on Ethiopia (8.5°N, 38.5°E) at zoom level 6, which shows
     * all three markets (Adama, Addis Ababa, Jimma) in a single view.
     */
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

    /**
     * Rebuild all markers whenever markets or snapshots change.
     * Clears the entire layer group and re-creates markers from scratch.
     * Each marker's popup contains an HTML table of crop prices, confidence,
     * and report count. After all markers are added, fitBounds zooms the
     * map to show all points with padding.
     */
    useEffect(() => {
        const map = mapRef.current;
        const layer = markersRef.current;

        if (!map || !layer) {
            return;
        }

        layer.clearLayers();

        const points: L.LatLngTuple[] = [];
        const collecting = t('Collecting data');
        const confLabel = t('conf');
        const reportsLabel = t('reports');

        for (const market of markets) {
            const marketSnapshots = snapshotsByMarket.get(market.slug) ?? [];
            const marketName = t(marketLabel(market.slug));
            const lines = marketSnapshots
                .map((s) => {
                    const price =
                        s.reportCount === 0
                            ? collecting
                            : `${formatPrice(s.price)} ${t('ETB/q')}`;

                    return `<strong>${t(cropLabel(s.crop))}</strong>: ${price} · ${s.confidence}% ${confLabel} · ${s.reportCount} ${reportsLabel}`;
                })
                .join('<br/>');

            const marker = L.marker([market.latitude, market.longitude], {
                title: marketName,
            }).bindPopup(
                `<div style="min-width:160px"><strong>${marketName}</strong><br/><span style="color:#666">${market.region}</span><br/><br/>${lines || collecting}</div>`,
            );

            layer.addLayer(marker);
            points.push([market.latitude, market.longitude]);
        }

        if (points.length > 0) {
            map.fitBounds(L.latLngBounds(points), {
                padding: [40, 40],
                maxZoom: 7,
            });
        }
    }, [markets, snapshotsByMarket, t]);

    return (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-md">
            <div className="border-b border-border px-5 py-3">
                <h2 className="text-sm font-semibold tracking-wide text-card-foreground uppercase">
                    {t('Market map')}
                </h2>
                <p className="text-xs text-muted-foreground">
                    {[t('Adama'), t('Addis Ababa'), t('Jimma')].join(' · ')}
                </p>
            </div>
            <div ref={containerRef} className="h-[320px] w-full md:h-[400px]" />
        </div>
    );
}
