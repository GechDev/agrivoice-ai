import { useForm, usePage } from '@inertiajs/react';
import Papa from 'papaparse';
import { type ChangeEvent, type FormEvent, useState } from 'react';
import { toast } from 'sonner';
import { bulkInvite } from '@/actions/App/Http/Controllers/CooperativeMemberController';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { tryNormalizeEthiopianPhone } from '@/lib/ethiopian-phone';
import type { BulkInviteSummary } from '@/types/cooperative-members';

type PreviewRow = {
    name: string;
    phone: string;
    normalized: string | null;
    valid: boolean;
};

type BulkInviteDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

function cell(row: Record<string, unknown>, keys: string[]): string {
    for (const key of keys) {
        const value = row[key];

        if (typeof value === 'string' && value.trim() !== '') {
            return value.trim();
        }

        if (typeof value === 'number') {
            return String(value);
        }
    }

    return '';
}

function parsePreview(file: File): Promise<PreviewRow[]> {
    return new Promise((resolve, reject) => {
        Papa.parse<Record<string, unknown>>(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const rows = results.data.map((row) => {
                    const name = cell(row, ['name', 'Name', 'NAME']);
                    const phone = cell(row, [
                        'phone_number',
                        'phone',
                        'Phone',
                        'PHONE',
                        'Phone Number',
                        'phone number',
                    ]);
                    const normalized = tryNormalizeEthiopianPhone(phone);

                    return {
                        name,
                        phone,
                        normalized,
                        // Name is optional; phone format is the only preview gate.
                        valid: normalized !== null,
                    };
                });

                resolve(rows);
            },
            error: (error) => reject(error),
        });
    });
}

export function BulkInviteDialog({
    open,
    onOpenChange,
}: BulkInviteDialogProps) {
    const page = usePage();
    const form = useForm<{ csv: File | null }>({
        csv: null,
    });
    const [preview, setPreview] = useState<PreviewRow[]>([]);
    const [parseError, setParseError] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);

    const summary = page.props.flash?.bulkInviteSummary as
        BulkInviteSummary | null | undefined;

    const validCount = preview.filter((row) => row.valid).length;
    const invalidCount = preview.length - validCount;
    const previewRows = preview.slice(0, 5);

    const resetLocal = (): void => {
        form.reset();
        form.clearErrors();
        setPreview([]);
        setParseError(null);
        setFileName(null);
    };

    const handleOpenChange = (nextOpen: boolean): void => {
        if (!nextOpen) {
            resetLocal();
        }

        onOpenChange(nextOpen);
    };

    const handleFileChange = async (
        event: ChangeEvent<HTMLInputElement>,
    ): Promise<void> => {
        const file = event.target.files?.[0] ?? null;

        form.clearErrors('csv');
        setParseError(null);
        form.setData('csv', file);
        setFileName(file?.name ?? null);

        if (!file) {
            setPreview([]);
            return;
        }

        try {
            const rows = await parsePreview(file);
            setPreview(rows);
        } catch {
            setPreview([]);
            setParseError(
                'Could not read this CSV. Check the file and try again.',
            );
        }
    };

    const submit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        if (!form.data.csv) {
            form.setError('csv', 'Upload a CSV file of members to invite.');
            return;
        }

        form.post(bulkInvite.url(), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                form.clearErrors();
                setPreview([]);
                setParseError(null);
                setFileName(null);
            },
            onError: (errors) => {
                if (!errors.csv) {
                    toast.error(
                        'Bulk invite failed. Please check the file and try again.',
                    );
                }
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Bulk invite from CSV</DialogTitle>
                    <DialogDescription>
                        Upload a CSV with{' '}
                        <span className="font-medium text-foreground">
                            name
                        </span>{' '}
                        and{' '}
                        <span className="font-medium text-foreground">
                            phone_number
                        </span>{' '}
                        (or phone) columns. Client preview is for guidance
                        only—the server validates every row.
                    </DialogDescription>
                </DialogHeader>

                {summary ? (
                    <div
                        className="rounded-xl border border-primary/20 bg-primary/5 p-4"
                        role="status"
                        aria-live="polite"
                    >
                        <p className="font-medium">Last upload summary</p>
                        <ul className="mt-2 flex flex-wrap gap-2 text-sm">
                            <li>
                                <Badge variant="outline">
                                    Invited: {summary.invited}
                                </Badge>
                            </li>
                            <li>
                                <Badge variant="outline">
                                    Skipped duplicates:{' '}
                                    {summary.skipped_duplicates}
                                </Badge>
                            </li>
                            <li>
                                <Badge variant="outline">
                                    Invalid format: {summary.invalid_format}
                                </Badge>
                            </li>
                        </ul>
                    </div>
                ) : null}

                <form onSubmit={submit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="bulk-csv">CSV file</Label>
                        <Input
                            id="bulk-csv"
                            type="file"
                            accept=".csv,text/csv,text/plain"
                            onChange={handleFileChange}
                            disabled={form.processing}
                            aria-invalid={Boolean(form.errors.csv)}
                        />
                        {fileName ? (
                            <p className="text-xs text-muted-foreground">
                                Selected: {fileName}
                            </p>
                        ) : null}
                        <InputError message={form.errors.csv} />
                        {parseError ? (
                            <p className="text-sm text-destructive">
                                {parseError}
                            </p>
                        ) : null}
                    </div>

                    {preview.length > 0 ? (
                        <div className="flex flex-col gap-3 rounded-xl border bg-muted/30 p-4">
                            <div className="flex flex-wrap gap-2 text-sm">
                                <Badge variant="outline">
                                    Preview rows: {preview.length}
                                </Badge>
                                <Badge
                                    variant="outline"
                                    className="border-emerald-600/30 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300"
                                >
                                    Likely valid: {validCount}
                                </Badge>
                                <Badge
                                    variant="outline"
                                    className="border-destructive/30 bg-destructive/10 text-destructive"
                                >
                                    Likely invalid: {invalidCount}
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Showing the first {previewRows.length} rows.
                                Counts are approximate client-side checks.
                            </p>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[28rem] text-left text-xs">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="py-2 pr-3 font-medium">
                                                Name
                                            </th>
                                            <th className="py-2 pr-3 font-medium">
                                                Phone
                                            </th>
                                            <th className="py-2 font-medium">
                                                Preview
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {previewRows.map((row, index) => (
                                            <tr
                                                key={`${row.phone}-${index}`}
                                                className="border-b last:border-0"
                                            >
                                                <td className="py-2 pr-3">
                                                    {row.name || '—'}
                                                </td>
                                                <td className="py-2 pr-3">
                                                    {row.phone || '—'}
                                                </td>
                                                <td className="py-2">
                                                    {row.valid ? (
                                                        <span className="text-emerald-700 dark:text-emerald-400">
                                                            Likely valid (
                                                            {row.normalized})
                                                        </span>
                                                    ) : (
                                                        <span className="text-destructive">
                                                            {row.name === ''
                                                                ? 'Missing name'
                                                                : row.normalized ===
                                                                    null
                                                                  ? 'Invalid phone'
                                                                  : 'Needs review'}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : null}

                    {form.progress ? (
                        <div
                            className="flex flex-col gap-2"
                            role="status"
                            aria-live="polite"
                        >
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Uploading…</span>
                                <span>{form.progress.percentage ?? 0}%</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full bg-primary transition-all"
                                    style={{
                                        width: `${form.progress.percentage ?? 0}%`,
                                    }}
                                />
                            </div>
                        </div>
                    ) : null}

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
                            disabled={form.processing || !form.data.csv}
                        >
                            {form.processing ? (
                                <>
                                    <Spinner />
                                    Uploading…
                                </>
                            ) : (
                                'Upload and invite'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
