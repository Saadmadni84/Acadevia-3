import { forwardRef } from 'react';
import { cn } from '@/utils/helpers';

// Card Props
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'bordered' | 'ghost';
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

// CardHeader Props
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

// CardTitle Props
export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

// CardDescription Props
export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

// CardContent Props
export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

// CardFooter Props
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
    justify?: 'start' | 'center' | 'end' | 'between';
}

// Card Component
export const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'default', padding = 'md', children, ...props }, ref) => {
        const baseStyles = 'rounded-xl transition-all';

        const variants = {
            default: 'bg-white shadow-lg',
            bordered: 'bg-white border-2 border-gray-200',
            ghost: 'bg-gray-50',
        };

        const paddings = {
            none: '',
            sm: 'p-4',
            md: 'p-6',
            lg: 'p-8',
        };

        return (
            <div
                ref={ref}
                className={cn(
                    baseStyles,
                    variants[variant],
                    paddings[padding],
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

// CardHeader Component
export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn('space-y-1.5', className)}
                {...props}
            >
                {children}
            </div>
        );
    }
);

CardHeader.displayName = 'CardHeader';

// CardTitle Component
export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <h3
                ref={ref}
                className={cn(
                    'text-2xl font-semibold leading-none tracking-tight text-gray-900',
                    className
                )}
                {...props}
            >
                {children}
            </h3>
        );
    }
);

CardTitle.displayName = 'CardTitle';

// CardDescription Component
export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <p
                ref={ref}
                className={cn('text-sm text-gray-600 leading-relaxed', className)}
                {...props}
            >
                {children}
            </p>
        );
    }
);

CardDescription.displayName = 'CardDescription';

// CardContent Component
export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
    ({ className, padding = 'md', children, ...props }, ref) => {
        const paddings = {
            none: '',
            sm: 'pt-4',
            md: 'pt-6',
            lg: 'pt-8',
        };

        return (
            <div
                ref={ref}
                className={cn(paddings[padding], className)}
                {...props}
            >
                {children}
            </div>
        );
    }
);

CardContent.displayName = 'CardContent';

// CardFooter Component
export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
    ({ className, justify = 'start', children, ...props }, ref) => {
        const justifications = {
            start: 'justify-start',
            center: 'justify-center',
            end: 'justify-end',
            between: 'justify-between',
        };

        return (
            <div
                ref={ref}
                className={cn(
                    'flex items-center pt-6',
                    justifications[justify],
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

CardFooter.displayName = 'CardFooter';
