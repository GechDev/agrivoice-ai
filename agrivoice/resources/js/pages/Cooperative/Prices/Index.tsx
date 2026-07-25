import { Head, setLayoutProps } from '@inertiajs/react';
import { Download, Info } from 'lucide-react';
import {
    download,
    index,
} from '@/actions/App/Http/Controllers/CooperativePriceController';
import { PriceSummaryCards } from '@/components/cooperative/prices/price-summary-cards';
import { PriceTable } from '@/components/cooperative/prices/price-table';
import { PageSection } from '@/components/motion/page-section';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from '@/hooks/use-translations';
import { dashboard as cooperativeDashboard } from '@/routes/cooperative';
import type { CooperativePriceSummary } from '@/types/cooperative-prices';

export default function PricesIndex({
    summary,
}: {
    summary: CooperativePriceSummary;
}) {
    const t = useTranslations();

    setLayoutProps({
        breadcrumbs: [
            {
                title: t('Cooperative dashboard'),
                href: cooperativeDashboard(),
            },
            {
                title: t('Prices'),
                href: index(),
            },
        ],
    });

    return (
        <>
            <Head title={t('Cooperative prices')} />
            <div className="flex flex-1 flex-col gap-6 overflow-x-hidden p-4 md:p-6">
                <PageSection>
                    <PageHeader
                        title={t('Crop prices')}
                        description={t(
                            'Compare :name member prices with the :region regional benchmark.',
                            {
                                name: summary.cooperative.name,
                                region: summary.cooperative.region,
                            },
                        )}
                        actions={
                            <Button variant="outline" asChild>
                                <a
                                    href={download.url()}
                                    aria-label={t(
                                        'Download weekly crop price summary as PDF',
                                    )}
                                >
                                    <Download aria-hidden="true" />
                                    {t('Download PDF')}
                                </a>
                            </Button>
                        }
                    />
                </PageSection>

                <PageSection delay={1}>
                    <PriceSummaryCards summary={summary} />
                </PageSection>

                <PageSection delay={2}>
                    <Card className="gap-3 border-primary/20 bg-primary/5 shadow-sm">
                        <CardHeader className="flex-row items-start gap-3">
                            <div className="rounded-xl border border-primary/20 bg-background p-2 text-primary">
                                <Info className="size-4" aria-hidden="true" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <CardTitle className="text-sm">
                                    {t('How the benchmark is calculated')}
                                </CardTitle>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    {t(summary.definition)}{' '}
                                    {t(
                                        "The cooperative price uses only this cooperative's verified, unflagged member reports. Weekly trend compares the current period with the previous seven days; movement below 1% is labeled stable.",
                                    )}
                                </p>
                            </div>
                        </CardHeader>
                        <CardContent className="text-xs text-muted-foreground">
                            {summary.regionalMarketsCount}{' '}
                            {summary.regionalMarketsCount === 1
                                ? t('market is')
                                : t('markets are')}{' '}
                            {t(
                                "eligible by exact region match. Each row reports how many contributed to that crop's benchmark.",
                            )}
                        </CardContent>
                    </Card>
                </PageSection>

                <PageSection delay={3} className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-lg font-semibold">
                            {t('Tracked crop prices by market')}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {t(
                                'All amounts are seven-day averages in Ethiopian birr (ETB).',
                            )}
                        </p>
                    </div>
                    <PriceTable rows={summary.rows} />
                </PageSection>
            </div>
        </>
    );
}
