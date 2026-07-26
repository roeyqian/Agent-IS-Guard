# ShopGuard

ShopGuard 是一个基于 Cloudflare Workers + D1 的消费决策研究平台，前端静态页面位于 `view/`，后端 API 位于 `worker/src/`。

ShopGuard is a consumer-decision research platform built on Cloudflare Workers and D1. The static frontend lives in `view/`, and the backend API lives in `worker/src/`.

## 功能 / Features

- 样本浏览、分类筛选和搜索
- 待购清单与决策提交
- 记录列表与详情查看
- 双 AI 助手：促销型 AI 和守护型 AI
- 研究后台：AI 配置、行为统计与订单管理
- 用户行为追踪与研究数据记录
- 样本洞察、订单事件时间线和会话级分析

- Sample browsing, category filtering, and search
- Watchlist and decision submission
- Record list and detail view
- Two AI assistants: Promotional AI and Guardian AI
- Research dashboard for AI settings, behavior stats, and order management
- User behavior tracking and research data logging
- Product insights, order timelines, and session-level analysis

## 技术栈 / Tech Stack

- Cloudflare Workers
- Cloudflare D1
- Cloudflare KV
- Vue.js + Vite

## 项目结构 / Project Structure

- `view/` 前端静态资源
- `worker/src/app/` Worker 入口与路由
- `worker/src/modules/` 各业务模块
- `worker/src/migrations/` 数据库迁移与种子数据

## 本地运行 / Local Development

进入 Worker 目录安装依赖：

```bash
cd worker
npm install
```

启动本地开发：

```bash
npm run dev
```

`wrangler dev` 会同时提供 API 和已构建的静态页面。

前端构建命令在 `view/` 目录：

```bash
cd view
npm install
npm run build
```

部署前先构建前端，再在 `worker/` 目录执行：

```bash
npm run deploy
```

脚本会先构建 `view/`，然后执行 `wrangler deploy`。

## 数据库初始化 / Database Setup

先创建并绑定 D1 数据库，然后执行迁移与种子数据。当前脚本使用的数据库名是 `zero-1-base`：

```bash
npm run db:init
npm run db:seed
```

如果你在 Cloudflare 上使用了不同的数据库名，请同步调整 `worker/package.json` 里的脚本。

如果已经是旧库，再补跑 `worker/src/migrations/0003_order_events.sql`。

## 管理员 / Admin

注册时如果用户名填写为 `admin`，系统会自动将该账号标记为管理员。

登录时使用用户名 + 密码。

## AI 配置 / AI Configuration

在管理后台中填写 DeepSeek API Key、Base URL 和模型名后，即可启用 AI 研究助手。

## 路由概览 / Routes

- `GET /` 前端页面
- `GET /api/products`
- `GET /api/products/:id/insights`
- `GET /api/categories`
- `GET /api/cart`
- `GET /api/orders`
- `GET /api/ai/history`
- `GET /api/admin/ai-config`
- `GET /api/admin/orders`
- `GET /api/admin/orders/:id`
- `PUT /api/admin/orders/:id/status`
- `GET /api/research/summary`
- `POST /api/research/track`

## License

MIT
