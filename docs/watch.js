// EPGTalk "where to watch": turns ESPN network names ("ESPN", "FS1", "TBS") into
// links that open that channel in the TV Guide at game time — but only when the
// channel really is in the Combined guide (streaming-only services are left as text).
// Games on free over-the-air networks (ABC, CBS, FOX, NBC…) get a "📡 Free with
// antenna" badge that links to antenna.html.
window.EPGWatch = (() => {
  // ESPN's short network name -> the text to search for in the Combined guide's channel names
  const ALIAS = {
    espn: 'ESPN US', espn2: 'ESPN 2 US', espnu: 'ESPNU', espnews: 'ESPNews US', espndeportes: 'ESPN Deportes',
    fs1: 'Fox Sports 1 US', foxsports1: 'Fox Sports 1 US', tbs: 'TBS East', trutv: 'Tru TV', tnt: 'TNT',
    cbs: 'CBS', cbssn: 'CBS Sports Network', cbssportsnetwork: 'CBS Sports Network',
    golfchnl: 'Golf Channel', golfchannel: 'Golf Channel', golf: 'Golf Channel',
    nflnet: 'NFL Network', nflnetwork: 'NFL Network', nflredzone: 'NFL Redzone',
    mlbnet: 'MLB Network', mlbnetwork: 'MLB Network', nbatv: 'NBA TV', nhlnet: 'NHL Network', nhlnetwork: 'NHL Network',
    secn: 'SEC Network', secnetwork: 'SEC Network', btn: 'Big Ten Network', bigtennetwork: 'Big Ten Network',
    beinsports: 'beIN Sports', tennischannel: 'Tennis Channel', usanet: 'USA Network', usanetwork: 'USA Network',
    tudn: 'TUDN', univision: 'Univision', unimas: 'UniMas', tsn: 'TSN', sportsnet: 'Sportsnet', sn: 'Sportsnet',
    skysports: 'Sky Sports', tntsports: 'TNT Sports',
  };
  const norm = s => String(s || '').toLowerCase().replace(/&/g, 'and').replace(/\+/g, 'plus').replace(/[^a-z0-9]/g, '');
  // broadcast networks anyone can watch free with an antenna (exact names only: not "CBS Sports Network", "FOX Deportes"…)
  const OTA = new Set(['abc', 'cbs', 'fox', 'nbc', 'cw', 'thecw', 'pbs', 'univision', 'unimas', 'telemundo', 'ion', 'mynetworktv', 'mytv']);
  function free(nets) { return (nets || []).some(n => OTA.has(norm(n))); }
  function freeBadge() {
    const ES = (document.documentElement.lang || '').startsWith('es');
    if (!document.getElementById('ota-css')) {
      const st = document.createElement('style'); st.id = 'ota-css';
      st.textContent = '.ota{display:inline-block;margin-left:6px;font-size:.72rem;font-weight:700;color:#060918!important;background:#2ECC71;' +
        'border-radius:5px;padding:0 6px;text-decoration:none!important;white-space:nowrap;vertical-align:1px}';
      document.head.appendChild(st);
    }
    const a = document.createElement('a'); a.className = 'ota'; a.href = 'antenna.html';
    a.textContent = ES ? '📡 Gratis con antena' : '📡 Free with antenna';
    a.title = ES ? 'Este canal se ve gratis con una antena (en la mayoría de las zonas)' : 'This network is free over the air with an antenna (in most areas)';
    return a;
  }
  let names = null, loading = null;
  function load() {
    if (!loading) loading = fetch('tvguide/combined/channels.json').then(r => r.ok ? r.json() : [])
      .then(ch => { names = ch.map(c => String(c[0]).toLowerCase()); }).catch(() => { names = []; });
    return loading;
  }
  function query(net) {                       // channel search text, or null if not in the guide
    if (!names) return null;
    const alias = ALIAS[norm(net)];
    const q = alias || net;
    const lq = q.toLowerCase();
    return names.some(n => alias ? n.startsWith(lq) : (n === lq || n === lq + ' hd' || n === lq + ' us')) ? q : null;
  }
  // a <span> with "📺 " + each network, linked where possible; t = game start (ms)
  function line(nets, t, cls) {
    const box = document.createElement('div'); box.className = cls || 'tv';
    box.append('📺 ');
    nets.forEach((n, i) => {
      if (i) box.append(', ');
      const q = query(n);
      if (q) {
        const a = document.createElement('a');
        a.href = 'tvguide.html?ch=' + encodeURIComponent(q) + (t ? '&at=' + Math.round(t / 60000) : '') + '#combined';
        a.textContent = n; a.title = '→ ' + q;
        box.appendChild(a);
      } else {
        const b = document.createElement('b'); b.textContent = n; box.appendChild(b);
      }
    });
    if (free(nets)) box.appendChild(freeBadge());
    return box;
  }
  return { load, query, line, free, freeBadge };
})();
