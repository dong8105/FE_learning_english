import React from 'react';
import { Home, LayoutDashboard, BookOpen, Gamepad2, Search, Menu } from 'lucide-react';
import { audioManager } from '../utils/audioManager';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSearch: () => void;
  onToggleSidebar?: () => void;
}

export default function BottomNav({
  activeTab,
  setActiveTab,
  onOpenSearch,
  onToggleSidebar,
}: BottomNavProps) {
  const isGameActive = activeTab.startsWith('game_');
  const isStudyActive = ['flashcards', 'quiz', 'dictation', 'match', 'typing', 'optimal', 'sequential3'].includes(activeTab);

  const handleTabClick = (tab: string) => {
    audioManager.playClick();
    setActiveTab(tab);
  };

  return (
    <nav className="md:hidden fixed bottom-3 left-2 right-2 max-w-md mx-auto z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xl shadow-slate-900/10 dark:shadow-black/40 px-2 py-1.5 transition-all">
      <div className="flex items-center justify-between">
        {/* Trang chủ */}
        <button
          onClick={() => handleTabClick('home')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all active:scale-90 ${
            activeTab === 'home'
              ? 'text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/60 font-bold shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Home size={18} className={activeTab === 'home' ? 'stroke-[2.5]' : ''} />
          <span className="text-[10px] mt-0.5">Trang chủ</span>
        </button>

        {/* Bàn học (Dashboard) */}
        <button
          onClick={() => handleTabClick('dashboard')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all active:scale-90 ${
            activeTab === 'dashboard'
              ? 'text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/60 font-bold shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <LayoutDashboard size={18} className={activeTab === 'dashboard' ? 'stroke-[2.5]' : ''} />
          <span className="text-[10px] mt-0.5">Bàn học</span>
        </button>

        {/* Học tập */}
        <button
          onClick={() => handleTabClick(isStudyActive ? activeTab : 'flashcards')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all active:scale-90 ${
            isStudyActive
              ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/60 font-bold shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BookOpen size={18} className={isStudyActive ? 'stroke-[2.5]' : ''} />
          <span className="text-[10px] mt-0.5">Học từ</span>
        </button>

        {/* Trò chơi */}
        <button
          onClick={() => handleTabClick(isGameActive ? activeTab : 'game_survival')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all active:scale-90 ${
            isGameActive
              ? 'text-violet-600 dark:text-violet-400 bg-violet-50/80 dark:bg-violet-950/60 font-bold shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Gamepad2 size={18} className={isGameActive ? 'stroke-[2.5]' : ''} />
          <span className="text-[10px] mt-0.5">Trò chơi</span>
        </button>

        {/* Tra cứu nhanh */}
        <button
          onClick={() => {
            audioManager.playClick();
            onOpenSearch();
          }}
          className="flex flex-col items-center py-1 px-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 active:scale-90 transition-all"
        >
          <Search size={18} />
          <span className="text-[10px] mt-0.5">Tra từ</span>
        </button>

        {/* Menu mở rộng */}
        <button
          onClick={() => {
            audioManager.playClick();
            onToggleSidebar?.();
          }}
          className="flex flex-col items-center py-1 px-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 active:scale-90 transition-all"
        >
          <Menu size={18} />
          <span className="text-[10px] mt-0.5">Menu</span>
        </button>
      </div>
    </nav>
  );
}
