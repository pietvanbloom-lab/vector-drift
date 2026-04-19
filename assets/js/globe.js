/* Vector//Drift - rotating Earth globe
   SVG orthographic projection, back-face culling, animated great-circle arcs,
   amber city-light dots, cyan atmosphere rim. No WebGL, no deps.

   Targets any <svg data-globe></svg>. Data path resolved via window.VD_BASE
   (set by chrome.js from <body data-depth>). Falls back to 'assets/data/land.json'.
*/
(function(){
  'use strict';

  const NS = 'http://www.w3.org/2000/svg';
  const TAU = Math.PI * 2;
  const DEG = Math.PI / 180;

  // Threat hotspots (major cities / regions)
  const HOTSPOTS = [
    {lat:50.1,  lon:8.7,   sev:'cyan',  name:'FRA', label:'FRANKFURT'},
    {lat:51.5,  lon:-0.12, sev:'cyan',  name:'LON', label:'LONDON'},
    {lat:40.7,  lon:-74,   sev:'cyan',  name:'NYC', label:'NEW YORK'},
    {lat:35.7,  lon:139.7, sev:'amber', name:'TYO', label:'TOKYO'},
    {lat:31.2,  lon:121.5, sev:'amber', name:'SHA', label:'SHANGHAI'},
    {lat:55.8,  lon:37.6,  sev:'red',   name:'MOS', label:'MOSCOW'},
    {lat:-23.5, lon:-46.6, sev:'cyan',  name:'SAO', label:'SAO PAULO'},
    {lat:1.35,  lon:103.8, sev:'amber', name:'SGP', label:'SINGAPORE'},
    {lat:19.1,  lon:72.9,  sev:'amber', name:'BOM', label:'MUMBAI'},
    {lat:-33.9, lon:151.2, sev:'cyan',  name:'SYD', label:'SYDNEY'},
    {lat:25.3,  lon:55.3,  sev:'amber', name:'DXB', label:'DUBAI'},
    {lat:-33.9, lon:18.4,  sev:'cyan',  name:'CPT', label:'CAPE TOWN'},
    {lat:37.8,  lon:-122.4,sev:'cyan',  name:'SFO', label:'SAN FRAN'},
    {lat:12.5,  lon:43.3,  sev:'red',   name:'BAB', label:'BAB-EL-MANDEB'},
    {lat:30.0,  lon:32.5,  sev:'amber', name:'SUE', label:'SUEZ'},
    {lat:22.3,  lon:114.2, sev:'cyan',  name:'HKG', label:'HONG KONG'}
  ];

  // Pre-sampled great-circle arcs (threat corridors). Chosen to span regions.
  const ARCS = [
    {a:'FRA', b:'SHA', sev:'cyan'},
    {a:'NYC', b:'LON', sev:'cyan'},
    {a:'BAB', b:'SUE', sev:'red'},
    {a:'SGP', b:'DXB', sev:'amber'},
    {a:'TYO', b:'SFO', sev:'cyan'},
    {a:'MOS', b:'BOM', sev:'amber'},
    {a:'SAO', b:'CPT', sev:'cyan'},
    {a:'HKG', b:'SYD', sev:'cyan'}
  ];
  const BY_NAME = Object.fromEntries(HOTSPOTS.map(h => [h.name, h]));

  const COLOR = {cyan:'#00FFCC', amber:'#FFB800', red:'#FF3355'};

  function initGlobe(svg){
    const W = parseFloat(svg.dataset.size || 560);
    const H = W;
    const CX = W/2, CY = H/2;
    const R = W * 0.40;
    // Rotation state: lambda = longitude offset in radians
    let lambda = -1.2;   // start over Europe/Africa
    const phi0 = 0;      // no latitude tilt (keeps globe upright and stable)

    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('preserveAspectRatio','xMidYMid meet');
    svg.innerHTML = '';

    // --- defs: glow filters, radial shading, clip ---
    const defs = document.createElementNS(NS,'defs');
    defs.innerHTML = `
      <radialGradient id="vd-ocean" cx="50%" cy="50%" r="50%">
        <stop offset="0%"   stop-color="rgba(0,255,204,0.035)"/>
        <stop offset="70%"  stop-color="rgba(0,255,204,0.02)"/>
        <stop offset="100%" stop-color="rgba(10,10,15,0)"/>
      </radialGradient>
      <radialGradient id="vd-atmo" cx="50%" cy="50%" r="50%">
        <stop offset="72%" stop-color="rgba(0,255,204,0)"/>
        <stop offset="86%" stop-color="rgba(0,255,204,.22)"/>
        <stop offset="100%" stop-color="rgba(0,255,204,0)"/>
      </radialGradient>
      <radialGradient id="vd-glare" cx="32%" cy="28%" r="55%">
        <stop offset="0%"  stop-color="rgba(0,255,204,.08)"/>
        <stop offset="60%" stop-color="rgba(0,255,204,0)"/>
      </radialGradient>
      <filter id="vd-glow" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="2.2" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="vd-softglow" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="6"/>
      </filter>
      <clipPath id="vd-clip">
        <circle cx="${CX}" cy="${CY}" r="${R}"/>
      </clipPath>`;
    svg.appendChild(defs);

    // atmosphere halo (outside disc) — wider, softer, bleeds into the void
    const atmo = document.createElementNS(NS,'circle');
    atmo.setAttribute('cx',CX); atmo.setAttribute('cy',CY);
    atmo.setAttribute('r', R*1.14);
    atmo.setAttribute('fill','url(#vd-atmo)');
    svg.appendChild(atmo);

    // ocean disc (barely-there cyan tint — no hard surface color)
    const ocean = document.createElementNS(NS,'circle');
    ocean.setAttribute('cx',CX); ocean.setAttribute('cy',CY); ocean.setAttribute('r',R);
    ocean.setAttribute('fill','url(#vd-ocean)');
    svg.appendChild(ocean);

    // graticule (cyan, faint)
    const grat = document.createElementNS(NS,'g');
    grat.setAttribute('stroke','rgba(0,255,204,.10)');
    grat.setAttribute('stroke-width','0.5');
    grat.setAttribute('fill','none');
    grat.setAttribute('clip-path','url(#vd-clip)');
    svg.appendChild(grat);

    // land
    const landG = document.createElementNS(NS,'g');
    landG.setAttribute('clip-path','url(#vd-clip)');
    svg.appendChild(landG);

    // specular / glare overlay
    const glare = document.createElementNS(NS,'circle');
    glare.setAttribute('cx',CX); glare.setAttribute('cy',CY); glare.setAttribute('r',R);
    glare.setAttribute('fill','url(#vd-glare)');
    glare.setAttribute('pointer-events','none');
    svg.appendChild(glare);

    // rim ring (cyan edge, slightly softer so it feels like horizon glow)
    const rim = document.createElementNS(NS,'circle');
    rim.setAttribute('cx',CX); rim.setAttribute('cy',CY); rim.setAttribute('r',R);
    rim.setAttribute('fill','none');
    rim.setAttribute('stroke','rgba(0,255,204,.45)');
    rim.setAttribute('stroke-width','1');
    svg.appendChild(rim);

    // arcs group (above land, below hotspots)
    const arcG = document.createElementNS(NS,'g');
    arcG.setAttribute('clip-path','url(#vd-clip)');
    arcG.setAttribute('fill','none');
    svg.appendChild(arcG);

    // hotspots group
    const dotG = document.createElementNS(NS,'g');
    dotG.setAttribute('clip-path','url(#vd-clip)');
    svg.appendChild(dotG);

    // --- projection (orthographic) ---
    function proj(lon, lat){
      // lon/lat in degrees
      const phi = lat*DEG;
      const la = lon*DEG + lambda;
      const cosPhi = Math.cos(phi);
      const x = cosPhi * Math.sin(la);
      const y = Math.cos(phi0)*Math.sin(phi) - Math.sin(phi0)*cosPhi*Math.cos(la);
      const z = Math.sin(phi0)*Math.sin(phi) + Math.cos(phi0)*cosPhi*Math.cos(la);
      // z > 0: front hemisphere
      return {x: CX + R*x, y: CY - R*y, z};
    }

    // Build land paths with proper antimeridian / back-face handling.
    // We walk each ring and break the subpath whenever a point goes to the back.
    function buildLand(rings){
      landG.innerHTML = '';
      let d = '';
      for(const ring of rings){
        let penDown = false;
        let lastZ = 1;
        for(let i=0;i<ring.length;i++){
          const [lon, lat] = ring[i];
          const p = proj(lon, lat);
          if(p.z < 0){
            penDown = false;
            lastZ = p.z;
            continue;
          }
          // front hemisphere
          if(!penDown){
            d += ` M ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
            penDown = true;
          } else {
            d += ` L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
          }
          lastZ = p.z;
        }
      }
      // One path for fill, one for outline glow
      const fill = document.createElementNS(NS,'path');
      fill.setAttribute('d', d);
      fill.setAttribute('fill','rgba(0,255,204,0.06)');
      fill.setAttribute('stroke','rgba(0,255,204,0.65)');
      fill.setAttribute('stroke-width','0.6');
      fill.setAttribute('stroke-linejoin','round');
      fill.setAttribute('stroke-linecap','round');
      landG.appendChild(fill);
    }

    // Graticule rebuild (meridians + parallels)
    function buildGrat(){
      grat.innerHTML = '';
      // parallels every 30deg
      for(let lat=-60; lat<=60; lat+=30){
        let d = '';
        let pen = false;
        for(let lon=-180; lon<=180; lon+=4){
          const p = proj(lon, lat);
          if(p.z < 0){ pen = false; continue; }
          d += (pen?' L ':' M ') + p.x.toFixed(1) + ' ' + p.y.toFixed(1);
          pen = true;
        }
        const path = document.createElementNS(NS,'path');
        path.setAttribute('d', d);
        grat.appendChild(path);
      }
      // meridians every 30deg
      for(let lon=-180; lon<180; lon+=30){
        let d = '';
        let pen = false;
        for(let lat=-85; lat<=85; lat+=3){
          const p = proj(lon, lat);
          if(p.z < 0){ pen = false; continue; }
          d += (pen?' L ':' M ') + p.x.toFixed(1) + ' ' + p.y.toFixed(1);
          pen = true;
        }
        const path = document.createElementNS(NS,'path');
        path.setAttribute('d', d);
        grat.appendChild(path);
      }
    }

    // Great-circle interpolation between two lon/lat in degrees.
    function greatCircle(a, b, steps){
      const pts = [];
      const la1 = a.lat*DEG, lo1 = a.lon*DEG;
      const la2 = b.lat*DEG, lo2 = b.lon*DEG;
      const d = 2*Math.asin(Math.sqrt(
        Math.sin((la2-la1)/2)**2 +
        Math.cos(la1)*Math.cos(la2)*Math.sin((lo2-lo1)/2)**2
      ));
      if(d === 0) return [[a.lon, a.lat]];
      for(let i=0;i<=steps;i++){
        const f = i/steps;
        const A = Math.sin((1-f)*d)/Math.sin(d);
        const B = Math.sin(f*d)/Math.sin(d);
        const x = A*Math.cos(la1)*Math.cos(lo1) + B*Math.cos(la2)*Math.cos(lo2);
        const y = A*Math.cos(la1)*Math.sin(lo1) + B*Math.cos(la2)*Math.sin(lo2);
        const z = A*Math.sin(la1) + B*Math.sin(la2);
        const lat = Math.atan2(z, Math.sqrt(x*x+y*y))/DEG;
        const lon = Math.atan2(y, x)/DEG;
        pts.push([lon, lat]);
      }
      return pts;
    }

    // pre-compute arc latlon paths
    const arcPaths = ARCS.map(arc => {
      const A = BY_NAME[arc.a], B = BY_NAME[arc.b];
      return {sev:arc.sev, pts: greatCircle(A, B, 48), a:A, b:B};
    });

    function buildArcs(){
      arcG.innerHTML = '';
      for(const arc of arcPaths){
        let d = '';
        let pen = false;
        for(const [lon, lat] of arc.pts){
          const p = proj(lon, lat);
          if(p.z < 0){ pen = false; continue; }
          d += (pen?' L ':' M ') + p.x.toFixed(1) + ' ' + p.y.toFixed(1);
          pen = true;
        }
        if(!d) continue;
        const col = COLOR[arc.sev] || COLOR.cyan;
        // outer soft
        const soft = document.createElementNS(NS,'path');
        soft.setAttribute('d', d);
        soft.setAttribute('stroke', col);
        soft.setAttribute('stroke-opacity','0.35');
        soft.setAttribute('stroke-width','3');
        soft.setAttribute('filter','url(#vd-softglow)');
        arcG.appendChild(soft);
        // crisp core
        const line = document.createElementNS(NS,'path');
        line.setAttribute('d', d);
        line.setAttribute('stroke', col);
        line.setAttribute('stroke-opacity','0.85');
        line.setAttribute('stroke-width','1');
        line.setAttribute('stroke-dasharray','3 4');
        arcG.appendChild(line);
      }
    }

    function buildDots(){
      dotG.innerHTML = '';
      for(const h of HOTSPOTS){
        const p = proj(h.lon, h.lat);
        if(p.z < 0) continue;
        const col = COLOR[h.sev] || COLOR.cyan;
        const halo = document.createElementNS(NS,'circle');
        halo.setAttribute('cx',p.x.toFixed(1)); halo.setAttribute('cy',p.y.toFixed(1));
        halo.setAttribute('r', 10); halo.setAttribute('fill', col);
        halo.setAttribute('opacity','0.12');
        halo.setAttribute('filter','url(#vd-softglow)');
        dotG.appendChild(halo);
        const ring = document.createElementNS(NS,'circle');
        ring.setAttribute('cx',p.x.toFixed(1)); ring.setAttribute('cy',p.y.toFixed(1));
        ring.setAttribute('r', 4); ring.setAttribute('fill','none');
        ring.setAttribute('stroke', col); ring.setAttribute('stroke-width','0.8');
        ring.setAttribute('opacity','0.6');
        dotG.appendChild(ring);
        const dot = document.createElementNS(NS,'circle');
        dot.setAttribute('cx',p.x.toFixed(1)); dot.setAttribute('cy',p.y.toFixed(1));
        dot.setAttribute('r', 1.8); dot.setAttribute('fill', col);
        dot.setAttribute('filter','url(#vd-glow)');
        dotG.appendChild(dot);
      }
    }

    // --- animation loop ---
    let rings = null;
    let lastTime = 0;
    const SPEED = 0.035;      // radians per second
    const FRAME_MS = 50;      // render every ~20fps (SVG redraw is expensive)

    function frame(t){
      if(!rings){ requestAnimationFrame(frame); return; }
      if(t - lastTime > FRAME_MS){
        const dt = (lastTime===0) ? 0 : (t - lastTime)/1000;
        lastTime = t;
        if(!document.hidden && !svg.classList.contains('vd-paused')){
          lambda += SPEED * dt;
          if(lambda > TAU) lambda -= TAU;
          buildLand(rings);
          buildGrat();
          buildArcs();
          buildDots();
        }
      }
      requestAnimationFrame(frame);
    }

    // Load land data
    const base = window.VD_BASE || '';
    fetch(base + 'assets/data/land.json')
      .then(r => r.json())
      .then(d => {
        rings = d.rings;
        buildLand(rings);
        buildGrat();
        buildArcs();
        buildDots();
        requestAnimationFrame(frame);
      })
      .catch(err => {
        console.warn('[globe] land data failed to load', err);
        // still animate graticule/dots
        rings = [];
        buildGrat();
        buildArcs();
        buildDots();
        requestAnimationFrame(frame);
      });
  }

  function init(){
    document.querySelectorAll('svg[data-globe]').forEach(initGlobe);
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
