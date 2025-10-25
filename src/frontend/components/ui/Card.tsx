import { ReactNode } from 'react';
import { cn } from '../../utils/cn';

/**
 * Card component props interface
 */
interface CardProps {
  /** Card content */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Reusable card component with glass morphism effect.
 * Provides a modern, elevated surface for content with shadow and border.
 *
 * @param {CardProps} props - Component props
 * @returns {JSX.Element} Card container
 */
export function Card({ children, className }: CardProps) {
  return (
    <div className={cn('glass rounded-2xl shadow-xl p-6 border border-white/20', className)}>
      {children}
    </div>
  );
}