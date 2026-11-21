// "Ask EPGTalk" — the search behind ask.html and TV Mode's Ask tab.
// EPGAsk.search("lions") -> { teams: [...], shows: [...], category: 'sports'|null }
//   teams: ESPN teams whose name matches, with their next and last game (live from ESPN)
//   shows: upcoming airings from every EPGTalk guide, grouped by title, best match first
//          (from docs/tvguide/search/<two letters>.json, built by make_tvguide_data.py)
// Everything runs in the visitor's browser; nothing is sent anywhere except the search
// words to ESPN's public search (the same as typing them on espn.com).
window.EPGAsk = (() => {
  const API = 'https://site.api.espn.com/apis/site/v2/sports/';
  const SEARCH = 'https://site.web.api.espn.com/apis/search/v2?limit=6&query=';
  const STOP = new Set(['the', 'a', 'an', 'of', 'and', 'at', 'in', 'on', 'vs', 'to', 'de', 'la', 'el', 'los', 'las', 'y', 'en', 'del', 'le', 'les', 'da',
                        'when', 'where', 'is', 'whats', 'what', 'watch', 'game', 'cuando', 'donde', 'ver', 'juega', 'partido', 'next', 'proximo']);
  const CATS = { kids: 'kids', kid: 'kids', children: 'kids', ninos: 'kids', infantil: 'kids', cartoons: 'kids', caricaturas: 'kids',
                 movie: 'movies', movies: 'movies', film: 'movies', films: 'movies', pelicula: 'movies', peliculas: 'movies', cine: 'movies',
                 news: 'news', noticias: 'news', noticiero: 'news', sports: 'sports', sport: 'sports', deportes: 'sports',
                 cc: 'ccF', captions: 'ccF', subtitles: 'ccF', subtitulos: 'ccF' };
  const GUIDE_ORDER = ['combined', 'us', 'uk', 'latino', 'uslocal', 'sports', 'freetv'];
  const shards = {};

  function words(text) {
    const t = String(text || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    return (t.match(/[a-z0-9]+/g) || []).filter(w => !STOP.has(w));
  }
  function shardKey(w) { return /^\d/.test(w) ? '0' : (w.length > 1 && /[a-z]/.test(w[1]) ? w.slice(0, 2) : w[0] + '_'); }
  function matchAll(qw, hay) { return qw.every(w => hay.some(h => h.startsWith(w))); }

  async function getJSON(u) { const r = await fetch(u, { cache: 'no-cache' }); if (!r.ok) throw new Error(r.status); return r.json(); }

  // ── TV listings ─────────────────────────────────────────────────────────────
  async function shows(qw, raw) {
    if (!qw.length || qw.every(w => w.length < 2)) return [];
    const longest = qw.filter(w => w.length > 1).reduce((a, b) => (b.length > a.length ? b : a));
    const key = shardKey(longest);
    if (!shards[key]) shards[key] = getJSON('tvguide/search/' + key + '.json').catch(() => ({ t: [], ch: [], guides: GUIDE_ORDER }));
    const doc = await shards[key];
    const nowm = Date.now() / 60000, phrase = qw.join(' ');
    const groups = [];
    for (const [title, airs] of doc.t) {
      const tw = words(title);
      const titleHit = matchAll(qw, tw);
      const hits = [];
      for (const a of airs) {
        if (a[1] + a[2] <= nowm) continue;
        if (titleHit || matchAll(qw, tw.concat(words(a[4])))) hits.push(a);
      }
      if (!hits.length) continue;
      const plain = words(title.replace(/\[[^\]]*\]/g, ' '));   // score without "⚽🏆 [UCL]"-style tags
      const tj = plain.join(' ');
      let score = titleHit ? 50 : 30;
      if (tj === phrase) score += 60;                         // "bluey" == "Bluey"
      else if (tj.startsWith(phrase)) score += 25;
      else if (tj.includes(phrase)) score += 18;
      score -= Math.min(15, Math.max(0, plain.length - qw.length) * 2);
      const all = plain.concat(words(hits[0][4]));
      if (qw.every(w => all.includes(w))) score += 15;        // whole words ("america") beat prefixes ("american")
      if (hits.some(a => /\S \b(vs?\.?|at)\s+\S/i.test(a[4]))) score += 14;   // a real game ("Real Madrid vs. Inter", "Bears at Packers")
      if (hits[0][1] <= nowm) score += 5;                     // on right now
      groups.push({
        title, score,
        airings: tidy(hits.map(a => {
          const ch = doc.ch[a[0]] || [];
          return { channel: ch[1] || '', guide: (doc.guides || GUIDE_ORDER)[ch[0]] || 'combined', watch: ch[2] || null,
                   start: a[1] * 60000, stop: (a[1] + a[2]) * 60000, flags: a[3], sub: a[4], ep: a[5] };
        })),
      });
    }
    groups.sort((a, b) => b.score - a.score || a.airings[0].start - b.airings[0].start);
    return groups.slice(0, 12);
  }

  // Shorter result lists: 1) the same channel in two guides at the same time becomes one
  // airing with guides ['combined', 'us']; 2) the same episode at the same time on many
  // stations (syndicated shows on every local ABC…) becomes one airing whose .also lists
  // the other channels (first 2 stay as their own rows).
  function chKey(n) {
    return String(n).toLowerCase().replace(/^(us|uk|ca|mx|es) - /, '').replace(/\b(hd|east)\b/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function tidy(list) {
    const out = [], same = new Map();
    for (const a of list) {
      const k = chKey(a.channel) + '|' + a.start;
      const b = same.get(k);
      if (b) { if (!b.guides.includes(a.guide)) b.guides.push(a.guide); if (!b.watch && a.watch) b.watch = a.watch; continue; }
      a.guides = [a.guide]; same.set(k, a); out.push(a);
    }
    const res = [], slot = new Map();
    for (const a of out) {
      const k = a.start + '|' + (a.ep || a.sub || '');
      const c = slot.get(k);
      if (c && c.n >= 2 && !a.watch) { (c.head.also = c.head.also || []).push(a); continue; }
      if (c) { c.n++; if (c.n === 2) c.head = a; } else slot.set(k, { n: 1, head: a });
      res.push(a);
    }
    return res;
  }

  // ── sports teams (ESPN) ────────────────────────────────────────────────────
  function teamOf(c) { return (c && (c.team || c.athlete)) || {}; }
  function score(c) { const s = c && c.score; return s == null ? '' : typeof s === 'object' ? (s.displayValue || '') : String(s); }
  function nets(comp) {
    const out = [];
    for (const b of (comp.broadcasts || [])) {
      const n = (b.media && b.media.shortName) || (b.names && b.names[0]);
      if (n && !out.includes(n)) out.push(n);
    }
    return out.slice(0, 4);
  }
  function game(ev) {
    const c = (ev.competitions || [])[0] || {};
    const st = ((c.status || ev.status || {}).type) || {};
    return { name: ev.name || ev.shortName, short: ev.shortName, start: Date.parse(c.date || ev.date), state: st.state, detail: st.shortDetail || st.detail || '',
             timeValid: c.timeValid !== false, nets: nets(c),
             teams: (c.competitors || []).map(x => ({ name: teamOf(x).displayName || teamOf(x).shortDisplayName, abbr: teamOf(x).abbreviation, score: score(x), winner: x.winner })) };
  }
  async function teams(qw, raw, lang) {
    if (!qw.length) return [];
    let j;
    try { j = await getJSON(SEARCH + encodeURIComponent(raw) + (lang === 'es' ? '&lang=es' : '')); } catch (e) { return []; }
    const tr = (j.results || []).find(r => r.type === 'team');
    let list = ((tr && tr.contents) || []).filter(c => c.sport && c.defaultLeagueSlug && /~t:\d+/.test(c.uid || '') && matchAll(qw, words(c.displayName)));
    if (list.some(c => !/\.w\.|wnba|women/.test(c.defaultLeagueSlug))) list = list.filter(c => !/\.w\./.test(c.defaultLeagueSlug));
    list = list.slice(0, 2);
    return Promise.all(list.map(async c => {
      const id = c.uid.match(/~t:(\d+)/)[1], base = API + c.sport + '/' + c.defaultLeagueSlug + '/teams/' + id + '/schedule';
      const soccer = c.sport === 'soccer';
      const urls = soccer ? [base + '?fixture=true', base] : [base];
      const evs = [];
      for (const r of await Promise.all(urls.map(u => getJSON(u + (lang === 'es' ? (u.includes('?') ? '&' : '?') + 'lang=es&region=us' : '')).catch(() => ({}))))) evs.push(...(r.events || []));
      const games = evs.map(game).filter(g => g.start).sort((a, b) => a.start - b.start);
      const now = Date.now();
      const next = games.filter(g => g.state === 'in' || (g.state !== 'post' && g.start > now - 4 * 3600000)).slice(0, 2);
      const last = games.filter(g => g.state === 'post').pop() || null;
      const LG = { nfl: 'nfl', 'college-football': 'ncaaf', nba: 'nba', wnba: 'wnba', 'mens-college-basketball': 'ncaam', mlb: 'mlb', nhl: 'nhl',
                   'usa.1': 'mls', 'eng.1': 'epl', 'esp.1': 'laliga', 'mex.1': 'ligamx', 'ger.1': 'bundesliga', 'ita.1': 'seriea', 'fra.1': 'ligue1' };
      const lk = LG[c.defaultLeagueSlug];
      return { name: c.displayName, league: c.subtitle || c.defaultLeagueSlug.toUpperCase(), logo: (c.image && (c.image.defaultDark || c.image.default)) || null,
               favKey: lk ? lk + ':' + id : null,
               espn: (c.link && c.link.web) || null, sport: c.sport, next, last };
    }));
  }

  async function search(raw, lang) {
    const qw = words(raw);
    const category = qw.length === 1 && CATS[qw[0]] ? CATS[qw[0]] : null;
    const [t, s] = await Promise.all([teams(qw, raw, lang), shows(qw, raw)]);
    return { query: raw, words: qw, category, teams: t, shows: s };
  }

  // a calendar file (.ics) with a 15-minute reminder
  function ics(title, start, stop, where) {
    const f = d => new Date(d).toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    const esc = s => String(s || '').replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');
    const body = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//EPGTalk//Ask//EN', 'BEGIN:VEVENT', 'UID:' + f(start) + '-' + Math.random().toString(36).slice(2) + '@epgtalk.com',
      'DTSTAMP:' + f(Date.now()), 'DTSTART:' + f(start), 'DTEND:' + f(stop || start + 3 * 3600000), 'SUMMARY:' + esc(title),
      'LOCATION:' + esc(where), 'DESCRIPTION:' + esc((where ? 'On ' + where + '. ' : '') + 'From EPGTalk — https://epgtalk.com'),
      'BEGIN:VALARM', 'TRIGGER:-PT15M', 'ACTION:DISPLAY', 'DESCRIPTION:' + esc(title), 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([body], { type: 'text/calendar' }));
    a.download = String(title).replace(/[^\w\- ]+/g, '').trim().slice(0, 60) + '.ics';
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }

  return { search, words, ics };
})();
