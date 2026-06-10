interface ErrorStateProps {
  title?: string;
  message: string;
}

export const ErrorState = ({ title = 'Something went wrong', message }: ErrorStateProps) => (
  <div className="card-surface flex min-h-64 flex-col items-center justify-center gap-2 p-8 text-center">
    <h3 className="text-lg">{title}</h3>
    <p className="max-w-md text-brand-light">{message}</p>
  </div>
);

ErrorState.displayName = 'ErrorState';
