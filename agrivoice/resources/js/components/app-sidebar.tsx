import { Link, usePage } from '@inertiajs/react';
import {
    ChartNoAxesCombined,
    ClipboardList,
    CreditCard,
    LayoutGrid,
    List,
    LogIn,
    Users,
} from 'lucide-react';
import { index as membersIndex } from '@/actions/App/Http/Controllers/CooperativeMemberController';
import { index as cooperativeBillingIndex } from '@/actions/App/Http/Controllers/CooperativeBillingController';
import { index as cooperativePricesIndex } from '@/actions/App/Http/Controllers/CooperativePriceController';
import { index as cooperativeReportsIndex } from '@/actions/App/Http/Controllers/CooperativeReportController';
import { index as reportsIndex } from '@/actions/App/Http/Controllers/ReportController';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useTranslations } from '@/hooks/use-translations';
import { dashboard, home, login } from '@/routes';
import {
    dashboard as cooperativeDashboard,
    login as cooperativeLogin,
} from '@/routes/cooperative';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const t = useTranslations();
    const page = usePage();
    const isCooperativeArea = page.url.startsWith('/cooperative');
    const isAuthenticated = Boolean(page.props.auth.user);
    const dashboardRoute = isCooperativeArea
        ? cooperativeDashboard()
        : dashboard();

    const mainNavItems: NavItem[] = isCooperativeArea
        ? [
              {
                  title: t('Dashboard'),
                  href: cooperativeDashboard(),
                  icon: LayoutGrid,
              },
              {
                  title: t('Members'),
                  href: membersIndex(),
                  icon: Users,
              },
              {
                  title: t('Reports'),
                  href: cooperativeReportsIndex(),
                  icon: ClipboardList,
              },
              {
                  title: t('Prices'),
                  href: cooperativePricesIndex(),
                  icon: ChartNoAxesCombined,
              },
              {
                  title: t('Billing'),
                  href: cooperativeBillingIndex(),
                  icon: CreditCard,
              },
          ]
        : [
              {
                  title: t('Dashboard'),
                  href: dashboard(),
                  icon: LayoutGrid,
              },
              {
                  title: t('Live list'),
                  href: reportsIndex(),
                  icon: List,
              },
          ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link
                                href={isAuthenticated ? dashboardRoute : home()}
                                prefetch
                            >
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                {isAuthenticated ? (
                    <NavUser />
                ) : (
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                                <Link href={login()}>
                                    <LogIn />
                                    <span>{t('Log in')}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                                <Link href={cooperativeLogin()}>
                                    <Users />
                                    <span>{t('Cooperative login')}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                )}
            </SidebarFooter>
        </Sidebar>
    );
}
