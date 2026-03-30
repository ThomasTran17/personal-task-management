/**
 * Notification Helper Functions
 * Contains utility functions for formatting and updating browser notifications
 */

import { NotificationPayload } from '@/types/notification';

// Global service worker registration - persists across re-renders
export let globalSwRegistration: ServiceWorkerRegistration | null = null;

/**
 * Set global service worker registration
 */
export const setGlobalSwRegistration = (
  registration: ServiceWorkerRegistration | null
): void => {
  globalSwRegistration = registration;
};

/**
 * Send notification via Service Worker or Notification API
 */
export const sendNotification = (payload: NotificationPayload): void => {
  try {
    if (globalSwRegistration) {
      globalSwRegistration.showNotification(payload.title, {
        body: payload.body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: payload.tag,
        requireInteraction: payload.isUrgent,
      });
    } else {
      new Notification(payload.title, {
        body: payload.body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: payload.tag,
        requireInteraction: payload.isUrgent,
      });
    }
  } catch (error) {
    // Error sending notification - silently fail
  }
};

/**
 * Format time in milliseconds to hours string
 */
export const formatTimeUntilDeadline = (timeUntilMs: number): string => {
  const hoursUntil = Math.floor(timeUntilMs / (60 * 60 * 1000));
  return hoursUntil.toString();
};

/**
 * Format due date to localized time string (HH:mm)
 */
export const formatDueTime = (dueDate: string): string => {
  return new Date(dueDate).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Update browser badge with notification count and page title
 */
export const updateBrowserBadge = (
  urgentCount: number,
  upcomingCount: number
): void => {
  const badgeCount = urgentCount + upcomingCount;
  const baseTitle = 'Personal Task Management';

  // Try setAppBadge first (Chrome, Edge, Firefox)
  if ('setAppBadge' in navigator) {
    if (badgeCount > 0) {
      navigator.setAppBadge(badgeCount);
    } else {
      navigator.clearAppBadge();
    }
  }

  // Update page title with badge count
  const newTitle = badgeCount > 0 ? `(${badgeCount}) ${baseTitle}` : baseTitle;
  if (document.title !== newTitle) {
    document.title = newTitle;
  }
};
