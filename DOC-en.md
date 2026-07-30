# ShopGuard Research Project Documentation

## 1. Project Overview

ShopGuard is an open-source prototype system for research on consumer decision-making in live commerce. Built on Cloudflare Workers, D1, KV, R2, and Vue 3, it provides a runnable "live-commerce-style" environment for sample browsing, wish-listing, AI conversations, decision submission, and research administration.

The research direction of this project is inspired by the ACM CHI 2026 paper "BuyMate: Making AI Interventions Effective in Promoting Rational Consumption in Live Commerce". This repository does not claim to reproduce the paper's full experimental materials, participant recruitment process, or measurement scales. Instead, it turns the core direction into an engineering-oriented and extensible research platform for observing:

- how promotional AI affects users' purchase intentions;
- how guardian AI can intervene for rational consumption;
- how live-commerce pressure cues such as time limits, scarcity, social proof, and discount anchoring influence decisions;
- what behavioral traces users leave during browsing, carting, AI consultation, intervention, and decision submission.

The codebase has two main parts:

- `view/`: a Vue 3 + Vite frontend, including sample browsing, AI chat, pressure probes, wish list, decision submission, and the research dashboard.
- `worker/`: a Cloudflare Workers backend API, responsible for authentication, product samples, wish-list items, simulated decision records, AI calls, behavior tracking, and admin statistics.

## 2. Research Background and Motivation

Live commerce often uses highly stimulating and real-time interfaces and scripts to push purchase decisions, such as countdowns, low-stock warnings, host prompts, bestseller rankings, live comments showing purchases, strikethrough prices, and expiring coupons. These signals compress the time users have for comparison, budget judgment, and need reflection, making impulse purchases more likely.

The BuyMate direction focuses on the idea that AI can serve not only as a sales assistant, but also as a consumer guardian. When users face promotional pressure, guardian AI can provide gentle, explainable, and real-time reminders that help users recheck their actual needs, budget, alternatives, and the facts behind promotional language.

ShopGuard turns this research direction into a runnable experimental environment so researchers can:

- simulate promotional AI and guardian AI as two contrast conditions on the same platform;
- record the full behavioral chain from sample exposure to decision submission;
- turn BuyMate-style rational consumption interventions into clickable, recordable, and analyzable interaction events;
- extend the measurement of "situational pressure" and observe the relationship between live-commerce pressure cues and AI interventions.

## 3. Research Goals

The main goals of this project include:

1. Build a live-commerce-style consumer decision prototype  
   Users can browse product samples, search categories, view details, add items to a wish list, and finally submit a simulated decision record.

2. Implement a dual-AI assistant comparison  
   The system provides "promotional AI" and "guardian AI". Promotional AI simulates persuasive sales language in live commerce, while guardian AI provides rational consumption interventions.

3. Convert BuyMate intervention strategies into events  
   The frontend provides four intervention entry points: need reflection, peer comparison, persuasion reframing, and cooling-off delay. Every intervention trigger is recorded in `user_behaviors` for later analysis.

4. Record situational pressure profiles  
   The system designs pressure cues such as time urgency, inventory scarcity, social proof, and anchored discounts as dedicated probe questions. After completion, participants receive a pressure score, pressure level, and triggered cues, which are written into the behavior log.

5. Provide a research dashboard  
   Administrators can view user counts, behavior counts, AI conversation counts, simulated spending, popular samples, intervention triggers, pressure-level distribution, session summaries, and decision record details.

## 4. Core Research Questions

This project can support the following research questions:

- RQ1: Do promotional AI and guardian AI produce different effects on users' carting, consultation, and final submission behavior?
- RQ2: When users face live-commerce pressure cues, are they more likely to trigger guardian AI interventions or complete pre-checkout reflection?
- RQ3: Among need reflection, peer comparison, persuasion reframing, and cooling-off delay, which interventions are users more likely to use voluntarily?
- RQ4: Are browsing sessions with higher pressure scores associated with longer dwell time, higher carting rates, or more AI conversations?
- RQ5: Can translating sales language into neutral facts help users delay or recalibrate purchase decisions?

## 5. System Roles

The system contains two user roles.

### 5.1 Regular Participants

Regular participants can:

- register and log in;
- browse product samples;
- search and filter categories;
- view sample details and sample insights;
- chat with promotional AI or guardian AI;
- start BuyMate interventions;
- complete situational pressure probes;
- add items to or remove items from the wish list;
- complete reflection checks before submission;
- submit simulated decision records;
- view their own history.

Regular participants' behaviors are recorded in the research logs.

### 5.2 Administrators

An account registered with the username `admin` is marked as an administrator. Administrators are used for research management and do not participate in the regular shopping flow.

Administrators can:

- configure the DeepSeek API Key, Base URL, and model name;
- enable or disable promotional AI and guardian AI;
- test the AI connection;
- view research summaries;
- view behavior statistics;
- view pressure-profile statistics;
- view and manage submitted records;
- change the status of research records to `completed` or `cancelled`.

Administrator accounts do not generate regular participant behavior logs and cannot use the promotional or guardian AI chat flow.

## 6. Functional Modules

### 6.1 Sample Browsing Module

Related code:

- `worker/src/modules/shop/`
- `view/src/App.vue`
- `view/src/api.js`

Main capabilities:

- fetch the product sample list;
- filter by category;
- search samples;
- view sample details;
- return Chinese and English localized fields;
- read sample images from R2;
- view research insights for a single sample.

Sample insights include:

- views;
- cart additions;
- submissions;
- simulated amount;
- AI usage count;
- recent behaviors;
- related samples;
- conversion rate.

### 6.2 Wish List Module

Related code:

- `worker/src/modules/cart/`
- `view/src/api.js`

Main capabilities:

- add samples to the wish list;
- update quantity;
- remove samples;
- view the current user's wish list.

The frontend triggers corresponding behavior records such as `add_cart` and `remove_cart`.

### 6.3 Simulated Decision Record Module

Related code:

- `worker/src/modules/order/`
- `worker/src/migrations/0003_order_events.sql`

In this project, an "order" is a simulated decision record in a research context. It does not represent real payment or real fulfillment. After a user submits a decision, the system:

- creates one `orders` record;
- creates multiple `order_items` records;
- writes one timeline event into `order_events`;
- clears the current wish list;
- records `place_order` in the behavior log.

Submitted records default to the `completed` status, indicating that this simulated decision has been recorded.

### 6.4 Dual AI Assistant Module

Related code:

- `worker/src/modules/ai/service.js`
- `worker/src/modules/ai/seller.js`
- `worker/src/modules/ai/guardian.js`
- `worker/src/modules/ai/deepseek.js`

The system calls large language models through the DeepSeek Chat Completions-compatible interface. Administrators can configure:

- `deepseek_api_key`
- `deepseek_base_url`
- `deepseek_model`
- `seller_ai_enabled`
- `guardian_ai_enabled`

#### Promotional AI

Promotional AI is used as a research contrast condition and simulates sales-oriented AI in live commerce. Its prompt characteristics include:

- enthusiastic recommendations;
- emphasis on sample advantages;
- use of sales contexts such as time limits, inventory, popularity, and positive reviews;
- explicit disclosure that it is a promotional simulation condition in the study;
- no fabrication of inventory, sales volume, discounts, or reviews that do not exist in the sample fields.

The system also implements proactive promotional outreach: when a user stays on a sample detail page for more than 20 seconds, promotional AI may send a proactive prompt. To avoid excessive interruption, the system limits the number of unreplied promotional messages.

#### Guardian AI

Guardian AI is used for rational consumption intervention. Its prompt prioritizes the following strategies:

- need reflection;
- budget calibration;
- comparison with similar products;
- sales-language reframing;
- delayed purchase;
- transparent explanation.

Guardian AI does not make the final decision for the user. Instead, it helps the user pause, review, and compare.

### 6.5 BuyMate Intervention Module

Related frontend logic:

- `interventionCards`
- `startIntervention`
- `trackCheckoutReflection`

The system includes four intervention types:

| Intervention Strategy | Event key | Purpose |
| --- | --- | --- |
| Need reflection | `need_reflection` | Check whether the purchase was planned, whether alternatives already exist, and the likely real usage frequency |
| Peer comparison | `comparison` | Recompare price, durability, after-sales support, and non-promotional price |
| Persuasion reframing | `persuasion_reframe` | Translate promotional language such as time limits, bestsellers, and scarcity into neutral facts |
| Cooling-off delay | `delay` | Turn an immediate decision into a later review |

Each time a user clicks an intervention card, the system records:

- `behavior_type = intervention_check`
- `productId`
- `strategy`
- `source`
- `cartValue`

Pre-checkout reflection is also recorded as `intervention_check`, with additional metadata such as whether the checkbox was selected and the wish-list item count.

### 6.6 Situational Pressure Probe Module

Related frontend logic:

- `pressureQuestionGroups`
- `createPressureQuestionSet`
- `recordPressureProbe`

The situational pressure probe extends the BuyMate direction. It observes not only AI interventions, but also pressure cues in live commerce. The system randomly samples several groups of pressure questions and displays 3 questions per page, allowing users to quickly judge the current sample scenario in a chat-like flow.

Pressure cues include:

- `urgency`: time urgency, such as countdowns, balance-payment deadlines, and flash-sale windows;
- `scarcity`: inventory scarcity, such as only a few items left, limited quotas, and reduced specification availability;
- `social_proof`: social proof, such as bestseller rankings, live comments showing purchases, and influencer endorsements;
- `anchor_discount`: anchored discounts, such as strikethrough prices, threshold discounts, and installment framing that weakens the perception of total price.

Pressure score calculation:

- selected questions are accumulated by weight;
- if the sample's original price is clearly higher than the current price, a discount-anchor signal is added;
- if the sample stock is low, an inventory-scarcity signal is added;
- the final pressure score is capped at 100.

Pressure levels:

- `low`: 0 to 34;
- `medium`: 35 to 64;
- `high`: 65 to 100.

When a pressure probe is recorded, the system writes a `pressure_probe` behavior and stores:

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

After the pressure probe is completed, the system automatically opens guardian AI and inserts the pressure score, pressure level, and cue summary into the prompt, helping the user obtain next-step rational decision advice.

### 6.7 Research Dashboard Module

Related code:

- `worker/src/modules/admin/`
- `worker/src/modules/research/`

The research dashboard includes:

- AI configuration;
- AI connection testing;
- user count, sample count, record count, and simulated amount;
- total behaviors, today's behaviors, and today's conversations;
- behavior type distribution;
- behavior trends over the last 7 days;
- session list;
- AI usage distribution;
- intervention strategy trigger counts;
- pressure-profile count, average pressure score, level distribution, and frequent cues;
- decision record list and details;
- record event timeline.

Dashboard statistics filter out administrator behavior and only count regular participant data.

## 7. Data Model

Database migrations are located in `worker/src/migrations/`.

### 7.1 Users and Sessions

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

Sessions are stored in both D1 and KV. KV is used for fast reads, while D1 is used for persistence and invalidation recovery.

### 7.2 Product Samples

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

### 7.3 Wish List and Submitted Records

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

### 7.4 AI Conversations

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

`ai_type` supports `seller`, `guardian`, and `neutral`. The current frontend mainly uses `seller` and `guardian`.

### 7.5 Behavior Logs

`user_behaviors`

- `id`
- `user_id`
- `session_id`
- `behavior_type`
- `product_id`
- `duration_ms`
- `metadata_json`
- `timestamp`

The behavior types currently allowed by the backend include:

- `view_product`
- `add_cart`
- `remove_cart`
- `place_order`
- `chat_ai`
- `search`
- `intervention_check`
- `pressure_probe`

Behavior records store extension fields in `metadata_json`, making it easier to add new research variables later without immediately changing the database schema.

## 8. Research Data Definitions

### 8.1 Behavior Events

| Behavior Type | Trigger Scenario | Main Use |
| --- | --- | --- |
| `view_product` | User views sample details | Calculate sample exposure, browsing, and sessions |
| `add_cart` | User adds an item to the wish list or increases quantity | Observe purchase tendency |
| `remove_cart` | User removes an item from the wish list | Observe withdrawal behavior |
| `place_order` | User submits a simulated decision record | Observe final decision |
| `chat_ai` | User sends a message to AI | Observe AI usage |
| `search` | User searches samples | Observe active exploration |
| `intervention_check` | User clicks an intervention or completes pre-checkout reflection | Observe rational intervention reach |
| `pressure_probe` | User completes a pressure probe | Observe situational pressure cues |

### 8.2 Session Definition

The backend uses the Bearer token as the `session_id` written into the behavior table and AI conversation table. The research dashboard can aggregate recent sessions, event counts, and user counts by `session_id`.

### 8.3 Sample Definition

Sample insights are aggregated by `product_id`:

- views and cart additions in the behavior table;
- submission counts and amounts in the record tables;
- consultation counts in the AI conversation table;
- recent behavior timeline.

### 8.4 Intervention Definition

Intervention data is stored in `user_behaviors.metadata_json`. The main fields are:

- `strategy`
- `source`
- `checked`
- `cartValue`
- `cartCount`

The dashboard aggregates trigger counts for each strategy through `json_extract(metadata_json, '$.strategy')`.

### 8.5 Pressure Profile Definition

Pressure profiles are also stored in `metadata_json`. The main fields are:

- `score`
- `level`
- `cues`
- `questions`

The dashboard aggregates:

- total number of pressure profiles;
- average pressure score;
- count and average score by level;
- frequent pressure cues.

## 9. API Overview

### 9.1 Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`

### 9.2 Product Samples

- `GET /api/products`
- `GET /api/products/:id`
- `GET /api/products/:id/image`
- `GET /api/products/:id/insights`
- `GET /api/categories`

### 9.3 Wish List

- `GET /api/cart`
- `POST /api/cart`
- `PUT /api/cart/:itemId`
- `DELETE /api/cart/:itemId`

### 9.4 Decision Records

- `POST /api/orders`
- `GET /api/orders`
- `GET /api/orders/:id`

### 9.5 AI

- `POST /api/ai/chat`
- `POST /api/ai/promotional-nudge`
- `GET /api/ai/history`

### 9.6 Research and Admin

- `POST /api/research/track`
- `GET /api/research/summary`
- `GET /api/admin/ai-config`
- `PUT /api/admin/ai-config`
- `POST /api/admin/ai-test`
- `GET /api/admin/stats`
- `GET /api/admin/orders`
- `GET /api/admin/orders/:id`
- `PUT /api/admin/orders/:id/status`

## 10. Technical Architecture

### 10.1 Frontend

The frontend uses:

- Vue 3;
- Vite;
- lucide-vue-next;
- markdown-it;
- the localization dictionary `view/src/i18n.js`.

The main frontend state includes:

- current user and token;
- current language;
- product list and categories;
- currently selected sample;
- wish list;
- AI conversation drawer;
- pressure probe modal;
- pre-checkout reflection;
- administrator dashboard data.

### 10.2 Backend

The backend uses Cloudflare Workers, with `worker/src/app/index.js` as the entry point.

Routes are registered in:

- `worker/src/app/routes.js`
- `worker/src/app/http.js`

Requests starting with `/api/` are handled by the custom router. Other requests are passed to Cloudflare Workers Assets to serve the frontend static files.

### 10.3 Storage

- D1: structured research data, users, samples, behaviors, AI conversations, and submitted records;
- KV: session cache;
- R2: product sample images;
- Workers Assets: frontend static assets.

## 11. Local Development and Deployment

### 11.1 Install Dependencies

```bash
cd worker
npm install

cd ../view
npm install
```

### 11.2 Frontend Build

```bash
cd view
npm run build
```

### 11.3 Worker Local Development

```bash
cd worker
npm run dev
```

`wrangler dev` loads the Worker and serves the frontend build output through `assets.directory = "../view/dist"`.

### 11.4 Database Initialization

The D1 database name in the current scripts is `zero-1-base`.

```bash
cd worker
npm run db:init
npm run db:seed
npm run db:events
npm run db:i18n
npm run db:interventions
```

If the database name in the Cloudflare project is different, update `worker/package.json` and `worker/wrangler.jsonc` accordingly.

### 11.5 Deployment

```bash
cd worker
npm run deploy
```

This command builds the frontend first and then runs `wrangler deploy`.

## 12. Suggested Research Flow

A standard experiment or demo flow can be executed as follows:

1. Administrator registration  
   Register an administrator account with the username `admin`, then enter the research dashboard and configure the DeepSeek API.

2. Participant registration  
   Register a participant account with a regular username.

3. Sample browsing  
   The participant browses product samples, views details, and uses search and category features.

4. AI comparison interaction  
   The participant can consult promotional AI and guardian AI separately. The system records AI type, role, content, sample context, and time.

5. Intervention trigger  
   The participant clicks need reflection, peer comparison, persuasion reframing, or cooling-off delay. The system opens guardian AI and records the intervention event.

6. Pressure probe  
   The participant completes the situational pressure probe. The system records the pressure score, level, and cues, then generates a guardian AI prompt.

7. Wish list and submission  
   The participant adds items to the wish list, completes a reflection check before submission, and submits a simulated decision record.

8. Dashboard analysis  
   The administrator reviews behaviors, sessions, AI conversations, intervention triggers, pressure profiles, and decision record details.

## 13. Analyzable Metrics

Researchers can calculate the following metrics from the existing logs:

- sample views;
- sample carting rate;
- sample submission rate;
- browse-to-submission conversion rate;
- AI usage frequency;
- promotional AI versus guardian AI usage ratio;
- user reply rate after proactive promotional outreach;
- intervention strategy trigger counts;
- pre-checkout reflection completion rate;
- pressure probe completion count;
- average pressure score;
- frequent pressure cues;
- relationship between pressure level and carting or submission;
- relationship between AI conversation length and final decision;
- session-level behavior paths, such as the sequence of browsing, AI, intervention, carting, and submission.

## 14. Safety, Privacy, and Ethical Boundaries

ShopGuard is a research prototype and should not be interpreted as a real medical, psychological, financial, or consumer diagnosis system. Recommended precautions include:

- clearly inform participants that the system records behaviors, AI conversations, and submitted records;
- clearly state that "orders" in the system are simulated decision records, not real purchases;
- do not treat guardian AI suggestions as final consumer judgments;
- do not use promotional AI to induce real payment;
- do not collect sensitive personal information unrelated to the study;
- administrators should properly protect the DeepSeek API Key;
- de-identify user information when exporting or analyzing logs;
- if used for formal user research, add ethics review, informed consent, and withdrawal mechanisms.

## 15. Project Limitations

The current prototype still has the following limitations:

- it does not include the full experimental process, scales, or statistical analysis scripts from the original paper;
- the pressure score is an engineering heuristic and is not equivalent to a validated psychometric scale;
- sample data is mainly for demonstration, and product fields and image assets need to be expanded according to the research task;
- AI output is affected by the model, prompts, and configuration, so researchers need to record the specific model version and parameters;
- behavior tracking depends on frontend triggers and cannot fully cover all user intentions;
- the current backend service already allows `pressure_probe` behavior, but the `user_behaviors.behavior_type` CHECK constraint in database migrations should be confirmed to include this type before formal initialization or deployment;
- built-in data export, anonymization processing, and experiment-group randomization interfaces are not currently included.

## 16. Future Extensions

Potential extensions include:

- randomized assignment of experimental conditions, such as no AI, promotional AI, guardian AI, and dual AI;
- pre-test and post-test questionnaires;
- scales for impulse buying tendency, budget pressure, regret, and related constructs;
- export data as CSV or JSON;
- session path visualization;
- manual annotation of AI response quality;
- experiments on intervention timing, such as detail-page entry, dwell time, carting, and pre-submission;
- finer-grained dwell-time and page-scroll recording;
- R2 product image management dashboard;
- multilingual research material management;
- privacy-preserving and anonymized export tools.

## 17. Code Index

| Location | Description |
| --- | --- |
| `README.md` | Project quick overview |
| `view/src/App.vue` | Main frontend application, interaction flow, interventions, and pressure probes |
| `view/src/api.js` | Frontend API wrapper |
| `view/src/i18n.js` | Chinese and English copy |
| `worker/src/app/index.js` | Worker entry point |
| `worker/src/app/http.js` | Routing, authentication, response, and error-handling utilities |
| `worker/src/app/routes.js` | API route registration |
| `worker/src/modules/auth/` | Registration, login, and logout |
| `worker/src/modules/shop/` | Products, categories, sample insights, and images |
| `worker/src/modules/cart/` | Wish list |
| `worker/src/modules/order/` | Simulated decision records |
| `worker/src/modules/ai/` | DeepSeek calls, promotional AI, and guardian AI |
| `worker/src/modules/research/` | Behavior tracking and research summaries |
| `worker/src/modules/admin/` | Admin dashboard APIs |
| `worker/src/migrations/` | D1 database migrations and seed data |
| `worker/wrangler.jsonc` | Cloudflare Workers, D1, KV, R2, and Assets configuration |
