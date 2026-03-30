/**
 * Task Endpoints
 * Defines all task-related API operations with automatic cache invalidation
 */

import { baseApi } from './baseApi';
import type { Task } from '@/types/task';

interface CreateTaskPayload {
  readonly title: string;
  readonly description?: string;
  readonly priority: 'low' | 'medium' | 'high';
  readonly dueDate?: string;
  readonly status?: 'todo' | 'in-progress' | 'done';
}

interface UpdateTaskPayload {
  readonly title?: string;
  readonly description?: string;
  readonly priority?: 'low' | 'medium' | 'high';
  readonly dueDate?: string;
  readonly status?: 'todo' | 'in-progress' | 'done';
}

/**
 * Task API endpoints
 * Uses providesTags for query cache and invalidatesTags for mutation cache invalidation
 */
export const taskApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get all tasks with optional filtering
     */
    getTasks: builder.query<readonly Task[], void>({
      query: () => '/tasks',
      transformResponse: (response: unknown): readonly Task[] => {
        const data = response as { readonly data: readonly Task[] };
        // Transform date strings to Date objects
        return data.data.map((task) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        }));
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Task' as const, id })),
              { type: 'Task' as const, id: 'LIST' },
            ]
          : [{ type: 'Task' as const, id: 'LIST' }],
    }),

    /**
     * Get single task by ID
     */
    getTaskById: builder.query<Task, string>({
      query: (id) => `/tasks/${id}`,
      transformResponse: (response: unknown): Task => {
        const data = response as { readonly data: Task };
        return {
          ...data.data,
          createdAt: new Date(data.data.createdAt),
          updatedAt: new Date(data.data.updatedAt),
          dueDate: data.data.dueDate ? new Date(data.data.dueDate) : undefined,
        };
      },
      providesTags: (result) => (result ? [{ type: 'Task' as const, id: result.id }] : []),
    }),

    /**
     * Create new task
     * Invalidates task list cache after mutation
     */
    addTask: builder.mutation<Task, CreateTaskPayload>({
      query: (payload) => ({
        url: '/tasks',
        method: 'POST',
        body: payload,
      }),
      transformResponse: (response: unknown): Task => {
        const data = response as { readonly data: Task };
        return {
          ...data.data,
          createdAt: new Date(data.data.createdAt),
          updatedAt: new Date(data.data.updatedAt),
          dueDate: data.data.dueDate ? new Date(data.data.dueDate) : undefined,
        };
      },
      invalidatesTags: [{ type: 'Task', id: 'LIST' }],
      // Optimistic update: add task to cache before server response
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        // Get current tasks from cache
        const patchResult = dispatch(
          taskApi.util.updateQueryData('getTasks', undefined, (draft) => {
            const newTask: Task = {
              id: `temp-${Date.now()}`,
              title: arg.title,
              description: arg.description,
              priority: arg.priority,
              status: arg.status ?? 'todo',
              dueDate: arg.dueDate ? new Date(arg.dueDate) : undefined,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            // @ts-expect-error - draft is mutable in RTK Query
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            draft.push(newTask);
          })
        );

        try {
          const { data } = await queryFulfilled;
          // Update with real ID from server
          dispatch(
            taskApi.util.updateQueryData('getTasks', undefined, (draft) => {
              const index = draft.findIndex((t) => t.id.startsWith('temp-'));
              if (index !== -1) {
                // @ts-expect-error - draft is mutable in RTK Query
                draft[index] = data;
              }
            })
          );
        } catch {
          // Revert on error
          patchResult.undo();
        }
      },
    }),

    /**
     * Update task
     * Invalidates specific task and list cache
     */
    updateTask: builder.mutation<Task, { id: string; updates: UpdateTaskPayload }>({
      query: ({ id, updates }) => ({
        url: `/tasks/${id}`,
        method: 'PUT',
        body: updates,
      }),
      transformResponse: (response: unknown): Task => {
        const data = response as { readonly data: Task };
        return {
          ...data.data,
          createdAt: new Date(data.data.createdAt),
          updatedAt: new Date(data.data.updatedAt),
          dueDate: data.data.dueDate ? new Date(data.data.dueDate) : undefined,
        };
      },
      invalidatesTags: (result, _error, { id }) => [
        { type: 'Task', id },
        { type: 'Task', id: 'LIST' },
      ],
      // Optimistic update: modify task in cache before server response
      async onQueryStarted({ id, updates }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          taskApi.util.updateQueryData('getTasks', undefined, (draft) => {
            const task = draft.find((t) => t.id === id);
            if (task) {
              Object.assign(task, updates, { updatedAt: new Date() });
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          // Revert on error
          patchResult.undo();
        }
      },
    }),

    /**
     * Delete task
     * Invalidates task list cache
     */
    deleteTask: builder.mutation<{ id: string }, string>({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Task', id: 'LIST' }],
      // Optimistic update: remove task from cache before server response
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          taskApi.util.updateQueryData('getTasks', undefined, (draft) => {
            const index = draft.findIndex((t) => t.id === id);
            if (index !== -1) {
              // @ts-expect-error - draft is mutable in RTK Query
              // eslint-disable-next-line @typescript-eslint/no-unsafe-call
              draft.splice(index, 1);
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          // Revert on error
          patchResult.undo();
        }
      },
    }),

    /**
     * Batch delete tasks
     * Invalidates task list cache
     */
    deleteAllTasks: builder.mutation<{ count: number }, void>({
      query: () => ({
        url: '/tasks/batch/delete',
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Task', id: 'LIST' }],
    }),
  }),
});

// Export auto-generated hooks
export const {
  useGetTasksQuery,
  useGetTaskByIdQuery,
  useAddTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useDeleteAllTasksMutation,
  util: { resetApiState },
} = taskApi;
