# Vector//Drift — Session Log

Structured record of the development sessions that built Vector//Drift from concept to production deployment on Cloudflare. Anchored on two threads: the **product idea** and the **technical setup**.

- **Owner:** Piet van Bloom (pietvanbloom-lab)
- **Repo:** https://github.com/pietvanbloom-lab/vector-drift
- **Live site:** https://vector-drift.com
- **Mirror:** https://www.perplexity.ai/computer/a/vector-drift-guWF.UvsTCaGmOsUAlyIGA
- **License:** AGPL-3.0
- **Current release:** v0.2-prod (commit `ed99c97`, tagged 2026-04-19)
- **Log range:** April 13 → May 6, 2026

---

## Part 1 — The Vector//Drift idea

### 1.1 Concept

Vector//Drift is a **public, open-source threat-intelligence console**. It monitors signals across six domains:

1. Cyber
2. Geopolitical
3. Infrastructure
4. Climate
5. Health
6. Financial

The product filters noise and publishes structured analysis that operators can act on. The framing throughout has been **"see emerging risks before they become reality"** — predictive, not reactive.

### 1.2 Posture decisions

| Decision | Outcome | Rationale |
|---|---|---|
| Open-source | **AGPL-3.0** mandatory, footer always visible | Copyleft protects against closed-source forks of an intelligence tool. Strong signal that the methodology is auditable. |
| Languages | **Bilingual German/English** as equals | Owner is based in Meerbusch (NRW); German editorial section is a first-class surface, not a translation. |
| Brand format | **Cinematic-tech / operator-console** aesthetic | Communicates seriousness and data density. Distinguishes from marketing-led intelligence vendors. |
| Hosting | Public AGPL launch URL + private operator surfaces | Public site stays open; private dashboards (when built) gated by Zero Trust. |

### 1.3 Brand system anchors

- **Wordmark:** `VECTOR//DRIFT` in Oswald 600, the `//` always in signal cyan.
- **Tagline:** "See the world's emerging risks before they become reality."
- **Palette:** Void (`#0A0A0F`), Surface (`#12121A`), Signal cyan (`#00FFCC`), Noise amber (`#FFB800`), Red (`#FF3355`) reserved for severity, Static off-white (`#F0F0F0`).
- **Type stack:** Oswald (display), JetBrains Mono (operator chrome), Inter (body).
- **Hero motif:** rotating SVG Earth globe with cyan atmosphere, amber city-light hotspots, animated cyan great-circle arcs.

Full design system is documented in `design.md`.

### 1.4 Product surfaces (current)

| Surface | URL | Purpose |
|---|---|---|
| Live Console | `vector-drift.com/` | Hero with rotating globe, value prop, primary entry point. |
| Threat Map | `vector-drift.com/threat-map` | Full-page globe with hotspots and corridors. |
| Methodology | `vector-drift.com/methodology` | How signals are filtered and ranked. |
| Editorial DE | `vector-drift.com/editorial/de` | German long-form articles. |
| Source | `vector-drift.com/source.html` | AGPL source offer, code link, build hash. |

### 1.5 Future surfaces (reserved)

- `app.vector-drift.com` — private operator dashboard. DNS not yet pointed; Cloudflare Access policy pre-staged.
- `*.vector-drift.pages.dev` — branch and PR preview deployments, gated.

---

## Part 2 — Technical setup

### 2.1 Repository

- **Host:** GitHub, `pietvanbloom-lab/vector-drift`, public.
- **Default branch:** `main`.
- **Production tag:** `v0.2-prod`, currently at `ed99c97`. Moved twice during the v0.2 series as the globe was iterated.
- **License file:** `LICENSE` (AGPL-3.0 verbatim, do not edit).
- **README:** project layout, license, running version, live site link, Perplexity mirror, full v0.2-prod changelog table.
- **Releases:** GitHub Releases populated with v0.2-prod notes mirroring the README changelog. Marked as Latest.

### 2.2 File layout

```
vector-drift/
├── index.html               # Live Console hero
├── threat-map.html          # Full-page globe
├── methodology.html         # How signals are filtered
├── source.html              # AGPL source offer
├── editorial/
│   └── de.html              # German editorial
├── 404.html
├── assets/
│   ├── css/base.css         # All styles, no per-page CSS
│   ├── js/
│   │   ├── chrome.js        # Topbar, session ID, VD_BASE
│   │   ├── globe.js         # SVG orthographic globe
│   │   └── app.js           # Reveal-on-scroll, ticker
│   └── data/
│       └── land.json        # Natural Earth 110m coastlines, 67KB
├── README.md
├── DEPLOY.md                # Deployment runbook
├── design.md                # Design system reference
├── SESSION_LOG.md           # This file
├── LICENSE                  # AGPL-3.0
├── Dockerfile               # Legacy VPS option
├── docker-compose.yml       # Legacy VPS option
└── nginx.conf               # Legacy VPS option
```

### 2.3 Globe component

The defining technical artifact of v0.2.

- **File:** `assets/js/globe.js`, ~367 lines.
- **Approach:** SVG orthographic projection, no WebGL, no external libraries.
- **Data:** Natural Earth 110m coastlines, public domain, quantized to 0.1° to keep the JSON under 70KB.
- **Render:** continents drawn as SVG paths with back-face culling (points on the far hemisphere are dropped).
- **Animation:** longitudinal rotation at 0.035 rad/s (~3 minutes per full rotation), latitude fixed at 23.5° tilt. `requestAnimationFrame` throttled to ~50ms (~20fps). Pauses when `document.hidden` or when SVG carries `.vd-paused`.
- **Hotspots:** 16 cities (FRA, LON, NYC, TYO, SHA, MOS, SAO, SGP, BOM, SYD, DXB, CPT, SFO, BAB, SUE, HKG), rendered as amber dots with severity-color overrides.
- **Corridors:** 8 great-circle arcs, cyan, with traveling pulse glyphs.
- **Atmosphere:** cyan rim with feathered radial glow extending ~6% beyond the sphere.
- **Integration:** Frameless. The globe sits absolutely positioned behind the hero headline (`top: 42%`, `right: 120px`), with media-query breakpoints scaling it from 620px down to 400px.

### 2.4 Iteration history (v0.2 series)

| Commit | Description |
|---|---|
| `c523b15` | Initial rotating globe and Natural Earth data |
| `5b2decb` | Frameless integration: removed panel, caption, ticker; transparent ocean |
| `3b992bc` | Shrunk globe 13% and shifted right for cleaner composition |
| `93db571` | Pulled globe inward (`right: 40px`), lifted vertical center to 42% |
| `ed99c97` | Nudged globe further inward (`right: 120px`) for tighter overlap with headline |

A CSS specificity bug was hit during the frameless integration: `.vd-globe { width: 100% }` was overriding `.hero-bg-globe { width: 620px }` because of stylesheet ordering. Resolved by adding `svg.vd-globe.hero-bg-globe { ... }` higher-specificity rule. **Rule preserved in `design.md`:** when adjusting globe size, update both rule groups.

### 2.5 Hosting evolution

#### Phase A — Perplexity hosting (April)

- Initial deployments via Perplexity's Computer hosting.
- Asset ID: `82e585f9-4bec-4c26-8698-eb14025c8818`.
- URL: https://www.perplexity.ai/computer/a/vector-drift-guWF.UvsTCaGmOsUAlyIGA.
- **Status:** still live as a mirror.

#### Phase B — Custom domain investigation (May 3)

- User reported `vector-drift.org` returned "not found."
- Root cause: domain was never registered. References in README and AGPL footer were aspirational.
- Recommendation: register via Cloudflare Registrar (~$10/yr, wholesale), point Cloudflare Pages at it.
- User registered **`vector-drift.com`** instead (TLD differs from earlier copy).
- All references in the codebase patched in commit `chore: switch domain references from vector-drift.org to .com`. Files touched: `assets/js/chrome.js`, `editorial/de.html`, `source.html`, `README.md`, `nginx.conf`, `DEPLOY.md`, `docker-compose.yml`.

#### Phase C — Cloudflare Pages deployment (May 3)

- Project name: `vector-drift`.
- Source: connected to GitHub repo `pietvanbloom-lab/vector-drift`, branch `main`, auto-deploy on push.
- Framework preset: None (static HTML).
- Build command: empty.
- Output directory: `/`.
- Default Cloudflare URL: https://vector-drift.pages.dev.

#### Phase D — Custom domain + email + DMARC (May 3)

- Custom domain added: `vector-drift.com` and `www.vector-drift.com`. Both serving HTTP 200 over HTTPS via Cloudflare proxy IPs `172.67.137.128` / `104.21.81.20`.
- Cloudflare Email Routing enabled. MX records auto-provisioned:
  - `route1.mx.cloudflare.net` (priority 88)
  - `route2.mx.cloudflare.net` (priority 49)
  - `route3.mx.cloudflare.net` (priority 49)
- SPF: `v=spf1 include:_spf.mx.cloudflare.net ~all`.
- DMARC: `v=DMARC1; p=none; rua=mailto:<id>@dmarc-reports.cloudflare.net` (Cloudflare DMARC Management). Currently in monitor-only mode; planned escalation to `p=quarantine` at +2 weeks, `p=reject` at +6 weeks.
- Branded forwarding addresses to be configured: `editorial@`, `compliance@`, `security@`, all to `pietvanbloom@gmail.com`.

#### Phase E — Zero Trust split (May 3)

Recommended access split, applied:

| Surface | Access |
|---|---|
| `vector-drift.com` + `www.vector-drift.com` | **Public** (AGPL launch URL) |
| `app.vector-drift.com` | **Zero Trust** — `pietvanbloom@gmail.com` via one-time PIN, 24h session |
| `*.vector-drift.pages.dev` | **Zero Trust** — same policy |

Cloudflare Access apps configured:
- `Vector//Drift App` → covers `app.vector-drift.com` (pre-staged, no DNS yet).
- `Vector//Drift Previews` → covers wildcard `*.vector-drift.pages.dev`.

Identity provider: One-Time PIN (free, no Google IdP needed for single-user setup). Team subdomain: `vector-drift.cloudflareaccess.com`.

### 2.6 Cost posture

Entire production stack runs on Cloudflare's free tier:

| Component | Cost |
|---|---|
| Cloudflare Pages (static hosting + CDN + TLS) | $0 |
| Cloudflare DNS | $0 |
| Cloudflare Email Routing (200 addresses) | $0 |
| Cloudflare Access / Zero Trust (up to 50 users) | $0 |
| Cloudflare Registrar (`vector-drift.com`) | ~$10.44/yr (wholesale, no markup) |
| **Total recurring** | **~$10/yr for the domain** |

### 2.7 Operational notes

- **GitHub auth:** preconfigured `api_credentials=["github"]`, never run `gh auth status`.
- **Local dev server:** `python3 -m http.server 5000` from repo root.
- **Tag-moving pattern:** `git tag -f v0.2-prod && git push origin --force refs/tags/v0.2-prod`.
- **Pages auto-deploy:** any push to `main` triggers a new deployment. Preview deploys are generated for branches and PRs.
- **Pages → Workers migration:** Cloudflare announced in early 2026 that new features ship to Workers; Pages enters maintenance mode. Vector//Drift's static stack is unaffected; migration is optional and not currently planned.

---

## Part 3 — Open items

| Item | Status |
|---|---|
| Branded email forwarding (`editorial@`, `compliance@`, `security@` → Gmail) | Pending Email Routing route entries in Cloudflare dashboard. MX/SPF live. |
| DMARC policy escalation `p=none → quarantine → reject` | Scheduled progression at +2 weeks and +6 weeks from May 3. |
| `app.vector-drift.com` operator dashboard | Access policy pre-staged. DNS, Pages route, and dashboard content not yet built. |
| Social preview image (1280×640) upload to GitHub Settings → Social preview | User manual step. Asset exists at `vector-drift-social.png`. |
| GitHub Actions to auto-stamp commit SHA in footer | Offered, not accepted. |
| VPS migration | Legacy `Dockerfile`, `docker-compose.yml`, `nginx.conf` retained. Cloudflare Pages is now production. VPS path is fallback only. |

---

## Part 4 — Conventions for future work

1. **Never use em-dashes** in user-facing copy. Comma, semicolon, or sentence break instead.
2. **AGPL-3.0 footer** must remain visible on every public page.
3. **Bilingual DE/EN** treatment is mandatory for any new editorial surface.
4. **Brand `//`** rendered in signal cyan, never replaced.
5. **Red is severity-only**, never a hover or accent color.
6. **Globe rotation** must respect `prefers-reduced-motion: reduce`.
7. **Tag moves** use force-push pattern shown above.
8. **Domain references** are `vector-drift.com` only. Any leftover `.org` references are bugs.
9. **Design changes** must be reflected in `design.md` before merging.
10. **Session changes** of architectural significance should be appended to this file.
