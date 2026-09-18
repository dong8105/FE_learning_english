import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  User as UserIcon, 
  Lock, 
  LogIn, 
  UserPlus, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Flame, 
  Cloud, 
  Check, 
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

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, login, register } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');

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

  if (!isAuthModalOpen) return null;

  // Live validation calculations for Register
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
      closeAuthModal();
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
      closeAuthModal();
    } else {
      if (audioManager && typeof audioManager.playWrong === 'function') {
        audioManager.playWrong();
      }
      setErrorMsg(result.error || 'Đăng nhập không thành công');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trimmedUser || !regPassword) {
      setErrorMsg('Vui lòng điền đầy đủ tên đăng nhập và mật khẩu');
      return;
    }

    if (regName && !NAME_REGEX.test(regName.trim())) {
      setErrorMsg('Họ và tên từ 2 đến 50 ký tự');
      return;
    }

    if (!isUsernameValid) {
      setErrorMsg('Tên đăng nhập phải từ 3-30 ký tự (chữ cái, chữ số, gạch dưới) hoặc địa chỉ email hợp lệ');
      return;
    }

    if (!hasMinLen) {
      setErrorMsg('Mật khẩu bắt buộc tối thiểu 6 ký tự');
      return;
    }

    if (!hasLetter || !hasDigit) {
      setErrorMsg('Mật khẩu cần kết hợp cả chữ cái và chữ số để đảm bảo an toàn');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp');
      return;
    }

    if (audioManager && typeof audioManager.playClick === 'function') {
      audioManager.playClick();
    }
    setLoading(true);
    setErrorMsg('');

    const result = await register(trimmedUser, regPassword, regName.trim() || undefined);
    setLoading(false);

    if (result.success) {
      if (audioManager && typeof audioManager.playCorrect === 'function') {
        audioManager.playCorrect();
      }
      toast.success('Tạo tài khoản thành công! Đã tự động kích hoạt bàn học.');
      closeAuthModal();
    } else {
      if (audioManager && typeof audioManager.playWrong === 'function') {
        audioManager.playWrong();
      }
      setErrorMsg(result.error || 'Đăng ký không thành công');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl sm:rounded-[2rem] shadow-2xl shadow-indigo-500/20 dark:shadow-black/80 border border-slate-200/90 dark:border-slate-800/90 overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Gradient Bar */}
        <div className="h-2.5 bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600 shrink-0" />
        
        {/* Scrollable Modal Content */}
        <div className="p-5 sm:p-7 overflow-y-auto custom-scrollbar">
          {/* Close button */}
          <button
            onClick={() => {
              if (audioManager && typeof audioManager.playClick === 'function') {
                audioManager.playClick();
              }
              closeAuthModal();
            }}
            className="cursor-pointer absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors z-10"
            aria-label="Đóng cửa sổ"
          >
            <X size={20} />
          </button>

          {/* Header Title & Subtitle */}
          <div className="flex items-start gap-3.5 mb-4 pr-8">
            <div className="p-3 bg-gradient-to-br from-indigo-600 to-blue-600 text-white rounded-2xl shadow-md shadow-indigo-500/30 shrink-0">
              <ShieldCheck size={26} />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Bluebell Auth
                </h2>
                <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Pro Max
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
                Đăng nhập để đồng bộ tiến độ và lưu giữ chuỗi ngày học
              </p>
            </div>
          </div>

          {/* MANDATORY SYSTEM RULE BANNER */}
          <div className="mb-5 p-3.5 rounded-2xl bg-gradient-to-r from-amber-50/95 via-orange-50/90 to-amber-50/80 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-amber-950/20 border-l-4 border-l-amber-500 border border-amber-200/90 dark:border-amber-800/50 shadow-xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-200 font-extrabold text-xs">
              <Lock size={14} className="shrink-0 text-amber-600 dark:text-amber-400" />
              <span>Quy định hệ thống:</span>
            </div>
            <p className="text-xs text-amber-950 dark:text-amber-200/90 leading-relaxed pl-5 font-medium">
              Bắt buộc đăng nhập tài khoản để vào bàn học, làm bài tập và đồng bộ tiến độ học tập cá nhân.
            </p>
            <div className="pt-1 pl-5 flex flex-wrap gap-2 text-[10px] font-bold">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white/80 dark:bg-slate-900/60 text-amber-800 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/60 shadow-2xs">
                <Flame size={11} className="text-orange-500" />
                <span>Giữ chuỗi ngày học</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white/80 dark:bg-slate-900/60 text-amber-800 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/60 shadow-2xs">
                <Cloud size={11} className="text-blue-500" />
                <span>Lưu tiến độ tự động</span>
              </span>
            </div>
          </div>

          {/* Tab Switcher: Login / Register */}
          <div className="flex bg-slate-100 dark:bg-slate-800/90 p-1.5 rounded-2xl mb-5">
            <button
              type="button"
              onClick={() => {
                if (audioManager && typeof audioManager.playClick === 'function') {
                  audioManager.playClick();
                }
                setTab('login');
                setErrorMsg('');
              }}
              className={`cursor-pointer flex-1 py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                tab === 'login'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <LogIn size={15} />
              <span>Đăng Nhập</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (audioManager && typeof audioManager.playClick === 'function') {
                  audioManager.playClick();
                }
                setTab('register');
                setErrorMsg('');
              }}
              className={`cursor-pointer flex-1 py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                tab === 'register'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <UserPlus size={15} />
              <span>Đăng Ký Tài Khoản</span>
            </button>
          </div>

          {/* Error Alert Box */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 rounded-2xl flex items-start gap-2 text-rose-600 dark:text-rose-400 text-xs animate-shake">
              <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-500" />
              <span className="font-semibold leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: LOGIN FORM */}
          {tab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tên đăng nhập hoặc Email
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserIcon size={15} />
                  </span>
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="ví dụ: admin hoặc user"
                    required
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Mật khẩu
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">Mật khẩu bảo mật an toàn</span>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={15} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-9 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="cursor-pointer absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="cursor-pointer w-full py-3 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-blue-700 active:scale-[0.99] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-1"
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
          )}

          {/* TAB 2: REGISTER FORM WITH REGEX SUITE */}
          {tab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {/* Field 1: Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Họ và tên
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                />
              </div>

              {/* Field 2: Username with Live Regex Indicator */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Tên đăng nhập / Email *
                  </label>
                  {!isUsernameEmpty && (
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                      isUsernameValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                    }`}>
                      {isUsernameValid ? (
                        <>
                          <BadgeCheck size={12} />
                          <span>Hợp lệ {isUsernameEmail ? '(Email)' : ''}</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle size={12} />
                          <span>Chưa đúng định dạng</span>
                        </>
                      )}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="3-30 ký tự (chữ cái, số, gạch dưới) hoặc địa chỉ email"
                  required
                  className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-xs sm:text-sm outline-none transition-all dark:text-white ${
                    !isUsernameEmpty
                      ? isUsernameValid
                        ? 'border-emerald-500 focus:ring-2 focus:ring-emerald-500'
                        : 'border-rose-400 focus:ring-2 focus:ring-rose-400'
                      : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500'
                  }`}
                />
                <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Gợi ý: 3-30 ký tự hoặc địa chỉ email</span>
                  <span>{trimmedUser.length}/30</span>
                </div>
              </div>

              {/* Field 3: Password with Strength Meter & Safety Checklist */}
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
                    className={`w-full pl-3 pr-9 py-2 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-xs sm:text-sm outline-none transition-all dark:text-white ${
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
                    {showRegPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {regPassword && (
                  <div className="mt-1.5 space-y-1 animate-fade-in">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Độ mạnh mật khẩu:</span>
                      <span className={`font-bold ${strengthConfig[strengthScore].text}`}>
                        {strengthConfig[strengthScore].label}
                      </span>
                    </div>
                    <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex gap-1">
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

                {/* Live Password Checklist */}
                <div className="mt-2 p-2.5 rounded-xl bg-slate-50/90 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5 text-[10px]">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 font-bold">
                    <span className="flex items-center gap-1">
                      <Sparkles size={11} className="text-indigo-500" />
                      <span>Yêu cầu mật khẩu an toàn:</span>
                    </span>
                    <span className={`font-mono ${isPasswordValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                      {hasMinLen && hasLetter && hasDigit ? 'Đã đạt tiêu chuẩn' : 'Cần thêm thông tin'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1 font-medium">
                    <div className={`flex items-center gap-1 transition-colors ${
                      hasMinLen ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'
                    }`}>
                      {hasMinLen ? <Check size={12} className="shrink-0 text-emerald-500" /> : <span className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-600 inline-block shrink-0" />}
                      <span>Tối thiểu 6 ký tự</span>
                    </div>
                    <div className={`flex items-center gap-1 transition-colors ${
                      hasLetter ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'
                    }`}>
                      {hasLetter ? <Check size={12} className="shrink-0 text-emerald-500" /> : <span className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-600 inline-block shrink-0" />}
                      <span>Có chữ cái (a-z, A-Z)</span>
                    </div>
                    <div className={`flex items-center gap-1 transition-colors ${
                      hasDigit ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'
                    }`}>
                      {hasDigit ? <Check size={12} className="shrink-0 text-emerald-500" /> : <span className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-600 inline-block shrink-0" />}
                      <span>Có chữ số (0-9)</span>
                    </div>
                    <div className={`flex items-center gap-1 transition-colors ${
                      hasSpecial ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'
                    }`}>
                      {hasSpecial ? <Check size={12} className="shrink-0 text-emerald-500" /> : <span className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-600 inline-block shrink-0" />}
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
                    <span className={`text-[10px] font-bold flex items-center gap-1 ${
                      isPasswordMatch ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                    }`}>
                      {isPasswordMatch ? (
                        <>
                          <Check size={11} />
                          <span>Khớp mật khẩu</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle size={11} />
                          <span>Chưa khớp</span>
                        </>
                      )}
                    </span>
                  )}
                </div>
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu"
                  required
                  className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-xs sm:text-sm outline-none transition-all dark:text-white ${
                    isConfirmFilled
                      ? isPasswordMatch
                        ? 'border-emerald-500 focus:ring-2 focus:ring-emerald-500'
                        : 'border-rose-400 focus:ring-2 focus:ring-rose-400'
                      : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500'
                  }`}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="cursor-pointer w-full py-2.5 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-blue-700 active:scale-[0.99] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-1"
              >
                {loading ? (
                  <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>
                    <UserPlus size={15} />
                    <span>Tạo Tài Khoản & Bắt Đầu Học</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Demo Login Section */}
          <div className="mt-5 pt-4 border-t border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Sparkles size={13} className="text-amber-500" />
                Đăng nhập nhanh tài khoản mẫu:
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin')}
                className="cursor-pointer flex flex-col items-start p-2.5 bg-amber-50/80 dark:bg-amber-950/30 hover:bg-amber-100/80 dark:hover:bg-amber-900/40 border border-amber-200/80 dark:border-amber-800/50 rounded-2xl text-left transition-all group"
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 mb-0.5">
                  <span>👑 Admin Quản Trị</span>
                </div>
                <span className="text-[10px] text-amber-600/80 dark:text-amber-400 font-mono">
                  admin / admin123
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('user')}
                className="cursor-pointer flex flex-col items-start p-2.5 bg-blue-50/80 dark:bg-blue-950/30 hover:bg-blue-100/80 dark:hover:bg-blue-900/40 border border-blue-200/80 dark:border-blue-800/50 rounded-2xl text-left transition-all group"
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-blue-700 dark:text-blue-300 mb-0.5">
                  <span>🎓 Học Viên Mẫu</span>
                </div>
                <span className="text-[10px] text-blue-600/80 dark:text-blue-400 font-mono">
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
