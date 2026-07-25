import { useForm } from '@inertiajs/react';
import { type FormEvent } from 'react';
import { toast } from 'sonner';
import { store } from '@/actions/App/Http/Controllers/CooperativeMemberController';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useTranslations } from '@/hooks/use-translations';
import type { PaginatedMembers } from '@/types/cooperative-members';

type InviteMemberDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function InviteMemberDialog({
    open,
    onOpenChange,
}: InviteMemberDialogProps) {
    const t = useTranslations();
    const form = useForm({
        name: '',
        phone_number: '',
    });

    const handleOpenChange = (nextOpen: boolean): void => {
        if (!nextOpen) {
            form.reset();
            form.clearErrors();
        }

        onOpenChange(nextOpen);
    };

    const submit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        form.optimistic<{ members: PaginatedMembers }>((props) => {
            const members = props.members;

            if (!members) {
                return;
            }

            const tempId = -Date.now();

            return {
                members: {
                    ...members,
                    total: members.total + 1,
                    to: members.to === null ? 1 : members.to + 1,
                    data: [
                        {
                            id: tempId,
                            name: form.data.name.trim() || 'Invited member',
                            phoneNumber: form.data.phone_number.trim(),
                            status: 'invited',
                            joinedAt: null,
                            lastActivityAt: null,
                            queriesCount: 0,
                            reportsCount: 0,
                        },
                        ...members.data,
                    ],
                },
            };
        }).post(store.url(), {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                form.clearErrors();
                onOpenChange(false);
            },
            onError: (errors) => {
                if (!errors.name && !errors.phone_number) {
                    toast.error(
                        t('Could not invite this member. Please try again.'),
                    );
                }
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('Invite member')}</DialogTitle>
                    <DialogDescription>
                        {t(
                            'Send an invite by name and Ethiopian mobile number.',
                        )}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="invite-name">{t('Name')}</Label>
                        <Input
                            id="invite-name"
                            value={form.data.name}
                            onChange={(event) =>
                                form.setData('name', event.target.value)
                            }
                            autoComplete="name"
                            aria-invalid={Boolean(form.errors.name)}
                            disabled={form.processing}
                        />
                        <InputError message={form.errors.name} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="invite-phone">{t('Phone number')}</Label>
                        <Input
                            id="invite-phone"
                            type="tel"
                            value={form.data.phone_number}
                            onChange={(event) =>
                                form.setData('phone_number', event.target.value)
                            }
                            placeholder="0911234567"
                            autoComplete="tel"
                            aria-invalid={Boolean(form.errors.phone_number)}
                            aria-describedby="invite-phone-help"
                            disabled={form.processing}
                        />
                        <p
                            id="invite-phone-help"
                            className="text-xs text-muted-foreground"
                        >
                            {t(
                                'Ethiopian mobiles: 09…, 07…, or +251… (spaces and hyphens are fine).',
                            )}
                        </p>
                        <InputError message={form.errors.phone_number} />
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            disabled={form.processing}
                        >
                            {t('Cancel')}
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing ? (
                                <>
                                    <Spinner />
                                    {t('Inviting…')}
                                </>
                            ) : (
                                t('Send invite')
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
