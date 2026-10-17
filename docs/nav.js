// EPGTalk shared menu: turns each page's long row of links into
//   🔎 Ask · TV Guide · Live Sports · (✨ What's New) · Español · ☰ Menu
// and a grouped panel (Watch / Sports / Set up & help / More) behind ☰.
// Load it after the page's own script and before app.js:
//   <script src="nav.js" data-base=""></script>   (data-base="../" for pages in a sub-folder)
// Written in old-style JavaScript so it also runs on older TV boxes and phones.
(function () {
  var me = document.currentScript;
  var base = (me && me.getAttribute('data-base')) || '';
  var nav = document.querySelector('nav');
  if (!nav) return;
  var box = nav.querySelector('.nav-links') || nav.querySelector('nav > span');
  if (!box) return;
  var lang = 'en';
  try { lang = localStorage.getItem('epgtalk-lang') || ''; } catch (e) {}
  if (lang !== 'en' && lang !== 'es') lang = (navigator.language || 'en').toLowerCase().indexOf('es') === 0 ? 'es' : 'en';
  var es = lang === 'es';
  var here = location.pathname.split('/').pop() || 'index.html';
  if (/\/calendars\/?$/.test(location.pathname) || /calendars\/index\.html$/.test(location.pathname)) here = 'calendars/';
  if (/\/builder\/?$/.test(location.pathname) || /builder\/index\.html$/.test(location.pathname)) here = 'builder/';

  var QUICK = [['ask.html', es ? '🔎 Pregunta' : '🔎 Ask'], ['tvguide.html', es ? 'Guía de TV' : 'TV Guide'], ['live.html', es ? 'Deportes en Vivo' : 'Live Sports']];
  var GROUPS = [
    [es ? '📺 Ver' : '📺 Watch', [['now.html', es ? '⏱ Ahora y Después' : '⏱ Now & Next'], ['tvguide.html', es ? '📺 Guía de TV' : '📺 TV Guide'],
      ['tonight.html', es ? '🌟 Lo mejor de esta noche' : "🌟 Tonight's Picks"], ['tv.html', es ? '🛋️ Modo TV' : '🛋️ TV Mode'], ['antenna.html', es ? '🆓 TV Gratis' : '🆓 Free TV']]],
    [es ? '🏆 Deportes' : '🏆 Sports', [['live.html', es ? '🔴 Deportes en Vivo' : '🔴 Live Sports'], ['events.html', es ? '🏆 Grandes Eventos' : '🏆 Big Events'],
      ['weekend.html', es ? '📅 Este fin de semana' : '📅 This Weekend'], ['calendars/', es ? '📅 Calendarios de equipos' : '📅 Team Calendars']]],
    [es ? '⚙️ Configurar y ayuda' : '⚙️ Set up & help', [['index.html#urls', es ? '🔗 URLs de las guías' : '🔗 Guide URLs'], ['setup.html', es ? '📖 Configura tu app' : '📖 Player Setup'],
      ['builder/', es ? '🧰 App Guide Builder' : '🧰 Guide Builder app'],
      ['index.html#faq', es ? '❓ Preguntas frecuentes' : '❓ FAQ'], ['channels.html', es ? '🔎 Buscador de canales' : '🔎 Channel Finder'], ['playlist.html', es ? '🔧 Revisar lista' : '🔧 Playlist Checker']]],
    [es ? '🤓 Más' : '🤓 More', [['index.html', es ? '🏠 Inicio' : '🏠 Home'], ['ask.html', es ? '🔎 Pregúntale a EPGTalk' : '🔎 Ask EPGTalk'], ['api.html', es ? '🤓 JSON público (API)' : '🤓 Public JSON (API)'],
      ['mailto:support@epgtalk.com', es ? '📧 Soporte' : '📧 Support'], ['https://github.com/acidjesuz/EPGTalk', '★ GitHub'],
      ['onedayatatime.html', es ? '🕊️ Un día a la vez' : '🕊️ One day at a time']]]
  ];
  function href(h) { return /^(https?:|mailto:)/.test(h) ? h : base + h; }
  // seasonal hub (same calendar as make_season.py) — first item under Watch while a season is on
  var SEASON = (function () {
    var d = new Date(), m = d.getMonth() + 1, day = d.getDate();
    if (m === 10 || (m === 11 && day <= 2)) return es ? '🎃 Halloween en la TV' : '🎃 Halloween on TV';
    if ((m === 11 && day >= 3) || (m === 12 && day <= 26)) return es ? '🎄 Películas navideñas' : '🎄 Holiday Movies';
    if ((m === 12 && day >= 27) || (m === 1 && day <= 2)) return es ? '🎆 Año Nuevo en la TV' : '🎆 New Year on TV';
    if (m === 2 && day <= 14) return es ? '💘 San Valentín' : "💘 Valentine's Movies";
    return null;
  })();
  if (SEASON) GROUPS[0][1].unshift(['season.html', SEASON]);

  var css = document.createElement('style');
  css.textContent =
    '.nav-quick{display:flex;gap:16px;align-items:center}' +
    '.nav-quick a{color:#8899aa;text-decoration:none;font-size:.92rem;white-space:nowrap}.nav-quick a:hover,.nav-quick a.on{color:#00BFFF}' +
    '.epg-menu-btn{font:inherit;font-size:.85rem;font-weight:700;color:#e2e8f0;background:rgba(0,191,255,.08);border:1px solid rgba(0,191,255,.25);' +
      'border-radius:8px;padding:4px 11px;cursor:pointer;white-space:nowrap;margin-left:6px}' +
    '.epg-menu-btn[aria-expanded="true"]{background:rgba(0,191,255,.22);border-color:#00BFFF}' +
    '.nav-menu{position:absolute;top:100%;right:16px;width:820px;max-width:calc(100vw - 32px);display:grid;grid-template-columns:repeat(4,1fr);' +
      'gap:14px 24px;padding:18px 22px;background:rgba(9,13,30,.98);border:1px solid rgba(0,191,255,.2);border-radius:0 0 16px 16px;' +
      'box-shadow:0 18px 40px rgba(0,0,0,.55);z-index:50;text-align:left}' +
    '.nav-menu[hidden]{display:none}' +
    '.nav-menu h4{margin:0 0 6px;font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;color:#00BFFF;font-family:inherit}' +
    '.nav-menu a{display:block;color:#e2e8f0;text-decoration:none;padding:6px 0;font-size:.93rem}.nav-menu a:hover{color:#00BFFF}' +
    '.nav-menu a.on{color:#00BFFF;font-weight:700}' +
    '@media (max-width:900px){.nav-quick{display:none}.nav-menu{left:0;right:0;width:auto;max-width:none;grid-template-columns:1fr 1fr;border-radius:0;' +
      'max-height:calc(100vh - 64px);overflow-y:auto}}' +
    '@media (max-width:560px){.nav-actions .lbl{display:none}.nav-menu{grid-template-columns:1fr;gap:8px;padding:10px 18px 18px}' +
      '.nav-menu a{padding:10px 0;font-size:1rem;border-bottom:1px solid rgba(255,255,255,.05)}}';
  document.head.appendChild(css);
  if (window.getComputedStyle && getComputedStyle(nav).position === 'static') nav.style.position = 'relative';

  // remove the old link row (keep the language button and anything that is not a link)
  var old = box.querySelectorAll('a');
  for (var i = 0; i < old.length; i++) old[i].parentNode.removeChild(old[i]);
  for (var n = box.firstChild; n; ) {             // drop leftover "&nbsp;" spacing (keeps the language button and its click handler)
    var nx = n.nextSibling;
    if (n.nodeType === 3 && !/\S/.test(n.nodeValue.replace(/\u00a0/g, ' '))) box.removeChild(n);
    n = nx;
  }
  box.style.alignItems = 'center';
  if (!box.style.display) box.style.display = 'flex';
  box.style.flexWrap = 'nowrap';
  box.style.gap = box.style.gap || '8px';
  box.className += ' nav-actions';

  var quick = document.createElement('div'); quick.className = 'nav-quick';
  QUICK.forEach(function (q) {
    var a = document.createElement('a'); a.href = href(q[0]); a.textContent = q[1];
    if (q[0] === here) a.className = 'on';
    quick.appendChild(a);
  });
  box.insertBefore(quick, box.firstChild);

  var btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'epg-menu-btn nav-toggle'; btn.id = 'navToggle';
  btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', 'navMenu'); btn.setAttribute('aria-label', 'Menu');
  btn.appendChild(document.createTextNode('☰ '));
  var lbl = document.createElement('span'); lbl.className = 'lbl'; lbl.textContent = es ? 'Menú' : 'Menu'; btn.appendChild(lbl);
  box.appendChild(btn);

  var menu = document.createElement('div'); menu.className = 'nav-menu'; menu.id = 'navMenu'; menu.hidden = true;
  GROUPS.forEach(function (g) {
    var d = document.createElement('div');
    var h = document.createElement('h4'); h.textContent = g[0]; d.appendChild(h);
    g[1].forEach(function (l) {
      var a = document.createElement('a'); a.href = href(l[0]); a.textContent = l[1];
      if (l[0] === here) a.className = 'on';
      if (/^https?:/.test(l[0])) { a.target = '_blank'; a.rel = 'noopener'; }
      d.appendChild(a);
    });
    menu.appendChild(d);
  });
  nav.appendChild(menu);

  function set(open) { menu.hidden = !open; btn.setAttribute('aria-expanded', open ? 'true' : 'false'); btn.firstChild.nodeValue = open ? '✕ ' : '☰ '; }
  btn.addEventListener('click', function (e) { e.stopPropagation(); set(menu.hidden); });
  menu.addEventListener('click', function (e) { var t = e.target; while (t && t !== menu) { if (t.tagName === 'A') { set(false); return; } t = t.parentNode; } });
  document.addEventListener('click', function (e) { if (!menu.hidden && !menu.contains(e.target)) set(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' || e.keyCode === 27) set(false); });

  // signature at the bottom of every page — "One day at a time" links to the support page;
  // on October 9th (sober since 2010) it celebrates the years
  (function () {
    var d = new Date(), y = d.getFullYear() - 2010 - ((d.getMonth() < 9 || (d.getMonth() === 9 && d.getDate() < 9)) ? 1 : 0);
    var bday = d.getMonth() === 9 && d.getDate() === 9;
    var foot = document.querySelector('footer');
    if (!foot) { foot = document.createElement('footer'); foot.style.cssText = 'text-align:center;padding:16px;color:#8899aa;font-size:.85rem'; document.body.appendChild(foot); }
    var sig = document.createElement('div');
    sig.style.cssText = 'margin-top:8px;font-size:.8rem;color:#8899aa;opacity:.9';
    sig.appendChild(document.createTextNode(es ? 'Hecho con ❤️ por un chico de Hamtramck · ' : 'Made with ❤️ by a Hamtramck kid · '));
    var a = document.createElement('a'); a.href = base + 'onedayatatime.html';
    a.style.cssText = 'color:inherit;text-decoration:none;border-bottom:1px dotted rgba(136,153,170,.5)';
    a.textContent = bday ? (es ? '🎉 ' + y + ' años, un día a la vez' : '🎉 ' + y + ' years, one day at a time') : (es ? 'Un día a la vez' : 'One day at a time');
    sig.appendChild(a);
    foot.appendChild(sig);
  })();

  // Game Day banner for followed teams / series (every page with this menu)
  var gd = document.createElement('script'); gd.src = base + 'gameday.js'; document.body.appendChild(gd);
})();
