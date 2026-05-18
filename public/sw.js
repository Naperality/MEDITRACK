// public/sw.js

// 1. Listen for the backend push event
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
    tag: 'medication-alert', // Overwrites old notifications with this tag
    renotify: true            // Forces phone to vibrate/pop up every single time
  };

  // FORCE the system notification to show immediately, completely ignoring tab states
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 2. Listen for when the user taps the notification banner
self.addEventListener('notificationclick', (event) => {
  event.notification.close(); // Close the notification banner immediately

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If your app is already open in a tab, just bring it to the front
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      // If your app is completely closed, open a brand new window/tab
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url || '/patient-dashboard');
      }
    })
  );
});