/**
 * API Response Types and Error Handling
 * Defines common interfaces for API communication
 */

/**
 * Standard API Response format
 * @template T - The data payload type
 */
export interface ApiResponse<T> {
  readonly code: number;
  readonly message: string;
  readonly data: T;
  readonly timestamp: string;
}

/**
 * Paginated API Response
 * @template T - The item type in the paginated list
 */
export interface PaginatedResponse<T> {
  readonly items: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly hasMore: boolean;
}

/**
 * API Error Response format
 */
export interface ApiErrorResponse {
  readonly code: number;
  readonly message: string;
  readonly errors?: Record<string, readonly string[]>;
  readonly timestamp: string;
}

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  readonly statusCode: number;

  readonly response?: ApiErrorResponse;

  readonly originalError?: unknown;

  constructor(
    message: string,
    statusCode?: number,
    response?: ApiErrorResponse,
    originalError?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode ?? 500;
    this.response = response;
    this.originalError = originalError;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  isClientError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500;
  }

  isServerError(): boolean {
    return this.statusCode >= 500;
  }

  isUnauthorized(): boolean {
    return this.statusCode === 401;
  }

  isForbidden(): boolean {
    return this.statusCode === 403;
  }

  isNotFound(): boolean {
    return this.statusCode === 404;
  }
}

/**
 * Request options for API calls
 */
export interface RequestOptions {
  readonly timeout?: number;
  readonly headers?: Readonly<Record<string, string>>;
  readonly params?: Readonly<Record<string, unknown>>;
  readonly validateStatus?: (status: number) => boolean;
}

/**
 * Authentication token data
 */
export interface TokenData {
  readonly token: string;
  readonly expiresAt: number;
  readonly refreshToken?: string;
}
