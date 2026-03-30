import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import type { Storage } from 'redux-persist';
import taskReducer from './slices/taskSlice';
import type { Task } from '@/types/task';

interface PersistedState {
  state: {
    tasks: {
      tasks: Task[];
      filter: string;
    };
  };
  version: number;
}

// Custom storage wrapper to handle Date object serialization
const customStorage: Storage = {
  getItem: (key: string): Promise<string | null> => {
    return Promise.resolve().then(() => {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const parsed = JSON.parse(item) as PersistedState;
      return JSON.stringify({
        state: {
          ...parsed.state,
          tasks: {
            ...parsed.state.tasks,
            tasks: (parsed.state.tasks.tasks as unknown[]).map((task: unknown) => {
              const t = task as Record<string, unknown>;
              return {
                ...t,
                createdAt: t.createdAt ? new Date(t.createdAt as string) : undefined,
                updatedAt: t.updatedAt ? new Date(t.updatedAt as string) : undefined,
                dueDate: t.dueDate ? new Date(t.dueDate as string) : undefined,
              };
            }),
          },
        },
        version: parsed.version,
      });
    });
  },
  setItem: (key: string, value: string): Promise<void> => {
    return Promise.resolve().then(() => {
      const parsed = JSON.parse(value) as PersistedState;
      localStorage.setItem(
        key,
        JSON.stringify({
          state: {
            ...parsed.state,
            tasks: {
              ...parsed.state.tasks,
              tasks: (parsed.state.tasks.tasks as unknown[]).map((task: unknown) => {
                const t = task as Task;
                return {
                  ...t,
                  createdAt: t.createdAt?.toISOString(),
                  updatedAt: t.updatedAt?.toISOString(),
                  dueDate: t.dueDate?.toISOString(),
                };
              }),
            },
          },
          version: parsed.version,
        })
      );
    });
  },
  removeItem: (key: string): Promise<void> => {
    return Promise.resolve().then(() => {
      localStorage.removeItem(key);
    });
  },
};

const persistConfig = {
  key: 'task-storage',
  storage: customStorage,
};

const persistedTaskReducer = persistReducer(persistConfig, taskReducer);

export const store = configureStore({
  reducer: {
    tasks: persistedTaskReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredPaths: ['tasks.tasks'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
