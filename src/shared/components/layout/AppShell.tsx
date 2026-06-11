import { useMemo } from 'react';
import { Bell, FileText, Headset, LayoutDashboard, ListOrdered, LogOut, Menu, Package, ShieldAlert, Tags, UserPlus, Users, Wrench } from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { cn } from '@/shared/utils/cn';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { authStore } from '@/modules/auth/store/authStore';
import { useUiStore } from '@/modules/auth/store/uiStore';

const navigationItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, adminOnly: true, screenName: 'dashboard' },
  { to: '/subscriptions', label: 'Subscriptions', icon: Package, adminOnly: true, screenName: 'subscriptions' },
  { to: '/pending-contracts', label: 'Pending Contracts', icon: FileText, adminOnly: true, screenName: 'pending-contracts' },
  { to: '/payments', label: 'Payments', icon: ListOrdered, adminOnly: true, screenName: 'payments' },
  { to: '/orders', label: 'Orders', icon: ListOrdered, adminOnly: true, screenName: 'orders' },
  { to: '/support', label: 'Support Tickets', icon: Headset, adminOnly: true, screenName: 'support' },
  { to: '/support-agents', label: 'Create Support Agent', icon: UserPlus, adminOnly: true, screenName: 'support-agents' },
  { to: '/requests', label: 'Requests', icon: Wrench, adminOnly: true, screenName: 'requests' },
  { to: '/providers', label: 'Providers', icon: Users, adminOnly: true, screenName: 'providers' },
  { to: '/customers', label: 'Customers', icon: Users, adminOnly: true, screenName: 'customers' },
  { to: '/categories', label: 'Categories', icon: Tags, adminOnly: true, screenName: 'categories' },
  { to: '/services', label: 'Services', icon: Wrench, adminOnly: true, screenName: 'services' },
  { to: '/emergency', label: 'Emergency', icon: ShieldAlert, adminOnly: true, screenName: 'emergency' },
] as const;

const titleMap: Record<string, string> = {
  '/': 'Dashboard',
  '/subscriptions': 'Subscriptions',
  '/pending-contracts': 'Pending Contracts',
  '/payments': 'Payments',
  '/orders': 'Orders',
  '/support': 'Support Tickets',
  '/support-agents': 'Create Support Agent',
  '/requests': 'Requests',
  '/providers': 'Providers',
  '/customers': 'Customers',
  '/categories': 'Categories',
  '/services': 'Services',
  '/emergency': 'Emergency Package',
};

export const AppShell = () => {
  const location = useLocation();
  const isSidebarOpen = useUiStore((state) => state.isSidebarOpen);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const user = authStore((state) => state.user);
  const clearAuth = authStore((state) => state.clearAuth);

  const pageTitle = useMemo(() => titleMap[location.pathname] ?? 'Warsha', [location.pathname]);
  const accessibleNavigationItems = useMemo(() => {
    if (!user) {
      return [];
    }

    const hasScreenAccess = (screenName: string) =>
      user.usertype === 'support' ||
      user.usertype === 'admin' ||
      !user.mainadminScreens?.length ||
      user.mainadminScreens.some((screen) => screen.screenName.toLowerCase() === screenName.toLowerCase());

    return navigationItems.filter((item) => hasScreenAccess(item.screenName));
  }, [user]);

  return (
    <div className="flex min-h-screen bg-page">
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-60 bg-brand text-white transition-transform md:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-white/10 px-6 py-5 text-2xl font-semibold">Warsha</div>
          <nav className="flex-1 space-y-1 px-3 py-5">
            {accessibleNavigationItems.map((item) => (
              <NavLink
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-r-xl border-l-2 border-transparent px-4 py-3 text-sm transition-colors hover:bg-brand-dark',
                    isActive && 'border-white bg-brand-dark',
                  )
                }
                key={item.to}
                to={item.to}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="border-t border-white/10 p-4">
            <div className="mb-3">
              <p className="font-medium">{user?.name ?? 'Administrator'}</p>
              <p className="text-xs text-white/70">{user?.username ?? 'admin'}</p>
            </div>
            <Button
              className="w-full justify-start bg-white/10 text-white hover:bg-white/20"
              variant="ghost"
              onClick={clearAuth}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>
      <div className="flex min-h-screen flex-1 flex-col md:ml-60">
        <header className="sticky top-0 z-30 border-b border-muted bg-white">
          <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-6">
            <div className="flex items-center gap-3">
              <Button className="md:hidden" variant="ghost" size="icon" onClick={toggleSidebar}>
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <p className="text-lg font-medium">{pageTitle}</p>
                <p className="text-xs text-brand-light">Warsha Online Maintenance</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Input className="hidden w-72 md:flex" placeholder="Search anything..." />
              <Button variant="outline" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

AppShell.displayName = 'AppShell';
