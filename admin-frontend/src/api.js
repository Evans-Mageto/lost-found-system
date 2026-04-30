const BASE = import.meta.env.VITE_API_URL || '/api';

const getToken = () => localStorage.getItem('adminToken');
const headers = () => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

const handle = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
};

const q = (params) => new URLSearchParams(params).toString();

export const adminApi = {
  login: (body) => fetch(`${BASE}/auth/admin/login`, { method: 'POST', headers: headers(), body: JSON.stringify(body) }).then(handle),
  me: () => fetch(`${BASE}/auth/me`, { headers: headers() }).then(handle),

  getDashboard: () => fetch(`${BASE}/admin/dashboard`, { headers: headers() }).then(handle),

  getUsers: () => fetch(`${BASE}/admin/users`, { headers: headers() }).then(handle),
  deleteUser: (id) => fetch(`${BASE}/admin/users/${id}`, { method: 'DELETE', headers: headers() }).then(handle),
  toggleUser: (id) => fetch(`${BASE}/admin/users/${id}/toggle`, { method: 'PUT', headers: headers() }).then(handle),

  getItems: (params) => fetch(`${BASE}/admin/items?${q(params)}`, { headers: headers() }).then(handle),
  getItem: (id) => fetch(`${BASE}/admin/items/${id}`, { headers: headers() }).then(handle),
  updateItemStatus: (id, status) => fetch(`${BASE}/admin/items/${id}/status`, { method: 'PUT', headers: headers(), body: JSON.stringify({ status }) }).then(handle),
  deleteItem: (id) => fetch(`${BASE}/admin/items/${id}`, { method: 'DELETE', headers: headers() }).then(handle),

  getClaims: (params) => fetch(`${BASE}/admin/claims?${q(params)}`, { headers: headers() }).then(handle),
  approveClaim: (id, msg) => fetch(`${BASE}/admin/claims/${id}/approve`, { method: 'PUT', headers: headers(), body: JSON.stringify({ admin_response: msg }) }).then(handle),
  rejectClaim: (id, msg) => fetch(`${BASE}/admin/claims/${id}/reject`, { method: 'PUT', headers: headers(), body: JSON.stringify({ admin_response: msg }) }).then(handle),

  getLogs: (params) => fetch(`${BASE}/admin/activity-logs?${q(params)}`, { headers: headers() }).then(handle),
};
