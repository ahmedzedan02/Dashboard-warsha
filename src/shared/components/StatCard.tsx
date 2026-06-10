import type { ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  color?: string;
}

export const StatCard = ({ label, value, icon, trend, color }: StatCardProps) => (
  <div className="card-surface flex flex-col gap-4 p-5">
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-sm text-brand-light">{label}</p>
        <p className="text-2xl font-semibold" style={color ? { color } : undefined}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
      </div>
      <div className={cn('rounded-2xl bg-brand-lighter p-3 text-brand')}>{icon}</div>
    </div>
    {trend ? <p className="text-xs text-brand-light">{trend}</p> : null}
  </div>
);

StatCard.displayName = 'StatCard';
