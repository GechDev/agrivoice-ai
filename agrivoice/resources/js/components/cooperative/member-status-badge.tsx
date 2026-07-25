import { StatusBadge, type StatusTone } from '@/components/status-badge';
import { useTranslations } from '@/hooks/use-translations';

const statusTones: Record<string, StatusTone> = {
    active: 'success',
    invited: 'warning',
    removed: 'neutral',
};

const statusLabels: Record<string, string> = {
    active: 'Active',
    invited: 'Invited',
    removed: 'Removed',
};

type MemberStatusBadgeProps = {
    status: string;
    className?: string;
};

export function MemberStatusBadge({
    status,
    className,
}: MemberStatusBadgeProps) {
    const t = useTranslations();
    const label = statusLabels[status] ?? status;

    return (
        <StatusBadge
            tone={statusTones[status] ?? 'neutral'}
            className={className}
            aria-label={t('Status: :status', { status: t(label) })}
        >
            {t(label)}
        </StatusBadge>
    );
}
