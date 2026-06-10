import * as React from 'react';
import { cn } from '@/shared/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'flex h-10 w-full rounded-xl border border-muted bg-white px-3 py-2 text-sm text-brand-darker outline-none ring-offset-white placeholder:text-brand-light focus-visible:ring-2 focus-visible:ring-brand-light',
      className,
    )}
    {...props}
  />
));

Input.displayName = 'Input';

export { Input };
