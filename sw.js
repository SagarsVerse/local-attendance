const CACHE="attendance-v1";
const ASSETS=[
  "./","./index.html","./css/style.css","./js/app.js","./js/database.js","./js/attendance.js","./js/employees.js","./js/reports.js","./js/settings.js",
  "./pages/employees.html","./pages/attendance.html","./pages/reports.html","./pages/settings.html","./manifest.json",
  "./assets/icons/icon-192.png","./assets/icons/icon-512.png"
];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(cache=>cache.put(e.request,copy));return r}).catch(()=>caches.match("./index.html"))))});
