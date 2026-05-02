const CACHE_NAME='global-pulse-v1.0.1';
const urlsToCache=[
'/',
'/index.html',
'/styles-v2.css',
'/app-v2.js',
'/data.js',
'/logo.svg',
'/alert-critical.mp3',
'/alert-high.mp3',
'/manifest.json',
'https://unpkg.com/globe.gl',
'https://fonts.googleapis.com',
'https://fonts.gstatic.com'
];
self.addEventListener('install',(event)=>{
event.waitUntil(
caches.open(CACHE_NAME)
.then((cache)=>cache.addAll(urlsToCache))
.then(()=>self.skipWaiting())
);
});
self.addEventListener('activate',(event)=>{
event.waitUntil(
caches.keys().then((cacheNames)=>{
return Promise.all(
cacheNames.map((cacheName)=>{
if(cacheName!==CACHE_NAME){
return caches.delete(cacheName);
}
})
);
}).then(()=>self.clients.claim())
);
});
self.addEventListener('fetch',(event)=>{
if(event.request.url.includes('/api/')){
event.respondWith(
fetch(event.request)
.then((response)=>{
const responseClone=response.clone();
caches.open(CACHE_NAME).then((cache)=>{
cache.put(event.request,responseClone);
});
return response;
})
.catch(()=>{
return caches.match(event.request);
})
);
}else{
event.respondWith(
caches.match(event.request)
.then((response)=>{
if(response){
return response;
}
return fetch(event.request).then((response)=>{
if(!response||response.status!==200||response.type==='error'){
return response;
}
const responseToCache=response.clone();
caches.open(CACHE_NAME).then((cache)=>{
cache.put(event.request,responseToCache);
});
return response;
});
})
);
}
});
self.addEventListener('message',(event)=>{
if(event.data&&event.data.type==='SKIP_WAITING'){
self.skipWaiting();
}
});