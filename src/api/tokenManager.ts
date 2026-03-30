/**
 * Token Management Utilities
 * Handles secure token storage and retrieval
 */

import type { TokenData } from './types';

const TOKEN_KEY = 'api_token';
const REFRESH_TOKEN_KEY = 'api_refresh_token';
const TOKEN_EXPIRY_KEY = 'api_token_expiry';

/**
 * Token Manager - Handles secure token storage and retrieval
 */
export const tokenManager = {
  /**
   * Get current access token
   */
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      console.error('Failed to retrieve token from storage');
      return null;
    }
  },

  /**
   * Save access token
   */
  setToken(token: string, expiresAt?: number): void {
    try {
      localStorage.setItem(TOKEN_KEY, token);
      if (expiresAt) {
        localStorage.setItem(TOKEN_EXPIRY_KEY, String(expiresAt));
      }
    } catch {
      console.error('Failed to save token to storage');
    }
  },

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch {
      console.error('Failed to retrieve refresh token from storage');
      return null;
    }
  },

  /**
   * Save refresh token
   */
  setRefreshToken(token: string): void {
    try {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    } catch {
      console.error('Failed to save refresh token to storage');
    }
  },

  /**
   * Check if token exists and is not expired
   */
  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY);
      if (!expiryStr) return true; // No expiry info, assume valid

      const expiryTime = Number.parseInt(expiryStr, 10);
      return Date.now() < expiryTime;
    } catch {
      return true; // If can't check expiry, assume valid
    }
  },

  /**
   * Clear all tokens
   */
  clearTokens(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(TOKEN_EXPIRY_KEY);
    } catch {
      console.error('Failed to clear tokens from storage');
    }
  },

  /**
   * Get complete token data
   */
  getTokenData(): TokenData | null {
    const token = this.getToken();
    if (!token) return null;

    return {
      token,
      expiresAt: Number.parseInt(localStorage.getItem(TOKEN_EXPIRY_KEY) ?? '0', 10),
      refreshToken: this.getRefreshToken() ?? undefined,
    };
  },

  /**
   * Set complete token data
   */
  setTokenData(tokenData: TokenData): void {
    this.setToken(tokenData.token, tokenData.expiresAt);
    if (tokenData.refreshToken) {
      this.setRefreshToken(tokenData.refreshToken);
    }
  },
};
