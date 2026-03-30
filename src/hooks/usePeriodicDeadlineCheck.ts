'use client';

import { useEffect, useRef } from 'react';
import { useTaskStore } from '@/store/taskStore';
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
  const { tasks } = useTaskStore();

  // Process a single task for deadline notifications
  const processTaskDeadline = (task: any): void => {
    // Guard clause: Skip if task is done or no deadline
    if (!task.dueDate || task.status === 'done') {
      return;
    }

    const timeUntilMs = getTimeUntilDeadline(task.dueDate);

    handleUrgentDeadlineNotification(task.id, task.title, task.dueDate, timeUntilMs);
    handleReminderDeadlineNotification(task.id, task.title, timeUntilMs);
    clearExpiredNotifications(task.id, timeUntilMs);
    clearUrgentNotificationIfExpired(task.id, timeUntilMs);
    clearReminderNotificationIfExpired(task.id, timeUntilMs);
  };

  // Main check function
  const checkAllDeadlines = (): void => {
    tasks.forEach(processTaskDeadline);
    // Emit signal to update all TaskCard UIs with current deadline status
    deadlineUpdateSignal.emit();
  };

  useEffect(() => {
    // Run initial check
    checkAllDeadlines();

    // Setup interval
    intervalRef.current = setInterval(checkAllDeadlines, CHECK_INTERVAL);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [tasks]);

  // Manual check function (exposed for external use)
  const manualCheck = (): void => {
    checkAllDeadlines();
  };

  return { manualCheck };
};
