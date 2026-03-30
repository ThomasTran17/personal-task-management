import { useEffect, useRef } from 'react';
import { useGetTasksQuery } from '@/api/services/taskApi';
import { deadlineUpdateSignal } from '@/lib/deadlineUpdateSignal';
import { setGlobalSwRegistration, updateBrowserBadge } from '@/lib/notificationHelpers';
import { processTaskNotification } from '@/lib/notificationManager';

/**
 * Hook to setup browser push notifications
 * Listens to deadline signals from usePeriodicDeadlineCheck for synchronized timing
 */
export const useBrowserNotifications = () => {
  const permissionRef = useRef<NotificationPermission>('default');
  const { data: tasks = [] } = useGetTasksQuery();

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
          console.error('Error requesting notification permission:', error);
        }
      }

      // Register service worker
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          setGlobalSwRegistration(registration);
        } catch {
          // Service Worker registration failed
        }
      }
    };

    void setupNotifications();
  }, []); // Run only once on mount

  // Effect: Subscribe to signal from periodic check
  useEffect(() => {
    const sendBrowserNotifications = (currentTime?: number): void => {
      // Guard clause: Check if Notification API is available and granted
      if (!('Notification' in window) || Notification.permission !== 'granted') {
        return;
      }

      let urgentCount = 0;
      let upcomingCount = 0;

      tasks.forEach((task) => {
        const { isUrgent, isUpcoming } = processTaskNotification(task, currentTime);
        if (isUrgent) urgentCount++;
        if (isUpcoming) upcomingCount++;
      });

      updateBrowserBadge(urgentCount, upcomingCount);
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
export { requestNotificationPermission } from '@/lib/notificationPermissions';

/**
 * Utility function to check if notifications are supported and enabled
 */
export { areNotificationsEnabled } from '@/lib/notificationPermissions';
