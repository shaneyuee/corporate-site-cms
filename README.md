# corporate-site-cms

企业官网项目（官网 + 管理后台）

基于 Next.js 16 + TypeScript + Tailwind CSS 构建，包含：
- 企业网站前台（移动端适配）
- 管理后台（产品/新闻/站点配置）
- PostgreSQL（用户/产品/新闻数据）+ MinIO（产品图片）+ JSON（站点配置）

## 功能概览

### 前台页面
- `/` 首页（Banner、产品分类、核心产品、企业优势、咨询入口）
- `/products` 产品中心（支持产品介绍视频）
- `/cases` 成功案例（独立页面，多语言展示）
- `/about` 关于我们
- `/news` 新闻中心
- `/contact` 联系我们

### 管理后台
- `/admin/login` 登录页（演示）
- `/admin` 仪表盘
- `/admin/products` 产品管理（新增/编辑/删除，支持图片上传与预览、产品视频、多语言录入）
- `/admin/cases` 案例管理（独立页面，按产品维护成功案例，多语言录入）
- `/admin/news` 新闻管理（新增/编辑/删除）
- `/admin/settings` 站点配置（企业信息多语言修改，可修改首页背景图）
- `/admin/inquiries` 客户需求（查看联系页提交内容，支持新需求提醒与标记已读）

### 多语言
- 支持 `中文 / English / 日本語 / 한국어`
- 默认语言根据浏览器 `Accept-Language` 自动设置
- 顶部支持手动切换语言并持久化到 Cookie
- 产品名称/简介/特性、公司介绍等内容支持多语言录入

### 登录鉴权
- 初始化默认管理员账号：`admin`
- 初始化默认密码：`adm12312`
- 登录成功后会写入 `httpOnly` 会话 Cookie，受保护路由为 `/admin` 下除 `/admin/login` 以外页面
- 管理类写操作 API 已启用鉴权校验
- 登录页启用简单算术验证码（5分钟有效）
- 同一账号+IP 连续失败 5 次后锁定 10 分钟

### 数据存储
- 用户、产品、新闻数据：PostgreSQL
- 产品图片：MinIO（S3 兼容对象存储）
- 产品/案例图片上传：统一自动处理为 `16:9`（等比缩放，空白区域透明补边），并存储为 PNG
- 站点配置：`data/site.json`

### API 路由
- `GET/POST /api/products`
- `PUT/DELETE /api/products/:id`
- `GET /api/cases`
- `PUT /api/cases/:productId`
- `GET/POST /api/news`
- `PUT/DELETE /api/news/:id`
- `GET/POST /api/inquiries`
- `PUT /api/inquiries/:id`
- `GET/PUT /api/site`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/captcha`
- `POST /api/uploads/product-image`

## 目录结构

```
app/
	(site)/                  # 官网前台路由组
	admin/                   # 管理后台页面
	api/                     # API 路由
components/
	site-layout.tsx          # 官网通用布局
	admin-layout-shell.tsx   # 后台通用布局
data/
	site.json                # 站点配置（顶层）+ 初始化种子（seed）
docker/
	postgres/init.sql        # PostgreSQL 初始化脚本（含默认管理员）
scripts/
	deploy-compose.sh        # 云上 docker compose 部署脚本
lib/
	data.ts                  # 站点配置数据读写
	db.ts                    # PostgreSQL 数据访问
	minio.ts                 # MinIO 客户端封装
```

## 运行方式

```bash
npm install
npm run dev
```

打开浏览器访问：
- 官网：`http://localhost:3000`
- 后台：`http://localhost:3000/admin`

## 本机 Docker 启动 PostgreSQL + MinIO（测试）

1. 复制环境变量：

```bash
cp .env.example .env
```

2. 仅启动数据库与对象存储：

```bash
docker compose up -d postgres minio minio-init
```

3. 启动应用（本机）：

```bash
npm run dev
```

访问：
- 站点：`http://localhost:3000`
- MinIO 控制台：`http://localhost:9001`

## 构建验证

```bash
npm run build
```

已在当前项目中通过构建验证。

## 数据说明

- PostgreSQL 启动后会自动创建 `users`、`products`、`news` 表
- 默认管理员会自动初始化为 `admin / adm12312`
- 产品图片会上传到 MinIO 的 `website-products` 桶（可通过环境变量修改）
- `data/site.json` 顶层字段用于站点配置（`company`、`advantages`、`productCategories` 等）
- 首页首屏背景图由 `heroBackgroundImage` 控制（默认 `/home-hero.webp`），可在后台站点配置页修改
- `data/site.json` 及其 `i18n` 字段支持后台可配置多语言内容（中/英/日/韩），包括：
	- 企业基础信息：`company.name/slogan/intro/address/bannerTitle/bannerSubtitle`
	- 产品分类：`productCategories`
	- 企业优势：`advantages`
	- 联系页提示：`contactFormHint`
	- 页脚备案：`footerIcp`
- `data/site.json` 的 `seed` 字段仅用于数据库初始化种子（`seed.admins`、`seed.products`、`seed.news`）

## 云上 docker compose 部署

```bash
cp .env.example .env
# 按云服务器域名/IP调整 .env 中 MINIO_PUBLIC_URL / DATABASE_URL / 密钥
bash scripts/deploy-compose.sh
```

说明：
- 如果站点通过 `http://` 访问，请保持 `COOKIE_SECURE=false`，否则浏览器不会保存登录验证码/会话 Cookie。
- 如果站点已配置 `https://`，建议设置 `COOKIE_SECURE=true`。
- `MINIO_PUBLIC_URL` 必须配置为可被浏览器访问的地址（例如 `http://81.71.32.222:9000`），不要使用 `localhost`。

部署脚本会自动执行：`build` + `up -d`。

## 云上预编译部署（推荐，远端不编译）

适用场景：远端机器网络或资源不稳定，希望**只在本地编译**，远端仅打包运行镜像并重启服务。

```bash
# 参数1: 远端 SSH（必填）
# 参数2: 远端项目目录（可选，默认 /root/website）
bash scripts/deploy-prebuilt.sh root@81.71.32.222 /root/website
```

也可使用环境变量：

```bash
export DEPLOY_REMOTE_HOST=root@81.71.32.222
export DEPLOY_REMOTE_DIR=/root/website
bash scripts/deploy-prebuilt.sh
```

该脚本执行流程：
- 本地执行 `npm run build`
- 本地生成 `.deploy-prebuilt`（仅运行所需文件）
- `rsync` 到远端
- 远端 `docker build`（不执行源码编译）
- 远端 `docker compose up -d --no-build --force-recreate --no-deps web`

## 启用 HTTPS（Nginx + Let's Encrypt）

项目已内置 `nginx` 反向代理服务与 HTTPS 脚本。

### 方案 A：正式 HTTPS（推荐，需域名）

1. 确保域名 A 记录已指向云服务器公网 IP。
2. 在 `.env` 配置：

```bash
CERTBOT_DOMAIN=your-domain.com
CERTBOT_EMAIL=you@example.com
COOKIE_SECURE=true
MINIO_PUBLIC_URL=https://your-domain.com:9000
```

3. 执行：

```bash
bash scripts/deploy-https.sh your-domain.com you@example.com
```

### 方案 B：临时 HTTPS（仅 IP，自签名证书）

```bash
USE_SELF_SIGNED=true bash scripts/deploy-https.sh
```

说明：浏览器会提示证书不受信任，这是自签名证书的正常行为。

### 证书续期

```bash
bash scripts/renew-https.sh
```

建议在云端配置 crontab（每月一次）：

```bash
0 4 1 * * cd /root/website && bash scripts/renew-https.sh
```

## GitHub Actions 自动部署

项目已新增工作流：[.github/workflows/deploy.yml](.github/workflows/deploy.yml)

触发方式：
- 推送到 `main` 分支自动触发
- 手动触发 `workflow_dispatch`

请在 GitHub 仓库 `Settings > Secrets and variables > Actions` 中添加：

- `DEPLOY_HOST`：例如 `81.71.32.222`
- `DEPLOY_USER`：例如 `root`
- `DEPLOY_SSH_KEY`：私钥全文（建议专用部署密钥）
- `DEPLOY_REMOTE_DIR`：例如 `/root/website`
- `DEPLOY_PORT`：可选，默认 `22`

工作流会执行：
- 本地（CI）安装依赖并构建
- 预编译产物 rsync 到云端
- 远端构建运行时镜像并重启 `web`
- 同步 `docker-compose.yml`、nginx 配置与 HTTPS 脚本

## 旧新闻多语言回填

当历史新闻只有中文字段时，可执行以下脚本回填 `title_i18n/summary_i18n/content_i18n`：

```bash
bash scripts/backfill-news-i18n.sh root@81.71.32.222 /root/website
```

该脚本会在远端 PostgreSQL 内执行 `UPDATE`，补齐现有新闻记录的多语言 JSON 字段。
