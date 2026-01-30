/**
 * Button Spinner Component
 * Displays a loading spinner inside buttons
 */

interface ButtonSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  light?: boolean;
}

export function ButtonSpinner({ size = 'md', className = '', light = false }: ButtonSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-5 h-5 border-2',
    lg: 'w-6 h-6 border-3'
  };

  const colorClass = light ? 'border-white/30 border-t-white' : 'border-slate-700 border-t-slate-400';

  return (
    <div
      className={`${sizeClasses[size]} ${colorClass} rounded-full animate-spin ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

/**
 * Button with Loading State
 */
interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export function LoadingButton({
  loading = false,
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: LoadingButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 hover:from-amber-500 hover:to-amber-600 shadow-lg shadow-amber-500/20',
    secondary: 'bg-white/10 text-white hover:bg-white/20 border border-white/20',
    danger: 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30',
    ghost: 'bg-transparent text-slate-300 hover:bg-white/5'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <ButtonSpinner size={size === 'sm' ? 'sm' : 'md'} light={variant === 'primary'} />}
      {children}
    </button>
  );
}
