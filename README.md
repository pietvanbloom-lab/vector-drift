# Vector//Drift

Open-source threat intelligence. Signals, briefings and monitoring across six
surfaces: cyber, geopolitical, infrastructure, climate, health, finance.

This repository contains the full corresponding source of the version running
in production.

- **License:** [AGPL-3.0](LICENSE)
- **Running:** `v0.2-prod` · commit `abc1234`
- **Live site:** https://vector-drift.org
- **Source offer:** https://vector-drift.org/source.html

## Project layout

```
vector-drift/
├── index.html              # Live console (homepage)
├── threat-map.html         # Interactive threat map
├── methodology.html        # Editorial + scoring methodology
├── editorial/
│   └── de.html             # German-language editorial
├── source.html             # AGPL-3.0 source offer page
├── assets/
│   ├── css/base.css        # Design tokens + layout
│   ├── js/app.js           # Globe, feed, sparklines, reveal
│   └── js/chrome.js        # Shared topbar + footer injection
├── nginx.conf              # Production Nginx server block
├── Dockerfile              # nginx:alpine static container
├── docker-compose.yml      # Optional compose setup with Certbot
├── DEPLOY.md               # Step-by-step deployment runbook
├── LICENSE                 # AGPL-3.0 full text
└── README.md
```

## Quick start (local)

```bash
# Any static HTTP server will do, for example:
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploy

Full runbook: [DEPLOY.md](DEPLOY.md). Short version:

```bash
docker build -t vector-drift .
docker run -d --name vd -p 80:80 vector-drift
```

## AGPL-3.0 compliance

Vector//Drift is distributed under AGPL-3.0. If you run a modified version as a
network-accessible service, you must make the corresponding source available to
the users of that service under the same license. The live deployment displays
the running version, commit, and a visible "Source Code (AGPL)" link in the
footer of every page, and a full source offer at `/source.html`.

## Contact

- Editorial: editorial@vector-drift.org
- Compliance / corrections: compliance@vector-drift.org
- Security disclosures: security@vector-drift.org
