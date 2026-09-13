import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'user';
  createdAt?: string;
}

export interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  token: string | null;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

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
    return localStorage.getItem('engmaster_token');
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const isAdmin = user?.role === 'admin';

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
    } else {
      localStorage.removeItem('engmaster_token');
    }
  }, [token]);

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    try {
      // 1. Try Backend API first
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmedUsername, password: trimmedPassword }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          setToken(data.token || `token-${data.user.id}`);
          setIsAuthModalOpen(false);
          return { success: true };
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
      setUser(demoAdmin);
      setToken(`demo-token-${Date.now()}`);
      setIsAuthModalOpen(false);
      return { success: true };
    }

    if (trimmedUsername === 'user' && trimmedPassword === 'user123') {
      const demoUser: User = {
        id: 'user-learner-demo',
        username: 'user',
        name: 'Học Viên Mẫu',
        role: 'user',
      };
      setUser(demoUser);
      setToken(`demo-token-${Date.now()}`);
      setIsAuthModalOpen(false);
      return { success: true };
    }

    return { success: false, error: 'Tên đăng nhập hoặc mật khẩu không chính xác' };
  };

  const register = async (username: string, password: string, name?: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    const displayName = name?.trim() || trimmedUsername;

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmedUsername, password: trimmedPassword, name: displayName }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          setToken(data.token || `token-${data.user.id}`);
          setIsAuthModalOpen(false);
          return { success: true };
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
      setUser(newLocalUser);
      setToken(`local-token-${Date.now()}`);
      setIsAuthModalOpen(false);
      return { success: true };
    }

    return { success: false, error: 'Lỗi đăng ký tài khoản' };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('engmaster_user');
    localStorage.removeItem('engmaster_token');
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
        login,
        register,
        logout,
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
