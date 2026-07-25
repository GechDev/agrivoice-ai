import { useForm } from '@inertiajs/react';
import { type FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { updateStatus } from '@/actions/App/Http/Controllers/CooperativeReportController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import type {
    CooperativeReportRow,
    PaginatedCooperativeReports,
} from '@/types/cooperative-reports';

export type StatusActionTarget = 'disputed' | 'rejected';

const statusLabels: Record<StatusActionTarget, string> = {
    disputed: 'Disputed',
    rejected: 'Rejected',
};

type UpdateReportStatusDialogProps = {
    report: CooperativeReportRow | null;
    targetStatus: StatusActionTarget | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function UpdateReportStatusDialog({
    report,
    targetStatus,
    open,
    onOpenChange,
}: UpdateReportStatusDialogProps) {
    const form = useForm({
        status: 'disputed' as StatusActionTarget,
        reason: '',
    });
    const [clientReasonError, setClientReasonError] = useState<string | null>(
        null,
    );

    useEffect(() => {
        if (!open || !targetStatus) {
            return;
        }

        form.setData({
            status: targetStatus,
            reason: '',
        });
        form.clearErrors();
        setClientReasonError(null);
        // Reset form fields when a status dialog opens for a report.
        // eslint-disable-next-line react-hooks/exhaustive-deps -- sync on open only
    }, [open, targetStatus, report?.id]);

    const handleOpenChange = (nextOpen: boolean): void => {
        if (!nextOpen) {
            form.reset();
            form.clearErrors();
            form.transform((data) => data);
            setClientReasonError(null);
        }

        onOpenChange(nextOpen);
    };

    const submit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        if (!report || !targetStatus) {
            return;
        }

        const reason = form.data.reason.trim();

        if (reason === '') {
            setClientReasonError('A reason is required.');
            return;
        }

        setClientReasonError(null);

        const reportId = report.id;
        const nextLabel = statusLabels[targetStatus];

        form.transform(() => ({
            status: targetStatus,
            reason,
        }));

        form.optimistic<{ reports: PaginatedCooperativeReports }>((props) => {
            const reports = props.reports;

            if (!reports) {
                return;
            }

            return {
                reports: {
                    ...reports,
                    data: reports.data.map((row) =>
                        row.id === reportId
                            ? {
                                  ...row,
                                  status: targetStatus,
                                  statusLabel: nextLabel,
                              }
                            : row,
                    ),
                },
            };
        }).patch(updateStatus.url(reportId), {
            preserveScroll: true,
            onSuccess: () => {
                form.transform((data) => data);
                form.reset();
                form.clearErrors();
                setClientReasonError(null);
                onOpenChange(false);
            },
            onError: (errors) => {
                if (!errors.status && !errors.reason) {
                    toast.error(
                        'Could not update this report status. Please try again.',
                    );
                }
            },
        });
    };

    const title =
        targetStatus === 'rejected' ? 'Reject report' : 'Dispute report';
    const description =
        targetStatus === 'rejected'
            ? 'Explain why this price report should be rejected.'
            : 'Explain why this price report is being disputed.';
    const submitLabel =
        targetStatus === 'rejected' ? 'Reject report' : 'Dispute report';
    const reasonError = clientReasonError ?? form.errors.reason;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        {report
                            ? `${description} ${report.cropLabel} in ${report.marketLabel} · ${report.reporter.name || 'Unknown reporter'}.`
                            : description}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="report-status-reason">Reason</Label>
                        <textarea
                            id="report-status-reason"
                            value={form.data.reason}
                            onChange={(event) => {
                                setClientReasonError(null);
                                form.setData('reason', event.target.value);
                            }}
                            rows={4}
                            className="flex min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                            aria-invalid={Boolean(reasonError)}
                            aria-required="true"
                            disabled={form.processing}
                            autoFocus
                        />
                        <InputError message={reasonError} />
                        <InputError message={form.errors.status} />
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            disabled={form.processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant={
                                targetStatus === 'rejected'
                                    ? 'destructive'
                                    : 'default'
                            }
                            disabled={form.processing}
                            aria-label={submitLabel}
                        >
                            {form.processing ? (
                                <>
                                    <Spinner />
                                    Saving…
                                </>
                            ) : (
                                submitLabel
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
