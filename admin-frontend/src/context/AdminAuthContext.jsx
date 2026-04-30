import { createContext, useContext, useState, useEffect } from 'react';
import { adminApi } from '../api';

const AuthCtx = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      adminApi.me().then(u => { if (u.role === 'admin') setAdmin(u); else localStorage.removeItem('adminToken'); })
        .catch(() => localStorage.removeItem('adminToken'))
        .finally(() => setLoading(false));
    } else setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await adminApi.login({ email, password });
    localStorage.setItem('adminToken', data.token);
    setAdmin(data.user);
  };

  const logout = () => { localStorage.removeItem('adminToken'); setAdmin(null); };

  return <AuthCtx.Provider value={{ admin, loading, login, logout }}>{!loading && children}</AuthCtx.Provider>;
}

export const useAdminAuth = () => useContext(AuthCtx);