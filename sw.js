// رقم الإصدار (لما تعدل في اللعبة مستقبلاً، ادخل هنا خليها v2 وبعدين v3 وهكذا)
const CACHE_NAME = 'qaada-game-v1';

// 1. تثبيت الأبلكيشن وتخطي الانتظار
self.addEventListener('install', (e) => {
    self.skipWaiting(); // بيجبر الأبلكيشن يتحدث فوراً من غير ما يستنى
});

// 2. تنظيف الملفات القديمة (بيشتغل أوتوماتيك أول ما تغير رقم الإصدار)
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('[Service Worker] بيمسح الكاش القديم');
                        return caches.delete(cache); 
                    }
                })
            );
        })
    );
});

// 3. جلب الداتا وتشغيل اللعبة
self.addEventListener('fetch', (e) => {
    e.respondWith(
        fetch(e.request).catch(() => caches.match(e.request))
    );
});
