// Service Worker لتفعيل زرار التثبيت (PWA)
self.addEventListener('install', (e) => {
    console.log('[Service Worker] الأبلكيشن بيتثبت');
});

self.addEventListener('fetch', (e) => {
    // بيسمح للموقع يشتغل حتى لو النت ضعيف لحظة الفتح
    e.respondWith(fetch(e.request).catch(() => new Response('Offline')));
});
