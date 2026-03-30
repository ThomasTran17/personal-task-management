/**
 * API Module - Central export point
 * Exports all API utilities, services, and types
 */

// Core API client
export { apiClient, createCustomApiClient } from './client';

// API Endpoints
export { apiGet, apiPost, apiPut, apiPatch, apiDelete, extractResponseData } from './endpoints';

// Auth API Service
export { authApi, type User, type LoginRequest, type LoginResponse } from './authApi';

// Token Manager
export { tokenManager } from './tokenManager';

// Error Handling
export {
  configureErrorHandler,
  handleApiError,
  formatErrorMessage,
  getUserFriendlyMessage,
  logError,
  isRetryableError,
  getRetryDelay,
  retryRequest,
} from './errorHandler';

// Types
export type {
  ApiResponse,
  PaginatedResponse,
  ApiErrorResponse,
  RequestOptions,
  TokenData,
} from './types';
export { ApiError } from './types';
