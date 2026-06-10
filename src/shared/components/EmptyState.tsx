interface EmptyStateProps {
  title: string;
  description: string;
}

export const EmptyState = ({ title, description }: EmptyStateProps) => (
  <div className="card-surface flex min-h-64 flex-col items-center justify-center gap-2 p-8 text-center">
    <h3 className="text-lg">{title}</h3>
    <p className="max-w-md text-brand-light">{description}</p>
  </div>
);

EmptyState.displayName = 'EmptyState';
