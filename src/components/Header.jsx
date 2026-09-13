import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, Menu, Settings, Moon, Sun, Flame, Search, Volume2, VolumeX, LogIn, LogOut, ShieldCheck, User as UserIcon, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/70 dark:border-slate-800/80 shadow-xs transition-colors">
            <div className="px-3 sm:px-5 h-16 flex items-center justify-between gap-2 max-w-7xl mx-auto">
                {/* Left: Menu toggle + Logo */}
                <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
                    {activeTab !== 'home' && (
                        <button 
                            onClick={onToggleSidebar}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl md:hidden text-slate-600 dark:text-slate-400 active:scale-95 transition-all"
                            aria-label="Toggle Menu"
                        >
                            <Menu size={22} />
                        </button>
                    )}
                    <div 
                        onClick={() => onNavigateTab && onNavigateTab('home')}
                        className="flex items-center gap-2.5 select-none cursor-pointer group"
                        title="Về Trang Chủ EngMaster"
                    >
                        <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-xl shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
                            <BookOpen size={20} className="stroke-[2.5]" />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-lg md:text-xl font-black tracking-tight leading-none bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 dark:from-blue-400 dark:via-indigo-300 dark:to-purple-400 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
                                EngMaster
                            </h1>
                            <span className="text-[10px] font-bold tracking-wider text-blue-600/80 dark:text-blue-400/80 uppercase hidden sm:inline">
                                Pro Edition
                            </span>
                        </div>
                    </div>

                    {/* Top Desktop Navigation Links When on Home Page */}
                    {activeTab === 'home' && onNavigateTab && (
                        <nav className="hidden md:flex items-center gap-1 sm:gap-1.5 ml-2">
                            <button
                                onClick={() => onNavigateTab('dashboard')}
                                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5"
                                title={!user ? "Yêu cầu đăng nhập để học" : "Vào Bàn Học"}
                            >
                                <span>🚀 Bàn Học</span>
                                {!user && <Lock size={12} className="text-amber-500 opacity-80" />}
                            </button>
                            <button
                                onClick={() => onNavigateTab('toeic30')}
                                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5"
                                title={!user ? "Yêu cầu đăng nhập để học" : "Lộ Trình TOEIC 30 Ngày"}
                            >
                                <span>📅 TOEIC 30 Ngày</span>
                                {!user && <Lock size={12} className="text-amber-500 opacity-80" />}
                            </button>
                            <button
                                onClick={() => onNavigateTab('grammar')}
                                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5"
                                title={!user ? "Yêu cầu đăng nhập để học" : "Ngữ Pháp Chuyên Sâu"}
                            >
                                <span>✍️ Ngữ Pháp</span>
                                {!user && <Lock size={12} className="text-amber-500 opacity-80" />}
                            </button>
                            <button
                                onClick={() => onNavigateTab('game_survival')}
                                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5"
                                title={!user ? "Yêu cầu đăng nhập để chơi" : "Trò Chơi Ôn Tập"}
                            >
                                <span>🎮 Trò Chơi</span>
                                {!user && <Lock size={12} className="text-amber-500 opacity-80" />}
                            </button>
                        </nav>
                    )}
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
                        className="flex items-center gap-1.5 text-xs font-black text-amber-600 dark:text-amber-400 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 px-3 py-1.5 rounded-full border border-amber-200/80 dark:border-amber-800/60 shadow-xs select-none" 
                        title="Chuỗi ngày học liên tiếp"
                    >
                        <Flame size={15} className="fill-amber-500 text-amber-500 animate-bounce" />
                        <span className="hidden xs:inline">{streak} ngày</span>
                        <span className="xs:hidden">{streak}d</span>
                    </div>

                    {/* SFX Audio Toggle */}
                    {onToggleSfx && (
                        <button
                            onClick={onToggleSfx}
                            className={`p-2 rounded-xl transition-all active:scale-95 border ${
                                isSfxMuted 
                                    ? 'text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/80' 
                                    : 'text-blue-600 dark:text-blue-400 bg-blue-50/70 dark:bg-blue-950/50 border-blue-200/70 dark:border-blue-900/50 hover:bg-blue-100'
                            }`}
                            title={isSfxMuted ? 'Bật âm thanh hiệu ứng (SFX)' : 'Tắt âm thanh hiệu ứng (SFX)'}
                            aria-label="Toggle SFX Sound"
                        >
                            {isSfxMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                        </button>
                    )}
                    
                    {/* Dark/Light Theme Toggle with Enhanced Glow */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 text-slate-600 dark:text-amber-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl transition-all active:scale-95 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                        title={theme === 'dark' ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối (Dark Mode)'}
                        aria-label="Toggle Theme"
                    >
                        {theme === 'dark' ? (
                            <Sun size={19} className="text-amber-400 fill-amber-400/20" />
                        ) : (
                            <Moon size={19} className="text-slate-600 hover:text-indigo-600" />
                        )}
                    </button>

                    {/* Settings Modal Toggle */}
                    <button
                        onClick={onOpenSettings}
                        className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl transition-all active:scale-95 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                        title="Cài đặt giọng đọc & AI"
                        aria-label="Settings"
                    >
                        <Settings size={18} />
                    </button>

                    {/* Auth Login / User Profile Dropdown */}
                    {user ? (
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className={`flex items-center gap-2 p-1 sm:px-3 sm:py-1 rounded-xl transition-all border shadow-xs active:scale-98 ${
                                    isAdmin 
                                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300' 
                                        : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                                }`}
                                title={user.name || user.username}
                            >
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shadow-xs ${
                                    isAdmin ? 'bg-amber-500 text-slate-950' : 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white'
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

                                    {onNavigateTab && (
                                        <>
                                            <button
                                                onClick={() => {
                                                    onNavigateTab('home');
                                                    setIsUserMenuOpen(false);
                                                }}
                                                className="w-full text-left px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold flex items-center gap-2 transition-colors"
                                            >
                                                <span>🏠 Trang Chủ</span>
                                            </button>

                                            <button
                                                onClick={() => {
                                                    onNavigateTab('login');
                                                    setIsUserMenuOpen(false);
                                                }}
                                                className="w-full text-left px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold flex items-center gap-2 transition-colors"
                                            >
                                                <UserIcon size={15} />
                                                <span>Thông Tin Tài Khoản</span>
                                            </button>
                                        </>
                                    )}

                                    {isAdmin && onNavigateTab && (
                                        <button
                                            onClick={() => {
                                                onNavigateTab('admin_dashboard');
                                                setIsUserMenuOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-2 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 font-bold flex items-center gap-2 transition-colors"
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
                            onClick={() => onNavigateTab ? onNavigateTab('login') : openAuthModal()}
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
