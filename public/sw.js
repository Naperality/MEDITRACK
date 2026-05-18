// public/sw.js

self.addEventListener('push', (event) => {
  let data = { title: 'Medication Reminder', body: 'Time to take your meds!', url: '/patient-dashboard' };

  try {
    if (event.data) {
      // Safely parse incoming WebPush payload
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    }
  } catch (e) {
    console.error('Push data parsing failed:', e);
  }

  const options = {
    body: data.body,
    icon: '/android-chrome-192x192.png',
    badge: '/favicon.ico',
    vibrate: [300, 100, 300, 100, 300],
    data: {
      url: data.url // Crucial: Needs to be mapped correctly
    },
    tag: 'medication-alert',
    renotify: true
  };

  // BROADCAST to any currently open browser tabs/installed app windows
  self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
    clientList.forEach((client) => {
      client.postMessage({
        type: 'TRIGGER_ALARM',
        payload: data
      });
    });
  });

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          // Send another command to ensure the alarm screen triggers on focus
          client.postMessage({ type: 'FOCUS_ALARM' });
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(event.notification.data.url || '/patient-dashboard');
      }
    })
  );
});