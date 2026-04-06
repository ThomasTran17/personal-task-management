/**
 * Notification Manager
 * Manages notification state and business logic for handling urgent/reminder notifications
 */

import type { NotificationState, TaskNotificationStatus, NotificationPayload, Task } from '@/types';
import { sendNotification, formatTimeUntilDeadline, formatDueTime } from './notificationHelpers';
import { getTimeUntilDeadline, ONE_HOUR_MS, ONE_DAY_MS } from './deadlineHelpers';

/**
 * Global notification state - persists across re-renders
 * Tracks which tasks have been notified in each time window
 */
export const globalBrowserNotificationState: NotificationState = {
  oneHourNotified: new Set(),
  oneDayNotified: new Set(),
};

/**
 * Clear notification state for a task
 * Called when task is done, deadline passed, or no longer in notification window
 */
export const clearNotificationState = (taskId: string): void => {
  globalBrowserNotificationState.oneHourNotified.delete(taskId);
  globalBrowserNotificationState.oneDayNotified.delete(taskId);
};

/**
 * Handle urgent notification (< 1 hour until deadline)
 * Shows notification and marks task as notified
 */
export const handleUrgentNotification = (
  taskId: string,
  taskTitle: string,
  dueDate: string
): void => {
  if (globalBrowserNotificationState.oneHourNotified.has(taskId)) {
    return; // Already notified for this task
  }

  const dueTime = formatDueTime(dueDate);
  const payload: NotificationPayload = {
    title: 'Urgent Deadline!',
    body: `"${taskTitle}" deadline in less than 1 hour!\nDue at ${dueTime}`,
    tag: `urgent-${taskId}`,
    isUrgent: true,
  };

  sendNotification(payload);

  globalBrowserNotificationState.oneHourNotified.add(taskId);
  globalBrowserNotificationState.oneDayNotified.delete(taskId); // Clear day notification
};

/**
 * Handle reminder notification (1-24 hours until deadline)
 * Shows notification and marks task as notified
 */
export const handleReminderNotification = (
  taskId: string,
  taskTitle: string,
  timeUntilMs: number
): void => {
  if (globalBrowserNotificationState.oneDayNotified.has(taskId)) {
    return; // Already notified for this task
  }

  const hoursUntil = formatTimeUntilDeadline(timeUntilMs);
  const payload: NotificationPayload = {
    title: '📅 Deadline Reminder',
    body: `"${taskTitle}" deadline is coming up\nDue in ${hoursUntil} hours`,
    tag: `reminder-${taskId}`,
    isUrgent: false,
  };

  sendNotification(payload);

  globalBrowserNotificationState.oneDayNotified.add(taskId);
};

/**
 * Process notification for a single task
 * Determines if task needs urgent or reminder notification and handles appropriately
 *
 * @param task - Task object with id, title, dueDate, status
 * @param currentTime - Optional current time for testing purposes
 * @returns Object with isUrgent and isUpcoming status
 */
export const processTaskNotification = (
  task: Task,
  currentTime?: number
): TaskNotificationStatus => {
  if (!task.dueDate || task.status === 'DONE') {
    clearNotificationState(task.id);
    return { isUrgent: false, isUpcoming: false };
  }

  const timeUntilMs = getTimeUntilDeadline(task.dueDate, currentTime);

  // Guard clause: Skip if deadline passed
  if (timeUntilMs < 0) {
    clearNotificationState(task.id);
    return { isUrgent: false, isUpcoming: false };
  }

  const isUrgent = timeUntilMs > 0 && timeUntilMs < ONE_HOUR_MS;
  const isUpcoming = timeUntilMs >= ONE_HOUR_MS && timeUntilMs < ONE_DAY_MS;

  // Handle urgent notification
  if (isUrgent) {
    handleUrgentNotification(task.id, task.title, task.dueDate);
  } else {
    globalBrowserNotificationState.oneHourNotified.delete(task.id);
  }

  // Handle reminder notification
  if (isUpcoming) {
    handleReminderNotification(task.id, task.title, timeUntilMs);
  } else {
    globalBrowserNotificationState.oneDayNotified.delete(task.id);
  }

  return { isUrgent, isUpcoming };
};
