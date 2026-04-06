/**
 * RTK Query Base API Configuration
 * Handles all server-side state management with automatic cache invalidation
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { tokenManager } from '@/api';
import { config } from '@/config';

/**
 * Configure base query with Bearer token injection
 */
const baseUrl = config.API_BASE_URL;
const timeout = config.API_TIMEOUT;

const baseQuery = fetchBaseQuery({
  baseUrl,
  timeout,
  credentials: 'include', // Include cookies (for HTTP-only refresh token)
  prepareHeaders: (headers) => {
    // Inject Bearer token from token manager
    const token = tokenManager.getToken();
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }

    // Set content type
    headers.set('Content-Type', 'application/json');

    return headers;
  },
});

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

/**
 * Check if current route is login page to avoid infinite refresh loops
 */
const isOnLoginPage = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.location.pathname === '/login';
};

/**
 * Enhanced base query with error handling
 * Handles 401 Unauthorized by attempting to refresh token via refresh endpoint
 */
const baseQueryWithReauth: BaseQueryFn<FetchArgs | string, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let result = await baseQuery(args, api, extraOptions);

  // Handle 401 Unauthorized - attempt token refresh
  if (result.error?.status === 401) {
    // Don't retry refresh if already on login page or access token doesn't exist
    const hasAccessToken = tokenManager.getToken();
    if (!hasAccessToken || isOnLoginPage()) {
      return result;
    }

    // If refresh is already in progress, wait for it to complete
    if (isRefreshing && refreshPromise) {
      const refreshSucceeded = await refreshPromise;
      if (refreshSucceeded) {
        // Token was refreshed successfully, retry the original request
        result = await baseQuery(args, api, extraOptions);
      }
      // If refresh failed, return the 401 error
      return result;
    }

    // Start token refresh process
    isRefreshing = true;
    refreshPromise = (async () => {
      try {
        // Attempt to refresh token using the refresh endpoint
        // The refresh token is automatically included in cookies
        const refreshResult = await baseQuery(
          {
            url: '/auth/refresh',
            method: 'POST',
            body: {}, // Refresh token comes from HTTP-only cookie
          },
          api,
          extraOptions
        );

        if (refreshResult.data) {
          // Extract new access token from response
          const responseData = refreshResult.data as { accessToken?: string };
          const newAccessToken = responseData.accessToken;

          if (newAccessToken) {
            tokenManager.setToken(newAccessToken);
            return true; // Refresh succeeded
          }
        }

        // Refresh failed, clear tokens and redirect to login
        tokenManager.clearTokens();
        if (!isOnLoginPage()) {
          window.location.href = '/login';
        }
        return false;
      } catch (error) {
        console.error('Token refresh failed:', error);
        tokenManager.clearTokens();
        if (!isOnLoginPage()) {
          window.location.href = '/login';
        }
        return false;
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    })();

    // Wait for refresh to complete
    const refreshSucceeded = await refreshPromise;
    if (refreshSucceeded) {
      // Token was refreshed successfully, retry the original request
      result = await baseQuery(args, api, extraOptions);
    }
  }

  return result;
};

/**
 * Base API using RTK Query
 * All endpoints inherit configuration, headers, and error handling
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Task', 'User'],
  endpoints: () => ({}),
});
