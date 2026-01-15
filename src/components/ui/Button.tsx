import { cn } from './utils';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDrag' | 'onDragEnd' | 'onDragStart'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  glow?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary: `
    bg-dark-accent text-white
    hover:bg-dark-accent-light
    active:bg-dark-accent-dark
    shadow-lg shadow-dark-accent/20
  `,
  secondary: `
    bg-dark-surface text-dark-text
    border border-dark-border
    hover:bg-dark-surface-hover hover:border-dark-border-hover
  `,
  ghost: `
    bg-transparent text-dark-muted
    hover:bg-dark-surface hover:text-dark-text
  `,
  outline: `
    bg-transparent text-dark-accent
    border border-dark-accent/50
    hover:bg-dark-accent/10 hover:border-dark-accent
  `,
  danger: `
    bg-dark-error text-white
    hover:bg-red-500
    shadow-lg shadow-dark-error/20
  `,
};

const sizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      icon,
      iconPosition = 'left',
      loading = false,
      glow = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        className={cn(
          // Base styles
          'relative inline-flex items-center justify-center',
          'font-medium rounded-xl',
          'transition-all duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-dark-accent focus-visible:ring-offset-2 focus-visible:ring-offset-dark-bg',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          // Variant styles
          variants[variant],
          // Size styles
          sizes[size],
          // Glow effect
          glow && variant === 'primary' && 'shadow-glow hover:shadow-glow-lg',
          className
        )}
        disabled={disabled || loading}
        {...(props as HTMLMotionProps<'button'>)}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && icon && iconPosition === 'left' && (
          <span className="shrink-0">{icon}</span>
        )}
        {children}
        {!loading && icon && iconPosition === 'right' && (
          <span className="shrink-0">{icon}</span>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
