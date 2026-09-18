import React, { useState, useMemo } from 'react';
import {
    BookOpen, Volume2, CheckCircle2, Search, Filter, RefreshCw,
    Sparkles, ChevronRight, Check, Play, Flame, Layers, HelpCircle,
    ArrowLeft, Grid, RotateCcw, Network
} from 'lucide-react';
import FlashcardMode from './FlashcardMode';
import QuizMode from './QuizMode';
import MatchMode from './MatchMode';
import TypingMode from './TypingMode';
import DictationMode from './DictationMode';
import Sequential3StepMode from './Sequential3StepMode';
import JapaneseRelatedWordsMode from './JapaneseRelatedWordsMode';

const POS_CATEGORIES = ["Tất cả", "Danh từ", "Động từ", "Tính từ (i)", "Tính từ (na)", "Phó từ", "Thán từ", "Cụm từ"];

const JapaneseMinnaMode = ({ japaneseWords = [], speak, onExit }) => {
    const [selectedLessons, setSelectedLessons] = useState([]); // [] = All 50 Lessons
    const [selectedPos, setSelectedPos] = useState('Tất cả');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeStudyMode, setActiveStudyMode] = useState(null); // null | 'flashcard' | 'quiz' | 'match' | 'typing' | 'dictation' | 'sequential3' | 'related'

    // Extract all unique lesson names (Bài 01 -> Bài 50)
    const availableLessons = useMemo(() => {
        const set = new Set();
        japaneseWords.forEach(w => {
            if (w.sub_group) set.add(w.sub_group);
            else if (w.lesson) set.add(`Bài ${String(w.lesson).padStart(2, '0')}`);
        });
        if (set.size === 0) {
            for (let i = 1; i <= 50; i++) {
                set.add(`Bài ${String(i).padStart(2, '0')}`);
            }
        }
        return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    }, [japaneseWords]);

    // Multi-select toggle for Lessons
    const toggleLesson = (lesson) => {
        setSelectedLessons(prev => {
            if (prev.includes(lesson)) {
                return prev.filter(l => l !== lesson);
            } else {
                return [...prev, lesson];
            }
        });
    };

    const clearSelectedLessons = () => {
        setSelectedLessons([]);
    };

    const selectAllLessons = () => {
        setSelectedLessons([]);
    };

    // Filter current Japanese words based on multi-select lessons, POS, and search query
    const currentWords = useMemo(() => {
        return japaneseWords.filter(w => {
            const lessonName = w.sub_group || (w.lesson ? `Bài ${String(w.lesson).padStart(2, '0')}` : '');
            
            // Lesson filter
            if (selectedLessons.length > 0 && !selectedLessons.includes(lessonName)) {
                return false;
            }

            // POS category filter
            if (selectedPos !== 'Tất cả') {
                if (!w.category || !w.category.toLowerCase().includes(selectedPos.toLowerCase().replace(/\s*\(.*?\)/, ''))) {
                    return false;
                }
            }

            // Search query filter
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                const hiraganaMatch = w.hiragana && w.hiragana.toLowerCase().includes(q);
                const kanjiMatch = w.kanji && w.kanji.toLowerCase().includes(q);
                const romajiMatch = w.romaji && w.romaji.toLowerCase().includes(q);
                const enMatch = w.en && w.en.toLowerCase().includes(q);
                const viMatch = w.vi && w.vi.toLowerCase().includes(q);
                return hiraganaMatch || kanjiMatch || romajiMatch || enMatch || viMatch;
            }

            return true;
        });
    }, [japaneseWords, selectedLessons, selectedPos, searchQuery]);

    // Helper mapped words for standard study modes (map hiragana/kanji/en to 'en' and vi to 'vi')
    const mappedWordsForStudy = useMemo(() => {
        return currentWords.map(w => {
            const displayWord = w.kanji ? `${w.kanji} (${w.hiragana || w.romaji})` : (w.hiragana || w.romaji || w.en || '');
            const speechText = w.hiragana || w.kanji || (w.en ? w.en.replace(/\(.*?\)/g, '').trim() : '');
            return {
                id: w.id,
                en: w.en || displayWord,
                displayWord,
                kanji: w.kanji,
                hiragana: w.hiragana,
                romaji: w.romaji,
                speechText,
                isJapanese: true,
                vi: w.vi,
                ipa: w.romaji ? `[${w.romaji}]` : (w.hiragana ? `/${w.hiragana}/` : (w.ipa || '')),
                category: w.category || 'Từ vựng',
                master_group: 'Từ Vựng Tiếng Nhật Minna No Nihongo',
                sub_group: w.sub_group || (w.lesson ? `Bài ${String(w.lesson).padStart(2, '0')}` : 'Bài 01'),
                example_en: w.romaji,
                example_vi: w.vi
            };
        });
    }, [currentWords]);

    // Speak Japanese custom handler with safe rate sanitization
    const handleSpeakJapanese = (wordText, rateOrEvent = null) => {
        if (speak && wordText) {
            const numericRate = (typeof rateOrEvent === 'number' && Number.isFinite(rateOrEvent) && rateOrEvent > 0)
                ? rateOrEvent
                : null;
            speak(wordText, numericRate, 'ja-JP');
        }
    };

    // If studying in a specific sub-mode, render that sub-component
    if (activeStudyMode) {
        return (
            <div className="max-w-6xl mx-auto p-4 space-y-4">
                <button
                    onClick={() => setActiveStudyMode(null)}
                    className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 text-xs font-black transition cursor-pointer flex items-center gap-2 border border-gray-200 dark:border-slate-700 shadow-sm"
                >
                    <ArrowLeft size={16} />
                    <span>Quay lại Danh Sách 50 Bài Minna</span>
                </button>

                {activeStudyMode === 'flashcard' && (
                    <FlashcardMode words={mappedWordsForStudy} speak={(txt) => handleSpeakJapanese(txt)} />
                )}
                {activeStudyMode === 'quiz' && (
                    <QuizMode words={mappedWordsForStudy} speak={(txt) => handleSpeakJapanese(txt)} />
                )}
                {activeStudyMode === 'match' && (
                    <MatchMode words={mappedWordsForStudy} speak={(txt) => handleSpeakJapanese(txt)} />
                )}
                {activeStudyMode === 'typing' && (
                    <TypingMode words={mappedWordsForStudy} speak={(txt) => handleSpeakJapanese(txt)} />
                )}
                {activeStudyMode === 'dictation' && (
                    <DictationMode words={mappedWordsForStudy} speak={(txt) => handleSpeakJapanese(txt)} />
                )}
                {activeStudyMode === 'sequential3' && (
                    <Sequential3StepMode words={mappedWordsForStudy} speak={(txt) => handleSpeakJapanese(txt)} />
                )}
                {activeStudyMode === 'related' && (
                    <JapaneseRelatedWordsMode
                        japaneseWords={currentWords.length > 0 ? currentWords : japaneseWords}
                        allWords={japaneseWords}
                        speak={(txt) => handleSpeakJapanese(txt)}
                        onExit={() => setActiveStudyMode(null)}
                    />
                )}
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
            
            {/* ── Top Header Banner ── */}
            <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 dark:from-rose-950/90 dark:via-red-950/80 dark:to-slate-900/90 rounded-3xl p-6 md:p-8 text-white shadow-xl dark:shadow-[0_0_50px_-15px_rgba(244,63,94,0.15)] dark:border dark:border-rose-900/50 relative overflow-hidden">
                <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-10 pointer-events-none text-9xl font-black">
                    日本語
                </div>
                
                <div className="relative z-10 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-wider text-white border border-white/30 flex items-center gap-1.5">
                            <span>🇯🇵</span>
                            <span>Học Tiếng Nhật Sơ Cấp (N5 - N4)</span>
                        </span>
                        <span className="px-3 py-1 bg-amber-400/30 backdrop-blur-md rounded-full text-xs font-black text-amber-200 border border-amber-300/30">
                            Giáo Trình Chuẩn Minna No Nihongo
                        </span>
                    </div>

                    <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
                        Chuyên Đề Từ Vựng 50 Bài Minna No Nihongo
                    </h1>

                    <p className="text-xs md:text-sm text-red-100 max-w-3xl leading-relaxed">
                        Hệ thống tự động đồng bộ từ vựng 50 Bài Minna No Nihongo kèm phiên âm Kana, Kanji, Romaji & bản dịch tiếng Việt. Hỗ trợ chọn luyện tập 1 hoặc nhiều Bài cùng lúc với 6 chế độ học tương tác đỉnh cao!
                    </p>

                    {/* Feature Stats */}
                    <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-bold text-red-100">
                        <div className="flex items-center gap-1.5">
                            <BookOpen size={16} className="text-amber-300" />
                            <span>Tổng số: <strong className="text-white text-sm">{japaneseWords.length || '1500+'}</strong> từ vựng</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Layers size={16} className="text-amber-300" />
                            <span>Phân chia: <strong className="text-white text-sm">50 Bài học</strong></span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Study Mode Launch Bar ── */}
            <div className="bg-white dark:bg-[#0f172a]/90 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.4)] space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-900 dark:text-slate-200 flex items-center gap-2">
                        <Sparkles size={18} className="text-rose-500" />
                        <span>Chọn Chế Độ Học Nâng Cao ({currentWords.length} từ vựng đã chọn)</span>
                    </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                    <button
                        onClick={() => setActiveStudyMode('sequential3')}
                        className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition text-left cursor-pointer space-y-1.5 group shadow-2xs"
                    >
                        <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black text-xs shadow-xs group-hover:scale-110 transition">
                            3B
                        </div>
                        <div className="font-black text-xs text-rose-950 dark:text-rose-200">Lộ Trình 3 Bước</div>
                        <div className="text-[10px] text-rose-700 dark:text-rose-300/80 font-semibold">Học 5in1 vững chắc</div>
                    </button>

                    <button
                        onClick={() => setActiveStudyMode('flashcard')}
                        className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition text-left cursor-pointer space-y-1.5 group shadow-2xs"
                    >
                        <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xs shadow-xs group-hover:scale-110 transition">
                            🎴
                        </div>
                        <div className="font-black text-xs text-amber-950 dark:text-amber-200">Flashcards 3D</div>
                        <div className="text-[10px] text-amber-700 dark:text-amber-300/80 font-semibold">Lặp lại ngắt quãng</div>
                    </button>

                    <button
                        onClick={() => setActiveStudyMode('quiz')}
                        className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition text-left cursor-pointer space-y-1.5 group shadow-2xs"
                    >
                        <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-xs group-hover:scale-110 transition">
                            ❓
                        </div>
                        <div className="font-black text-xs text-indigo-950 dark:text-indigo-200">Trắc Nghiệm</div>
                        <div className="text-[10px] text-indigo-700 dark:text-indigo-300/80 font-semibold">Lựa chọn 4 đáp án</div>
                    </button>

                    <button
                        onClick={() => setActiveStudyMode('match')}
                        className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition text-left cursor-pointer space-y-1.5 group shadow-2xs"
                    >
                        <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs shadow-xs group-hover:scale-110 transition">
                            🧩
                        </div>
                        <div className="font-black text-xs text-emerald-950 dark:text-emerald-200">Ghép Cặp Từ</div>
                        <div className="text-[10px] text-emerald-700 dark:text-emerald-300/80 font-semibold">Nối Kana & Tiếng Việt</div>
                    </button>

                    <button
                        onClick={() => setActiveStudyMode('typing')}
                        className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition text-left cursor-pointer space-y-1.5 group shadow-2xs"
                    >
                        <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-xs group-hover:scale-110 transition">
                            ⌨️
                        </div>
                        <div className="font-black text-xs text-blue-950 dark:text-blue-200">Luyện Gõ Từ</div>
                        <div className="text-[10px] text-blue-700 dark:text-blue-300/80 font-semibold">Gõ Kana/Romaji</div>
                    </button>

                    <button
                        onClick={() => setActiveStudyMode('dictation')}
                        className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/50 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition text-left cursor-pointer space-y-1.5 group shadow-2xs"
                    >
                        <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-xs shadow-xs group-hover:scale-110 transition">
                            🎧
                        </div>
                        <div className="font-black text-xs text-purple-950 dark:text-purple-200">Nghe & Viết</div>
                        <div className="text-[10px] text-purple-700 dark:text-purple-300/80 font-semibold">Luyện thính xạ</div>
                    </button>

                    <button
                        onClick={() => setActiveStudyMode('related')}
                        className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/50 hover:bg-teal-100 dark:hover:bg-teal-900/60 transition text-left cursor-pointer space-y-1.5 group shadow-2xs"
                    >
                        <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black text-xs shadow-xs group-hover:scale-110 transition">
                            <Network size={16} />
                        </div>
                        <div className="font-black text-xs text-teal-950 dark:text-teal-200">Từ Liên Quan</div>
                        <div className="text-[10px] text-teal-700 dark:text-teal-300/80 font-semibold">Mindmap Hán Tự</div>
                    </button>
                </div>
            </div>

            {/* ── Multi-Select Lesson Filter Pills ── */}
            <div className="bg-white dark:bg-[#0f172a]/90 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.4)] space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                        <Filter size={18} className="text-rose-600 dark:text-rose-400" />
                        <h3 className="text-sm font-black text-slate-900 dark:text-white">
                            Chọn Bài Học Minna (Hỗ trợ chọn nhiều Bài cùng lúc)
                        </h3>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-bold">
                        <span className="text-slate-600 dark:text-slate-400">
                            {selectedLessons.length === 0 ? (
                                <span className="text-rose-600 dark:text-rose-400 font-black">
                                    Đang chọn Tất cả 50 Bài ({currentWords.length} từ)
                                </span>
                            ) : (
                                <span>
                                    Đang chọn <strong className="text-rose-600 dark:text-rose-400 font-black">{selectedLessons.length}</strong> Bài ({currentWords.length} từ vựng)
                                </span>
                            )}
                        </span>

                        {selectedLessons.length > 0 && (
                            <button
                                onClick={clearSelectedLessons}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 text-slate-600 dark:text-slate-300 transition text-[11px] font-bold cursor-pointer"
                            >
                                [Bỏ chọn tất cả]
                            </button>
                        )}
                    </div>
                </div>

                {/* Lesson Pills Grid */}
                <div className="max-h-48 overflow-y-auto pr-1 flex flex-wrap gap-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                    <button
                        onClick={selectAllLessons}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 shadow-sm ${
                            selectedLessons.length === 0
                                ? 'bg-rose-600 text-white border-2 border-rose-600 shadow-rose-200'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-slate-700 border border-slate-200/90 dark:border-slate-700'
                        }`}
                    >
                        <span>🇯🇵 Tất cả 50 Bài</span>
                        {selectedLessons.length === 0 && <Check size={14} />}
                    </button>

                    {availableLessons.map(lesson => {
                        const isSelected = selectedLessons.includes(lesson);
                        return (
                            <button
                                key={lesson}
                                onClick={() => toggleLesson(lesson)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                                    isSelected
                                        ? 'bg-rose-600 text-white border border-rose-600 shadow-sm'
                                        : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/90 dark:border-slate-700'
                                }`}
                            >
                                <span>{lesson}</span>
                                {isSelected && <Check size={14} />}
                            </button>
                        );
                    })}
                </div>

                {/* Search Bar & POS Filter */}
                <div className="pt-2 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between border-t border-slate-100 dark:border-slate-800">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Tìm kiếm theo Hiragana, Kanji, Romaji hoặc Tiếng Việt..."
                            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500"
                        />
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                        {POS_CATEGORIES.map(pos => (
                            <button
                                key={pos}
                                onClick={() => setSelectedPos(pos)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition whitespace-nowrap cursor-pointer ${
                                    selectedPos === pos
                                        ? 'bg-rose-600 text-white shadow-xs'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                                }`}
                            >
                                {pos}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Word Grid Display ── */}
            <div className="bg-white dark:bg-[#0f172a]/90 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.4)] space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <span>Danh Sách Từ Vựng Tiếng Nhật</span>
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-800/60">
                                {currentWords.length} từ
                            </span>
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                            {selectedLessons.length === 0
                                ? 'Hiển thị tất cả từ vựng Minna No Nihongo'
                                : `Hiển thị từ vựng của ${selectedLessons.length} bài đã chọn`}
                        </p>
                    </div>

                    <button
                        onClick={() => setActiveStudyMode('sequential3')}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                        <span>Bắt Đầu Học Lộ Trình 3 Bước</span>
                        <ChevronRight size={16} />
                    </button>
                </div>

                {currentWords.length === 0 ? (
                    <div className="py-12 text-center text-sm text-slate-400 space-y-2">
                        <p>Không tìm thấy từ vựng tiếng Nhật nào khớp với bộ lọc.</p>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="text-rose-600 font-bold underline cursor-pointer"
                            >
                                Xóa tìm kiếm
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                        {currentWords.map((w, idx) => (
                            <div
                                key={w.id || idx}
                                className="p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#111928]/70 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.3)] hover:shadow-md hover:border-rose-400 dark:hover:border-rose-500/50 transition space-y-2 flex flex-col justify-between"
                            >
                                <div className="space-y-1.5">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <h4 className="font-black text-xl text-slate-900 dark:text-white tracking-wide">
                                                {w.kanji || w.hiragana || w.en}
                                            </h4>
                                            {w.kanji && w.hiragana && (
                                                <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
                                                    {w.hiragana}
                                                </p>
                                            )}
                                        </div>
                                        
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSpeakJapanese(w.hiragana || w.kanji || w.en);
                                            }}
                                            className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300 hover:bg-rose-200 transition shrink-0 cursor-pointer"
                                            title="Nghe phát âm tiếng Nhật"
                                        >
                                            <Volume2 size={16} />
                                        </button>
                                    </div>

                                    {w.romaji && (
                                        <div className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                                            [{w.romaji}]
                                        </div>
                                    )}

                                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 pt-1">
                                        ➔ {w.vi}
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold border border-slate-200/60">
                                        {w.category || 'Từ vựng'}
                                    </span>
                                    <span className="truncate max-w-[120px] font-bold text-rose-600 dark:text-rose-400">
                                        {w.sub_group || (w.lesson ? `Bài ${w.lesson}` : 'Bài 01')}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default JapaneseMinnaMode;
