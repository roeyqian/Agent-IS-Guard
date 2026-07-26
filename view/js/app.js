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

const LANGUAGES = {
  ZH: "zh-CN",
  EN: "en-US",
};

const LANGUAGE_STORAGE_KEY = "shopguard_language";

const UI_TEXT = {
  [LANGUAGES.ZH]: {
    metaTitle: "ShopGuard - AI购物守护电商平台",
    initFailed: "应用初始化失败：{message}",
    searchPlaceholder: "搜索商品、品牌、关键词",
    searchButton: "搜索",
    navProducts: "商品",
    navOrders: "订单",
    navAdmin: "管理",
    navCart: "购物车",
    navLogout: "退出",
    navLogin: "登录",
    navRegister: "注册",
    langSwitchLabel: "语言",
    langZh: "中文",
    langEn: "EN",
    mainTitle: "ShopGuard 商品中心",
    mainSubtitle: "浏览商品、加入购物车、咨询双 AI 助手、完成下单和订单查看。",
    labelProducts: "商品",
    labelCategories: "分类",
    labelCart: "购物车",
    labelCategory: "分类",
    labelSort: "排序",
    all: "全部",
    resultCount: "{count} 个结果",
    resetView: "重置视图",
    emptyNoProductsTitle: "没有找到匹配的商品",
    emptyNoProductsSubtitle: "试试别的关键词或切换分类",
    badgeHot: "热销",
    badgeNew: "新品",
    badgeDeal: "促销",
    stock: "库存",
    rating: "评分",
    loadingProduct: "正在加载商品详情...",
    productCenter: "商品中心",
    sales: "销量",
    category: "分类",
    addToCart: "加入购物车",
    askSeller: "问小卖",
    askGuardian: "问小盾",
    productSpecs: "商品规格",
    noSpecs: "暂无规格信息",
    aiAssistant: "智能助手",
    aiHint: "你可以直接针对当前商品向销售助手提问，或者让消费守护助手帮你理性判断。",
    openSeller: "打开小卖",
    openGuardian: "打开小盾",
    loadProductFailed: "加载商品失败",
    loginTitle: "登录",
    registerTitle: "注册",
    username: "用户名",
    usernamePlaceholder: "输入用户名",
    email: "邮箱",
    password: "密码",
    passwordPlaceholder: "至少 6 位",
    backToProducts: "返回商品",
    cartTitle: "购物车",
    checkout: "去结算",
    emptyCartTitle: "购物车为空",
    emptyCartSubtitle: "先去挑几件商品吧",
    checkoutTitle: "确认订单",
    recipientName: "收货人",
    recipientPlaceholder: "收货人姓名",
    phone: "手机号",
    phonePlaceholder: "手机号",
    address: "收货地址",
    addressPlaceholder: "详细地址",
    remark: "备注",
    remarkOptional: "可选",
    submitOrder: "提交订单",
    backToCart: "返回购物车",
    itemList: "商品清单",
    loadingOrders: "正在加载订单...",
    orderList: "订单列表",
    orderTitle: "订单 {orderNo}",
    orderTime: "下单时间",
    orderTotal: "总金额",
    shippingAddress: "收货地址",
    itemDetails: "商品明细",
    myOrders: "我的订单",
    emptyOrdersTitle: "暂无订单",
    emptyOrdersSubtitle: "完成一次下单后会显示在这里",
    loadOrdersFailed: "加载订单失败",
    quantityX: "数量 x {quantity}",
    loadingAdmin: "正在加载管理面板...",
    adminTitle: "管理后台",
    statUsers: "用户",
    statProducts: "商品",
    statOrders: "订单",
    statRevenue: "收入",
    statConversations: "对话",
    aiConfig: "AI 配置",
    apiKeySaved: "已保存，若修改请重新输入完整密钥",
    enableSeller: "启用小卖",
    enableGuardian: "启用小盾",
    saveConfig: "保存配置",
    loadAdminFailed: "加载管理面板失败",
    loginFirstCart: "请先登录后再使用购物车。",
    goLogin: "去登录",
    remove: "移除",
    total: "合计",
    loginSuccess: "登录成功",
    loginFailed: "登录失败",
    registerSuccess: "注册成功",
    registerFailed: "注册失败",
    orderCreated: "订单已创建：{orderNo}",
    placeOrderFailed: "下单失败",
    configSaved: "AI 配置已保存",
    saveFailed: "保存失败",
    aiChatFailed: "AI 对话失败",
    addedToCart: "已加入购物车",
    addToCartFailed: "加入购物车失败",
    updateCartFailed: "更新购物车失败",
    removedItem: "已移除商品",
    removeFailed: "移除失败",
    loggedOut: "已退出",
    chatEmpty: "开始与 AI 对话吧。",
    sellerPlaceholder: "向小卖提问...",
    guardianPlaceholder: "向小盾提问...",
    loginRequired: "请先登录",
    uncategorized: "未分类",
    errorTitle: "出错了",
    openAi: "打开 AI 助手",
    send: "发送",
    sellerName: "小卖",
    guardianName: "小盾",
  },
  [LANGUAGES.EN]: {
    metaTitle: "ShopGuard - AI Shopping Protection Platform",
    initFailed: "App initialization failed: {message}",
    searchPlaceholder: "Search products, brands, or keywords",
    searchButton: "Search",
    navProducts: "Products",
    navOrders: "Orders",
    navAdmin: "Admin",
    navCart: "Cart",
    navLogout: "Log Out",
    navLogin: "Log In",
    navRegister: "Sign Up",
    langSwitchLabel: "Language",
    langZh: "中文",
    langEn: "EN",
    mainTitle: "ShopGuard Catalog",
    mainSubtitle: "Browse products, add items to your cart, chat with two AI assistants, and place orders.",
    labelProducts: "Products",
    labelCategories: "Categories",
    labelCart: "Cart",
    labelCategory: "Category",
    labelSort: "Sort",
    all: "All",
    resultCount: "{count} results",
    resetView: "Reset View",
    emptyNoProductsTitle: "No matching products found",
    emptyNoProductsSubtitle: "Try another keyword or switch categories",
    badgeHot: "Hot",
    badgeNew: "New",
    badgeDeal: "Promo",
    stock: "Stock",
    rating: "Rating",
    loadingProduct: "Loading product details...",
    productCenter: "Catalog",
    sales: "Sales",
    category: "Category",
    addToCart: "Add to Cart",
    askSeller: "Ask Seller",
    askGuardian: "Ask Guardian",
    productSpecs: "Specifications",
    noSpecs: "No specifications available",
    aiAssistant: "AI Assistants",
    aiHint: "Ask the sales assistant about this product directly, or let the guardian assistant help you decide rationally.",
    openSeller: "Open Seller",
    openGuardian: "Open Guardian",
    loadProductFailed: "Failed to load product",
    loginTitle: "Log In",
    registerTitle: "Sign Up",
    username: "Username",
    usernamePlaceholder: "Enter username",
    email: "Email",
    password: "Password",
    passwordPlaceholder: "At least 6 characters",
    backToProducts: "Back to Products",
    cartTitle: "Cart",
    checkout: "Checkout",
    emptyCartTitle: "Your cart is empty",
    emptyCartSubtitle: "Pick a few products first",
    checkoutTitle: "Confirm Order",
    recipientName: "Recipient",
    recipientPlaceholder: "Recipient name",
    phone: "Phone",
    phonePlaceholder: "Phone number",
    address: "Address",
    addressPlaceholder: "Full address",
    remark: "Notes",
    remarkOptional: "Optional",
    submitOrder: "Place Order",
    backToCart: "Back to Cart",
    itemList: "Items",
    loadingOrders: "Loading orders...",
    orderList: "Order List",
    orderTitle: "Order {orderNo}",
    orderTime: "Created At",
    orderTotal: "Total",
    shippingAddress: "Shipping Address",
    itemDetails: "Items",
    myOrders: "My Orders",
    emptyOrdersTitle: "No orders yet",
    emptyOrdersSubtitle: "Your orders will appear here after checkout",
    loadOrdersFailed: "Failed to load orders",
    quantityX: "Qty x {quantity}",
    loadingAdmin: "Loading admin dashboard...",
    adminTitle: "Admin Dashboard",
    statUsers: "Users",
    statProducts: "Products",
    statOrders: "Orders",
    statRevenue: "Revenue",
    statConversations: "Chats",
    aiConfig: "AI Settings",
    apiKeySaved: "Saved. Re-enter the full key to update it",
    enableSeller: "Enable Seller",
    enableGuardian: "Enable Guardian",
    saveConfig: "Save Settings",
    loadAdminFailed: "Failed to load admin dashboard",
    loginFirstCart: "Please log in before using the cart.",
    goLogin: "Log In",
    remove: "Remove",
    total: "Total",
    loginSuccess: "Logged in successfully",
    loginFailed: "Login failed",
    registerSuccess: "Account created successfully",
    registerFailed: "Registration failed",
    orderCreated: "Order created: {orderNo}",
    placeOrderFailed: "Failed to place order",
    configSaved: "AI settings saved",
    saveFailed: "Failed to save",
    aiChatFailed: "AI chat failed",
    addedToCart: "Added to cart",
    addToCartFailed: "Failed to add to cart",
    updateCartFailed: "Failed to update cart",
    removedItem: "Item removed",
    removeFailed: "Failed to remove item",
    loggedOut: "Logged out",
    chatEmpty: "Start chatting with AI.",
    sellerPlaceholder: "Ask Seller...",
    guardianPlaceholder: "Ask Guardian...",
    loginRequired: "Please log in first",
    uncategorized: "Uncategorized",
    errorTitle: "Something went wrong",
    openAi: "Open AI assistant",
    send: "Send",
    sellerName: "Seller",
    guardianName: "Guardian",
  },
};

const SORT_LABELS = {
  hot: {
    zh: { short: "综合", full: "综合排序" },
    en: { short: "Popular", full: "Popular" },
  },
  price_asc: {
    zh: { short: "价格 ↑", full: "价格升序" },
    en: { short: "Price ↑", full: "Price Low to High" },
  },
  price_desc: {
    zh: { short: "价格 ↓", full: "价格降序" },
    en: { short: "Price ↓", full: "Price High to Low" },
  },
  rating: {
    zh: { short: "评分", full: "评分优先" },
    en: { short: "Rating", full: "Top Rated" },
  },
  newest: {
    zh: { short: "最新", full: "最新上架" },
    en: { short: "Newest", full: "Newest Arrivals" },
  },
};

const CATEGORY_LABELS = {
  cat_digital: { zh: "数码电子", en: "Digital Electronics" },
  cat_fashion: { zh: "服饰鞋包", en: "Fashion & Bags" },
  cat_home: { zh: "家居生活", en: "Home & Living" },
  cat_beauty: { zh: "美妆护肤", en: "Beauty & Skincare" },
  cat_food: { zh: "食品饮料", en: "Food & Drinks" },
  数码电子: { zh: "数码电子", en: "Digital Electronics" },
  服饰鞋包: { zh: "服饰鞋包", en: "Fashion & Bags" },
  家居生活: { zh: "家居生活", en: "Home & Living" },
  美妆护肤: { zh: "美妆护肤", en: "Beauty & Skincare" },
  食品饮料: { zh: "食品饮料", en: "Food & Drinks" },
};

const STATUS_LABELS = {
  pending: { zh: "待支付", en: "Pending" },
  paid: { zh: "已支付", en: "Paid" },
  shipped: { zh: "已发货", en: "Shipped" },
  completed: { zh: "已完成", en: "Completed" },
  cancelled: { zh: "已取消", en: "Cancelled" },
  待支付: { zh: "待支付", en: "Pending" },
  已支付: { zh: "已支付", en: "Paid" },
  已发货: { zh: "已发货", en: "Shipped" },
  已完成: { zh: "已完成", en: "Completed" },
  已取消: { zh: "已取消", en: "Cancelled" },
};

const PRODUCT_LABELS = {
  prod_001: {
    name: "iPhone 15 Pro Max",
    subtitle: "Titanium design, A17 Pro chip",
    description: "A titanium build with the A17 Pro chip for a major performance boost.",
  },
  prod_002: {
    name: "MacBook Air M3",
    subtitle: "Lightweight and fast",
    description: "Powered by M3, with up to 18 hours of battery life and a 1.24 kg body.",
  },
  prod_003: {
    name: "AirPods Pro 2",
    subtitle: "Active noise cancellation, spatial audio",
    description: "Next-generation noise cancellation with immersive spatial audio.",
  },
  prod_004: {
    name: "iPad Pro",
    subtitle: "M2 chip, Liquid Retina display",
    description: "Equipped with the M2 chip for demanding creative workflows.",
  },
  prod_005: {
    name: "Apple Watch Series 9",
    subtitle: "Health tracking smart watch",
    description: "All-day health tracking with ECG support.",
  },
  prod_006: {
    name: "Nike Air Max 270",
    subtitle: "Cushioned running shoes",
    description: "Full-length air cushioning with breathable mesh.",
  },
  prod_007: {
    name: "Adidas Jacket",
    subtitle: "Classic streetwear layer",
    description: "Classic three-stripe styling with cotton fabric.",
  },
  prod_008: {
    name: "Converse Canvas Shoes",
    subtitle: "Classic high-top style",
    description: "A timeless design that matches almost anything.",
  },
  prod_009: {
    name: "Dyson Vacuum Cleaner",
    subtitle: "Strong suction, smart dust detection",
    description: "Laser dust detection for a deeper clean.",
  },
  prod_010: {
    name: "Xiaomi Air Purifier",
    subtitle: "Formaldehyde removal and smart sensing",
    description: "H13 HEPA filtration with 99% formaldehyde removal.",
  },
  prod_011: {
    name: "Estée Lauder Advanced Night Repair",
    subtitle: "Repair serum for anti-aging care",
    description: "ANR repair technology, built for late nights and recovery.",
  },
  prod_012: {
    name: "Lancôme Tonique Confort",
    subtitle: "Hydrating soothing toner",
    description: "Rose essence for deep hydration and a gentle feel.",
  },
  prod_013: {
    name: "Starbucks Coffee Beans",
    subtitle: "Medium roast, Pike Place style",
    description: "100% Arabica beans with a smooth medium roast.",
  },
  prod_014: {
    name: "Three Squirrels Mixed Nuts",
    subtitle: "Daily mixed nuts, nutritious and easy",
    description: "A mixed nut blend in individual snack packs.",
  },
  prod_015: {
    name: "Genki Forest Sparkling Water",
    subtitle: "Zero sugar, zero fat, zero calories",
    description: "Sweetened with erythritol for a crisp no-calorie drink.",
  },
};

const state = {
  language: getInitialLanguage(),
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
  document.getElementById("app").innerHTML = `<div class="page-shell"><div class="alert alert-danger">${escapeHtml(t("initFailed", { message: error.message || String(error) }))}</div></div>`;
});

function getInitialLanguage() {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved && UI_TEXT[saved]) return saved;
  } catch {}

  return LANGUAGES.EN;
}

function currentLanguageCode() {
  return state.language === LANGUAGES.ZH ? "zh" : "en";
}

function t(key, params = {}) {
  const activeText = UI_TEXT[state.language] || UI_TEXT[LANGUAGES.ZH];
  const fallbackText = UI_TEXT[LANGUAGES.ZH];
  const template = activeText[key] ?? fallbackText[key] ?? key;
  return String(template).replace(/\{(\w+)\}/g, (_, token) => String(params[token] ?? ""));
}

function sortLabel(value, variant = "short") {
  const labels = SORT_LABELS[value];
  if (!labels) return value;
  return labels[currentLanguageCode()]?.[variant] || labels.zh?.[variant] || value;
}

function localizeCategory(value) {
  if (!value) return t("uncategorized");
  const labels = CATEGORY_LABELS[value];
  return labels?.[currentLanguageCode()] || value;
}

function statusLabel(value) {
  if (!value) return "-";
  const labels = STATUS_LABELS[value];
  return labels?.[currentLanguageCode()] || value;
}

function badgeLabel(type) {
  const map = {
    hot: "badgeHot",
    new: "badgeNew",
    deal: "badgeDeal",
  };
  return t(map[type]);
}

function aiName(type) {
  return type === "guardian" ? t("guardianName") : t("sellerName");
}

function localizeProduct(product) {
  const labels = PRODUCT_LABELS[product.id];
  if (state.language === LANGUAGES.ZH || !labels) {
    return {
      ...product,
      localizedName: product.name,
      localizedSubtitle: product.subtitle || product.description || "",
      localizedDescription: product.description || "",
    };
  }

  return {
    ...product,
    localizedName: labels.name || product.name,
    localizedSubtitle: labels.subtitle || product.subtitle || product.description || "",
    localizedDescription: labels.description || product.description || "",
  };
}

function localizeProductName(productId, fallbackName) {
  if (state.language === LANGUAGES.ZH) return fallbackName;
  return PRODUCT_LABELS[productId]?.name || fallbackName;
}

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
  renderStaticShell();
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
  els.cartTotalLabel = document.getElementById("cart-total-label");
  els.cartTitle = document.getElementById("cart-title");
  els.aiToggle = document.getElementById("ai-toggle-btn");
  els.cartClose = document.getElementById("cart-close-btn");
  els.cartCheckout = document.getElementById("cart-checkout-btn");
  els.aiWindow = document.getElementById("ai-chat-window");
  els.aiMessages = document.getElementById("ai-messages");
  els.aiInput = document.getElementById("ai-input");
  els.aiSend = document.getElementById("ai-send-btn");
  els.aiClose = document.getElementById("ai-close-btn");
  els.aiTabs = Array.from(document.querySelectorAll(".ai-tab"));
}

function renderStaticShell() {
  document.documentElement.lang = state.language === LANGUAGES.ZH ? "zh-CN" : "en-US";
  document.title = t("metaTitle");

  if (els.aiToggle) {
    els.aiToggle.setAttribute("aria-label", t("openAi"));
    els.aiToggle.title = t("openAi");
  }
  if (els.cartTitle) els.cartTitle.textContent = t("cartTitle");
  if (els.cartTotalLabel) els.cartTotalLabel.textContent = t("total");
  if (els.cartCheckout) els.cartCheckout.textContent = t("checkout");

  els.aiTabs.forEach((tab) => {
    const type = tab.dataset.type || "seller";
    const icon = type === "guardian" ? "🛡️" : "🤖";
    tab.textContent = `${icon} ${aiName(type)}`;
  });

  if (els.aiSend) els.aiSend.textContent = t("send");
  renderAiComposer();
}

async function setLanguage(language) {
  if (!UI_TEXT[language] || language === state.language) return;
  state.language = language;
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {}

  renderStaticShell();
  await route();

  if (els.cartDrawer.classList.contains("open")) {
    renderCartDrawer();
  }
  renderAiMessages(state.ai.history[state.ai.activeType]);
  renderAiComposer();
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
    if (action === "set-language") {
      await setLanguage(value);
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
  if (els.aiToggle) els.aiToggle.addEventListener("click", toggleAiWindow);
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
        <input name="q" value="${escapeHtml(state.filters.q)}" placeholder="${escapeHtml(t("searchPlaceholder"))}" />
        <button type="submit">${escapeHtml(t("searchButton"))}</button>
      </form>
      <div class="nav-group">
        <button type="button" class="nav-btn" data-action="navigate" data-to="/products">${escapeHtml(t("navProducts"))}</button>
        <button type="button" class="nav-btn" data-action="navigate" data-to="/orders">${escapeHtml(t("navOrders"))}</button>
        ${isAdmin ? `<button type="button" class="nav-btn" data-action="navigate" data-to="/admin">${escapeHtml(t("navAdmin"))}</button>` : ""}
        <div class="lang-switch" role="group" aria-label="${escapeHtml(t("langSwitchLabel"))}">
          <button type="button" class="lang-btn ${state.language === LANGUAGES.EN ? "active" : ""}" data-action="set-language" data-value="${LANGUAGES.EN}">${escapeHtml(t("langEn"))}</button>
          <button type="button" class="lang-btn ${state.language === LANGUAGES.ZH ? "active" : ""}" data-action="set-language" data-value="${LANGUAGES.ZH}">${escapeHtml(t("langZh"))}</button>
        </div>
        <button type="button" class="nav-btn cart-btn" data-action="open-cart">${escapeHtml(t("navCart"))} <span class="nav-badge">${cartCount}</span></button>
        ${loggedIn ? `<button type="button" class="nav-btn" data-action="logout">${escapeHtml(t("navLogout"))}</button>` : `<button type="button" class="nav-btn" data-action="navigate" data-to="/login">${escapeHtml(t("navLogin"))}</button><button type="button" class="nav-btn" data-action="navigate" data-to="/register">${escapeHtml(t("navRegister"))}</button>`}
      </div>
    </div>
  `;
}

async function renderMainPage() {
  const filtered = filterProducts();
  const selectedCategory = state.categories.find((item) => item.id === state.filters.category);
  const selectedCategoryName = selectedCategory ? localizeCategory(selectedCategory.id || selectedCategory.name) : t("all");
  const selectedSortName = sortLabel(state.filters.sort, "full");

  els.app.innerHTML = `
    <div class="page-shell">
      <section class="page-intro">
        <div>
          <h1>${escapeHtml(t("mainTitle"))}</h1>
          <p>${escapeHtml(t("mainSubtitle"))}</p>
        </div>
        <div class="intro-stats">
          <div class="stat-chip"><span>${state.products.length}</span><small>${escapeHtml(t("labelProducts"))}</small></div>
          <div class="stat-chip"><span>${state.categories.length}</span><small>${escapeHtml(t("labelCategories"))}</small></div>
          <div class="stat-chip"><span>${state.cart.length}</span><small>${escapeHtml(t("labelCart"))}</small></div>
        </div>
      </section>

      <section class="toolbar">
        <div class="toolbar-left">
          <span class="toolbar-label">${escapeHtml(t("labelCategory"))}</span>
          <div class="chip-row">
            <button class="chip ${!state.filters.category ? "active" : ""}" type="button" data-action="filter-category" data-category-id="">${escapeHtml(t("all"))}</button>
            ${state.categories.map((category) => `
              <button class="chip ${state.filters.category === category.id ? "active" : ""}" type="button" data-action="filter-category" data-category-id="${escapeHtml(category.id)}">${escapeHtml(localizeCategory(category.id || category.name))}</button>
            `).join("")}
          </div>
        </div>
        <div class="toolbar-right">
          <span class="toolbar-label">${escapeHtml(t("labelSort"))}</span>
          <div class="chip-row">
            ${sortChip("hot")}
            ${sortChip("price_asc")}
            ${sortChip("price_desc")}
            ${sortChip("rating")}
            ${sortChip("newest")}
          </div>
        </div>
      </section>

      <section class="result-strip">
        <div>
          <strong>${escapeHtml(t("resultCount", { count: filtered.length }))}</strong>
          <span class="muted">· ${escapeHtml(selectedCategoryName)} · ${escapeHtml(selectedSortName)}</span>
        </div>
        <button class="link-btn" type="button" data-action="navigate" data-to="/products">${escapeHtml(t("resetView"))}</button>
      </section>

      ${filtered.length ? `<section class="product-grid">${filtered.map(renderProductCard).join("")}</section>` : emptyState(t("emptyNoProductsTitle"), t("emptyNoProductsSubtitle"))}
    </div>
  `;
}

function sortChip(value) {
  return `<button class="chip ${state.filters.sort === value ? "active" : ""}" type="button" data-action="set-sort" data-value="${value}">${escapeHtml(sortLabel(value, "short"))}</button>`;
}

function renderProductCard(product) {
  const localized = localizeProduct(product);
  const image = product.image_url || product.images?.[0] || "https://via.placeholder.com/400";
  const tags = Array.isArray(product.tags) ? product.tags : [];
  return `
    <article class="product-card" data-action="open-product" data-product-id="${escapeHtml(product.id)}">
      <img class="product-image" src="${escapeHtml(image)}" alt="${escapeHtml(localized.localizedName)}" />
      <div class="product-info">
        <div class="product-badges">
          ${product.is_hot ? `<span class="flag flag-hot">${escapeHtml(badgeLabel("hot"))}</span>` : ""}
          ${product.is_new ? `<span class="flag flag-new">${escapeHtml(badgeLabel("new"))}</span>` : ""}
          ${product.is_promoted ? `<span class="flag flag-deal">${escapeHtml(badgeLabel("deal"))}</span>` : ""}
        </div>
        <h3 class="product-name">${escapeHtml(localized.localizedName)}</h3>
        <p class="product-subtitle">${escapeHtml(localized.localizedSubtitle)}</p>
        <div class="product-meta">
          <span class="product-price">${formatMoney(product.price)}</span>
          ${product.original_price ? `<span class="product-original-price">${formatMoney(product.original_price)}</span>` : ""}
        </div>
        <div class="product-foot">
          <span class="muted">${escapeHtml(t("stock"))} ${Number(product.stock || 0)}</span>
          <span class="muted">${escapeHtml(t("rating"))} ${Number(product.rating || 0).toFixed(1)}</span>
        </div>
        <div class="tag-row">
          ${tags.slice(0, 3).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}
        </div>
      </div>
    </article>
  `;
}

async function renderProductPage(id) {
  showLoading(t("loadingProduct"));
  try {
    const { product } = await ProductAPI.getById(id);
    const localized = localizeProduct(product);
    state.activeProduct = product;
    await track("view_product", product.id, { source: "detail" });
    const image = product.image_url || product.images?.[0] || "https://via.placeholder.com/600";
    const specs = product.specs && typeof product.specs === "object" ? Object.entries(product.specs) : [];
    const tags = Array.isArray(product.tags) ? product.tags : [];

    els.app.innerHTML = `
      <div class="page-shell">
        <div class="crumbs">
          <button type="button" class="link-btn" data-action="navigate" data-to="/products">${escapeHtml(t("productCenter"))}</button>
          <span>/</span>
          <span>${escapeHtml(localized.localizedName)}</span>
        </div>

        <section class="product-detail">
          <div class="product-gallery">
            <img src="${escapeHtml(image)}" alt="${escapeHtml(localized.localizedName)}" />
          </div>
          <div class="product-pane">
            <div class="product-badges">
              ${product.is_hot ? `<span class="flag flag-hot">${escapeHtml(badgeLabel("hot"))}</span>` : ""}
              ${product.is_new ? `<span class="flag flag-new">${escapeHtml(badgeLabel("new"))}</span>` : ""}
              ${product.is_promoted ? `<span class="flag flag-deal">${escapeHtml(badgeLabel("deal"))}</span>` : ""}
            </div>
            <h1 class="detail-title">${escapeHtml(localized.localizedName)}</h1>
            <p class="detail-subtitle">${escapeHtml(localized.localizedSubtitle)}</p>
            <div class="detail-price-line">
              <span class="detail-price">${formatMoney(product.price)}</span>
              ${product.original_price ? `<span class="detail-original">${formatMoney(product.original_price)}</span>` : ""}
            </div>
            <div class="detail-meta-grid">
              <div><label>${escapeHtml(t("rating"))}</label><strong>${Number(product.rating || 0).toFixed(1)}</strong></div>
              <div><label>${escapeHtml(t("sales"))}</label><strong>${Number(product.sales_count || 0)}</strong></div>
              <div><label>${escapeHtml(t("stock"))}</label><strong>${Number(product.stock || 0)}</strong></div>
              <div><label>${escapeHtml(t("category"))}</label><strong>${escapeHtml(categoryName(product.category_id))}</strong></div>
            </div>
            <p class="detail-description">${escapeHtml(localized.localizedDescription)}</p>
            <div class="tag-row">
              ${tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}
            </div>
            <div class="detail-actions">
              <button type="button" class="btn-primary" data-action="add-cart" data-product-id="${escapeHtml(product.id)}">${escapeHtml(t("addToCart"))}</button>
              <button type="button" class="btn-secondary" data-action="ai-open" data-value="seller">${escapeHtml(t("askSeller"))}</button>
              <button type="button" class="btn-secondary" data-action="ai-open" data-value="guardian">${escapeHtml(t("askGuardian"))}</button>
            </div>
          </div>
        </section>

        <section class="split-grid">
          <div class="panel">
            <div class="panel-head"><h2>${escapeHtml(t("productSpecs"))}</h2></div>
            <div class="panel-body">
              ${specs.length ? `<dl class="spec-list">${specs.map(([key, value]) => `<div><dt>${escapeHtml(key)}</dt><dd>${escapeHtml(String(value))}</dd></div>`).join("")}</dl>` : `<div class="empty-inline">${escapeHtml(t("noSpecs"))}</div>`}
            </div>
          </div>
          <div class="panel">
            <div class="panel-head"><h2>${escapeHtml(t("aiAssistant"))}</h2></div>
            <div class="panel-body stack">
              <p class="muted">${escapeHtml(t("aiHint"))}</p>
              <div class="chip-row">
                <button type="button" class="chip active" data-action="ai-open" data-value="seller">${escapeHtml(t("openSeller"))}</button>
                <button type="button" class="chip" data-action="ai-open" data-value="guardian">${escapeHtml(t("openGuardian"))}</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    `;
  } catch (error) {
    els.app.innerHTML = `<div class="page-shell">${errorState(error.message || t("loadProductFailed"))}</div>`;
  }
}

function renderAuthPage(mode) {
  const isLogin = mode === "login";
  els.app.innerHTML = `
    <div class="page-shell narrow">
      <section class="panel auth-panel">
        <div class="panel-head">
          <h1>${escapeHtml(isLogin ? t("loginTitle") : t("registerTitle"))}</h1>
          <div class="chip-row">
            <button type="button" class="chip ${isLogin ? "active" : ""}" data-action="navigate" data-to="/login">${escapeHtml(t("loginTitle"))}</button>
            <button type="button" class="chip ${!isLogin ? "active" : ""}" data-action="navigate" data-to="/register">${escapeHtml(t("registerTitle"))}</button>
          </div>
        </div>
        <div class="panel-body">
          <form id="${isLogin ? "login-form" : "register-form"}" class="form-grid">
            ${!isLogin ? `
              <label class="field">
                <span>${escapeHtml(t("username"))}</span>
                <input name="username" required minlength="2" placeholder="${escapeHtml(t("usernamePlaceholder"))}" />
              </label>
            ` : ""}
            <label class="field">
              <span>${escapeHtml(t("username"))}</span>
              <input name="username" type="text" required minlength="2" placeholder="${escapeHtml(t("usernamePlaceholder"))}" />
            </label>
            <label class="field">
              <span>${escapeHtml(t("password"))}</span>
              <input name="password" type="password" required minlength="6" placeholder="${escapeHtml(t("passwordPlaceholder"))}" />
            </label>
            <div class="form-actions">
              <button type="submit" class="btn-primary">${escapeHtml(isLogin ? t("loginTitle") : t("registerTitle"))}</button>
              <button type="button" class="btn-ghost" data-action="navigate" data-to="/products">${escapeHtml(t("backToProducts"))}</button>
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
        <div class="panel-head"><h1>${escapeHtml(t("cartTitle"))}</h1><button type="button" class="btn-secondary" data-action="checkout">${escapeHtml(t("checkout"))}</button></div>
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
    els.app.innerHTML = `<div class="page-shell">${emptyState(t("emptyCartTitle"), t("emptyCartSubtitle"))}</div>`;
    return;
  }

  els.app.innerHTML = `
    <div class="page-shell">
      <section class="checkout-layout">
        <div class="panel">
          <div class="panel-head"><h1>${escapeHtml(t("checkoutTitle"))}</h1></div>
          <div class="panel-body">
            <form id="checkout-form" class="form-grid">
              <label class="field">
                <span>${escapeHtml(t("recipientName"))}</span>
                <input name="name" required placeholder="${escapeHtml(t("recipientPlaceholder"))}" />
              </label>
              <label class="field">
                <span>${escapeHtml(t("phone"))}</span>
                <input name="phone" required placeholder="${escapeHtml(t("phonePlaceholder"))}" />
              </label>
              <label class="field full">
                <span>${escapeHtml(t("address"))}</span>
                <textarea name="address" rows="3" required placeholder="${escapeHtml(t("addressPlaceholder"))}"></textarea>
              </label>
              <label class="field full">
                <span>${escapeHtml(t("remark"))}</span>
                <textarea name="remark" rows="2" placeholder="${escapeHtml(t("remarkOptional"))}"></textarea>
              </label>
              <div class="form-actions">
                <button type="submit" class="btn-primary">${escapeHtml(t("submitOrder"))}</button>
                <button type="button" class="btn-ghost" data-action="open-cart">${escapeHtml(t("backToCart"))}</button>
              </div>
            </form>
          </div>
        </div>
        <div class="panel">
          <div class="panel-head"><h2>${escapeHtml(t("itemList"))}</h2></div>
          <div class="panel-body">${renderCartList()}</div>
        </div>
      </section>
    </div>
  `;
}

async function renderOrdersPage(orderId = null) {
  if (!ensureLoggedIn()) return;
  showLoading(t("loadingOrders"));
  try {
    if (orderId) {
      const { order } = await OrderAPI.getById(orderId);
      els.app.innerHTML = `
        <div class="page-shell">
          <div class="crumbs">
            <button type="button" class="link-btn" data-action="navigate" data-to="/orders">${escapeHtml(t("orderList"))}</button>
            <span>/</span>
            <span>${escapeHtml(order.order_no)}</span>
          </div>
          <section class="panel">
            <div class="panel-head">
              <h1>${escapeHtml(t("orderTitle", { orderNo: order.order_no }))}</h1>
              <span class="status status-${escapeHtml(order.status)}">${escapeHtml(statusLabel(order.status))}</span>
            </div>
            <div class="panel-body stack">
              <div class="detail-meta-grid">
                <div><label>${escapeHtml(t("orderTime"))}</label><strong>${escapeHtml(order.created_at || "-")}</strong></div>
                <div><label>${escapeHtml(t("orderTotal"))}</label><strong>${formatMoney(order.final_amount || order.total_amount)}</strong></div>
                <div><label>${escapeHtml(t("recipientName"))}</label><strong>${escapeHtml(order.shippingAddress?.name || "-")}</strong></div>
                <div><label>${escapeHtml(t("phone"))}</label><strong>${escapeHtml(order.shippingAddress?.phone || "-")}</strong></div>
              </div>
              <div class="panel">
                <div class="panel-head"><h2>${escapeHtml(t("shippingAddress"))}</h2></div>
                <div class="panel-body">${escapeHtml(order.shippingAddress?.address || "-")}</div>
              </div>
              <div class="panel">
                <div class="panel-head"><h2>${escapeHtml(t("itemDetails"))}</h2></div>
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
          <div class="panel-head"><h1>${escapeHtml(t("myOrders"))}</h1></div>
          <div class="panel-body">${orders.length ? orders.map(renderOrderRow).join("") : emptyState(t("emptyOrdersTitle"), t("emptyOrdersSubtitle"))}</div>
        </section>
      </div>
    `;
  } catch (error) {
    els.app.innerHTML = `<div class="page-shell">${errorState(error.message || t("loadOrdersFailed"))}</div>`;
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
        <span class="status status-${escapeHtml(order.status)}">${escapeHtml(statusLabel(order.status))}</span>
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
            <strong>${escapeHtml(localizeProductName(item.product_id, item.product_name))}</strong>
            <div class="muted">${escapeHtml(t("quantityX", { quantity: item.quantity }))}</div>
          </div>
          <div>${formatMoney(item.subtotal)}</div>
        </div>
      `).join("")}
    </div>
  `;
}

async function renderAdminPage() {
  if (!ensureLoggedIn()) return;
  showLoading(t("loadingAdmin"));
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
          <div class="panel-head"><h1>${escapeHtml(t("adminTitle"))}</h1></div>
          <div class="panel-body">
            <div class="stats-grid">
              <div class="stat-card"><div class="stat-value">${stats.total_users}</div><div class="stat-label">${escapeHtml(t("statUsers"))}</div></div>
              <div class="stat-card"><div class="stat-value">${stats.total_products}</div><div class="stat-label">${escapeHtml(t("statProducts"))}</div></div>
              <div class="stat-card"><div class="stat-value">${stats.total_orders}</div><div class="stat-label">${escapeHtml(t("statOrders"))}</div></div>
              <div class="stat-card"><div class="stat-value">${formatMoney(stats.total_revenue)}</div><div class="stat-label">${escapeHtml(t("statRevenue"))}</div></div>
              <div class="stat-card"><div class="stat-value">${stats.total_conversations}</div><div class="stat-label">${escapeHtml(t("statConversations"))}</div></div>
            </div>
          </div>
        </section>

        <section class="panel">
          <div class="panel-head"><h2>${escapeHtml(t("aiConfig"))}</h2></div>
          <div class="panel-body">
            <form id="admin-config-form" class="form-grid">
              <label class="field full">
                <span>DeepSeek API Key</span>
                <input name="deepseek_api_key" type="password" required placeholder="${config.has_api_key ? escapeHtml(t("apiKeySaved")) : "sk-..." }" />
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
                <span>${escapeHtml(t("enableSeller"))}</span>
              </label>
              <label class="field checkbox">
                <input name="guardian_ai_enabled" type="checkbox" ${config.guardian_ai_enabled ? "checked" : ""} />
                <span>${escapeHtml(t("enableGuardian"))}</span>
              </label>
              <div class="form-actions">
                <button type="submit" class="btn-primary">${escapeHtml(t("saveConfig"))}</button>
              </div>
            </form>
          </div>
        </section>
      </div>
    `;
  } catch (error) {
    els.app.innerHTML = `<div class="page-shell">${errorState(error.message || t("loadAdminFailed"))}</div>`;
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
    return `<div class="empty-inline">${escapeHtml(t("loginFirstCart"))}<div class="spacer-8"></div><button type="button" class="btn-primary" data-action="navigate" data-to="/login">${escapeHtml(t("goLogin"))}</button></div>`;
  }

  if (!state.cart.length) {
    return emptyState(t("emptyCartTitle"), t("emptyCartSubtitle"));
  }

  const total = state.cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);
  return `
    <div class="cart-list">
      ${state.cart.map((item) => `
        <article class="cart-item">
          <img src="${escapeHtml(item.image_url || "https://via.placeholder.com/120")}" alt="${escapeHtml(localizeProductName(item.product_id, item.name))}" />
          <div class="cart-item-body">
            <strong>${escapeHtml(localizeProductName(item.product_id, item.name))}</strong>
            <div class="muted">${formatMoney(item.price)}</div>
            <div class="quantity-row">
              <button type="button" class="qty-btn" data-action="dec-cart" data-item-id="${escapeHtml(item.id)}">-</button>
              <span>${escapeHtml(String(item.quantity))}</span>
              <button type="button" class="qty-btn" data-action="inc-cart" data-item-id="${escapeHtml(item.id)}">+</button>
              <button type="button" class="link-btn danger" data-action="remove-cart" data-item-id="${escapeHtml(item.id)}">${escapeHtml(t("remove"))}</button>
            </div>
          </div>
        </article>
      `).join("")}
      <div class="cart-summary">
        <strong>${escapeHtml(t("total"))}</strong>
        <strong>${formatMoney(total)}</strong>
      </div>
    </div>
  `;
}

async function handleLogin(form) {
  const data = new FormData(form);
  try {
    const result = await AuthAPI.login(String(data.get("username") || ""), String(data.get("password") || ""));
    applySession(result);
    await refreshSessionData();
    showToast(t("loginSuccess"));
    navigate("/products");
    await route();
  } catch (error) {
    showToast(error.message || t("loginFailed"), "error");
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
    showToast(t("registerSuccess"));
    navigate("/products");
    await route();
  } catch (error) {
    showToast(error.message || t("registerFailed"), "error");
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
    showToast(t("orderCreated", { orderNo: result.orderNo }));
    navigate(`/orders/${result.orderId}`);
    await renderOrdersPage(result.orderId);
  } catch (error) {
    showToast(error.message || t("placeOrderFailed"), "error");
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
    showToast(t("configSaved"));
    await renderAdminPage();
  } catch (error) {
    showToast(error.message || t("saveFailed"), "error");
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
    showToast(error.message || t("aiChatFailed"), "error");
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
    showToast(t("addedToCart"));
    await track("add_cart", productId, { quantity });
  } catch (error) {
    showToast(error.message || t("addToCartFailed"), "error");
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
    showToast(error.message || t("updateCartFailed"), "error");
  }
}

async function removeCartItem(itemId) {
  try {
    await CartAPI.remove(itemId);
    await loadCart();
    renderCartDrawer();
    showToast(t("removedItem"));
    await track("remove_cart", null, { itemId });
  } catch (error) {
    showToast(error.message || t("removeFailed"), "error");
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
    showToast(t("loggedOut"));
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
    : `<div class="empty-inline">${escapeHtml(t("chatEmpty"))}</div>`;
  els.aiMessages.scrollTop = els.aiMessages.scrollHeight;
}

function renderAiComposer() {
  if (!els.aiInput) return;
  els.aiInput.placeholder = state.ai.activeType === "seller" ? t("sellerPlaceholder") : t("guardianPlaceholder");
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
  const category = state.categories.find((item) => item.id === categoryId);
  return localizeCategory(category?.id || category?.name || categoryId);
}

function ensureLoggedIn() {
  if (state.user) return true;
  showToast(t("loginRequired"), "error");
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
      <strong>${escapeHtml(t("errorTitle"))}</strong>
      <div class="muted">${escapeHtml(message)}</div>
    </div>
  `;
}

function formatMoney(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat(state.language === LANGUAGES.ZH ? "zh-CN" : "en-US", {
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
