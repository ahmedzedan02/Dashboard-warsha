import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
}

interface PageHeaderProps {
  title: string;
  breadcrumb: BreadcrumbItem[];
  actions?: ReactNode;
}

export const PageHeader = ({ title, breadcrumb, actions }: PageHeaderProps) => (
  <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
    <div>
      <div className="mb-2 flex items-center gap-2 text-xs text-brand-light">
        {breadcrumb.map((item, index) => (
          <span className="flex items-center gap-2" key={item.label}>
            <span>{item.label}</span>
            {index < breadcrumb.length - 1 ? <ChevronRight className="h-3.5 w-3.5" /> : null}
          </span>
        ))}
      </div>
      <h1 className="text-2xl">{title}</h1>
    </div>
    {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
  </div>
);

PageHeader.displayName = 'PageHeader';
