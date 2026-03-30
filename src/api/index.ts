/**
 * API Layer Barrel Export
 * Exports all RTK Query hooks, APIs, and types from a single source
 */

// Core API configuration
export { baseApi } from './baseApi';

// Token management
export { tokenManager } from './tokenManager';

// All types
export * from './types';

// Task API and hooks
export {
  taskApi,
  useGetTasksQuery,
  useGetTaskByIdQuery,
  useAddTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useDeleteAllTasksMutation,
  resetApiState,
} from './services/taskApi';

// Auth API and hooks
export {
  authApi,
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetProfileQuery,
  useRefreshTokenMutation,
  useChangePasswordMutation,
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
} from './services/authApi';
