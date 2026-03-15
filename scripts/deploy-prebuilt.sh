#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

REMOTE_HOST="${1:-${DEPLOY_REMOTE_HOST:-}}"
REMOTE_DIR="${2:-${DEPLOY_REMOTE_DIR:-/root/website}}"
REMOTE_PORT="${DEPLOY_SSH_PORT:-22}"
LOCAL_DEPLOY_DIR=".deploy-prebuilt"

if [[ -z "$REMOTE_HOST" ]]; then
  echo "[ERROR] 请提供远端主机，例如: bash scripts/deploy-prebuilt.sh root@81.71.32.222"
  echo "[TIP] 也可以设置环境变量 DEPLOY_REMOTE_HOST"
  exit 1
fi

if [[ ! -f ".env" ]]; then
  echo "[INFO] .env 不存在，已从 .env.example 复制，请先确认配置后重试。"
  cp .env.example .env
  exit 1
fi

if ! command -v rsync >/dev/null 2>&1; then
  echo "[ERROR] 未找到 rsync，请先安装后重试。"
  exit 1
fi

echo "[1/5] 本地编译 Next.js..."
npm run build

echo "[2/5] 生成本地预编译部署目录..."
rm -rf "$LOCAL_DEPLOY_DIR"
mkdir -p "$LOCAL_DEPLOY_DIR"
cp -R .next/standalone "$LOCAL_DEPLOY_DIR/standalone"
cp -R .next/static "$LOCAL_DEPLOY_DIR/static"
cp -R public "$LOCAL_DEPLOY_DIR/public"
cp -R data "$LOCAL_DEPLOY_DIR/data"

cat > "$LOCAL_DEPLOY_DIR/Dockerfile" <<'EOF'
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY standalone ./
COPY static ./.next/static
COPY public ./public
COPY data ./data
EXPOSE 3000
CMD ["node", "server.js"]
EOF

echo "[3/5] 同步预编译产物到远端: $REMOTE_HOST:$REMOTE_DIR/.deploy-prebuilt"
ssh -p "$REMOTE_PORT" "$REMOTE_HOST" "mkdir -p '$REMOTE_DIR/.deploy-prebuilt'"
rsync -az --delete -e "ssh -p $REMOTE_PORT" "$LOCAL_DEPLOY_DIR/" "$REMOTE_HOST:$REMOTE_DIR/.deploy-prebuilt/"

echo "[4/5] 远端构建运行镜像（不编译源码）..."
ssh -p "$REMOTE_PORT" "$REMOTE_HOST" "cd '$REMOTE_DIR/.deploy-prebuilt' && docker build -t website_web:latest ."

echo "[5/5] 重启 web 服务（--no-build --no-deps）..."
ssh -p "$REMOTE_PORT" "$REMOTE_HOST" "cd '$REMOTE_DIR' && COMPOSE_CMD='docker compose'; if ! docker compose version >/dev/null 2>&1; then COMPOSE_CMD='docker-compose'; fi; \$COMPOSE_CMD up -d --no-build --force-recreate --no-deps web && \$COMPOSE_CMD ps -a"

echo "[DONE] 预编译部署完成。"
echo "- 远端主机: $REMOTE_HOST"
echo "- 远端目录: $REMOTE_DIR"
echo "- 服务地址: http://<your-host>:3000"