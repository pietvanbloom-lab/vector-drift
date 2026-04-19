# Deploy · Vector//Drift

Target stack: **Ubuntu 22.04 LTS VPS**, **Docker `nginx:alpine` container**, **Let's Encrypt** via **Certbot**. Alternative: bare Nginx on the host.

## 0 · Prerequisites

- A VPS with a public IPv4 (Hetzner CX11, Digital Ocean Droplet, Oracle Always Free, etc.)
- A domain pointed at the VPS: `A vector-drift.org → <VPS_IP>` and `A www.vector-drift.org → <VPS_IP>`
- SSH access, ideally via key only (password auth disabled)

## 1 · Harden the server

```bash
# From your laptop
ssh-copy-id root@<VPS_IP>

# On the VPS
adduser deploy
usermod -aG sudo deploy
rsync -a /root/.ssh /home/deploy/ && chown -R deploy:deploy /home/deploy/.ssh

apt update && apt -y upgrade
apt -y install ufw fail2ban
ufw default deny incoming && ufw default allow outgoing
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

Disable root SSH and password auth:

```bash
sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart ssh
```

## 2 · Install Docker

```bash
apt -y install ca-certificates curl gnupg
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" \
  | tee /etc/apt/sources.list.d/docker.list
apt update && apt -y install docker-ce docker-ce-cli containerd.io docker-compose-plugin
usermod -aG docker deploy
```

Log out and back in as `deploy` so the group takes effect.

## 3 · Pull the source and build

```bash
cd /opt
sudo git clone https://github.com/pietvanbloom-lab/vector-drift.git
cd vector-drift
sudo chown -R deploy:deploy /opt/vector-drift
git checkout v0.2-prod
docker build -t vector-drift:v0.2-prod .
```

## 4 · First run (HTTP only, to pass Let's Encrypt challenge)

```bash
docker run -d --name vd -p 80:80 \
  -v /opt/vector-drift/certbot-www:/var/www/certbot \
  vector-drift:v0.2-prod
```

## 5 · Let's Encrypt via Certbot

```bash
apt -y install certbot
certbot certonly --webroot -w /opt/vector-drift/certbot-www \
  -d vector-drift.org -d www.vector-drift.org \
  --agree-tos --non-interactive -m compliance@vector-drift.org

# Verify auto-renewal works
certbot renew --dry-run
```

Certificates land at `/etc/letsencrypt/live/vector-drift.org/`. Mount that into the container (below).

## 6 · Switch to HTTPS production

Replace `nginx.conf` with a TLS-enabled variant (already in `nginx-ssl.conf.example` - add `listen 443 ssl http2;`, `ssl_certificate`, `ssl_certificate_key`, and HSTS). Then:

```bash
docker stop vd && docker rm vd
docker compose up -d
```

The compose file runs a Certbot sidecar that renews every 12 h.

## 7 · AGPL compliance checklist

- [x] `LICENSE` (AGPL-3.0) included in the repo and shipped in the container
- [x] Visible "Source Code (AGPL)" link in the footer of every page
- [x] Running version and commit hash shown in the footer
- [x] `/source.html` explicit source-offer page published
- [x] `/source` short redirect to `/source.html`
- [x] `/repo` short redirect to GitHub
- [x] Tag the deployed commit (`git tag v0.2-prod && git push --tags`)

## 8 · Admin access (day-2)

```bash
# Logs
docker logs -f vector-drift

# Shell into the container
docker exec -it vector-drift sh

# Health
curl -I https://vector-drift.org

# Re-deploy a new version
cd /opt/vector-drift
git pull && git checkout v0.3-prod
docker build -t vector-drift:v0.3-prod .
docker compose up -d --force-recreate
```

Recommended additional day-2 tooling:

- **Unattended upgrades:** `apt install unattended-upgrades`
- **Monitoring:** `netdata` or a free Uptime Kuma container on the same host
- **Backups:** Weekly `/etc/letsencrypt` + `/opt/vector-drift` snapshot to a private S3/B2 bucket
- **Log shipping:** `docker logs --since 24h` to Loki/Grafana if you want a real observability stack

## 9 · Alternative: bare Nginx (no Docker)

```bash
apt -y install nginx certbot python3-certbot-nginx
mkdir -p /var/www/vector-drift
rsync -a /opt/vector-drift/ /var/www/vector-drift/
cp /opt/vector-drift/nginx.conf /etc/nginx/sites-available/vector-drift
ln -s /etc/nginx/sites-available/vector-drift /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
certbot --nginx -d vector-drift.org -d www.vector-drift.org
```
