import { Badge } from '@/shared/components/ui/badge';

const statusMap: Record<string, 'warning' | 'success' | 'danger' | 'info' | 'muted' | 'default'> = {
  Pending: 'warning',
  Active: 'success',
  Confirmed: 'success',
  Cancelled: 'danger',
  InProgress: 'info',
  Expired: 'muted',
  Completed: 'success',
  Paid: 'success',
  Failed: 'danger',
  Refunded: 'muted',
  NotSubscribed: 'muted',
  Subscribed: 'success',
};

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const variant = statusMap[status] ?? 'default';
  return <Badge variant={variant}>{status}</Badge>;
};

StatusBadge.displayName = 'StatusBadge';
