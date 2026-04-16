#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

REMOTE_HOST="${1:-${DEPLOY_REMOTE_HOST:-}}"
REMOTE_DIR="${2:-${DEPLOY_REMOTE_DIR:-/root/website}}"
REMOTE_PORT="${DEPLOY_SSH_PORT:-22}"
LOCAL_ENV_FILE="${DEPLOY_ENV_FILE:-.env}"
LOCAL_DEPLOY_DIR=".deploy-prebuilt"

if [[ -z "$REMOTE_HOST" ]]; then
  echo "[ERROR] 请提供远端主机，例如: bash scripts/deploy-prebuilt.sh root@81.71.32.222"
  echo "[TIP] 也可以设置环境变量 DEPLOY_REMOTE_HOST"
  exit 1
fi

if [[ ! -f "$LOCAL_ENV_FILE" ]]; then
  echo "[INFO] 部署环境文件不存在: $LOCAL_ENV_FILE"
  if [[ "$LOCAL_ENV_FILE" == ".env" ]]; then
    cp .env.example .env
    echo "[INFO] 已从 .env.example 复制到 .env，请先确认配置后重试。"
  fi
  exit 1
fi

set -a
source "$LOCAL_ENV_FILE"
set +a

WEB_IMAGE="${WEB_IMAGE:-website-web:latest}"
SITE_PORT="${NGINX_HTTP_PORT:-${WEB_PUBLISHED_PORT:-3000}}"
SITE_HOST_HINT="${CERTBOT_DOMAIN:-<your-host>}"

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

mkdir -p docker/nginx/generated docker/nginx/www docker/nginx/certs
cp docker/nginx/templates/http.conf.template docker/nginx/generated/default.conf

echo "[3/5] 同步运行时文件到远端: $REMOTE_HOST:$REMOTE_DIR"
ssh -p "$REMOTE_PORT" "$REMOTE_HOST" "mkdir -p '$REMOTE_DIR/.deploy-prebuilt' '$REMOTE_DIR/docker' '$REMOTE_DIR/scripts'"
rsync -az -e "ssh -p $REMOTE_PORT" "$LOCAL_ENV_FILE" "$REMOTE_HOST:$REMOTE_DIR/.env"
rsync -az -e "ssh -p $REMOTE_PORT" docker-compose.yml "$REMOTE_HOST:$REMOTE_DIR/docker-compose.yml"
rsync -az -e "ssh -p $REMOTE_PORT" docker/nginx/ "$REMOTE_HOST:$REMOTE_DIR/docker/nginx/"
rsync -az -e "ssh -p $REMOTE_PORT" scripts/deploy-https.sh "$REMOTE_HOST:$REMOTE_DIR/scripts/deploy-https.sh"
rsync -az -e "ssh -p $REMOTE_PORT" scripts/renew-https.sh "$REMOTE_HOST:$REMOTE_DIR/scripts/renew-https.sh"
rsync -az --delete -e "ssh -p $REMOTE_PORT" "$LOCAL_DEPLOY_DIR/" "$REMOTE_HOST:$REMOTE_DIR/.deploy-prebuilt/"

echo "[4/5] 远端构建运行镜像（不编译源码）..."
ssh -p "$REMOTE_PORT" "$REMOTE_HOST" "chmod +x '$REMOTE_DIR/scripts/deploy-https.sh' '$REMOTE_DIR/scripts/renew-https.sh' && cd '$REMOTE_DIR/.deploy-prebuilt' && docker build -t '$WEB_IMAGE' ."

echo "[5/5] 启动远端副本服务栈..."
ssh -p "$REMOTE_PORT" "$REMOTE_HOST" "cd '$REMOTE_DIR' && if docker compose version >/dev/null 2>&1; then docker compose --env-file .env up -d --no-build --force-recreate postgres minio minio-init web nginx && docker compose --env-file .env ps -a; else docker-compose up -d --no-build --force-recreate postgres minio minio-init web nginx && docker-compose ps -a; fi"

echo "[DONE] 预编译部署完成。"
echo "- 远端主机: $REMOTE_HOST"
echo "- 远端目录: $REMOTE_DIR"
echo "- 服务地址: http://$SITE_HOST_HINT:$SITE_PORT"