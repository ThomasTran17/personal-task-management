/**
 * RTK Query Base API Configuration
 * Handles all server-side state management with automatic cache invalidation
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { tokenManager } from './tokenManager';

/**
 * Configure base query with Bearer token injection
 */
const baseUrl =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:3000/api';
const timeout = parseInt((import.meta.env.VITE_API_TIMEOUT as string | undefined) ?? '30000', 10);

const baseQuery = fetchBaseQuery({
  baseUrl,
  timeout,
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

/**
 * Enhanced base query with error handling
 * Handles 401 Unauthorized by clearing tokens and redirecting
 */
const baseQueryWithReauth: BaseQueryFn<FetchArgs | string, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const result = await baseQuery(args, api, extraOptions);

  // Handle 401 Unauthorized
  if (result.error?.status === 401) {
    // Clear stored tokens
    tokenManager.clearTokens();

    // TODO: Redirect to login page if needed
    // window.location.href = '/login';
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
