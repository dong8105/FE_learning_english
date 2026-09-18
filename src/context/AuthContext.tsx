import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface UserStreak {
  count: number;
  lastActiveDate?: string | null;
  lastActiveTimestamp?: number | null;
  isOnlineToday?: boolean;
  isStreakActive?: boolean;
  updatedAt?: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'user';
  createdAt?: string;
  lastActivityAt?: string;
  streak?: UserStreak;
}

export interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  token: string | null;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (username: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  register: (username: string, password: string, name?: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => void;
  getUserStorageKey: (baseKey: string) => string;
  getAuthHeaders: () => Record<string, string>;
}

export const getUserStorageKey = (baseKey: string, currentUser?: User | null): string => {
  let u = currentUser;
  if (!u) {
    try {
      const saved = localStorage.getItem('engmaster_user');
      if (saved) u = JSON.parse(saved);
    } catch {}
  }
  const prefix = u ? `u_${u.id}` : 'guest';
  return `${prefix}_${baseKey}`;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('engmaster_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('engmaster_token') || localStorage.getItem('token');
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const isAdmin = user?.role === 'admin';

  // Automatically restore / verify session from HttpOnly Cookie on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setUser(data.user);
            localStorage.setItem('engmaster_user', JSON.stringify(data.user));
          }
        }
      } catch (err) {
        // Backend temporarily offline, use cached user state
      }
    };
    checkSession();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('engmaster_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('engmaster_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('engmaster_token', token);
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('engmaster_token');
      localStorage.removeItem('token');
    }
  }, [token]);

  const login = async (username: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    try {
      // 1. Try Backend API first with HttpOnly credentials
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: trimmedUsername, password: trimmedPassword }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          localStorage.setItem('engmaster_user', JSON.stringify(data.user));
          if (data.token) {
            localStorage.setItem('engmaster_token', data.token);
          }
          setUser(data.user);
          setToken(data.token || `token-${data.user.id}`);
          setIsAuthModalOpen(false);
          return { success: true, user: data.user };
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        if (res.status === 401 || res.status === 400) {
          return { success: false, error: errData.error || 'Tên đăng nhập hoặc mật khẩu không đúng' };
        }
      }
    } catch (networkError) {
      console.warn('Backend unavailable, attempting offline demo credentials fallback:', networkError);
    }

    // 2. Offline / Demo Fallback Mode (Guarantee that user is never locked out)
    if (trimmedUsername === 'admin' && trimmedPassword === 'admin123') {
      const demoAdmin: User = {
        id: 'user-admin-demo',
        username: 'admin',
        name: 'Quản Trị Viên (Admin Demo)',
        role: 'admin',
      };
      const demoToken = `demo-token-${Date.now()}`;
      localStorage.setItem('engmaster_user', JSON.stringify(demoAdmin));
      localStorage.setItem('engmaster_token', demoToken);
      setUser(demoAdmin);
      setToken(demoToken);
      setIsAuthModalOpen(false);
      return { success: true, user: demoAdmin };
    }

    if (trimmedUsername === 'user' && trimmedPassword === 'user123') {
      const demoUser: User = {
        id: 'user-learner-demo',
        username: 'user',
        name: 'Học Viên Mẫu',
        role: 'user',
      };
      const demoToken = `demo-token-${Date.now()}`;
      localStorage.setItem('engmaster_user', JSON.stringify(demoUser));
      localStorage.setItem('engmaster_token', demoToken);
      setUser(demoUser);
      setToken(demoToken);
      setIsAuthModalOpen(false);
      return { success: true, user: demoUser };
    }

    return { success: false, error: 'Tên đăng nhập hoặc mật khẩu không chính xác' };
  };

  const register = async (username: string, password: string, name?: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    const displayName = name?.trim() || trimmedUsername;

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: trimmedUsername, password: trimmedPassword, name: displayName }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          localStorage.setItem('engmaster_user', JSON.stringify(data.user));
          if (data.token) {
            localStorage.setItem('engmaster_token', data.token);
          }
          setUser(data.user);
          setToken(data.token || `token-${data.user.id}`);
          setIsAuthModalOpen(false);
          return { success: true, user: data.user };
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        return { success: false, error: errData.error || 'Đăng ký không thành công' };
      }
    } catch (networkError) {
      console.warn('Backend unavailable during registration, saving local user:', networkError);
      // Fallback local registration
      const newLocalUser: User = {
        id: `user-local-${Date.now()}`,
        username: trimmedUsername,
        name: displayName,
        role: 'user',
      };
      const demoToken = `demo-token-${Date.now()}`;
      localStorage.setItem('engmaster_user', JSON.stringify(newLocalUser));
      localStorage.setItem('engmaster_token', demoToken);
      setUser(newLocalUser);
      setToken(demoToken);
      setIsAuthModalOpen(false);
      return { success: true, user: newLocalUser };
    }

    return { success: false, error: 'Lỗi đăng ký tài khoản' };
  };

  const logout = () => {
    // Notify server to clear HttpOnly cookie
    fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    }).catch(() => {});

    setUser(null);
    setToken(null);
    localStorage.removeItem('engmaster_user');
    localStorage.removeItem('engmaster_token');
    localStorage.removeItem('token');
    window.dispatchEvent(new CustomEvent('engmaster_auth_changed', { detail: { user: null } }));
  };

  const getAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        token,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        login: async (u, p) => {
          const res = await login(u, p);
          if (res.success) {
            window.dispatchEvent(new CustomEvent('engmaster_auth_changed', { detail: { username: u } }));
          }
          return res;
        },
        register: async (u, p, n) => {
          const res = await register(u, p, n);
          if (res.success) {
            window.dispatchEvent(new CustomEvent('engmaster_auth_changed', { detail: { username: u } }));
          }
          return res;
        },
        logout,
        getUserStorageKey: (baseKey: string) => getUserStorageKey(baseKey, user),
        getAuthHeaders,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
