/**
 * Hook to check if current user has permission to perform actions on a task
 * Uses the backend's permission logic: owner or participant can update
 */

import type { Task } from '@/types/task';
import { canUpdateTask } from '@/api/services/taskApi';
import { useGetProfileQuery } from '@/api/services/authApi';

/**
 * Hook to check task permissions for current user
 * @param task - The task to check permissions for
 * @returns Object with permission checks
 */
export function useTaskPermission(task?: Task | null) {
  const { data: currentUser } = useGetProfileQuery();

  if (!task || !currentUser) {
    return {
      canUpdate: false,
      canDelete: false,
      userId: null,
    };
  }

  const userId = currentUser.id;
  const isOwner = task.ownerId === userId;

  return {
    // Only owner and participants can update
    canUpdate: canUpdateTask(task, userId),
    // Only owner can delete
    canDelete: isOwner,
    userId,
  };
}
