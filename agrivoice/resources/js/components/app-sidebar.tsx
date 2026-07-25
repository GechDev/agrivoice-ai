import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    ChartNoAxesCombined,
    ClipboardList,
    CreditCard,
    FolderGit2,
    LayoutGrid,
    List,
    Users,
} from 'lucide-react';
import { index as membersIndex } from '@/actions/App/Http/Controllers/CooperativeMemberController';
import { index as cooperativeBillingIndex } from '@/actions/App/Http/Controllers/CooperativeBillingController';
import { index as cooperativePricesIndex } from '@/actions/App/Http/Controllers/CooperativePriceController';
import { index as cooperativeReportsIndex } from '@/actions/App/Http/Controllers/CooperativeReportController';
import { index as reportsIndex } from '@/actions/App/Http/Controllers/ReportController';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
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
import { dashboard } from '@/routes';
import { dashboard as cooperativeDashboard } from '@/routes/cooperative';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const t = useTranslations();
    const page = usePage();
    const isCooperativeArea = page.url.startsWith('/cooperative');
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

    const footerNavItems: NavItem[] = [
        {
            title: t('Repository'),
            href: 'https://github.com/laravel/react-starter-kit',
            icon: FolderGit2,
        },
        {
            title: t('Documentation'),
            href: 'https://laravel.com/docs/starter-kits#react',
            icon: BookOpen,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboardRoute} prefetch>
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
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
