/**
 * Error Handling Utilities
 * Centralized error handling and logging
 */

import { ApiError } from './types';

/**
 * Error handler configuration
 */
interface ErrorHandlerConfig {
  readonly onUnauthorized?: () => void;
  readonly onForbidden?: () => void;
  readonly onNotFound?: () => void;
  readonly onServerError?: () => void;
  readonly logErrors?: boolean;
}

let errorHandlerConfig: ErrorHandlerConfig = {
  logErrors: true,
};

/**
 * Configure error handler
 */
export function configureErrorHandler(config: ErrorHandlerConfig): void {
  errorHandlerConfig = { ...errorHandlerConfig, ...config };
}

/**
 * Handle API errors with callbacks
 */
export function handleApiError(error: unknown): never {
  let apiError: ApiError;

  // Convert to ApiError if needed
  if (error instanceof ApiError) {
    apiError = error;
  } else if (error instanceof Error) {
    apiError = new ApiError(error.message, 500, undefined, error);
  } else {
    apiError = new ApiError('An unknown error occurred', 500, undefined, error);
  }

  // Log error if enabled
  if (errorHandlerConfig.logErrors) {
    logError(apiError);
  }

  // Call appropriate callback based on status code
  if (apiError.isUnauthorized() && errorHandlerConfig.onUnauthorized) {
    errorHandlerConfig.onUnauthorized();
  } else if (apiError.isForbidden() && errorHandlerConfig.onForbidden) {
    errorHandlerConfig.onForbidden();
  } else if (apiError.isNotFound() && errorHandlerConfig.onNotFound) {
    errorHandlerConfig.onNotFound();
  } else if (apiError.isServerError() && errorHandlerConfig.onServerError) {
    errorHandlerConfig.onServerError();
  }

  throw apiError;
}

/**
 * Format error message for display
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.response?.errors) {
      const errors = Object.values(error.response.errors);
      return errors.flat().join(', ');
    }
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unknown error occurred';
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.statusCode) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Your session has expired. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 500:
        return 'Server error. Please try again later.';
      case 503:
        return 'Service unavailable. Please try again later.';
      default:
        return error.message || 'An error occurred. Please try again.';
    }
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Log error details
 */
export function logError(error: ApiError | Error): void {
  const timestamp = new Date().toISOString();

  if (error instanceof ApiError) {
    console.error(`[${timestamp}] API Error:`, {
      statusCode: error.statusCode,
      message: error.message,
      response: error.response,
      originalError: error.originalError,
    });
  } else {
    console.error(`[${timestamp}] Error:`, {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
  }
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof ApiError) {
    // Retry on 5xx errors and specific 4xx errors
    return error.isServerError() || error.statusCode === 408 || error.statusCode === 429;
  }
  return false;
}

/**
 * Get retry delay in milliseconds
 */
export function getRetryDelay(attempt: number): number {
  // Exponential backoff: 1s, 2s, 4s, 8s, etc.
  return Math.min(1000 * 2 ** attempt, 10000);
}

/**
 * Retry request with exponential backoff
 */
export async function retryRequest<T>(fn: () => Promise<T>, maxAttempts?: number): Promise<T> {
  let lastError: unknown;
  const attempts = maxAttempts ?? 3;

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (!isRetryableError(error) || attempt === attempts - 1) {
        throw error;
      }

      const delay = getRetryDelay(attempt);
      await new Promise((resolve) => {
        setTimeout(resolve, delay);
      });
    }
  }

  throw lastError;
}
