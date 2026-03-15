#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -f ".env" ]]; then
  echo "[INFO] .env not found. Copying from .env.example."
  cp .env.example .env
  echo "[ERROR] Please update .env and rerun."
  exit 1
fi

DOMAIN="${1:-${CERTBOT_DOMAIN:-}}"
EMAIL="${2:-${CERTBOT_EMAIL:-}}"
USE_SELF_SIGNED="${USE_SELF_SIGNED:-false}"

COMPOSE_CMD="docker compose"
if ! docker compose version >/dev/null 2>&1; then
  COMPOSE_CMD="docker-compose"
fi

mkdir -p docker/nginx/generated docker/nginx/www docker/nginx/certs

cp docker/nginx/templates/http.conf.template docker/nginx/generated/default.conf

echo "[1/5] Starting core services and HTTP reverse proxy..."
$COMPOSE_CMD --env-file .env up -d postgres minio minio-init web nginx

# Force nginx to reload challenge-only HTTP config before certbot validation.
$COMPOSE_CMD --env-file .env up -d --no-deps --force-recreate nginx

if [[ "$USE_SELF_SIGNED" == "true" ]]; then
  echo "[2/5] Creating self-signed certificate..."
  openssl req -x509 -nodes -newkey rsa:2048 \
    -days 365 \
    -keyout docker/nginx/certs/selfsigned.key \
    -out docker/nginx/certs/selfsigned.crt \
    -subj "/CN=localhost"

  cp docker/nginx/templates/self-signed.conf.template docker/nginx/generated/default.conf
  echo "[3/5] Reloading nginx with self-signed HTTPS config..."
  $COMPOSE_CMD --env-file .env up -d --no-deps --force-recreate nginx

  echo "[DONE] Self-signed HTTPS enabled."
  echo "- URL: https://<your-server-ip>"
  echo "- Browser will show certificate warning, which is expected for self-signed certs."
  exit 0
fi

if [[ -z "$DOMAIN" || -z "$EMAIL" ]]; then
  echo "[ERROR] DOMAIN and EMAIL are required for Let's Encrypt."
  echo "Usage: bash scripts/deploy-https.sh <domain> <email>"
  echo "Or set CERTBOT_DOMAIN and CERTBOT_EMAIL in environment."
  echo "Tip: set USE_SELF_SIGNED=true for IP-only temporary HTTPS."
  exit 1
fi

echo "[2/5] Requesting Let's Encrypt certificate for $DOMAIN ..."
docker run --rm \
  -v "$ROOT_DIR/docker/nginx/certs:/etc/letsencrypt" \
  -v "$ROOT_DIR/docker/nginx/www:/var/www/certbot" \
  certbot/certbot certonly \
  --webroot -w /var/www/certbot \
  -d "$DOMAIN" \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  --non-interactive

echo "[3/5] Generating HTTPS nginx config..."
sed "s|\${DOMAIN}|$DOMAIN|g" docker/nginx/templates/https.conf.template > docker/nginx/generated/default.conf

echo "[4/5] Recreate nginx to apply HTTPS config..."
$COMPOSE_CMD --env-file .env up -d --no-deps --force-recreate nginx

echo "[5/5] Done."
echo "- HTTPS URL: https://$DOMAIN"
echo "- Recommend setting COOKIE_SECURE=true in .env after confirming HTTPS works."
