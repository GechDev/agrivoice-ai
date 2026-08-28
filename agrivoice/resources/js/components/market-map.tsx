/**
 * Interactive Leaflet map for the selected market catchment.
 *
 * Shows:
 * - One hub marker on the selected market centre
 * - 20–40 submission pins scattered inside that market's catchment
 * - Dim hub markers for the other markets (click to switch location)
 *
 * Bounds always fit the selected market's submission cloud so the
 * visible map area matches the selected region.
 */
import { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslations } from '@/hooks/use-translations';
import { cropLabel, formatPrice, marketLabel } from '@/lib/agrivoice';
import type {
    MarketMarker,
    MarketSlug,
    PriceSnapshot,
    SubmissionLocation,
} from '@/types';

type MarketMapProps = {
    markets: MarketMarker[];
    snapshots: PriceSnapshot[];
    submissionLocations: SubmissionLocation[];
    selectedMarket: MarketSlug;
    onSelectMarket?: (market: MarketSlug) => void;
};

function hubIcon(selected: boolean): L.DivIcon {
    const fill = selected ? '#2f6b3a' : '#6b7280';
    const size = selected ? 36 : 28;

    return L.divIcon({
        className: 'av-map-hub-icon',
        iconSize: [size, size],
        iconAnchor: [size / 2, size],
        popupAnchor: [0, -size + 4],
        html: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="${fill}" stroke="#fff" stroke-width="1.5" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            <circle cx="12" cy="9" r="2.5" fill="#fff"/>
        </svg>`,
    });
}

function submissionIcon(): L.DivIcon {
    return L.divIcon({
        className: 'av-map-submission-icon',
        iconSize: [18, 18],
        iconAnchor: [9, 18],
        popupAnchor: [0, -16],
        html: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#ef6c00" stroke="#fff" stroke-width="1.25" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            <circle cx="12" cy="9" r="2.25" fill="#fff"/>
        </svg>`,
    });
}

export function MarketMap({
    markets,
    snapshots,
    submissionLocations,
    selectedMarket,
    onSelectMarket,
}: MarketMapProps) {
    const t = useTranslations();
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const markersRef = useRef<L.LayerGroup | null>(null);

    const snapshotsByMarket = useMemo(() => {
        const map = new Map<string, PriceSnapshot[]>();

        for (const snapshot of snapshots) {
            const list = map.get(snapshot.market) ?? [];
            list.push(snapshot);
            map.set(snapshot.market, list);
        }

        return map;
    }, [snapshots]);

    const selected = useMemo(
        () => markets.find((market) => market.slug === selectedMarket) ?? null,
        [markets, selectedMarket],
    );

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

    useEffect(() => {
        const map = mapRef.current;
        const layer = markersRef.current;

        if (!map || !layer || !selected) {
            return;
        }

        layer.clearLayers();

        const collecting = t('Collecting data');
        const confLabel = t('conf');
        const reportsLabel = t('reports');
        const cropFieldLabel = t('Crop');
        const priceFieldLabel = t('Price');
        const boundsPoints: L.LatLngTuple[] = [];
        const reportPin = submissionIcon();
        const selectedSnapshots = snapshotsByMarket.get(selectedMarket) ?? [];

        for (const point of submissionLocations) {
            const snapshot = selectedSnapshots.find(
                (candidate) => candidate.crop === point.crop,
            );
            const cropName = t(cropLabel(point.crop));
            const price =
                snapshot && snapshot.reportCount > 0
                    ? `${formatPrice(snapshot.price)} ${t('ETB/q')}`
                    : collecting;
            const marker = L.marker([point.latitude, point.longitude], {
                icon: reportPin,
                title: `${cropName}: ${price}`,
                keyboard: false,
                riseOnHover: true,
            }).bindPopup(
                `<div style="min-width:160px"><strong>${t('Report submission')}</strong><br/><span style="color:#666">${t(marketLabel(selectedMarket))} · ${selected.region}</span><br/><br/><strong>${cropFieldLabel}:</strong> ${cropName}<br/><strong>${priceFieldLabel}:</strong> ${price}</div>`,
            );

            layer.addLayer(marker);
            boundsPoints.push([point.latitude, point.longitude]);
        }

        for (const market of markets) {
            const marketSnapshots = snapshotsByMarket.get(market.slug) ?? [];
            const marketName = t(marketLabel(market.slug));
            const isSelected = selectedMarket === market.slug;
            const lines = marketSnapshots
                .filter((s) => s.market === market.slug)
                .map((s) => {
                    const price =
                        s.reportCount === 0
                            ? collecting
                            : `${formatPrice(s.price)} ${t('ETB/q')}`;

                    return `<strong>${t(cropLabel(s.crop))}</strong>: ${price} · ${s.confidence}% ${confLabel} · ${s.reportCount} ${reportsLabel}`;
                })
                .join('<br/>');

            const marker = L.marker([market.latitude, market.longitude], {
                icon: hubIcon(isSelected),
                title: marketName,
                zIndexOffset: isSelected ? 1000 : 0,
            }).bindPopup(
                `<div style="min-width:160px"><strong>${marketName}</strong><br/><span style="color:#666">${market.region}</span><br/><br/>${lines || collecting}</div>`,
            );

            marker.on('click', () => {
                onSelectMarket?.(market.slug);
            });

            layer.addLayer(marker);

            if (isSelected) {
                boundsPoints.push([market.latitude, market.longitude]);
            }
        }

        if (boundsPoints.length > 0) {
            map.fitBounds(L.latLngBounds(boundsPoints), {
                padding: [36, 36],
                maxZoom: 12,
                animate: true,
            });
        }
    }, [
        markets,
        snapshotsByMarket,
        submissionLocations,
        selected,
        selectedMarket,
        onSelectMarket,
        t,
    ]);

    return (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-md">
            <div className="border-b border-border px-5 py-3">
                <h2 className="text-sm font-semibold tracking-wide text-card-foreground uppercase">
                    {t('Market map')}
                </h2>
                <p className="text-xs text-muted-foreground">
                    {t('Report submissions in :location', {
                        location: t(marketLabel(selectedMarket)),
                    })}
                    {' · '}
                    {submissionLocations.length} {t('pins')}
                </p>
            </div>
            <div ref={containerRef} className="h-[320px] w-full md:h-[400px]" />
        </div>
    );
}
