/* Vector//Drift - shared chrome (topbar + footer).
   Injected client-side so every page stays in sync. */
(function(){
  const current = (document.body.dataset.page || '').toLowerCase();
  const depth = parseInt(document.body.dataset.depth || '0', 10);
  const P = depth > 0 ? '../'.repeat(depth) : './';
  const GIT = 'https://github.com/pietvanbloom-lab/vector-drift';
  const VERSION = 'v0.2-prod';
  const COMMIT = '8cc0c09';

  const logo = `
    <svg viewBox="0 0 40 40" aria-label="Vector//Drift mark">
      <defs><filter id="lg"><feGaussianBlur stdDeviation=".6"/></filter></defs>
      <g fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="20" cy="20" r="14"/>
        <path d="M6 28 L20 6 L34 28" />
      </g>
      <path d="M14 22 L26 22" stroke="#00FFCC" stroke-width="2" filter="url(#lg)"/>
    </svg>`;

  const navItems = [
    {k:'overview', href:P+'index.html', label:'Overview'},
    {k:'threat-map', href:P+'threat-map.html', label:'Threat Map'},
    {k:'methodology', href:P+'methodology.html', label:'Methodology'},
    {k:'editorial-de', href:P+'editorial/de.html', label:'DE', lang:true},
    {k:'source', href:P+'source.html', label:'Source'}
  ];

  const topbar = document.getElementById('topbar');
  if(topbar){
    topbar.innerHTML = `
      <div class="topbar-inner">
        <a class="brand" href="${P}index.html">${logo}<span class="brand-word">VECTOR<span class="brand-slash">//</span>DRIFT</span></a>
        <nav class="nav">
          ${navItems.map(n => `<a href="${n.href}" class="${current===n.k?'active':''} ${n.lang?'lang':''}">${n.label}</a>`).join('')}
        </nav>
        <div class="status" style="margin-left:16px">
          <span class="dot"></span><span>LIVE · <span data-utc>00:00:00 UTC</span></span>
        </div>
      </div>`;
  }

  const footer = document.getElementById('footer');
  if(footer){
    footer.innerHTML = `
      <div class="container">
        <div class="footer-grid">
          <div>
            <div class="brand" style="margin-bottom:12px">${logo}<span class="brand-word">VECTOR<span class="brand-slash">//</span>DRIFT</span></div>
            <p style="color:#a0a0b8;max-width:44ch;font-size:14px">Open-source threat intelligence. Signals, briefings, and monitoring for a world where uncertainty is the operating condition.</p>
            <div class="agpl-block">
              <div class="k">▲ Source Code · AGPL-3.0</div>
              <div class="v">
                <a href="${GIT}" target="_blank" rel="noopener noreferrer">${GIT.replace('https://','')}</a><br/>
                Running: <b style="color:#fff">${VERSION}</b> · commit <b style="color:#fff">${COMMIT}</b>
              </div>
            </div>
          </div>
          <div>
            <h4>Intelligence</h4>
            <ul>
              <li><a href="${P}index.html">Live Console</a></li>
              <li><a href="${P}threat-map.html">Threat Map</a></li>
              <li><a href="${P}methodology.html">Methodology</a></li>
              <li><a href="${P}editorial/de.html">Editorial · DE</a></li>
            </ul>
          </div>
          <div>
            <h4>Open Source</h4>
            <ul>
              <li><a href="${GIT}" target="_blank" rel="noopener">GitHub Repo</a></li>
              <li><a href="${GIT}/blob/main/LICENSE" target="_blank" rel="noopener">AGPL-3.0 License</a></li>
              <li><a href="${P}source.html">Source Offer</a></li>
              <li><a href="${GIT}/blob/main/DEPLOY.md" target="_blank" rel="noopener">Deploy Notes</a></li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul>
              <li><a href="mailto:compliance@vector-drift.org">compliance@vector-drift.org</a></li>
              <li><a href="mailto:editorial@vector-drift.org">editorial@vector-drift.org</a></li>
              <li>Impressum · DE</li>
              <li>Session <span data-sid class="mono" style="color:#00FFCC"></span></li>
            </ul>
          </div>
        </div>
        <div class="legal">
          <span>© ${new Date().getUTCFullYear()} Vector//Drift · Distributed under AGPL-3.0</span>
          <span>Not investment or security advice. Signals are analytical views, not directives.</span>
        </div>
      </div>`;
  }
})();
