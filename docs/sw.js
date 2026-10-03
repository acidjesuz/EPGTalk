// EPGTalk service worker — makes the site installable and usable offline.
// Same-site requests: network first (always fresh), saved copy when offline.
// Other sites (ESPN live scores, fonts, logos) are left to the browser.
const VERSION = 'epgtalk-v4';
const PAGES = VERSION + '-pages', DATA = VERSION + '-data';
const CORE = ['./', 'index.html', 'now.html', 'tvguide.html', 'live.html', 'events.html', 'tonight.html', 'playlist.html', 'channels.html',
              'setup.html', 'tv.html', 'api.html', 'antenna.html', 'calendars/', 'compat.js', 'app.js', 'watch.js', 'whatsnew.json', 'manifest.webmanifest',
              'icons/icon-192.png', 'icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(PAGES).then(c => Promise.allSettled(CORE.map(u => c.add(u)))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => !k.startsWith(VERSION)).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

async function pruneGuideData(index) {
  // keep only the days listed in tvguide/index.json
  const keep = new Set();
  for (const g of index.guides || []) for (const d of g.days || []) keep.add(g.key + '/' + d);
  const cache = await caches.open(DATA);
  for (const req of await cache.keys()) {
    const m = req.url.match(/tvguide\/([a-z]+)\/(\d{4}-\d\d-\d\d)(\.d)?\.json/);
    if (m && !keep.has(m[1] + '/' + m[2])) await cache.delete(req);
  }
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(new URL(self.registration.scope).pathname)) return;
  if (url.pathname.endsWith('.ics') || /\.xml(\.gz)?$/.test(url.pathname)) return;     // calendars & guides: always live
  const isData = url.pathname.includes('/tvguide/');
  e.respondWith((async () => {
    const cache = await caches.open(isData ? DATA : PAGES);
    try {
      const res = await fetch(req);
      if (res.ok) {
        cache.put(req, res.clone());
        if (url.pathname.endsWith('/tvguide/index.json')) res.clone().json().then(pruneGuideData).catch(() => {});
      }
      return res;
    } catch (err) {
      const hit = await cache.match(req, { ignoreSearch: true });
      if (hit) return hit;
      if (req.mode === 'navigate') return (await caches.match('tvguide.html')) || Response.error();
      throw err;
    }
  })());
});
