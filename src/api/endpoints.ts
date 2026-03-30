/**
 * API Endpoints Service
 * Defines typed methods for all API endpoints
 */

import type { AxiosResponse } from 'axios';
import { apiClient } from './client';
import type { ApiResponse, RequestOptions } from './types';

/**
 * Generic API GET request
 * @template T - Response data type
 */
export async function apiGet<T>(
  url: string,
  options?: RequestOptions
): Promise<AxiosResponse<ApiResponse<T>>> {
  return apiClient.get<ApiResponse<T>>(url, {
    timeout: options?.timeout,
    headers: options?.headers,
    params: options?.params,
  });
}

/**
 * Generic API POST request
 * @template T - Response data type
 * @template D - Request body type
 */
export async function apiPost<T, D = unknown>(
  url: string,
  data?: D,
  options?: RequestOptions
): Promise<AxiosResponse<ApiResponse<T>>> {
  return apiClient.post<ApiResponse<T>>(url, data, {
    timeout: options?.timeout,
    headers: options?.headers,
    params: options?.params,
  });
}

/**
 * Generic API PUT request
 * @template T - Response data type
 * @template D - Request body type
 */
export async function apiPut<T, D = unknown>(
  url: string,
  data?: D,
  options?: RequestOptions
): Promise<AxiosResponse<ApiResponse<T>>> {
  return apiClient.put<ApiResponse<T>>(url, data, {
    timeout: options?.timeout,
    headers: options?.headers,
    params: options?.params,
  });
}

/**
 * Generic API PATCH request
 * @template T - Response data type
 * @template D - Request body type
 */
export async function apiPatch<T, D = unknown>(
  url: string,
  data?: D,
  options?: RequestOptions
): Promise<AxiosResponse<ApiResponse<T>>> {
  return apiClient.patch<ApiResponse<T>>(url, data, {
    timeout: options?.timeout,
    headers: options?.headers,
    params: options?.params,
  });
}

/**
 * Generic API DELETE request
 * @template T - Response data type
 */
export async function apiDelete<T = void>(
  url: string,
  options?: RequestOptions
): Promise<AxiosResponse<ApiResponse<T>>> {
  return apiClient.delete<ApiResponse<T>>(url, {
    timeout: options?.timeout,
    headers: options?.headers,
    params: options?.params,
  });
}

/**
 * Extract data from API response
 * Convenience method to get response data directly
 */
export async function extractResponseData<T>(
  promise: Promise<AxiosResponse<ApiResponse<T>>>
): Promise<T> {
  const response = await promise;
  return response.data.data;
}
