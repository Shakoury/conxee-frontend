import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
const variants = cva(
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-caption font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-solid text-on-solid hover:opacity-90',
        secondary: 'border border-outline bg-surface hover:bg-hover',
        ghost: 'hover:bg-hover',
        icon: 'size-11 p-0 hover:bg-hover',
        destructive: 'bg-danger text-white dark:text-on-solid hover:opacity-90',
      },
    },
    defaultVariants: { variant: 'primary' },
  },
);
export interface ButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof variants> {
  asChild?: boolean;
}
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, asChild = false, type = 'button', ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        type={type}
        className={cn(variants({ variant }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';
