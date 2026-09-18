import React, { useState, useEffect, useRef, useMemo, useDeferredValue } from 'react';
import { Search, X, Volume2, Sparkles, BookOpen, Layers, ArrowRight, CornerDownLeft } from 'lucide-react';
import { audioManager } from '../utils/audioManager';
import { useVisibility } from '../context/VisibilityContext';

interface WordItem {
  id: string | number;
  en: string;
  vi: string;
  ipa?: string;
  category?: string;
  unit?: number;
  master_group?: string;
  sub_group?: string;
  definition_en?: string;
  definition_vi?: string;
  example_en?: string;
  example_vi?: string;
  collocations?: string;
  mnemonics?: string;
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  words: WordItem[];
  speak: (text: string, e?: React.MouseEvent) => void;
  onSelectWordMode?: (word: WordItem) => void;
}

export default function GlobalSearchModal({
  isOpen,
  onClose,
  words,
  speak,
}: GlobalSearchModalProps) {
  const { isTopicVisible, isWordCountVisible, isWordCountHidden, shouldAdminBypass } = useVisibility();
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter words (limit to top 40 for super fast rendering, excluding hidden topics)
  const filteredWords = useMemo(() => {
    const visibleWords = words.filter(w => !w.master_group || isTopicVisible(w.master_group));
    if (!deferredQuery.trim()) return visibleWords.slice(0, 20);
    const q = deferredQuery.trim().toLowerCase();
    return visibleWords
      .filter(w => 
        (w.en && w.en.toLowerCase().includes(q)) ||
        (w.vi && w.vi.toLowerCase().includes(q)) ||
        (w.category && w.category.toLowerCase().includes(q))
      )
      .slice(0, 40);
  }, [words, deferredQuery, isTopicVisible]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [deferredQuery]);

  // Keyboard navigation inside modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredWords.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredWords.length) % Math.max(1, filteredWords.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredWords[selectedIndex]) {
          speak(filteredWords[selectedIndex].en);
          audioManager.playClick();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredWords, selectedIndex, onClose, speak]);

  if (!isOpen) return null;

  const activeWord = filteredWords[selectedIndex] || null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-[0_20px_50px_rgba(15,23,42,0.15)] border border-slate-200/90 dark:border-slate-800 overflow-hidden z-10 flex flex-col max-h-[85vh]">
        {/* Search Input Bar */}
        <div className="p-4 md:p-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center gap-3 bg-slate-50/70 dark:bg-slate-900/50">
          <Search size={22} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tra cứu nhanh từ tiếng Anh, nghĩa tiếng Việt hoặc chủ đề..."
            className="w-full bg-transparent outline-none text-base md:text-lg font-bold text-slate-900 dark:text-white placeholder-slate-400"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-gray-200 rounded-lg"
            >
              <X size={18} />
            </button>
          )}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-mono">
            ESC để thoát
          </div>
        </div>

        {/* Content Body: Split Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 min-h-0 divide-y md:divide-y-0 md:divide-x divide-slate-200/80 dark:divide-slate-800">
          {/* Left Column: Results List */}
          <div 
            ref={listRef}
            className="md:col-span-5 overflow-y-auto max-h-[45vh] md:max-h-[55vh] p-2 space-y-1 custom-scrollbar"
          >
            {filteredWords.length === 0 ? (
              <div className="p-8 text-center text-slate-400 dark:text-slate-500">
                <BookOpen size={36} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm font-bold">Không tìm thấy từ vựng nào</p>
              </div>
            ) : (
              filteredWords.map((word, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={`${word.id || word.en}-${idx}`}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    onClick={() => {
                      speak(word.en);
                      audioManager.playClick();
                    }}
                    className={`p-3 rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-950 dark:text-indigo-200 border border-indigo-200/90 dark:border-indigo-800/60 shadow-xs font-bold'
                        : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/50 text-slate-700 dark:text-gray-300 border border-transparent'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-base truncate">{word.en}</span>
                        {word.ipa && (
                          <span className="text-xs text-slate-500 dark:text-slate-500 font-mono hidden sm:inline">
                            {word.ipa}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 truncate mt-0.5">
                        {word.vi}
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        speak(word.en);
                      }}
                      className={`p-2 rounded-xl transition ${
                        isSelected 
                          ? 'bg-indigo-600 text-white shadow-sm' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-indigo-600'
                      }`}
                      title="Phát âm"
                    >
                      <Volume2 size={16} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Detailed Card Preview */}
          <div className="md:col-span-7 p-5 md:p-6 overflow-y-auto max-h-[45vh] md:max-h-[55vh] bg-slate-50/50 dark:bg-slate-900/40 custom-scrollbar">
            {activeWord ? (
              <div className="space-y-4 animate-fade-in">
                {/* Word Title & Pronounce */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    {activeWord.category && (
                      <span className="inline-block px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 text-[11px] font-black rounded-lg mb-1.5 border border-indigo-200/90 dark:border-indigo-800/40">
                        {activeWord.category}
                      </span>
                    )}
                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                      {activeWord.en}
                    </h3>
                    {activeWord.ipa && (
                      <p className="text-sm font-mono text-slate-500 dark:text-slate-500 mt-0.5">
                        {activeWord.ipa}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => speak(activeWord.en)}
                    className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-2xl font-black text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition transform active:scale-95 cursor-pointer"
                  >
                    <Volume2 size={16} /> Phát Âm
                  </button>
                </div>

                {/* Meaning Box */}
                <div className="p-4 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/90 dark:border-slate-700/70 shadow-2xs">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">
                    Nghĩa Tiếng Việt
                  </span>
                  <p className="text-lg font-black text-slate-900 dark:text-gray-100">
                    {activeWord.vi}
                  </p>
                </div>

                {/* Example Sentence */}
                {(activeWord.example_en || activeWord.example_vi) && (
                  <div className="p-4 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/90 dark:border-slate-700/70 shadow-2xs space-y-1.5">
                    <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider block">
                      Ví Dụ Minh Họa
                    </span>
                    {activeWord.example_en && (
                      <p className="text-sm font-bold text-slate-800 dark:text-gray-200 italic">
                        "{activeWord.example_en}"
                      </p>
                    )}
                    {activeWord.example_vi && (
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        → {activeWord.example_vi}
                      </p>
                    )}
                  </div>
                )}

                {/* Collocations & Mnemonics */}
                {activeWord.collocations && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200/80 dark:border-amber-800/40 text-xs text-amber-950 dark:text-amber-300">
                    <strong className="font-black text-amber-900">Cụm từ hay gặp:</strong> {activeWord.collocations}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                Chọn một từ để xem chi tiết
              </div>
            )}
          </div>
        </div>

        {/* Footer Shortcut Guide */}
        <div className="p-3 bg-slate-50 dark:bg-slate-850 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 px-5">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[10px] text-slate-700 dark:text-slate-200">↑↓</span> Di chuyển
            </span>
            <span className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[10px] text-slate-700 dark:text-slate-200">Enter</span> Nghe phát âm
            </span>
          </div>
          <span className="font-medium text-slate-500 flex items-center gap-1.5">
            {isWordCountVisible()
              ? `Tổng ${words.length.toLocaleString()} từ trong từ điển`
              : 'Từ điển từ vựng chuẩn'}
            {shouldAdminBypass && isWordCountHidden() && (
              <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                Đã ẩn số lượng
              </span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
