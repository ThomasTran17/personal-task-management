import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { baseApi } from '@/api';
import taskReducer from './taskSlice';

/**
 * Redux Store Configuration with RTK Query + Redux Slices
 *
 * Architecture:
 * - taskSlice: Local-first state management (items, selectedId, filters)
 * - baseApi: RTK Query for server-side caching with optimistic updates
 * - Integration: extraReducers in taskSlice sync mutations/queries to local state
 *
 * Workflow:
 * 1. Query (getTasks) => Cache + taskSlice.items (via extraReducers)
 * 2. Mutation (updateTask) => Optimistic update in RTK Query + taskSlice sync
 * 3. No invalidatesTags for mutations => Zero redundant GET requests
 * 4. Manual cache sync via taskSlice extraReducers for consistency
 */
export const store = configureStore({
  reducer: {
    // Local-first task slice
    task: taskReducer,
    // RTK Query API reducer
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // RTK Query actions are non-serializable by design
        ignoredActions: [baseApi.util.resetApiState.type],
        ignoredActionPaths: [
          'payload.createdAt',
          'payload.updatedAt',
          'payload.dueDate',
          /^payload\.\d+\.createdAt$/,
          /^payload\.\d+\.updatedAt$/,
          /^payload\.\d+\.dueDate$/,
          'meta.baseQueryMeta.request',
          'meta.baseQueryMeta.response',
          'meta.baseQueryMeta',
          /^payload\.patches\.\d+\.value$/,
          'payload.patches',
        ],
        ignoredPaths: [baseApi.reducerPath, /createdAt$/, /updatedAt$/, /dueDate$/],
      },
    }).concat(baseApi.middleware),
});

// Enable refetchOnFocus and refetchOnReconnect behaviors
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
