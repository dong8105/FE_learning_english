import React from 'react';
import { BookOpen, Menu, Settings, Moon, Sun, Flame, Search, Volume2, VolumeX } from 'lucide-react';

export default function Header({ 
    wordCount, 
    onToggleSidebar, 
    onOpenSettings, 
    theme, 
    toggleTheme, 
    streak,
    onOpenSearch,
    isSfxMuted,
    onToggleSfx
}) {
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
                </div>
            </div>
        </header>
    );
}
