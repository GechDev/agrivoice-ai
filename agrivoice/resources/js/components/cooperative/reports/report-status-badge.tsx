import { StatusBadge, type StatusTone } from '@/components/status-badge';
import { useTranslations } from '@/hooks/use-translations';

const statusTones: Record<string, StatusTone> = {
    pending: 'warning',
    verified: 'success',
    disputed: 'warning',
    rejected: 'danger',
};

type ReportStatusBadgeProps = {
    status: string;
    statusLabel: string;
    className?: string;
};

export function ReportStatusBadge({
    status,
    statusLabel,
    className,
}: ReportStatusBadgeProps) {
    const t = useTranslations();

    return (
        <StatusBadge
            tone={statusTones[status] ?? 'neutral'}
            className={className}
            aria-label={t('Status: :status', { status: t(statusLabel) })}
        >
            {t(statusLabel)}
        </StatusBadge>
    );
}
