/**
 * Authentication API Service using RTK Query
 * Handles user authentication, registration, profile management, and token refresh
 */

import { baseApi } from '../baseApi';
import type {
  AuthResponse,
  ChangePasswordRequest,
  LoginRequest,
  RefreshTokenRequest,
  RegisterRequest,
  RequestPasswordResetRequest,
  ResetPasswordRequest,
  User,
} from '../types';

/**
 * Auth API service using RTK Query's injectEndpoints pattern
 * Extends baseApi with authentication-related endpoints
 */
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Login endpoint - Authenticates user with email and password
     * @mutation
     */
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),

    /**
     * Register endpoint - Creates new user account
     * @mutation
     */
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),

    /**
     * Logout endpoint - Clears user session and tokens
     * @mutation
     */
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),

    /**
     * Get current user profile endpoint
     * @query
     */
    getProfile: builder.query<User, void>({
      query: () => ({
        url: '/auth/profile',
        method: 'GET',
      }),
      providesTags: ['User'],
    }),

    /**
     * Refresh token endpoint - Obtains new access token
     * @mutation
     */
    refreshToken: builder.mutation<AuthResponse, RefreshTokenRequest>({
      query: (request) => ({
        url: '/auth/refresh-token',
        method: 'POST',
        body: request,
      }),
      invalidatesTags: ['User'],
    }),

    /**
     * Change password endpoint
     * @mutation
     */
    changePassword: builder.mutation<void, ChangePasswordRequest>({
      query: (request) => ({
        url: '/auth/change-password',
        method: 'POST',
        body: request,
      }),
    }),

    /**
     * Request password reset endpoint - Sends reset email
     * @mutation
     */
    requestPasswordReset: builder.mutation<void, RequestPasswordResetRequest>({
      query: (request) => ({
        url: '/auth/request-password-reset',
        method: 'POST',
        body: request,
      }),
    }),

    /**
     * Reset password endpoint - Completes password reset process
     * @mutation
     */
    resetPassword: builder.mutation<void, ResetPasswordRequest>({
      query: (request) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: request,
      }),
    }),
  }),
});

/**
 * Auto-generated RTK Query hooks for auth endpoints
 * Use these in components instead of manual fetch calls
 *
 * @example
 * // In components:
 * const [login, { isLoading }] = authApi.useLoginMutation();
 * const { data: user, isLoading } = authApi.useGetProfileQuery();
 */
export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetProfileQuery,
  useRefreshTokenMutation,
  useChangePasswordMutation,
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
} = authApi;
