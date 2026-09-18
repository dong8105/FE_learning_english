import React, { useState, useRef, useEffect } from 'react';
import { 
    BookOpen, 
    Menu, 
    Settings, 
    Moon, 
    Sun, 
    Flame, 
    Search, 
    Volume2, 
    VolumeX, 
    LogIn, 
    LogOut, 
    ShieldCheck, 
    User as UserIcon, 
    Crown,
    ChevronDown,
    Home
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useVisibility } from '../context/VisibilityContext';

export default function Header({ 
    activeTab,
    wordCount, 
    onToggleSidebar, 
    onOpenSettings, 
    theme, 
    toggleTheme, 
    streak,
    onOpenSearch,
    isSfxMuted,
    onToggleSfx,
    onNavigateTab
}) {
    const { user, isAdmin, logout, openAuthModal } = useAuth();
    const { isWordCountVisible, isWordCountHidden, shouldAdminBypass } = useVisibility();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);

    // Close user dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="sticky top-0 z-40 backdrop-blur-2xl bg-white/85 dark:bg-[#0c1322]/85 border-b border-slate-200/90 dark:border-slate-800/80 transition-colors duration-200 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_25px_-4px_rgba(0,0,0,0.5)]">
            <div className="px-3 sm:px-5 h-16 flex items-center justify-between gap-2.5 max-w-7xl mx-auto">
                {/* Left: Mobile Menu Trigger & Brand Logo */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    {activeTab !== 'home' && (
                        <button 
                            onClick={onToggleSidebar}
                            className="p-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-blue-400 hover:bg-slate-100/90 dark:hover:bg-slate-800/80 rounded-xl md:hidden transition-all active:scale-95 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer"
                            aria-label="Toggle Menu"
                        >
                            <Menu size={20} />
                        </button>
                    )}

                    {/* Logo & Brand Identity */}
                    <div 
                        onClick={() => onNavigateTab && onNavigateTab('home')}
                        className="flex items-center gap-2.5 select-none cursor-pointer group"
                        title="Về Trang Chủ Bluebell"
                    >
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/25 ring-1 ring-white/25 group-hover:scale-105 group-hover:rotate-[-2deg] transition-all duration-300 shrink-0">
                            <BookOpen size={20} className="stroke-[2.5]" />
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                                <h1 className="text-base sm:text-lg md:text-xl font-black tracking-tight leading-none bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 dark:from-white dark:via-blue-100 dark:to-indigo-200 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
                                    Bluebell
                                </h1>
                                <span className="text-[10px] font-extrabold tracking-wider text-indigo-700 dark:text-blue-300 uppercase bg-indigo-50 dark:bg-blue-950/80 border border-indigo-200 dark:border-blue-800/70 px-1.5 py-0.5 rounded-md leading-none shadow-2xs hidden xs:inline-block">
                                    PRO
                                </span>
                            </div>
                            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline leading-none mt-0.5">
                                Học từ vựng thông minh
                            </span>
                        </div>
                    </div>
                </div>

                {/* Center: Quick Search Trigger Button (Chỉ hiển thị khi đã đăng nhập) */}
                {user && onOpenSearch && (
                    <div className="flex-1 max-w-xs sm:max-w-sm md:max-w-md mx-2">
                        <button
                            onClick={onOpenSearch}
                            className="w-full flex items-center justify-between gap-2.5 px-3.5 py-2 text-xs sm:text-sm bg-slate-100/80 hover:bg-white dark:bg-slate-900/80 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-200 rounded-2xl border border-slate-200/90 dark:border-slate-800/80 hover:border-indigo-400/60 dark:hover:border-indigo-500/50 transition-all duration-200 shadow-2xs hover:shadow-xs group cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:outline-none"
                            title="Tìm nhanh từ vựng (Ctrl + K)"
                        >
                            <span className="flex items-center gap-2 truncate">
                                <Search size={16} className="text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-blue-400 group-hover:scale-110 transition-all duration-200 shrink-0" />
                                <span className="truncate font-semibold text-slate-600 dark:text-slate-200 flex items-center gap-1.5">
                                    <span>
                                        {isWordCountVisible()
                                            ? `Tìm kiếm ${wordCount ? `${wordCount.toLocaleString()} từ...` : 'từ vựng...'}`
                                            : 'Tìm kiếm từ vựng...'}
                                    </span>
                                    {shouldAdminBypass && isWordCountHidden() && (
                                        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                                            Đã ẩn số lượng
                                        </span>
                                    )}
                                </span>
                            </span>
                            <div className="hidden md:flex items-center gap-1 shrink-0">
                                <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700 shadow-2xs">
                                    Ctrl
                                </kbd>
                                <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700 shadow-2xs">
                                    K
                                </kbd>
                            </div>
                        </button>
                    </div>
                )}

                {/* Right: Streak & Action Controls */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    {/* Streak Badge (Chỉ hiển thị khi đã đăng nhập) */}
                    {user && (
                        <div 
                            className="flex items-center gap-1.5 text-xs font-black text-amber-700 dark:text-amber-300 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 dark:from-amber-500/20 dark:via-orange-500/15 dark:to-amber-500/20 px-3 py-1.5 rounded-full border border-amber-300/80 dark:border-amber-500/40 shadow-xs hover:border-amber-400 dark:hover:border-amber-400/80 hover:shadow-xs dark:shadow-[0_0_12px_rgba(245,158,11,0.18)] transition-all duration-200 select-none cursor-default" 
                            title="Chuỗi ngày học liên tiếp"
                        >
                            <Flame size={15} className="fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400 drop-shadow-[0_1px_4px_rgba(245,158,11,0.4)] animate-pulse" />
                            <span className="hidden xs:inline">{streak} ngày</span>
                            <span className="xs:hidden">{streak}d</span>
                        </div>
                    )}


                    {/* SFX Audio Toggle */}
                    {onToggleSfx && (
                        <button
                            onClick={onToggleSfx}
                            className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 active:scale-95 border ${
                                isSfxMuted 
                                    ? 'text-slate-400 dark:text-slate-500 border-transparent hover:bg-slate-100/80 dark:hover:bg-slate-800/80' 
                                    : 'text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/60 border-blue-200/80 dark:border-blue-900/60 shadow-xs hover:bg-blue-100 dark:hover:bg-blue-900/40'
                            }`}
                            title={isSfxMuted ? 'Bật âm thanh hiệu ứng (SFX)' : 'Tắt âm thanh hiệu ứng (SFX)'}
                            aria-label="Toggle SFX Sound"
                        >
                            {isSfxMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
                        </button>
                    )}
                    
                    {/* Dark/Light Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-300 active:scale-95 border border-slate-200/70 dark:border-slate-700/70 bg-slate-50/80 dark:bg-slate-800/70 text-slate-600 dark:text-amber-300 hover:bg-slate-100 dark:hover:bg-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 shadow-xs group"
                        title={theme === 'dark' ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối (Dark Mode)'}
                        aria-label="Toggle Theme"
                    >
                        {theme === 'dark' ? (
                            <Sun size={17} className="text-amber-400 fill-amber-400/20 group-hover:rotate-45 transition-transform duration-300" />
                        ) : (
                            <Moon size={17} className="text-slate-600 group-hover:-rotate-12 group-hover:text-indigo-600 transition-all duration-300" />
                        )}
                    </button>

                    {/* Settings Button */}
                    <button
                        onClick={onOpenSettings}
                        className="w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 active:scale-95 border border-transparent hover:border-slate-200/60 dark:hover:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 shadow-xs group"
                        title="Cài đặt giọng đọc & AI"
                        aria-label="Settings"
                    >
                        <Settings size={17} className="group-hover:rotate-45 transition-transform duration-300" />
                    </button>

                    {/* Auth Login / User Profile Dropdown */}
                    {user ? (
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className={`flex items-center gap-2 p-1 sm:pr-2.5 rounded-xl transition-all duration-200 border shadow-xs active:scale-98 cursor-pointer ${
                                    isAdmin 
                                        ? 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-300/80 dark:border-amber-500/40 text-amber-800 dark:text-amber-200 hover:bg-amber-500/15 dark:hover:bg-amber-500/25' 
                                        : 'bg-slate-100/80 dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800/80 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/90 hover:dark:border-slate-700/80'
                                }`}
                                title={user.name || user.username}
                                aria-expanded={isUserMenuOpen}
                                aria-haspopup="true"
                            >
                                <div className="relative">
                                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-black text-xs shadow-xs ${
                                        isAdmin 
                                            ? 'bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950' 
                                            : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white'
                                    }`}>
                                        {isAdmin ? (
                                            <Crown size={15} className="fill-current" />
                                        ) : (
                                            user.name ? user.name.charAt(0).toUpperCase() : 'U'
                                        )}
                                    </div>
                                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" title="Đang hoạt động" />
                                </div>
                                <span className="text-xs font-bold hidden sm:inline truncate max-w-[90px]">
                                    {user.name || user.username}
                                </span>
                                <ChevronDown 
                                    size={14} 
                                    className={`text-slate-400 transition-transform duration-200 hidden sm:block ${isUserMenuOpen ? 'rotate-180' : ''}`} 
                                />
                            </button>

                            {/* Glassmorphism Dropdown Menu */}
                            {isUserMenuOpen && (
                                <div className="absolute right-0 mt-2.5 w-60 backdrop-blur-2xl bg-white/95 dark:bg-[#0f172a]/95 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800/90 p-2 z-50 animate-fade-in text-xs shadow-black/50">
                                    {/* User Info Header */}
                                    <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 mb-1.5 border border-slate-100 dark:border-slate-800/80">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                                                isAdmin ? 'bg-amber-500 text-slate-950' : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white'
                                            }`}>
                                                {isAdmin ? <Crown size={15} className="fill-current" /> : (user.name ? user.name.charAt(0).toUpperCase() : 'U')}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="font-extrabold text-slate-800 dark:text-white truncate">
                                                    {user.name || user.username}
                                                </div>
                                                <div className="text-[11px] text-slate-400 truncate">
                                                    @{user.username}
                                                </div>
                                            </div>
                                        </div>
                                        {isAdmin && (
                                            <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold text-[10px] border border-amber-500/20">
                                                <ShieldCheck size={12} />
                                                <span>Quản trị viên hệ thống</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    {onNavigateTab && (
                                        <div className="space-y-0.5">
                                            <button
                                                onClick={() => {
                                                    onNavigateTab('home');
                                                    setIsUserMenuOpen(false);
                                                }}
                                                className="w-full text-left px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 font-bold flex items-center gap-2.5 transition-colors"
                                            >
                                                <Home size={15} className="text-blue-500 shrink-0" />
                                                <span>Trang Chủ</span>
                                            </button>

                                            <button
                                                onClick={() => {
                                                    onNavigateTab('login');
                                                    setIsUserMenuOpen(false);
                                                }}
                                                className="w-full text-left px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 font-bold flex items-center gap-2.5 transition-colors"
                                            >
                                                <UserIcon size={15} className="text-indigo-500 shrink-0" />
                                                <span>Hồ Sơ & Tiến Độ Cá Nhân</span>
                                            </button>
                                        </div>
                                    )}

                                    {isAdmin && onNavigateTab && (
                                        <button
                                            onClick={() => {
                                                onNavigateTab('admin_dashboard');
                                                setIsUserMenuOpen(false);
                                            }}
                                            className="w-full text-left px-3 py-2 rounded-xl text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 font-bold flex items-center gap-2.5 transition-colors mt-0.5"
                                        >
                                            <ShieldCheck size={15} className="text-amber-500 shrink-0" />
                                            <span>Admin Dashboard</span>
                                        </button>
                                    )}

                                    <div className="my-1.5 border-t border-slate-100 dark:border-slate-800" />

                                    <button
                                        onClick={() => {
                                            logout();
                                            setIsUserMenuOpen(false);
                                        }}
                                        className="w-full text-left px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold flex items-center gap-2.5 transition-colors"
                                    >
                                        <LogOut size={15} className="shrink-0" />
                                        <span>Đăng Xuất</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={() => onNavigateTab ? onNavigateTab('login') : openAuthModal()}
                            className="flex items-center gap-2 px-3.5 sm:px-4 py-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:via-indigo-500 hover:to-blue-600 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/25 active:scale-95 transition-all duration-200 border border-white/20"
                            title="Đăng nhập tài khoản"
                        >
                            <LogIn size={15} className="shrink-0" />
                            <span className="hidden xs:inline">Đăng nhập</span>
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}

