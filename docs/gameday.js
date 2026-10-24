// EPGTalk Game Day banner: when a team or series you follow (☆ on Live Sports or
// Ask EPGTalk, stored in this browser as "epgtalk-fav-teams") plays TODAY, a banner
// appears at the top of every page — time & channel before, live score during
// (refreshed every minute), final score for a few hours after. Nothing to install,
// nothing leaves the browser except ESPN's public scoreboard requests.
// Loaded by nav.js on every page (and by index.html). Old-style JavaScript on purpose.
(function () {
  var favs = [];
  try { favs = JSON.parse(localStorage.getItem('epgtalk-fav-teams') || '[]'); } catch (e) {}
  if (!favs.length || document.getElementById('gameday') || document.body.getAttribute('data-no-gameday') != null) return;
  var API = 'https://site.api.espn.com/apis/site/v2/sports/';
  // league key (same as Live Sports) -> [ESPN path, kind, emoji, extra query]
  var L = {
    nfl: ['football/nfl', 'team', '🏈'], ncaaf: ['football/college-football', 'team', '🏈', 'groups=80'],
    nba: ['basketball/nba', 'team', '🏀'], wnba: ['basketball/wnba', 'team', '🏀'], ncaam: ['basketball/mens-college-basketball', 'team', '🏀'],
    mlb: ['baseball/mlb', 'team', '⚾'], nhl: ['hockey/nhl', 'team', '🏒'],
    mls: ['soccer/usa.1', 'soccer', '⚽'], epl: ['soccer/eng.1', 'soccer', '⚽'], laliga: ['soccer/esp.1', 'soccer', '⚽'], ligamx: ['soccer/mex.1', 'soccer', '⚽'],
    bundesliga: ['soccer/ger.1', 'soccer', '⚽'], seriea: ['soccer/ita.1', 'soccer', '⚽'], ligue1: ['soccer/fra.1', 'soccer', '⚽'],
    ucl: ['soccer/uefa.champions', 'soccer', '⚽'], uel: ['soccer/uefa.europa', 'soccer', '⚽'], concacaf: ['soccer/concacaf.champions', 'soccer', '⚽'],
    intl: ['soccer/fifa.friendly', 'soccer', '⚽'], wcq: ['soccer/fifa.worldq.concacaf', 'soccer', '⚽'], nations: ['soccer/uefa.nations', 'soccer', '⚽'],
    ufc: ['mma/ufc', 'series', '🥊'], pfl: ['mma/pfl', 'series', '🥊'], f1: ['racing/f1', 'series', '🏎️'], indycar: ['racing/irl', 'series', '🏎️'],
    nascar: ['racing/nascar-premier', 'series', '🏁'], nascar2: ['racing/nascar-secondary', 'series', '🏁'], nascartruck: ['racing/nascar-truck', 'series', '🏁'],
    pga: ['golf/pga', 'series', '⛳'], lpga: ['golf/lpga', 'series', '⛳'], liv: ['golf/liv', 'series', '⛳'], dpwt: ['golf/eur', 'series', '⛳']
  };
  var OTA = /^(abc|cbs|fox|nbc|cw|the cw|pbs|univision|unimas|unimás|telemundo|ion)$/i;
  var lang = 'en';
  try { lang = localStorage.getItem('epgtalk-lang') || ''; } catch (e) {}
  if (lang !== 'en' && lang !== 'es') lang = (navigator.language || 'en').toLowerCase().indexOf('es') === 0 ? 'es' : 'en';
  var es = lang === 'es';
  var TX = es ? { tonight: 'HOY EN LA NOCHE', today: 'HOY', live: 'EN VIVO', final: 'Final', remind: '📅 Recordarme', more: 'Deportes en Vivo →', free: '📡 Gratis con antena', hide: 'Ocultar', gd: '¡Día de partido!' }
              : { tonight: 'TONIGHT', today: 'TODAY', live: 'LIVE', final: 'Final', remind: '📅 Remind me', more: 'Live Sports →', free: '📡 Free with antenna', hide: 'Hide', gd: 'Game Day!' };
  var base = (function () { var s = document.querySelector('script[src$="gameday.js"]'); return s ? s.getAttribute('src').replace(/gameday\.js$/, '') : ''; })();

  // which scoreboards to read
  var want = {}, series = {};
  favs.forEach(function (k) {
    var p = String(k).split(':'), lg = p[0], id = p[1];
    if (!L[lg]) return;
    if (id === '*') { series[lg] = 1; return; }
    (want[lg] = want[lg] || {})[id] = 1;
    if (L[lg][1] === 'soccer') ['ucl', 'uel', 'concacaf'].forEach(function (c) { (want[c] = want[c] || {})[id] = 1; });   // clubs in cups too
  });
  function ymd(d) { return d.getFullYear() + ('0' + (d.getMonth() + 1)).slice(-2) + ('0' + d.getDate()).slice(-2); }
  function sameDay(t) { return new Date(t).toDateString() === new Date().toDateString(); }
  function get(u) { return fetch(u, { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : {}; }).catch(function () { return {}; }); }
  function nets(c) { var o = []; (c.broadcasts || []).forEach(function (b) { var n = (b.media && b.media.shortName) || (b.names && b.names[0]); if (n && o.indexOf(n) < 0) o.push(n); }); return o.slice(0, 3); }
  function score(x) { var s = x && x.score; return s == null ? '' : typeof s === 'object' ? (s.displayValue || '') : String(s); }

  function collect() {
    var jobs = [], items = [];
    Object.keys(want).forEach(function (lg) {
      var q = '?dates=' + ymd(new Date()) + '&limit=300' + (L[lg][3] ? '&' + L[lg][3] : '') + (es ? '&lang=es&region=us' : '');
      jobs.push(get(API + L[lg][0] + '/scoreboard' + q).then(function (j) {
        (j.events || []).forEach(function (ev) {
          var c = (ev.competitions || [])[0] || {}, cs = c.competitors || [];
          var mine = cs.filter(function (x) { return x.team && want[lg][x.team.id]; });
          if (!mine.length) return;
          items.push({ id: ev.id, lg: lg, ev: ev, comp: c, mine: mine[0], cs: cs, start: Date.parse(c.date || ev.date) });
        });
      }));
    });
    Object.keys(series).forEach(function (lg) {
      jobs.push(get(API + L[lg][0] + '/scoreboard' + (es ? '?lang=es&region=us' : '')).then(function (j) {
        (j.events || []).forEach(function (ev) {
          var comps = ev.competitions || [];
          // the main session: the race / main card (last competition), else the event itself
          var c = comps.length > 1 && /racing/.test(L[lg][0]) ? (comps.filter(function (x) { var a = ((x.type || {}).abbreviation || '').toLowerCase(); return a === 'race' || a === ''; }).pop() || comps[comps.length - 1]) : comps[0] || {};
          var st = /golf/.test(L[lg][0]) ? Date.parse(ev.date) : Date.parse(c.date || ev.date);
          var state = (((c.status || ev.status || {}).type) || {}).state;
          var golfDay = /golf/.test(L[lg][0]) && Date.now() >= Date.parse(ev.date) && Date.now() <= Date.parse(ev.endDate || ev.date) + 86400000;
          if (!sameDay(st) && state !== 'in' && !golfDay) return;
          items.push({ id: ev.id, lg: lg, ev: ev, comp: c, series: true, start: st });
        });
      }));
    });
    return Promise.all(jobs).then(function () {
      var seen = {};
      return items.filter(function (it) {
        if (seen[it.id]) return false; seen[it.id] = 1;
        var st = (((it.comp.status || it.ev.status || {}).type) || {}).state;
        it.state = st;
        if (st === 'in') return true;
        if (st === 'pre') return sameDay(it.start);
        if (st === 'post') return Date.now() - it.start < 7 * 3600000;      // final score for a few hours
        return false;
      }).sort(function (a, b) { return (a.state === 'in' ? -1 : 0) - (b.state === 'in' ? -1 : 0) || a.start - b.start; });
    });
  }

  function ics(title, start, where) {
    var f = function (d) { return new Date(d).toISOString().replace(/[-:]/g, '').replace(/\.\d+/, ''); };
    var body = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//EPGTalk//GameDay//EN', 'BEGIN:VEVENT', 'UID:' + f(start) + '-gd@epgtalk.com', 'DTSTAMP:' + f(Date.now()),
      'DTSTART:' + f(start), 'DTEND:' + f(start + 3 * 3600000), 'SUMMARY:' + title, 'LOCATION:' + where, 'DESCRIPTION:' + (where ? 'On ' + where + '. ' : '') + 'From EPGTalk',
      'BEGIN:VALARM', 'TRIGGER:-PT15M', 'ACTION:DISPLAY', 'DESCRIPTION:' + title, 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([body], { type: 'text/calendar' })); a.download = 'game.ics';
    document.body.appendChild(a); a.click(); setTimeout(function () { a.remove(); }, 1500);
  }

  var css = document.createElement('style');
  css.textContent = '#gameday{font-family:inherit;background:linear-gradient(90deg,rgba(0,191,255,.16),rgba(46,204,113,.10));border-bottom:1px solid rgba(0,191,255,.25);color:#e2e8f0}' +
    '#gameday .gd{display:flex;flex-wrap:wrap;align-items:center;gap:6px 12px;padding:8px 16px;max-width:1300px;margin:0 auto;font-size:.92rem;border-left:4px solid var(--gdc,#00BFFF)}' +
    '#gameday .gd+.gd{border-top:1px solid rgba(255,255,255,.06)}' +
    '#gameday img{width:26px;height:26px;object-fit:contain}' +
    '#gameday .tag{font-weight:800;letter-spacing:.04em;color:#00BFFF}#gameday .tag.live{color:#ff4d5e}#gameday .tag.fin{color:#2ECC71}' +
    '#gameday b{color:#fff}#gameday .tv{color:#2ECC71;font-weight:700}' +
    '#gameday .ota{font-size:.72rem;font-weight:700;color:#060918;background:#2ECC71;border-radius:5px;padding:0 6px}' +
    '#gameday a,#gameday button{font:inherit;font-size:.8rem;color:#e2e8f0;background:transparent;border:1px solid rgba(0,191,255,.3);border-radius:7px;padding:2px 9px;cursor:pointer;text-decoration:none}' +
    '#gameday .x{margin-left:auto;border:0;color:#8899aa;font-size:1rem}';
  document.head.appendChild(css);

  var box = document.createElement('div'); box.id = 'gameday'; box.hidden = true;
  box.setAttribute('role', 'region'); box.setAttribute('aria-label', TX.gd);
  var topNav = document.querySelector('nav');
  if (topNav && window.getComputedStyle && getComputedStyle(topNav).position === 'fixed') { box.style.flexBasis = '100%'; box.style.width = '100%'; topNav.style.flexWrap = 'wrap'; topNav.appendChild(box); }   // home page: menu is pinned, so sit inside it
  else document.body.insertBefore(box, document.body.firstChild);
  var fmt = new Intl.DateTimeFormat(es ? 'es' : undefined, { hour: 'numeric', minute: '2-digit' });

  function draw(list) {
    box.innerHTML = '';
    var shown = 0;
    list.forEach(function (it) {
      var hideKey = 'epgtalk-gd-hide-' + it.id;
      try { if (sessionStorage.getItem(hideKey)) return; } catch (e) {}
      if (shown >= 3) return;
      shown++;
      var row = document.createElement('div'); row.className = 'gd';
      var c = it.comp, ev = it.ev, n = nets(c), t = it.start, emo = L[it.lg][2];
      var team = it.mine && it.mine.team;
      if (team && team.color) row.style.setProperty('--gdc', '#' + team.color);
      function add(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; row.appendChild(e); return e; }
      if (team && team.logo) { var im = add('img'); im.src = team.logo; im.alt = ''; im.referrerPolicy = 'no-referrer'; im.onerror = function () { im.remove(); }; }
      var detail = ((c.status || ev.status || {}).type || {}).shortDetail || '';
      if (it.state === 'in') {
        add('span', 'tag live', (it.series ? emo + ' ' : '') + '● ' + TX.live);
        if (it.series) add('b', null, ev.name || ev.shortName);
        else add('b', null, it.cs.map(function (x) { return (x.team.shortDisplayName || x.team.abbreviation) + ' ' + score(x); }).join('  –  '));
        if (detail) add('span', null, detail);
      } else if (it.state === 'post') {
        add('span', 'tag fin', (it.series ? emo + ' ' : '') + '✅ ' + TX.final);
        if (it.series) add('b', null, ev.name || ev.shortName);
        else add('b', null, it.cs.map(function (x) { return (x.team.shortDisplayName || x.team.abbreviation) + ' ' + score(x); }).join('  –  '));
      } else {
        add('span', 'tag', emo + ' ' + (new Date(t).getHours() >= 17 ? TX.tonight : TX.today) + ' · ' + (c.timeValid === false ? '' : fmt.format(new Date(t))));
        add('b', null, ev.shortName && !it.series ? ev.name : (ev.name || ev.shortName));
      }
      if (n.length && it.state !== 'post') {
        add('span', 'tv', '📺 ' + n.join(', '));
        if (n.some(function (x) { return OTA.test(x); })) add('span', 'ota', TX.free);
      }
      if (it.state === 'pre') { var r = add('button', null, TX.remind); r.type = 'button'; r.onclick = function () { ics(ev.name || ev.shortName, t, n.join(', ')); }; }
      var m = add('a', null, TX.more); m.href = base + 'live.html';
      var x = add('button', 'x', '✕'); x.type = 'button'; x.title = TX.hide; x.setAttribute('aria-label', TX.hide);
      x.onclick = function () { try { sessionStorage.setItem(hideKey, '1'); } catch (e) {} row.remove(); if (!box.children.length) box.hidden = true;
        if (box.parentNode && box.parentNode.tagName === 'NAV') document.body.style.paddingTop = box.hidden ? '' : box.offsetHeight + 'px'; };
      box.appendChild(row);
    });
    box.hidden = !shown;
    if (box.parentNode && box.parentNode.tagName === 'NAV') document.body.style.paddingTop = box.hidden ? '' : box.offsetHeight + 'px';   // pinned menu: push the page down instead of covering it
    return list.some(function (it) { return it.state === 'in' || (it.state === 'pre' && it.start - Date.now() < 15 * 60000); });
  }

  // one look per few minutes per tab (cached in this tab), every minute while a game is on
  function run() {
    var cached = null;
    try { cached = JSON.parse(sessionStorage.getItem('epgtalk-gd-cache') || 'null'); } catch (e) {}
    var p = cached && Date.now() - cached.at < (cached.live ? 55000 : 180000) && cached.favs === favs.join(',')
      ? Promise.resolve(cached.list) : collect();
    p.then(function (list) {
      var live = draw(list);
      try { sessionStorage.setItem('epgtalk-gd-cache', JSON.stringify({ at: cached && cached.list === list ? cached.at : Date.now(), live: live, favs: favs.join(','),
        list: list.map(function (it) { return { id: it.id, lg: it.lg, ev: { name: it.ev.name, shortName: it.ev.shortName, status: it.ev.status }, comp: it.comp, mine: it.mine, cs: it.cs, series: it.series, start: it.start, state: it.state }; }) })); } catch (e) {}
      setTimeout(run, live ? 60000 : 300000);
    });
  }
  run();
})();
