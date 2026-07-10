self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request).catch(() => new Response('Offline', { status: 503 })));
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'ORDER_UPDATE' && event.data?.order) {
    const { id, status, branch_name, standby_reference } = event.data.order;
    let title, body, tag;
    if (status === 'accepted') {
      title = '✅ Order Accepted!';
      body = `Order #${id} at ${branch_name || 'store'} is ready.${standby_reference ? ' Ref: ' + standby_reference : ''} Time to head to the store!`;
      tag = `order-${id}-accepted`;
    } else if (status === 'rejected') {
      title = '❌ Order Rejected';
      body = `Order #${id} at ${branch_name || 'store'} was rejected.${event.data.order.reject_reason ? ' Reason: ' + event.data.order.reject_reason : ''}`;
      tag = `order-${id}-rejected`;
    } else if (status === 'fulfilled') {
      title = '🎉 Ready for Pickup!';
      body = `Order #${id} at ${branch_name || 'store'} is ready for pickup!`;
      tag = `order-${id}-fulfilled`;
    }
    if (title) {
      self.registration.showNotification(title, {
        body,
        tag,
        icon: '/genesislogo.png',
        badge: '/genesislogo.png',
        vibrate: [200, 100, 200],
        requireInteraction: true,
        data: { orderId: id, url: '/' },
      });
    }
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(clients.openWindow(url));
});
