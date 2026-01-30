/**
 * Loading Page Component
 * Full-page loading spinner for route transitions
 */

export function LoadingPage({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="text-center space-y-6">
        {/* Animated Logo/Spinner */}
        <div className="relative w-20 h-20 mx-auto">
          <div className="absolute inset-0 border-4 border-amber-400/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-transparent border-t-amber-400 rounded-full animate-spin" />
          <div className="absolute inset-2 border-4 border-transparent border-t-amber-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }} />
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <p className="text-lg font-medium text-white">{message}</p>
          <div className="flex items-center justify-center gap-1">
            <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Loading Overlay Component
 * Semi-transparent overlay with spinner for in-page loading
 */
export function LoadingOverlay({ message }: { message?: string }) {
  return (
    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-xl">
      <div className="text-center space-y-4">
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 border-4 border-amber-400/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-transparent border-t-amber-400 rounded-full animate-spin" />
        </div>
        {message && <p className="text-sm text-slate-300">{message}</p>}
      </div>
    </div>
  );
}

/**
 * Inline Spinner Component
 * Small spinner for inline loading states
 */
export function InlineSpinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3'
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeClasses[size]} border-amber-400/20 border-t-amber-400 rounded-full animate-spin ${className}`}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
