'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';

interface NotificationStatus {
  apiSupported: boolean;
  permission: NotificationPermission;
  serviceWorkerActive: boolean;
  serviceWorkerUrl: string | null;
}

/**
 * Debug component to check notification system status
 * Useful for debugging notification issues
 */
export const NotificationDebug = () => {
  const [status, setStatus] = useState<NotificationStatus>({
    apiSupported: false,
    permission: 'default',
    serviceWorkerActive: false,
    serviceWorkerUrl: null,
  });

  useEffect(() => {
    const checkStatus = async () => {
      const apiSupported = 'Notification' in window;
      const permission = apiSupported ? Notification.permission : 'default';
      
      let serviceWorkerActive = false;
      let serviceWorkerUrl = null;

      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          serviceWorkerActive = !!registration.active;
          serviceWorkerUrl = registration.active?.scriptURL || null;
        } catch (error) {
          // Service Worker check failed
        }
      }

      setStatus({
        apiSupported,
        permission,
        serviceWorkerActive,
        serviceWorkerUrl,
      });
    };

    checkStatus();
  }, []);

  const requestPermission = async () => {
    if (!status.apiSupported) {
      alert('Notification API not supported');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setStatus((prev) => ({ ...prev, permission }));
    } catch (error) {
      // Error requesting permission
    }
  };

  const testNotification = () => {
    if (status.permission !== 'granted') {
      alert('Notification permission not granted');
      return;
    }

    try {
      const notification = new Notification('Test Notification', {
        body: 'This is a test notification from the debug component',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
      });
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (error) {
      // Error creating test notification
    }
  };

  return (
    <Card className="p-4 bg-gray-50 border-2 border-gray-300">
      <div className="space-y-3">
        <h3 className="font-bold text-sm">🔍 Notification Debug Info</h3>
        
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${status.apiSupported ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>API Supported: <strong>{status.apiSupported ? 'Yes' : 'No'}</strong></span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${
              status.permission === 'granted' ? 'bg-green-500' : 
              status.permission === 'denied' ? 'bg-red-500' : 
              'bg-yellow-500'
            }`} />
            <span>Permission: <strong>{status.permission}</strong></span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${status.serviceWorkerActive ? 'bg-green-500' : 'bg-orange-500'}`} />
            <span>Service Worker: <strong>{status.serviceWorkerActive ? 'Active' : 'Inactive'}</strong></span>
          </div>
          
          {status.serviceWorkerUrl && (
            <div className="text-xs text-gray-600 truncate">
              SW URL: {status.serviceWorkerUrl}
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={requestPermission}
            className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Request Permission
          </button>
          
          <button
            onClick={testNotification}
            disabled={status.permission !== 'granted'}
            className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
          >
            Test Notification
          </button>
        </div>
      </div>
    </Card>
  );
};
