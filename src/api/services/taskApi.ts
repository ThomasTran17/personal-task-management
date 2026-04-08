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
  readonly participantIds?: string[];
}

interface UpdateTaskPayload {
  readonly title?: string;
  readonly description?: string;
  readonly priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  readonly dueDate?: string | null;
  readonly status?: 'TODO' | 'IN_PROGRESS' | 'DONE';
  readonly participantIds?: string[];
  readonly subtasks?: Task[];
}

/**
 * Helper function to check if user has permission to update a task
 * Only owner and participants can update the task
 */
function canUpdateTask(task: Task, userId: string): boolean {
  const isOwner = task.ownerId === userId;
  const isParticipant = task.participantIds?.includes(userId) ?? false;
  return isOwner || isParticipant;
}

/**
 * Helper function to map TaskAttributes (API response) to Task (Redux store)
 * Keeps dates as ISO strings (no conversion to Date objects)
 * Handles nested subtasks recursively
 * Converts BE TaskResponseDto format to FE Task format
 */
function mapTaskAttributes(attrs: TaskAttributes & { id?: string }, id?: string): Task {
  const taskId = id ?? attrs.id! ?? '';
  const task: Task = {
    id: taskId,
    title: attrs.title,
    description: attrs.description ?? '',
    status: attrs.status,
    priority: attrs.priority,
    ownerId: attrs.ownerId,
    parentId: attrs.parentId ?? undefined,
    participantIds: attrs.participantIds ? Array.from(attrs.participantIds) : [],
    dueDate: attrs.dueDate, // Keep as ISO string - no conversion to Date
    createdAt: attrs.createdAt, // Keep as ISO string - no conversion to Date
    updatedAt: attrs.updatedAt, // Keep as ISO string - no conversion to Date
  };

  // Handle nested subtasks recursively
  if (attrs.subtasks && Array.isArray(attrs.subtasks)) {
    task.subtasks = attrs.subtasks.map((subtaskAttrs: TaskAttributes & { id?: string }) =>
      mapTaskAttributes(subtaskAttrs, subtaskAttrs.id)
    );
  }

  return task;
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
     * Includes nested subtasks from server (backend already loads them)
     */
    getTasks: builder.query<readonly Task[], void>({
      query: () => '/tasks/all',
      transformResponse: (response: JsonApiResponse<TaskAttributes>): readonly Task[] => {
        // Handle array of resources
        if (!Array.isArray(response.data)) {
          throw new Error('getTasks response should contain array of task resources');
        }

        return response.data.map((resource: JsonApiResource<TaskAttributes>) =>
          mapTaskAttributes(resource.attributes, resource.id)
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
          mapTaskAttributes(resource.attributes, resource.id)
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
     * Includes nested subtasks from server
     */
    getTaskById: builder.query<Task, string>({
      query: (id) => `/tasks/${id}`,
      transformResponse: (response: JsonApiResponse<TaskAttributes>): Task => {
        // Handle single resource
        if (Array.isArray(response.data)) {
          throw new Error('getTaskById response should contain single task resource');
        }

        const resource = response.data as JsonApiResource<TaskAttributes>;
        return mapTaskAttributes(resource.attributes, resource.id);
      },
      providesTags: (result) => (result ? [{ type: 'Task' as const, id: result.id }] : []),
    }),

    /**
     * Create new task
     *
     * NO invalidatesTags: Manual cache sync via taskSlice extraReducers
     * This prevents redundant GET /tasks/all after create
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
        return mapTaskAttributes(resource.attributes, resource.id);
      },
      // Optimistic update: add task to cache before server response
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        // Get current tasks from cache
        const patchResult = dispatch(
          taskApi.util.updateQueryData('getTasks', undefined, (draft) => {
            const tasksDraft = draft as Task[];
            const now = new Date().toISOString();
            const newTask: Task = {
              id: `temp-${Date.now()}`,
              title: arg.title,
              description: arg.description ?? '',
              priority: arg.priority,
              status: arg.status ?? 'TODO',
              ownerId: '', // Will be updated from server
              parentId: undefined,
              participantIds: [],
              createdAt: now,
              updatedAt: now,
            };

            if (arg.dueDate) {
              newTask.dueDate = arg.dueDate;
            }

            tasksDraft.push(newTask);
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
     * Updates parent task's subtasks array in getTasks cache
     *
     * NO invalidatesTags: Manual cache sync via taskSlice extraReducers
     * This prevents redundant GET /tasks/all after create
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
        return mapTaskAttributes(resource.attributes, resource.id);
      },
      // Optimistic update: add subtask to parent task's subtasks array in getTasks cache
      async onQueryStarted({ parentId, payload }, { dispatch, queryFulfilled }) {
        // Update getTasks cache to add subtask to parent task
        const patchResult = dispatch(
          taskApi.util.updateQueryData('getTasks', undefined, (draft) => {
            const parentTask = draft.find((t) => t.id === parentId);
            if (parentTask) {
              const now = new Date().toISOString();
              const newSubtask: Task = {
                id: `temp-${Date.now()}`,
                title: payload.title,
                description: payload.description ?? '',
                priority: payload.priority,
                status: payload.status ?? 'TODO',
                ownerId: '', // Will be updated from server
                parentId,
                participantIds: [],
                createdAt: now,
                updatedAt: now,
              };

              if (payload.dueDate) {
                newSubtask.dueDate = payload.dueDate;
              }

              parentTask.subtasks ??= [];

              parentTask.subtasks.push(newSubtask);
            }
          })
        );

        try {
          const { data } = await queryFulfilled;
          // Update with real ID from server
          dispatch(
            taskApi.util.updateQueryData('getTasks', undefined, (draft) => {
              const parentTask = draft.find((t) => t.id === parentId);
              if (parentTask?.subtasks) {
                const index = parentTask.subtasks.findIndex((t) => t.id.startsWith('temp-'));
                if (index !== -1) {
                  parentTask.subtasks[index] = data;
                }
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
     * Update task or subtask (unified mutation)
     * Only owner and participants can update the task
     * Backend validates permission and returns 403 if denied
     *
     * For parent tasks: { id: taskId, updates: UpdateTaskPayload }
     * For subtasks: { id: subtaskId, parentId: parentTaskId, updates: UpdateTaskPayload }
     *
     * NO invalidatesTags: Manual cache sync via taskSlice extraReducers
     * This prevents redundant GET /tasks/all after update
     */
    updateTask: builder.mutation<
      Task,
      { id: string; updates: UpdateTaskPayload; parentId?: string }
    >({
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
        return mapTaskAttributes(resource.attributes, resource.id);
      },
      // Optimistic update: modify task or subtask in cache before server response
      async onQueryStarted({ id, updates, parentId }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          taskApi.util.updateQueryData('getTasks', undefined, (draft) => {
            if (parentId) {
              // Update subtask in parent's subtasks array
              const parentTask = draft.find((t) => t.id === parentId);
              if (parentTask?.subtasks) {
                const subtask = parentTask.subtasks.find((t) => t.id === id);
                if (subtask) {
                  Object.assign(subtask, updates, { updatedAt: new Date().toISOString() });
                }
              }
            } else {
              // Update task in root tasks array
              const task = draft.find((t) => t.id === id);
              if (task) {
                Object.assign(task, updates, { updatedAt: new Date().toISOString() });
              }
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
     *
     * NO invalidatesTags: Manual cache sync via taskSlice extraReducers
     * This prevents redundant GET /tasks/all after delete
     */
    deleteTask: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: 'DELETE',
      }),
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
     * Delete subtask from parent task
     *
     * NO invalidatesTags: Manual cache sync via taskSlice extraReducers
     * This prevents redundant GET /tasks/all after delete
     */
    deleteSubtask: builder.mutation<{ message: string }, { parentId: string; subtaskId: string }>({
      query: ({ parentId, subtaskId }) => ({
        url: `/tasks/${parentId}/subtasks/${subtaskId}`,
        method: 'DELETE',
      }),
      // Optimistic update: remove subtask from cache before server response
      async onQueryStarted({ parentId, subtaskId }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          taskApi.util.updateQueryData('getTasks', undefined, (draft) => {
            const parentTask = draft.find((t) => t.id === parentId);
            if (parentTask?.subtasks) {
              const index = parentTask.subtasks.findIndex((t) => t.id === subtaskId);
              if (index !== -1) {
                parentTask.subtasks.splice(index, 1);
              }
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
/**
 * Note on permission checks:
 * - Backend validates all permissions (owner/participant for update operations)
 * - Frontend can use the canUpdateTask helper for UI visibility
 * - Backend returns 403 Forbidden if user lacks permission
 */
export const {
  useGetTasksQuery,
  useGetSubtasksQuery,
  useGetTaskByIdQuery,
  useAddTaskMutation,
  useAddSubtaskMutation,
  useDeleteSubtaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useDeleteAllTasksMutation,
  util: { resetApiState },
} = taskApi;

// Export helper functions for permission checks
export { canUpdateTask };
