# ShopGuard

ShopGuard 是一个基于 Cloudflare Workers + D1 的 AI 电商平台，前端静态页面位于 `view/`，后端 API 位于 `worker/src/`。

ShopGuard is an AI-powered e-commerce platform built on Cloudflare Workers and D1. The static frontend lives in `view/`, and the backend API lives in `worker/src/`.

## 功能 / Features

- 商品浏览、分类筛选和搜索
- 购物车管理与下单
- 订单列表与订单详情
- 双 AI 助手：销售助手和消费守护助手
- 管理后台：AI 配置与统计面板
- 用户行为追踪与研究数据记录

- Product browsing, category filtering, and search
- Cart management and checkout
- Order list and order details
- Two AI assistants: Seller and Guardian
- Admin dashboard for AI settings and stats
- User behavior tracking and research data logging

## 技术栈 / Tech Stack

- Cloudflare Workers
- Cloudflare D1
- Cloudflare KV
- 原生 HTML / CSS / JavaScript

- Cloudflare Workers
- Cloudflare D1
- Cloudflare KV
- Vanilla HTML / CSS / JavaScript

## 项目结构 / Project Structure

- `view/` 前端静态资源
- `worker/src/app/` Worker 入口与路由
- `worker/src/modules/` 各业务模块
- `worker/src/migrations/` 数据库迁移与种子数据

- `view/` Frontend static assets
- `worker/src/app/` Worker entry and routing
- `worker/src/modules/` Business modules
- `worker/src/migrations/` Database migrations and seed data

## 本地运行 / Local Development

进入 Worker 目录安装依赖：

Install dependencies in the Worker directory:

```bash
cd worker
npm install
```

启动本地开发：

Start the local dev server:

```bash
npm run dev
```

`wrangler dev` 会同时提供 API 和静态页面。

`wrangler dev` serves both the API and the static frontend.

## 数据库初始化 / Database Setup

先创建并绑定 D1 数据库，然后执行迁移与种子数据。当前脚本使用的数据库名是 `shopguard-db`：

Create and bind the D1 database, then run migrations and seed data. The current scripts use the database name `shopguard-db`:

```bash
npm run db:init
npm run db:seed
```

如果你在 Cloudflare 上使用了不同的数据库名，请同步调整 `worker/package.json` 里的脚本。

If you use a different database name on Cloudflare, update the scripts in `worker/package.json` accordingly.

## 管理员 / Admin

注册时如果用户名填写为 `admin`，系统会自动将该账号标记为管理员。

If you register with the username `admin`, the system will automatically mark that account as an admin.

## AI 配置 / AI Configuration

在管理后台中填写 DeepSeek API Key、Base URL 和模型名后，即可启用 AI 助手。

Fill in the DeepSeek API key, base URL, and model name in the admin panel to enable the AI assistants.

## 路由概览 / Routes

- `GET /` 前端页面
- `GET /api/products`
- `GET /api/categories`
- `GET /api/cart`
- `GET /api/orders`
- `GET /api/ai/history`
- `GET /api/admin/ai-config`

- `GET /` Frontend page
- `GET /api/products`
- `GET /api/categories`
- `GET /api/cart`
- `GET /api/orders`
- `GET /api/ai/history`
- `GET /api/admin/ai-config`

## License

MIT
