import { Form, Head, setLayoutProps } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useTranslations } from '@/hooks/use-translations';
import { login as farmerLogin } from '@/routes';
import { register as cooperativeRegister } from '@/routes/cooperative';
import { store } from '@/routes/cooperative/login';

export default function CooperativeLogin() {
    const t = useTranslations();

    setLayoutProps({
        title: t('Cooperative sign-in'),
        description: t(
            'Sign in to manage members, reports, prices, and billing for your cooperative.',
        ),
    });

    return (
        <>
            <Head title={t('Cooperative sign-in')} />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
                                {t(
                                    'Dedicated portal for cooperative admins. Farmers should use the standard login.',
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">{t('Email address')}</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    autoComplete="email"
                                    placeholder="name@gmail.com"
                                />
                                <InputError message={errors.email ? t(errors.email) : undefined} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">{t('Password')}</Label>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    autoComplete="current-password"
                                    placeholder={t('Password')}
                                />
                                <InputError message={errors.password ? t(errors.password) : undefined} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox id="remember" name="remember" value="1" />
                                <Label htmlFor="remember">{t('Remember me')}</Label>
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={processing}
                                data-test="cooperative-login-button"
                            >
                                {processing ? <Spinner /> : null}
                                {t('Log in')}
                            </Button>
                        </div>

                        <div className="space-y-3 text-center text-sm text-muted-foreground">
                            <p>
                                {t("Don't have an account?")}{' '}
                                <TextLink href={cooperativeRegister()}>
                                    {t('Sign up')}
                                </TextLink>
                            </p>
                            <p>
                                {t('Farmer account?')}{' '}
                                <TextLink href={farmerLogin()}>
                                    {t('Use farmer login')}
                                </TextLink>
                            </p>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}
