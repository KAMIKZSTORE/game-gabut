// Service Worker untuk notifikasi background
self.addEventListener('install', event => {
    self.skipWaiting();
    console.log('Service Worker installed');
});

self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
    console.log('Service Worker activated');
});

// Handle klik notifikasi
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    const action = event.action;
    const data = event.notification.data;
    
    if (action === 'close') {
        return;
    }
    
    // Buka/focus ke website
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(clientList => {
            if (clientList.length > 0) {
                let client = clientList[0];
                for (let i = 0; i < clientList.length; i++) {
                    if (clientList[i].focused) {
                        client = clientList[i];
                    }
                }
                return client.focus();
            }
            return clients.openWindow(data?.url || '/');
        })
    );
});

// Handle push dari server (untuk notifikasi server-side)
self.addEventListener('push', event => {
    const data = event.data.json();
    
    const options = {
        body: data.body,
        icon: data.icon || 'https://cdn-icons-png.flaticon.com/512/3239/3239952.png',
        badge: data.badge || 'https://cdn-icons-png.flaticon.com/512/3239/3239952.png',
        image: data.image,
        tag: data.tag || 'push-notification',
        requireInteraction: data.requireInteraction || false,
        actions: data.actions || [],
        data: data.data || {}
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});
