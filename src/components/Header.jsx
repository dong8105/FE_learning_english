import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, Menu, Settings, Moon, Sun, Flame, Search, Volume2, VolumeX, LogIn, LogOut, ShieldCheck, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header({ 
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
        <header className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-md sticky top-0 z-40 shadow-sm dark:shadow-slate-800/50 border-b border-slate-200/70 dark:border-slate-800 transition-colors">
            <div className="px-3 sm:px-4 h-16 flex items-center justify-between gap-2">
                {/* Left: Menu toggle + Logo */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <button 
                        onClick={onToggleSidebar}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg md:hidden text-gray-600 dark:text-slate-400 transition-colors"
                        aria-label="Toggle Menu"
                    >
                        <Menu size={22} />
                    </button>
                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 select-none">
                        <div className="p-1.5 bg-blue-50 dark:bg-blue-950/60 rounded-xl border border-blue-100 dark:border-blue-900/50 shadow-sm">
                            <BookOpen size={22} className="text-blue-600 dark:text-blue-400 fill-blue-600/20" />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-lg md:text-xl font-black tracking-tight leading-none text-slate-800 dark:text-white">
                                EngMaster
                            </h1>
                            <span className="text-[10px] font-semibold tracking-wider text-blue-600 dark:text-blue-400 uppercase hidden sm:inline">
                                Pro Edition
                            </span>
                        </div>
                    </div>
                </div>

                {/* Center: Quick Search Trigger Button */}
                {onOpenSearch && (
                    <div className="flex-1 max-w-xs sm:max-w-sm md:max-w-md mx-2">
                        <button
                            onClick={onOpenSearch}
                            className="w-full flex items-center justify-between gap-2 px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-slate-100/80 hover:bg-slate-200/70 dark:bg-slate-800/70 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl border border-slate-200/60 dark:border-slate-700/60 transition-all shadow-inner group"
                            title="Tìm nhanh từ vựng (Ctrl + K)"
                        >
                            <span className="flex items-center gap-2 truncate">
                                <Search size={16} className="text-slate-400 group-hover:text-blue-500 transition-colors shrink-0" />
                                <span className="truncate">Tìm kiếm {wordCount ? `${wordCount} từ...` : 'từ vựng...'}</span>
                            </span>
                            <span className="hidden md:flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 text-[10px] font-semibold bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 rounded border border-slate-200 dark:border-slate-700 shadow-xs">
                                    Ctrl
                                </kbd>
                                <kbd className="px-1.5 py-0.5 text-[10px] font-semibold bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 rounded border border-slate-200 dark:border-slate-700 shadow-xs">
                                    K
                                </kbd>
                            </span>
                        </button>
                    </div>
                )}

                {/* Right: Badges & Controls */}
                <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
                    {/* Streak Badge */}
                    <div 
                        className="flex items-center gap-1 sm:1.5 text-xs font-bold text-orange-500 bg-orange-50 dark:bg-orange-500/10 px-2.5 py-1.5 rounded-full border border-orange-200/80 dark:border-orange-500/20 shadow-xs select-none" 
                        title="Chuỗi ngày học liên tiếp"
                    >
                        <Flame size={15} className="fill-orange-500 animate-pulse text-orange-500" />
                        <span className="hidden xs:inline">{streak} ngày</span>
                        <span className="xs:hidden">{streak}d</span>
                    </div>

                    {/* SFX Audio Toggle */}
                    {onToggleSfx && (
                        <button
                            onClick={onToggleSfx}
                            className={`p-2 rounded-xl transition-all ${
                                isSfxMuted 
                                    ? 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800' 
                                    : 'text-blue-600 dark:text-blue-400 bg-blue-50/70 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50'
                            }`}
                            title={isSfxMuted ? 'Bật âm thanh hiệu ứng (SFX)' : 'Tắt âm thanh hiệu ứng (SFX)'}
                            aria-label="Toggle SFX Sound"
                        >
                            {isSfxMuted ? <VolumeX size={19} /> : <Volume2 size={19} />}
                        </button>
                    )}
                    
                    {/* Dark/Light Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                        title="Chuyển chế độ Sáng/Tối"
                        aria-label="Toggle Theme"
                    >
                        {theme === 'dark' ? <Sun size={19} className="text-amber-400" /> : <Moon size={19} />}
                    </button>

                    {/* Settings Modal Toggle */}
                    <button
                        onClick={onOpenSettings}
                        className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                        title="Cài đặt giọng đọc & AI"
                        aria-label="Settings"
                    >
                        <Settings size={19} />
                    </button>

                    {/* Auth Login / User Profile Dropdown */}
                    {user ? (
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className={`flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 rounded-xl transition-all border ${
                                    isAdmin 
                                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300' 
                                        : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60 text-blue-700 dark:text-blue-300'
                                }`}
                                title={user.name || user.username}
                            >
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
                                    isAdmin ? 'bg-amber-500 text-slate-950' : 'bg-blue-600 text-white'
                                }`}>
                                    {isAdmin ? '👑' : (user.name ? user.name.charAt(0).toUpperCase() : 'U')}
                                </div>
                                <span className="text-xs font-bold hidden sm:inline truncate max-w-[90px]">
                                    {user.name || user.username}
                                </span>
                            </button>

                            {/* Dropdown Menu */}
                            {isUserMenuOpen && (
                                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 py-2 z-50 animate-fade-in text-xs">
                                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                                        <div className="font-black text-slate-800 dark:text-white truncate">
                                            {user.name || user.username}
                                        </div>
                                        <div className="text-[11px] text-slate-400 font-mono">
                                            @{user.username} {isAdmin ? '• Quản trị viên' : ''}
                                        </div>
                                    </div>

                                    {isAdmin && onNavigateTab && (
                                        <button
                                            onClick={() => {
                                                onNavigateTab('admin_dashboard');
                                                setIsUserMenuOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-2.5 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 font-bold flex items-center gap-2 transition-colors"
                                        >
                                            <ShieldCheck size={16} />
                                            <span>Admin Dashboard</span>
                                        </button>
                                    )}

                                    <button
                                        onClick={() => {
                                            logout();
                                            setIsUserMenuOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold flex items-center gap-2 transition-colors"
                                    >
                                        <LogOut size={16} />
                                        <span>Đăng Xuất</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={openAuthModal}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all"
                            title="Đăng nhập tài khoản"
                        >
                            <LogIn size={15} />
                            <span className="hidden sm:inline">Đăng nhập</span>
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}
