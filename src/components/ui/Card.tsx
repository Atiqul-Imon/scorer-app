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
      default: 'bg-white border border-gray-200 shadow-sm',
      elevated: 'bg-white shadow-md border border-gray-100',
      outlined: 'bg-white border-2 border-gray-300',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl transition-all',
          variantClasses[variant],
          paddingClasses[padding],
          hover && 'hover:shadow-lg hover:border-primary-200',
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











