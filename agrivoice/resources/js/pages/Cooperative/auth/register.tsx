import { Form, Head, setLayoutProps } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useTranslations } from '@/hooks/use-translations';
import { login as cooperativeLogin } from '@/routes/cooperative';
import { store } from '@/routes/cooperative/register';

type Props = {
    passwordRules: string;
};

export default function CooperativeRegister({ passwordRules }: Props) {
    const t = useTranslations();

    setLayoutProps({
        title: t('Create a cooperative account'),
        description: t(
            'Register your cooperative with a Gmail address to start managing members and market reports.',
        ),
    });

    return (
        <>
            <Head title={t('Cooperative sign up')} />

            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
                                {t(
                                    'Signup requires a Gmail address (@gmail.com).',
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="name">{t('Your name')}</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    name="name"
                                    required
                                    autoFocus
                                    autoComplete="name"
                                    placeholder={t('Full name')}
                                />
                                <InputError message={errors.name ? t(errors.name) : undefined} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">{t('Gmail address')}</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoComplete="email"
                                    placeholder="name@gmail.com"
                                />
                                <InputError message={errors.email ? t(errors.email) : undefined} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="cooperative_name">
                                    {t('Cooperative name')}
                                </Label>
                                <Input
                                    id="cooperative_name"
                                    type="text"
                                    name="cooperative_name"
                                    required
                                    placeholder={t('e.g. Oromia Coffee Growers')}
                                />
                                <InputError message={errors.cooperative_name ? t(errors.cooperative_name) : undefined} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="region">{t('Region')}</Label>
                                <Input
                                    id="region"
                                    type="text"
                                    name="region"
                                    required
                                    placeholder={t('e.g. Oromia')}
                                />
                                <InputError message={errors.region ? t(errors.region) : undefined} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">{t('Password')}</Label>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    autoComplete="new-password"
                                    placeholder={t('Password')}
                                    passwordrules={passwordRules}
                                />
                                <InputError message={errors.password ? t(errors.password) : undefined} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    {t('Confirm password')}
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    required
                                    autoComplete="new-password"
                                    placeholder={t('Confirm password')}
                                    passwordrules={passwordRules}
                                />
                                <InputError
                                    message={
                                        errors.password_confirmation
                                            ? t(errors.password_confirmation)
                                            : undefined
                                    }
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={processing}
                                data-test="cooperative-register-button"
                            >
                                {processing ? <Spinner /> : null}
                                {t('Create account')}
                            </Button>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            {t('Already have an account?')}{' '}
                            <TextLink href={cooperativeLogin()}>
                                {t('Log in')}
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}
