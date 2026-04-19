/* Vector//Drift - client runtime
   - animated globe + arcs on homepage
   - live intelligence feed with rotating synthetic signals
   - simple scroll reveal
   - UTC clock and session id
*/
(function(){
  'use strict';

  // ---------- UTC clock ----------
  const clocks = document.querySelectorAll('[data-utc]');
  function tick(){
    const d = new Date();
    const s = d.toUTCString().split(' ').slice(4,5)[0] + ' UTC';
    clocks.forEach(el => el.textContent = s);
  }
  if(clocks.length){ tick(); setInterval(tick, 1000); }

  // ---------- session id (stable per load) ----------
  const sid = Math.random().toString(36).slice(2,8).toUpperCase();
  document.querySelectorAll('[data-sid]').forEach(el => el.textContent = 'VD-' + sid);

  // ---------- scroll reveal ----------
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));

  // ---------- globe ----------
  // The rotating Earth globe lives in assets/js/globe.js (targets svg[data-globe]).

  // ---------- live feed ----------
  const feed = document.getElementById('feed');
  if(feed){
    const seeds = [
      ['cyan','CYBER',   'NIST 2.0 update pushed to 3,200 EU entities - compliance clock started.'],
      ['amber','GEO',    'Red Sea chokepoint: 11% rerouted volume on AE-EU lanes week-over-week.'],
      ['red','INFRA',    'Grid anomaly ENTSO-E zone DE/AT - frequency deviation 49.87 Hz, 38s.'],
      ['cyan','CLIMATE', 'ECMWF reforecast: Atlantic MSLP pattern shifts Q2 trade routing.'],
      ['amber','FINANCE','EUR swap-spreads widen 4bps - funding-stress indicator rising.'],
      ['cyan','HEALTH',  'WHO signal: cluster flagged in SE Asia, confidence LOW, monitoring.'],
      ['amber','CYBER',  'CVE-2026-3317 - edge-router auth bypass, 240k internet-exposed hosts.'],
      ['cyan','GEO',     'Kazakh rail corridor throughput +7% - Middle-Corridor capture continues.'],
      ['red','INFRA',    'Suez AIS anomaly: 3 tankers holding pattern 41nm north, 6h duration.'],
      ['gray','NOISE',   'Source-confidence below threshold - 14 signals auto-archived.']
    ];
    function stamp(){
      const d = new Date();
      const pad = n => n.toString().padStart(2,'0');
      return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
    }
    function mkRow(sev,cat,msg){
      const row = document.createElement('div');
      row.className = 'feed-row';
      row.innerHTML = `<span class="t">${stamp()}</span><span class="m">${msg}</span><span class="sev ${sev}">${cat}</span>`;
      return row;
    }
    // seed
    seeds.slice(0,7).forEach(s => feed.appendChild(mkRow(s[0],s[1],s[2])));
    setInterval(() => {
      const s = seeds[Math.floor(Math.random()*seeds.length)];
      const row = mkRow(s[0],s[1],s[2]);
      feed.insertBefore(row, feed.firstChild);
      while(feed.children.length > 9) feed.removeChild(feed.lastChild);
    }, 2800);
  }

  // ---------- sparkline ----------
  document.querySelectorAll('[data-spark]').forEach(svg => {
    const n = 40, w = 280, h = 60;
    let pts = Array.from({length:n}, () => 20 + Math.random()*30);
    svg.setAttribute('viewBox',`0 0 ${w} ${h}`);
    function draw(){
      pts.push(20 + Math.random()*30); pts.shift();
      const step = w/(n-1);
      const d = pts.map((v,i) => `${i===0?'M':'L'} ${i*step} ${h - v}`).join(' ');
      svg.innerHTML = `
        <path d="${d} L ${w} ${h} L 0 ${h} Z" fill="rgba(0,255,204,.12)"/>
        <path d="${d}" stroke="#00FFCC" stroke-width="1.4" fill="none" filter="url(#sg)"/>
        <defs><filter id="sg"><feGaussianBlur stdDeviation="1"/></filter></defs>
      `;
    }
    draw(); setInterval(draw, 1800);
  });
})();
