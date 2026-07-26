import {
  TokenManager,
  AuthAPI,
  ProductAPI,
  CartAPI,
  OrderAPI,
  AIAPI,
  AdminAPI,
  ResearchAPI,
} from "./api.js";

const state = {
  user: safeGetUser(),
  token: TokenManager.get(),
  categories: [],
  products: [],
  cart: [],
  orders: [],
  activeProduct: null,
  checkoutOrder: null,
  adminStats: null,
  adminConfig: null,
  route: null,
  filters: {
    q: "",
    category: "",
    sort: "hot",
  },
  ai: {
    open: false,
    activeType: "seller",
    history: {
      seller: [],
      guardian: [],
    },
    sending: false,
  },
};

const els = {};

init().catch((error) => {
  console.error(error);
  document.getElementById("app").innerHTML = `<div class="page-shell"><div class="alert alert-danger">应用初始化失败：${escapeHtml(error.message || String(error))}</div></div>`;
});

function safeGetUser() {
  try {
    return TokenManager.getUser();
  } catch {
    TokenManager.clear();
    return null;
  }
}

async function init() {
  cacheElements();
  bindGlobalEvents();
  syncHashDefault();

  await Promise.all([
    loadCategories(),
    loadProducts(),
  ]);

  if (state.token) {
    await refreshSessionData();
  }

  await route();
  updateCartBadge();
}

function cacheElements() {
  els.header = document.getElementById("header");
  els.app = document.getElementById("app");
  els.cartDrawer = document.getElementById("cart-drawer");
  els.cartItems = document.getElementById("cart-items");
  els.cartTotal = document.getElementById("cart-total");
  els.cartToggle = document.getElementById("ai-toggle-btn");
  els.cartClose = document.getElementById("cart-close-btn");
  els.cartCheckout = document.getElementById("cart-checkout-btn");
  els.aiWindow = document.getElementById("ai-chat-window");
  els.aiMessages = document.getElementById("ai-messages");
  els.aiInput = document.getElementById("ai-input");
  els.aiSend = document.getElementById("ai-send-btn");
  els.aiClose = document.getElementById("ai-close-btn");
  els.aiTabs = Array.from(document.querySelectorAll(".ai-tab"));
}

function bindGlobalEvents() {
  window.addEventListener("hashchange", () => route());

  document.addEventListener("click", async (event) => {
    const actionEl = event.target.closest("[data-action]");
    if (!actionEl) return;

    const { action } = actionEl.dataset;
    const productId = actionEl.dataset.productId;
    const orderId = actionEl.dataset.orderId;
    const itemId = actionEl.dataset.itemId;
    const categoryId = actionEl.dataset.categoryId;
    const value = actionEl.dataset.value;

    if (action === "navigate") {
      navigate(actionEl.dataset.to);
      return;
    }
    if (action === "open-product") {
      navigate(`/product/${productId}`);
      return;
    }
    if (action === "open-cart") {
      openCart();
      return;
    }
    if (action === "close-cart") {
      closeCart();
      return;
    }
    if (action === "filter-category") {
      state.filters.category = categoryId;
      updateProductsHash();
      await route();
      return;
    }
    if (action === "set-sort") {
      state.filters.sort = value;
      updateProductsHash();
      await renderMainPage();
      return;
    }
    if (action === "add-cart") {
      await addProductToCart(productId, 1);
      return;
    }
    if (action === "inc-cart") {
      await changeCartQuantity(itemId, 1);
      return;
    }
    if (action === "dec-cart") {
      await changeCartQuantity(itemId, -1);
      return;
    }
    if (action === "remove-cart") {
      await removeCartItem(itemId);
      return;
    }
    if (action === "checkout") {
      navigate("/checkout");
      return;
    }
    if (action === "open-order") {
      navigate(`/orders/${orderId}`);
      return;
    }
    if (action === "ai-open") {
      openAiWindow(value || state.ai.activeType);
      return;
    }
    if (action === "logout") {
      await logout();
      return;
    }
    if (action === "goto-search") {
      const query = actionEl.dataset.query || "";
      state.filters.q = query;
      updateProductsHash();
      await route();
      return;
    }
  });

  document.addEventListener("submit", async (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;

    if (form.id === "search-form") {
      event.preventDefault();
      const formData = new FormData(form);
      state.filters.q = String(formData.get("q") || "").trim();
      updateProductsHash();
      await route();
      if (state.route?.page === "product") return;
      track("search", null, { q: state.filters.q });
      return;
    }

    if (form.id === "login-form") {
      event.preventDefault();
      await handleLogin(form);
      return;
    }

    if (form.id === "register-form") {
      event.preventDefault();
      await handleRegister(form);
      return;
    }

    if (form.id === "checkout-form") {
      event.preventDefault();
      await handleCheckout(form);
      return;
    }

    if (form.id === "admin-config-form") {
      event.preventDefault();
      await handleAdminSave(form);
      return;
    }

    if (form.id === "ai-form") {
      event.preventDefault();
      await handleAiSend(form);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeCart();
      closeAiWindow();
    }
  });

  if (els.cartClose) els.cartClose.addEventListener("click", closeCart);
  if (els.cartToggle) els.cartToggle.addEventListener("click", toggleAiWindow);
  if (els.aiClose) els.aiClose.addEventListener("click", closeAiWindow);
  if (els.cartCheckout) els.cartCheckout.addEventListener("click", () => navigate("/checkout"));

  document.addEventListener("click", (event) => {
    const tab = event.target.closest(".ai-tab");
    if (!tab) return;
    const type = tab.dataset.type;
    if (type && type !== state.ai.activeType) {
      openAiWindow(type);
    }
  });
}

function syncHashDefault() {
  if (!location.hash || location.hash === "#") {
    location.hash = "#/products";
  }
}

function navigate(path) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  location.hash = `#${normalized}`;
}

function parseRoute() {
  const raw = location.hash.replace(/^#\/?/, "");
  const [pathPart, queryPart = ""] = raw.split("?");
  const segments = pathPart.split("/").filter(Boolean);
  const page = segments[0] || "products";
  const id = segments[1] || null;
  const query = new URLSearchParams(queryPart);

  state.filters.q = query.get("q") || state.filters.q || "";
  state.filters.category = query.get("category") || state.filters.category || "";
  state.filters.sort = query.get("sort") || state.filters.sort || "hot";

  return { page, id, query };
}

function updateProductsHash() {
  const params = new URLSearchParams();
  if (state.filters.q) params.set("q", state.filters.q);
  if (state.filters.category) params.set("category", state.filters.category);
  if (state.filters.sort) params.set("sort", state.filters.sort);
  const query = params.toString();
  location.hash = `#/products${query ? `?${query}` : ""}`;
}

async function route() {
  state.route = parseRoute();
  renderHeader();

  const page = state.route.page;
  if (page === "product" && state.route.id) {
    await renderProductPage(state.route.id);
    return;
  }
  if (page === "login") {
    renderAuthPage("login");
    return;
  }
  if (page === "register") {
    renderAuthPage("register");
    return;
  }
  if (page === "cart") {
    await loadCart();
    renderCartPage();
    return;
  }
  if (page === "checkout") {
    await loadCart();
    renderCheckoutPage();
    return;
  }
  if (page === "orders") {
    await renderOrdersPage(state.route.id);
    return;
  }
  if (page === "admin") {
    await renderAdminPage();
    return;
  }

  await renderMainPage();
}

function renderHeader() {
  const loggedIn = !!state.user;
  const isAdmin = state.user?.role === "admin";
  const cartCount = state.cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  els.header.innerHTML = `
    <div class="topbar">
      <button class="brand" type="button" data-action="navigate" data-to="/products">ShopGuard</button>
      <form class="search-form" id="search-form">
        <input name="q" value="${escapeHtml(state.filters.q)}" placeholder="搜索商品、品牌、关键词" />
        <button type="submit">搜索</button>
      </form>
      <div class="nav-group">
        <button type="button" class="nav-btn" data-action="navigate" data-to="/products">商品</button>
        <button type="button" class="nav-btn" data-action="navigate" data-to="/orders">订单</button>
        ${isAdmin ? `<button type="button" class="nav-btn" data-action="navigate" data-to="/admin">管理</button>` : ""}
        <button type="button" class="nav-btn cart-btn" data-action="open-cart">购物车 <span class="nav-badge">${cartCount}</span></button>
        ${loggedIn ? `<button type="button" class="nav-btn" data-action="logout">退出</button>` : `<button type="button" class="nav-btn" data-action="navigate" data-to="/login">登录</button><button type="button" class="nav-btn" data-action="navigate" data-to="/register">注册</button>`}
      </div>
    </div>
  `;
}

async function renderMainPage() {
  const filtered = filterProducts();
  const categoryName = state.categories.find((item) => item.id === state.filters.category)?.name || "全部";
  const sortName = {
    hot: "综合排序",
    price_asc: "价格升序",
    price_desc: "价格降序",
    rating: "评分优先",
    newest: "最新上架",
  }[state.filters.sort] || "综合排序";

  els.app.innerHTML = `
    <div class="page-shell">
      <section class="page-intro">
        <div>
          <h1>ShopGuard 商品中心</h1>
          <p>浏览商品、加入购物车、咨询双 AI 助手、完成下单和订单查看。</p>
        </div>
        <div class="intro-stats">
          <div class="stat-chip"><span>${state.products.length}</span><small>商品</small></div>
          <div class="stat-chip"><span>${state.categories.length}</span><small>分类</small></div>
          <div class="stat-chip"><span>${state.cart.length}</span><small>购物车</small></div>
        </div>
      </section>

      <section class="toolbar">
        <div class="toolbar-left">
          <span class="toolbar-label">分类</span>
          <div class="chip-row">
            <button class="chip ${!state.filters.category ? "active" : ""}" type="button" data-action="filter-category" data-category-id="">全部</button>
            ${state.categories.map((category) => `
              <button class="chip ${state.filters.category === category.id ? "active" : ""}" type="button" data-action="filter-category" data-category-id="${escapeHtml(category.id)}">${escapeHtml(category.name)}</button>
            `).join("")}
          </div>
        </div>
        <div class="toolbar-right">
          <span class="toolbar-label">排序</span>
          <div class="chip-row">
            ${sortChip("hot", "综合")}
            ${sortChip("price_asc", "价格 ↑")}
            ${sortChip("price_desc", "价格 ↓")}
            ${sortChip("rating", "评分")}
            ${sortChip("newest", "最新")}
          </div>
        </div>
      </section>

      <section class="result-strip">
        <div>
          <strong>${filtered.length}</strong> 个结果
          <span class="muted">· ${escapeHtml(categoryName)} · ${escapeHtml(sortName)}</span>
        </div>
        <button class="link-btn" type="button" data-action="navigate" data-to="/products">重置视图</button>
      </section>

      ${filtered.length ? `<section class="product-grid">${filtered.map(renderProductCard).join("")}</section>` : emptyState("没有找到匹配的商品", "试试别的关键词或切换分类")}
    </div>
  `;
}

function sortChip(value, label) {
  return `<button class="chip ${state.filters.sort === value ? "active" : ""}" type="button" data-action="set-sort" data-value="${value}">${label}</button>`;
}

function renderProductCard(product) {
  const image = product.image_url || product.images?.[0] || "https://via.placeholder.com/400";
  const tags = Array.isArray(product.tags) ? product.tags : [];
  return `
    <article class="product-card" data-action="open-product" data-product-id="${escapeHtml(product.id)}">
      <img class="product-image" src="${escapeHtml(image)}" alt="${escapeHtml(product.name)}" />
      <div class="product-info">
        <div class="product-badges">
          ${product.is_hot ? `<span class="flag flag-hot">热销</span>` : ""}
          ${product.is_new ? `<span class="flag flag-new">新品</span>` : ""}
          ${product.is_promoted ? `<span class="flag flag-deal">促销</span>` : ""}
        </div>
        <h3 class="product-name">${escapeHtml(product.name)}</h3>
        <p class="product-subtitle">${escapeHtml(product.subtitle || product.description || "")}</p>
        <div class="product-meta">
          <span class="product-price">${formatMoney(product.price)}</span>
          ${product.original_price ? `<span class="product-original-price">${formatMoney(product.original_price)}</span>` : ""}
        </div>
        <div class="product-foot">
          <span class="muted">库存 ${Number(product.stock || 0)}</span>
          <span class="muted">评分 ${Number(product.rating || 0).toFixed(1)}</span>
        </div>
        <div class="tag-row">
          ${tags.slice(0, 3).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}
        </div>
      </div>
    </article>
  `;
}

async function renderProductPage(id) {
  showLoading("正在加载商品详情...");
  try {
    const { product } = await ProductAPI.getById(id);
    state.activeProduct = product;
    await track("view_product", product.id, { source: "detail" });
    const image = product.images?.[0] || product.image_url || "https://via.placeholder.com/600";
    const specs = product.specs && typeof product.specs === "object" ? Object.entries(product.specs) : [];
    const tags = Array.isArray(product.tags) ? product.tags : [];

    els.app.innerHTML = `
      <div class="page-shell">
        <div class="crumbs">
          <button type="button" class="link-btn" data-action="navigate" data-to="/products">商品中心</button>
          <span>/</span>
          <span>${escapeHtml(product.name)}</span>
        </div>

        <section class="product-detail">
          <div class="product-gallery">
            <img src="${escapeHtml(image)}" alt="${escapeHtml(product.name)}" />
          </div>
          <div class="product-pane">
            <div class="product-badges">
              ${product.is_hot ? `<span class="flag flag-hot">热销</span>` : ""}
              ${product.is_new ? `<span class="flag flag-new">新品</span>` : ""}
              ${product.is_promoted ? `<span class="flag flag-deal">促销</span>` : ""}
            </div>
            <h1 class="detail-title">${escapeHtml(product.name)}</h1>
            <p class="detail-subtitle">${escapeHtml(product.subtitle || "")}</p>
            <div class="detail-price-line">
              <span class="detail-price">${formatMoney(product.price)}</span>
              ${product.original_price ? `<span class="detail-original">${formatMoney(product.original_price)}</span>` : ""}
            </div>
            <div class="detail-meta-grid">
              <div><label>评分</label><strong>${Number(product.rating || 0).toFixed(1)}</strong></div>
              <div><label>销量</label><strong>${Number(product.sales_count || 0)}</strong></div>
              <div><label>库存</label><strong>${Number(product.stock || 0)}</strong></div>
              <div><label>分类</label><strong>${escapeHtml(categoryName(product.category_id))}</strong></div>
            </div>
            <p class="detail-description">${escapeHtml(product.description || "")}</p>
            <div class="tag-row">
              ${tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}
            </div>
            <div class="detail-actions">
              <button type="button" class="btn-primary" data-action="add-cart" data-product-id="${escapeHtml(product.id)}">加入购物车</button>
              <button type="button" class="btn-secondary" data-action="ai-open" data-value="seller">问小卖</button>
              <button type="button" class="btn-secondary" data-action="ai-open" data-value="guardian">问小盾</button>
            </div>
          </div>
        </section>

        <section class="split-grid">
          <div class="panel">
            <div class="panel-head"><h2>商品规格</h2></div>
            <div class="panel-body">
              ${specs.length ? `<dl class="spec-list">${specs.map(([key, value]) => `<div><dt>${escapeHtml(key)}</dt><dd>${escapeHtml(String(value))}</dd></div>`).join("")}</dl>` : `<div class="empty-inline">暂无规格信息</div>`}
            </div>
          </div>
          <div class="panel">
            <div class="panel-head"><h2>智能助手</h2></div>
            <div class="panel-body stack">
              <p class="muted">你可以直接针对当前商品向销售助手提问，或者让消费守护助手帮你理性判断。</p>
              <div class="chip-row">
                <button type="button" class="chip active" data-action="ai-open" data-value="seller">打开小卖</button>
                <button type="button" class="chip" data-action="ai-open" data-value="guardian">打开小盾</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    `;
  } catch (error) {
    els.app.innerHTML = `<div class="page-shell">${errorState(error.message || "加载商品失败")}</div>`;
  }
}

function renderAuthPage(mode) {
  const isLogin = mode === "login";
  els.app.innerHTML = `
    <div class="page-shell narrow">
      <section class="panel auth-panel">
        <div class="panel-head">
          <h1>${isLogin ? "登录" : "注册"}</h1>
          <div class="chip-row">
            <button type="button" class="chip ${isLogin ? "active" : ""}" data-action="navigate" data-to="/login">登录</button>
            <button type="button" class="chip ${!isLogin ? "active" : ""}" data-action="navigate" data-to="/register">注册</button>
          </div>
        </div>
        <div class="panel-body">
          <form id="${isLogin ? "login-form" : "register-form"}" class="form-grid">
            ${!isLogin ? `
              <label class="field">
                <span>用户名</span>
                <input name="username" required minlength="2" placeholder="输入用户名" />
              </label>
            ` : ""}
            <label class="field">
              <span>邮箱</span>
              <input name="email" type="email" required placeholder="name@example.com" />
            </label>
            <label class="field">
              <span>密码</span>
              <input name="password" type="password" required minlength="6" placeholder="至少 6 位" />
            </label>
            <div class="form-actions">
              <button type="submit" class="btn-primary">${isLogin ? "登录" : "注册"}</button>
              <button type="button" class="btn-ghost" data-action="navigate" data-to="/products">返回商品</button>
            </div>
          </form>
        </div>
      </section>
    </div>
  `;
}

async function renderCartPage() {
  if (!ensureLoggedIn()) return;
  await loadCart();
  closeCart();
  els.app.innerHTML = `
    <div class="page-shell">
      <section class="panel">
        <div class="panel-head"><h1>购物车</h1><button type="button" class="btn-secondary" data-action="checkout">去结算</button></div>
        <div class="panel-body">${renderCartList()}</div>
      </section>
    </div>
  `;
}

async function renderCheckoutPage() {
  if (!ensureLoggedIn()) return;
  await loadCart();
  closeCart();
  const items = state.cart;
  if (!items.length) {
    els.app.innerHTML = `<div class="page-shell">${emptyState("购物车为空", "先去挑几件商品吧")}</div>`;
    return;
  }

  els.app.innerHTML = `
    <div class="page-shell">
      <section class="checkout-layout">
        <div class="panel">
          <div class="panel-head"><h1>确认订单</h1></div>
          <div class="panel-body">
            <form id="checkout-form" class="form-grid">
              <label class="field">
                <span>收货人</span>
                <input name="name" required placeholder="收货人姓名" />
              </label>
              <label class="field">
                <span>手机号</span>
                <input name="phone" required placeholder="手机号" />
              </label>
              <label class="field full">
                <span>收货地址</span>
                <textarea name="address" rows="3" required placeholder="详细地址"></textarea>
              </label>
              <label class="field full">
                <span>备注</span>
                <textarea name="remark" rows="2" placeholder="可选"></textarea>
              </label>
              <div class="form-actions">
                <button type="submit" class="btn-primary">提交订单</button>
                <button type="button" class="btn-ghost" data-action="open-cart">返回购物车</button>
              </div>
            </form>
          </div>
        </div>
        <div class="panel">
          <div class="panel-head"><h2>商品清单</h2></div>
          <div class="panel-body">${renderCartList()}</div>
        </div>
      </section>
    </div>
  `;
}

async function renderOrdersPage(orderId = null) {
  if (!ensureLoggedIn()) return;
  showLoading("正在加载订单...");
  try {
    if (orderId) {
      const { order } = await OrderAPI.getById(orderId);
      els.app.innerHTML = `
        <div class="page-shell">
          <div class="crumbs">
            <button type="button" class="link-btn" data-action="navigate" data-to="/orders">订单列表</button>
            <span>/</span>
            <span>${escapeHtml(order.order_no)}</span>
          </div>
          <section class="panel">
            <div class="panel-head">
              <h1>订单 ${escapeHtml(order.order_no)}</h1>
              <span class="status status-${escapeHtml(order.status)}">${escapeHtml(order.status)}</span>
            </div>
            <div class="panel-body stack">
              <div class="detail-meta-grid">
                <div><label>下单时间</label><strong>${escapeHtml(order.created_at || "-")}</strong></div>
                <div><label>总金额</label><strong>${formatMoney(order.final_amount || order.total_amount)}</strong></div>
                <div><label>收货人</label><strong>${escapeHtml(order.shippingAddress?.name || "-")}</strong></div>
                <div><label>电话</label><strong>${escapeHtml(order.shippingAddress?.phone || "-")}</strong></div>
              </div>
              <div class="panel">
                <div class="panel-head"><h2>收货地址</h2></div>
                <div class="panel-body">${escapeHtml(order.shippingAddress?.address || "-")}</div>
              </div>
              <div class="panel">
                <div class="panel-head"><h2>商品明细</h2></div>
                <div class="panel-body">${renderOrderItems(order.items || [])}</div>
              </div>
            </div>
          </section>
        </div>
      `;
      return;
    }

    const { orders } = await OrderAPI.getList();
    state.orders = orders;
    els.app.innerHTML = `
      <div class="page-shell">
        <section class="panel">
          <div class="panel-head"><h1>我的订单</h1></div>
          <div class="panel-body">${orders.length ? orders.map(renderOrderRow).join("") : emptyState("暂无订单", "完成一次下单后会显示在这里")}</div>
        </section>
      </div>
    `;
  } catch (error) {
    els.app.innerHTML = `<div class="page-shell">${errorState(error.message || "加载订单失败")}</div>`;
  }
}

function renderOrderRow(order) {
  return `
    <article class="order-row" data-action="open-order" data-order-id="${escapeHtml(order.id)}">
      <div>
        <strong>${escapeHtml(order.order_no)}</strong>
        <div class="muted">${escapeHtml(order.created_at || "")}</div>
      </div>
      <div class="order-right">
        <span class="status status-${escapeHtml(order.status)}">${escapeHtml(order.status)}</span>
        <strong>${formatMoney(order.final_amount || order.total_amount)}</strong>
      </div>
    </article>
  `;
}

function renderOrderItems(items) {
  return `
    <div class="table-like">
      ${items.map((item) => `
        <div class="table-row">
          <div>
            <strong>${escapeHtml(item.product_name)}</strong>
            <div class="muted">数量 x ${escapeHtml(String(item.quantity))}</div>
          </div>
          <div>${formatMoney(item.subtotal)}</div>
        </div>
      `).join("")}
    </div>
  `;
}

async function renderAdminPage() {
  if (!ensureLoggedIn()) return;
  showLoading("正在加载管理面板...");
  try {
    const [stats, config] = await Promise.all([
      AdminAPI.getStats(),
      AdminAPI.getAiConfig(),
    ]);

    state.adminStats = stats;
    state.adminConfig = config;

    els.app.innerHTML = `
      <div class="page-shell">
        <section class="panel">
          <div class="panel-head"><h1>管理后台</h1></div>
          <div class="panel-body">
            <div class="stats-grid">
              <div class="stat-card"><div class="stat-value">${stats.total_users}</div><div class="stat-label">用户</div></div>
              <div class="stat-card"><div class="stat-value">${stats.total_products}</div><div class="stat-label">商品</div></div>
              <div class="stat-card"><div class="stat-value">${stats.total_orders}</div><div class="stat-label">订单</div></div>
              <div class="stat-card"><div class="stat-value">${formatMoney(stats.total_revenue)}</div><div class="stat-label">收入</div></div>
              <div class="stat-card"><div class="stat-value">${stats.total_conversations}</div><div class="stat-label">对话</div></div>
            </div>
          </div>
        </section>

        <section class="panel">
          <div class="panel-head"><h2>AI 配置</h2></div>
          <div class="panel-body">
            <form id="admin-config-form" class="form-grid">
              <label class="field full">
                <span>DeepSeek API Key</span>
                <input name="deepseek_api_key" type="password" required placeholder="${config.has_api_key ? "已保存，若修改请重新输入完整密钥" : "sk-..." }" />
              </label>
              <label class="field">
                <span>Base URL</span>
                <input name="deepseek_base_url" value="${escapeHtml(config.deepseek_base_url || "https://api.deepseek.com")}" />
              </label>
              <label class="field">
                <span>Model</span>
                <input name="deepseek_model" value="${escapeHtml(config.deepseek_model || "deepseek-chat")}" />
              </label>
              <label class="field checkbox">
                <input name="seller_ai_enabled" type="checkbox" ${config.seller_ai_enabled ? "checked" : ""} />
                <span>启用小卖</span>
              </label>
              <label class="field checkbox">
                <input name="guardian_ai_enabled" type="checkbox" ${config.guardian_ai_enabled ? "checked" : ""} />
                <span>启用小盾</span>
              </label>
              <div class="form-actions">
                <button type="submit" class="btn-primary">保存配置</button>
              </div>
            </form>
          </div>
        </section>
      </div>
    `;
  } catch (error) {
    els.app.innerHTML = `<div class="page-shell">${errorState(error.message || "加载管理面板失败")}</div>`;
  }
}

function renderCartDrawer() {
  const total = state.cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);
  els.cartItems.innerHTML = renderCartList();
  els.cartTotal.textContent = String(Math.round(total));
  els.cartDrawer.classList.toggle("open", true);
  els.cartDrawer.classList.remove("hidden");
}

function renderCartList() {
  if (!state.user) {
    return `<div class="empty-inline">请先登录后再使用购物车。<div class="spacer-8"></div><button type="button" class="btn-primary" data-action="navigate" data-to="/login">去登录</button></div>`;
  }

  if (!state.cart.length) {
    return emptyState("购物车为空", "把喜欢的商品加入这里");
  }

  const total = state.cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);
  return `
    <div class="cart-list">
      ${state.cart.map((item) => `
        <article class="cart-item">
          <img src="${escapeHtml(item.image_url || "https://via.placeholder.com/120")}" alt="${escapeHtml(item.name)}" />
          <div class="cart-item-body">
            <strong>${escapeHtml(item.name)}</strong>
            <div class="muted">${formatMoney(item.price)}</div>
            <div class="quantity-row">
              <button type="button" class="qty-btn" data-action="dec-cart" data-item-id="${escapeHtml(item.id)}">-</button>
              <span>${escapeHtml(String(item.quantity))}</span>
              <button type="button" class="qty-btn" data-action="inc-cart" data-item-id="${escapeHtml(item.id)}">+</button>
              <button type="button" class="link-btn danger" data-action="remove-cart" data-item-id="${escapeHtml(item.id)}">移除</button>
            </div>
          </div>
        </article>
      `).join("")}
      <div class="cart-summary">
        <strong>合计</strong>
        <strong>${formatMoney(total)}</strong>
      </div>
    </div>
  `;
}

async function handleLogin(form) {
  const data = new FormData(form);
  try {
    const result = await AuthAPI.login(String(data.get("email") || ""), String(data.get("password") || ""));
    applySession(result);
    await refreshSessionData();
    showToast("登录成功");
    navigate("/products");
    await route();
  } catch (error) {
    showToast(error.message || "登录失败", "error");
  }
}

async function handleRegister(form) {
  const data = new FormData(form);
  try {
    const result = await AuthAPI.register(
      String(data.get("email") || ""),
      String(data.get("password") || ""),
      String(data.get("username") || ""),
    );
    applySession(result);
    await refreshSessionData();
    showToast("注册成功");
    navigate("/products");
    await route();
  } catch (error) {
    showToast(error.message || "注册失败", "error");
  }
}

async function handleCheckout(form) {
  if (!ensureLoggedIn()) return;
  const data = new FormData(form);
  const shippingAddress = {
    name: String(data.get("name") || "").trim(),
    phone: String(data.get("phone") || "").trim(),
    address: String(data.get("address") || "").trim(),
    remark: String(data.get("remark") || "").trim(),
  };
  const items = state.cart.map((item) => ({
    productId: item.product_id,
    quantity: Number(item.quantity || 1),
  }));

  try {
    const result = await OrderAPI.create(items, shippingAddress);
    await track("place_order", null, { orderId: result.orderId, orderNo: result.orderNo });
    state.cart = [];
    updateCartBadge();
    closeCart();
    showToast(`订单已创建：${result.orderNo}`);
    navigate(`/orders/${result.orderId}`);
    await renderOrdersPage(result.orderId);
  } catch (error) {
    showToast(error.message || "下单失败", "error");
  }
}

async function handleAdminSave(form) {
  try {
    const data = new FormData(form);
    const payload = {
      deepseek_api_key: String(data.get("deepseek_api_key") || "").trim(),
      deepseek_base_url: String(data.get("deepseek_base_url") || "").trim(),
      deepseek_model: String(data.get("deepseek_model") || "").trim(),
      seller_ai_enabled: data.get("seller_ai_enabled") === "on",
      guardian_ai_enabled: data.get("guardian_ai_enabled") === "on",
    };
    await AdminAPI.updateAiConfig(payload);
    showToast("AI 配置已保存");
    await renderAdminPage();
  } catch (error) {
    showToast(error.message || "保存失败", "error");
  }
}

async function handleAiSend(form) {
  if (!ensureLoggedIn()) return;
  const input = form.querySelector("#ai-input");
  const message = String(input?.value || "").trim();
  if (!message || state.ai.sending) return;

  const aiType = state.ai.activeType;
  state.ai.sending = true;
  input.value = "";
  renderAiMessages([
    ...state.ai.history[aiType],
    { role: "user", content: message },
  ]);

  try {
    await track("chat_ai", state.activeProduct?.id || null, { aiType });
    const result = await AIAPI.chat(message, aiType, state.activeProduct?.id || null);
    state.ai.history[aiType].push({ role: "user", content: message }, { role: "assistant", content: result.response });
    renderAiMessages(state.ai.history[aiType]);
  } catch (error) {
    showToast(error.message || "AI 对话失败", "error");
    await refreshAiHistory(aiType);
  } finally {
    state.ai.sending = false;
  }
}

async function refreshSessionData() {
  if (!state.user) return;
  await loadCart();
}

async function loadCategories() {
  try {
    const { categories } = await ProductAPI.getCategories();
    state.categories = categories || [];
  } catch (error) {
    console.error("loadCategories", error);
    state.categories = [];
  }
}

async function loadProducts() {
  try {
    const result = await ProductAPI.getList({ limit: 200 });
    state.products = result.products || [];
  } catch (error) {
    console.error("loadProducts", error);
    state.products = [];
  }
}

async function loadCart() {
  if (!state.token || !state.user) {
    state.cart = [];
    updateCartBadge();
    return;
  }
  try {
    const result = await CartAPI.get();
    state.cart = result.items || [];
    updateCartBadge();
  } catch (error) {
    console.error("loadCart", error);
    state.cart = [];
    updateCartBadge();
  }
}

async function addProductToCart(productId, quantity) {
  if (!ensureLoggedIn()) return;
  try {
    await CartAPI.add(productId, quantity);
    await loadCart();
    renderCartDrawer();
    showToast("已加入购物车");
    await track("add_cart", productId, { quantity });
  } catch (error) {
    showToast(error.message || "加入购物车失败", "error");
  }
}

async function changeCartQuantity(itemId, delta) {
  const item = state.cart.find((entry) => entry.id === itemId);
  if (!item) return;
  const quantity = Number(item.quantity || 1) + delta;
  if (quantity < 1) {
    await removeCartItem(itemId);
    return;
  }
  try {
    await CartAPI.update(itemId, quantity);
    await loadCart();
    renderCartDrawer();
  } catch (error) {
    showToast(error.message || "更新购物车失败", "error");
  }
}

async function removeCartItem(itemId) {
  try {
    await CartAPI.remove(itemId);
    await loadCart();
    renderCartDrawer();
    showToast("已移除商品");
    await track("remove_cart", null, { itemId });
  } catch (error) {
    showToast(error.message || "移除失败", "error");
  }
}

async function logout() {
  try {
    if (state.token) {
      await AuthAPI.logout();
    }
  } catch (error) {
    console.warn(error);
  } finally {
    TokenManager.clear();
    state.user = null;
    state.token = null;
    state.cart = [];
    updateCartBadge();
    showToast("已退出");
    navigate("/products");
    await route();
  }
}

function applySession(result) {
  TokenManager.set(result.token);
  TokenManager.setUser(result.user);
  state.token = result.token;
  state.user = result.user;
}

async function refreshAiHistory(aiType) {
  try {
    const result = await AIAPI.getHistory(aiType);
    state.ai.history[aiType] = (result.history || []).slice().reverse();
    renderAiMessages(state.ai.history[aiType]);
  } catch (error) {
    console.error(error);
  }
}

async function openAiWindow(type) {
  state.ai.activeType = type;
  els.aiWindow.classList.remove("hidden");
  els.aiWindow.classList.add("open");
  els.aiTabs = Array.from(document.querySelectorAll(".ai-tab"));
  els.aiTabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.type === type));
  await refreshAiHistory(type);
  renderAiComposer();
}

function closeAiWindow() {
  els.aiWindow.classList.add("hidden");
  els.aiWindow.classList.remove("open");
}

function toggleAiWindow() {
  if (els.aiWindow.classList.contains("hidden")) {
    openAiWindow(state.ai.activeType);
  } else {
    closeAiWindow();
  }
}

function renderAiMessages(messages) {
  els.aiMessages.innerHTML = messages.length
    ? messages.map((message) => `
        <div class="ai-message ${message.role}">
          <div class="ai-message-content">${escapeHtml(message.content)}</div>
        </div>
      `).join("")
    : `<div class="empty-inline">开始与 AI 对话吧。</div>`;
  els.aiMessages.scrollTop = els.aiMessages.scrollHeight;
}

function renderAiComposer() {
  if (!els.aiInput) return;
  els.aiInput.placeholder = state.ai.activeType === "seller" ? "向小卖提问..." : "向小盾提问...";
}

function openCart() {
  if (!state.user) {
    navigate("/login");
    return;
  }
  els.cartDrawer.classList.remove("hidden");
  els.cartDrawer.classList.add("open");
  renderCartDrawer();
}

function closeCart() {
  els.cartDrawer.classList.remove("open");
  if (!state.cart.length) {
    els.cartDrawer.classList.add("hidden");
  }
}

function updateCartBadge() {
  const badge = document.querySelector(".nav-badge");
  if (badge) {
    badge.textContent = String(state.cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0));
  }
}

function filterProducts() {
  const search = state.filters.q.trim().toLowerCase();
  const category = state.filters.category;
  const sort = state.filters.sort;

  const items = state.products.filter((product) => {
    const matchesCategory = !category || product.category_id === category;
    const searchable = [
      product.name,
      product.subtitle,
      product.description,
      ...(Array.isArray(product.tags) ? product.tags : []),
    ].join(" ").toLowerCase();
    const matchesSearch = !search || searchable.includes(search);
    return matchesCategory && matchesSearch;
  });

  return items.sort((a, b) => {
    if (sort === "price_asc") return Number(a.price || 0) - Number(b.price || 0);
    if (sort === "price_desc") return Number(b.price || 0) - Number(a.price || 0);
    if (sort === "rating") return Number(b.rating || 0) - Number(a.rating || 0);
    if (sort === "newest") return Number(b.is_new || 0) - Number(a.is_new || 0) || Number(b.is_hot || 0) - Number(a.is_hot || 0);
    return Number(b.is_hot || 0) - Number(a.is_hot || 0) || Number(b.sales_count || 0) - Number(a.sales_count || 0);
  });
}

function categoryName(categoryId) {
  return state.categories.find((item) => item.id === categoryId)?.name || categoryId || "未分类";
}

function ensureLoggedIn() {
  if (state.user) return true;
  showToast("请先登录", "error");
  navigate("/login");
  return false;
}

async function track(behaviorType, productId = null, metadata = {}) {
  if (!state.token) return;
  try {
    await ResearchAPI.trackBehavior(behaviorType, productId, null, metadata);
  } catch (error) {
    console.warn("track failed", error);
  }
}

function showLoading(text) {
  els.app.innerHTML = `<div class="page-shell"><div class="loading-box">${escapeHtml(text)}</div></div>`;
}

function showToast(message, type = "success") {
  let root = document.getElementById("toast-root");
  if (!root) {
    root = document.createElement("div");
    root.id = "toast-root";
    root.className = "toast-root";
    document.body.appendChild(root);
  }
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  root.appendChild(toast);
  window.setTimeout(() => {
    toast.classList.add("fade-out");
    window.setTimeout(() => toast.remove(), 220);
  }, 2200);
}

function emptyState(title, subtitle) {
  return `
    <div class="empty-state">
      <strong>${escapeHtml(title)}</strong>
      <div class="muted">${escapeHtml(subtitle)}</div>
    </div>
  `;
}

function errorState(message) {
  return `
    <div class="empty-state">
      <strong>出错了</strong>
      <div class="muted">${escapeHtml(message)}</div>
    </div>
  `;
}

function formatMoney(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 0,
  }).format(amount);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
