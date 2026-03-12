import { forwardRef } from 'react';
import type { ButtonProps } from './Button.types';

const sizeClasses: Record<string, string> = {
  sm: 'btn-sm',
  md: 'btn-md',
  lg: 'btn-lg',
};

const variantClasses: Record<string, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      asChild = false,
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const isDisabled = disabled || loading;

    const classes = [
      'btn',
      variantClasses[variant],
      sizeClasses[size],
      loading ? 'btn-loading' : '',
      className ?? '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        className={classes}
        disabled={isDisabled}
        aria-disabled={isDisabled || undefined}
        aria-busy={loading || undefined}
        data-variant={variant}
        data-size={size}
        {...rest}
      >
        {loading && <span className="btn-spinner" aria-hidden="true" />}
        {leftIcon && <span className="btn-icon btn-icon-left">{leftIcon}</span>}
        <span className="btn-label">{children}</span>
        {rightIcon && <span className="btn-icon btn-icon-right">{rightIcon}</span>}
      </button>
    );
  },
);
