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
  const g = document.getElementById('globe');
  if(g){
    const ns = 'http://www.w3.org/2000/svg';
    const w = 520, cx = w/2, cy = w/2, r = w*0.38;
    g.setAttribute('viewBox', `0 0 ${w} ${w}`);

    // latitude arcs
    for(let i=-3;i<=3;i++){
      const ry = r * Math.cos(i*Math.PI/8);
      const ellipse = document.createElementNS(ns,'ellipse');
      ellipse.setAttribute('cx',cx); ellipse.setAttribute('cy',cy + i*(r/4));
      ellipse.setAttribute('rx',r); ellipse.setAttribute('ry',Math.max(6,ry*0.22));
      ellipse.setAttribute('fill','none');
      ellipse.setAttribute('stroke','rgba(0,255,204,.18)');
      ellipse.setAttribute('stroke-width','0.6');
      g.appendChild(ellipse);
    }
    // longitude arcs
    for(let i=0;i<7;i++){
      const rx = r * Math.cos(i*Math.PI/7 - Math.PI/2);
      const ellipse = document.createElementNS(ns,'ellipse');
      ellipse.setAttribute('cx',cx); ellipse.setAttribute('cy',cy);
      ellipse.setAttribute('rx',Math.abs(rx)); ellipse.setAttribute('ry',r);
      ellipse.setAttribute('fill','none');
      ellipse.setAttribute('stroke','rgba(0,255,204,.12)');
      ellipse.setAttribute('stroke-width','0.5');
      g.appendChild(ellipse);
    }
    // outer ring
    const ring = document.createElementNS(ns,'circle');
    ring.setAttribute('cx',cx); ring.setAttribute('cy',cy); ring.setAttribute('r',r);
    ring.setAttribute('fill','none'); ring.setAttribute('stroke','rgba(0,255,204,.45)');
    ring.setAttribute('stroke-width','1');
    g.appendChild(ring);

    // hotspots (lat/lon approx of cities -> projected)
    const points = [
      {lat:50.1, lon:8.7,  sev:'cyan', name:'FRA'},
      {lat:35.7, lon:139.7,sev:'amber',name:'TYO'},
      {lat:40.7, lon:-74,  sev:'cyan', name:'NYC'},
      {lat:55.8, lon:37.6, sev:'red',  name:'MOS'},
      {lat:-23.5,lon:-46.6,sev:'cyan', name:'SAO'},
      {lat:1.35, lon:103.8,sev:'amber',name:'SGP'},
      {lat:19.4, lon:-99.1,sev:'cyan', name:'MEX'},
      {lat:31.2, lon:121.5,sev:'amber',name:'SHA'}
    ];
    function project(lat,lon,phase){
      const la = lat*Math.PI/180, lo = (lon*Math.PI/180) + phase;
      const x = cx + r*Math.cos(la)*Math.sin(lo);
      const y = cy - r*Math.sin(la);
      const z = Math.cos(la)*Math.cos(lo);
      return {x,y,z};
    }
    const gHotspots = document.createElementNS(ns,'g'); g.appendChild(gHotspots);
    const gArcs = document.createElementNS(ns,'g'); g.appendChild(gArcs);

    let phase = 0;
    function render(){
      phase += 0.003;
      gHotspots.innerHTML = '';
      gArcs.innerHTML = '';
      const visible = points.map(p => ({...p, ...project(p.lat,p.lon,phase)})).filter(p => p.z > 0);
      visible.forEach(p => {
        const color = p.sev==='red'?'#FF3355':p.sev==='amber'?'#FFB800':'#00FFCC';
        const halo = document.createElementNS(ns,'circle');
        halo.setAttribute('cx',p.x); halo.setAttribute('cy',p.y);
        halo.setAttribute('r',8); halo.setAttribute('fill',color); halo.setAttribute('opacity',.15);
        gHotspots.appendChild(halo);
        const dot = document.createElementNS(ns,'circle');
        dot.setAttribute('cx',p.x); dot.setAttribute('cy',p.y);
        dot.setAttribute('r',2.2); dot.setAttribute('fill',color);
        dot.setAttribute('filter','url(#glow)');
        gHotspots.appendChild(dot);
      });
      // arcs between two random visible points
      if(visible.length>2){
        for(let k=0;k<2;k++){
          const a = visible[Math.floor(Math.random()*visible.length)];
          const b = visible[Math.floor(Math.random()*visible.length)];
          if(a===b) continue;
          const mx=(a.x+b.x)/2, my=(a.y+b.y)/2;
          const dx=b.x-a.x, dy=b.y-a.y;
          const bulge = 30 + Math.random()*30;
          const px = mx - dy*0.001*bulge;
          const py = my + dx*0.001*bulge - bulge;
          const path = document.createElementNS(ns,'path');
          path.setAttribute('d',`M ${a.x} ${a.y} Q ${px} ${py} ${b.x} ${b.y}`);
          path.setAttribute('stroke','rgba(0,255,204,.5)');
          path.setAttribute('stroke-width','0.8');
          path.setAttribute('fill','none');
          path.setAttribute('stroke-dasharray','2 3');
          gArcs.appendChild(path);
        }
      }
    }
    // glow filter
    const defs = document.createElementNS(ns,'defs');
    defs.innerHTML = `<filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
    g.appendChild(defs);
    setInterval(render, 120);
    render();
  }

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
