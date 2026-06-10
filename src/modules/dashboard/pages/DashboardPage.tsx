import { Area, AreaChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Banknote, CheckCircle2, Clock3, FileWarning, HandCoins, Layers3, Wallet } from 'lucide-react';
import { PageHeader } from '@/shared/components/PageHeader';
import { StatCard } from '@/shared/components/StatCard';
import { ErrorState } from '@/shared/components/ErrorState';
import { useDashboardQuery } from '@/modules/dashboard/hooks/useDashboardQuery';
import { formatCurrency } from '@/shared/utils/format';

const funnelColors = ['#7B1F3A', '#A64060', '#2563EB', '#16A34A', '#DC2626'];

export const DashboardPage = () => {
  const dashboardQuery = useDashboardQuery();

  if (dashboardQuery.isError) {
    return <ErrorState message={dashboardQuery.error.message} />;
  }

  const stats = dashboardQuery.data?.data;

  const statCards = [
    { label: 'Pending Contracts', value: stats?.pendingContracts ?? 0, icon: <Clock3 className="h-5 w-5" /> },
    { label: 'Active Subscriptions', value: stats?.activeSubscriptions ?? 0, icon: <CheckCircle2 className="h-5 w-5" /> },
    { label: 'Expired Subscriptions', value: stats?.expiredSubscriptions ?? 0, icon: <FileWarning className="h-5 w-5" /> },
    { label: 'Pending Payments', value: stats?.pendingPayments ?? 0, icon: <HandCoins className="h-5 w-5" /> },
    { label: 'Today Revenue', value: formatCurrency(stats?.todayRevenue ?? 0), icon: <Wallet className="h-5 w-5" /> },
    { label: 'Month Revenue', value: formatCurrency(stats?.monthRevenue ?? 0), icon: <Banknote className="h-5 w-5" /> },
    { label: 'Total Revenue', value: formatCurrency(stats?.totalRevenue ?? 0), icon: <Layers3 className="h-5 w-5" /> },
  ];

  const orderFunnel = [
    { name: 'Total', value: stats?.totalOrders ?? 0 },
    { name: 'Pending', value: stats?.pendingOrders ?? 0 },
    { name: 'InProgress', value: stats?.inProgressOrders ?? 0 },
    { name: 'Completed', value: stats?.completedOrders ?? 0 },
    { name: 'Cancelled', value: stats?.cancelledOrders ?? 0 },
  ];

  const requestSummary = [
    { name: 'All Requests', value: stats?.totalRequests ?? 0 },
    { name: 'Pending Requests', value: stats?.pendingRequests ?? 0 },
  ];

  return (
    <div>
      <PageHeader breadcrumb={[{ label: 'Home' }, { label: 'Dashboard' }]} title="Dashboard Overview" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="card-surface p-5">
          <h2 className="mb-4 text-lg">Order Funnel</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={orderFunnel} dataKey="value" nameKey="name" innerRadius={80} outerRadius={110}>
                  {orderFunnel.map((item, index) => (
                    <Cell fill={funnelColors[index]} key={item.name} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card-surface p-5">
          <h2 className="mb-4 text-lg">Request Summary</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={requestSummary}>
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#7B1F3A" fill="#F9EFF2" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

DashboardPage.displayName = 'DashboardPage';
