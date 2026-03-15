#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -f ".env" ]]; then
  echo "[INFO] .env 不存在，已从 .env.example 复制，请先确认配置后重试。"
  cp .env.example .env
  exit 1
fi

COMPOSE_CMD="docker compose"
if ! docker compose version >/dev/null 2>&1; then
  COMPOSE_CMD="docker-compose"
fi

echo "[INFO] 使用命令: $COMPOSE_CMD"
$COMPOSE_CMD --env-file .env pull || true
$COMPOSE_CMD --env-file .env build --no-cache web
$COMPOSE_CMD --env-file .env up -d

echo "[DONE] 部署完成。"
echo "- 站点: http://<your-host>:3000"
echo "- MinIO API: http://<your-host>:9000"
echo "- MinIO Console: http://<your-host>:9001"
