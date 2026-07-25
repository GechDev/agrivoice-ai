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
import InputError from '@/components/input-error';
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
import { Spinner } from '@/components/ui/spinner';
import { dashboard as cooperativeDashboard } from '@/routes/cooperative';
import type {
    BillingPlan,
    BillingSubscription,
    PaginatedBillingInvoices,
} from '@/types/cooperative-billing';

const currencyFormatter = new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    maximumFractionDigits: 0,
});

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
    const [selectedPlan, setSelectedPlan] = useState<BillingPlan | null>(null);
    const [paymentOpen, setPaymentOpen] = useState(false);
    const planForm = useForm({ plan_tier: '' });
    const paymentForm = useForm({
        type: subscription?.paymentMethod.type ?? 'Telebirr',
        last_four: subscription?.paymentMethod.lastFour ?? '',
    });

    setLayoutProps({
        breadcrumbs: [
            { title: 'Cooperative dashboard', href: cooperativeDashboard() },
            { title: 'Billing', href: index() },
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
            <Head title="Cooperative billing" />
            <div className="flex flex-1 flex-col gap-6 overflow-x-hidden p-4 md:p-6">
                <header className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                        Billing
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage your cooperative&apos;s plan, invoices, and
                        payment method.
                    </p>
                </header>

                {subscription ? (
                    <>
                        <section
                            aria-label="Current subscription"
                            className="grid gap-4 lg:grid-cols-3"
                        >
                            <Card className="lg:col-span-2">
                                <CardHeader className="flex-row items-start justify-between gap-4">
                                    <div className="flex flex-col gap-1">
                                        <CardDescription>
                                            Current plan
                                        </CardDescription>
                                        <CardTitle className="text-2xl">
                                            {subscription.planName}
                                        </CardTitle>
                                    </div>
                                    <Badge variant="secondary">
                                        {subscription.statusLabel}
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
                                                Monthly price
                                            </p>
                                            <p className="font-semibold">
                                                {currencyFormatter.format(
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
                                                Renews
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
                                            {subscription.pendingPlanName} is
                                            scheduled for the next billing
                                            cycle.
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardDescription>
                                        Member usage
                                    </CardDescription>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users
                                            className="size-5 text-primary"
                                            aria-hidden="true"
                                        />
                                        {subscription.memberCount} of{' '}
                                        {subscription.memberLimit}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-2">
                                    <div
                                        role="progressbar"
                                        aria-label="Members used"
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
                                        {subscription.memberLimit -
                                            subscription.memberCount}{' '}
                                        member slots remaining
                                    </p>
                                </CardContent>
                            </Card>
                        </section>

                        <Card>
                            <CardHeader className="flex-row items-start justify-between gap-4">
                                <div className="flex flex-col gap-1">
                                    <CardTitle>Payment method</CardTitle>
                                    <CardDescription>
                                        Mock billing data only; no real payment
                                        details are collected.
                                    </CardDescription>
                                </div>
                                <CreditCard
                                    className="size-5 text-primary"
                                    aria-hidden="true"
                                />
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <p className="font-medium">
                                    {subscription.paymentMethod.type ??
                                        'Not configured'}
                                    {subscription.paymentMethod.lastFour
                                        ? ` •••• ${subscription.paymentMethod.lastFour}`
                                        : ''}
                                </p>
                                <Button
                                    variant="outline"
                                    onClick={() => setPaymentOpen(true)}
                                >
                                    Update payment method
                                </Button>
                            </CardContent>
                        </Card>

                        <section className="flex flex-col gap-3">
                            <div>
                                <h2 className="text-lg font-semibold">
                                    Compare plans
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Plan changes take effect next billing cycle;
                                    no proration is applied.
                                </p>
                            </div>
                            <div className="grid gap-4 md:grid-cols-3">
                                {plans.map((plan) => {
                                    const current =
                                        plan.tier === subscription.planTier;
                                    const pending =
                                        plan.tier ===
                                        subscription.pendingPlanTier;

                                    return (
                                        <Card
                                            key={plan.tier}
                                            className={
                                                current
                                                    ? 'border-primary/40 bg-primary/5'
                                                    : ''
                                            }
                                        >
                                            <CardHeader>
                                                <div className="flex items-center justify-between gap-2">
                                                    <CardTitle>
                                                        {plan.name}
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
                                                                ? 'Current'
                                                                : 'Scheduled'}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <CardDescription>
                                                    {currencyFormatter.format(
                                                        plan.pricePerMonth,
                                                    )}
                                                    /month
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="flex flex-1 flex-col justify-between gap-5">
                                                <p className="flex items-center gap-2 text-sm">
                                                    <Check
                                                        className="size-4 text-primary"
                                                        aria-hidden="true"
                                                    />
                                                    Up to {plan.memberLimit}{' '}
                                                    members
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
                                                        ? 'Current plan'
                                                        : pending
                                                          ? 'Scheduled'
                                                          : 'Choose plan'}
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </section>
                    </>
                ) : (
                    <Card>
                        <CardContent className="py-10 text-center">
                            <p className="font-semibold">
                                No subscription configured
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Contact AgriVoice support to activate billing.
                            </p>
                        </CardContent>
                    </Card>
                )}

                <section className="flex flex-col gap-3">
                    <div>
                        <h2 className="text-lg font-semibold">
                            Invoice history
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {invoices.total} billing{' '}
                            {invoices.total === 1 ? 'record' : 'records'}
                        </p>
                    </div>
                    <Card className="overflow-hidden py-0">
                        {invoices.data.length === 0 ? (
                            <CardContent className="py-10 text-center text-sm text-muted-foreground">
                                No invoices have been issued yet.
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
                                                Date
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-5 py-4"
                                            >
                                                Amount
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-5 py-4"
                                            >
                                                Status
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-5 py-4 text-right"
                                            >
                                                PDF
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
                                                    {currencyFormatter.format(
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
                                                        {invoice.statusLabel}
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
                                                                aria-label={`Download invoice from ${invoice.issuedAt}`}
                                                            >
                                                                <Download aria-hidden="true" />
                                                                Download
                                                            </a>
                                                        </Button>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">
                                                            Unavailable
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
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-sm text-muted-foreground">
                                Page {invoices.current_page} of{' '}
                                {invoices.last_page}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    disabled={!invoices.prev_page_url}
                                    onClick={() =>
                                        router.get(
                                            index.url({
                                                query: {
                                                    page:
                                                        invoices.current_page -
                                                        1,
                                                },
                                            }),
                                            {},
                                            { preserveScroll: true },
                                        )
                                    }
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    disabled={!invoices.next_page_url}
                                    onClick={() =>
                                        router.get(
                                            index.url({
                                                query: {
                                                    page:
                                                        invoices.current_page +
                                                        1,
                                                },
                                            }),
                                            {},
                                            { preserveScroll: true },
                                        )
                                    }
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </section>
            </div>

            <AlertDialog
                open={selectedPlan !== null}
                onOpenChange={(open) => !open && setSelectedPlan(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Switch to {selectedPlan?.name}?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            The change will take effect on{' '}
                            {subscription
                                ? dateFormatter.format(
                                      new Date(subscription.renewalDate),
                                  )
                                : 'the next billing date'}
                            . There is no proration.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <InputError message={planForm.errors.plan_tier} />
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={planForm.processing}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(event) => {
                                event.preventDefault();
                                confirmPlanChange();
                            }}
                            disabled={planForm.processing}
                        >
                            {planForm.processing ? 'Scheduling…' : 'Confirm'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update mock payment method</DialogTitle>
                        <DialogDescription>
                            This stores display-only test data. Do not enter
                            real payment credentials.
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        onSubmit={submitPaymentMethod}
                        className="flex flex-col gap-4"
                    >
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="payment-type">Method type</Label>
                            <select
                                id="payment-type"
                                value={paymentForm.data.type}
                                onChange={(event) =>
                                    paymentForm.setData(
                                        'type',
                                        event.target.value,
                                    )
                                }
                                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                                disabled={paymentForm.processing}
                            >
                                <option>Telebirr</option>
                                <option>Bank transfer</option>
                                <option>Chapa test</option>
                            </select>
                            <InputError message={paymentForm.errors.type} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="payment-last-four">
                                Last four display digits
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
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={paymentForm.processing}
                            >
                                {paymentForm.processing && <Spinner />}
                                Save mock method
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
