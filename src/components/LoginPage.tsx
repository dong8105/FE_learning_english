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
  Flame,
  Check,
  Cloud,
  KeyRound,
  BadgeCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { audioManager } from '../utils/audioManager';
import { toast } from 'react-toastify';

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PASSWORD_LETTER_REGEX = /[a-zA-Z]/;
const PASSWORD_DIGIT_REGEX = /\d/;
const PASSWORD_SPECIAL_REGEX = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/;
const NAME_REGEX = /^[a-zA-Z0-9À-ỹ\s'.-]{2,50}$/;

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

  // Live validation calculations
  const trimmedUser = regUsername.trim();
  const isUsernameEmpty = trimmedUser.length === 0;
  const isUsernameValid = USERNAME_REGEX.test(trimmedUser) || EMAIL_REGEX.test(trimmedUser);
  const isUsernameEmail = EMAIL_REGEX.test(trimmedUser);

  const hasMinLen = regPassword.length >= 6;
  const hasLetter = PASSWORD_LETTER_REGEX.test(regPassword);
  const hasDigit = PASSWORD_DIGIT_REGEX.test(regPassword);
  const hasSpecial = PASSWORD_SPECIAL_REGEX.test(regPassword);
  const isPasswordValid = hasMinLen && hasLetter && hasDigit;

  const isConfirmFilled = regConfirmPassword.length > 0;
  const isPasswordMatch = isConfirmFilled && regPassword === regConfirmPassword;

  // Password strength score: 0 to 4
  const strengthScore = (() => {
    let score = 0;
    if (hasMinLen) score += 1;
    if (hasLetter) score += 1;
    if (hasDigit) score += 1;
    if (hasSpecial) score += 1;
    return score;
  })();

  const strengthConfig = [
    { label: 'Rất yếu', color: 'bg-slate-200 dark:bg-slate-700', text: 'text-slate-400' },
    { label: 'Yếu', color: 'bg-rose-500', text: 'text-rose-500' },
    { label: 'Trung bình', color: 'bg-amber-500', text: 'text-amber-500' },
    { label: 'Khá', color: 'bg-blue-500', text: 'text-blue-500' },
    { label: 'Mạnh (Tối ưu)', color: 'bg-emerald-500', text: 'text-emerald-500' },
  ];

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

      const loggedUser = result.user || (() => {
        try {
          const saved = localStorage.getItem('engmaster_user');
          return saved ? JSON.parse(saved) : null;
        } catch {
          return null;
        }
      })();
      const isAdminUser = loggedUser?.role === 'admin';
      const targetTab = sessionStorage.getItem('redirectAfterLogin');
      sessionStorage.removeItem('redirectAfterLogin');

      if (isAdminUser) {
        if (targetTab && targetTab !== 'login' && targetTab !== 'home') {
          onNavigate(targetTab);
        } else {
          onNavigate('admin_dashboard');
        }
      } else {
        if (targetTab && targetTab !== 'admin_dashboard' && targetTab !== 'admin' && targetTab !== 'manage' && targetTab !== 'login' && targetTab !== 'home') {
          onNavigate(targetTab);
        } else {
          onNavigate('dashboard');
        }
      }
    } else {
      if (audioManager && typeof audioManager.playWrong === 'function') {
        audioManager.playWrong();
      }
      setErrorMsg(result.error || 'Đăng nhập không thành công');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = regName.trim();

    if (!trimmedUser || !regPassword) {
      setErrorMsg('Vui lòng điền tên đăng nhập và mật khẩu');
      return;
    }
    if (trimmedName && !NAME_REGEX.test(trimmedName)) {
      setErrorMsg('Họ và tên từ 2 đến 50 ký tự');
      return;
    }
    if (!isUsernameValid) {
      setErrorMsg('Tên đăng nhập từ 3 đến 30 ký tự (chữ cái, chữ số, gạch dưới) hoặc địa chỉ email');
      return;
    }
    if (!hasMinLen) {
      setErrorMsg('Mật khẩu chưa đạt: Tối thiểu 6 ký tự');
      return;
    }
    if (!hasLetter) {
      setErrorMsg('Mật khẩu chưa đạt: Cần ít nhất 1 chữ cái (a-z, A-Z)');
      return;
    }
    if (!hasDigit) {
      setErrorMsg('Mật khẩu chưa đạt: Cần ít nhất 1 chữ số (0-9)');
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
      sessionStorage.removeItem('redirectAfterLogin');
      onNavigate('dashboard');
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
      <div className="max-w-xl mx-auto py-8 sm:py-12 px-4 animate-fade-in space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate('home')}
            className="cursor-pointer inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Về Trang Chủ</span>
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <span>Vào Bàn Học</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Profile Card (Claymorphic / Glass) */}
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-[2rem] shadow-2xl shadow-indigo-500/10 dark:shadow-black/70 border border-slate-200/90 dark:border-slate-800/90 overflow-hidden transition-all">
          <div className="h-3 bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600" />
          
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg ring-4 ${
                isAdmin 
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 ring-amber-500/20' 
                  : 'bg-gradient-to-br from-indigo-600 to-blue-600 text-white ring-indigo-500/20 shadow-indigo-500/30'
              }`}>
                {user.name ? user.name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {user.name || user.username}
                  </h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold shadow-xs ${
                    isAdmin 
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800' 
                      : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                  }`}>
                    {isAdmin ? '👑 Quản Trị Viên' : '🎓 Học Viên'}
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  Tài khoản: @{user.username}
                </div>
              </div>
            </div>

            {/* Status Info Grid */}
            <div className="p-4 bg-slate-50/90 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5 font-medium">
                  <KeyRound size={14} className="text-indigo-500" />
                  <span>Mã số học viên:</span>
                </span>
                <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300 bg-slate-200/70 dark:bg-slate-700/70 px-2.5 py-0.5 rounded-md font-semibold">{user.id}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5 font-medium">
                  <Cloud size={14} className="text-blue-500" />
                  <span>Đồng bộ tiến độ học:</span>
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 size={14} />
                  <span>Đã lưu trực tuyến</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  <span>Trạng thái bảo vệ:</span>
                </span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-md font-bold">
                  Bảo vệ an toàn
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => onNavigate('dashboard')}
                className="cursor-pointer w-full py-3.5 bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600 hover:from-indigo-700 hover:to-blue-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-indigo-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                <span>🚀 Vào Bàn Học Từ Vựng</span>
                <ArrowRight size={16} />
              </button>

              {isAdmin && (
                <button
                  onClick={() => onNavigate('admin_dashboard')}
                  className="cursor-pointer w-full py-3 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-800 dark:text-amber-300 font-bold text-xs rounded-2xl border border-amber-200 dark:border-amber-800/60 transition-all flex items-center justify-center gap-2"
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
                className="cursor-pointer w-full py-3 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-2"
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

  // 2. IF NOT LOGGED IN: FULL PRO MAX AUTHENTICATION VIEW
  return (
    <div className="max-w-lg mx-auto py-6 sm:py-10 px-4 animate-fade-in space-y-5">
      {/* Top Breadcrumb & Status Pill */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('home')}
          className="cursor-pointer inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Về Trang Chủ</span>
        </button>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/60 text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
          <ShieldCheck size={13} className="text-indigo-600 dark:text-indigo-400" />
          <span>Bảo mật an toàn</span>
        </div>
      </div>

      {/* Main Auth Card */}
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-[2rem] shadow-2xl shadow-indigo-500/10 dark:shadow-black/70 border border-slate-200/90 dark:border-slate-800/90 overflow-hidden transition-all">
        {/* Top Gradient Banner Accent */}
        <div className="h-3 bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600" />

        <div className="p-6 sm:p-8">
          {/* Header Title & Subtitle */}
          <div className="flex items-start gap-3.5 mb-5">
            <div className="p-3.5 bg-gradient-to-br from-indigo-600 to-blue-600 text-white rounded-2xl shadow-md shadow-indigo-500/30 shrink-0">
              <ShieldCheck size={28} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Bluebell Auth
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Học Tập
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
                Đăng nhập để đồng bộ tiến độ và lưu giữ chuỗi ngày học
              </p>
            </div>
          </div>

          {/* MANDATORY SYSTEM RULE BANNER */}
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-50/95 via-orange-50/90 to-amber-50/80 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-amber-950/20 border-l-4 border-l-amber-500 border border-amber-200/90 dark:border-amber-800/50 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-extrabold text-xs sm:text-sm">
              <Lock size={16} className="shrink-0 text-amber-600 dark:text-amber-400" />
              <span>Quy định hệ thống:</span>
            </div>
            <p className="text-xs text-amber-950 dark:text-amber-200/90 leading-relaxed pl-6">
              Bắt buộc đăng nhập tài khoản để vào bàn học, làm bài tập và đồng bộ tiến độ học tập cá nhân.
            </p>
            {/* Value Chips */}
            <div className="pt-1.5 pl-6 flex flex-wrap gap-2 text-[11px] font-bold">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white/80 dark:bg-slate-900/60 text-amber-800 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/60 shadow-2xs">
                <Flame size={12} className="text-orange-500" />
                <span>Giữ chuỗi ngày học</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white/80 dark:bg-slate-900/60 text-amber-800 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/60 shadow-2xs">
                <Cloud size={12} className="text-blue-500" />
                <span>Lưu tiến độ tự động</span>
              </span>
            </div>
          </div>

          {/* Tab Switcher: Login / Register */}
          <div className="flex bg-slate-100 dark:bg-slate-800/90 p-1.5 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setErrorMsg('');
              }}
              className={`cursor-pointer flex-1 py-2.5 text-xs sm:text-sm font-black rounded-xl transition-all flex items-center justify-center gap-2 ${
                tab === 'login'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-md shadow-slate-200/50 dark:shadow-none'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
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
              className={`cursor-pointer flex-1 py-2.5 text-xs sm:text-sm font-black rounded-xl transition-all flex items-center justify-center gap-2 ${
                tab === 'register'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-md shadow-slate-200/50 dark:shadow-none'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <UserPlus size={16} />
              <span>Đăng Ký Tài Khoản</span>
            </button>
          </div>

          {/* Error Message Alert */}
          {errorMsg && (
            <div className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 rounded-2xl flex items-start gap-2.5 text-rose-600 dark:text-rose-400 text-xs animate-shake">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-500" />
              <span className="font-semibold leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: LOGIN FORM */}
          {tab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tên đăng nhập hoặc Email
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserIcon size={16} />
                  </span>
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="Nhập tên tài khoản hoặc email"
                    required
                    className="w-full pl-10 pr-3.5 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Mật khẩu
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">Mật khẩu được bảo mật an toàn</span>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Nhập mật khẩu của bạn"
                    required
                    className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="cursor-pointer absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="cursor-pointer w-full py-3.5 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-blue-700 active:scale-[0.99] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>
                    <LogIn size={16} />
                    <span>Đăng Nhập Vào Bàn Học</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* TAB 2: REGISTER FORM WITH ENHANCED REGEX SUITE */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* Field 1: Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Họ và tên
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn A"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-white"
                  />
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                  Nhập họ và tên đầy đủ từ 2 đến 50 ký tự
                </p>
              </div>

              {/* Field 2: Username with Live Validation Indicator */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Tên đăng nhập hoặc Email *
                  </label>
                  {!isUsernameEmpty && (
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                      isUsernameValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                    }`}>
                      {isUsernameValid ? (
                        <>
                          <BadgeCheck size={13} />
                          <span>Hợp lệ {isUsernameEmail ? '(Email)' : ''}</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle size={13} />
                          <span>Chưa đúng định dạng</span>
                        </>
                      )}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="3-30 ký tự (chữ cái, số, gạch dưới) hoặc địa chỉ email"
                    required
                    className={`w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-xs sm:text-sm outline-none transition-all dark:text-white ${
                      !isUsernameEmpty
                        ? isUsernameValid
                          ? 'border-emerald-500 focus:ring-2 focus:ring-emerald-500'
                          : 'border-rose-400 focus:ring-2 focus:ring-rose-400'
                        : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500'
                    }`}
                  />
                </div>
                <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
                  <span>Gợi ý: 3-30 ký tự (chữ cái, chữ số, gạch dưới) hoặc email</span>
                  <span>{trimmedUser.length}/30</span>
                </div>
              </div>

              {/* Field 3: Password with Strength Meter & Live Regex Checklist */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mật khẩu tài khoản *
                </label>
                <div className="relative">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự, có cả chữ và số"
                    required
                    className={`w-full pl-3.5 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-xs sm:text-sm outline-none transition-all dark:text-white ${
                      regPassword
                        ? isPasswordValid
                          ? 'border-emerald-500 focus:ring-2 focus:ring-emerald-500'
                          : 'border-amber-400 focus:ring-2 focus:ring-amber-400'
                        : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="cursor-pointer absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    aria-label={showRegPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Password Strength Progress Meter */}
                {regPassword && (
                  <div className="mt-2 space-y-1.5 animate-fade-in">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Độ mạnh mật khẩu:</span>
                      <span className={`font-bold ${strengthConfig[strengthScore].text}`}>
                        {strengthConfig[strengthScore].label}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex gap-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-full flex-1 rounded-full transition-all duration-300 ${
                            strengthScore >= level
                              ? strengthConfig[strengthScore].color
                              : 'bg-slate-200 dark:bg-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* LIVE PASSWORD REQUIREMENTS */}
                <div className="mt-2.5 p-3 rounded-2xl bg-slate-50/90 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 space-y-2 text-[11px]">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Sparkles size={13} className="text-indigo-500" />
                      <span>Yêu cầu mật khẩu an toàn:</span>
                    </span>
                    <span className={`font-mono ${isPasswordValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                      {hasMinLen && hasLetter && hasDigit ? 'Đã đạt tiêu chuẩn' : 'Cần thêm thông tin'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 font-medium">
                    {/* Rule 1: Min length */}
                    <div className={`flex items-center gap-1.5 transition-colors ${
                      hasMinLen ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'
                    }`}>
                      {hasMinLen ? (
                        <Check size={14} className="shrink-0 text-emerald-500" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600 inline-block shrink-0" />
                      )}
                      <span>Tối thiểu 6 ký tự</span>
                    </div>

                    {/* Rule 2: Has Letter */}
                    <div className={`flex items-center gap-1.5 transition-colors ${
                      hasLetter ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'
                    }`}>
                      {hasLetter ? (
                        <Check size={14} className="shrink-0 text-emerald-500" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600 inline-block shrink-0" />
                      )}
                      <span>Có chữ cái (a-z, A-Z)</span>
                    </div>

                    {/* Rule 3: Has Digit */}
                    <div className={`flex items-center gap-1.5 transition-colors ${
                      hasDigit ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'
                    }`}>
                      {hasDigit ? (
                        <Check size={14} className="shrink-0 text-emerald-500" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600 inline-block shrink-0" />
                      )}
                      <span>Có chữ số (0-9)</span>
                    </div>

                    {/* Rule 4: Has Special (Optional / Recommended) */}
                    <div className={`flex items-center gap-1.5 transition-colors ${
                      hasSpecial ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'
                    }`}>
                      {hasSpecial ? (
                        <Check size={14} className="shrink-0 text-emerald-500" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600 inline-block shrink-0" />
                      )}
                      <span>Ký tự đặc biệt (!@#...)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Field 4: Confirm Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Xác nhận mật khẩu *
                  </label>
                  {isConfirmFilled && (
                    <span className={`text-[11px] font-bold flex items-center gap-1 ${
                      isPasswordMatch ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                    }`}>
                      {isPasswordMatch ? (
                        <>
                          <Check size={13} />
                          <span>Mật khẩu trùng khớp</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle size={13} />
                          <span>Chưa trùng khớp</span>
                        </>
                      )}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Nhập lại chính xác mật khẩu trên"
                    required
                    className={`w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-xs sm:text-sm outline-none transition-all dark:text-white ${
                      isConfirmFilled
                        ? isPasswordMatch
                          ? 'border-emerald-500 focus:ring-2 focus:ring-emerald-500'
                          : 'border-rose-400 focus:ring-2 focus:ring-rose-400'
                        : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500'
                    }`}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="cursor-pointer w-full py-3.5 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-blue-700 active:scale-[0.99] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>
                    <UserPlus size={16} />
                    <span>Tạo Tài Khoản & Bắt Đầu Học Ngay</span>
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
