/**
 * Redux Selectors for Auth & Task Slices
 * Memoized selectors for efficient component re-renders
 */

import type { RootState } from './store';

/**
 * ============================================================
 * AUTH SELECTORS
 * ============================================================
 */

/**
 * Select entire auth slice state
 */
export const selectAuthState = (state: RootState) => state.auth;

/**
 * Select current authenticated user
 */
export const selectCurrentUser = (state: RootState) => state.auth.user;

/**
 * Select access token
 */
export const selectAccessToken = (state: RootState) => state.auth.accessToken;

/**
 * Select authentication status
 */
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;

/**
 * Select if user is authenticated (boolean)
 */
export const selectIsAuth = (state: RootState) => state.auth.isAuthenticated;

/**
 * Select user ID (if authenticated)
 */
export const selectCurrentUserId = (state: RootState) => state.auth.user?.id ?? null;

/**
 * ============================================================
 * TASK SELECTORS
 * ============================================================
 */

/**
 * Select entire task slice state
 */
export const selectTaskState = (state: RootState) => state.task;

/**
 * Select all tasks from state
 */
export const selectAllTasks = (state: RootState) => state.task.items;

/**
 * Select selected task ID
 */
export const selectSelectedTaskId = (state: RootState) => state.task.selectedId;

/**
 * Select current filters
 */
export const selectTaskFilters = (state: RootState) => state.task.filters;

/**
 * Select selected task by ID
 * Returns the currently selected task object or null
 */
export const selectSelectedTask = (state: RootState) => {
  const selectedId = state.task.selectedId;
  if (!selectedId) return null;
  return state.task.items.find((task) => task.id === selectedId) ?? null;
};

/**
 * Select filtered tasks based on current filters
 * Applies status and priority filters
 */
export const selectFilteredTasks = (state: RootState) => {
  const { items, filters } = state.task;
  return items.filter((task) => {
    if (filters.status && task.status !== filters.status) return false;
    if (filters.priority && task.priority !== filters.priority) return false;
    return true;
  });
};

/**
 * Select task by ID
 */
export const selectTaskById = (state: RootState, taskId: string) => {
  return state.task.items.find((task) => task.id === taskId) ?? null;
};

/**
 * Select tasks by status
 */
export const selectTasksByStatus = (state: RootState, status: 'TODO' | 'IN_PROGRESS' | 'DONE') => {
  return state.task.items.filter((task) => task.status === status);
};

/**
 * Select tasks by priority
 */
export const selectTasksByPriority = (state: RootState, priority: 'LOW' | 'MEDIUM' | 'HIGH') => {
  return state.task.items.filter((task) => task.priority === priority);
};

/**
 * Select task count
 */
export const selectTaskCount = (state: RootState) => state.task.items.length;

/**
 * Select task count by status
 */
export const selectTaskCountByStatus = (state: RootState) => {
  return {
    todo: state.task.items.filter((t) => t.status === 'TODO').length,
    inProgress: state.task.items.filter((t) => t.status === 'IN_PROGRESS').length,
    done: state.task.items.filter((t) => t.status === 'DONE').length,
  };
};
