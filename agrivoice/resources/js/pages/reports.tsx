import { Head, setLayoutProps, usePoll } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { RecentReportsFeed } from '@/components/recent-reports-feed';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useTranslations } from '@/hooks/use-translations';
import { index as reportsIndex } from '@/actions/App/Http/Controllers/ReportController';
import type { Crop, MarketSlug, ReportRowData } from '@/types';

type ReportsPageProps = {
    reports: ReportRowData[];
};

type CropFilter = 'all' | Crop;
type MarketFilter = 'all' | MarketSlug;

export default function Reports({ reports }: ReportsPageProps) {
    const t = useTranslations();
    const [crop, setCrop] = useState<CropFilter>('all');
    const [market, setMarket] = useState<MarketFilter>('all');
    const [flaggedOnly, setFlaggedOnly] = useState(false);

    setLayoutProps({
        breadcrumbs: [
            {
                title: t('Live list'),
                href: reportsIndex(),
            },
        ],
    });

    usePoll(
        2500,
        { only: ['reports'] },
        { mode: 'rest', keepAlive: true },
    );

    const filtered = useMemo(() => {
        return reports.filter((report) => {
            if (crop !== 'all' && report.crop !== crop) {
                return false;
            }

            if (market !== 'all' && report.market !== market) {
                return false;
            }

            if (flaggedOnly && !report.isFlagged) {
                return false;
            }

            return true;
        });
    }, [reports, crop, market, flaggedOnly]);

    return (
        <>
            <Head title={t('Live list')} />
            <div className="flex flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <header className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Live data list
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Newest agent entries · flag outliers to correct the
                        dashboard · updates every 2.5s
                    </p>
                </header>

                <section
                    aria-label="Filters"
                    className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-4 shadow-md"
                >
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="filter-crop">Crop</Label>
                        <Select
                            value={crop}
                            onValueChange={(value) =>
                                setCrop(value as CropFilter)
                            }
                        >
                            <SelectTrigger id="filter-crop" className="w-[140px]">
                                <SelectValue placeholder="Crop" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All crops</SelectItem>
                                <SelectItem value="teff">Teff</SelectItem>
                                <SelectItem value="coffee">Coffee</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="filter-market">Market</Label>
                        <Select
                            value={market}
                            onValueChange={(value) =>
                                setMarket(value as MarketFilter)
                            }
                        >
                            <SelectTrigger
                                id="filter-market"
                                className="w-[160px]"
                            >
                                <SelectValue placeholder="Market" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All markets</SelectItem>
                                <SelectItem value="adama">Adama</SelectItem>
                                <SelectItem value="addis_ababa">
                                    Addis Ababa
                                </SelectItem>
                                <SelectItem value="jimma">Jimma</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        type="button"
                        variant={flaggedOnly ? 'default' : 'outline'}
                        onClick={() => setFlaggedOnly((v) => !v)}
                    >
                        {flaggedOnly ? 'Flagged only' : 'Show flagged only'}
                    </Button>

                    <p className="ml-auto text-sm text-muted-foreground">
                        Showing{' '}
                        <span className="font-semibold text-foreground">
                            {filtered.length}
                        </span>{' '}
                        of {reports.length}
                    </p>
                </section>

                <RecentReportsFeed reports={filtered} />
            </div>
        </>
    );
}
