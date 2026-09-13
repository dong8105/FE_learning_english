import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, Volume2, Sparkles, BookOpen, Layers, ArrowRight, CornerDownLeft } from 'lucide-react';
import { audioManager } from '../utils/audioManager';

interface WordItem {
  id: string | number;
  en: string;
  vi: string;
  ipa?: string;
  category?: string;
  unit?: number;
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
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter words (limit to top 30 for super fast rendering)
  const filteredWords = useMemo(() => {
    if (!query.trim()) return words.slice(0, 20);
    const q = query.trim().toLowerCase();
    return words
      .filter(w => 
        (w.en && w.en.toLowerCase().includes(q)) ||
        (w.vi && w.vi.toLowerCase().includes(q)) ||
        (w.category && w.category.toLowerCase().includes(q))
      )
      .slice(0, 40);
  }, [words, query]);

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
  }, [query]);

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
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden z-10 flex flex-col max-h-[85vh]">
        {/* Search Input Bar */}
        <div className="p-4 md:p-5 border-b border-gray-100 dark:border-slate-800 flex items-center gap-3 bg-gray-50/50 dark:bg-slate-900/50">
          <Search size={22} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tra cứu nhanh từ tiếng Anh, nghĩa tiếng Việt hoặc chủ đề..."
            className="w-full bg-transparent outline-none text-base md:text-lg font-bold text-gray-900 dark:text-white placeholder-gray-400"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg"
            >
              <X size={18} />
            </button>
          )}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 rounded-lg text-xs font-mono">
            ESC để thoát
          </div>
        </div>

        {/* Content Body: Split Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 min-h-0 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-slate-800">
          {/* Left Column: Results List */}
          <div 
            ref={listRef}
            className="md:col-span-5 overflow-y-auto max-h-[45vh] md:max-h-[55vh] p-2 space-y-1 custom-scrollbar"
          >
            {filteredWords.length === 0 ? (
              <div className="p-8 text-center text-gray-400 dark:text-slate-500">
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
                        ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800/60 shadow-sm'
                        : 'hover:bg-gray-50 dark:hover:bg-slate-800/50 text-gray-700 dark:text-gray-300 border border-transparent'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-base truncate">{word.en}</span>
                        {word.ipa && (
                          <span className="text-xs text-gray-400 dark:text-slate-500 font-mono hidden sm:inline">
                            {word.ipa}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-slate-400 truncate mt-0.5">
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
                          : 'bg-gray-100 dark:bg-slate-800 text-gray-500 hover:text-indigo-600'
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
          <div className="md:col-span-7 p-5 md:p-6 overflow-y-auto max-h-[45vh] md:max-h-[55vh] bg-gray-50/40 dark:bg-slate-900/40 custom-scrollbar">
            {activeWord ? (
              <div className="space-y-4 animate-fade-in">
                {/* Word Title & Pronounce */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    {activeWord.category && (
                      <span className="inline-block px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[11px] font-black rounded-lg mb-1.5 border border-indigo-200/50 dark:border-indigo-800/40">
                        {activeWord.category}
                      </span>
                    )}
                    <h3 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                      {activeWord.en}
                    </h3>
                    {activeWord.ipa && (
                      <p className="text-sm font-mono text-gray-400 dark:text-slate-500 mt-0.5">
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
                <div className="p-4 bg-white dark:bg-slate-800/80 rounded-2xl border border-gray-200/70 dark:border-slate-700/70 shadow-sm">
                  <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-1">
                    Nghĩa Tiếng Việt
                  </span>
                  <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
                    {activeWord.vi}
                  </p>
                </div>

                {/* Example Sentence */}
                {(activeWord.example_en || activeWord.example_vi) && (
                  <div className="p-4 bg-white dark:bg-slate-800/80 rounded-2xl border border-gray-200/70 dark:border-slate-700/70 shadow-sm space-y-1.5">
                    <span className="text-[10px] font-black uppercase text-indigo-500 tracking-wider block">
                      Ví Dụ Minh Họa
                    </span>
                    {activeWord.example_en && (
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-200 italic">
                        "{activeWord.example_en}"
                      </p>
                    )}
                    {activeWord.example_vi && (
                      <p className="text-xs text-gray-500 dark:text-slate-400">
                        → {activeWord.example_vi}
                      </p>
                    )}
                  </div>
                )}

                {/* Collocations & Mnemonics */}
                {activeWord.collocations && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200/60 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-300">
                    <strong>Cụm từ hay gặp:</strong> {activeWord.collocations}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                Chọn một từ để xem chi tiết
              </div>
            )}
          </div>
        </div>

        {/* Footer Shortcut Guide */}
        <div className="p-3 bg-gray-50 dark:bg-slate-850 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-gray-500 dark:text-slate-400 px-5">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-slate-700 font-mono text-[10px]">↑↓</span> Di chuyển
            </span>
            <span className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-slate-700 font-mono text-[10px]">Enter</span> Nghe phát âm
            </span>
          </div>
          <span>Tổng {words.length.toLocaleString()} từ trong từ điển</span>
        </div>
      </div>
    </div>
  );
}
