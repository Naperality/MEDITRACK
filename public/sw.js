// public/sw.js
self.addEventListener('push', (event) => {
  let data = { title: 'Medication Reminder', body: 'Time to take your meds!' };

  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    console.error('Push data parsing failed:', e);
  }

  const options = {
    body: data.body,
    icon: '/android-chrome-192x192.png',
    badge: '/favicon.ico',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/patient-dashboard'
    },
    tag: 'medication-alert',
    renotify: true
  };

  // Logic to prevent double notifications
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // Check if any instance of your app is currently open and visible to the user
      const isAppOpenAndVisible = clientList.some(client => {
        return client.visibilityState === 'visible';
      });

      if (isAppOpenAndVisible) {
        // The user is actively looking at the app.
        // We let the MedicationReminder.tsx component handle the notification (Toast).
        console.log("App is currently visible. Background notification suppressed.");
        return; 
      }

      // If the app is closed, minimized, or the screen is locked, show the system notification.
      return self.registration.showNotification(data.title, options);
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a tab is already open, focus it instead of opening a new one
      for (const client of clientList) {
        // Use a relative path check or match against the data URL
        if ('focus' in client) {
          return client.focus();
        }
      }
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url || '/patient-dashboard');
      }
    })
  );
});