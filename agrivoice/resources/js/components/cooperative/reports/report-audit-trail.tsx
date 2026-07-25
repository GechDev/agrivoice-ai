import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { useTranslations } from '@/hooks/use-translations';
import type { ReportAuditEntry } from '@/types/cooperative-reports';

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
});

function formatDateTime(value: string): string {
    if (!value) {
        return '—';
    }

    return dateTimeFormatter.format(new Date(value));
}

type ReportAuditTrailProps = {
    reportId: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entries: ReportAuditEntry[];
};

export function ReportAuditTrail({
    reportId,
    open,
    onOpenChange,
    entries,
}: ReportAuditTrailProps) {
    const t = useTranslations();

    return (
        <Collapsible open={open} onOpenChange={onOpenChange}>
            <CollapsibleContent id={`report-audit-trail-${reportId}`}>
                <div className="border-t bg-muted/20 px-4 py-3">
                    <h3 className="mb-2 text-sm font-medium text-foreground">
                        {t('Audit trail')}
                    </h3>
                    {entries.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            {t('No status changes recorded yet.')}
                        </p>
                    ) : (
                        <ol className="flex flex-col gap-3">
                            {entries.map((entry) => (
                                <li
                                    key={entry.id}
                                    className="rounded-lg border bg-card px-3 py-2 text-sm shadow-sm"
                                >
                                    <p className="font-medium text-foreground">
                                        {t(entry.oldStatusLabel)} →{' '}
                                        {t(entry.newStatusLabel)}
                                    </p>
                                    <p className="mt-1 text-muted-foreground">
                                        {entry.changedBy?.name ?? t('System')} ·{' '}
                                        {formatDateTime(entry.changedAt)}
                                    </p>
                                    {entry.reason ? (
                                        <p className="mt-1 text-foreground">
                                            {t('Reason: :reason', {
                                                reason: entry.reason,
                                            })}
                                        </p>
                                    ) : null}
                                </li>
                            ))}
                        </ol>
                    )}
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}
