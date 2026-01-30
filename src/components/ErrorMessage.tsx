import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onClose?: () => void;
  variant?: 'error' | 'warning' | 'info';
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onClose,
  variant = 'error'
}) => {
  const variantStyles = {
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  const iconColor = {
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500'
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 border rounded-lg ${variantStyles[variant]}`}
      role="alert"
    >
      <AlertCircle className={`flex-shrink-0 h-5 w-5 ${iconColor[variant]}`} />

      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 hover:opacity-70 transition-opacity"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
