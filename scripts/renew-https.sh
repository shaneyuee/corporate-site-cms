#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

COMPOSE_CMD="docker compose"
if ! docker compose version >/dev/null 2>&1; then
  COMPOSE_CMD="docker-compose"
fi

if [[ ! -d "docker/nginx/certs/live" ]]; then
  echo "[ERROR] No Let's Encrypt certificate directory found."
  exit 1
fi

echo "[1/2] Renewing certificates..."
docker run --rm \
  -v "$ROOT_DIR/docker/nginx/certs:/etc/letsencrypt" \
  -v "$ROOT_DIR/docker/nginx/www:/var/www/certbot" \
  certbot/certbot renew --webroot -w /var/www/certbot --quiet

echo "[2/2] Recreating nginx to load renewed certificates..."
$COMPOSE_CMD --env-file .env up -d --no-deps --force-recreate nginx

echo "[DONE] HTTPS certificate renewal finished."
