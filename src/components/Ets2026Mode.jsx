import React, { useState, useMemo } from 'react';
import {
    Award, Headphones, BookOpen, Layers, Sparkles, CheckCircle2,
    Gamepad2, Keyboard, Mic, Search, Volume2, ArrowLeft, Filter,
    Check, Zap, BookOpenCheck, Flame, ChevronRight
} from 'lucide-react';

import OptimalLearningMode from './OptimalLearningMode';
import FlashcardMode from './FlashcardMode';
import QuizMode from './QuizMode';
import MatchMode from './MatchMode';
import TypingMode from './TypingMode';
import DictationMode from './DictationMode';
import Sequential3StepMode from './Sequential3StepMode';
import Ets2026IpaMode from './Ets2026IpaMode';

export default function Ets2026Mode({ words = [], speak }) {
    const [skillTab, setSkillTab] = useState('lc'); // 'lc' | 'rc' | 'all'
    const [selectedLcPart, setSelectedLcPart] = useState('all');
    const [selectedRcPart, setSelectedRcPart] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeStudyMode, setActiveStudyMode] = useState(null); // null | 'optimal' | 'flashcards' | 'quiz' | 'match' | 'typing' | 'dictation'

    // Lọc toàn bộ từ ETS 2026
    const etsWords = useMemo(() => {
        return (words || []).filter(w =>
            w.master_group === 'Từ Vựng ETS 2026' ||
            (w.sub_group && w.sub_group.includes('ETS 2026'))
        );
    }, [words]);

    // Nhóm LC
    const lcWords = useMemo(() => {
        return etsWords.filter(w =>
            w.sub_group && (w.sub_group.toLowerCase().includes('lc') || w.sub_group.toLowerCase().includes('listening'))
        );
    }, [etsWords]);

    // Nhóm RC
    const rcWords = useMemo(() => {
        return etsWords.filter(w =>
            w.sub_group && (w.sub_group.toLowerCase().includes('rc') || w.sub_group.toLowerCase().includes('reading'))
        );
    }, [etsWords]);

    // Danh sách các Phần của LC sắp xếp natural sort (1, 2, ..., 10, 11)
    const lcSubGroups = useMemo(() => {
        const set = new Set();
        lcWords.forEach(w => w.sub_group && set.add(w.sub_group));
        return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    }, [lcWords]);

    // Danh sách các Phần của RC sắp xếp natural sort (1, 2, ..., 10, 11)
    const rcSubGroups = useMemo(() => {
        const set = new Set();
        rcWords.forEach(w => w.sub_group && set.add(w.sub_group));
        return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    }, [rcWords]);

    // Danh sách từ đang được chọn hiện tại
    const currentWords = useMemo(() => {
        let list = [];
        if (skillTab === 'lc') {
            list = selectedLcPart === 'all'
                ? lcWords
                : lcWords.filter(w => w.sub_group === selectedLcPart);
        } else if (skillTab === 'rc') {
            list = selectedRcPart === 'all'
                ? rcWords
                : rcWords.filter(w => w.sub_group === selectedRcPart);
        } else {
            list = etsWords;
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            list = list.filter(w =>
                (w.en && w.en.toLowerCase().includes(q)) ||
                (w.vi && w.vi.toLowerCase().includes(q))
            );
        }
        return list;
    }, [skillTab, selectedLcPart, selectedRcPart, lcWords, rcWords, etsWords, searchQuery]);

    const formatPartLabel = (subGroup) => {
        if (!subGroup) return '';
        const idx = subGroup.indexOf('-');
        return idx !== -1 ? subGroup.slice(idx + 1).trim() : subGroup;
    };

    // Nếu đang trong chế độ học cụ thể (Flashcard, Quiz, v.v.), hiển thị màn học
    if (activeStudyMode) {
        return (
            <div className="space-y-4 max-w-7xl mx-auto animate-fade-in">
                {/* Header quay lại */}
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
                    <button
                        onClick={() => setActiveStudyMode(null)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 font-bold text-xs hover:bg-gray-200 dark:hover:bg-slate-700 transition cursor-pointer"
                    >
                        <ArrowLeft size={16} />
                        <span>Quay lại danh sách từ vựng ETS 2026</span>
                    </button>

                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 uppercase tracking-wide">
                            {skillTab === 'lc' ? '800 Listening (LC)' : skillTab === 'rc' ? '800 Reading (RC)' : 'Toàn bộ ETS 2026'}
                        </span>
                        <span className="text-sm font-black text-gray-800 dark:text-slate-200">
                            ({currentWords.length} từ vựng)
                        </span>
                    </div>
                </div>

                {/* Render chế độ học */}
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 md:p-6 shadow-sm min-h-[500px]">
                    {activeStudyMode === 'optimal' && <OptimalLearningMode words={currentWords} speak={speak} />}
                    {activeStudyMode === 'sequential3' && <Sequential3StepMode words={currentWords} speak={speak} onExit={() => setActiveStudyMode(null)} />}
                    {activeStudyMode === 'flashcards' && <FlashcardMode words={currentWords} speak={speak} />}
                    {activeStudyMode === 'quiz' && <QuizMode words={currentWords} speak={speak} />}
                    {activeStudyMode === 'match' && <MatchMode words={currentWords} speak={speak} />}
                    {activeStudyMode === 'typing' && <TypingMode words={currentWords} speak={speak} />}
                    {activeStudyMode === 'dictation' && <DictationMode words={currentWords} speak={speak} />}
                    {activeStudyMode === 'ipa' && <Ets2026IpaMode words={currentWords} allWords={etsWords} speak={speak} onExit={() => setActiveStudyMode(null)} />}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
            {/* 1. Hero Banner ETS 2026 */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 md:p-8 text-white shadow-xl">
                <div className="absolute right-0 top-0 -mt-8 -mr-8 h-64 w-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-2 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black tracking-wide">
                            <Award size={14} className="text-amber-300" />
                            <span>OFFICIAL TOEIC ETS 2026 CURRICULUM</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                            Luyện Từ Vựng Trọng Tâm ETS 2026
                        </h1>
                        <p className="text-sm text-blue-100 font-medium leading-relaxed">
                            Trọn bộ 1.626 từ vựng cốt lõi trích xuất trực tiếp từ đề thi ETS 2026 mới nhất, chia làm 2 nhóm kỹ năng Nghe hiểu (800 LC) và Đọc hiểu (800 RC).
                        </p>
                    </div>

                    {/* Stat Badges */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-3 px-4 text-center">
                            <div className="text-2xl font-black">{lcWords.length || 800}</div>
                            <div className="text-[11px] text-blue-100 font-bold uppercase">Từ vựng LC</div>
                        </div>
                        <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-3 px-4 text-center">
                            <div className="text-2xl font-black">{rcWords.length || 826}</div>
                            <div className="text-[11px] text-blue-100 font-bold uppercase">Từ vựng RC</div>
                        </div>
                        <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-3 px-4 text-center">
                            <div className="text-2xl font-black">{etsWords.length || 1626}</div>
                            <div className="text-[11px] text-blue-100 font-bold uppercase">Tổng từ vựng</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Main Skill Selection Tabs (LC / RC / ALL) */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl w-fit border border-slate-200/90 dark:border-slate-700/50 shadow-2xs">
                    <button
                        onClick={() => { setSkillTab('lc'); setSearchQuery(''); }}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                            skillTab === 'lc'
                                ? 'bg-blue-600 text-white shadow-xs font-black'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <Headphones size={16} />
                        <span>800 Từ Vựng LC (Listening)</span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] bg-white/20 dark:bg-slate-700 font-black">
                            {lcSubGroups.length} Phần
                        </span>
                    </button>

                    <button
                        onClick={() => { setSkillTab('rc'); setSearchQuery(''); }}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                            skillTab === 'rc'
                                ? 'bg-purple-600 text-white shadow-xs font-black'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <BookOpen size={16} />
                        <span>800 Từ Vựng RC (Reading)</span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] bg-white/20 dark:bg-slate-700 font-black">
                            {rcSubGroups.length} Phần
                        </span>
                    </button>

                    <button
                        onClick={() => { setSkillTab('all'); setSearchQuery(''); }}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                            skillTab === 'all'
                                ? 'bg-indigo-600 text-white shadow-xs font-black'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <Sparkles size={16} />
                        <span>Tất cả ETS 2026</span>
                    </button>
                </div>

                {/* Search box */}
                <div className="relative w-full md:w-72">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Tìm từ vựng hoặc tiếng Việt..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50 hover:bg-white focus:bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-slate-200 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/30 shadow-2xs transition-all"
                    />
                </div>
            </div>

            {/* 3. Phần Selector pills (khi chọn LC hoặc RC) */}
            {skillTab === 'lc' && lcSubGroups.length > 0 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.04)]">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Chọn Phần học Listening (Mỗi phần ~40 từ vựng)
                        </span>
                        <button
                            onClick={() => setSelectedLcPart('all')}
                            className={`text-xs font-bold px-3 py-1 rounded-lg transition cursor-pointer border ${
                                selectedLcPart === 'all'
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs font-black'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border-slate-200/80 hover:bg-slate-200'
                            }`}
                        >
                            Tất cả LC ({lcWords.length} từ)
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {lcSubGroups.map((sub) => {
                            const isSelected = selectedLcPart === sub;
                            const count = lcWords.filter(w => w.sub_group === sub).length;
                            return (
                                <button
                                    key={sub}
                                    onClick={() => setSelectedLcPart(sub)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                                        isSelected
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-2xs scale-105 font-black'
                                            : 'bg-blue-50/80 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border-blue-200/70 dark:border-blue-800/40 hover:bg-blue-100'
                                    }`}
                                >
                                    <span>{formatPartLabel(sub)}</span>
                                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                                        isSelected ? 'bg-white/20 text-white' : 'bg-blue-200/60 dark:bg-blue-800/50 text-blue-900 dark:text-blue-200'
                                    }`}>
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {skillTab === 'rc' && rcSubGroups.length > 0 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.04)]">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Chọn Phần học Reading (Mỗi phần ~40 từ vựng)
                        </span>
                        <button
                            onClick={() => setSelectedRcPart('all')}
                            className={`text-xs font-bold px-3 py-1 rounded-lg transition cursor-pointer border ${
                                selectedRcPart === 'all'
                                    ? 'bg-purple-600 text-white border-purple-600 shadow-2xs font-black'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border-slate-200/80 hover:bg-slate-200'
                            }`}
                        >
                            Tất cả RC ({rcWords.length} từ)
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {rcSubGroups.map((sub) => {
                            const isSelected = selectedRcPart === sub;
                            const count = rcWords.filter(w => w.sub_group === sub).length;
                            return (
                                <button
                                    key={sub}
                                    onClick={() => setSelectedRcPart(sub)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                                        isSelected
                                            ? 'bg-purple-600 text-white border-purple-600 shadow-2xs scale-105 font-black'
                                            : 'bg-purple-50/80 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 border-purple-200/70 dark:border-purple-800/40 hover:bg-purple-100'
                                    }`}
                                >
                                    <span>{formatPartLabel(sub)}</span>
                                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                                        isSelected ? 'bg-white/20 text-white' : 'bg-purple-200/60 dark:border-purple-800/50 text-purple-900 dark:text-purple-200'
                                    }`}>
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 4. Action Bar Luyện Tập Nhanh */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-slate-200">
                            Chọn Chế Độ Luyện Tập
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                            Đang chọn: <span className="font-bold text-blue-600 dark:text-blue-400">
                                {skillTab === 'lc'
                                    ? (selectedLcPart === 'all' ? 'Toàn bộ 800 từ LC' : selectedLcPart)
                                    : skillTab === 'rc'
                                        ? (selectedRcPart === 'all' ? 'Toàn bộ 800 từ RC' : selectedRcPart)
                                        : 'Toàn bộ từ vựng ETS 2026'}
                            </span> ({currentWords.length} từ)
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                    <button
                        onClick={() => setActiveStudyMode('sequential3')}
                        disabled={currentWords.length === 0}
                        className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white font-bold text-xs hover:shadow-lg hover:scale-[1.02] transition disabled:opacity-50 cursor-pointer shadow-xs"
                    >
                        <Flame size={20} />
                        <span>Lộ Trình 3 Bước</span>
                    </button>

                    <button
                        onClick={() => setActiveStudyMode('ipa')}
                        disabled={currentWords.length === 0}
                        className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-xs hover:shadow-lg hover:scale-[1.02] transition disabled:opacity-50 cursor-pointer shadow-xs"
                    >
                        <Volume2 size={20} />
                        <span>Luyện Phát Âm IPA</span>
                    </button>

                    <button
                        onClick={() => setActiveStudyMode('optimal')}
                        disabled={currentWords.length === 0}
                        className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-xs hover:shadow-lg hover:scale-[1.02] transition disabled:opacity-50 cursor-pointer shadow-xs"
                    >
                        <Sparkles size={20} />
                        <span>Học Tối Ưu (5in1)</span>
                    </button>

                    <button
                        onClick={() => setActiveStudyMode('flashcards')}
                        disabled={currentWords.length === 0}
                        className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/40 font-bold text-xs hover:bg-blue-100/80 transition disabled:opacity-50 cursor-pointer shadow-2xs"
                    >
                        <Layers size={20} />
                        <span>Flashcard</span>
                    </button>

                    <button
                        onClick={() => setActiveStudyMode('quiz')}
                        disabled={currentWords.length === 0}
                        className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-900/20 text-purple-900 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/40 font-bold text-xs hover:bg-purple-100/80 transition disabled:opacity-50 cursor-pointer shadow-2xs"
                    >
                        <CheckCircle2 size={20} />
                        <span>Trắc Nghiệm</span>
                    </button>

                    <button
                        onClick={() => setActiveStudyMode('match')}
                        disabled={currentWords.length === 0}
                        className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl bg-pink-50 dark:bg-pink-900/20 text-pink-900 dark:text-pink-300 border border-pink-200/80 dark:border-pink-800/40 font-bold text-xs hover:bg-pink-100/80 transition disabled:opacity-50 cursor-pointer shadow-2xs"
                    >
                        <Gamepad2 size={20} />
                        <span>Nối Từ</span>
                    </button>

                    <button
                        onClick={() => setActiveStudyMode('typing')}
                        disabled={currentWords.length === 0}
                        className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/40 font-bold text-xs hover:bg-amber-100/80 transition disabled:opacity-50 cursor-pointer shadow-2xs"
                    >
                        <Keyboard size={20} />
                        <span>Gõ Từ Vựng</span>
                    </button>

                    <button
                        onClick={() => setActiveStudyMode('dictation')}
                        disabled={currentWords.length === 0}
                        className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-900 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/40 font-bold text-xs hover:bg-indigo-100/80 transition disabled:opacity-50 cursor-pointer shadow-2xs"
                    >
                        <Mic size={20} />
                        <span>Nghe Viết</span>
                    </button>
                </div>
            </div>

            {/* 5. Word List Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)]">
                <div className="px-6 py-4 border-b border-slate-200/90 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-900 dark:text-slate-200 flex items-center gap-2">
                        <BookOpenCheck size={18} className="text-blue-600 dark:text-blue-400" />
                        <span>Danh Sách Từ Vựng Đang Chọn</span>
                        <span className="text-xs text-slate-500 font-bold">({currentWords.length} từ)</span>
                    </h3>
                </div>

                {currentWords.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                        Không tìm thấy từ vựng nào phù hợp trong bộ lọc này.
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-[600px] overflow-y-auto">
                        {currentWords.map((w, index) => (
                            <div
                                key={w.id || index}
                                className="p-4 px-6 flex items-center justify-between gap-4 hover:bg-blue-50/30 dark:hover:bg-slate-800/40 transition"
                            >
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => speak && speak(w.en)}
                                        className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:scale-110 transition shrink-0 cursor-pointer border border-blue-100 dark:border-transparent shadow-2xs"
                                        title="Nghe phát âm"
                                    >
                                        <Volume2 size={16} />
                                    </button>

                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-bold text-sm text-slate-900 dark:text-white">
                                                {w.en}
                                            </span>
                                            {w.ipa && (
                                                <span className="text-xs font-mono text-slate-500 dark:text-slate-500">
                                                    {w.ipa}
                                                </span>
                                            )}
                                            {w.sub_group && (
                                                <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border border-purple-200/80 dark:border-purple-800/40">
                                                    {formatPartLabel(w.sub_group)}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 font-medium">
                                            {w.vi}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => speak && speak(w.en)}
                                        className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 transition cursor-pointer border border-slate-200/80 dark:border-transparent"
                                    >
                                        Nghe
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
