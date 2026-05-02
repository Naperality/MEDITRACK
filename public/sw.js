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
    // Adding a tag prevents multiple notifications from stacking up 
    // if the user misses several in a row.
    tag: 'medication-alert',
    renotify: true
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a tab is already open, focus it instead of opening a new one
      for (const client of clientList) {
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});