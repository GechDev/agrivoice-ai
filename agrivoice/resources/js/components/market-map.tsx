import { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';
import { useTranslations } from '@/hooks/use-translations';
import { cropLabel, marketLabel } from '@/lib/agrivoice';
import type { MarketMarker, PriceSnapshot } from '@/types';

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

    const snapshotsByMarket = useMemo(() => {
        const map = new Map<string, PriceSnapshot[]>();

        for (const snapshot of snapshots) {
            const list = map.get(snapshot.market) ?? [];
            list.push(snapshot);
            map.set(snapshot.market, list);
        }

        return map;
    }, [snapshots]);

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
                            : `${new Intl.NumberFormat('en-ET', { maximumFractionDigits: 0 }).format(s.price)} ${t('ETB/q')}`;

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
