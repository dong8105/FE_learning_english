import React, { useState } from 'react';
import { 
  ShieldCheck, 
  User as UserIcon, 
  Lock, 
  LogIn, 
  UserPlus, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LogOut,
  Calendar,
  Flame
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { audioManager } from '../utils/audioManager';
import { toast } from 'react-toastify';

interface LoginPageProps {
  onNavigate: (tab: string) => void;
  initialMode?: 'login' | 'register';
}

export default function LoginPage({ onNavigate, initialMode = 'login' }: LoginPageProps) {
  const { user, isAdmin, login, register, logout } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>(initialMode);

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleQuickDemoLogin = async (role: 'admin' | 'user') => {
    if (audioManager && typeof audioManager.playClick === 'function') {
      audioManager.playClick();
    }
    setLoading(true);
    setErrorMsg('');
    const u = role === 'admin' ? 'admin' : 'user';
    const p = role === 'admin' ? 'admin123' : 'user123';

    const result = await login(u, p);
    setLoading(false);
    if (result.success) {
      if (audioManager && typeof audioManager.playCorrect === 'function') {
        audioManager.playCorrect();
      }
      toast.success(`Chào mừng ${role === 'admin' ? 'Quản Trị Viên' : 'Học Viên'} đăng nhập thành công!`);
      const targetTab = sessionStorage.getItem('redirectAfterLogin') || (role === 'admin' ? 'admin_dashboard' : 'dashboard');
      sessionStorage.removeItem('redirectAfterLogin');
      onNavigate(targetTab);
    } else {
      if (audioManager && typeof audioManager.playWrong === 'function') {
        audioManager.playWrong();
      }
      setErrorMsg(result.error || 'Đăng nhập không thành công');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername || !loginPassword) {
      setErrorMsg('Vui lòng điền tên đăng nhập và mật khẩu');
      return;
    }

    if (audioManager && typeof audioManager.playClick === 'function') {
      audioManager.playClick();
    }
    setLoading(true);
    setErrorMsg('');

    const result = await login(loginUsername, loginPassword);
    setLoading(false);

    if (result.success) {
      if (audioManager && typeof audioManager.playCorrect === 'function') {
        audioManager.playCorrect();
      }
      toast.success('Đăng nhập thành công!');
      const targetTab = sessionStorage.getItem('redirectAfterLogin') || 'dashboard';
      sessionStorage.removeItem('redirectAfterLogin');
      onNavigate(targetTab);
    } else {
      if (audioManager && typeof audioManager.playWrong === 'function') {
        audioManager.playWrong();
      }
      setErrorMsg(result.error || 'Đăng nhập không thành công');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUser = regUsername.trim();
    if (!trimmedUser || !regPassword) {
      setErrorMsg('Vui lòng điền tên đăng nhập và mật khẩu');
      return;
    }
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(trimmedUser)) {
      setErrorMsg('Tên đăng nhập phải từ 3 đến 30 ký tự, chỉ gồm chữ cái, chữ số và dấu gạch dưới (_)');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMsg('Mật khẩu phải có độ dài tối thiểu 6 ký tự');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không trùng khớp');
      return;
    }

    if (audioManager && typeof audioManager.playClick === 'function') {
      audioManager.playClick();
    }
    setLoading(true);
    setErrorMsg('');

    const result = await register(regUsername, regPassword, regName);
    setLoading(false);

    if (result.success) {
      if (audioManager && typeof audioManager.playCorrect === 'function') {
        audioManager.playCorrect();
      }
      toast.success('Tạo tài khoản thành công! Đã tự động đăng nhập.');
      const targetTab = sessionStorage.getItem('redirectAfterLogin') || 'dashboard';
      sessionStorage.removeItem('redirectAfterLogin');
      onNavigate(targetTab);
    } else {
      if (audioManager && typeof audioManager.playWrong === 'function') {
        audioManager.playWrong();
      }
      setErrorMsg(result.error || 'Đăng ký không thành công');
    }
  };

  // 1. IF ALREADY LOGGED IN: DISPLAY USER PROFILE CARD
  if (user) {
    return (
      <div className="max-w-xl mx-auto py-8 px-4 animate-fade-in space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Về Trang Chủ</span>
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            <span>Vào Bàn Học</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
          <div className="h-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600" />
          
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shadow-md ${
                isAdmin 
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400' 
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
              }`}>
                {user.name ? user.name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    {user.name || user.username}
                  </h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    isAdmin 
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' 
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                  }`}>
                    {isAdmin ? '👑 Quản Trị Viên' : '🎓 Học Viên'}
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  Tài khoản: @{user.username}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span>Mã định danh User:</span>
                <span className="font-mono text-[11px] text-slate-400">{user.id}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span>Trạng thái tiến độ:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 size={13} />
                  <span>Đồng bộ MySQL</span>
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => onNavigate('dashboard')}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-md shadow-blue-500/20 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <span>🚀 Vào Bàn Học Từ Vựng</span>
                <ArrowRight size={16} />
              </button>

              {isAdmin && (
                <button
                  onClick={() => onNavigate('admin_dashboard')}
                  className="w-full py-3 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-800 dark:text-amber-300 font-bold text-xs rounded-2xl border border-amber-200 dark:border-amber-800/60 transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck size={16} />
                  <span>Mở Trang Quản Trị Hệ Thống</span>
                </button>
              )}

              <button
                onClick={() => {
                  logout();
                  toast.info('Đã đăng xuất tài khoản');
                }}
                className="w-full py-3 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-2"
              >
                <LogOut size={16} />
                <span>Đăng Xuất Khỏi Thiết Bị Này</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. IF NOT LOGGED IN: FULL AUTHENTICATION PAGE VIEW
  return (
    <div className="max-w-md mx-auto py-6 sm:py-10 px-4 animate-fade-in space-y-6">
      {/* Top back to home link */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Về Trang Chủ</span>
        </button>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-900/60 text-[11px] font-bold text-amber-700 dark:text-amber-400">
          <Lock size={12} />
          <span>Bắt buộc đăng nhập để học</span>
        </div>
      </div>

      {/* Main Auth Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
        {/* Decorative top bar */}
        <div className="h-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600" />

        <div className="p-6 sm:p-8">
          {/* Header Title & Icon */}
          <div className="flex items-center gap-3.5 mb-5">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-100 dark:border-blue-900/50 shadow-sm">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                EngMaster Auth
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Đăng nhập để đồng bộ tiến độ và lưu giữ chuỗi ngày học
              </p>
            </div>
          </div>

          {/* Mandatory Login Info Alert */}
          <div className="mb-5 p-3 rounded-2xl bg-gradient-to-r from-amber-50/90 to-orange-50/80 dark:from-amber-950/40 dark:to-orange-950/30 border border-amber-200/80 dark:border-amber-900/50 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
            <Lock size={15} className="shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold">Quy định hệ thống: </span>
              Bắt buộc đăng nhập tài khoản để vào bàn học, làm bài tập và đồng bộ tiến độ học tập cá nhân.
            </div>
          </div>

          {/* Tab switcher: Login / Register */}
          <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setErrorMsg('');
              }}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                tab === 'login'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <LogIn size={16} />
              <span>Đăng Nhập</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('register');
                setErrorMsg('');
              }}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                tab === 'register'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <UserPlus size={16} />
              <span>Đăng Ký Mới</span>
            </button>
          </div>

          {/* Error Message Box */}
          {errorMsg && (
            <div className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 rounded-2xl flex items-start gap-2.5 text-rose-600 dark:text-rose-400 text-xs animate-shake">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: LOGIN FORM */}
          {tab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tên đăng nhập
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserIcon size={16} />
                  </span>
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="Nhập tên đăng nhập"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Mật khẩu
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>
                    <LogIn size={16} />
                    <span>Đăng Nhập Vào Hệ Thống</span>
                  </>
                )}
              </button>

              {/* Quick Demo Login Pills */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
                  ⚡ Đăng nhập nhanh tài khoản mẫu:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('admin')}
                    disabled={loading}
                    className="p-2.5 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200/80 dark:border-amber-800/50 rounded-xl text-left transition-all group"
                  >
                    <div className="text-[11px] font-black text-amber-700 dark:text-amber-300 flex items-center gap-1">
                      <span>👑 Admin</span>
                    </div>
                    <div className="text-[10px] text-amber-600/80 dark:text-amber-400/80 font-mono">
                      admin / admin123
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('user')}
                    disabled={loading}
                    className="p-2.5 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200/80 dark:border-blue-800/50 rounded-xl text-left transition-all group"
                  >
                    <div className="text-[11px] font-black text-blue-700 dark:text-blue-300 flex items-center gap-1">
                      <span>🎓 Học Viên</span>
                    </div>
                    <div className="text-[10px] text-blue-600/80 dark:text-blue-400/80 font-mono">
                      user / user123
                    </div>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* TAB 2: REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Họ và tên
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tên đăng nhập *
                </label>
                <input
                  type="text"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="3-30 ký tự (a-z, 0-9, _)"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mật khẩu *
                </label>
                <div className="relative">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    required
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Xác nhận mật khẩu *
                </label>
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>
                    <UserPlus size={16} />
                    <span>Tạo Tài Khoản & Bắt Đầu Học</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
