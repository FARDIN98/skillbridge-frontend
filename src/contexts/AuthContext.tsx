'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../lib/api';
import { setToken, getToken, clearToken, isTokenExpired } from '../lib/auth';
import { User, LoginCredentials, RegisterData, AuthResponse } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch current user on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();

      if (!token) {
        setLoading(false);
        return;
      }

      // Check if token is expired
      if (isTokenExpired(token)) {
        clearToken();
        setLoading(false);
        return;
      }

      try {
        const response = await api.get<{ user: User }>('/auth/me');
        setUser(response.data.user);
      } catch (err: any) {
        console.error('Failed to fetch user:', err);
        clearToken();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Login user
   */
  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setError(null);
      setLoading(true);

      const response = await api.post<AuthResponse>('/auth/login', credentials);
      const { user: userData, token } = response.data;

      // Save token
      setToken(token);

      // Set user
      setUser(userData);
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register new user
   */
  const register = async (data: RegisterData): Promise<void> => {
    try {
      setError(null);
      setLoading(true);

      const response = await api.post<AuthResponse>('/auth/register', data);
      const { user: userData, token } = response.data;

      // Save token
      setToken(token);

      // Set user
      setUser(userData);
    } catch (err: any) {
      const errorMessage = err.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout user
   */
  const logout = (): void => {
    clearToken();
    setUser(null);
    setError(null);
    // Redirect to home
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  /**
   * Clear error message
   */
  const clearError = (): void => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use auth context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
