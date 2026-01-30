// Token storage key
const TOKEN_KEY = 'skillbridge_token';

/**
 * Check if code is running in browser
 */
const isBrowser = typeof window !== 'undefined';

/**
 * Save JWT token to localStorage
 * @param token - JWT token string
 */
export const setToken = (token: string): void => {
  if (isBrowser) {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

/**
 * Get JWT token from localStorage
 * @returns JWT token string or null
 */
export const getToken = (): string | null => {
  if (isBrowser) {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

/**
 * Remove JWT token from localStorage
 */
export const clearToken = (): void => {
  if (isBrowser) {
    localStorage.removeItem(TOKEN_KEY);
  }
};

/**
 * Check if user is authenticated (has valid token)
 * @returns boolean
 */
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

/**
 * Decode JWT token to get payload
 * Note: This is NOT secure verification, only for reading payload
 * @param token - JWT token string
 * @returns Decoded payload or null
 */
export const decodeToken = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Check if token is expired
 * @param token - JWT token string
 * @returns boolean
 */
export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }
  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
};
