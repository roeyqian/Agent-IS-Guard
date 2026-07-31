# ShopGuard / BuyMate Open Prototype

ShopGuard 是一个基于 Cloudflare Workers + D1 的消费决策研究平台，目标是开源实现并扩展 ACM CHI 2026 论文《BuyMate: Making AI Interventions Effective in Promoting Rational Consumption in Live Commerce》的研究原型方向。前端静态页面位于 `view/`，后端 API 位于 `worker/src/`。

ShopGuard is a consumer-decision research platform built on Cloudflare Workers and D1. It aims to provide an open-source prototype inspired by the ACM CHI 2026 paper "BuyMate: Making AI Interventions Effective in Promoting Rational Consumption in Live Commerce". The static frontend lives in `view/`, and the backend API lives in `worker/src/`.

> 说明：本项目是研究原型与工程复现，不声称包含论文的全部实验材料、参与者流程或量表。仓库重点提供可运行的直播电商式决策环境、AI 干预界面、行为记录和研究后台。

## 功能 / Features

- 样本浏览、分类筛选和搜索
- 待购清单与决策提交
- 记录列表与详情查看
- 双 AI 助手：促销型 AI 和守护型 AI
- BuyMate 风格干预：需求反思、同类商品比较、销售话术重构、冷静延迟
- 冷静小游戏：小恐龙跑酷、华容道、15 数码，用短回合益智任务打断冲动下单节奏
- 情境压力实验：标记限时、稀缺、社交证明和折扣锚定线索，生成压力画像
- 研究后台：AI 配置、行为统计与决策记录管理
- 用户行为追踪与研究数据记录
- 样本洞察、压力摘要、记录事件时间线和会话级分析

- Sample browsing, category filtering, and search
- Watchlist and decision submission
- Record list and detail view
- Two AI assistants: Promotional AI and Guardian AI
- BuyMate-style interventions: need reflection, comparable-product review, persuasion reframing, and delayed decision
- Calm mini games: Dino Run, Klotski, and 15 Puzzle as short cognitive-switching tasks before purchase decisions
- Situational pressure lab: mark urgency, scarcity, social proof, and discount anchoring cues to create pressure profiles
- Research dashboard for AI settings, behavior stats, and decision record management
- User behavior tracking and research data logging
- Product insights, pressure summaries, record timelines, and session-level analysis

## 研究设计映射 / Research Mapping

- `促销型 AI`：模拟直播电商中的销售式、劝服式对照条件。
- `守护型 AI`：提供温和、实时的理性消费干预，不替用户做决定。
- `BuyMate 干预`：把关键干预做成可点击事件并写入 `user_behaviors`。
- `冷静小游戏`：把小恐龙跑酷、华容道、15 数码作为可触发、可记录的非 AI 冷静任务，研究注意力切换对冲动消费倾向的影响。
- `情境压力实验`：把直播电商中的限时、稀缺、社交证明和价格锚定作为独立变量记录，用于研究情境压力与理性干预之间的关系。
- `研究后台`：汇总行为、会话、AI 对话、提交记录和干预触达次数。
- `压力摘要`：在不新增数据库表的情况下复用 `user_behaviors.metadata_json`，聚合压力画像数量、平均压力分、等级分布和高频线索。
- `结算前反思`：在提交决策前记录用户是否完成关键检查。

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
npm run db:events
npm run db:i18n
npm run db:interventions
```

如果你在 Cloudflare 上使用了不同的数据库名，请同步调整 `worker/package.json` 里的脚本。

如果已经是旧库，再补跑 `worker/src/migrations/0003_order_events.sql`、`worker/src/migrations/0004_product_i18n.sql` 和 `worker/src/migrations/0006_intervention_behavior.sql`。

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
