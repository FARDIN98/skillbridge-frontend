/**
 * Centralized Error Handling Utility
 * Provides type-safe error handling and user-friendly error messages
 */

export interface APIError {
  error: string;
  message: string;
  details?: any;
  statusCode?: number;
}

export class AppError extends Error {
  statusCode: number;
  details?: any;

  constructor(message: string, statusCode: number = 500, details?: any) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Extract user-friendly error message from API error response
 */
export function getErrorMessage(error: unknown): string {
  // Network errors
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return 'Network error. Please check your internet connection.';
  }

  // Axios/API errors with response
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const axiosError = error as any;

    // API returned error message
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }

    // HTTP status code errors
    const status = axiosError.response?.status;
    switch (status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Session expired. Please login again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'This resource already exists.';
      case 422:
        return 'Validation failed. Please check your input.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Server error. Please try again later.';
      case 503:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  // AppError instances
  if (error instanceof AppError) {
    return error.message;
  }

  // Standard Error objects
  if (error instanceof Error) {
    return error.message;
  }

  // String errors
  if (typeof error === 'string') {
    return error;
  }

  // Unknown error types
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return true;
  }
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const axiosError = error as any;
    return axiosError.code === 'ERR_NETWORK' || axiosError.code === 'ECONNABORTED';
  }
  return false;
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const axiosError = error as any;
    return axiosError.response?.status === 401;
  }
  return false;
}

/**
 * Format validation errors from API
 */
export function formatValidationErrors(error: unknown): Record<string, string> {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const axiosError = error as any;
    const details = axiosError.response?.data?.details;

    if (Array.isArray(details)) {
      return details.reduce((acc, err) => {
        if (err.field && err.message) {
          acc[err.field] = err.message;
        }
        return acc;
      }, {} as Record<string, string>);
    }
  }
  return {};
}

/**
 * Log error for debugging (only in development)
 */
export function logError(error: unknown, context?: string): void {
  if (process.env.NODE_ENV === 'development') {
    console.group(`Error${context ? ` in ${context}` : ''}`);
    console.error(error);
    if (error instanceof Error) {
      console.error('Stack:', error.stack);
    }
    console.groupEnd();
  }
}

/**
 * Retry failed requests with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on client errors (4xx)
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as any;
        const status = axiosError.response?.status;
        if (status >= 400 && status < 500) {
          throw error;
        }
      }

      // Last attempt, throw error
      if (attempt === maxRetries) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
