import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  variant?: 'default' | 'elevated' | 'outlined';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, padding = 'md', hover = false, variant = 'default', children, ...props }, ref) => {
    const paddingClasses = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    };

    const variantClasses = {
      default: 'bg-gray-800 border border-gray-700 shadow-sm',
      elevated: 'bg-gray-800 shadow-lg border border-gray-700',
      outlined: 'bg-gray-800 border-2 border-gray-600',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl transition-all',
          variantClasses[variant],
          paddingClasses[padding],
          hover && 'hover:shadow-xl hover:border-primary-500/50 hover:bg-gray-750',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;











