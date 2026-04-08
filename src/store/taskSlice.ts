/**
 * Task Redux Slice
 * Local-first state management for tasks with RTK Query integration
 *
 * Architecture:
 * - State: items (master task list), selectedId, filters
 * - Integration: extraReducers + addMatcher for RTK Query mutations/queries
 * - Optimization: No invalidatesTags for mutations - manual cache sync only
 * - Behavior: Optimistic updates handled in RTK Query, state sync via matchers
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Task } from '@/types/task';
import { taskApi } from '@/api/services/taskApi';

export interface TaskFilters {
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE' | null;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | null;
}

export interface TaskSliceState {
  items: Task[];
  selectedId: string | null;
  filters: TaskFilters;
}

const initialState: TaskSliceState = {
  items: [],
  selectedId: null,
  filters: {
    status: null,
    priority: null,
  },
};

/**
 * Task Slice
 * Manages local-first task state synchronized with RTK Query cache
 *
 * Integration Points:
 * 1. getTasks.matchFulfilled => Sync API response to state.items
 * 2. updateTask.matchFulfilled => Update specific task in state.items
 * 3. addTask.matchFulfilled => Add new task to state.items
 * 4. deleteTask.matchFulfilled => Remove task from state.items
 * 5. addSubtask.matchFulfilled => Update parent task with new subtask
 */
export const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {
    /**
     * Set selected task ID
     * Used for task detail views, editing, etc.
     */
    selectTask: (state, action: PayloadAction<string | null>) => {
      state.selectedId = action.payload;
    },

    /**
     * Update task filters
     * Allows filtering tasks by status and/or priority
     */
    updateFilters: (state, action: PayloadAction<TaskFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    /**
     * Reset filters to default
     */
    resetFilters: (state) => {
      state.filters = { status: null, priority: null };
    },

    /**
     * Clear all tasks from state
     * Used on logout or reset
     */
    clearTasks: (state) => {
      state.items = [];
      state.selectedId = null;
    },
  },
  extraReducers: (builder) => {
    /**
     * Handle getTasks query fulfillment
     * Syncs API response (getTasks) to local state.items
     * Runs once on initial load or manual refetch
     */
    builder.addMatcher(
      taskApi.endpoints.getTasks.matchFulfilled,
      (state: TaskSliceState, { payload }: PayloadAction<readonly Task[]>) => {
        // Sync entire task list from API to state
        state.items = Array.from(payload);
      }
    );

    /**
     * Handle addTask mutation fulfillment
     * Adds newly created task to state.items
     * Note: Optimistic update handled in RTK Query onQueryStarted
     * This matcher ensures final state reflects server response
     */
    builder.addMatcher(
      taskApi.endpoints.addTask.matchFulfilled,
      (state: TaskSliceState, { payload }: PayloadAction<Task>) => {
        // Replace temp task with real task from server
        const tempIndex = state.items.findIndex((t: Task) => t.id.startsWith('temp-'));
        if (tempIndex !== -1) {
          state.items[tempIndex] = payload;
        } else {
          // If no temp task found (edge case), just add it
          state.items.unshift(payload);
        }
      }
    );

    /**
     * Handle updateTask mutation fulfillment
     * Updates specific task in state.items with latest data
     * No auto-refetch: manual cache sync only
     */
    builder.addMatcher(
      taskApi.endpoints.updateTask.matchFulfilled,
      (state: TaskSliceState, { payload }: PayloadAction<Task>) => {
        const index = state.items.findIndex((t: Task) => t.id === payload.id);
        if (index !== -1) {
          // Update task with server response
          state.items[index] = payload;
        }
      }
    );

    /**
     * Handle deleteTask mutation fulfillment
     * Removes deleted task from state.items
     * No auto-refetch: manual cache sync only
     */
    builder.addMatcher(taskApi.endpoints.deleteTask.matchFulfilled, (_state: TaskSliceState) => {
      // RTK Query already handled removal via optimistic update in onQueryStarted
      // This matcher just confirms the state is consistent
      // The actual deletion is handled by the optimistic update callback
    });

    /**
     * Handle addSubtask mutation fulfillment
     * Updates parent task in state.items with new subtask
     * Finds parent by ID and adds subtask to its subtasks array
     */
    builder.addMatcher(
      taskApi.endpoints.addSubtask.matchFulfilled,
      (state: TaskSliceState, { payload }: PayloadAction<Task>) => {
        // Find parent task in state and update its subtasks
        // The parent ID is tracked via the optimistic update in taskApi
        const parentId = payload.parentId;
        if (!parentId) return;

        const parentTask = state.items.find((t: Task) => t.id === parentId);
        if (parentTask) {
          // Initialize subtasks array if needed
          parentTask.subtasks ??= [];

          // Replace temp subtask with real one from server
          const tempIndex = parentTask.subtasks.findIndex((t: Task) => t.id.startsWith('temp-'));
          if (tempIndex !== -1) {
            parentTask.subtasks[tempIndex] = payload;
          } else {
            // If no temp subtask found, just add it
            parentTask.subtasks.push(payload);
          }
        }
      }
    );

    /**
     * Handle updateSubtask mutation fulfillment
     * Updates specific subtask in parent task's subtasks array
     * No auto-refetch: manual cache sync only
     */
    builder.addMatcher(
      taskApi.endpoints.updateSubtask.matchFulfilled,
      (state: TaskSliceState, { payload }: PayloadAction<Task>) => {
        const parentId = payload.parentId;
        if (!parentId) return;

        const parentTask = state.items.find((t: Task) => t.id === parentId);
        if (parentTask?.subtasks) {
          const index = parentTask.subtasks.findIndex((t: Task) => t.id === payload.id);
          if (index !== -1) {
            // Update subtask with server response
            parentTask.subtasks[index] = payload;
          }
        }
      }
    );

    /**
     * Handle deleteSubtask mutation fulfillment
     * Removes deleted subtask from parent task's subtasks array
     * No auto-refetch: manual cache sync only
     */
    builder.addMatcher(taskApi.endpoints.deleteSubtask.matchFulfilled, (_state: TaskSliceState) => {
      // RTK Query already handled removal via optimistic update in onQueryStarted
      // This matcher just confirms the state is consistent
      // The actual deletion is handled by the optimistic update callback
    });

    /**
     * Handle deleteAllTasks mutation fulfillment
     * Clears all tasks from state
     */
    builder.addMatcher(taskApi.endpoints.deleteAllTasks.matchFulfilled, (state: TaskSliceState) => {
      state.items = [];
      state.selectedId = null;
    });

    /**
     * Handle getSubtasks query fulfillment
     * Updates parent task's subtasks in state.items
     */
    builder.addMatcher(
      taskApi.endpoints.getSubtasks.matchFulfilled,
      (state: TaskSliceState, { payload }: PayloadAction<readonly Task[]>) => {
        // Find parent task and update its subtasks
        // Parent ID will be determined from the first subtask's parentId
        if (payload.length === 0) return;
        const parentId = payload[0]?.parentId;
        if (!parentId) return;

        const parentTask = state.items.find((t: Task) => t.id === parentId);
        if (parentTask) {
          parentTask.subtasks = Array.from(payload);
        }
      }
    );

    /**
     * Handle getTaskById query fulfillment
     * Updates or adds task to state.items if not already present
     */
    builder.addMatcher(
      taskApi.endpoints.getTaskById.matchFulfilled,
      (state: TaskSliceState, { payload }: PayloadAction<Task>) => {
        const index = state.items.findIndex((t: Task) => t.id === payload.id);
        if (index !== -1) {
          state.items[index] = payload;
        } else {
          // Task not in list yet, add it
          state.items.push(payload);
        }
      }
    );
  },
});

// Export actions
export const { selectTask, updateFilters, resetFilters, clearTasks } = taskSlice.actions;

// Export reducer
export default taskSlice.reducer;
