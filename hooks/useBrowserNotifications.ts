'use client';

import { useEffect, useRef } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { getTimeUntilDeadline, ONE_HOUR_MS, ONE_DAY_MS } from '@/lib/deadlineHelpers';
import { deadlineUpdateSignal } from '@/lib/deadlineUpdateSignal';

interface NotificationState {
  oneHourNotified: Set<string>;
  oneDayNotified: Set<string>;
}

// Global notification state - persists across re-renders
const globalBrowserNotificationState: NotificationState = {
  oneHourNotified: new Set(),
  oneDayNotified: new Set(),
};

// Global service worker registration - persists across re-renders
let globalSwRegistration: ServiceWorkerRegistration | null = null;

const CHECK_INTERVAL = 60000; // Check every 1 minute

/**
 * Hook to setup browser push notifications
 * Listens to deadline signals from usePeriodicDeadlineCheck for synchronized timing
 */
export const useBrowserNotifications = () => {
  const permissionRef = useRef<NotificationPermission>('default');
  const { tasks } = useTaskStore();

  // Setup notification permission and service worker (one time only)
  useEffect(() => {
    const setupNotifications = async () => {
      // Check if Notification API is supported
      if (!('Notification' in window)) {
        return;
      }

      permissionRef.current = Notification.permission;

      // Request permission if not yet decided
      if (Notification.permission === 'default') {
        try {
          const permission = await Notification.requestPermission();
          permissionRef.current = permission;
        } catch (error) {
          // Error requesting permission
        }
      }

      // Register service worker
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          globalSwRegistration = registration;
        } catch (error) {
          // Service Worker registration failed
        }
      }
    };

    setupNotifications();
  }, []); // Run only once on mount

  // Effect: Subscribe to signal from periodic check
  useEffect(() => {
    // Function to send browser notifications and update badge
    const sendBrowserNotifications = (currentTime?: number) => {
      // Check if Notification API is available
      if (!('Notification' in window)) {
        return;
      }

      // Check current permission (not just the ref which may be stale)
      if (Notification.permission !== 'granted') {
        return;
      }

      let urgentCount = 0;
      let upcomingCount = 0;

      tasks.forEach((task) => {
        // Skip if task is done or no deadline
        if (!task.dueDate || task.status === 'done') {
          return;
        }

        const timeUntil = getTimeUntilDeadline(task.dueDate, currentTime);

        // Check for 1 hour urgent notification
        if (timeUntil > 0 && timeUntil < ONE_HOUR_MS) {
          urgentCount++;

          if (!globalBrowserNotificationState.oneHourNotified.has(task.id)) {
            try {
            const dueTime = new Date(task.dueDate).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            // Use Service Worker to show notification if available, otherwise fallback to Notification API
            if (globalSwRegistration) {
              globalSwRegistration.showNotification(`⚠️ Urgent Deadline!`, {
                body: `"${task.title}" deadline in less than 1 hour!\nDue at ${dueTime}`,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: `urgent-${task.id}`,
                requireInteraction: true,
              });
            } else {
              const notification = new Notification(`⚠️ Urgent Deadline!`, {
                body: `"${task.title}" deadline in less than 1 hour!\nDue at ${dueTime}`,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: `urgent-${task.id}`,
                requireInteraction: true,
              });
            }              globalBrowserNotificationState.oneHourNotified.add(task.id);
              globalBrowserNotificationState.oneDayNotified.delete(task.id); // Clear day notification
            } catch (error) {
              // Error sending urgent notification
            }
          }
        } else {
          // Clear urgent notification if no longer urgent
          globalBrowserNotificationState.oneHourNotified.delete(task.id);
        }

        // Check for 24 hour soon notification (but not if already notified for 1 hour)
        if (timeUntil > ONE_HOUR_MS && timeUntil < ONE_DAY_MS) {
          upcomingCount++;

          if (!globalBrowserNotificationState.oneDayNotified.has(task.id)) {
            try {
            const hoursUntil = Math.floor(timeUntil / (60 * 60 * 1000));

            // Use Service Worker to show notification if available, otherwise fallback to Notification API
            if (globalSwRegistration) {
              globalSwRegistration.showNotification(`📅 Deadline Reminder`, {
                body: `"${task.title}" deadline is coming up\nDue in ${hoursUntil} hours`,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: `reminder-${task.id}`,
                requireInteraction: false,
              });
            } else {
              const notification = new Notification(`📅 Deadline Reminder`, {
                body: `"${task.title}" deadline is coming up\nDue in ${hoursUntil} hours`,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: `reminder-${task.id}`,
                requireInteraction: false,
              });
            }              globalBrowserNotificationState.oneDayNotified.add(task.id);
            } catch (error) {
              // Error sending reminder notification
            }
          }
        } else if (timeUntil >= ONE_DAY_MS || timeUntil < ONE_HOUR_MS) {
          // Clear day notification if no longer in the 1-24hr window
          globalBrowserNotificationState.oneDayNotified.delete(task.id);
        }

        // Clean up notification state when deadline has passed
        if (timeUntil < 0) {
          globalBrowserNotificationState.oneHourNotified.delete(task.id);
          globalBrowserNotificationState.oneDayNotified.delete(task.id);
        }
      });

    // Update browser tab badge
    const badgeCount = urgentCount + upcomingCount;

    // Try setAppBadge first (Chrome, Edge, Firefox)
      if ('setAppBadge' in navigator) {
        if (badgeCount > 0) {
          navigator.setAppBadge(badgeCount);
        } else {
          navigator.clearAppBadge();
        }
      }

      // Fallback: Update page title with badge count
      const baseTitle = 'Personal Task Management';
      if (badgeCount > 0) {
        const newTitle = `(${badgeCount}) ${baseTitle}`;
        if (document.title !== newTitle) {
          document.title = newTitle;
        }
      } else {
        if (document.title !== baseTitle) {
          document.title = baseTitle;
        }
      }
    };
    
    // Subscribe to signal from periodic check
    const unsubscribe = deadlineUpdateSignal.subscribe((payload) => {
      sendBrowserNotifications(payload.currentTime);
    });

    // Also run initial check
    sendBrowserNotifications();

    // Cleanup
    return () => {
      unsubscribe();
    };
  }, [tasks]);
};

/**
 * Utility function to request notification permission
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

/**
 * Utility function to check if notifications are supported and enabled
 */
export const areNotificationsEnabled = (): boolean => {
  return (
    'Notification' in window &&
    Notification.permission === 'granted'
  );
};
