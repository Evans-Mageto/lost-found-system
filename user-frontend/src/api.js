const BASE = '/api';

const getToken = () => localStorage.getItem('token');

const headers = (multipart = false) => {
  const h = {};
  const token = getToken();
  if (token) h['Authorization'] = `Bearer ${token}`;
  if (!multipart) h['Content-Type'] = 'application/json';
  return h;
};

const handle = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.errors?.[0]?.msg || 'Something went wrong');
  return data;
};

export const api = {
  // Auth
  register: (body) => fetch(`${BASE}/auth/register`, { method: 'POST', headers: headers(), body: JSON.stringify(body) }).then(handle),
  login: (body) => fetch(`${BASE}/auth/login`, { method: 'POST', headers: headers(), body: JSON.stringify(body) }).then(handle),
  me: () => fetch(`${BASE}/auth/me`, { headers: headers() }).then(handle),

  // Items
  getItems: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetch(`${BASE}/items?${q}`, { headers: headers() }).then(handle);
  },
  getItem: (id) => fetch(`${BASE}/items/${id}`, { headers: headers() }).then(handle),
  getMyReports: () => fetch(`${BASE}/items/my/reports`, { headers: headers() }).then(handle),
  reportLost: (form) => fetch(`${BASE}/items/lost`, { method: 'POST', headers: headers(true), body: form }).then(handle),
  reportFound: (form) => fetch(`${BASE}/items/found`, { method: 'POST', headers: headers(true), body: form }).then(handle),
  deleteItem: (id) => fetch(`${BASE}/items/${id}`, { method: 'DELETE', headers: headers() }).then(handle),

  // Claims
  submitClaim: (body) => fetch(`${BASE}/claims`, { method: 'POST', headers: headers(), body: JSON.stringify(body) }).then(handle),
  getMyClaims: () => fetch(`${BASE}/claims/my`, { headers: headers() }).then(handle),
};
