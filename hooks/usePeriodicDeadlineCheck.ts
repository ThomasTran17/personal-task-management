'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useTaskStore } from '@/store/taskStore';
import { getTimeUntilDeadline, ONE_HOUR_MS, ONE_DAY_MS } from '@/lib/deadlineHelpers';
import { deadlineUpdateSignal } from '@/lib/deadlineUpdateSignal';

interface NotificationState {
  oneHourNotified: Set<string>;
  oneDayNotified: Set<string>;
}

// Global notification state - persists across re-renders
const globalNotificationState: NotificationState = {
  oneHourNotified: new Set(),
  oneDayNotified: new Set(),
};

const CHECK_INTERVAL = 60000; // Check every 1 minute

/**
 * Hook to setup periodic deadline checking and notifications
 * Checks every minute for tasks with approaching deadlines
 * Notifications persist even without page reload
 */
export const usePeriodicDeadlineCheck = () => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { tasks } = useTaskStore();

  useEffect(() => {
    // Function to check deadlines
    const checkDeadlines = () => {
      tasks.forEach((task) => {
        // Skip if task is done or no deadline
        if (!task.dueDate || task.status === 'done') {
          return;
        }

        const timeUntil = getTimeUntilDeadline(task.dueDate);

        // Check for 1 hour urgent notification
        if (timeUntil > 0 && timeUntil < ONE_HOUR_MS) {
          if (!globalNotificationState.oneHourNotified.has(task.id)) {
            toast.error(
              `⚠️ Urgent: "${task.title}" deadline in less than 1 hour!`,
              {
                description: `Due at ${new Date(task.dueDate).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}`,
                duration: 5000,
              }
            );
            globalNotificationState.oneHourNotified.add(task.id);
            globalNotificationState.oneDayNotified.delete(task.id); // Clear day notification since we're urgent
            // Emit signal to update TaskCard UI immediately
            deadlineUpdateSignal.emit();
          }
        } else {
          // Clear urgent notification if no longer urgent
          globalNotificationState.oneHourNotified.delete(task.id);
        }

        // Check for 24 hour soon notification (but not if already notified for 1 hour)
        if (timeUntil > ONE_HOUR_MS && timeUntil < ONE_DAY_MS) {
          if (!globalNotificationState.oneDayNotified.has(task.id)) {
            toast.info(
              `📅 Reminder: "${task.title}" deadline coming up`,
              {
                description: `Due ${Math.floor(timeUntil / (60 * 60 * 1000))} hours from now`,
                duration: 4000,
              }
            );
            globalNotificationState.oneDayNotified.add(task.id);
            // Emit signal to update TaskCard UI immediately
            deadlineUpdateSignal.emit();
          }
        } else if (timeUntil >= ONE_DAY_MS || timeUntil < ONE_HOUR_MS) {
          // Clear day notification if no longer in the 1-24hr window
          globalNotificationState.oneDayNotified.delete(task.id);
        }

        // Clean up notification state when deadline has passed
        if (timeUntil < 0) {
          globalNotificationState.oneHourNotified.delete(task.id);
          globalNotificationState.oneDayNotified.delete(task.id);
        }
      });

      // After checking all tasks, emit signal to update all TaskCard UIs
      // This ensures TaskCards always show the current deadline status
      deadlineUpdateSignal.emit();
    };

    // Run initial check
    checkDeadlines();

    // Setup interval
    intervalRef.current = setInterval(checkDeadlines, CHECK_INTERVAL);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [tasks]);

  // Expose function to manually trigger check (optional)
  const manualCheck = () => {
    const checkDeadlines = () => {
      tasks.forEach((task) => {
        if (!task.dueDate || task.status === 'done') {
          return;
        }

        const timeUntil = getTimeUntilDeadline(task.dueDate);

        if (
          timeUntil > 0 &&
          timeUntil < ONE_HOUR_MS &&
          !globalNotificationState.oneHourNotified.has(task.id)
        ) {
          toast.error(
            `⚠️ Urgent: "${task.title}" deadline in less than 1 hour!`,
            {
              description: `Due at ${new Date(task.dueDate).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}`,
              duration: 5000,
            }
          );
          globalNotificationState.oneHourNotified.add(task.id);
        }

        if (
          timeUntil > ONE_HOUR_MS &&
          timeUntil < ONE_DAY_MS &&
          !globalNotificationState.oneDayNotified.has(task.id)
        ) {
          toast.info(
            `📅 Reminder: "${task.title}" deadline coming up`,
            {
              description: `Due ${Math.floor(timeUntil / (60 * 60 * 1000))} hours from now`,
              duration: 4000,
            }
          );
          globalNotificationState.oneDayNotified.add(task.id);
        }

        if (timeUntil < 0) {
          globalNotificationState.oneHourNotified.delete(task.id);
          globalNotificationState.oneDayNotified.delete(task.id);
        }
      });
    };
    checkDeadlines();
  };

  return { manualCheck };
};
