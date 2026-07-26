// API封装
const API_BASE = '/api';

export const TokenManager = {
  get() { return localStorage.getItem('auth_token'); },
  set(token) { localStorage.setItem('auth_token', token); },
  clear() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },
  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  setUser(user) { localStorage.setItem('user', JSON.stringify(user)); }
};

async function request(url, options = {}) {
  const token = TokenManager.get();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  };

  const response = await fetch(`${API_BASE}${url}`, { ...options, headers });
  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      TokenManager.clear();
      window.location.hash = '#/login';
    }
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

export const AuthAPI = {
  register: (email, password, username) => request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, username }) }),
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => request('/auth/logout', { method: 'POST' })
};

export const ProductAPI = {
  getList: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/products${query ? '?' + query : ''}`);
  },
  getById: (id) => request(`/products/${id}`),
  getCategories: () => request('/categories')
};

export const CartAPI = {
  get: () => request('/cart'),
  add: (productId, quantity = 1) => request('/cart', { method: 'POST', body: JSON.stringify({ productId, quantity }) }),
  update: (itemId, quantity) => request(`/cart/${itemId}`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
  remove: (itemId) => request(`/cart/${itemId}`, { method: 'DELETE' })
};

export const OrderAPI = {
  create: (items, shippingAddress) => request('/orders', { method: 'POST', body: JSON.stringify({ items, shippingAddress }) }),
  getList: () => request('/orders'),
  getById: (id) => request(`/orders/${id}`)
};

export const AIAPI = {
  chat: (message, aiType, productId = null) => request('/ai/chat', { method: 'POST', body: JSON.stringify({ message, aiType, productId }) }),
  getHistory: (aiType = null) => request(`/ai/history${aiType ? '?aiType=' + aiType : ''}`)
};

export const AdminAPI = {
  getAiConfig: () => request('/admin/ai-config'),
  updateAiConfig: (config) => request('/admin/ai-config', { method: 'PUT', body: JSON.stringify(config) }),
  getStats: () => request('/admin/stats')
};

export const ResearchAPI = {
  trackBehavior: (behaviorType, productId, durationMs, metadata) => request('/research/track', { method: 'POST', body: JSON.stringify({ behaviorType, productId, durationMs, metadata }) })
};
