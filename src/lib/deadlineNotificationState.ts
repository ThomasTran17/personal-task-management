/**
 * Deadline Notification State Management
 * Manages toast notification state for approaching deadlines
 */

import { NotificationState } from '@/types/notification';

/**
 * Global toast notification state - persists across re-renders
 * Tracks which tasks have been notified in each time window
 */
export const globalToastNotificationState: NotificationState = {
  oneHourNotified: new Set(),
  oneDayNotified: new Set(),
};

export const ONE_HOUR_WINDOW = {
  /**
   * Clear urgent notification state when deadline is no longer urgent
   */
  clearIfExpired: (taskId: string, timeUntilMs: number): void => {
    if (timeUntilMs >= 60 * 60 * 1000) {
      globalToastNotificationState.oneHourNotified.delete(taskId);
    }
  },
};

export const ONE_DAY_WINDOW = {
  /**
   * Clear reminder notification state when no longer in 1-24 hour window
   */
  clearIfExpired: (taskId: string, timeUntilMs: number): void => {
    const ONE_HOUR_MS = 60 * 60 * 1000;
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    if (timeUntilMs >= ONE_DAY_MS || timeUntilMs < ONE_HOUR_MS) {
      globalToastNotificationState.oneDayNotified.delete(taskId);
    }
  },
};

export const EXPIRED_DEADLINE = {
  /**
   * Clear all notification state when deadline has passed
   */
  clearAll: (taskId: string, timeUntilMs: number): void => {
    if (timeUntilMs < 0) {
      globalToastNotificationState.oneHourNotified.delete(taskId);
      globalToastNotificationState.oneDayNotified.delete(taskId);
    }
  },
};
