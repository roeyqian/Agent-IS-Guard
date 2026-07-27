<template>
  <div class="app-shell">
    <header class="topbar">
      <div class="brand" @click="goHome">
        <span class="brand-mark">SG</span>
        <span class="brand-copy">
          <strong>ShopGuard</strong>
          <small>{{ t('app.subtitle') }}</small>
        </span>
      </div>

      <form class="search-bar" @submit.prevent="applySearch">
        <Search class="search-icon" :size="16" />
        <input v-model="filters.q" type="search" :placeholder="t('common.searchPlaceholder')" />
        <button class="icon-action" type="submit">
          <ArrowRight :size="16" />
        </button>
      </form>

      <nav class="nav-actions">
        <div class="language-switch" :aria-label="t('app.lang')">
          <button
            v-for="item in localeOptions"
            :key="item.value"
            class="language-btn"
            :class="{ active: locale === item.value }"
            type="button"
            @click="setLocale(item.value)"
          >
            {{ item.label }}
          </button>
        </div>
        <button class="nav-chip" type="button" @click="go('products')">
          <Package2 :size="16" />
          {{ t('common.products') }}
        </button>
        <button v-if="!isAdminUser" class="nav-chip" type="button" @click="go('orders')">
          <Clock3 :size="16" />
          {{ t('common.records') }}
        </button>
        <button class="nav-chip" type="button" @click="go('admin')">
          <Settings2 :size="16" />
          {{ t('common.research') }}
        </button>
        <button v-if="!isAdminUser" class="nav-chip cart-chip" type="button" @click="openCart">
          <ShoppingCart :size="16" />
          {{ t('cart.title') }}
          <span class="badge">{{ cartCount }}</span>
        </button>
        <button v-if="user" class="nav-chip" type="button" @click="logout">
          <LogOut :size="16" />
          {{ t('common.logout') }}
        </button>
        <button v-else class="nav-chip" type="button" @click="openAuth('login')">
          <LogIn :size="16" />
          {{ t('common.login') }}
        </button>
      </nav>
    </header>

    <main class="workspace">
      <section v-if="page === 'products'" class="page-band">
        <div class="hero">
          <div class="hero-copy">
            <p class="eyebrow">{{ t('app.title') }}</p>
            <h1>{{ t('hero.heading') }}</h1>
            <p class="hero-text">
              {{ t('hero.copy') }}
            </p>

            <div class="hero-actions">
              <button class="primary-btn" type="button" @click="isAdminUser ? go('admin') : go('products')">
                <Search :size="16" />
                {{ isAdminUser ? t('hero.adminCta') : t('hero.primaryCta') }}
              </button>
              <button v-if="!isAdminUser" class="secondary-btn" type="button" @click="openAi('guardian')">
                <ShieldCheck :size="16" />
                {{ t('hero.openGuardian') }}
              </button>
              <button v-if="!isAdminUser" class="secondary-btn" type="button" @click="go('orders')">
                <Truck :size="16" />
                {{ t('hero.viewRecords') }}
              </button>
              <button v-else class="secondary-btn" type="button" @click="go('admin')">
                <BarChart3 :size="16" />
                {{ t('hero.analyzeUsers') }}
              </button>
            </div>

            <div class="hero-metrics">
              <div class="metric">
                <strong>{{ products.length }}</strong>
                <span>{{ t('common.products') }}</span>
              </div>
              <div class="metric">
                <strong>{{ categories.length }}</strong>
                <span>{{ t('common.category') }}</span>
              </div>
              <div v-if="!isAdminUser" class="metric">
                <strong>{{ cartCount }}</strong>
                <span>{{ t('cart.title') }}</span>
              </div>
              <div v-if="!isAdminUser" class="metric">
                <strong>{{ orders.length }}</strong>
                <span>{{ t('common.records') }}</span>
              </div>
              <div v-if="isAdminUser" class="metric">
                <strong>{{ adminStats?.total_users ?? 0 }}</strong>
                <span>{{ t('common.users') }}</span>
              </div>
              <div v-if="isAdminUser" class="metric">
                <strong>{{ adminStats?.total_behaviors ?? 0 }}</strong>
                <span>{{ t('hero.behaviors') }}</span>
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
                <span>{{ t('hero.researchSample') }}</span>
              </div>
              <div class="feature-overlay">
                <strong>{{ heroProduct?.name || 'ShopGuard Research' }}</strong>
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
                <h2>{{ t('catalog.title') }}</h2>
                <p>{{ t('catalog.results', { count: filteredProducts.length }) }}</p>
              </div>
              <button class="ghost-btn" type="button" @click="resetFilters">
                <RefreshCcw :size="16" />
                {{ t('common.reset') }}
              </button>
            </div>

            <div class="filter-row">
              <label class="select-wrap">
                <Filter :size="16" />
                <select v-model="filters.category">
                  <option value="">{{ t('common.allCategories') }}</option>
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
              <strong>{{ t('catalog.loadingTitle') }}</strong>
              <span>{{ t('catalog.loadingBody') }}</span>
            </div>

            <div v-else-if="!filteredProducts.length" class="empty-state">
              <strong>{{ t('catalog.emptyTitle') }}</strong>
              <span>{{ t('catalog.emptyBody') }}</span>
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
                    <span>{{ t('detail.rating') }} {{ Number(product.rating || 0).toFixed(1) }}</span>
                    <span>{{ t('detail.stock') }} {{ Number(product.stock || 0) }}</span>
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
                <button v-if="!isAdminUser" class="ghost-btn" type="button" @click="openAi('seller', selectedProduct)">
                  <MessageSquareMore :size="16" />
                  {{ t('detail.askSeller') }}
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
                  <label>{{ t('detail.rating') }}</label>
                  <strong>{{ Number(selectedProduct.rating || 0).toFixed(1) }}</strong>
                </div>
                <div>
                  <label>{{ t('detail.stock') }}</label>
                  <strong>{{ Number(selectedProduct.stock || 0) }}</strong>
                </div>
                <div>
                  <label>{{ t('detail.sales') }}</label>
                  <strong>{{ Number(selectedProduct.sales || 0) }}</strong>
                </div>
                <div>
                  <label>{{ t('common.category') }}</label>
                  <strong>{{ categoryName(selectedProduct.category_id) }}</strong>
                </div>
              </div>

              <p class="detail-text">
                {{ selectedProduct.description || selectedProduct.subtitle || t('detail.noDescription') }}
              </p>

              <div v-if="!isAdminUser" class="detail-actions">
                <button class="primary-btn" type="button" @click="addToCart(selectedProduct)">
                  <ShoppingCart :size="16" />
                  {{ t('detail.addToCart') }}
                </button>
                <button class="secondary-btn" type="button" @click="openAi('guardian', selectedProduct)">
                  <ShieldCheck :size="16" />
                  {{ t('detail.guardianAdvice') }}
                </button>
                <button class="secondary-btn" type="button" @click="setPage('checkout')">
                  <CreditCard :size="16" />
                  {{ t('detail.enterDecision') }}
                </button>
              </div>

              <div v-else class="detail-actions">
                <button class="primary-btn" type="button" @click="go('admin')">
                  <BarChart3 :size="16" />
                  {{ t('detail.adminAnalyze') }}
                </button>
                <button class="secondary-btn" type="button" @click="loadProductInsights(selectedProduct.id)">
                  <RefreshCcw :size="16" />
                  {{ t('detail.refreshInsights') }}
                </button>
              </div>

              <div v-if="productSpecs(selectedProduct).length" class="spec-list">
                <div v-for="item in productSpecs(selectedProduct)" :key="item.key" class="spec-row">
                  <span>{{ item.key }}</span>
                  <strong>{{ item.value }}</strong>
                </div>
              </div>

              <div class="insight-panel">
                <div class="panel-head">
                  <div>
                    <h2>{{ t('insights.title') }}</h2>
                    <p>{{ productInsightsLoading ? t('insights.calculating') : t('insights.basedOnSignals') }}</p>
                  </div>
                  <button class="ghost-btn" type="button" @click="loadProductInsights(selectedProduct.id)">
                    <RefreshCcw :size="16" />
                    {{ t('common.refresh') }}
                  </button>
                </div>

                <div v-if="productInsightsLoading" class="empty-state compact">
                  <strong>{{ t('common.loading') }}</strong>
                  <span>{{ t('insights.loadingBody') }}</span>
                </div>

                <template v-else-if="productInsightSummary">
                  <div class="insight-grid">
                    <div class="insight-stat">
                      <strong>{{ productInsightSummary.views }}</strong>
                      <span>{{ t('common.views') }}</span>
                    </div>
                    <div class="insight-stat">
                      <strong>{{ productInsightSummary.addToCart }}</strong>
                      <span>{{ t('insights.addToCart') }}</span>
                    </div>
                    <div class="insight-stat">
                      <strong>{{ productInsightSummary.orders }}</strong>
                      <span>{{ t('insights.orders') }}</span>
                    </div>
                    <div class="insight-stat">
                      <strong>{{ formatMoney(productInsightSummary.revenue) }}</strong>
                      <span>{{ t('common.contribution') }}</span>
                    </div>
                    <div class="insight-stat">
                      <strong>{{ productInsightSummary.recentSessions }}</strong>
                      <span>{{ t('insights.recentSessions') }}</span>
                    </div>
                    <div class="insight-stat">
                      <strong>{{ productInsightSummary.conversionRate }}%</strong>
                      <span>{{ t('insights.conversion') }}</span>
                    </div>
                  </div>

                  <div class="insight-chips">
                    <span v-for="item in productInsightSummary.aiUsage" :key="item.aiType" class="status pending">
                      {{ aiTypeLabel(item.aiType) }} {{ item.value }}
                    </span>
                  </div>

                  <div v-if="productInsightRecentBehaviors.length" class="timeline compact">
                    <div class="timeline-head">
                      <strong>{{ t('insights.recentBehaviors') }}</strong>
                      <span>{{ t('common.recordsCount', { count: productInsightRecentBehaviors.length }) }}</span>
                    </div>
                    <div v-for="item in productInsightRecentBehaviors" :key="`${item.timestamp}-${item.session_id}`" class="timeline-row">
                      <div class="timeline-dot"></div>
                      <div class="timeline-copy">
                        <strong>{{ behaviorLabel(item.behavior_type) }}</strong>
                        <span>{{ item.username || item.session_id }}</span>
                      </div>
                      <small>{{ item.timestamp }}</small>
                    </div>
                  </div>

                  <div v-if="productInsightRelated.length" class="related-list">
                    <button
                      v-for="item in productInsightRelated"
                      :key="item.id"
                      class="related-row"
                      type="button"
                      @click="pickProduct(item.id)"
                    >
                      <div>
                        <strong>{{ item.name }}</strong>
                        <span>{{ formatMoney(item.price) }}</span>
                      </div>
                      <ChevronRight :size="16" />
                    </button>
                  </div>
                </template>
              </div>
            </template>

            <div v-else class="empty-state tall">
              <strong>{{ t('detail.noSelectionTitle') }}</strong>
              <span>{{ t('detail.noSelectionBody') }}</span>
            </div>
          </aside>
        </div>
      </section>

      <section v-else-if="page === 'orders'" class="page-band">
        <div class="panel page-header">
          <div>
            <h1>{{ t('orders.title') }}</h1>
            <p>{{ t('orders.subtitle') }}</p>
          </div>
          <button class="ghost-btn" type="button" @click="loadOrders">
            <RefreshCcw :size="16" />
            {{ t('common.refresh') }}
          </button>
        </div>

        <div class="content-grid">
          <section class="panel list-panel">
            <div v-if="loading.orders" class="empty-state">
              <strong>{{ t('orders.loadingTitle') }}</strong>
              <span>{{ t('orders.loadingBody') }}</span>
            </div>

            <div v-else-if="!orders.length" class="empty-state">
              <strong>{{ t('orders.emptyTitle') }}</strong>
              <span>{{ t('orders.emptyBody') }}</span>
            </div>

            <div v-else class="order-list">
              <button
                v-for="order in orders"
                :key="order.id"
                class="order-row"
                :class="{ active: selectedOrderView?.id === order.id }"
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
            <template v-if="selectedOrderView">
              <div class="panel-head">
                <div>
                  <h2>{{ selectedOrderView.order_no }}</h2>
                  <p>{{ statusLabel(selectedOrderView.status) }}</p>
                </div>
                <button v-if="!isAdminUser" class="ghost-btn" type="button" @click="openCart">
                  <ShoppingCart :size="16" />
                  {{ t('orders.openCart') }}
                </button>
              </div>

              <div class="detail-metrics">
                <div>
                  <label>{{ t('common.time') }}</label>
                  <strong>{{ selectedOrderView.created_at || '-' }}</strong>
                </div>
                <div>
                  <label>{{ t('common.money') }}</label>
                  <strong>{{ formatMoney(selectedOrderView.final_amount || selectedOrderView.total_amount) }}</strong>
                </div>
                <div>
                  <label>{{ t('orders.recipient') }}</label>
                  <strong>{{ selectedOrderView.shippingAddress?.name || '-' }}</strong>
                </div>
                <div>
                  <label>{{ t('orders.telephone') }}</label>
                  <strong>{{ selectedOrderView.shippingAddress?.phone || '-' }}</strong>
                </div>
              </div>

              <div class="address-box">
                {{ selectedOrderView.shippingAddress?.address || '-' }}
              </div>

              <div class="order-items">
                <div v-for="item in selectedOrderView.items || []" :key="item.id || item.productId" class="order-item">
                  <div>
                    <strong>{{ item.name || item.product_name || item.productId }}</strong>
                    <span>{{ t('common.quantity', { count: item.quantity || 1 }) }}</span>
                  </div>
                  <strong>{{ formatMoney((item.price || 0) * (item.quantity || 1)) }}</strong>
                </div>
              </div>

              <div v-if="selectedOrderView.events?.length" class="timeline">
                <div class="timeline-head">
                  <strong>{{ t('orders.statusTimeline') }}</strong>
                  <span>{{ t('common.recordsCount', { count: selectedOrderView.events.length }) }}</span>
                </div>
                <div v-for="event in selectedOrderView.events" :key="event.id" class="timeline-row">
                  <div class="timeline-dot"></div>
                  <div class="timeline-copy">
                    <strong>{{ statusLabel(event.status || event.event_type) }}</strong>
                    <span>{{ event.note || event.event_type }}</span>
                  </div>
                  <small>{{ event.created_at }}</small>
                </div>
              </div>
            </template>

            <div v-else class="empty-state tall">
              <strong>{{ t('orders.selectTitle') }}</strong>
              <span>{{ t('orders.selectBody') }}</span>
            </div>
          </aside>
        </div>
      </section>

      <section v-else-if="page === 'admin'" class="page-band">
        <div class="panel page-header">
          <div>
            <h1>{{ t('admin.title') }}</h1>
            <p>{{ t('admin.subtitle') }}</p>
          </div>
          <button class="ghost-btn" type="button" @click="loadAdmin">
            <RefreshCcw :size="16" />
            {{ t('common.refresh') }}
          </button>
        </div>

        <div v-if="!isAdminUser" class="panel empty-panel">
          <strong>{{ t('admin.requireAdminTitle') }}</strong>
          <span>{{ t('admin.requireAdminBody') }}</span>
          <button class="primary-btn" type="button" @click="openAuth('login')">
            <LogIn :size="16" />
            {{ t('common.login') }}
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
                  <h2>{{ t('admin.aiConfigTitle') }}</h2>
                  <p>{{ t('admin.aiConfigSubtitle') }}</p>
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
                        ? t('admin.apiKeySaved')
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
                  <span>{{ t('admin.enableSeller') }}</span>
                </label>

                <label class="check-row">
                  <input v-model="adminForm.guardian_ai_enabled" type="checkbox" />
                  <span>{{ t('admin.enableGuardian') }}</span>
                </label>

                <div class="form-actions">
                  <button class="primary-btn" type="submit">
                    <Settings2 :size="16" />
                    {{ t('admin.saveConfig') }}
                  </button>
                </div>
              </form>
            </section>

            <aside class="panel">
              <div class="panel-head">
                <div>
                  <h2>{{ t('admin.statusTitle') }}</h2>
                  <p>{{ t('admin.statusSubtitle') }}</p>
                </div>
              </div>

              <div class="admin-notes">
                <div class="note-row">
                  <UserRound :size="16" />
                  <span>{{ user?.username || user?.email || t('common.currentNotLoggedIn') }}</span>
                </div>
                <div class="note-row">
                  <ShieldCheck :size="16" />
                  <span>{{ isAdminUser ? t('admin.statusEnabled') : t('admin.noAccess') }}</span>
                </div>
                <div class="note-row">
                  <MessageSquareMore :size="16" />
                  <span>{{ t('admin.aiSharedBackend') }}</span>
                </div>
                <div v-for="item in behaviorBreakdown" :key="item.key" class="note-row">
                  <BarChart3 :size="16" />
                  <span>{{ behaviorLabel(item.key) }}</span>
                  <strong>{{ item.value }}</strong>
                </div>
              </div>
            </aside>
          </div>

          <div class="content-grid admin-grid">
            <section class="panel">
              <div class="panel-head">
                <div>
                  <h2>{{ t('admin.summaryTitle') }}</h2>
                  <p>{{ t('admin.summarySubtitle') }}</p>
                </div>
              </div>

              <div class="research-grid">
                <div class="research-stat">
                  <strong>{{ researchTotals.todayBehaviors ?? 0 }}</strong>
                  <span>{{ t('admin.todayBehaviors') }}</span>
                </div>
                <div class="research-stat">
                  <strong>{{ researchTotals.todayConversations ?? 0 }}</strong>
                  <span>{{ t('admin.todayConversations') }}</span>
                </div>
                <div class="research-stat">
                  <strong>{{ researchTotals.sessions ?? 0 }}</strong>
                  <span>{{ t('admin.sessions') }}</span>
                </div>
                <div class="research-stat">
                  <strong>{{ formatMoney(researchTotals.revenue ?? 0) }}</strong>
                  <span>{{ t('admin.totalRevenue') }}</span>
                </div>
              </div>

              <div v-if="researchDailyBehavior.length" class="trend-list">
                <div v-for="item in researchDailyBehavior" :key="item.day" class="trend-row">
                  <div class="trend-label">
                    <strong>{{ item.day }}</strong>
                    <span>{{ t('admin.behaviorCount', { count: item.value }) }}</span>
                  </div>
                  <div class="trend-bar">
                    <i :style="{ width: `${Math.min(100, item.value * 8)}%` }"></i>
                  </div>
                </div>
              </div>

              <div v-if="researchTopProducts.length" class="insight-list">
                <div v-for="item in researchTopProducts" :key="item.id" class="insight-row">
                  <div>
                    <strong>{{ item.name }}</strong>
                    <span>{{ formatMoney(item.price) }} · {{ t('admin.productViews', { count: item.view_count }) }}</span>
                  </div>
                  <button class="link-btn" type="button" @click="pickProduct(item.id)">
                    {{ t('common.view') }}
                  </button>
                </div>
              </div>

              <div v-if="researchRecentSessions.length" class="session-list">
                <div v-for="item in researchRecentSessions" :key="item.session_id" class="session-row">
                  <div>
                    <strong>{{ item.session_id }}</strong>
                    <span>{{ t('admin.eventCount', { events: item.event_count, users: item.user_count }) }}</span>
                  </div>
                  <small>{{ item.last_seen }}</small>
                </div>
              </div>

              <div v-if="researchAiUsage.length" class="insight-chips">
                <span v-for="item in researchAiUsage" :key="item.aiType" class="status pending">
                  {{ aiTypeLabel(item.aiType) }} {{ item.value }}
                </span>
              </div>
            </section>

            <aside class="panel">
              <div class="panel-head">
                <div>
                  <h2>{{ t('admin.ordersTitle') }}</h2>
                  <p>{{ t('admin.ordersSubtitle') }}</p>
                </div>
                <button class="ghost-btn" type="button" @click="loadAdmin">
                  <RefreshCcw :size="16" />
                  {{ t('common.refresh') }}
                </button>
              </div>

              <div v-if="adminOrders.length" class="order-list compact">
                <button
                  v-for="order in adminOrders"
                  :key="order.id"
                  class="order-row"
                  :class="{ active: selectedAdminOrderId === order.id }"
                  type="button"
                  @click="pickAdminOrder(order.id)"
                >
                  <div>
                    <strong>{{ order.order_no }}</strong>
                    <span>{{ order.username || order.email || order.user_id }}</span>
                  </div>
                  <div class="order-row-side">
                    <span class="status" :class="statusClass(order.status)">{{ statusLabel(order.status) }}</span>
                    <strong>{{ formatMoney(order.final_amount || order.total_amount) }}</strong>
                  </div>
                </button>
              </div>

              <div v-else class="empty-state compact">
                <strong>{{ t('admin.noOrdersTitle') }}</strong>
                <span>{{ t('admin.noOrdersBody') }}</span>
              </div>

              <div v-if="adminOrderDetailView" class="admin-order-detail">
                <div class="detail-metrics compact">
                  <div>
                    <label>{{ t('common.buyer') }}</label>
                    <strong>{{ adminOrderDetailView.username || adminOrderDetailView.email || '-' }}</strong>
                  </div>
                  <div>
                    <label>{{ t('admin.items') }}</label>
                    <strong>{{ adminOrderDetailView.items?.length || 0 }}</strong>
                  </div>
                  <div>
                    <label>{{ t('common.money') }}</label>
                    <strong>{{ formatMoney(adminOrderDetailView.final_amount || adminOrderDetailView.total_amount) }}</strong>
                  </div>
                  <div>
                    <label>{{ t('common.status') }}</label>
                    <strong>{{ statusLabel(adminOrderDetailView.status) }}</strong>
                  </div>
                </div>

                <div class="address-box">
                  {{ adminOrderDetailView.shippingAddress?.address || '-' }}
                </div>

                <div class="order-items compact">
                  <div v-for="item in adminOrderDetailView.items || []" :key="item.id" class="order-item">
                    <div>
                      <strong>{{ item.product_name }}</strong>
                      <span>{{ t('common.quantity', { count: item.quantity }) }}</span>
                    </div>
                    <strong>{{ formatMoney(item.subtotal) }}</strong>
                  </div>
                </div>

                <div class="form-grid compact-order-form">
                  <label class="field full">
                    <span>{{ t('common.status') }}</span>
                    <select v-model="adminOrderForm.status">
                      <option v-for="item in orderStatusOptions" :key="item.value" :value="item.value">
                        {{ item.label }}
                      </option>
                    </select>
                  </label>
                  <label class="field full">
                    <span>{{ t('common.note') }}</span>
                    <textarea v-model="adminOrderForm.note" rows="3"></textarea>
                  </label>
                </div>

                <div class="form-actions">
                  <button class="primary-btn" type="button" @click="saveAdminOrderStatus">
                    <Settings2 :size="16" />
                    {{ t('admin.saveStatus') }}
                  </button>
                </div>

                <div v-if="adminOrderDetailView.events?.length" class="timeline compact">
                  <div class="timeline-head">
                    <strong>{{ t('admin.events') }}</strong>
                    <span>{{ t('common.recordsCount', { count: adminOrderDetailView.events.length }) }}</span>
                  </div>
                  <div v-for="event in adminOrderDetailView.events" :key="event.id" class="timeline-row">
                    <div class="timeline-dot"></div>
                    <div class="timeline-copy">
                      <strong>{{ event.status || event.event_type }}</strong>
                      <span>{{ event.note || event.event_type }}</span>
                    </div>
                    <small>{{ event.created_at }}</small>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section v-else-if="page === 'checkout'" class="page-band">
        <div class="panel page-header">
          <div>
            <h1>{{ t('checkout.title') }}</h1>
            <p>{{ t('checkout.subtitle') }}</p>
          </div>
          <button class="ghost-btn" type="button" @click="go('products')">
            <ArrowLeft :size="16" />
            {{ t('common.backProducts') }}
          </button>
        </div>

        <div v-if="!cart.length" class="panel empty-panel">
          <strong>{{ t('checkout.emptyTitle') }}</strong>
          <span>{{ t('checkout.emptyBody') }}</span>
          <button class="primary-btn" type="button" @click="go('products')">
            <Package2 :size="16" />
            {{ t('checkout.goBrowse') }}
          </button>
        </div>

        <div v-else class="content-grid">
          <section class="panel">
            <div class="panel-head">
              <div>
                <h2>{{ t('checkout.shippingInfo') }}</h2>
                <p>{{ t('checkout.shippingSubtitle') }}</p>
              </div>
            </div>

            <form class="form-grid" @submit.prevent="submitOrder">
              <label class="field">
                <span>{{ t('checkout.recipient') }}</span>
                <input v-model="checkoutForm.name" type="text" required />
              </label>

              <label class="field">
                <span>{{ t('checkout.phone') }}</span>
                <input v-model="checkoutForm.phone" type="tel" required />
              </label>

              <label class="field full">
                <span>{{ t('checkout.address') }}</span>
                <input v-model="checkoutForm.address" type="text" required />
              </label>

              <label class="field full">
                <span>{{ t('common.note') }}</span>
                <textarea v-model="checkoutForm.remark" rows="4"></textarea>
              </label>

              <div class="form-actions">
                <button class="primary-btn" type="submit">
                  <CreditCard :size="16" />
                  {{ t('checkout.submit') }}
                </button>
              </div>
            </form>
          </section>

          <aside class="panel">
            <div class="panel-head">
              <div>
                <h2>{{ t('checkout.summary') }}</h2>
                <p>{{ t('common.itemsCount', { count: cartCount }) }}</p>
              </div>
            </div>

            <div class="cart-summary">
              <div v-for="item in cart" :key="item.id" class="cart-line">
                <div>
                  <strong>{{ item.name || item.product_name || item.product_id }}</strong>
                  <span>{{ t('common.quantity', { count: item.quantity }) }}</span>
                </div>
                <strong>{{ formatMoney((item.price || 0) * (item.quantity || 1)) }}</strong>
              </div>
            </div>

            <div class="detail-price total-line">
              <strong>{{ formatMoney(cartTotal) }}</strong>
              <span>{{ t('common.total') }}</span>
            </div>
          </aside>
        </div>
      </section>
    </main>

    <div v-if="cartOpen && !isAdminUser" class="overlay" @click.self="closeCart">
      <aside class="drawer">
        <div class="drawer-head">
          <div>
            <strong>{{ t('cart.title') }}</strong>
            <span>{{ t('common.itemsCount', { count: cartCount }) }}</span>
          </div>
          <button class="icon-close" type="button" @click="closeCart">
            <X :size="18" />
          </button>
        </div>

        <div class="drawer-body">
          <div v-if="!cart.length" class="empty-state">
            <strong>{{ t('cart.emptyTitle') }}</strong>
            <span>{{ t('cart.emptyBody') }}</span>
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
                    {{ t('cart.remove') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="drawer-foot">
          <div class="detail-price total-line">
            <strong>{{ formatMoney(cartTotal) }}</strong>
            <span>{{ t('common.total') }}</span>
          </div>
          <button class="primary-btn" type="button" @click="openCheckout">
            <CreditCard :size="16" />
            {{ t('cart.toCheckout') }}
          </button>
        </div>
      </aside>
    </div>

    <div v-if="aiOpen && !isAdminUser" class="overlay" @click.self="closeAi">
      <aside class="drawer ai-drawer">
        <div class="drawer-head">
          <div>
            <strong>{{ t('ai.title') }}</strong>
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
            {{ t('common.sellerType') }}
          </button>
          <button
            class="segment"
            :class="{ active: aiType === 'guardian' }"
            type="button"
            @click="switchAi('guardian')"
          >
            {{ t('common.guardianType') }}
          </button>
        </div>

        <div ref="aiMessagesEl" class="drawer-body ai-body">
          <div v-if="!aiHistory[aiType].length" class="empty-state">
            <strong>{{ t('ai.emptyTitle') }}</strong>
            <span>{{ t('ai.emptyBody') }}</span>
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
            :placeholder="aiType === 'seller' ? t('ai.chatPlaceholderSeller') : t('ai.chatPlaceholderGuardian')"
          />
          <button class="primary-btn" type="submit" :disabled="aiSending || !aiMessage.trim()">
            <MessageSquareMore :size="16" />
            {{ t('ai.send') }}
          </button>
        </form>
      </aside>
    </div>

    <div v-if="authOpen" class="overlay" @click.self="closeAuth">
      <aside class="drawer auth-drawer">
        <div class="drawer-head">
          <div>
            <strong>{{ authMode === 'login' ? t('common.login') : t('common.register') }}</strong>
            <span>{{ t('auth.account') }}</span>
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
            {{ t('common.login') }}
          </button>
          <button
            class="segment"
            :class="{ active: authMode === 'register' }"
            type="button"
            @click="authMode = 'register'"
          >
            {{ t('common.register') }}
          </button>
        </div>

        <form class="form-grid auth-form" @submit.prevent="submitAuth">
          <label v-if="authMode === 'register'" class="field full">
            <span>{{ t('common.email') }}</span>
            <input v-model="authForm.email" type="email" required />
          </label>
          <label class="field full">
            <span>{{ t('common.username') }}</span>
            <input v-model="authForm.username" type="text" required />
          </label>
          <label class="field full">
            <span>{{ t('common.password') }}</span>
            <input v-model="authForm.password" type="password" required />
          </label>

          <div class="form-actions">
            <button class="primary-btn" type="submit">
              <LogIn :size="16" />
              {{ authMode === 'login' ? t('common.login') : t('common.register') }}
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
  ResearchAPI,
  TokenManager,
} from '@/api.js';
import {
  DEFAULT_LOCALE,
  localeOptions,
  messages,
  readStoredLocale,
  writeStoredLocale,
} from '@/i18n.js';
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
  Truck,
  UserRound,
  X,
} from 'lucide-vue-next';

const route = ref(readRoute());
const page = computed(() => route.value.page);
const locale = ref(readStoredLocale());

const user = ref(TokenManager.getUser());
const token = ref(TokenManager.get());

const products = ref([]);
const categories = ref([]);
const cart = ref([]);
const orders = ref([]);
const selectedProductId = ref('');
const selectedOrderId = ref('');
const selectedOrderDetail = ref(null);
const selectedAdminOrderId = ref('');
const selectedAdminOrderDetail = ref(null);
const productInsights = ref(null);
const productInsightsLoading = ref(false);
const researchSummary = ref(null);
const adminOrders = ref([]);
const loading = reactive({
  products: true,
  orders: false,
  admin: false,
  productInsights: false,
  adminOrderDetail: false,
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
const adminOrderForm = reactive({
  status: 'pending',
  note: '',
});

const checkoutForm = reactive({
  name: '',
  phone: '',
  address: '',
  remark: '',
});

const toasts = ref([]);

const sortOptions = computed(() => [
  { value: 'hot', label: t('sort.hot') },
  { value: 'price_asc', label: t('sort.priceAsc') },
  { value: 'price_desc', label: t('sort.priceDesc') },
  { value: 'rating', label: t('sort.rating') },
  { value: 'newest', label: t('common.latest') },
]);

const orderStatusOptions = computed(() => [
  { value: 'pending', label: t('common.pending') },
  { value: 'paid', label: t('status.paid') },
  { value: 'shipped', label: t('common.shipped') },
  { value: 'completed', label: t('common.completed') },
  { value: 'cancelled', label: t('status.cancelled') },
]);

const isAdminUser = computed(() => user.value?.role === 'admin');

watch(
  () => route.value.page,
  async (next) => {
    if (isAdminUser.value && (next === 'orders' || next === 'checkout')) {
      go('admin');
      return;
    }
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
  () => selectedProductId.value,
  async (next) => {
    if (!next) {
      productInsights.value = null;
      return;
    }
    await loadProductInsights(next);
  },
  { immediate: true },
);

watch(
  () => selectedOrderId.value,
  async (next) => {
    if (!selectedOrderId.value && orders.value.length) {
      selectedOrderId.value = orders.value[0].id;
      return;
    }
    if (next) {
      selectedOrderDetail.value = null;
      await loadOrderDetail(next);
    }
  },
  { immediate: true },
);

watch(
  () => selectedAdminOrderId.value,
  async (next) => {
    if (!next) {
      selectedAdminOrderDetail.value = null;
      return;
    }
    selectedAdminOrderDetail.value = null;
    await loadAdminOrderDetail(next);
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
    name: categoryName(item.id || item.name),
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

const selectedOrderView = computed(() => selectedOrderDetail.value || selectedOrder.value);

const aiContextLabel = computed(() => {
  const product = products.value.find((item) => item.id === aiProductId.value) || selectedProduct.value;
  return product ? t('ai.contextProduct', { name: product.name }) : t('ai.contextNone');
});

const behaviorBreakdown = computed(() => adminStats.value?.behavior_breakdown || []);
const adminStatCards = computed(() => [
  { label: t('common.users'), value: adminStats.value?.total_users ?? 0 },
  { label: t('common.products'), value: adminStats.value?.total_products ?? 0 },
  { label: t('common.records'), value: adminStats.value?.total_orders ?? 0 },
  { label: t('common.revenue'), value: formatMoney(adminStats.value?.total_revenue ?? 0) },
  { label: t('common.ai'), value: adminStats.value?.total_conversations ?? 0 },
  { label: t('hero.behaviors'), value: adminStats.value?.total_behaviors ?? 0 },
]);
const productInsightSummary = computed(() => productInsights.value?.summary || null);
const productInsightRecentBehaviors = computed(() => productInsights.value?.recentBehaviors || []);
const productInsightRelated = computed(() => productInsights.value?.relatedProducts || []);
const researchTotals = computed(() => researchSummary.value?.totals || {});
const researchTopProducts = computed(() => researchSummary.value?.topProducts || []);
const researchDailyBehavior = computed(() => researchSummary.value?.dailyBehavior || []);
const researchRecentSessions = computed(() => researchSummary.value?.recentSessions || []);
const researchAiUsage = computed(() => researchSummary.value?.aiUsage || []);
const adminOrderDetailView = computed(() => selectedAdminOrderDetail.value || null);

watch(
  locale,
  (next) => {
    writeStoredLocale(next);
    document.documentElement.lang = next;
    document.title = t('app.title');
  },
  { immediate: true },
);

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
  await Promise.all([loadCategories(), loadProducts(), isAdminUser.value ? Promise.resolve() : loadCart()]);
  if (isAdminUser.value && page.value === 'admin') {
    await loadAdmin();
  }
  document.title = t('app.title');
}

function t(key, params = {}) {
  const dictionary = messages[locale.value] || messages[DEFAULT_LOCALE];
  const fallback = messages[DEFAULT_LOCALE][key] || key;
  const template = dictionary[key] || fallback;
  return Object.entries(params).reduce(
    (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
    template,
  );
}

function setLocale(nextLocale) {
  const normalized = messages[nextLocale] ? nextLocale : DEFAULT_LOCALE;
  if (locale.value === normalized) return;
  locale.value = normalized;
  writeStoredLocale(normalized);
  void refreshLocalizedData();
}

async function refreshLocalizedData() {
  const tasks = [loadCategories(), loadProducts()];
  if (isAdminUser.value) {
    tasks.push(loadAdmin());
  } else {
    tasks.push(loadCart());
    if (page.value === 'orders') tasks.push(loadOrders());
  }
  await Promise.all(tasks);
  if (selectedProductId.value) {
    await loadProductInsights(selectedProductId.value);
  }
  if (selectedOrderId.value && page.value === 'orders') {
    await loadOrderDetail(selectedOrderId.value);
  }
  if (selectedAdminOrderId.value && page.value === 'admin') {
    await loadAdminOrderDetail(selectedAdminOrderId.value);
  }
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
  if (isAdminUser.value && (pageName === 'orders' || pageName === 'checkout')) {
    toast(t('toast.adminStandardBlocked'), 'error');
    pageName = 'admin';
  }
  window.location.hash = `/${pageName}`;
  syncRoute();
}

function setPage(pageName) {
  go(pageName);
}

function goHome() {
  go(isAdminUser.value ? 'admin' : 'products');
}

function applySearch() {
  void trackBehavior('search', {
    query: filters.q,
    category: filters.category,
    sort: filters.sort,
  });
  go('products');
}

function resetFilters() {
  filters.q = '';
  filters.category = '';
  filters.sort = 'hot';
}

function pickProduct(id) {
  selectedProductId.value = id;
  if (!isAdminUser.value) {
    void trackBehavior('view_product', {
      productId: id,
      from: page.value,
      query: filters.q,
      category: filters.category,
    });
  }
  if (page.value !== 'products') {
    go('products');
  }
}

function pickOrder(id) {
  selectedOrderId.value = id;
}

function pickAdminOrder(id) {
  selectedAdminOrderId.value = id;
}

function openCart() {
  if (!ensureStandardUser()) return;
  cartOpen.value = true;
}

function closeCart() {
  cartOpen.value = false;
}

function openCheckout() {
  if (!ensureStandardUser()) return;
  closeCart();
  go('checkout');
}

function openAuth(mode = 'login') {
  authMode.value = mode;
  authOpen.value = true;
}

function closeAuth() {
  authOpen.value = false;
}

function openAi(type = 'seller', product = selectedProduct.value) {
  if (!ensureStandardUser(t('toast.adminAiBlocked'))) return;
  aiType.value = type;
  aiProductId.value = product?.id || '';
  aiOpen.value = true;
  void trackBehavior('click', {
    action: 'open_ai',
    aiType: type,
    productId: product?.id || null,
  });
  loadAiHistory(type);
}

function closeAi() {
  aiOpen.value = false;
}

function switchAi(type) {
  aiType.value = type;
  if (!isAdminUser.value) {
    void trackBehavior('click', {
      action: 'switch_ai',
      aiType: type,
      productId: aiProductId.value || selectedProduct.value?.id || null,
    });
  }
  loadAiHistory(type);
}

async function trackBehavior(behaviorType, payload = {}) {
  if (!token.value || isAdminUser.value) return;
  try {
    await ResearchAPI.track(behaviorType, payload);
  } catch {
    // Research logging should never block the primary flow.
  }
}

function ensureAuth() {
  if (token.value) return true;
  openAuth('login');
  return false;
}

function ensureStandardUser(message = t('toast.adminStandardBlocked')) {
  if (!ensureAuth()) return false;
  if (isAdminUser.value) {
    toast(message, 'error');
    go('admin');
    return false;
  }
  return true;
}

function toast(message, type = 'success') {
  const id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
  toasts.value.push({ id, message, type });
  window.setTimeout(() => {
    toasts.value = toasts.value.filter((item) => item.id !== id);
  }, 2600);
}

function formatMoney(value) {
  return new Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency: 'CNY',
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function categoryName(id) {
  const category = categories.value.find((item) => String(item.id || item.name) === String(id));
  if (category?.id && messages[DEFAULT_LOCALE][`category.${category.id}`]) {
    return t(`category.${category.id}`);
  }
  if (messages[DEFAULT_LOCALE][`category.${id}`]) {
    return t(`category.${id}`);
  }
  return category?.name || category?.id || id || t('common.unknownCategory');
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
  if (value === 'paid') return t('status.paid');
  if (value === 'shipped') return t('common.shipped');
  if (value === 'completed') return t('common.completed');
  if (value === 'cancelled') return t('status.cancelled');
  return t('common.pending');
}

function statusClass(status) {
  const value = String(status || '').toLowerCase();
  if (value === 'paid') return 'paid';
  if (value === 'shipped') return 'shipped';
  if (value === 'completed') return 'completed';
  if (value === 'cancelled') return 'cancelled';
  return 'pending';
}

function aiTypeLabel(value) {
  return value === 'seller' ? t('common.sellerAi') : t('common.guardianAi');
}

function behaviorLabel(value) {
  const label = t(`behavior.${value}`);
  return label === `behavior.${value}` ? value : label;
}

async function loadCategories() {
  try {
    const result = await ProductAPI.getCategories();
    categories.value = result.categories || [];
  } catch (error) {
    toast(error.message || t('toast.categoriesLoadFailed'), 'error');
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
    toast(error.message || t('toast.productsLoadFailed'), 'error');
  } finally {
    loading.products = false;
  }
}

async function loadProductInsights(productId) {
  if (!productId) {
    productInsights.value = null;
    return;
  }

  productInsightsLoading.value = true;
  try {
    const result = await ProductAPI.getInsights(productId);
    productInsights.value = result;
  } catch (error) {
    if (error.status !== 401) {
      toast(error.message || t('toast.productInsightsLoadFailed'), 'error');
    }
  } finally {
    productInsightsLoading.value = false;
  }
}

async function loadCart() {
  if (!token.value || isAdminUser.value) {
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
      toast(error.message || t('toast.cartLoadFailed'), 'error');
    }
  }
}

async function loadOrders() {
  if (!ensureAuth()) return;
  if (isAdminUser.value) {
    orders.value = [];
    selectedOrderId.value = '';
    selectedOrderDetail.value = null;
    if (page.value === 'orders') {
      go('admin');
    }
    return;
  }
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
      toast(error.message || t('toast.orderLoadFailed'), 'error');
    }
  } finally {
    loading.orders = false;
  }
}

async function loadOrderDetail(orderId) {
  if (!orderId || !token.value || isAdminUser.value) {
    selectedOrderDetail.value = null;
    return;
  }

  try {
    const result = await OrderAPI.getById(orderId);
    selectedOrderDetail.value = result.order || null;
  } catch (error) {
    selectedOrderDetail.value = null;
    if (error.status === 401) {
      openAuth('login');
    } else {
      toast(error.message || t('toast.orderDetailLoadFailed'), 'error');
    }
  }
}

async function loadAdmin() {
  if (!ensureAuth()) return;
  if (!isAdminUser.value) {
    toast(t('toast.adminOnly'), 'error');
    return;
  }
  loading.admin = true;
  try {
    const [stats, config, summary, ordersData] = await Promise.all([
      AdminAPI.getStats(),
      AdminAPI.getAiConfig(),
      ResearchAPI.getSummary(),
      AdminAPI.getOrders({ limit: 12 }),
    ]);
    adminStats.value = stats;
    adminConfig.value = config;
    researchSummary.value = summary;
    adminOrders.value = ordersData.orders || [];
    adminForm.deepseek_base_url = config.deepseek_base_url || 'https://api.deepseek.com';
    adminForm.deepseek_model = config.deepseek_model || 'deepseek-chat';
    adminForm.seller_ai_enabled = Boolean(config.seller_ai_enabled);
    adminForm.guardian_ai_enabled = Boolean(config.guardian_ai_enabled);
    adminForm.deepseek_api_key = '';
    if (!adminOrders.value.length) {
      selectedAdminOrderId.value = '';
      selectedAdminOrderDetail.value = null;
    } else if (!selectedAdminOrderId.value) {
      selectedAdminOrderId.value = adminOrders.value[0].id;
    } else if (selectedAdminOrderId.value) {
      await loadAdminOrderDetail(selectedAdminOrderId.value);
    }
  } catch (error) {
    if (error.status === 401) {
      openAuth('login');
    } else {
      toast(error.message || t('toast.researchLoadFailed'), 'error');
    }
  } finally {
    loading.admin = false;
  }
}

async function loadAdminOrderDetail(orderId) {
  if (!orderId || !token.value) {
    selectedAdminOrderDetail.value = null;
    return;
  }

  loading.adminOrderDetail = true;
  try {
    const result = await AdminAPI.getOrderDetail(orderId);
    selectedAdminOrderDetail.value = result.order || null;
    adminOrderForm.status = selectedAdminOrderDetail.value?.status || 'pending';
    adminOrderForm.note = '';
  } catch (error) {
    selectedAdminOrderDetail.value = null;
    if (error.status === 401) {
      openAuth('login');
    } else {
      toast(error.message || t('toast.orderStatusLoadFailed'), 'error');
    }
  } finally {
    loading.adminOrderDetail = false;
  }
}

async function saveAdminOrderStatus() {
  if (!selectedAdminOrderId.value) return;
  try {
    await AdminAPI.updateOrderStatus(selectedAdminOrderId.value, {
      status: adminOrderForm.status,
      note: adminOrderForm.note,
    });
    toast(t('toast.orderStatusSaved'));
    await Promise.all([loadAdmin(), loadAdminOrderDetail(selectedAdminOrderId.value)]);
  } catch (error) {
    if (error.status === 401) {
      openAuth('login');
    } else {
      toast(error.message || t('toast.orderStatusUpdateFailed'), 'error');
    }
  }
}

async function addToCart(product) {
  if (!ensureStandardUser()) return;
  try {
    await CartAPI.add(product.id, 1);
    await loadCart();
    toast(t('toast.cartAdded'));
    void trackBehavior('add_cart', {
      productId: product.id,
      quantity: 1,
      source: page.value,
    });
  } catch (error) {
    if (error.status === 401) {
      openAuth('login');
    } else {
      toast(error.message || t('toast.cartAddFailed'), 'error');
    }
  }
}

async function changeCartQuantity(item, delta) {
  if (!ensureStandardUser()) return;
  const nextQuantity = Number(item.quantity || 1) + delta;
  try {
    if (nextQuantity <= 0) {
      await CartAPI.remove(item.id);
      void trackBehavior('remove_cart', {
        productId: item.product_id,
        source: 'cart-drawer',
      });
    } else {
      await CartAPI.update(item.id, nextQuantity);
      if (delta > 0) {
        void trackBehavior('add_cart', {
          productId: item.product_id,
          quantity: delta,
          source: 'cart-drawer',
        });
      }
    }
    await loadCart();
  } catch (error) {
    if (error.status === 401) {
      openAuth('login');
    } else {
      toast(error.message || t('toast.cartUpdateFailed'), 'error');
    }
  }
}

async function removeCartItem(item) {
  if (!ensureStandardUser()) return;
  try {
    await CartAPI.remove(item.id);
    await loadCart();
    void trackBehavior('remove_cart', {
      productId: item.product_id,
      source: 'cart-drawer',
    });
  } catch (error) {
    if (error.status === 401) {
      openAuth('login');
    } else {
      toast(error.message || t('toast.cartRemoveFailed'), 'error');
    }
  }
}

async function submitOrder() {
  if (!ensureStandardUser()) return;
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
    toast(t('toast.orderCreated', { orderNo: result.orderNo }));
    void trackBehavior('place_order', {
      orderNo: result.orderNo,
      itemCount: items.length,
      total: cartTotal.value,
    });
    window.location.hash = `/orders`;
    syncRoute();
    await loadOrders();
    selectedOrderId.value = result.orderId;
  } catch (error) {
    if (error.status === 401) {
      openAuth('login');
    } else {
      toast(error.message || t('toast.submitOrderFailed'), 'error');
    }
  }
}

async function saveAdminConfig() {
  if (!ensureAuth()) return;
  if (!isAdminUser.value) {
    toast(t('toast.adminOnly'), 'error');
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
    toast(t('toast.aiConfigSaved'));
    await loadAdmin();
  } catch (error) {
    if (error.status === 401) {
      openAuth('login');
    } else {
      toast(error.message || t('toast.configSaveFailed'), 'error');
    }
  }
}

async function loadAiHistory(type) {
  if (!ensureStandardUser(t('toast.adminAiBlocked'))) return;
  try {
    const result = await AIAPI.getHistory(type);
    aiHistory[type] = (result.history || []).slice().reverse();
  } catch (error) {
    if (error.status !== 401) {
      toast(error.message || t('toast.chatLoadFailed'), 'error');
    }
  }
}

async function sendAiMessage() {
  if (!ensureStandardUser(t('toast.adminAiBlocked'))) return;
  const message = aiMessage.value.trim();
  if (!message || aiSending.value) return;

  const type = aiType.value;
  const productId = aiProductId.value || selectedProduct.value?.id || null;
  aiSending.value = true;
  aiMessage.value = '';
  aiHistory[type] = [...aiHistory[type], { role: 'user', content: message }];
  void trackBehavior('chat_ai', {
    aiType: type,
    productId: productId || null,
    messageLength: message.length,
  });

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
      toast(error.message || t('toast.aiFailed'), 'error');
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
    toast(authMode.value === 'login' ? t('toast.loginSuccess') : t('toast.registerSuccess'));
    if (isAdminUser.value) {
      cart.value = [];
      orders.value = [];
      await loadAdmin();
      go('admin');
    } else {
      await Promise.all([loadCart(), loadOrders()]);
      go('products');
    }
  } catch (error) {
    toast(error.message || (authMode.value === 'login' ? t('toast.loginFailed') : t('toast.registerFailed')), 'error');
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
  selectedOrderId.value = '';
  selectedOrderDetail.value = null;
  selectedAdminOrderId.value = '';
  selectedAdminOrderDetail.value = null;
  productInsights.value = null;
  researchSummary.value = null;
  adminOrders.value = [];
  adminOrderForm.status = 'pending';
  adminOrderForm.note = '';
  adminStats.value = null;
  adminConfig.value = null;
  closeCart();
  closeAi();
  toast(t('toast.loggedOut'));
  go('products');
}
</script>
