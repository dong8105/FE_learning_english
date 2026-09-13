import React from 'react';
import { LayoutDashboard, BookOpen, Gamepad2, Search, Menu } from 'lucide-react';
import { audioManager } from '../utils/audioManager';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSearch: () => void;
  onToggleSidebar: () => void;
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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-gray-200/80 dark:border-slate-800/80 px-2 py-1 shadow-lg">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Dashboard */}
        <button
          onClick={() => handleTabClick('dashboard')}
          className={`flex flex-col items-center py-1.5 px-3 rounded-2xl transition-all ${
            activeTab === 'dashboard'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105'
              : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <LayoutDashboard size={20} className={activeTab === 'dashboard' ? 'stroke-[2.5]' : ''} />
          <span className="text-[10px] mt-0.5">Trang chủ</span>
        </button>

        {/* Học tập */}
        <button
          onClick={() => handleTabClick(isStudyActive ? activeTab : 'flashcards')}
          className={`flex flex-col items-center py-1.5 px-3 rounded-2xl transition-all ${
            isStudyActive
              ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105'
              : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <BookOpen size={20} className={isStudyActive ? 'stroke-[2.5]' : ''} />
          <span className="text-[10px] mt-0.5">Học từ</span>
        </button>

        {/* Trò chơi */}
        <button
          onClick={() => handleTabClick(isGameActive ? activeTab : 'game_survival')}
          className={`flex flex-col items-center py-1.5 px-3 rounded-2xl transition-all ${
            isGameActive
              ? 'text-violet-600 dark:text-violet-400 font-bold scale-105'
              : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Gamepad2 size={20} className={isGameActive ? 'stroke-[2.5]' : ''} />
          <span className="text-[10px] mt-0.5">Trò chơi</span>
        </button>

        {/* Tra cứu nhanh */}
        <button
          onClick={() => {
            audioManager.playClick();
            onOpenSearch();
          }}
          className="flex flex-col items-center py-1.5 px-3 rounded-2xl text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
        >
          <Search size={20} />
          <span className="text-[10px] mt-0.5">Tra từ</span>
        </button>

        {/* Menu mở rộng */}
        <button
          onClick={() => {
            audioManager.playClick();
            onToggleSidebar();
          }}
          className="flex flex-col items-center py-1.5 px-3 rounded-2xl text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
        >
          <Menu size={20} />
          <span className="text-[10px] mt-0.5">Menu</span>
        </button>
      </div>
    </nav>
  );
}
