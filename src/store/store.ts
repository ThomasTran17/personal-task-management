import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { baseApi } from '@/api';
import taskReducer from './taskSlice';
import authReducer from './authSlice';

/**
 * Redux Store Configuration with RTK Query + Redux Slices
 *
 * Architecture:
 * - authSlice: Auth state management (user, token, isAuthenticated)
 * - taskSlice: Local-first state management (items, selectedId, filters)
 * - baseApi: RTK Query for server-side caching with optimistic updates
 * - Integration: extraReducers in slices sync mutations/queries to local state
 *
 * Workflow:
 * 1. Login/Register → onQueryStarted (token saved) → matchFulfilled (sync authSlice)
 * 2. GetProfile → matchFulfilled (sync user in authSlice)
 * 3. Query (getTasks) → Cache + taskSlice.items (via extraReducers)
 * 4. Mutation (updateTask) → Optimistic update in RTK Query + taskSlice sync
 */
export const store = configureStore({
  reducer: {
    // Auth slice for user authentication
    auth: authReducer,
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
