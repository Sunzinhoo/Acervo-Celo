const CACHE_NAME = 'acervo-celo-v2';
const urlsToCache = ['/'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// Recebe mensagem do admin.html e mostra notificação mesmo com a aba fechada
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'NOVA_SOLICITACAO') {
    const { nome, whatsapp } = event.data;
    self.registration.showNotification('🔔 Nova solicitação — Acervo Celo', {
      body: `${nome} (${whatsapp}) está aguardando confirmação.`,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'solicitacao-' + Date.now(),
      requireInteraction: true,
      vibrate: [200, 100, 200],
      actions: [
        { action: 'abrir', title: '✅ Ver agora' },
        { action: 'fechar', title: 'Ignorar' }
      ]
    });
  }
});

// Ao clicar na notificação, abre ou foca a aba do admin
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'fechar') return;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.includes('admin') && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow('/admin.html');
    })
  );
});
