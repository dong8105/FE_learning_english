import React, { useState } from 'react';
import { X, ShieldCheck, User as UserIcon, Lock, LogIn, UserPlus, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { audioManager } from '../utils/audioManager';
import { toast } from 'react-toastify';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, login, register } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isAuthModalOpen) return null;

  const handleQuickDemoLogin = async (role: 'admin' | 'user') => {
    audioManager.playClick();
    setLoading(true);
    setErrorMsg('');
    const u = role === 'admin' ? 'admin' : 'user';
    const p = role === 'admin' ? 'admin123' : 'user123';

    const result = await login(u, p);
    setLoading(false);
    if (result.success) {
      audioManager.playCorrect();
      toast.success(`Chào mừng ${role === 'admin' ? 'Quản Trị Viên' : 'Học Viên'} đăng nhập thành công!`);
    } else {
      audioManager.playWrong();
      setErrorMsg(result.error || 'Đăng nhập không thành công');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername || !loginPassword) {
      setErrorMsg('Vui lòng điền tên đăng nhập và mật khẩu');
      return;
    }

    audioManager.playClick();
    setLoading(true);
    setErrorMsg('');

    const result = await login(loginUsername, loginPassword);
    setLoading(false);

    if (result.success) {
      audioManager.playCorrect();
      toast.success('Đăng nhập thành công!');
    } else {
      audioManager.playWrong();
      setErrorMsg(result.error || 'Đăng nhập không thành công');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regUsername || !regPassword) {
      setErrorMsg('Vui lòng điền tên đăng nhập và mật khẩu');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không trùng khớp');
      return;
    }

    audioManager.playClick();
    setLoading(true);
    setErrorMsg('');

    const result = await register(regUsername, regPassword, regName);
    setLoading(false);

    if (result.success) {
      audioManager.playCorrect();
      toast.success('Tạo tài khoản thành công! Đã tự động đăng nhập.');
    } else {
      audioManager.playWrong();
      setErrorMsg(result.error || 'Đăng ký không thành công');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient bar */}
        <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600" />
        
        <div className="p-6 md:p-8">
          {/* Close button */}
          <button
            onClick={() => {
              audioManager.playClick();
              closeAuthModal();
            }}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          {/* Title & Badge */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-100 dark:border-blue-900/50 shadow-sm">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                EngMaster Auth
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Đăng nhập để lưu tiến độ và mở khóa quyền Quản trị
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl mb-6">
            <button
              onClick={() => {
                audioManager.playClick();
                setTab('login');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 text-xs md:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                tab === 'login'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <LogIn size={16} />
              Đăng Nhập
            </button>
            <button
              onClick={() => {
                audioManager.playClick();
                setTab('register');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 text-xs md:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                tab === 'register'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <UserPlus size={16} />
              Đăng Ký
            </button>
          </div>

          {/* Error Alert Box */}
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 mb-5 text-xs text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl">
              <AlertCircle size={16} className="shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          {tab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tên đăng nhập
                </label>
                <div className="relative">
                  <UserIcon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="ví dụ: admin hoặc user"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn size={18} />
                    <span>Đăng Nhập</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Register Form */}
          {tab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Họ và tên
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="ví dụ: Nguyễn Văn A"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tên đăng nhập
                </label>
                <input
                  type="text"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="viết liền không dấu"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Xác nhận mật khẩu
                </label>
                <input
                  type="password"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus size={18} />
                    <span>Tạo Tài Khoản</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Demo Login Section */}
          <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-500" />
                Đăng nhập nhanh (Tài khoản mẫu):
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin')}
                className="flex flex-col items-start p-3 bg-amber-50/70 dark:bg-amber-950/30 hover:bg-amber-100/70 dark:hover:bg-amber-900/40 border border-amber-200/80 dark:border-amber-800/50 rounded-2xl text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300 mb-0.5">
                  <span>👑 Admin Quản Trị</span>
                </div>
                <span className="text-[11px] text-amber-600/80 dark:text-amber-400 font-mono">
                  admin / admin123
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('user')}
                className="flex flex-col items-start p-3 bg-blue-50/70 dark:bg-blue-950/30 hover:bg-blue-100/70 dark:hover:bg-blue-900/40 border border-blue-200/80 dark:border-blue-800/50 rounded-2xl text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 mb-0.5">
                  <span>🎓 Học Viên Mẫu</span>
                </div>
                <span className="text-[11px] text-blue-600/80 dark:text-blue-400 font-mono">
                  user / user123
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
