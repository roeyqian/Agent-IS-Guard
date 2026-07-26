<template>
  <div class="app-shell">
    <header class="topbar">
      <div class="brand" @click="go('products')">
        <span class="brand-mark">SG</span>
        <span class="brand-copy">
          <strong>ShopGuard</strong>
          <small>AI 电商平台</small>
        </span>
      </div>

      <form class="search-bar" @submit.prevent="applySearch">
        <Search class="search-icon" :size="16" />
        <input v-model="filters.q" type="search" placeholder="搜索商品、品牌、关键词" />
        <button class="icon-action" type="submit">
          <ArrowRight :size="16" />
        </button>
      </form>

      <nav class="nav-actions">
        <button class="nav-chip" type="button" @click="go('products')">
          <Package2 :size="16" />
          商品
        </button>
        <button class="nav-chip" type="button" @click="go('orders')">
          <Clock3 :size="16" />
          订单
        </button>
        <button class="nav-chip" type="button" @click="go('admin')">
          <Settings2 :size="16" />
          管理
        </button>
        <button class="nav-chip cart-chip" type="button" @click="openCart">
          <ShoppingCart :size="16" />
          购物车
          <span class="badge">{{ cartCount }}</span>
        </button>
        <button v-if="user" class="nav-chip" type="button" @click="logout">
          <LogOut :size="16" />
          退出
        </button>
        <button v-else class="nav-chip" type="button" @click="openAuth('login')">
          <LogIn :size="16" />
          登录
        </button>
      </nav>
    </header>

    <main class="workspace">
      <section v-if="page === 'products'" class="page-band">
        <div class="hero">
          <div class="hero-copy">
            <p class="eyebrow">ShopGuard 商品中心</p>
            <h1>浏览、对比、下单，一站式完成</h1>
            <p class="hero-text">
              商品筛选、购物车、订单、AI 助手和后台配置都在一个页面里。
            </p>

            <div class="hero-actions">
              <button class="primary-btn" type="button" @click="go('products')">
                <Search :size="16" />
                开始浏览
              </button>
              <button class="secondary-btn" type="button" @click="openAi('guardian')">
                <ShieldCheck :size="16" />
                打开守护助手
              </button>
              <button class="secondary-btn" type="button" @click="go('orders')">
                <Truck :size="16" />
                查看订单
              </button>
            </div>

            <div class="hero-metrics">
              <div class="metric">
                <strong>{{ products.length }}</strong>
                <span>商品</span>
              </div>
              <div class="metric">
                <strong>{{ categories.length }}</strong>
                <span>分类</span>
              </div>
              <div class="metric">
                <strong>{{ cartCount }}</strong>
                <span>购物车</span>
              </div>
              <div class="metric">
                <strong>{{ orders.length }}</strong>
                <span>订单</span>
              </div>
            </div>
          </div>

          <div class="hero-visual">
            <div class="feature-card">
              <img
                v-if="heroProductImage"
                :src="heroProductImage"
                :alt="heroProduct?.name || 'featured product'"
              />
              <div v-else class="image-fallback">
                <Sparkles :size="28" />
                <span>精选商品</span>
              </div>
              <div class="feature-overlay">
                <strong>{{ heroProduct?.name || 'ShopGuard' }}</strong>
                <span>{{ heroProduct ? formatMoney(heroProduct.price) : '¥0' }}</span>
              </div>
            </div>

            <div class="feature-list">
              <button
                v-for="item in heroItems"
                :key="item.id"
                class="feature-row"
                type="button"
                @click="pickProduct(item.id)"
              >
                <img v-if="productImage(item)" :src="productImage(item)" :alt="item.name" />
                <div v-else class="row-fallback">SG</div>
                <div class="feature-row-copy">
                  <strong>{{ item.name }}</strong>
                  <span>{{ formatMoney(item.price) }}</span>
                </div>
                <ChevronRight :size="16" />
              </button>
            </div>
          </div>
        </div>

        <div class="content-grid">
          <section class="panel catalog-panel">
            <div class="panel-head">
              <div>
                <h2>商品列表</h2>
                <p>{{ filteredProducts.length }} 个结果</p>
              </div>
              <button class="ghost-btn" type="button" @click="resetFilters">
                <RefreshCcw :size="16" />
                重置
              </button>
            </div>

            <div class="filter-row">
              <label class="select-wrap">
                <Filter :size="16" />
                <select v-model="filters.category">
                  <option value="">全部分类</option>
                  <option v-for="item in categoryOptions" :key="item.id" :value="item.id">
                    {{ item.name }}
                  </option>
                </select>
              </label>

              <div class="segmented">
                <button
                  v-for="item in sortOptions"
                  :key="item.value"
                  class="segment"
                  :class="{ active: filters.sort === item.value }"
                  type="button"
                  @click="filters.sort = item.value"
                >
                  {{ item.label }}
                </button>
              </div>
            </div>

            <div v-if="loading.products" class="empty-state">
              <strong>正在加载商品...</strong>
              <span>请稍等片刻。</span>
            </div>

            <div v-else-if="!filteredProducts.length" class="empty-state">
              <strong>没有找到匹配的商品</strong>
              <span>换个关键词或分类再试试。</span>
            </div>

            <div v-else class="product-grid">
              <button
                v-for="product in filteredProducts"
                :key="product.id"
                class="product-card"
                :class="{ active: selectedProduct?.id === product.id }"
                type="button"
                @click="pickProduct(product.id)"
              >
                <div class="product-image-wrap">
                  <img
                    v-if="productImage(product)"
                    :src="productImage(product)"
                    :alt="product.name"
                  />
                  <div v-else class="image-fallback compact">
                    <Package2 :size="22" />
                  </div>
                </div>

                <div class="product-copy">
                  <div class="product-head">
                    <strong>{{ product.name }}</strong>
                    <span>{{ formatMoney(product.price) }}</span>
                  </div>
                  <p>{{ product.subtitle || product.description || ' ' }}</p>
                  <div class="product-meta">
                    <span>{{ categoryName(product.category_id) }}</span>
                    <span>评分 {{ Number(product.rating || 0).toFixed(1) }}</span>
                    <span>库存 {{ Number(product.stock || 0) }}</span>
                  </div>
                </div>
              </button>
            </div>
          </section>

          <aside class="panel detail-panel">
            <template v-if="selectedProduct">
              <div class="panel-head">
                <div>
                  <h2>{{ selectedProduct.name }}</h2>
                  <p>{{ categoryName(selectedProduct.category_id) }}</p>
                </div>
                <button class="ghost-btn" type="button" @click="openAi('seller', selectedProduct)">
                  <MessageSquareMore :size="16" />
                  问助手
                </button>
              </div>

              <div class="detail-image">
                <img
                  v-if="productImage(selectedProduct)"
                  :src="productImage(selectedProduct)"
                  :alt="selectedProduct.name"
                />
                <div v-else class="image-fallback tall">
                  <Layers3 :size="28" />
                  <span>{{ selectedProduct.name }}</span>
                </div>
              </div>

              <div class="detail-price">
                <strong>{{ formatMoney(selectedProduct.price) }}</strong>
                <span v-if="selectedProduct.original_price">
                  {{ formatMoney(selectedProduct.original_price) }}
                </span>
              </div>

              <div class="detail-metrics">
                <div>
                  <label>评分</label>
                  <strong>{{ Number(selectedProduct.rating || 0).toFixed(1) }}</strong>
                </div>
                <div>
                  <label>库存</label>
                  <strong>{{ Number(selectedProduct.stock || 0) }}</strong>
                </div>
                <div>
                  <label>销量</label>
                  <strong>{{ Number(selectedProduct.sales || 0) }}</strong>
                </div>
                <div>
                  <label>分类</label>
                  <strong>{{ categoryName(selectedProduct.category_id) }}</strong>
                </div>
              </div>

              <p class="detail-text">
                {{ selectedProduct.description || selectedProduct.subtitle || '暂无描述。' }}
              </p>

              <div class="detail-actions">
                <button class="primary-btn" type="button" @click="addToCart(selectedProduct)">
                  <ShoppingCart :size="16" />
                  加入购物车
                </button>
                <button class="secondary-btn" type="button" @click="openAi('guardian', selectedProduct)">
                  <ShieldCheck :size="16" />
                  守护助手
                </button>
                <button class="secondary-btn" type="button" @click="setPage('checkout')">
                  <CreditCard :size="16" />
                  去结算
                </button>
              </div>

              <div v-if="productSpecs(selectedProduct).length" class="spec-list">
                <div v-for="item in productSpecs(selectedProduct)" :key="item.key" class="spec-row">
                  <span>{{ item.key }}</span>
                  <strong>{{ item.value }}</strong>
                </div>
              </div>
            </template>

            <div v-else class="empty-state tall">
              <strong>请选择一个商品</strong>
              <span>左侧列表里任意点一个就行。</span>
            </div>
          </aside>
        </div>
      </section>

      <section v-else-if="page === 'orders'" class="page-band">
        <div class="panel page-header">
          <div>
            <h1>订单列表</h1>
            <p>查看历史订单和配送信息。</p>
          </div>
          <button class="ghost-btn" type="button" @click="loadOrders">
            <RefreshCcw :size="16" />
            刷新
          </button>
        </div>

        <div class="content-grid">
          <section class="panel list-panel">
            <div v-if="loading.orders" class="empty-state">
              <strong>正在加载订单...</strong>
              <span>请稍等片刻。</span>
            </div>

            <div v-else-if="!orders.length" class="empty-state">
              <strong>暂无订单</strong>
              <span>完成一次下单后会出现在这里。</span>
            </div>

            <div v-else class="order-list">
              <button
                v-for="order in orders"
                :key="order.id"
                class="order-row"
                :class="{ active: selectedOrder?.id === order.id }"
                type="button"
                @click="pickOrder(order.id)"
              >
                <div>
                  <strong>{{ order.order_no }}</strong>
                  <span>{{ order.created_at || '-' }}</span>
                </div>
                <div class="order-row-side">
                  <span class="status" :class="statusClass(order.status)">{{ statusLabel(order.status) }}</span>
                  <strong>{{ formatMoney(order.final_amount || order.total_amount) }}</strong>
                </div>
              </button>
            </div>
          </section>

          <aside class="panel detail-panel">
            <template v-if="selectedOrder">
              <div class="panel-head">
                <div>
                  <h2>{{ selectedOrder.order_no }}</h2>
                  <p>{{ statusLabel(selectedOrder.status) }}</p>
                </div>
                <button class="ghost-btn" type="button" @click="openCart">
                  <ShoppingCart :size="16" />
                  打开购物车
                </button>
              </div>

              <div class="detail-metrics">
                <div>
                  <label>时间</label>
                  <strong>{{ selectedOrder.created_at || '-' }}</strong>
                </div>
                <div>
                  <label>金额</label>
                  <strong>{{ formatMoney(selectedOrder.final_amount || selectedOrder.total_amount) }}</strong>
                </div>
                <div>
                  <label>收货人</label>
                  <strong>{{ selectedOrder.shippingAddress?.name || '-' }}</strong>
                </div>
                <div>
                  <label>电话</label>
                  <strong>{{ selectedOrder.shippingAddress?.phone || '-' }}</strong>
                </div>
              </div>

              <div class="address-box">
                {{ selectedOrder.shippingAddress?.address || '-' }}
              </div>

              <div class="order-items">
                <div v-for="item in selectedOrder.items || []" :key="item.id || item.productId" class="order-item">
                  <div>
                    <strong>{{ item.name || item.product_name || item.productId }}</strong>
                    <span>数量 x {{ item.quantity || 1 }}</span>
                  </div>
                  <strong>{{ formatMoney((item.price || 0) * (item.quantity || 1)) }}</strong>
                </div>
              </div>
            </template>

            <div v-else class="empty-state tall">
              <strong>选一笔订单</strong>
              <span>右侧会显示详细收货和商品清单。</span>
            </div>
          </aside>
        </div>
      </section>

      <section v-else-if="page === 'admin'" class="page-band">
        <div class="panel page-header">
          <div>
            <h1>管理后台</h1>
            <p>AI 配置与站点统计。</p>
          </div>
          <button class="ghost-btn" type="button" @click="loadAdmin">
            <RefreshCcw :size="16" />
            刷新
          </button>
        </div>

        <div v-if="!isAdminUser" class="panel empty-panel">
          <strong>需要管理员账号</strong>
          <span>登录后才能查看统计和配置。</span>
          <button class="primary-btn" type="button" @click="openAuth('login')">
            <LogIn :size="16" />
            去登录
          </button>
        </div>

        <div v-else class="admin-stack">
          <div class="stats-grid">
            <div class="stat-card" v-for="item in adminStatCards" :key="item.label">
              <strong>{{ item.value }}</strong>
              <span>{{ item.label }}</span>
            </div>
          </div>

          <div class="content-grid admin-grid">
            <section class="panel">
              <div class="panel-head">
                <div>
                  <h2>AI 配置</h2>
                  <p>保存 DeepSeek Key 和模型参数。</p>
                </div>
              </div>

              <form class="form-grid" @submit.prevent="saveAdminConfig">
                <label class="field full">
                  <span>DeepSeek API Key</span>
                  <input
                    v-model="adminForm.deepseek_api_key"
                    type="password"
                    required
                    :placeholder="
                      adminConfig?.has_api_key
                        ? '已保存，修改时请重新输入完整密钥'
                        : 'sk-...'
                    "
                  />
                </label>

                <label class="field">
                  <span>Base URL</span>
                  <input v-model="adminForm.deepseek_base_url" type="text" />
                </label>

                <label class="field">
                  <span>Model</span>
                  <input v-model="adminForm.deepseek_model" type="text" />
                </label>

                <label class="check-row">
                  <input v-model="adminForm.seller_ai_enabled" type="checkbox" />
                  <span>启用小卖</span>
                </label>

                <label class="check-row">
                  <input v-model="adminForm.guardian_ai_enabled" type="checkbox" />
                  <span>启用小盾</span>
                </label>

                <div class="form-actions">
                  <button class="primary-btn" type="submit">
                    <Settings2 :size="16" />
                    保存配置
                  </button>
                </div>
              </form>
            </section>

            <aside class="panel">
              <div class="panel-head">
                <div>
                  <h2>状态</h2>
                  <p>最近一次读取的数据摘要。</p>
                </div>
              </div>

              <div class="admin-notes">
                <div class="note-row">
                  <UserRound :size="16" />
                  <span>{{ user?.username || user?.email || '当前未登录' }}</span>
                </div>
                <div class="note-row">
                  <ShieldCheck :size="16" />
                  <span>{{ isAdminUser ? '管理员权限已开启' : '无管理员权限' }}</span>
                </div>
                <div class="note-row">
                  <MessageSquareMore :size="16" />
                  <span>AI 助手和购物车共用同一套后端接口。</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section v-else-if="page === 'checkout'" class="page-band">
        <div class="panel page-header">
          <div>
            <h1>确认订单</h1>
            <p>填写收货信息后提交。</p>
          </div>
          <button class="ghost-btn" type="button" @click="go('products')">
            <ArrowLeft :size="16" />
            返回商品
          </button>
        </div>

        <div v-if="!cart.length" class="panel empty-panel">
          <strong>购物车为空</strong>
          <span>先挑几件商品再来结算。</span>
          <button class="primary-btn" type="button" @click="go('products')">
            <Package2 :size="16" />
            去看看商品
          </button>
        </div>

        <div v-else class="content-grid">
          <section class="panel">
            <div class="panel-head">
              <div>
                <h2>收货信息</h2>
                <p>下单前确认联系人和地址。</p>
              </div>
            </div>

            <form class="form-grid" @submit.prevent="submitOrder">
              <label class="field">
                <span>收货人</span>
                <input v-model="checkoutForm.name" type="text" required />
              </label>

              <label class="field">
                <span>手机号</span>
                <input v-model="checkoutForm.phone" type="tel" required />
              </label>

              <label class="field full">
                <span>收货地址</span>
                <input v-model="checkoutForm.address" type="text" required />
              </label>

              <label class="field full">
                <span>备注</span>
                <textarea v-model="checkoutForm.remark" rows="4"></textarea>
              </label>

              <div class="form-actions">
                <button class="primary-btn" type="submit">
                  <CreditCard :size="16" />
                  提交订单
                </button>
              </div>
            </form>
          </section>

          <aside class="panel">
            <div class="panel-head">
              <div>
                <h2>购物车摘要</h2>
                <p>{{ cartCount }} 件商品</p>
              </div>
            </div>

            <div class="cart-summary">
              <div v-for="item in cart" :key="item.id" class="cart-line">
                <div>
                  <strong>{{ item.name || item.product_name || item.product_id }}</strong>
                  <span>数量 x {{ item.quantity }}</span>
                </div>
                <strong>{{ formatMoney((item.price || 0) * (item.quantity || 1)) }}</strong>
              </div>
            </div>

            <div class="detail-price total-line">
              <strong>{{ formatMoney(cartTotal) }}</strong>
              <span>合计</span>
            </div>
          </aside>
        </div>
      </section>
    </main>

    <div v-if="cartOpen" class="overlay" @click.self="closeCart">
      <aside class="drawer">
        <div class="drawer-head">
          <div>
            <strong>购物车</strong>
            <span>{{ cartCount }} 件商品</span>
          </div>
          <button class="icon-close" type="button" @click="closeCart">
            <X :size="18" />
          </button>
        </div>

        <div class="drawer-body">
          <div v-if="!cart.length" class="empty-state">
            <strong>购物车为空</strong>
            <span>先从商品列表里挑几件。</span>
          </div>

          <div v-else class="cart-list">
            <div v-for="item in cart" :key="item.id" class="cart-item">
              <img v-if="item.image_url" :src="item.image_url" :alt="item.name || item.product_name" />
              <div v-else class="cart-thumb">SG</div>
              <div class="cart-copy">
                <strong>{{ item.name || item.product_name }}</strong>
                <span>{{ formatMoney(item.price) }}</span>
                <div class="qty-row">
                  <button type="button" class="qty-btn" @click="changeCartQuantity(item, -1)">
                    <Minus :size="14" />
                  </button>
                  <span>{{ item.quantity }}</span>
                  <button type="button" class="qty-btn" @click="changeCartQuantity(item, 1)">
                    <Plus :size="14" />
                  </button>
                  <button type="button" class="link-btn" @click="removeCartItem(item)">
                    移除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="drawer-foot">
          <div class="detail-price total-line">
            <strong>{{ formatMoney(cartTotal) }}</strong>
            <span>合计</span>
          </div>
          <button class="primary-btn" type="button" @click="openCheckout">
            <CreditCard :size="16" />
            去结算
          </button>
        </div>
      </aside>
    </div>

    <div v-if="aiOpen" class="overlay" @click.self="closeAi">
      <aside class="drawer ai-drawer">
        <div class="drawer-head">
          <div>
            <strong>AI 助手</strong>
            <span>{{ aiContextLabel }}</span>
          </div>
          <button class="icon-close" type="button" @click="closeAi">
            <X :size="18" />
          </button>
        </div>

        <div class="segmented ai-tabs">
          <button
            class="segment"
            :class="{ active: aiType === 'seller' }"
            type="button"
            @click="switchAi('seller')"
          >
            小卖
          </button>
          <button
            class="segment"
            :class="{ active: aiType === 'guardian' }"
            type="button"
            @click="switchAi('guardian')"
          >
            小盾
          </button>
        </div>

        <div ref="aiMessagesEl" class="drawer-body ai-body">
          <div v-if="!aiHistory[aiType].length" class="empty-state">
            <strong>开始聊天吧</strong>
            <span>你可以先问问这个商品值不值得买。</span>
          </div>

          <div v-else class="chat-list">
            <div
              v-for="(message, index) in aiHistory[aiType]"
              :key="`${message.role}-${index}`"
              class="chat-row"
              :class="message.role"
            >
              <div class="chat-bubble">{{ message.content }}</div>
            </div>
          </div>
        </div>

        <form class="chat-form" @submit.prevent="sendAiMessage">
          <input
            v-model="aiMessage"
            type="text"
            :placeholder="aiType === 'seller' ? '向小卖提问...' : '向小盾提问...'"
          />
          <button class="primary-btn" type="submit" :disabled="aiSending || !aiMessage.trim()">
            <MessageSquareMore :size="16" />
            发送
          </button>
        </form>
      </aside>
    </div>

    <div v-if="authOpen" class="overlay" @click.self="closeAuth">
      <aside class="drawer auth-drawer">
        <div class="drawer-head">
          <div>
            <strong>{{ authMode === 'login' ? '登录' : '注册' }}</strong>
            <span>ShopGuard 账户</span>
          </div>
          <button class="icon-close" type="button" @click="closeAuth">
            <X :size="18" />
          </button>
        </div>

        <div class="segmented ai-tabs">
          <button
            class="segment"
            :class="{ active: authMode === 'login' }"
            type="button"
            @click="authMode = 'login'"
          >
            登录
          </button>
          <button
            class="segment"
            :class="{ active: authMode === 'register' }"
            type="button"
            @click="authMode = 'register'"
          >
            注册
          </button>
        </div>

        <form class="form-grid auth-form" @submit.prevent="submitAuth">
          <label v-if="authMode === 'register'" class="field full">
            <span>邮箱</span>
            <input v-model="authForm.email" type="email" required />
          </label>
          <label class="field full">
            <span>用户名</span>
            <input v-model="authForm.username" type="text" required />
          </label>
          <label class="field full">
            <span>密码</span>
            <input v-model="authForm.password" type="password" required />
          </label>

          <div class="form-actions">
            <button class="primary-btn" type="submit">
              <LogIn :size="16" />
              {{ authMode === 'login' ? '登录' : '注册' }}
            </button>
          </div>
        </form>
      </aside>
    </div>

    <div class="toast-stack">
      <div v-for="toast in toasts" :key="toast.id" class="toast" :class="toast.type">
        {{ toast.message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onBeforeUnmount, reactive, ref, watch } from 'vue';
import {
  AIAPI,
  AdminAPI,
  AuthAPI,
  CartAPI,
  OrderAPI,
  ProductAPI,
  TokenManager,
} from '@/api.js';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  ChevronRight,
  Clock3,
  CreditCard,
  Filter,
  Layers3,
  LogIn,
  LogOut,
  MapPin,
  MessageSquareMore,
  Minus,
  Package2,
  Plus,
  RefreshCcw,
  Search,
  Settings2,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Truck,
  UserRound,
  X,
} from 'lucide-vue-next';

const route = ref(readRoute());
const page = computed(() => route.value.page);

const user = ref(TokenManager.getUser());
const token = ref(TokenManager.get());

const products = ref([]);
const categories = ref([]);
const cart = ref([]);
const orders = ref([]);
const selectedProductId = ref('');
const selectedOrderId = ref('');
const loading = reactive({
  products: true,
  orders: false,
  admin: false,
});

const filters = reactive({
  q: '',
  category: '',
  sort: 'hot',
});

const authOpen = ref(false);
const authMode = ref('login');
const authForm = reactive({
  email: '',
  username: '',
  password: '',
});

const cartOpen = ref(false);
const aiOpen = ref(false);
const aiType = ref('seller');
const aiProductId = ref('');
const aiMessage = ref('');
const aiSending = ref(false);
const aiMessagesEl = ref(null);
const aiHistory = reactive({
  seller: [],
  guardian: [],
});

const adminConfig = ref(null);
const adminStats = ref(null);
const adminForm = reactive({
  deepseek_api_key: '',
  deepseek_base_url: 'https://api.deepseek.com',
  deepseek_model: 'deepseek-chat',
  seller_ai_enabled: true,
  guardian_ai_enabled: true,
});

const checkoutForm = reactive({
  name: '',
  phone: '',
  address: '',
  remark: '',
});

const toasts = ref([]);

const sortOptions = [
  { value: 'hot', label: '综合' },
  { value: 'price_asc', label: '价格 ↑' },
  { value: 'price_desc', label: '价格 ↓' },
  { value: 'rating', label: '评分' },
  { value: 'newest', label: '最新' },
];

watch(
  () => route.value.page,
  async (next) => {
    if (next === 'orders') {
      await loadOrders();
    } else if (next === 'admin') {
      await loadAdmin();
    } else if (next === 'checkout') {
      await loadCart();
    }
    if (next === 'products' && !selectedProductId.value && products.value.length) {
      selectedProductId.value = products.value[0].id;
    }
  },
  { immediate: true },
);

watch(
  () => aiHistory[aiType.value].length,
  async () => {
    await nextTick();
    if (aiMessagesEl.value) {
      aiMessagesEl.value.scrollTop = aiMessagesEl.value.scrollHeight;
    }
  },
);

watch(
  () => products.value.length,
  () => {
    if (!selectedProductId.value && products.value.length) {
      selectedProductId.value = products.value[0].id;
    }
  },
  { immediate: true },
);

watch(
  () => selectedOrderId.value,
  () => {
    if (!selectedOrderId.value && orders.value.length) {
      selectedOrderId.value = orders.value[0].id;
    }
  },
  { immediate: true },
);

const selectedProduct = computed(() => {
  return (
    products.value.find((item) => item.id === selectedProductId.value) ||
    filteredProducts.value[0] ||
    products.value[0] ||
    null
  );
});

const heroProduct = computed(() => selectedProduct.value || products.value[0] || null);
const heroProductImage = computed(() => productImage(heroProduct.value));
const heroItems = computed(() => products.value.slice(0, 3));
const cartCount = computed(() => cart.value.reduce((sum, item) => sum + Number(item.quantity || 0), 0));
const cartTotal = computed(() =>
  cart.value.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0),
);

const categoryOptions = computed(() =>
  categories.value.map((item) => ({
    id: item.id || item.name,
    name: item.name || item.id,
  })),
);

const filteredProducts = computed(() => {
  const query = filters.q.trim().toLowerCase();
  const category = filters.category;
  const items = products.value.filter((product) => {
    const matchesCategory = !category || String(product.category_id || '') === String(category);
    const haystack = [
      product.name,
      product.subtitle,
      product.description,
      categoryName(product.category_id),
      product.id,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    const matchesQuery = !query || haystack.includes(query);
    return matchesCategory && matchesQuery;
  });

  return items.sort((a, b) => {
    if (filters.sort === 'price_asc') {
      return Number(a.price || 0) - Number(b.price || 0);
    }
    if (filters.sort === 'price_desc') {
      return Number(b.price || 0) - Number(a.price || 0);
    }
    if (filters.sort === 'rating') {
      return Number(b.rating || 0) - Number(a.rating || 0);
    }
    if (filters.sort === 'newest') {
      return String(b.id).localeCompare(String(a.id));
    }
    return Number(b.rating || 0) - Number(a.rating || 0) || Number(b.sales || 0) - Number(a.sales || 0);
  });
});

const selectedOrder = computed(() => {
  return orders.value.find((item) => item.id === selectedOrderId.value) || orders.value[0] || null;
});

const aiContextLabel = computed(() => {
  const product = products.value.find((item) => item.id === aiProductId.value) || selectedProduct.value;
  return product ? `当前商品：${product.name}` : '当前商品：未选择';
});

const isAdminUser = computed(() => user.value?.role === 'admin');
const adminStatCards = computed(() => [
  { label: '用户', value: adminStats.value?.total_users ?? 0 },
  { label: '商品', value: adminStats.value?.total_products ?? 0 },
  { label: '订单', value: adminStats.value?.total_orders ?? 0 },
  { label: '收入', value: formatMoney(adminStats.value?.total_revenue ?? 0) },
  { label: '对话', value: adminStats.value?.total_conversations ?? 0 },
]);

onMounted(async () => {
  window.addEventListener('hashchange', syncRoute);
  await bootstrap();
  if (page.value === 'products' && !selectedProductId.value && products.value.length) {
    selectedProductId.value = products.value[0].id;
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('hashchange', syncRoute);
});

async function bootstrap() {
  await Promise.all([loadCategories(), loadProducts(), loadCart()]);
  document.title = 'ShopGuard';
}

function readRoute() {
  const raw = window.location.hash.replace(/^#/, '') || '/products';
  const [path] = raw.split('?');
  const [pageName] = path.split('/').filter(Boolean);
  return { page: pageName || 'products' };
}

function syncRoute() {
  route.value = readRoute();
}

function go(pageName) {
  if ((pageName === 'orders' || pageName === 'admin' || pageName === 'checkout') && !token.value) {
    openAuth('login');
    return;
  }
  window.location.hash = `/${pageName}`;
  syncRoute();
}

function setPage(pageName) {
  go(pageName);
}

function applySearch() {
  go('products');
}

function resetFilters() {
  filters.q = '';
  filters.category = '';
  filters.sort = 'hot';
}

function pickProduct(id) {
  selectedProductId.value = id;
  if (page.value !== 'products') {
    go('products');
  }
}

function pickOrder(id) {
  selectedOrderId.value = id;
}

function openCart() {
  if (!ensureAuth()) return;
  cartOpen.value = true;
}

function closeCart() {
  cartOpen.value = false;
}

function openAuth(mode = 'login') {
  authMode.value = mode;
  authOpen.value = true;
}

function closeAuth() {
  authOpen.value = false;
}

function openAi(type = 'seller', product = selectedProduct.value) {
  if (!ensureAuth()) return;
  aiType.value = type;
  aiProductId.value = product?.id || '';
  aiOpen.value = true;
  loadAiHistory(type);
}

function closeAi() {
  aiOpen.value = false;
}

function switchAi(type) {
  aiType.value = type;
  loadAiHistory(type);
}

function ensureAuth() {
  if (token.value) return true;
  openAuth('login');
  return false;
}

function toast(message, type = 'success') {
  const id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
  toasts.value.push({ id, message, type });
  window.setTimeout(() => {
    toasts.value = toasts.value.filter((item) => item.id !== id);
  }, 2600);
}

function formatMoney(value) {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function categoryName(id) {
  const category = categories.value.find((item) => String(item.id || item.name) === String(id));
  return category?.name || category?.id || id || '未分类';
}

function productImage(product) {
  return product?.image_url || product?.images?.[0] || '';
}

function productSpecs(product) {
  if (!product?.specs || typeof product.specs !== 'object') return [];
  return Object.entries(product.specs).map(([key, value]) => ({
    key,
    value: String(value),
  }));
}

function statusLabel(status) {
  const value = String(status || '').toLowerCase();
  if (value === 'paid' || value === '已支付') return '已支付';
  if (value === 'shipped' || value === '已发货') return '已发货';
  if (value === 'completed' || value === '已完成') return '已完成';
  if (value === 'cancelled' || value === '已取消') return '已取消';
  return '待支付';
}

function statusClass(status) {
  const value = String(status || '').toLowerCase();
  if (value === 'paid' || value === '已支付') return 'paid';
  if (value === 'shipped' || value === '已发货') return 'shipped';
  if (value === 'completed' || value === '已完成') return 'completed';
  if (value === 'cancelled' || value === '已取消') return 'cancelled';
  return 'pending';
}

async function loadCategories() {
  try {
    const result = await ProductAPI.getCategories();
    categories.value = result.categories || [];
  } catch (error) {
    toast(error.message || '加载分类失败', 'error');
  }
}

async function loadProducts() {
  loading.products = true;
  try {
    const result = await ProductAPI.getList({ limit: 200 });
    products.value = result.products || [];
    if (!selectedProductId.value && products.value.length) {
      selectedProductId.value = products.value[0].id;
    }
  } catch (error) {
    products.value = [];
    toast(error.message || '加载商品失败', 'error');
  } finally {
    loading.products = false;
  }
}

async function loadCart() {
  if (!token.value) {
    cart.value = [];
    return;
  }
  try {
    const result = await CartAPI.get();
    cart.value = result.items || [];
  } catch (error) {
    cart.value = [];
    if (error.status === 401) {
      token.value = '';
      user.value = null;
      TokenManager.clear();
      openAuth('login');
    } else {
      toast(error.message || '加载购物车失败', 'error');
    }
  }
}

async function loadOrders() {
  if (!ensureAuth()) return;
  loading.orders = true;
  try {
    const result = await OrderAPI.getList();
    orders.value = result.orders || [];
    if (!selectedOrderId.value && orders.value.length) {
      selectedOrderId.value = orders.value[0].id;
    }
  } catch (error) {
    orders.value = [];
    if (error.status === 401) {
      openAuth('login');
    } else {
      toast(error.message || '加载订单失败', 'error');
    }
  } finally {
    loading.orders = false;
  }
}

async function loadAdmin() {
  if (!ensureAuth()) return;
  if (!isAdminUser.value) {
    toast('需要管理员账号', 'error');
    return;
  }
  loading.admin = true;
  try {
    const [stats, config] = await Promise.all([AdminAPI.getStats(), AdminAPI.getAiConfig()]);
    adminStats.value = stats;
    adminConfig.value = config;
    adminForm.deepseek_base_url = config.deepseek_base_url || 'https://api.deepseek.com';
    adminForm.deepseek_model = config.deepseek_model || 'deepseek-chat';
    adminForm.seller_ai_enabled = Boolean(config.seller_ai_enabled);
    adminForm.guardian_ai_enabled = Boolean(config.guardian_ai_enabled);
    adminForm.deepseek_api_key = '';
  } catch (error) {
    if (error.status === 401) {
      openAuth('login');
    } else {
      toast(error.message || '加载管理后台失败', 'error');
    }
  } finally {
    loading.admin = false;
  }
}

async function addToCart(product) {
  if (!ensureAuth()) return;
  try {
    await CartAPI.add(product.id, 1);
    await loadCart();
    toast('已加入购物车');
  } catch (error) {
    if (error.status === 401) {
      openAuth('login');
    } else {
      toast(error.message || '加入购物车失败', 'error');
    }
  }
}

async function changeCartQuantity(item, delta) {
  if (!ensureAuth()) return;
  const nextQuantity = Number(item.quantity || 1) + delta;
  try {
    if (nextQuantity <= 0) {
      await CartAPI.remove(item.id);
    } else {
      await CartAPI.update(item.id, nextQuantity);
    }
    await loadCart();
  } catch (error) {
    if (error.status === 401) {
      openAuth('login');
    } else {
      toast(error.message || '更新购物车失败', 'error');
    }
  }
}

async function removeCartItem(item) {
  if (!ensureAuth()) return;
  try {
    await CartAPI.remove(item.id);
    await loadCart();
  } catch (error) {
    if (error.status === 401) {
      openAuth('login');
    } else {
      toast(error.message || '移除失败', 'error');
    }
  }
}

async function submitOrder() {
  if (!ensureAuth()) return;
  const items = cart.value.map((item) => ({
    productId: item.product_id,
    quantity: Number(item.quantity || 1),
  }));
  const shippingAddress = {
    name: String(checkoutForm.name || '').trim(),
    phone: String(checkoutForm.phone || '').trim(),
    address: String(checkoutForm.address || '').trim(),
    remark: String(checkoutForm.remark || '').trim(),
  };

  try {
    const result = await OrderAPI.create(items, shippingAddress);
    cart.value = [];
    closeCart();
    toast(`订单已创建：${result.orderNo}`);
    window.location.hash = `/orders`;
    syncRoute();
    await loadOrders();
    selectedOrderId.value = result.orderId;
  } catch (error) {
    if (error.status === 401) {
      openAuth('login');
    } else {
      toast(error.message || '下单失败', 'error');
    }
  }
}

async function saveAdminConfig() {
  if (!ensureAuth()) return;
  if (!isAdminUser.value) {
    toast('需要管理员账号', 'error');
    return;
  }
  try {
    await AdminAPI.updateAiConfig({
      deepseek_api_key: adminForm.deepseek_api_key,
      deepseek_base_url: adminForm.deepseek_base_url,
      deepseek_model: adminForm.deepseek_model,
      seller_ai_enabled: adminForm.seller_ai_enabled,
      guardian_ai_enabled: adminForm.guardian_ai_enabled,
    });
    toast('AI 配置已保存');
    await loadAdmin();
  } catch (error) {
    if (error.status === 401) {
      openAuth('login');
    } else {
      toast(error.message || '保存失败', 'error');
    }
  }
}

async function loadAiHistory(type) {
  if (!ensureAuth()) return;
  try {
    const result = await AIAPI.getHistory(type);
    aiHistory[type] = (result.history || []).slice().reverse();
  } catch (error) {
    if (error.status !== 401) {
      toast(error.message || '加载对话失败', 'error');
    }
  }
}

async function sendAiMessage() {
  if (!ensureAuth()) return;
  const message = aiMessage.value.trim();
  if (!message || aiSending.value) return;

  const type = aiType.value;
  const productId = aiProductId.value || selectedProduct.value?.id || null;
  aiSending.value = true;
  aiMessage.value = '';
  aiHistory[type] = [...aiHistory[type], { role: 'user', content: message }];

  try {
    const result = await AIAPI.chat(message, type, productId);
    aiHistory[type] = [
      ...aiHistory[type],
      { role: 'assistant', content: result.response },
    ];
    await nextTick();
  } catch (error) {
    if (error.status === 401) {
      openAuth('login');
    } else {
      toast(error.message || 'AI 对话失败', 'error');
    }
    await loadAiHistory(type);
  } finally {
    aiSending.value = false;
  }
}

async function submitAuth() {
  try {
    const result =
      authMode.value === 'login'
        ? await AuthAPI.login(authForm.username, authForm.password)
        : await AuthAPI.register(authForm.email, authForm.password, authForm.username);

    token.value = result.token;
    user.value = result.user;
    TokenManager.set(result.token);
    TokenManager.setUser(result.user);
    closeAuth();
    toast(authMode.value === 'login' ? '登录成功' : '注册成功');
    await Promise.all([loadCart(), loadOrders()]);
    if (isAdminUser.value) {
      await loadAdmin();
    }
    go('products');
  } catch (error) {
    toast(error.message || (authMode.value === 'login' ? '登录失败' : '注册失败'), 'error');
  }
}

async function logout() {
  try {
    await AuthAPI.logout();
  } catch {
    // Ignore logout errors and clear locally.
  }
  token.value = '';
  user.value = null;
  TokenManager.clear();
  cart.value = [];
  orders.value = [];
  adminStats.value = null;
  adminConfig.value = null;
  closeCart();
  closeAi();
  toast('已退出');
  go('products');
}
</script>
