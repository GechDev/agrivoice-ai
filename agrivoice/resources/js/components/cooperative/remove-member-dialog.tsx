import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { remove } from '@/actions/App/Http/Controllers/CooperativeMemberController';
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
import { useTranslations } from '@/hooks/use-translations';
import type { MemberRow, PaginatedMembers } from '@/types/cooperative-members';

type RemoveMemberDialogProps = {
    member: MemberRow | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function RemoveMemberDialog({
    member,
    open,
    onOpenChange,
}: RemoveMemberDialogProps) {
    const t = useTranslations();

    const confirmRemove = (): void => {
        if (!member || member.status === 'removed') {
            return;
        }

        const memberId = member.id;

        router
            .optimistic<{ members: PaginatedMembers }>((props) => {
                const members = props.members;

                if (!members) {
                    return;
                }

                return {
                    members: {
                        ...members,
                        data: members.data.map((row) =>
                            row.id === memberId
                                ? { ...row, status: 'removed' }
                                : row,
                        ),
                    },
                };
            })
            .patch(
                remove.url(memberId),
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => onOpenChange(false),
                    onError: () => {
                        toast.error(
                            t(
                                'Could not remove this member. Please try again.',
                            ),
                        );
                    },
                },
            );
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('Remove member?')}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {member
                            ? t(
                                  'Remove :name (:phone) from this cooperative? They will no longer be able to participate as an active member.',
                                  {
                                      name: member.name,
                                      phone: member.phoneNumber,
                                  },
                              )
                            : t('Remove this member from the cooperative?')}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
                    <AlertDialogAction
                        className="bg-destructive text-white hover:bg-destructive/90"
                        onClick={(event) => {
                            event.preventDefault();
                            confirmRemove();
                        }}
                    >
                        {t('Remove member')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
