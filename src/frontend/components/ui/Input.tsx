import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';

/**
 * Input component props interface
 */
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Label text displayed above input */
  label?: string;
  /** Error message displayed below input */
  error?: string;
}

/**
 * Reusable input component with label and error message support.
 * Includes focus states and validation styling.
 *
 * @param {InputProps} props - Component props
 * @returns {JSX.Element} Styled input element
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200',
            error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300',
            'hover:border-gray-400',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-500 animate-fadeIn">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';