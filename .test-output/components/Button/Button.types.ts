import type { ComponentPropsWithRef, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ComponentPropsWithRef<'button'> {
  /** Visual style variant */
  variant?: ButtonVariant;
  /** Size affecting padding and font size */
  size?: ButtonSize;
  /** Shows loading spinner and disables interaction */
  loading?: boolean;
  /** Icon rendered before the label */
  leftIcon?: ReactNode;
  /** Icon rendered after the label */
  rightIcon?: ReactNode;
  /** Merges props onto child element instead of rendering a <button> */
  asChild?: boolean;
}
