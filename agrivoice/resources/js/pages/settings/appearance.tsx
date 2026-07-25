import { Head, setLayoutProps } from '@inertiajs/react';
import AppearanceTabs from '@/components/appearance-tabs';
import Heading from '@/components/heading';
import { useTranslations } from '@/hooks/use-translations';
import { edit as editAppearance } from '@/routes/appearance';

export default function Appearance() {
    const t = useTranslations();

    setLayoutProps({
        breadcrumbs: [
            {
                title: t('Appearance settings'),
                href: editAppearance(),
            },
        ],
    });

    return (
        <>
            <Head title={t('Appearance settings')} />

            <h1 className="sr-only">{t('Appearance settings')}</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title={t('Appearance settings')}
                    description={t('Update the appearance settings for your account')}
                />
                <AppearanceTabs />
            </div>
        </>
    );
}
