/**
 * Redux Selectors for Auth & Task Slices
 * Memoized selectors for efficient component re-renders
 */
import { createSelector } from '@reduxjs/toolkit';
import { taskApi } from '@/api/services/taskApi';
import type { RootState } from './store';
import type { Task } from '@/types/task';

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

const selectTasksResult = taskApi.endpoints.getTasks.select(undefined);

/**
 * Select all tasks from state
 */
export const selectAllTasks = createSelector(
  [selectTasksResult],
  (result) => result.data ?? ([] as readonly Task[])
);

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
export const selectSelectedTask = createSelector(
  [selectAllTasks, selectSelectedTaskId],
  (items, selectedId) => {
    if (!selectedId) return null;
    return items.find((task) => task.id === selectedId) ?? null;
  }
);

/**
 * Select filtered tasks based on current filters
 * Applies status and priority filters
 */
export const selectFilteredTasks = createSelector(
  [selectAllTasks, selectTaskFilters],
  (items, filters) => {
    const { searchQuery, status, priority } = filters;

    if (!searchQuery && !status && !priority) return items;

    const query = searchQuery?.toLowerCase() ?? '';

    return items.filter((task) => {
      const matchesSearch = !query || task.title.toLowerCase().includes(query);
      const matchesStatus = !status || task.status === status;

      const matchesPriority = !priority || task.priority === priority;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }
);

/**
 * Select task by ID
 */
export const selectTaskById = createSelector(
  [selectAllTasks, (_state: RootState, taskId: string) => taskId],
  (items, taskId) => items.find((task) => task.id === taskId) ?? null
);

/**
 * Select tasks by status
 */
export const selectTasksByStatus = createSelector(
  [selectAllTasks, (_state: RootState, status: 'TODO' | 'IN_PROGRESS' | 'DONE') => status],
  (items, status) => items.filter((task) => task.status === status)
);

/**
 * Select tasks by priority
 */
export const selectTasksByPriority = createSelector(
  [selectAllTasks, (_state: RootState, priority: 'LOW' | 'MEDIUM' | 'HIGH') => priority],
  (items, priority) => items.filter((task) => task.priority === priority)
);

/**
 * Select task count
 */
export const selectTaskCount = createSelector([selectAllTasks], (items) => items.length);

/**
 * Select task count by status
 */
export const selectTaskCountByStatus = createSelector([selectAllTasks], (items) => {
  return items.reduce(
    (acc, task) => {
      if (task.status === 'TODO') acc.todo++;
      else if (task.status === 'IN_PROGRESS') acc.inProgress++;
      else if (task.status === 'DONE') acc.done++;
      return acc;
    },
    { todo: 0, inProgress: 0, done: 0 }
  );
});
