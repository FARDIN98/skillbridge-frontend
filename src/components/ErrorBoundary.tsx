'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { logError } from '../lib/errors';
import api from '../lib/api';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary Component
 * Catches JavaScript errors anywhere in the child component tree
 * Logs errors and displays a fallback UI
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console using existing utility
    logError(error, 'ErrorBoundary');

    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Send error to custom API endpoint for tracking
    this.logErrorToAPI(error, errorInfo);
  }

  logErrorToAPI = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      await api.post('/errors', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
        url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      });
    } catch (apiError) {
      // Silently fail if error logging fails - don't want to create error loop
      console.error('Failed to log error to API:', apiError);
    }
  };

  handleReset = () => {
    // Reset error state to retry rendering
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-8">
            {/* Error Icon */}
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-amber-400/10 border-2 border-amber-400/30 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-amber-400" />
              </div>
            </div>

            {/* Error Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-white text-center mb-3">
              Something went wrong
            </h1>

            {/* Error Details */}
            <div className="space-y-3 mb-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-sm font-semibold text-slate-300 mb-1">Error Type:</p>
                <p className="text-base text-white font-mono break-words">
                  {this.state.error.name}
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-sm font-semibold text-slate-300 mb-1">Error Message:</p>
                <p className="text-base text-white break-words">
                  {this.state.error.message || 'No error message available'}
                </p>
              </div>

              {/* Developer info - only show in development */}
              {process.env.NODE_ENV === 'development' && this.state.error.stack && (
                <details className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <summary className="text-sm font-semibold text-slate-300 cursor-pointer hover:text-white transition-colors">
                    Stack Trace (Development Only)
                  </summary>
                  <pre className="mt-3 text-xs text-slate-400 overflow-x-auto whitespace-pre-wrap break-words font-mono">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 font-semibold rounded-xl hover:from-amber-500 hover:to-amber-600 transition-all shadow-lg shadow-amber-500/20 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-950 min-h-[44px]"
              >
                <RefreshCw className="h-5 w-5" />
                Try Again
              </button>

              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.href = '/';
                  }
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all border border-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-950 min-h-[44px]"
              >
                Go to Homepage
              </button>
            </div>

            {/* Help Text */}
            <p className="text-center text-sm text-slate-400 mt-6">
              If this problem persists, please contact support or try refreshing the page.
            </p>
          </div>
        </div>
      );
    }

    // No error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
