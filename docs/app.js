// EPGTalk shared app helper: registers the offline service worker, adds the
// "✨ What's New" button (with a dot when there is news you haven't seen, from
// whatsnew.json) and an "Install app" button (Android/desktop) or
// Add-to-Home-Screen tips (iPhone/iPad).
(() => {
  const base = document.currentScript && document.currentScript.dataset.base || '';
  if ('serviceWorker' in navigator) navigator.serviceWorker.register(base + 'sw.js', { scope: base || './' }).catch(() => {});
  let lang = 'en';
  try { lang = localStorage.getItem('epgtalk-lang') || ''; } catch (e) {}
  if (lang !== 'en' && lang !== 'es') lang = (navigator.language || 'en').toLowerCase().startsWith('es') ? 'es' : 'en';
  const T = {
    en: { news: '✨ What\'s New', newsTitle: '✨ What\'s New on EPGTalk', close: 'Close', install: '📲 Install app', iosTitle: 'Install EPGTalk on your iPhone', ok: 'Got it',
          ios: 'In Safari, tap the <b>Share</b> button <span aria-hidden="true">⬆️</span>, then <b>Add to Home Screen</b>. EPGTalk opens like an app — full screen, and today\'s guide works offline.' },
    es: { news: '✨ Novedades', newsTitle: '✨ Novedades en EPGTalk', close: 'Cerrar', install: '📲 Instalar app', iosTitle: 'Instala EPGTalk en tu iPhone', ok: 'Entendido',
          ios: 'En Safari, toca el botón <b>Compartir</b> <span aria-hidden="true">⬆️</span> y luego <b>Agregar a pantalla de inicio</b>. EPGTalk se abre como una app — pantalla completa, y la guía de hoy funciona sin conexión.' },
  }[lang];
  function navSlot() { return document.querySelector('.nav-links') || document.querySelector('nav > span') || document.querySelector('nav'); }
  function addToNav(b) {
    const links = navSlot(); if (!links) return;
    const langBtn = links.querySelector('#lang');
    if (links.tagName === 'UL') { const li = document.createElement('li'); li.appendChild(b); links.appendChild(li); }
    else if (langBtn) links.insertBefore(b, langBtn); else links.appendChild(b);
  }
  // ── What's New ────────────────────────────────────────────────────────────
  const SEEN = 'epgtalk-news-seen';
  function esc(x) { return String(x).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
  function news() {
    if (document.body.dataset.noNews != null) return;
    fetch(base + 'whatsnew.json', { cache: 'no-cache' }).then(r => r.ok ? r.json() : null).then(j => {
      const list = (j && j.releases || []).slice(0, 4);
      if (!list.length || document.getElementById('newsBtn')) return;
      let seen = ''; try { seen = localStorage.getItem(SEEN) || ''; } catch (e) {}
      const b = document.createElement('button');
      b.id = 'newsBtn'; b.type = 'button'; b.className = 'lang notranslate'; b.setAttribute('translate', 'no');
      b.style.cssText = 'font:inherit;font-size:.8rem;color:#00BFFF;background:transparent;border:1px solid rgba(0,191,255,.35);' +
                        'border-radius:6px;padding:3px 8px;cursor:pointer;margin-left:6px;white-space:nowrap;position:relative';
      b.textContent = T.news;
      const dot = document.createElement('span');
      dot.style.cssText = 'position:absolute;top:-4px;right:-4px;width:10px;height:10px;border-radius:50%;background:#ff4d5e;box-shadow:0 0 8px #ff4d5e';
      const tog = document.querySelector('.nav-toggle'), dot2 = dot.cloneNode();       // also flag the ☰ menu button on phones
      if (seen !== list[0].id) {
        b.appendChild(dot); b.setAttribute('aria-label', T.news + ' •');
        if (tog) { tog.style.position = 'relative'; tog.appendChild(dot2); }
      }
      b.onclick = () => {
        try { localStorage.setItem(SEEN, list[0].id); } catch (e) {}
        dot.remove(); dot2.remove(); b.removeAttribute('aria-label');
        const d = document.createElement('dialog');
        d.style.cssText = 'max-width:520px;width:calc(100% - 32px);max-height:80vh;border:1px solid rgba(0,191,255,.3);border-radius:14px;background:#111827;color:#e2e8f0;padding:20px 22px;font-family:inherit';
        let h = '<h3 style="margin:0 0 12px;font-size:1.15rem">' + T.newsTitle + '</h3>';
        list.forEach((r, i) => {
          const x = r[lang] || r.en;
          h += '<div style="margin:0 0 16px' + (i ? ';opacity:.75' : '') + '"><div style="font-size:.78rem;color:#8899aa;margin-bottom:4px">' + esc(r.date || '') + '</div>' +
               '<div style="font-weight:700;margin-bottom:6px">' + esc(x.title) + '</div><ul style="margin:0;padding-left:20px;line-height:1.55;font-size:.92rem">' +
               (x.items || []).map(it => '<li>' + (it.link ? '<a href="' + esc(base + it.link) + '" style="color:#00BFFF">' + esc(it.text) + '</a>' : esc(it.text)) + '</li>').join('') + '</ul></div>';
        });
        h += '<button type="button" style="font:inherit;background:#00BFFF;color:#060918;border:0;border-radius:8px;padding:8px 14px;font-weight:700;cursor:pointer">' + T.close + '</button>';
        d.innerHTML = h;
        d.querySelector('button:last-child').onclick = () => d.close();
        d.addEventListener('close', () => d.remove());
        document.body.appendChild(d); d.showModal();
      };
      addToNav(b);
    }).catch(() => {});
  }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', news) : news();

  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  if (standalone) return;
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  let deferred = null;
  function button(onClick) {
    if (!navSlot() || document.getElementById('installBtn')) return;
    const b = document.createElement('button');
    b.id = 'installBtn'; b.type = 'button'; b.className = 'lang notranslate'; b.setAttribute('translate', 'no');
    b.textContent = T.install; b.onclick = onClick;
    b.style.cssText = 'font:inherit;font-size:.8rem;color:#00BFFF;background:transparent;border:1px solid rgba(0,191,255,.35);' +
                      'border-radius:6px;padding:3px 8px;cursor:pointer;margin-left:6px;white-space:nowrap';
    addToNav(b);
  }
  function iosHelp() {
    const d = document.createElement('dialog');
    d.style.cssText = 'max-width:340px;border:1px solid rgba(0,191,255,.3);border-radius:14px;background:#111827;color:#e2e8f0;padding:20px;font-family:inherit';
    d.innerHTML = '<h3 style="margin:0 0 8px;font-size:1.05rem">' + T.iosTitle + '</h3><p style="margin:0 0 14px;line-height:1.5;font-size:.92rem">' + T.ios +
                  '</p><button type="button" style="font:inherit;background:#00BFFF;color:#060918;border:0;border-radius:8px;padding:8px 14px;font-weight:700;cursor:pointer">' + T.ok + '</button>';
    d.querySelector('button').onclick = () => d.close();
    document.body.appendChild(d); d.showModal();
  }
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault(); deferred = e;
    button(async () => { deferred.prompt(); await deferred.userChoice; deferred = null; const b = document.getElementById('installBtn'); if (b) b.remove(); });
  });
  if (ios) document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', () => button(iosHelp)) : button(iosHelp);
})();
