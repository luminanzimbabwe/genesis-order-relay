const CACHE = 'genesis-order-relay-v1';
const SHELL = [
  '/',
  '/index.html',
  '/styles.css',
  '/manifest.json',
  '/genesislogo.png'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // API calls: network-first, cache fallback
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(
      fetch(request).then((res) => {
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(request, clone));
        return res;
      }).catch(() => caches.match(request))
    );
    return;
  }

  // Navigation: serve cached index.html, update cache in background
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request).then((res) => {
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put('/index.html', clone));
        return res;
      }).catch(() => caches.match('/index.html').then((r) => r || caches.match('/')))
    );
    return;
  }

  // Static assets: cache-first, update from network
  e.respondWith(
    caches.match(request).then((cached) => {
      const fetched = fetch(request).then((res) => {
        if (res && res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(request, clone));
        }
        return res;
      });
      return cached || fetched;
    })
  );
});

// Push notification handling
self.addEventListener('message', (e) => {
  if (e.data?.type === 'ORDER_UPDATE' && e.data?.order) {
    const { id, status, branch_name, standby_reference } = e.data.order;
    let title, body, tag;
    if (status === 'accepted') {
      title = '✅ Order Accepted!';
      body = `Order #${id} at ${branch_name || 'store'} is ready.${standby_reference ? ' Ref: ' + standby_reference : ''} Time to head to the store!`;
      tag = `order-${id}-accepted`;
    } else if (status === 'rejected') {
      title = '❌ Order Rejected';
      body = `Order #${id} at ${branch_name || 'store'} was rejected.${e.data.order.reject_reason ? ' Reason: ' + e.data.order.reject_reason : ''}`;
      tag = `order-${id}-rejected`;
    } else if (status === 'fulfilled') {
      title = '🎉 Ready for Pickup!';
      body = `Order #${id} at ${branch_name || 'store'} is ready for pickup!`;
      tag = `order-${id}-fulfilled`;
    }
    if (title) {
      self.registration.showNotification(title, {
        body, tag,
        icon: '/genesislogo.png',
        badge: '/genesislogo.png',
        vibrate: [200, 100, 200],
        requireInteraction: true,
        data: { orderId: id, url: '/' },
      });
    }
  }
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = e.notification.data?.url || '/';
  e.waitUntil(clients.openWindow(url));
});
