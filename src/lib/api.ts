import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { getToken, clearToken } from './auth';
import { logError, isNetworkError } from './errors';

// Create axios instance with enhanced configuration
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000, // 30 seconds
  withCredentials: false
});

// Request counter for tracking pending requests
let pendingRequests = 0;

/**
 * Request interceptor - Add auth token and logging
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Increment pending requests counter
    pendingRequests++;

    // Add auth token
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data
      });
    }

    return config;
  },
  (error: AxiosError) => {
    pendingRequests--;
    logError(error, 'API Request Interceptor');
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Handle errors globally
 */
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Decrement pending requests counter
    pendingRequests--;

    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data
      });
    }

    return response;
  },
  async (error: AxiosError) => {
    pendingRequests--;

    // Log error
    logError(error, 'API Response');

    // Handle network errors
    if (isNetworkError(error)) {
      if (typeof window !== 'undefined') {
        console.error('Network error detected. Please check your connection.');
      }
      return Promise.reject({
        message: 'Network error. Please check your internet connection.',
        status: 0,
        isNetworkError: true,
        originalError: error
      });
    }

    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      return Promise.reject({
        message: 'Request timeout. Please try again.',
        status: 408,
        isTimeout: true,
        originalError: error
      });
    }

    const status = error.response?.status;
    const responseData = error.response?.data as any;

    // Handle 401 Unauthorized - Token expired or invalid
    if (status === 401) {
      clearToken();

      // Only redirect if not already on auth pages
      if (typeof window !== 'undefined') {
        const pathname = window.location.pathname;
        const isAuthPage = pathname.includes('/login') || pathname.includes('/register');

        if (!isAuthPage) {
          // Store the current path to redirect back after login
          sessionStorage.setItem('redirectAfterLogin', pathname);
          window.location.href = '/login';
        }
      }
    }

    // Handle 403 Forbidden
    if (status === 403) {
      if (typeof window !== 'undefined') {
        console.error('Access forbidden. You do not have permission.');
      }
    }

    // Extract error message
    const errorMessage = responseData?.message || error.message || 'An unexpected error occurred';
    const errorDetails = responseData?.details || null;

    // Return structured error
    return Promise.reject({
      message: errorMessage,
      status: status || 500,
      details: errorDetails,
      data: responseData,
      originalError: error
    });
  }
);

/**
 * Check if there are pending API requests
 */
export function hasPendingRequests(): boolean {
  return pendingRequests > 0;
}

/**
 * Reset pending requests counter (useful for testing)
 */
export function resetPendingRequests(): void {
  pendingRequests = 0;
}

export default api;
