/**
 * Axios Instance Configuration
 * Central Axios instance with base configuration and interceptors
 */

import axios, {
  type AxiosInstance,
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import type { ApiResponse, ApiErrorResponse } from './types';
import { ApiError } from './types';
import { tokenManager } from './tokenManager';

// API base configuration
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) ?? 'http://localhost:3000/api';
const API_TIMEOUT = Number.parseInt((import.meta.env.VITE_API_TIMEOUT as string) ?? '30000', 10);

/**
 * Create and configure Axios instance
 */
function createApiClient(): AxiosInstance {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    } as const,
  });

  // Request Interceptor: Add Authorization header
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = tokenManager.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: unknown) => Promise.reject(error as Error)
  );

  // Response Interceptor: Handle errors and normalize responses
  instance.interceptors.response.use(
    (response: AxiosResponse<ApiResponse<unknown>>) => {
      // Return response as-is (already typed as ApiResponse)
      return response;
    },
    (error: unknown) => {
      const axiosError = error as AxiosError<ApiErrorResponse>;

      // Handle 401 Unauthorized - clear token and redirect to login
      if (axiosError.response?.status === 401) {
        tokenManager.clearTokens();
        // Trigger logout event or redirect to login page
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }

      // Normalize error
      const statusCode = axiosError.response?.status ?? 500;
      const errorData = axiosError.response?.data;
      const message = errorData?.message ?? axiosError.message ?? 'An unknown error occurred';

      const apiError = new ApiError(message, statusCode, errorData, error);

      return Promise.reject(apiError as Error);
    }
  );

  return instance;
}

export const apiClient = createApiClient();

/**
 * Create a new Axios instance with custom configuration
 * Useful for non-standard API endpoints
 */
export function createCustomApiClient(
  baseURL: string,
  timeout: number = API_TIMEOUT
): AxiosInstance {
  const instance = axios.create({
    baseURL,
    timeout,
    headers: {
      'Content-Type': 'application/json',
    } as const,
  });

  // Apply same interceptors
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = tokenManager.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: unknown) => Promise.reject(error as Error)
  );

  instance.interceptors.response.use(
    (response: AxiosResponse<ApiResponse<unknown>>) => response,
    (error: unknown) => {
      const axiosError = error as AxiosError<ApiErrorResponse>;

      if (axiosError.response?.status === 401) {
        tokenManager.clearTokens();
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }

      const statusCode = axiosError.response?.status ?? 500;
      const errorData = axiosError.response?.data;
      const message = errorData?.message ?? axiosError.message ?? 'An unknown error occurred';

      const apiError = new ApiError(message, statusCode, errorData, error);

      return Promise.reject(apiError as Error);
    }
  );

  return instance;
}
