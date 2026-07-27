const API_BASE = '/api';
const LOCALE_STORAGE_KEY = 'shopguard_locale';

function getRequestLocale() {
  return localStorage.getItem(LOCALE_STORAGE_KEY) || navigator.language || 'zh-CN';
}

export const TokenManager = {
  get() {
    return localStorage.getItem('auth_token');
  },
  set(token) {
    localStorage.setItem('auth_token', token);
  },
  clear() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },
  getUser() {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  },
};

async function request(url, options = {}) {
  const token = TokenManager.get();
  const headers = {
    'Content-Type': 'application/json',
    'Accept-Language': getRequestLocale(),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    if (response.status === 401) {
      TokenManager.clear();
    }
    const error = new Error(data.error || 'Request failed');
    error.status = response.status;
    throw error;
  }

  return data;
}

export const AuthAPI = {
  register: (email, password, username) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, username }),
    }),
  login: (username, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  logout: () => request('/auth/logout', { method: 'POST' }),
};

export const ProductAPI = {
  getList: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/products${query ? `?${query}` : ''}`);
  },
  getById: (id) => request(`/products/${id}`),
  getInsights: (id) => request(`/products/${id}/insights`),
  getCategories: () => request('/categories'),
};

export const CartAPI = {
  get: () => request('/cart'),
  add: (productId, quantity = 1) =>
    request('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    }),
  update: (itemId, quantity) =>
    request(`/cart/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    }),
  remove: (itemId) => request(`/cart/${itemId}`, { method: 'DELETE' }),
};

export const OrderAPI = {
  create: (items, shippingAddress) =>
    request('/orders', {
      method: 'POST',
      body: JSON.stringify({ items, shippingAddress }),
    }),
  getList: () => request('/orders'),
  getById: (id) => request(`/orders/${id}`),
};

export const AIAPI = {
  chat: (message, aiType, productId = null) =>
    request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, aiType, productId }),
    }),
  getHistory: (aiType = null) =>
    request(`/ai/history${aiType ? `?aiType=${aiType}` : ''}`),
};

export const ResearchAPI = {
  track: (behaviorType, payload = {}) =>
    request('/research/track', {
      method: 'POST',
      body: JSON.stringify({
        behaviorType,
        ...payload,
      }),
    }),
  getSummary: () => request('/research/summary'),
};

export const AdminAPI = {
  getAiConfig: () => request('/admin/ai-config'),
  updateAiConfig: (config) =>
    request('/admin/ai-config', {
      method: 'PUT',
      body: JSON.stringify(config),
    }),
  getStats: () => request('/admin/stats'),
  getOrders: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/orders${query ? `?${query}` : ''}`);
  },
  getOrderDetail: (orderId) => request(`/admin/orders/${orderId}`),
  updateOrderStatus: (orderId, payload) =>
    request(`/admin/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
};
