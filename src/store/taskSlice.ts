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

export interface TaskFilters {
  searchQuery?: string;
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE' | null;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | null;
}

export interface TaskSliceState {
  selectedId: string | null;
  filters: TaskFilters;
}

const initialState: TaskSliceState = {
  selectedId: null,
  filters: {
    searchQuery: '',
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

    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.filters.searchQuery = action.payload;
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
      state.filters = initialState.filters;
    },

    /**
     * Clear all tasks from state
     * Used on logout or reset
     */
    clearTasks: (state) => {
      state.selectedId = null;
      state.filters = initialState.filters;
    },
  },
});

// Export actions
export const { selectTask, updateFilters, resetFilters, clearTasks, setSearchQuery } =
  taskSlice.actions;

// Export reducer
export default taskSlice.reducer;
