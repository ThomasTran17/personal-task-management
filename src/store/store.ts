import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { baseApi } from './api/baseApi';

/**
 * Redux Store Configuration with RTK Query
 * Uses RTK Query for server-side state management
 * All task data is fetched on-demand and cached automatically
 */
export const store = configureStore({
  reducer: {
    // RTK Query API reducer
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // RTK Query actions are non-serializable by design
        ignoredActions: [baseApi.util.resetApiState.type],
        ignoredPaths: [baseApi.reducerPath],
      },
    }).concat(baseApi.middleware),
});

// Enable refetchOnFocus and refetchOnReconnect behaviors
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
