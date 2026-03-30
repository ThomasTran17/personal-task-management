import { useEffect } from 'react';
import { useGetTasksQuery } from '@/store/api/taskApi';
import { getTimeUntilDeadline, ONE_HOUR_MS, ONE_DAY_MS } from '@/lib/deadlineHelpers';

/**
 * Hook to update page title with badge count of approaching deadlines
 * Shows format: (X) Personal Task Management
 */
export const useTitleBadge = () => {
  const { data: tasks = [] } = useGetTasksQuery();

  useEffect(() => {
    // Calculate counts
    let urgentCount = 0;
    let upcomingCount = 0;

    tasks.forEach((task) => {
      // Skip if task is done or no deadline
      if (!task.dueDate || task.status === 'done') {
        return;
      }

      const timeUntil = getTimeUntilDeadline(task.dueDate);

      // Count urgent tasks (< 1 hour)
      if (timeUntil > 0 && timeUntil < ONE_HOUR_MS) {
        urgentCount++;
      }

      // Count upcoming tasks (1-24 hours)
      if (timeUntil > ONE_HOUR_MS && timeUntil < ONE_DAY_MS) {
        upcomingCount++;
      }
    });

    // Update title
    const badgeCount = urgentCount + upcomingCount;
    const baseTitle = 'Personal Task Management';
    const newTitle = badgeCount > 0 ? `(${badgeCount}) ${baseTitle}` : baseTitle;

    document.title = newTitle;
  }, [tasks]);
};
