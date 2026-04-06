/**
 * Authentication API Service using RTK Query
 * Handles user authentication, registration, profile management, and token refresh
 * Implements JSON:API standard with transformResponse for data extraction
 * Note: Refresh token is stored in HTTP-only cookie by the server
 */

import { baseApi, tokenManager } from '@/api';
import type {
  AuthResponse,
  ChangePasswordRequest,
  JsonApiResource,
  JsonApiResponse,
  LoginRequest,
  RegisterRequest,
  RequestPasswordResetRequest,
  ResetPasswordRequest,
  UserAttributes,
  UserWithAttributes,
  UserResponseDto,
} from '@/api';

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
      transformResponse: (response: JsonApiResponse<UserAttributes>): AuthResponse => {
        // Extract accessToken from top-level
        const accessToken = response.accessToken ?? '';

        // Type guard: check if data is array
        if (Array.isArray(response.data)) {
          throw new Error('Login response should contain single user resource');
        }

        // Now TypeScript knows response.data is JsonApiResource<UserAttributes>
        const resource = response.data as JsonApiResource<UserAttributes>;
        const userWithAttrs: UserWithAttributes = {
          id: resource.id,
          ...resource.attributes,
        };

        return {
          user: userWithAttrs,
          accessToken,
          expiresIn: 3600, // Default to 1 hour if not provided
        };
      },
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Save access token with expiration
          const expiresAt = Date.now() + data.expiresIn * 1000;
          tokenManager.setToken(data.accessToken, expiresAt);
        } catch (error) {
          console.error('Login failed:', error);
        }
      },
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
      transformResponse: (response: JsonApiResponse<UserAttributes>): AuthResponse => {
        // Extract accessToken from top-level
        const accessToken = response.accessToken ?? '';

        // Type guard: check if data is array
        if (Array.isArray(response.data)) {
          throw new Error('Register response should contain single user resource');
        }

        const resource = response.data as JsonApiResource<UserAttributes>;
        const userWithAttrs: UserWithAttributes = {
          id: resource.id,
          ...resource.attributes,
        };

        return {
          user: userWithAttrs,
          accessToken,
          expiresIn: 3600, // Default to 1 hour if not provided
        };
      },
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Save access token with expiration
          const expiresAt = Date.now() + data.expiresIn * 1000;
          tokenManager.setToken(data.accessToken, expiresAt);
        } catch (error) {
          console.error('Register failed:', error);
        }
      },
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
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          // Limpar tokens do localStorage
          tokenManager.clearTokens();
        } catch (error) {
          console.error('Logout failed:', error);
          // Ainda limpar tokens mesmo se houver erro
          tokenManager.clearTokens();
        }
      },
      invalidatesTags: ['User'],
    }),

    /**
     * Get current user profile endpoint
     * @query
     */
    getProfile: builder.query<UserWithAttributes, void>({
      query: () => ({
        url: '/auth/profile',
        method: 'GET',
      }),
      transformResponse: (response: JsonApiResponse<UserAttributes>): UserWithAttributes => {
        // Type guard: check if data is array
        if (Array.isArray(response.data)) {
          throw new Error('Profile response should contain single user resource');
        }

        const resource = response.data as JsonApiResource<UserAttributes>;
        const userWithAttrs: UserWithAttributes = {
          id: resource.id,
          ...resource.attributes,
        };

        return userWithAttrs;
      },
      providesTags: ['User'],
    }),

    /**
     * Refresh token endpoint - Obtains new access token
     * The refresh token is automatically sent via HTTP-only cookie
     * @mutation
     */
    refreshToken: builder.mutation<AuthResponse, void>({
      query: () => ({
        url: '/auth/refresh',
        method: 'POST',
        body: {}, // Refresh token comes from HTTP-only cookie
      }),
      transformResponse: (response: JsonApiResponse<UserAttributes>): AuthResponse => {
        // Extract accessToken from top-level
        const accessToken = response.accessToken ?? '';

        // Type guard: check if data is array
        if (Array.isArray(response.data)) {
          throw new Error('Refresh token response should contain single user resource');
        }

        const resource = response.data as JsonApiResource<UserAttributes>;
        const userWithAttrs: UserWithAttributes = {
          id: resource.id,
          ...resource.attributes,
        };

        return {
          user: userWithAttrs,
          accessToken,
          expiresIn: 3600, // Default to 1 hour if not provided
        };
      },
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Save new access token with expiration
          const expiresAt = Date.now() + data.expiresIn * 1000;
          tokenManager.setToken(data.accessToken, expiresAt);
        } catch (error) {
          console.error('Token refresh failed:', error);
          // Clear tokens if refresh fails
          // HTTP-only cookie will be cleared by server
          tokenManager.clearTokens();
        }
      },
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

    /**
     * Get all users in the system
     * @query
     */
    getUsers: builder.query<readonly UserResponseDto[], void>({
      query: () => '/users',
      transformResponse: (
        response: JsonApiResponse<UserAttributes>
      ): readonly UserResponseDto[] => {
        // Handle array of resources
        if (!Array.isArray(response.data)) {
          throw new Error('getUsers response should contain array of user resources');
        }

        return response.data.map((resource: JsonApiResource<UserAttributes>) => ({
          id: resource.id,
          email: resource.attributes.email,
          firstName: resource.attributes.firstName ?? '',
          lastName: resource.attributes.lastName ?? '',
          avatar: resource.attributes.photoUrl,
          createdAt: resource.attributes.createdAt
            ? new Date(resource.attributes.createdAt)
            : undefined,
          updatedAt: resource.attributes.updatedAt
            ? new Date(resource.attributes.updatedAt)
            : undefined,
        }));
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'User' as const, id })),
              { type: 'User' as const, id: 'LIST' },
            ]
          : [{ type: 'User' as const, id: 'LIST' }],
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
  useGetUsersQuery,
} = authApi;
