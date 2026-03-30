/**
 * Deadline Notification Processor
 * Contains business logic for handling deadline notifications
 */

import { ONE_HOUR_MS, ONE_DAY_MS } from '@/lib/deadlineHelpers';
import { globalToastNotificationState } from '@/lib/deadlineNotificationState';
import {
  showUrgentToast,
  showReminderToast,
  getHoursUntilDeadline,
} from '@/lib/toastNotificationHelpers';

/**
 * Handle urgent notification (< 1 hour until deadline)
 * Shows toast and marks task as notified
 */
export const handleUrgentDeadlineNotification = (
  taskId: string,
  taskTitle: string,
  dueDate: string,
  timeUntilMs: number
): void => {
  // Guard clause: Not in urgent window
  if (timeUntilMs <= 0 || timeUntilMs >= ONE_HOUR_MS) {
    return;
  }

  // Guard clause: Already notified
  if (globalToastNotificationState.oneHourNotified.has(taskId)) {
    return;
  }

  showUrgentToast(taskTitle, dueDate);
  globalToastNotificationState.oneHourNotified.add(taskId);
  globalToastNotificationState.oneDayNotified.delete(taskId); // Clear day notification
};

/**
 * Handle reminder notification (1-24 hours until deadline)
 * Shows toast and marks task as notified
 */
export const handleReminderDeadlineNotification = (
  taskId: string,
  taskTitle: string,
  timeUntilMs: number
): void => {
  // Guard clause: Not in reminder window
  if (timeUntilMs <= ONE_HOUR_MS || timeUntilMs >= ONE_DAY_MS) {
    return;
  }

  // Guard clause: Already notified
  if (globalToastNotificationState.oneDayNotified.has(taskId)) {
    return;
  }

  const hoursUntil = getHoursUntilDeadline(timeUntilMs);
  showReminderToast(taskTitle, hoursUntil);
  globalToastNotificationState.oneDayNotified.add(taskId);
};

/**
 * Clear notification state when deadline has passed
 */
export const clearExpiredNotifications = (
  taskId: string,
  timeUntilMs: number
): void => {
  if (timeUntilMs < 0) {
    globalToastNotificationState.oneHourNotified.delete(taskId);
    globalToastNotificationState.oneDayNotified.delete(taskId);
  }
};

/**
 * Clear urgent notification when no longer urgent
 */
export const clearUrgentNotificationIfExpired = (
  taskId: string,
  timeUntilMs: number
): void => {
  if (timeUntilMs >= ONE_HOUR_MS) {
    globalToastNotificationState.oneHourNotified.delete(taskId);
  }
};

/**
 * Clear reminder notification when no longer in window
 */
export const clearReminderNotificationIfExpired = (
  taskId: string,
  timeUntilMs: number
): void => {
  if (timeUntilMs >= ONE_DAY_MS || timeUntilMs < ONE_HOUR_MS) {
    globalToastNotificationState.oneDayNotified.delete(taskId);
  }
};
