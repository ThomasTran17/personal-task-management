/**
 * RTK Query Base API Configuration
 * Handles all server-side state management with automatic cache invalidation
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { tokenManager } from './tokenManager';
import { env } from '@/config';

/**
 * Configure base query with Bearer token injection
 */
const baseUrl = env.VITE_API_BASE_URL;
const timeout = env.VITE_API_TIMEOUT;

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
let failedQueue: (() => Promise<void>)[] = [];

const processQueue = async () => {
  for (const promise of failedQueue) {
    await promise();
  }
  failedQueue = [];
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
    if (!isRefreshing) {
      isRefreshing = true;

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
            await processQueue();

            // Retry original request with new token
            result = await baseQuery(args, api, extraOptions);
          }
        } else {
          // Refresh failed, clear tokens and redirect to login
          tokenManager.clearTokens();
          window.location.href = '/login';
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
        tokenManager.clearTokens();
        window.location.href = '/login';
      } finally {
        isRefreshing = false;
      }
    } else {
      // If already refreshing, queue the failed request to retry later
      await new Promise<void>((resolve) => {
        failedQueue.push(async () => {
          result = await baseQuery(args, api, extraOptions);
          resolve();
        });
      });
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
