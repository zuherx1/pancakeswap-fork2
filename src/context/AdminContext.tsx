import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface AdminUser {
  id:       string;
  username: string;
  email:    string;
  role:     string;
}

interface AdminCtx {
  user:        AdminUser | null;
  token:       string | null;
  loading:     boolean;
  login:       (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout:      () => void;
  isLoggedIn:  boolean;
}

const AdminContext = createContext<AdminCtx>({
  user: null, token: null, loading: true,
  login: async () => ({ success: false }),
  logout: () => {},
  isLoggedIn: false,
});

export const useAdmin = () => useContext(AdminContext);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user,    setUser]    = useState<AdminUser | null>(null);
  const [token,   setToken]   = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('admin_token');
      const savedUser = localStorage.getItem('admin_user');
      if (saved && savedUser) {
        setToken(saved);
        setUser(JSON.parse(savedUser));
      }
    } catch {}
    setLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Login failed' };
      setToken(data.token);
      setUser(data.admin);
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_user', JSON.stringify(data.admin));
      return { success: true };
    } catch {
      return { success: false, error: 'Network error' };
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  }, []);

  return (
    <AdminContext.Provider value={{ user, token, loading, login, logout, isLoggedIn: !!token }}>
      {children}
    </AdminContext.Provider>
  );
};

export async function adminFetch(url: string, token: string, options: RequestInit = {}) {
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
}
