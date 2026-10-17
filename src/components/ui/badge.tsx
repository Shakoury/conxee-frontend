import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
export function Badge({
  variant = 'default',
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  variant?: 'default' | 'success' | 'warning' | 'error';
}) {
  return (
    <span
      className={cn(
        'inline-flex rounded-md bg-hover px-2 py-1 text-label font-medium',
        {
          default: 'text-foreground',
          success: 'text-[var(--success-text)]',
          warning: 'text-[var(--warning-text)]',
          error: 'text-[var(--danger-text)]',
        }[variant],
        className,
      )}
      {...props}
    />
  );
}
