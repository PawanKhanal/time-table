// sw.js
self.addEventListener("install", event => {
    console.log("Service Worker installed");
});

self.addEventListener("fetch", event => {
    console.log("Fetch intercepted for:", event.request.url);
});
