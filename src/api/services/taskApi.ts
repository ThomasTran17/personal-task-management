/**
 * Task Endpoints
 * Defines all task-related API operations with automatic cache invalidation
 * Implements JSON:API standard with transformResponse for data extraction
 */

import { baseApi } from '@/api';
import type { JsonApiResource, JsonApiResponse, TaskAttributes } from '@/api';
import type { Task } from '@/types/task';

interface CreateTaskPayload {
  readonly title: string;
  readonly description?: string;
  readonly priority: 'LOW' | 'MEDIUM' | 'HIGH';
  readonly dueDate?: string;
  readonly status?: 'TODO' | 'IN_PROGRESS' | 'DONE';
}

interface UpdateTaskPayload {
  readonly title?: string;
  readonly description?: string;
  readonly priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  readonly dueDate?: string;
  readonly status?: 'TODO' | 'IN_PROGRESS' | 'DONE';
}

/**
 * Helper function to transform TaskAttributes (string dates) to Task (Date objects)
 * Converts BE TaskResponseDto format to FE Task format
 */
function transformTaskAttributes(attrs: TaskAttributes, id: string): Task {
  return {
    id,
    title: attrs.title,
    description: attrs.description ?? '',
    status: attrs.status,
    priority: attrs.priority,
    ownerId: attrs.ownerId,
    parentId: attrs.parentId ?? undefined,
    participantIds: attrs.participantIds ? Array.from(attrs.participantIds) : [],
    dueDate: attrs.dueDate ? new Date(attrs.dueDate) : undefined,
    createdAt: new Date(attrs.createdAt),
    updatedAt: new Date(attrs.updatedAt),
  };
}

/**
 * Task API endpoints
 * Uses providesTags for query cache and invalidatesTags for mutation cache invalidation
 * Implements JSON:API transformResponse pattern
 */
export const taskApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get all primary tasks for the current user
     * Transforms JSON:API array response to Task array
     */
    getTasks: builder.query<readonly Task[], void>({
      query: () => '/tasks/primary',
      transformResponse: (response: JsonApiResponse<TaskAttributes>): readonly Task[] => {
        // Handle array of resources
        if (!Array.isArray(response.data)) {
          throw new Error('getTasks response should contain array of task resources');
        }

        return response.data.map((resource: JsonApiResource<TaskAttributes>) =>
          transformTaskAttributes(resource.attributes, resource.id)
        );
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
     * Get all subtasks for a parent task
     * Transforms JSON:API array response to Task array
     */
    getSubtasks: builder.query<readonly Task[], string>({
      query: (parentId) => `/tasks/${parentId}/subtasks`,
      transformResponse: (response: JsonApiResponse<TaskAttributes>): readonly Task[] => {
        // Handle array of resources
        if (!Array.isArray(response.data)) {
          throw new Error('getSubtasks response should contain array of task resources');
        }

        return response.data.map((resource: JsonApiResource<TaskAttributes>) =>
          transformTaskAttributes(resource.attributes, resource.id)
        );
      },
      providesTags: (result, _error, parentId) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Task' as const, id })),
              { type: 'Task' as const, id: `SUBTASKS-${parentId}` },
            ]
          : [{ type: 'Task' as const, id: `SUBTASKS-${parentId}` }],
    }),

    /**
     * Get single task by ID
     * Transforms JSON:API single resource response to Task
     */
    getTaskById: builder.query<Task, string>({
      query: (id) => `/tasks/${id}`,
      transformResponse: (response: JsonApiResponse<TaskAttributes>): Task => {
        // Handle single resource
        if (Array.isArray(response.data)) {
          throw new Error('getTaskById response should contain single task resource');
        }

        const resource = response.data as JsonApiResource<TaskAttributes>;
        return transformTaskAttributes(resource.attributes, resource.id);
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
      transformResponse: (response: JsonApiResponse<TaskAttributes>): Task => {
        // Handle single resource
        if (Array.isArray(response.data)) {
          throw new Error('addTask response should contain single task resource');
        }

        const resource = response.data as JsonApiResource<TaskAttributes>;
        return transformTaskAttributes(resource.attributes, resource.id);
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
              description: arg.description ?? '',
              priority: arg.priority,
              status: arg.status ?? 'TODO',
              ownerId: '', // Will be updated from server
              parentId: undefined,
              participantIds: [],
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            if (arg.dueDate) {
              newTask.dueDate = new Date(arg.dueDate);
            }

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
     * Create subtask for a parent task
     * Invalidates subtasks cache for the parent
     */
    addSubtask: builder.mutation<Task, { parentId: string; payload: CreateTaskPayload }>({
      query: ({ parentId, payload }) => ({
        url: `/tasks/${parentId}/subtasks`,
        method: 'POST',
        body: payload,
      }),
      transformResponse: (response: JsonApiResponse<TaskAttributes>): Task => {
        // Handle single resource
        if (Array.isArray(response.data)) {
          throw new Error('addSubtask response should contain single task resource');
        }

        const resource = response.data as JsonApiResource<TaskAttributes>;
        return transformTaskAttributes(resource.attributes, resource.id);
      },
      invalidatesTags: (result, _error, { parentId }) => [
        { type: 'Task', id: `SUBTASKS-${parentId}` },
      ],
      // Optimistic update: add subtask to cache before server response
      async onQueryStarted({ parentId, payload }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          taskApi.util.updateQueryData('getSubtasks', parentId, (draft) => {
            const newSubtask: Task = {
              id: `temp-${Date.now()}`,
              title: payload.title,
              description: payload.description ?? '',
              priority: payload.priority,
              status: payload.status ?? 'TODO',
              ownerId: '', // Will be updated from server
              parentId,
              participantIds: [],
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            if (payload.dueDate) {
              newSubtask.dueDate = new Date(payload.dueDate);
            }

            // @ts-expect-error - draft is mutable in RTK Query
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            draft.push(newSubtask);
          })
        );

        try {
          const { data } = await queryFulfilled;
          // Update with real ID from server
          dispatch(
            taskApi.util.updateQueryData('getSubtasks', parentId, (draft) => {
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
      transformResponse: (response: JsonApiResponse<TaskAttributes>): Task => {
        // Handle single resource
        if (Array.isArray(response.data)) {
          throw new Error('updateTask response should contain single task resource');
        }

        const resource = response.data as JsonApiResource<TaskAttributes>;
        return transformTaskAttributes(resource.attributes, resource.id);
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
     * Delete task (cascade deletes all subtasks)
     * Invalidates task list cache
     */
    deleteTask: builder.mutation<{ message: string }, string>({
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
  useGetSubtasksQuery,
  useGetTaskByIdQuery,
  useAddTaskMutation,
  useAddSubtaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useDeleteAllTasksMutation,
  util: { resetApiState },
} = taskApi;
