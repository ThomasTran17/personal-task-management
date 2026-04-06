/**
 * API Response Types and Error Handling
 * Defines common interfaces for API communication
 * Based on JSON:API standard (https://jsonapi.org/)
 */

/**
 * JSON:API Resource Object
 * Represents a single resource with id, type, and attributes
 * @template T - The attributes type
 */
export interface JsonApiResource<T> {
  readonly type: string;
  readonly id: string;
  readonly attributes: T;
  readonly links?: {
    readonly self: string;
  };
}

/**
 * JSON:API Response Object
 * Contains either a single resource or array of resources
 * @template T - The attributes type
 */
export interface JsonApiResponse<T> {
  readonly data: JsonApiResource<T> | readonly JsonApiResource<T>[];
  readonly accessToken?: string;
}

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
 * Note: Refresh token is stored in HTTP-only cookie by the server
 */
export interface TokenData {
  readonly token: string;
  readonly expiresAt: number;
}

/**
 * User data interface
 */
export interface User {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly role: string;
  readonly createdAt: string;
}

/**
 * User attributes (from JSON:API resource attributes)
 */
export interface UserAttributes {
  readonly email: string;
  readonly firstName?: string;
  readonly lastName?: string;
  readonly displayName?: string;
  readonly photoUrl?: string;
  readonly isEmailVerified?: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * User with attributes flattened (id + attributes combined)
 */
export interface UserWithAttributes extends UserAttributes {
  readonly id: string;
}

/**
 * Login request payload
 */
export interface LoginRequest {
  readonly email: string;
  readonly password: string;
}

/**
 * Register request payload
 */
export interface RegisterRequest {
  readonly email: string;
  readonly password: string;
  readonly name: string;
}

/**
 * Login/Register response payload
 * accessToken at top-level as per JSON:API with auth response
 * Note: Refresh token is handled via HTTP-only cookie
 */
export interface AuthResponse {
  readonly user: UserWithAttributes;
  readonly accessToken: string;
  readonly expiresIn: number;
}

/**
 * Refresh token request payload
 * Note: Refresh token is provided via HTTP-only cookie, body can be empty
 * Using void type as no request parameters are needed
 */
export type RefreshTokenRequest = void;

/**
 * Change password request payload
 */
export interface ChangePasswordRequest {
  readonly oldPassword: string;
  readonly newPassword: string;
}

/**
 * Password reset request payload
 */
export interface ResetPasswordRequest {
  readonly token: string;
  readonly newPassword: string;
}

/**
 * Password reset email request payload
 */
export interface RequestPasswordResetRequest {
  readonly email: string;
}

/**
 * Task attributes (from JSON:API resource attributes)
 */
export interface TaskAttributes {
  readonly ownerId: string;
  readonly title: string;
  readonly description?: string;
  readonly status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  readonly priority: 'LOW' | 'MEDIUM' | 'HIGH';
  readonly participantIds?: readonly string[];
  readonly dueDate?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly parentId?: string | null;
}

/**
 * Task with attributes flattened (id + attributes combined)
 */
export interface TaskWithAttributes extends TaskAttributes {
  readonly id: string;
}
