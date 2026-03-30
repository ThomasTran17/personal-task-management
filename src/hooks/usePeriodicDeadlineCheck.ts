import { useEffect, useRef, useCallback } from 'react';
import { useGetTasksQuery } from '@/store/api/taskApi';
import type { Task } from '@/types/task';
import { getTimeUntilDeadline } from '@/lib/deadlineHelpers';
import { deadlineUpdateSignal } from '@/lib/deadlineUpdateSignal';
import {
  handleUrgentDeadlineNotification,
  handleReminderDeadlineNotification,
  clearExpiredNotifications,
  clearUrgentNotificationIfExpired,
  clearReminderNotificationIfExpired,
} from '@/lib/deadlineNotificationProcessor';

const CHECK_INTERVAL = 60000; // Check every 1 minute

/**
 * Hook to setup periodic deadline checking and notifications
 * Checks every minute for tasks with approaching deadlines
 * Notifications persist even without page reload
 */
export const usePeriodicDeadlineCheck = () => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { data: tasks = [] } = useGetTasksQuery();

  // Process a single task for deadline notifications
  const processTaskDeadline = (task: Task): void => {
    // Guard clause: Skip if task is done or no deadline
    if (!task.dueDate || task.status === 'done') {
      return;
    }

    const timeUntilMs = getTimeUntilDeadline(task.dueDate);
    const dueDateString = task.dueDate.toISOString();

    handleUrgentDeadlineNotification(task.id, task.title, dueDateString, timeUntilMs);
    handleReminderDeadlineNotification(task.id, task.title, timeUntilMs);
    clearExpiredNotifications(task.id, timeUntilMs);
    clearUrgentNotificationIfExpired(task.id, timeUntilMs);
    clearReminderNotificationIfExpired(task.id, timeUntilMs);
  };

  useEffect(() => {
    // Main check function - defined inside effect to capture latest tasks
    const checkAllDeadlines = (): void => {
      tasks.forEach(processTaskDeadline);
      // Emit signal to update all TaskCard UIs with current deadline status
      deadlineUpdateSignal.emit();
    };

    // Run initial check
    void checkAllDeadlines();

    // Setup interval
    intervalRef.current = setInterval(() => void checkAllDeadlines(), CHECK_INTERVAL);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [tasks]);

  // Manual check function (exposed for external use)
  const manualCheck = useCallback((): void => {
    tasks.forEach(processTaskDeadline);
    deadlineUpdateSignal.emit();
  }, [tasks]);

  return { manualCheck };
};
