// public/sw.js
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'Medication Reminder', body: 'Time to take your meds!' };
  
  const options = {
    body: data.body,
    icon: '/icon-192x192.png', // Make sure this exists in your public folder
    badge: '/favicon.ico',
    vibrate: [200, 100, 200],
    data: { url: '/patient-dashboard' }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});