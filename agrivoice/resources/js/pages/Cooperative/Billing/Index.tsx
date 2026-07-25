import { Head, router, setLayoutProps, useForm } from '@inertiajs/react';
import {
    CalendarDays,
    Check,
    CreditCard,
    Download,
    ReceiptText,
    Users,
} from 'lucide-react';
import { type FormEvent, useState } from 'react';
import {
    downloadInvoice,
    index,
    updatePaymentMethod,
    updatePlan,
} from '@/actions/App/Http/Controllers/CooperativeBillingController';
import { PageSection, StaggerItem } from '@/components/motion/page-section';
import InputError from '@/components/input-error';
import { PageHeader } from '@/components/page-header';
import { TablePagination } from '@/components/table-pagination';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { useTranslations } from '@/hooks/use-translations';
import { formatCurrency } from '@/lib/agrivoice';
import { dashboard as cooperativeDashboard } from '@/routes/cooperative';
import type {
    BillingPlan,
    BillingSubscription,
    PaginatedBillingInvoices,
} from '@/types/cooperative-billing';

const dateFormatter = new Intl.DateTimeFormat('en-ET', {
    dateStyle: 'medium',
});

type BillingIndexProps = {
    subscription: BillingSubscription | null;
    invoices: PaginatedBillingInvoices;
    plans: BillingPlan[];
};

export default function BillingIndex({
    subscription,
    invoices,
    plans,
}: BillingIndexProps) {
    const t = useTranslations();
    const [selectedPlan, setSelectedPlan] = useState<BillingPlan | null>(null);
    const [paymentOpen, setPaymentOpen] = useState(false);
    const planForm = useForm({ plan_tier: '' });
    const paymentForm = useForm({
        type: subscription?.paymentMethod.type ?? 'Telebirr',
        last_four: subscription?.paymentMethod.lastFour ?? '',
    });

    setLayoutProps({
        breadcrumbs: [
            {
                title: t('Cooperative dashboard'),
                href: cooperativeDashboard(),
            },
            { title: t('Billing'), href: index() },
        ],
    });

    const usagePercentage = subscription
        ? Math.min(
              100,
              Math.round(
                  (subscription.memberCount / subscription.memberLimit) * 100,
              ),
          )
        : 0;

    const confirmPlanChange = (): void => {
        if (!subscription || !selectedPlan) {
            return;
        }

        planForm.transform(() => ({ plan_tier: selectedPlan.tier }));
        planForm.patch(updatePlan.url(subscription.id), {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedPlan(null);
                planForm.transform((data) => data);
            },
        });
    };

    const submitPaymentMethod = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        if (!subscription) {
            return;
        }

        // TODO: replace this mock form with provider tokenization when a payment provider is selected.
        paymentForm.patch(updatePaymentMethod.url(subscription.id), {
            preserveScroll: true,
            onSuccess: () => setPaymentOpen(false),
        });
    };

    return (
        <>
            <Head title={t('Cooperative billing')} />
            <div className="flex flex-1 flex-col gap-6 overflow-x-hidden p-4 md:p-6">
                <PageSection>
                    <PageHeader
                        title={t('Billing')}
                        description={t(
                            "Manage your cooperative's plan, invoices, and payment method.",
                        )}
                    />
                </PageSection>

                {subscription ? (
                    <>
                        <PageSection
                            delay={1}
                            aria-label={t('Current subscription')}
                            className="grid gap-4 lg:grid-cols-3"
                        >
                            <Card className="lg:col-span-2">
                                <CardHeader className="flex-row items-start justify-between gap-4">
                                    <div className="flex flex-col gap-1">
                                        <CardDescription>
                                            {t('Current plan')}
                                        </CardDescription>
                                        <CardTitle className="text-2xl">
                                            {t(subscription.planName)}
                                        </CardTitle>
                                    </div>
                                    <Badge variant="secondary">
                                        {t(subscription.statusLabel)}
                                    </Badge>
                                </CardHeader>
                                <CardContent className="grid gap-5 sm:grid-cols-2">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-xl border bg-muted p-2 text-primary">
                                            <ReceiptText
                                                className="size-4"
                                                aria-hidden="true"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                {t('Monthly price')}
                                            </p>
                                            <p className="font-semibold">
                                                {formatCurrency(
                                                    subscription.pricePerMonth,
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-xl border bg-muted p-2 text-primary">
                                            <CalendarDays
                                                className="size-4"
                                                aria-hidden="true"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                {t('Renews')}
                                            </p>
                                            <p className="font-semibold">
                                                {dateFormatter.format(
                                                    new Date(
                                                        subscription.renewalDate,
                                                    ),
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    {subscription.pendingPlanName && (
                                        <p className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm sm:col-span-2">
                                            {t(
                                                ':name is scheduled for the next billing cycle.',
                                                {
                                                    name: subscription.pendingPlanName,
                                                },
                                            )}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardDescription>
                                        {t('Member usage')}
                                    </CardDescription>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users
                                            className="size-5 text-primary"
                                            aria-hidden="true"
                                        />
                                        {t(':count of :limit', {
                                            count: String(
                                                subscription.memberCount,
                                            ),
                                            limit: String(
                                                subscription.memberLimit,
                                            ),
                                        })}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-2">
                                    <div
                                        role="progressbar"
                                        aria-label={t('Members used')}
                                        aria-valuenow={subscription.memberCount}
                                        aria-valuemin={0}
                                        aria-valuemax={subscription.memberLimit}
                                        className="h-3 overflow-hidden rounded-full bg-muted shadow-inner"
                                    >
                                        <div
                                            className="h-full rounded-full bg-primary transition-[width]"
                                            style={{
                                                width: `${usagePercentage}%`,
                                            }}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {t(':count member slots remaining', {
                                            count: String(
                                                subscription.memberLimit -
                                                    subscription.memberCount,
                                            ),
                                        })}
                                    </p>
                                </CardContent>
                            </Card>
                        </PageSection>

                        <PageSection delay={2}>
                            <Card>
                            <CardHeader className="flex-row items-start justify-between gap-4">
                                <div className="flex flex-col gap-1">
                                    <CardTitle>{t('Payment method')}</CardTitle>
                                    <CardDescription>
                                        {t(
                                            'Mock billing data only; no real payment details are collected.',
                                        )}
                                    </CardDescription>
                                </div>
                                <CreditCard
                                    className="size-5 text-primary"
                                    aria-hidden="true"
                                />
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <p className="font-medium">
                                    {subscription.paymentMethod.type
                                        ? t(subscription.paymentMethod.type)
                                        : t('Not configured')}
                                    {subscription.paymentMethod.lastFour
                                        ? ` •••• ${subscription.paymentMethod.lastFour}`
                                        : ''}
                                </p>
                                <Button
                                    variant="outline"
                                    onClick={() => setPaymentOpen(true)}
                                >
                                    {t('Update payment method')}
                                </Button>
                            </CardContent>
                            </Card>
                        </PageSection>

                        <PageSection delay={3} className="flex flex-col gap-3">
                            <div>
                                <h2 className="text-lg font-semibold">
                                    {t('Compare plans')}
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    {t(
                                        'Plan changes take effect next billing cycle; no proration is applied.',
                                    )}
                                </p>
                            </div>
                            <div className="grid gap-4 md:grid-cols-3">
                                {plans.map((plan, index) => {
                                    const current =
                                        plan.tier === subscription.planTier;
                                    const pending =
                                        plan.tier ===
                                        subscription.pendingPlanTier;

                                    return (
                                        <StaggerItem
                                            key={plan.tier}
                                            index={index}
                                            baseDelay={40}
                                        >
                                        <Card
                                            className={`av-hover-lift ${
                                                current
                                                    ? 'border-primary/40 bg-primary/5'
                                                    : ''
                                            }`}
                                        >
                                            <CardHeader>
                                                <div className="flex items-center justify-between gap-2">
                                                    <CardTitle>
                                                        {t(plan.name)}
                                                    </CardTitle>
                                                    {(current || pending) && (
                                                        <Badge
                                                            variant={
                                                                current
                                                                    ? 'default'
                                                                    : 'secondary'
                                                            }
                                                        >
                                                            {current
                                                                ? t('Current')
                                                                : t(
                                                                      'Scheduled',
                                                                  )}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <CardDescription>
                                                    {formatCurrency(
                                                        plan.pricePerMonth,
                                                    )}
                                                    {t('/month')}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="flex flex-1 flex-col justify-between gap-5">
                                                <p className="flex items-center gap-2 text-sm">
                                                    <Check
                                                        className="size-4 text-primary"
                                                        aria-hidden="true"
                                                    />
                                                    {t('Up to :count members', {
                                                        count: String(
                                                            plan.memberLimit,
                                                        ),
                                                    })}
                                                </p>
                                                <Button
                                                    variant={
                                                        current
                                                            ? 'outline'
                                                            : 'default'
                                                    }
                                                    disabled={
                                                        current ||
                                                        pending ||
                                                        planForm.processing
                                                    }
                                                    onClick={() =>
                                                        setSelectedPlan(plan)
                                                    }
                                                >
                                                    {current
                                                        ? t('Current plan')
                                                        : pending
                                                          ? t('Scheduled')
                                                          : t('Choose plan')}
                                                </Button>
                                            </CardContent>
                                        </Card>
                                        </StaggerItem>
                                    );
                                })}
                            </div>
                        </PageSection>
                    </>
                ) : (
                    <PageSection delay={1}>
                        <Card>
                            <CardContent className="py-10 text-center">
                                <p className="font-semibold">
                                    {t('No subscription configured')}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {t(
                                        'Contact AgriVoice support to activate billing.',
                                    )}
                                </p>
                            </CardContent>
                        </Card>
                    </PageSection>
                )}

                <PageSection delay={4} className="flex flex-col gap-3">
                    <div>
                        <h2 className="text-lg font-semibold">
                            {t('Invoice history')}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {invoices.total}{' '}
                            {t('billing')}{' '}
                            {invoices.total === 1
                                ? t('record')
                                : t('records')}
                        </p>
                    </div>
                    <Card className="overflow-hidden py-0">
                        {invoices.data.length === 0 ? (
                            <CardContent className="py-10 text-center text-sm text-muted-foreground">
                                {t('No invoices have been issued yet.')}
                            </CardContent>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b bg-muted/60 text-xs text-muted-foreground uppercase">
                                        <tr>
                                            <th
                                                scope="col"
                                                className="px-5 py-4"
                                            >
                                                {t('Date')}
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-5 py-4"
                                            >
                                                {t('Amount')}
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-5 py-4"
                                            >
                                                {t('Status')}
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-5 py-4 text-right"
                                            >
                                                {t('PDF')}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {invoices.data.map((invoice) => (
                                            <tr key={invoice.id}>
                                                <td className="px-5 py-4">
                                                    {dateFormatter.format(
                                                        new Date(
                                                            invoice.issuedAt,
                                                        ),
                                                    )}
                                                </td>
                                                <td className="px-5 py-4 font-medium">
                                                    {formatCurrency(
                                                        invoice.amount,
                                                    )}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <Badge
                                                        variant={
                                                            invoice.status ===
                                                            'overdue'
                                                                ? 'destructive'
                                                                : invoice.status ===
                                                                    'paid'
                                                                  ? 'secondary'
                                                                  : 'outline'
                                                        }
                                                    >
                                                        {t(invoice.statusLabel)}
                                                    </Badge>
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    {invoice.downloadAvailable ? (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <a
                                                                href={downloadInvoice.url(
                                                                    invoice.id,
                                                                )}
                                                                aria-label={t(
                                                                    'Download invoice from :date',
                                                                    {
                                                                        date: invoice.issuedAt,
                                                                    },
                                                                )}
                                                            >
                                                                <Download aria-hidden="true" />
                                                                {t('Download')}
                                                            </a>
                                                        </Button>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">
                                                            {t('Unavailable')}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card>
                    {invoices.last_page > 1 && (
                        <TablePagination
                            from={
                                invoices.total === 0
                                    ? null
                                    : (invoices.current_page - 1) *
                                          invoices.per_page +
                                      1
                            }
                            to={
                                invoices.total === 0
                                    ? null
                                    : Math.min(
                                          invoices.current_page *
                                              invoices.per_page,
                                          invoices.total,
                                      )
                            }
                            total={invoices.total}
                            currentPage={invoices.current_page}
                            lastPage={invoices.last_page}
                            hasPrevious={Boolean(invoices.prev_page_url)}
                            hasNext={Boolean(invoices.next_page_url)}
                            onPrevious={() =>
                                router.get(
                                    index.url({
                                        query: {
                                            page: invoices.current_page - 1,
                                        },
                                    }),
                                    {},
                                    { preserveScroll: true },
                                )
                            }
                            onNext={() =>
                                router.get(
                                    index.url({
                                        query: {
                                            page: invoices.current_page + 1,
                                        },
                                    }),
                                    {},
                                    { preserveScroll: true },
                                )
                            }
                        />
                    )}
                </PageSection>
            </div>

            <AlertDialog
                open={selectedPlan !== null}
                onOpenChange={(open) => !open && setSelectedPlan(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t('Switch to :name?', {
                                name: selectedPlan?.name ?? '',
                            })}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t(
                                'The change will take effect on :date. There is no proration.',
                                {
                                    date: subscription
                                        ? dateFormatter.format(
                                              new Date(
                                                  subscription.renewalDate,
                                              ),
                                          )
                                        : t('the next billing date'),
                                },
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <InputError message={planForm.errors.plan_tier} />
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={planForm.processing}>
                            {t('Cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(event) => {
                                event.preventDefault();
                                confirmPlanChange();
                            }}
                            disabled={planForm.processing}
                        >
                            {planForm.processing
                                ? t('Scheduling…')
                                : t('Confirm')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {t('Update mock payment method')}
                        </DialogTitle>
                        <DialogDescription>
                            {t(
                                'This stores display-only test data. Do not enter real payment credentials.',
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        onSubmit={submitPaymentMethod}
                        className="flex flex-col gap-4"
                    >
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="payment-type">
                                {t('Method type')}
                            </Label>
                            <Select
                                value={paymentForm.data.type}
                                onValueChange={(value) =>
                                    paymentForm.setData('type', value)
                                }
                                disabled={paymentForm.processing}
                            >
                                <SelectTrigger
                                    id="payment-type"
                                    className="w-full"
                                >
                                    <SelectValue
                                        placeholder={t('Method type')}
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Telebirr">
                                        {t('Telebirr')}
                                    </SelectItem>
                                    <SelectItem value="Bank transfer">
                                        {t('Bank transfer')}
                                    </SelectItem>
                                    <SelectItem value="Chapa test">
                                        {t('Chapa test')}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={paymentForm.errors.type} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="payment-last-four">
                                {t('Last four display digits')}
                            </Label>
                            <Input
                                id="payment-last-four"
                                inputMode="numeric"
                                maxLength={4}
                                pattern="[0-9]{4}"
                                value={paymentForm.data.last_four}
                                onChange={(event) =>
                                    paymentForm.setData(
                                        'last_four',
                                        event.target.value.replace(/\D/g, ''),
                                    )
                                }
                                disabled={paymentForm.processing}
                                aria-invalid={Boolean(
                                    paymentForm.errors.last_four,
                                )}
                            />
                            <InputError
                                message={paymentForm.errors.last_four}
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setPaymentOpen(false)}
                                disabled={paymentForm.processing}
                            >
                                {t('Cancel')}
                            </Button>
                            <Button
                                type="submit"
                                disabled={paymentForm.processing}
                            >
                                {paymentForm.processing && <Spinner />}
                                {t('Save mock method')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
