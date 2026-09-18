import React, { useState, useMemo } from 'react';
import {
    BookOpen, Award, Sparkles, CheckCircle2, Gamepad2, Keyboard,
    Mic, Search, Volume2, ArrowLeft, Filter, Flame, Check, Zap,
    BookOpenCheck, Layers, ChevronRight, BookmarkCheck, RotateCcw
} from 'lucide-react';

import OptimalLearningMode from './OptimalLearningMode';
import FlashcardMode from './FlashcardMode';
import QuizMode from './QuizMode';
import MatchMode from './MatchMode';
import TypingMode from './TypingMode';
import DictationMode from './DictationMode';
import Sequential3StepMode from './Sequential3StepMode';
import Ets2026IpaMode from './Ets2026IpaMode';

export default function Toeic500Mode({ words = [], speak }) {
    const [selectedStories, setSelectedStories] = useState([]); // [] means ALL stories, or Array of selected story titles e.g. ['Story 01...', 'Story 03...']
    const [selectedCategory, setSelectedCategory] = useState('all'); // 'all' | 'Danh từ (n)' | ...
    const [searchQuery, setSearchQuery] = useState('');
    const [activeStudyMode, setActiveStudyMode] = useState(null);

    // Lọc toàn bộ 500 từ vựng TOEIC Mất Gốc
    const toeic500Words = useMemo(() => {
        return (words || []).filter(w =>
            w.master_group === '500 Từ Vựng TOEIC Mất Gốc' ||
            (w.sub_group && w.sub_group.toLowerCase().includes('story'))
        );
    }, [words]);

    // Danh sách các từ loại có trong 500 từ
    const categoriesList = useMemo(() => {
        const set = new Set();
        toeic500Words.forEach(w => w.category && set.add(w.category));
        return Array.from(set).sort();
    }, [toeic500Words]);

    // Danh sách các Story (Story 01 -> Story 20)
    const storiesList = useMemo(() => {
        const set = new Set();
        toeic500Words.forEach(w => w.sub_group && set.add(w.sub_group));
        return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    }, [toeic500Words]);

    // Toggle multi-select story
    const handleToggleStory = (storyTitle) => {
        if (storyTitle === 'all') {
            setSelectedStories([]);
            return;
        }

        setSelectedStories(prev => {
            if (prev.includes(storyTitle)) {
                const next = prev.filter(s => s !== storyTitle);
                return next;
            } else {
                const next = [...prev, storyTitle];
                if (next.length === storiesList.length) return [];
                return next;
            }
        });
    };

    // Danh sách từ hiện tại theo Story (multi-select), Từ loại & Tìm kiếm
    const currentWords = useMemo(() => {
        let list = (selectedStories.length === 0)
            ? toeic500Words
            : toeic500Words.filter(w => selectedStories.includes(w.sub_group));

        if (selectedCategory !== 'all') {
            list = list.filter(w => w.category === selectedCategory);
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            list = list.filter(w =>
                (w.en && w.en.toLowerCase().includes(q)) ||
                (w.vi && w.vi.toLowerCase().includes(q)) ||
                (w.ipa && w.ipa.toLowerCase().includes(q))
            );
        }
        return list;
    }, [selectedStories, selectedCategory, toeic500Words, searchQuery]);

    // Format tên story gọn gàng
    const formatStoryTitle = (title) => {
        if (!title) return '';
        return title;
    };

    // Màn hình đang trong chế độ học cụ thể (Flashcard, Trắc nghiệm, v.v.)
    if (activeStudyMode) {
        return (
            <div className="space-y-4 max-w-7xl mx-auto animate-fade-in">
                {/* Header thanh quay lại */}
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
                    <button
                        onClick={() => setActiveStudyMode(null)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 font-bold text-xs hover:bg-gray-200 dark:hover:bg-slate-700 transition cursor-pointer"
                    >
                        <ArrowLeft size={16} /> Quay lại danh sách Story
                    </button>

                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-black text-xs">
                            {selectedStories.length === 0
                                ? 'Tất cả 20 Story 500 TOEIC'
                                : selectedStories.length === 1
                                    ? selectedStories[0]
                                    : `Đang chọn ${selectedStories.length} Story`}
                        </span>
                        <span className="text-xs text-gray-500 font-bold">
                            ({currentWords.length} từ vựng)
                        </span>
                    </div>
                </div>

                {/* Nội dung chế độ học */}
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 md:p-6 shadow-sm min-h-[500px]">
                    {activeStudyMode === 'optimal' && <OptimalLearningMode words={currentWords} speak={speak} />}
                    {activeStudyMode === 'sequential3' && <Sequential3StepMode words={currentWords} speak={speak} onExit={() => setActiveStudyMode(null)} />}
                    {activeStudyMode === 'flashcards' && <FlashcardMode words={currentWords} speak={speak} />}
                    {activeStudyMode === 'quiz' && <QuizMode words={currentWords} speak={speak} />}
                    {activeStudyMode === 'match' && <MatchMode words={currentWords} speak={speak} />}
                    {activeStudyMode === 'typing' && <TypingMode words={currentWords} speak={speak} />}
                    {activeStudyMode === 'dictation' && <DictationMode words={currentWords} speak={speak} />}
                    {activeStudyMode === 'ipa' && <Ets2026IpaMode words={currentWords} allWords={toeic500Words} speak={speak} onExit={() => setActiveStudyMode(null)} />}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
            {/* 1. Hero Banner 500 Từ Vựng TOEIC */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 md:p-8 text-white shadow-xl">
                <div className="absolute right-0 top-0 -mt-8 -mr-8 h-64 w-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-2 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black tracking-wide">
                            <BookmarkCheck size={14} className="text-amber-300" />
                            <span>BENZEN TOEIC 20 STORIES CURRICULUM</span>
                        </div>
                        <h1 className="text-2xl md:text-4xl font-black tracking-tight">
                            500+ Từ Vựng TOEIC Mất Gốc
                        </h1>
                        <p className="text-xs md:text-sm text-emerald-100 leading-relaxed opacity-95">
                            Chương trình 20 Câu Chuyện Ngữ Cảnh giúp học viên mất gốc tiếp thu 500+ từ vựng cốt lõi TOEIC nhanh gấp 3 lần qua liên tưởng phản xạ thực tế.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                        <div className="bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center flex-1 sm:flex-none">
                            <div className="text-2xl font-black text-white">{toeic500Words.length}</div>
                            <div className="text-[11px] font-bold text-emerald-100 uppercase tracking-wider">Từ vựng cốt lõi</div>
                        </div>
                        <div className="bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center flex-1 sm:flex-none">
                            <div className="text-2xl font-black text-amber-300">{storiesList.length}</div>
                            <div className="text-[11px] font-bold text-emerald-100 uppercase tracking-wider">Câu chuyện ngữ cảnh</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Thanh Nút Chọn Nhanh Chế Độ Học Chuyên Sâu */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <Zap className="text-amber-500 fill-amber-400" size={20} />
                        <span>Chọn Chế Độ Ôn Tập Chuyên Sâu ({currentWords.length} từ)</span>
                    </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-3">
                    <button
                        onClick={() => setActiveStudyMode('sequential3')}
                        className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white hover:shadow-lg hover:scale-[1.03] transition cursor-pointer flex flex-col items-center justify-center text-center space-y-1.5 col-span-2 sm:col-span-2 shadow-xs"
                    >
                        <Flame size={22} className="fill-white" />
                        <span className="text-xs font-black">Lộ trình 3 Bước 🔥</span>
                        <span className="text-[10px] opacity-95 font-semibold">Flashcard ➔ Nghe ➔ Gõ</span>
                    </button>

                    <button
                        onClick={() => setActiveStudyMode('optimal')}
                        className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200/80 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/50 hover:scale-[1.03] transition cursor-pointer flex flex-col items-center justify-center text-center space-y-1 shadow-2xs"
                    >
                        <Sparkles size={20} className="text-emerald-600 dark:text-emerald-400" />
                        <span className="text-xs font-bold">Học 5in1</span>
                    </button>

                    <button
                        onClick={() => setActiveStudyMode('flashcards')}
                        className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200/80 dark:border-blue-800 text-blue-900 dark:text-blue-300 hover:bg-blue-100/80 dark:hover:bg-blue-900/50 hover:scale-[1.03] transition cursor-pointer flex flex-col items-center justify-center text-center space-y-1 shadow-2xs"
                    >
                        <Layers size={20} className="text-blue-600 dark:text-blue-400" />
                        <span className="text-xs font-bold">Flashcard</span>
                    </button>

                    <button
                        onClick={() => setActiveStudyMode('quiz')}
                        className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-900/30 border border-purple-200/80 dark:border-purple-800 text-purple-900 dark:text-purple-300 hover:bg-purple-100/80 dark:hover:bg-purple-900/50 hover:scale-[1.03] transition cursor-pointer flex flex-col items-center justify-center text-center space-y-1 shadow-2xs"
                    >
                        <CheckCircle2 size={20} className="text-purple-600 dark:text-purple-400" />
                        <span className="text-xs font-bold">Trắc nghiệm</span>
                    </button>

                    <button
                        onClick={() => setActiveStudyMode('match')}
                        className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200/80 dark:border-indigo-800 text-indigo-900 dark:text-indigo-300 hover:bg-indigo-100/80 dark:hover:bg-indigo-900/50 hover:scale-[1.03] transition cursor-pointer flex flex-col items-center justify-center text-center space-y-1 shadow-2xs"
                    >
                        <Gamepad2 size={20} className="text-indigo-600 dark:text-indigo-400" />
                        <span className="text-xs font-bold">Nối từ</span>
                    </button>

                    <button
                        onClick={() => setActiveStudyMode('typing')}
                        className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-900/30 border border-teal-200/80 dark:border-teal-800 text-teal-900 dark:text-teal-300 hover:bg-teal-100/80 dark:hover:bg-teal-900/50 hover:scale-[1.03] transition cursor-pointer flex flex-col items-center justify-center text-center space-y-1 shadow-2xs"
                    >
                        <Keyboard size={20} className="text-teal-600 dark:text-teal-400" />
                        <span className="text-xs font-bold">Gõ từ</span>
                    </button>

                    <button
                        onClick={() => setActiveStudyMode('dictation')}
                        className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-900/30 border border-rose-200/80 dark:border-rose-800 text-rose-900 dark:text-rose-300 hover:bg-rose-100/80 dark:hover:bg-rose-900/50 hover:scale-[1.03] transition cursor-pointer flex flex-col items-center justify-center text-center space-y-1 shadow-2xs"
                    >
                        <Mic size={20} className="text-rose-600 dark:text-rose-400" />
                        <span className="text-xs font-bold">Nghe viết</span>
                    </button>
                </div>
            </div>

            {/* 3. Bộ Lọc Theo 20 Story Ngữ Cảnh (Multi-Select Supported) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Filter className="text-emerald-600" size={20} />
                        <div>
                            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <span>Danh Sách 20 Câu Chuyện Ngữ Cảnh</span>
                                <span className="text-xs font-normal text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                                    Cho phép chọn nhiều
                                </span>
                            </h3>
                            {selectedStories.length > 0 && (
                                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold mt-0.5 flex items-center gap-2">
                                    <span>Đang chọn {selectedStories.length} / {storiesList.length} Story ({currentWords.length} từ)</span>
                                    <button
                                        onClick={() => setSelectedStories([])}
                                        className="text-rose-500 hover:underline font-semibold text-[11px]"
                                    >
                                        [Bỏ chọn tất cả]
                                    </button>
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="relative w-full sm:w-72">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm từ vựng hoặc nghĩa..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 hover:bg-white focus:bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 focus:border-emerald-500 text-xs font-bold text-slate-900 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none transition shadow-2xs"
                        />
                    </div>
                </div>

                {/* Filter Pills 20 Stories - Multi-Select Enabled */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                    <button
                        onClick={() => handleToggleStory('all')}
                        className={`px-4 py-2 rounded-2xl text-xs font-black transition cursor-pointer border ${
                            selectedStories.length === 0
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/90 dark:border-slate-700 hover:border-emerald-400 shadow-2xs'
                        }`}
                    >
                        🌟 Tất cả 20 Story ({toeic500Words.length} từ)
                    </button>

                    {storiesList.map((story, idx) => {
                        const count = toeic500Words.filter(w => w.sub_group === story).length;
                        const isSelected = selectedStories.includes(story);
                        return (
                            <button
                                key={idx}
                                onClick={() => handleToggleStory(story)}
                                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition cursor-pointer border flex items-center gap-1.5 ${
                                    isSelected
                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm font-black'
                                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/90 dark:border-slate-700 hover:border-emerald-400 shadow-2xs'
                                }`}
                            >
                                {isSelected && <Check size={14} className="shrink-0 text-white" />}
                                <span>{story}</span>
                                <span className="opacity-80 font-normal">({count})</span>
                            </button>
                        );
                    })}
                </div>

                {/* Filter Pills Từ Loại (POS) */}
                {categoriesList.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1">Từ loại:</span>
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                                selectedCategory === 'all'
                                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-black'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 hover:bg-slate-200'
                            }`}
                        >
                            Tất cả từ loại
                        </button>
                        {categoriesList.map((cat, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                                    selectedCategory === cat
                                        ? 'bg-teal-600 text-white font-black shadow-2xs'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 hover:bg-slate-200'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* 4. Danh Sách Từ Vựng Trong Story Đã Chọn */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">
                            {selectedStories.length === 0
                                ? 'Tất Cả 500+ Từ Vựng TOEIC Mất Gốc'
                                : selectedStories.length === 1
                                    ? selectedStories[0]
                                    : `Tổng hợp ${selectedStories.length} Story Đã Chọn`}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Hiển thị {currentWords.length} từ vựng
                        </p>
                    </div>

                    <button
                        onClick={() => setActiveStudyMode('sequential3')}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                        <span>Bắt đầu học 3 Bước</span>
                        <ChevronRight size={16} />
                    </button>
                </div>

                {currentWords.length === 0 ? (
                    <div className="py-12 text-center text-sm text-slate-400 space-y-2">
                        <p>Không tìm thấy từ vựng nào khớp với bộ lọc hoặc từ khóa tìm kiếm.</p>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="text-emerald-600 font-bold underline"
                            >
                                Xóa tìm kiếm
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {currentWords.map((w, idx) => (
                            <div
                                key={w.id || idx}
                                className="p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-emerald-500/80 hover:shadow-md transition space-y-2 flex flex-col justify-between shadow-[0_2px_8px_-2px_rgba(15,23,42,0.04)]"
                            >
                                <div className="space-y-1">
                                    <div className="flex items-start justify-between gap-2">
                                        <h4 className="font-black text-base text-slate-900 dark:text-white">
                                            {w.en}
                                        </h4>
                                        <button
                                            onClick={() => speak && speak(w.en)}
                                            className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 transition shrink-0 cursor-pointer border border-emerald-200/70 dark:border-transparent shadow-2xs"
                                            title="Phát âm"
                                        >
                                            <Volume2 size={16} />
                                        </button>
                                    </div>

                                    {w.ipa && (
                                        <div className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-medium">
                                            {w.ipa}
                                        </div>
                                    )}

                                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">
                                        {w.vi}
                                    </div>

                                    {w.example_en && (
                                        <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800/80 text-[11px] space-y-0.5">
                                            <p className="text-emerald-800 dark:text-emerald-300 italic font-medium flex items-center gap-1">
                                                <span>“{w.example_en}”</span>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); speak && speak(w.example_en); }}
                                                    className="text-emerald-600 hover:text-emerald-700 p-0.5 rounded transition inline-block cursor-pointer"
                                                    title="Nghe câu ví dụ"
                                                >
                                                    <Volume2 size={12} />
                                                </button>
                                            </p>
                                            {w.example_vi && (
                                                <p className="text-slate-600 dark:text-slate-400 font-normal">
                                                    ➔ {w.example_vi}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-600">
                                        {w.category || 'Từ vựng'}
                                    </span>
                                    <span className="truncate max-w-[120px]" title={w.sub_group}>
                                        {w.sub_group?.split(':')[0] || 'Story'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
