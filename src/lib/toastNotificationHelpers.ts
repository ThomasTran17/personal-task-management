/**
 * Toast Deadline Notification Helpers
 * Contains utility functions for showing toast notifications for approaching deadlines
 */

import { toast } from 'sonner';

/**
 * Show urgent deadline toast (< 1 hour)
 */
export const showUrgentToast = (taskTitle: string, dueDate: string): void => {
  const dueTime = new Date(dueDate).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  toast.error(`Urgent: "${taskTitle}" deadline in less than 1 hour!`, {
    description: `Due at ${dueTime}`,
    duration: 5000,
  });
};

/**
 * Show reminder deadline toast (1-24 hours)
 */
export const showReminderToast = (taskTitle: string, hoursUntil: number): void => {
  toast.info(`Reminder: "${taskTitle}" deadline coming up`, {
    description: `Due ${hoursUntil} hours from now`,
    duration: 4000,
  });
};

/**
 * Calculate hours until deadline (rounded down)
 */
export const getHoursUntilDeadline = (timeUntilMs: number): number => {
  return Math.floor(timeUntilMs / (60 * 60 * 1000));
};
