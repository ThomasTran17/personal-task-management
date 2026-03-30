/**
 * Authentication API Service
 * Handles login, logout, token refresh, and user profile endpoints
 */

import { apiPost, apiGet, extractResponseData } from './endpoints';
import { tokenManager } from './tokenManager';

/**
 * User data interface
 */
export interface User {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly role: string;
  readonly createdAt: string;
}

/**
 * Login request payload
 */
export interface LoginRequest {
  readonly email: string;
  readonly password: string;
}

/**
 * Login response payload
 */
export interface LoginResponse {
  readonly user: User;
  readonly token: string;
  readonly refreshToken?: string;
  readonly expiresIn: number;
}

/**
 * Auth API service
 */
export const authApi = {
  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiPost<LoginResponse>('/auth/login', credentials);
    const loginData = response.data.data;

    // Store token
    tokenManager.setToken(loginData.token, Date.now() + loginData.expiresIn * 1000);
    if (loginData.refreshToken) {
      tokenManager.setRefreshToken(loginData.refreshToken);
    }

    return loginData;
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiPost('/auth/logout', {});
    } finally {
      tokenManager.clearTokens();
    }
  },

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    return extractResponseData(apiGet<User>('/auth/me'));
  },

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<LoginResponse> {
    const refreshToken = tokenManager.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiPost<LoginResponse>('/auth/refresh', { refreshToken });
    const refreshData = response.data.data;

    // Update stored token
    tokenManager.setToken(refreshData.token, Date.now() + refreshData.expiresIn * 1000);
    if (refreshData.refreshToken) {
      tokenManager.setRefreshToken(refreshData.refreshToken);
    }

    return refreshData;
  },

  /**
   * Change password
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await apiPost('/auth/change-password', { oldPassword, newPassword });
  },

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    await apiPost('/auth/reset-password-request', { email });
  },

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiPost('/auth/reset-password', { token, newPassword });
  },
};
