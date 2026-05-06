# Vector//Drift — Design System

Production design reference for vector-drift.com. Codifies the visual language already running in `assets/css/base.css` and the editorial decisions made through v0.2-prod.

- **Last updated:** 2026-05-06
- **Brand origin:** Signal//Noise brand board, adapted for an open-source threat-intelligence console
- **Live site:** https://vector-drift.com
- **Design ethos:** cinematic-tech, operator-console, public-facing AGPL-3.0

## 1. Design principles

1. **Operator-first, not marketing-first.** Every screen reads like a working surface, not a landing page. Mono-spaced labels, status dots, session IDs, and uppercase headers reinforce that the visitor is looking at an instrument, not a brochure.
2. **Void and signal.** The site is built on near-black with two functional accents: cyan for signal (intelligence, action, navigation) and amber for noise (caveats, language toggles, secondary state). Red is reserved exclusively for severity.
3. **Cinematic restraint.** Motion is allowed only where it carries meaning: the rotating globe, pulsing live-indicator dot, atmosphere rim, animated great-circle arcs. No decorative animation.
4. **Dense without being noisy.** Headers UPPERCASE with wide tracking, mono labels for chrome, generous line-height for body. Information density signals seriousness; whitespace prevents fatigue.
5. **Bilingual by design.** German and English are equal citizens. Toggle is rendered in noise amber to mark it as a state-change, not a navigation item.
6. **Open-source posture is visual.** AGPL-3.0 badge in the eyebrow, build hash in the chrome, source page in primary nav. License visibility is a design element, not a footer afterthought.

## 2. Brand identity

### 2.1 Wordmark

```
VECTOR//DRIFT
```

- Set in **Oswald 600**, letter-spacing `.14em`.
- Double slash `//` always rendered in **signal cyan** (`var(--signal)`), surrounded by static off-white. The slash is the brand's only typographic mark and must never be replaced with a single slash, dot, or hyphen.
- Minimum size: 14px (display caps) or 18px in chrome.

### 2.2 Tagline

> **See the world's emerging risks before they become reality.**

The word `risks` is rendered in signal cyan italics. The line breaks are intentional and preserved across breakpoints — they form a four-line cadence that reads like a console banner.

### 2.3 Voice

- First-person plural: "We monitor… we publish…"
- Short declarative sentences. No marketing adjectives ("revolutionary", "leading", "best-in-class" are banned).
- Operator vocabulary: signal, noise, drift, vector, console, severity, lane, corridor, hotspot.
- Never use em-dashes in user-facing copy. Use a comma, semicolon, or sentence break instead.

## 3. Color palette

All values are CSS variables defined in `assets/css/base.css`. Always reference by variable, never by hex.

### 3.1 Surfaces

| Token | Hex | Usage |
|---|---|---|
| `--void` | `#0A0A0F` | Page background. The default for everything not on a panel. |
| `--void-2` | `#0E0E15` | Subtle gradient stops, ambient grain layer. |
| `--surface` | `#12121A` | Panel and card background. |
| `--surface-2` | `#171722` | Elevated panels, modal-equivalent surfaces. |
| `--line` | `#1f1f2e` | Default border/divider. |
| `--line-2` | `#2a2a3d` | Hover state on borders, active panel edges. |

### 3.2 Type

| Token | Hex | Usage |
|---|---|---|
| `--static` | `#F0F0F0` | Primary body and headline text. Off-white, never pure `#FFF`. |
| `--muted` | `#8a8aa0` | Secondary text, mono labels, captions. |
| `--muted-2` | `#5c5c72` | Tertiary metadata, disabled states. |

### 3.3 Functional accents

| Token | Hex | Role | Usage rule |
|---|---|---|---|
| `--signal` | `#00FFCC` | **Signal (cyan)** | Active links, primary buttons, live status, critical UI affirmations, the brand slash, the globe atmosphere rim and great-circle arcs. |
| `--signal-dim` | `#00c9a0` | Dim signal | Deeper hover state, inactive-but-available, secondary stroke on diagrams. |
| `--noise` | `#FFB800` | **Noise (amber)** | Language toggle, advisory state, city-light dots on the globe, secondary alerts. **Not** a primary action color. |
| `--red` | `#FF3355` | **Severity (red)** | Reserved exclusively for high-severity incidents and corrections. Never used as a hover, accent, or button color. Misuse erodes the severity signal. |

**Hard rule:** if a UI element is not a status indicator and not a primary action, it should be `--static` or `--muted` first. Reach for accents only when the meaning warrants it.

### 3.4 Ambient layers

The body has a fixed pseudo-element overlay producing two soft radial glows (cyan top-right at 6% alpha, amber bottom-left at 4% alpha) plus a 1px-on-3px horizontal scanline at 1.2% alpha. This is the "void grain" that gives the site its CRT depth. Never disable it; never increase the opacity beyond doubling.

## 4. Typography

### 4.1 Type stack

| Role | Family | Variable | Fallback |
|---|---|---|---|
| Display (headlines, brand) | **Oswald** | `--f-display` | Barlow Condensed, system-ui |
| Operator chrome (labels, mono) | **JetBrains Mono** | `--f-mono` | ui-monospace, Menlo |
| Body | **Inter** | `--f-body` | system-ui, -apple-system |

### 4.2 Scale and rules

| Element | Size | Weight | Tracking | Transform |
|---|---|---|---|---|
| `h1` | `clamp(40px, 7vw, 96px)` | 600 | `.02em` | UPPERCASE |
| `h1` (hero, narrow) | `clamp(46px, 5.2vw, 76px)` | 600 | `.02em` | UPPERCASE |
| `h2` | `clamp(24px, 3vw, 40px)` | 600 | `.04em` | UPPERCASE |
| `h3` | `18px` | 600 | `.12em` | UPPERCASE |
| Body | `15px` / line-height `1.55` | 400 | normal | none |
| `.mono` | `12px` | 400 | `.08em` | none |
| `.mono-label` | `11px` | 400 | `.22em` | UPPERCASE |

### 4.3 Hard rules

- Never set body text in Oswald.
- Never set headlines in Inter or JetBrains Mono.
- Never use lowercase headlines except inside long-form editorial articles.
- Mono labels carry tracking of `.20em` to `.22em`. Anything tighter loses the operator feel.
- Body line-height is `1.55`. Do not tighten below `1.45` even in dense panels.

## 5. Layout

- Container max-width: `1320px`, side padding `24px`.
- Section vertical rhythm: `96px` top/bottom, `1px` border-top in `--line`.
- Grid base unit: `8px`. Gaps default to `16px`; component-internal padding to `24px`; large layout gaps to `48px`.
- Top bar: sticky, `72px` tall (`14px` vertical padding), backdrop-filter blur `14px` over `rgba(10,10,15,.72)`.

### 5.1 Hero composition (index.html)

The hero uses a **frameless globe over text** layout, not a side-by-side card pattern.

- Container: `.hero-globe` with `position: relative; overflow: hidden`.
- Headline: left-aligned, max-width clamps with the inner container.
- Globe: `.hero-bg-globe`, absolutely positioned, `top: 42%`, `right: 120px`, `transform: translateY(-50%)`. Sits **behind** the headline (`z-index: 1`) and **bleeds slightly off-screen** at narrow viewports for atmosphere.
- Globe size scales: `620px → 560px → 480px → 400px` across breakpoints `1500 → 1250 → 1050`. Below `900px` the layout stacks vertically (text first, globe second).
- No frame, no panel border, no caption, no ticker on the globe. It floats in the void.

### 5.2 Threat-map page

The threat-map page reuses the same globe component without any hero text — the page is the globe. Same `.globe-stage` wrapper, no HUD, no legend. Severity is communicated entirely through hotspot color and arc weight.

## 6. Components

### 6.1 Buttons

```css
.btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 14px 22px;
  font-family: var(--f-mono); font-size: 12px; letter-spacing: .2em;
  text-transform: uppercase;
  border: 1px solid var(--line-2);
  background: transparent;
  color: var(--static);
  border-radius: 2px;
  transition: border-color .2s, color .2s, background .2s;
}
.btn-primary { border-color: var(--signal); color: var(--signal); }
.btn-primary:hover { background: rgba(0,255,204,.08); color: #fff; text-shadow: 0 0 12px rgba(0,255,204,.4); }
```

- Primary action: cyan border + cyan text. Hover lifts to white with cyan glow.
- Secondary: muted border + static text. No fill ever.
- Never use solid filled buttons. The site has no flat-button pattern.

### 6.2 Pills and eyebrows

Used to surface license, version, and live status above headlines.

```
[ ▲ LIVE INTELLIGENCE · AGPL-3.0 ]   BUILD VD-0.2 · SESSION VD-XXXXXX
```

Pill: 1px cyan border, `rgba(0,255,204,.08)` fill, `8px 14px` padding, mono 11px `.22em` tracking. The triangle prefix (`▲`) is a brand mark; never replace with a different glyph.

### 6.3 Status dot

8px circle, signal cyan, `box-shadow: 0 0 12px var(--signal)`, pulse animation (2s loop, opacity 1→0.5, scale 1→1.25). Reserved for live-data indicators in the topbar status strip.

### 6.4 Navigation

- Primary nav: mono 11px `.22em` tracking, padding `8px 12px`, transparent border at rest.
- Hover: `color: #fff` + border `--line-2`.
- Active: cyan text, cyan border, `rgba(0,255,204,.06)` fill, cyan text-shadow glow.
- Language toggle (DE/EN): always rendered with the noise amber treatment to mark it as a non-navigation state change.

### 6.5 Globe component (`assets/js/globe.js`)

- SVG orthographic projection of the Earth, 620px default.
- Continents from Natural Earth 110m coastlines (`assets/data/land.json`, public domain), quantized to 0.1°.
- Rotation: 0.035 rad/s on the longitudinal axis (~3 minutes for a full rotation).
- Atmosphere rim: cyan, 4px feathered glow extending ~6% beyond the sphere.
- City-light dots: 16 hotspots, `--noise` amber, 2-3px radius. Cities encoded: FRA, LON, NYC, TYO, SHA, MOS, SAO, SGP, BOM, SYD, DXB, CPT, SFO, BAB, SUE, HKG.
- Great-circle arcs: 8 corridor lanes, signal cyan, animated pulse traveling along each arc. Backface culling applied so arcs vanish behind the sphere.
- Rendering throttled to ~20fps. Pauses when `document.hidden` or when the SVG carries `.vd-paused`.
- Severity colors: amber (default), cyan (active corridor), red (high severity). Red usage on the globe must be sparing — never more than 2 simultaneous red hotspots.

### 6.6 Editorial pages (long-form)

The German editorial page (`editorial/de.html`) uses a softer treatment for readability:

- Body text widens line-height to `1.7`.
- Drop caps on first paragraph: Oswald 600, signal cyan, 4 lines tall.
- Pull quotes: 1px cyan left border, mono caption, italic body.
- All other system rules (palette, headers, chrome) hold.

## 7. Motion

- Globe rotation: continuous, 0.035 rad/s, longitudinal only. Latitude tilt is fixed at 23.5° (Earth-realistic).
- Status dot: 2s pulse loop, opacity 1↔0.5, scale 1↔1.25.
- Link hover: `color` + `text-shadow` transition `.2s`.
- Reveal-on-scroll: `[data-reveal]` elements fade and translate-up `12px` over `.6s` cubic-bezier(.2,.8,.2,1). One-shot, no re-trigger.
- All other animation: forbidden by default. Add only with a clear functional reason.

`prefers-reduced-motion: reduce` must disable globe rotation and reveal-on-scroll. Status dot can remain (low-amplitude).

## 8. Iconography

- Single brand mark: the **upward triangle** (`▲`) used as the AGPL-license eyebrow and live-status prefix.
- No icon library. If a glyph is needed, draw it as inline SVG, 1.5px stroke, currentColor.
- Flag icons (DE/EN) are **not used** — the language toggle is text only ("DE", "EN").

## 9. Imagery and media

- **Globe is the hero image.** No stock photos. No illustrations of people. No abstract gradients beyond the ambient void layer.
- Maps: orthographic only. Never Mercator (politically loaded), never Robinson (visually weak in dark mode).
- Featured images on editorial articles: dark, single-subject, low-saturation, with subtle cyan or amber color grading. Never bright, never warm-photographic.
- Social preview (1280×640): black background, cyan brand mark left, headline center in Oswald, AGPL-3.0 + version stamp bottom-right in mono.

## 10. Accessibility

- Minimum contrast: WCAG AA across all text. `--static` on `--void` is 18.7:1; `--muted` on `--void` is 7.4:1; `--muted-2` only used for tertiary metadata where AA-large applies.
- Focus rings: 2px cyan outline, 2px offset. Never remove `:focus-visible` styles.
- All interactive elements must be reachable via keyboard. Globe is `aria-hidden="true"` because it is decorative; threat data elsewhere on the page provides the same information textually.
- Animation respects `prefers-reduced-motion`.
- Bilingual content uses correct `lang` attribute on the document root (`lang="en"` or `lang="de"`).

## 11. Asset and file conventions

- All CSS lives in `assets/css/base.css`. No per-page stylesheets.
- All JS in `assets/js/`: `chrome.js` (topbar, session ID, base path), `globe.js` (SVG globe), `app.js` (page-specific reveal, ticker, etc.).
- All static data in `assets/data/`. Currently `land.json` (Natural Earth coastlines).
- HTML pages live at the repo root for production routes; editorial articles in `editorial/<lang>/`.
- Filenames: `kebab-case.ext`. Never camelCase, never spaces.

## 12. Deployment and hosting alignment

- Production: Cloudflare Pages, custom domain `vector-drift.com` and `www.vector-drift.com`.
- Preview deployments: `*.vector-drift.pages.dev`, gated by Cloudflare Access (Zero Trust).
- License footer (AGPL-3.0 link to `LICENSE` and `source.html`) must appear on every public page.
- Build hash and `v0.2-prod` tag are surfaced in the eyebrow chrome ("BUILD VD-0.2") so visitors can verify they are looking at the same source as the GitHub release.

## 13. What to never do

- Never use em-dashes in copy.
- Never use pure black `#000` or pure white `#FFF`. Always `--void` and `--static`.
- Never use red except for severity.
- Never replace the brand `//` with a single slash, hyphen, or dot.
- Never use a sans-serif other than Oswald, JetBrains Mono, or Inter.
- Never use solid filled buttons.
- Never run motion without a `prefers-reduced-motion` fallback.
- Never publish without the AGPL-3.0 footer and source page link.
