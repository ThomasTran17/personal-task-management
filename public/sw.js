// Public service worker for handling push notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title || 'Deadline Reminder';
  const options = {
    body: data.body || 'You have an upcoming deadline',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: data.tag || 'deadline-notification',
    requireInteraction: data.requireInteraction || false,
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Focus existing window if available
      for (let i = 0; i < clientList.length; i++) {
        if (clientList[i].url === '/' && 'focus' in clientList[i]) {
          return clientList[i].focus();
        }
      }
      // Open new window if none exists
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
