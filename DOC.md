# ShopGuard 研究项目文档

## 1. 项目概述

ShopGuard 是一个面向直播电商消费决策研究的开源原型系统。项目以 Cloudflare Workers、D1、KV、R2 和 Vue 3 为基础，构建一个可运行的“直播电商式”样本浏览、待购、AI 对话、决策提交与研究后台环境。

本项目的研究方向参考 ACM CHI 2026 论文《BuyMate: Making AI Interventions Effective in Promoting Rational Consumption in Live Commerce》。仓库并不声称复刻论文的完整实验材料、参与者招募流程或量表，而是围绕其核心方向提供一个工程化、可扩展的研究平台，用于观察：

- 促销式 AI 如何影响用户购买倾向；
- 守护式 AI 如何进行理性消费干预；
- 限时、稀缺、社交证明、折扣锚定等直播电商压力线索如何影响决策；
- 用户在浏览、加购、咨询 AI、接受干预、提交决策等阶段留下怎样的行为轨迹。

项目代码分为两个主要部分：

- `view/`：Vue 3 + Vite 前端界面，包含样本浏览、AI 聊天、压力测试、待购清单、决策提交和研究后台。
- `worker/`：Cloudflare Workers 后端接口，负责身份认证、商品样本、待购清单、模拟决策记录、AI 调用、行为追踪和后台统计。

## 2. 研究背景与动机

直播电商通常通过高刺激、高实时性的界面和话术推动购买决策，例如倒计时、库存告急、主播催促、热销榜、弹幕下单提示、划线价和优惠券即将过期等。这些信号会压缩用户比较、预算判断和需求反思的时间，使冲动购买更容易发生。

BuyMate 方向关注的是：AI 不只可以作为销售助手，也可以作为用户的消费守护助手。在用户面临促销压力时，守护式 AI 可以用更温和、可解释、实时的方式提醒用户重新检查真实需求、预算、替代方案和促销话术背后的事实。

ShopGuard 的动机是把这一研究方向做成可运行的实验环境，使研究者能够：

- 在同一平台中模拟促销型 AI 和守护型 AI 两种对照条件；
- 记录用户从样本曝光到提交决策的完整行为链；
- 把 BuyMate 式理性消费干预转化为可点击、可记录、可统计的交互事件；
- 扩展“情境压力”测量，观察直播电商压力线索与 AI 干预之间的关系。

## 3. 研究目标

本项目的主要目标包括：

1. 构建直播电商式消费决策原型  
   用户可以浏览商品样本、搜索分类、查看详情、加入待购清单，并最终提交一次模拟决策记录。

2. 实现双 AI 助手对照  
   系统提供“促销型 AI”和“守护型 AI”。促销型 AI 模拟直播电商中的销售劝服话术；守护型 AI 则提供理性消费干预。

3. 将 BuyMate 干预策略事件化  
   前端提供需求反思、同类比较、话术重构、冷静延迟四类干预入口。每次干预触发都会记录到 `user_behaviors`，用于后续统计。

4. 记录情境压力画像  
   系统把限时紧迫、稀缺库存、社交证明、锚定折扣等压力线索设计为专项测试问题。参与者完成后生成压力分、压力等级和触发线索，并写入行为日志。

5. 提供研究后台  
   管理员可以查看用户数、行为数、AI 对话数、模拟金额、热门样本、干预触发、压力等级分布、会话摘要和决策记录详情。

## 4. 核心研究问题

本项目可支持以下研究问题：

- RQ1：促销型 AI 与守护型 AI 是否会在用户的加购、咨询和最终提交行为上产生不同影响？
- RQ2：用户在面对直播电商压力线索时，是否更可能触发守护型 AI 干预或完成结算前反思？
- RQ3：需求反思、同类比较、话术重构、冷静延迟四类干预中，哪些更容易被用户主动使用？
- RQ4：压力分较高的样本浏览会话，是否伴随更长停留、更高加购率或更多 AI 对话？
- RQ5：把销售话术翻译为中性事实，是否能帮助用户延迟或重新校准购买决策？

## 5. 系统角色

系统包含两类用户角色。

### 5.1 普通参与者

普通参与者可以：

- 注册和登录；
- 浏览商品样本；
- 搜索和筛选分类；
- 查看样本详情和样本洞察；
- 与促销型 AI 或守护型 AI 对话；
- 启动 BuyMate 干预；
- 完成情境压力测试；
- 加入或移除待购清单；
- 在提交前完成反思检查；
- 提交模拟决策记录；
- 查看自己的历史记录。

普通参与者的行为会被记录到研究日志中。

### 5.2 管理员

注册时用户名填写为 `admin` 的账号会被标记为管理员。管理员用于研究管理，不参与普通购物流程。

管理员可以：

- 配置 DeepSeek API Key、Base URL 和模型名；
- 开启或关闭促销型 AI 与守护型 AI；
- 测试 AI 连接；
- 查看研究汇总；
- 查看行为统计；
- 查看压力画像统计；
- 查看和管理提交记录；
- 修改研究记录状态为 `completed` 或 `cancelled`。

管理员账号不会产生普通参与者行为日志，且不能使用促销型或守护型 AI 聊天流程。

## 6. 功能模块

### 6.1 样本浏览模块

对应代码：

- `worker/src/modules/shop/`
- `view/src/App.vue`
- `view/src/api.js`

主要能力：

- 获取商品样本列表；
- 按分类筛选；
- 搜索样本；
- 查看样本详情；
- 返回中英文本地化字段；
- 从 R2 中读取样本图片；
- 查看单个样本的研究洞察。

样本洞察包括：

- 浏览次数；
- 加购次数；
- 提交次数；
- 模拟金额；
- AI 使用次数；
- 最近行为；
- 相关样本；
- 转化率。

### 6.2 待购清单模块

对应代码：

- `worker/src/modules/cart/`
- `view/src/api.js`

主要能力：

- 添加样本到待购清单；
- 更新数量；
- 移除样本；
- 查看当前用户的待购清单。

系统会在前端触发对应行为记录，例如 `add_cart` 和 `remove_cart`。

### 6.3 模拟决策记录模块

对应代码：

- `worker/src/modules/order/`
- `worker/src/migrations/0003_order_events.sql`

本项目中的“订单”是研究语境下的模拟决策记录，并不表示真实支付或真实履约。用户提交决策后，系统会：

- 创建一条 `orders` 记录；
- 创建多条 `order_items` 记录；
- 写入一条 `order_events` 时间线事件；
- 清空当前待购清单；
- 在行为日志中记录 `place_order`。

提交记录默认状态为 `completed`，用于表示该次模拟决策已经被记录。

### 6.4 双 AI 助手模块

对应代码：

- `worker/src/modules/ai/service.js`
- `worker/src/modules/ai/seller.js`
- `worker/src/modules/ai/guardian.js`
- `worker/src/modules/ai/deepseek.js`

系统通过 DeepSeek Chat Completions 兼容接口调用大模型。管理员可在后台配置：

- `deepseek_api_key`
- `deepseek_base_url`
- `deepseek_model`
- `seller_ai_enabled`
- `guardian_ai_enabled`

#### 促销型 AI

促销型 AI 用于研究对照条件，模拟直播电商中的销售式 AI。其提示词特征包括：

- 热情推荐；
- 强调样本优点；
- 使用限时、库存、热销、好评等销售语境；
- 明确自己是研究中的促销模拟条件；
- 不捏造样本字段中不存在的库存、销量、折扣或评价。

系统还实现了一个主动促销触达逻辑：当用户在样本详情停留超过 20 秒时，可触发促销型 AI 主动提示。为避免干扰过度，系统限制未回复的促销消息数量。

#### 守护型 AI

守护型 AI 用于理性消费干预。其提示词优先采用以下策略：

- 需求反思；
- 预算校准；
- 同类商品比较；
- 销售话术重构；
- 延迟购买；
- 透明化说明。

守护型 AI 不替用户做最终决定，而是帮助用户暂停、复核和比较。

### 6.5 BuyMate 干预模块

对应前端逻辑：

- `interventionCards`
- `startIntervention`
- `trackCheckoutReflection`

系统内置四类干预：

| 干预策略 | 事件 key | 目的 |
| --- | --- | --- |
| 需求反思 | `need_reflection` | 检查是否计划内购买、是否已有替代物、真实使用频率 |
| 同类比较 | `comparison` | 重新比较价格、耐用性、售后、非促销价 |
| 话术重构 | `persuasion_reframe` | 把限时、爆款、稀缺等促销话术翻译成中性事实 |
| 冷静延迟 | `delay` | 把即时决策改成稍后复核 |

每次用户点击干预卡片，系统会记录：

- `behavior_type = intervention_check`
- `productId`
- `strategy`
- `source`
- `cartValue`

结算前反思也会记录为 `intervention_check`，并额外保存是否勾选、待购数量等元数据。

### 6.6 情境压力测试模块

对应前端逻辑：

- `pressureQuestionGroups`
- `createPressureQuestionSet`
- `recordPressureProbe`

情境压力测试用于扩展 BuyMate 方向，不只观察 AI 干预本身，也记录直播电商中的压力线索。系统会随机抽取若干组压力问题，每页展示 3 题，让用户像聊天一样快速判断当前样本场景是否存在对应压力。

压力线索包括：

- `urgency`：限时紧迫，例如倒计时、尾款截止、闪购窗口；
- `scarcity`：稀缺库存，例如仅剩少量、限量名额、规格减少；
- `social_proof`：社交证明，例如热卖榜、弹幕下单、达人背书；
- `anchor_discount`：锚定折扣，例如划线价、满减门槛、分期弱化总价。

压力得分计算逻辑：

- 用户标记的问题按权重累加；
- 如果样本原价明显高于现价，增加折扣锚定信号；
- 如果样本库存较低，增加库存稀缺信号；
- 最终压力分封顶为 100。

压力等级：

- `low`：0 到 34；
- `medium`：35 到 64；
- `high`：65 到 100。

记录压力测试时，系统会写入 `pressure_probe` 行为，并保存：

- `level`
- `score`
- `cues`
- `cueLabels`
- `questions`
- `selectedQuestions`
- `answeredCount`
- `source`
- `cartValue`
- `productPrice`

完成压力测试后，系统会自动打开守护型 AI，并把压力分、压力等级和线索摘要填入提示词，帮助用户获得下一步理性决策建议。

### 6.7 研究后台模块

对应代码：

- `worker/src/modules/admin/`
- `worker/src/modules/research/`

研究后台包括：

- AI 配置；
- AI 连接测试；
- 用户数、样本数、记录数、模拟金额；
- 总行为数、今日行为数、今日对话数；
- 行为类型分布；
- 最近 7 天行为趋势；
- 会话列表；
- AI 使用分布；
- 干预策略触发次数；
- 压力画像数量、平均压力分、等级分布、高频线索；
- 决策记录列表与详情；
- 记录事件时间线。

后台统计会过滤管理员行为，只统计普通参与者数据。

## 7. 数据模型

数据库迁移位于 `worker/src/migrations/`。

### 7.1 用户与会话

`users`

- `id`
- `username`
- `email`
- `password_hash`
- `salt`
- `role`
- `avatar_url`
- `created_at`
- `last_login_at`

`sessions`

- `session_id`
- `user_id`
- `expires_at`
- `created_at`

会话同时保存在 D1 和 KV 中。KV 用于快速读取，D1 用于持久化和失效恢复。

### 7.2 商品样本

`categories`

- `id`
- `name`
- `name_en`
- `parent_id`
- `icon`
- `sort_order`

`products`

- `id`
- `category_id`
- `name`
- `name_en`
- `subtitle`
- `subtitle_en`
- `description`
- `description_en`
- `price`
- `original_price`
- `stock`
- `sales_count`
- `rating`
- `image_url`
- `images_json`
- `specs_json`
- `tags_json`
- `is_hot`
- `is_new`
- `is_promoted`
- `created_at`
- `updated_at`

### 7.3 待购与提交记录

`cart_items`

- `id`
- `user_id`
- `product_id`
- `quantity`
- `selected`
- `added_at`
- `updated_at`

`orders`

- `id`
- `order_no`
- `user_id`
- `total_amount`
- `discount_amount`
- `final_amount`
- `status`
- `shipping_address_json`
- `remark`
- `created_at`
- `paid_at`
- `shipped_at`
- `completed_at`
- `cancelled_at`

`order_items`

- `id`
- `order_id`
- `product_id`
- `product_name`
- `product_image`
- `price`
- `quantity`
- `subtotal`

`order_events`

- `id`
- `order_id`
- `event_type`
- `status`
- `note`
- `actor_user_id`
- `created_at`

### 7.4 AI 对话

`ai_config`

- `id`
- `deepseek_api_key`
- `deepseek_base_url`
- `deepseek_model`
- `seller_ai_enabled`
- `guardian_ai_enabled`
- `updated_at`
- `updated_by`

`ai_conversations`

- `id`
- `user_id`
- `session_id`
- `ai_type`
- `role`
- `content`
- `product_id`
- `metadata_json`
- `timestamp`

`ai_type` 支持 `seller`、`guardian` 和 `neutral`，当前前端主要使用 `seller` 与 `guardian`。

### 7.5 行为日志

`user_behaviors`

- `id`
- `user_id`
- `session_id`
- `behavior_type`
- `product_id`
- `duration_ms`
- `metadata_json`
- `timestamp`

当前后端允许的行为类型包括：

- `view_product`
- `add_cart`
- `remove_cart`
- `place_order`
- `chat_ai`
- `search`
- `intervention_check`
- `pressure_probe`

行为记录以 `metadata_json` 保存扩展字段，便于后续加入新的研究变量而不立即修改数据库结构。

## 8. 研究数据口径

### 8.1 行为事件

| 行为类型 | 触发场景 | 主要用途 |
| --- | --- | --- |
| `view_product` | 用户查看样本详情 | 计算样本曝光、浏览、会话 |
| `add_cart` | 加入待购清单或增加数量 | 观察购买倾向 |
| `remove_cart` | 从待购清单移除 | 观察撤回行为 |
| `place_order` | 提交模拟决策记录 | 观察最终决策 |
| `chat_ai` | 用户向 AI 发送消息 | 观察 AI 使用 |
| `search` | 用户搜索样本 | 观察主动探索 |
| `intervention_check` | 点击干预或结算前反思 | 观察理性干预触达 |
| `pressure_probe` | 完成压力测试 | 观察情境压力线索 |

### 8.2 会话口径

后端使用 Bearer token 作为 `session_id` 写入行为表和 AI 对话表。研究后台可以按 `session_id` 聚合最近会话、事件数量和用户数量。

### 8.3 样本口径

样本洞察以 `product_id` 为主键聚合：

- 行为表中的浏览、加购；
- 记录表中的提交次数和金额；
- AI 对话表中的咨询次数；
- 最近行为时间线。

### 8.4 干预口径

干预数据存储在 `user_behaviors.metadata_json` 中，主要字段为：

- `strategy`
- `source`
- `checked`
- `cartValue`
- `cartCount`

后台通过 `json_extract(metadata_json, '$.strategy')` 聚合各策略触发次数。

### 8.5 压力画像口径

压力画像同样存储在 `metadata_json` 中，主要字段为：

- `score`
- `level`
- `cues`
- `questions`

后台聚合：

- 压力画像总数；
- 平均压力分；
- 各等级数量和均分；
- 高频压力线索。

## 9. API 概览

### 9.1 身份认证

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`

### 9.2 商品样本

- `GET /api/products`
- `GET /api/products/:id`
- `GET /api/products/:id/image`
- `GET /api/products/:id/insights`
- `GET /api/categories`

### 9.3 待购清单

- `GET /api/cart`
- `POST /api/cart`
- `PUT /api/cart/:itemId`
- `DELETE /api/cart/:itemId`

### 9.4 决策记录

- `POST /api/orders`
- `GET /api/orders`
- `GET /api/orders/:id`

### 9.5 AI

- `POST /api/ai/chat`
- `POST /api/ai/promotional-nudge`
- `GET /api/ai/history`

### 9.6 研究与后台

- `POST /api/research/track`
- `GET /api/research/summary`
- `GET /api/admin/ai-config`
- `PUT /api/admin/ai-config`
- `POST /api/admin/ai-test`
- `GET /api/admin/stats`
- `GET /api/admin/orders`
- `GET /api/admin/orders/:id`
- `PUT /api/admin/orders/:id/status`

## 10. 技术架构

### 10.1 前端

前端使用：

- Vue 3；
- Vite；
- lucide-vue-next；
- markdown-it；
- 本地化字典 `view/src/i18n.js`。

前端状态主要包括：

- 当前用户与 token；
- 当前语言；
- 商品列表与分类；
- 当前选中样本；
- 待购清单；
- AI 对话抽屉；
- 压力测试弹窗；
- 结算前反思；
- 管理员后台数据。

### 10.2 后端

后端使用 Cloudflare Workers，入口为 `worker/src/app/index.js`。

路由注册在：

- `worker/src/app/routes.js`
- `worker/src/app/http.js`

`/api/` 开头的请求由自定义路由器处理，其余请求交给 Cloudflare Workers Assets 返回前端静态文件。

### 10.3 存储

- D1：结构化研究数据、用户、样本、行为、AI 对话、提交记录；
- KV：会话缓存；
- R2：商品样本图片；
- Workers Assets：前端静态资源。

## 11. 本地开发与部署

### 11.1 安装依赖

```bash
cd worker
npm install

cd ../view
npm install
```

### 11.2 前端构建

```bash
cd view
npm run build
```

### 11.3 Worker 本地开发

```bash
cd worker
npm run dev
```

`wrangler dev` 会加载 Worker，并通过 `assets.directory = "../view/dist"` 提供前端构建产物。

### 11.4 数据库初始化

当前脚本中的 D1 数据库名为 `zero-1-base`。

```bash
cd worker
npm run db:init
npm run db:seed
npm run db:events
npm run db:i18n
npm run db:interventions
```

如果 Cloudflare 项目中的数据库名不同，需要同步修改 `worker/package.json` 和 `worker/wrangler.jsonc`。

### 11.5 部署

```bash
cd worker
npm run deploy
```

该命令会先构建前端，再执行 `wrangler deploy`。

## 12. 研究流程建议

一次标准实验或演示流程可以按以下步骤执行：

1. 管理员注册  
   使用用户名 `admin` 注册管理员账号，进入研究后台配置 DeepSeek API。

2. 参与者注册  
   使用普通用户名注册参与者账号。

3. 样本浏览  
   参与者浏览商品样本，查看详情，使用搜索和分类功能。

4. AI 对照交互  
   参与者可以分别咨询促销型 AI 和守护型 AI。系统记录 AI 类型、角色、内容、样本上下文和时间。

5. 干预触发  
   参与者点击需求反思、同类比较、话术重构或冷静延迟，系统打开守护型 AI 并记录干预事件。

6. 压力测试  
   参与者完成情境压力专项测试，系统记录压力分、等级和线索，并生成守护型 AI 提示。

7. 待购与提交  
   参与者加入待购清单，在提交前完成反思检查，并提交模拟决策记录。

8. 后台分析  
   管理员查看行为、会话、AI 对话、干预触发、压力画像和决策记录详情。

## 13. 可分析指标

研究者可以基于现有日志计算以下指标：

- 样本浏览量；
- 样本加购率；
- 样本提交率；
- 浏览到提交转化率；
- AI 使用频次；
- 促销型 AI 与守护型 AI 使用比例；
- 主动促销触达后的用户回复率；
- 干预策略触发次数；
- 结算前反思完成率；
- 压力测试完成数；
- 平均压力分；
- 高频压力线索；
- 压力等级与加购、提交之间的关系；
- AI 对话长度与最终决策之间的关系；
- 会话级行为路径，例如浏览、AI、干预、加购、提交的顺序。

## 14. 安全、隐私与伦理边界

ShopGuard 是研究原型，不应被解释为真实医疗、心理、金融或消费诊断系统。使用时建议注意：

- 明确告知参与者系统会记录行为、AI 对话和提交记录；
- 明确说明系统内的“订单”是模拟决策记录，不是真实购买；
- 不把守护型 AI 的建议作为最终消费判断；
- 不用促销型 AI 诱导真实付款；
- 不收集研究无关的敏感个人信息；
- 管理员应妥善保护 DeepSeek API Key；
- 导出或分析日志时应去标识化用户信息；
- 如果用于正式用户研究，应补充伦理审查、知情同意和退出机制。

## 15. 项目限制

当前原型仍有以下限制：

- 未包含原论文的完整实验流程、量表和统计分析脚本；
- 压力分为工程化启发式分数，不等同于经过验证的心理测量量表；
- 样本数据主要用于演示，商品字段与图片素材需要按研究任务继续扩充；
- AI 输出受模型、提示词和配置影响，需要研究者记录具体模型版本和参数；
- 行为追踪依赖前端触发，不能完全覆盖所有用户意图；
- 当前后端服务已允许 `pressure_probe` 行为，但数据库迁移中的 `user_behaviors.behavior_type` CHECK 约束需要在正式初始化或部署前确认包含该类型；
- 目前未内置数据导出、匿名化处理和实验分组随机化界面。

## 16. 后续扩展方向

可以继续扩展：

- 实验条件随机分配，例如无 AI、促销 AI、守护 AI、双 AI；
- 前测和后测问卷；
- 冲动购买倾向、预算压力、后悔程度等量表；
- 数据导出为 CSV 或 JSON；
- 会话路径可视化；
- AI 回复质量人工标注；
- 干预时机实验，例如进入详情、停留、加购、提交前；
- 更细粒度的停留时长和页面滚动记录；
- R2 商品图片管理后台；
- 多语言研究材料管理；
- 隐私保护和匿名化导出工具。

## 17. 代码索引

| 位置 | 说明 |
| --- | --- |
| `README.md` | 项目快速说明 |
| `view/src/App.vue` | 前端主应用、交互流程、干预与压力测试 |
| `view/src/api.js` | 前端 API 封装 |
| `view/src/i18n.js` | 中英文文案 |
| `worker/src/app/index.js` | Worker 入口 |
| `worker/src/app/http.js` | 路由、认证、响应和错误处理工具 |
| `worker/src/app/routes.js` | API 路由注册 |
| `worker/src/modules/auth/` | 注册、登录、退出 |
| `worker/src/modules/shop/` | 商品、分类、样本洞察、图片 |
| `worker/src/modules/cart/` | 待购清单 |
| `worker/src/modules/order/` | 模拟决策记录 |
| `worker/src/modules/ai/` | DeepSeek 调用、促销 AI、守护 AI |
| `worker/src/modules/research/` | 行为追踪与研究汇总 |
| `worker/src/modules/admin/` | 管理后台接口 |
| `worker/src/migrations/` | D1 数据库迁移与种子数据 |
| `worker/wrangler.jsonc` | Cloudflare Workers、D1、KV、R2、Assets 配置 |
