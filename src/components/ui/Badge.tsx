import { cn } from './utils';
import { type HTMLAttributes } from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'accent';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  pulse?: boolean;
  dot?: boolean;
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-dark-surface text-dark-muted border-dark-border',
  success: 'bg-dark-success/10 text-dark-success border-dark-success/30',
  warning: 'bg-dark-warning/10 text-dark-warning border-dark-warning/30',
  error: 'bg-dark-error/10 text-dark-error border-dark-error/30',
  accent: 'bg-dark-accent/10 text-dark-accent border-dark-accent/30',
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-dark-muted',
  success: 'bg-dark-success',
  warning: 'bg-dark-warning',
  error: 'bg-dark-error',
  accent: 'bg-dark-accent',
};

export function Badge({
  className,
  variant = 'default',
  pulse = false,
  dot = false,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5',
        'px-2.5 py-1 text-xs font-medium',
        'rounded-full border',
        variants[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span className="relative flex h-2 w-2">
          {pulse && (
            <span
              className={cn(
                'absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping',
                dotColors[variant]
              )}
            />
          )}
          <span
            className={cn(
              'relative inline-flex rounded-full h-2 w-2',
              dotColors[variant]
            )}
          />
        </span>
      )}
      {children}
    </span>
  );
}
