import React, { useState, useEffect, useMemo } from 'react';
import { BookAIcon, CheckCircle2, Clock, Percent, Search, Sparkles, Layers, Volume2, Target, Calendar, BarChart2, PlayCircle, Settings, Flame } from 'lucide-react';
import { getProgress, getStudyPlan, updateStudyPlan } from '../utils/progressTracker';
import AICreateWordModal from './AICreateWordModal';
import { vocabularyApi } from '../api/vocabularyApi';
import { toast } from 'react-toastify';

export default function DashboardMode({ words, speak, setActiveTab, onRefreshData }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'learned', 'unlearned'
    const [learnedWordsList, setLearnedWordsList] = useState(new Set());
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    
    // Study Plan State
    const [studyPlan, setStudyPlan] = useState(() => getStudyPlan());
    const [isStudyPlanModalOpen, setIsStudyPlanModalOpen] = useState(false);

    // Distribution Stats
    const distribution = useMemo(() => {
        const isSpecialTopicGroup = (name) => {
            if (!name) return false;
            const specialKeywords = ['toeic', 'ets', 'minna', 'ielts', 'chuyên đề', 'chuyen de', 'bài học'];
            return specialKeywords.some(kw => name.toLowerCase().includes(kw));
        };

        const dist = { units: 0, daily: 0, chuyende: 0, master: 0 };
        words.forEach(w => {
            if (isSpecialTopicGroup(w.master_group)) dist.chuyende++;
            else if (w.master_group) dist.master++;
            else if (w.unit >= 13) dist.daily++;
            else if (w.unit >= 1) dist.units++;
        });
        return dist;
    }, [words]);

    // 7 Days Streak Visualizer
    const last7Days = useMemo(() => {
        const todayStr = new Date().toDateString();
        const lastActive = localStorage.getItem('lastActiveDate');
        const streakCount = parseInt(localStorage.getItem('streakCount') || '0', 10);
        
        let startStreakDate = null;
        if (lastActive && streakCount > 0) {
            startStreakDate = new Date(lastActive);
            startStreakDate.setDate(startStreakDate.getDate() - (streakCount - 1));
            startStreakDate.setHours(0,0,0,0);
        }
        const lastActiveDateObj = lastActive ? new Date(lastActive) : null;
        if (lastActiveDateObj) lastActiveDateObj.setHours(0,0,0,0);

        const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        return Array.from({length: 7}).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            const dStr = d.toDateString();
            d.setHours(0,0,0,0);
            
            let isActive = false;
            if (startStreakDate && lastActiveDateObj) {
                if (d.getTime() >= startStreakDate.getTime() && d.getTime() <= lastActiveDateObj.getTime()) {
                    isActive = true;
                }
            }
            
            return {
                dateStr: dStr,
                dayName: dayNames[d.getDay()],
                isActive,
                isToday: dStr === todayStr
            };
        });
    }, []);

    const handleAddWordsFromAI = async (newWords) => {
        try {
            const result = await vocabularyApi.addDataFile(newWords);
            if (result.success) {
                if (typeof onRefreshData === 'function') onRefreshData();
                else toast.success("Vui lòng reload trang để cập nhật từ mới!");
            }
        } catch (error) {
            console.error(error);
            toast.error("Lỗi khi thêm từ vào hệ thống.");
        }
    };

    useEffect(() => {
        const progress = getProgress();
        const learned = new Set();
        words.forEach(word => {
            let isLearned = false;
            if (progress.srs && progress.srs[word.id] && progress.srs[word.id].repetition >= 2) isLearned = true;
            if (!isLearned && progress.words && progress.words[word.id]) {
                const stat = progress.words[word.id];
                if (stat.total >= 3 && (stat.correct / stat.total) >= 0.7) isLearned = true;
            }
            if (isLearned) learned.add(word.id);
        });
        setLearnedWordsList(learned);
    }, [words]);

    const totalWords = words.length;
    const learnedWordsCount = learnedWordsList.size;
    const unlearnedWordsCount = totalWords - learnedWordsCount;
    const learnedPercentage = totalWords === 0 ? 0 : Math.round((learnedWordsCount / totalWords) * 100);

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 30;

    const filteredWords = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        return words.filter(word => {
            if (q) {
                const matchesSearch = (word.en && word.en.toLowerCase().includes(q)) || 
                                      (word.vi && word.vi.toLowerCase().includes(q));
                if (!matchesSearch) return false;
            }
            if (filterStatus === 'learned') return learnedWordsList.has(word.id);
            if (filterStatus === 'unlearned') return !learnedWordsList.has(word.id);
            return true;
        });
    }, [words, searchTerm, filterStatus, learnedWordsList]);

    // Reset page to 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus]);

    const totalPages = Math.ceil(filteredWords.length / pageSize) || 1;
    const paginatedWords = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredWords.slice(start, start + pageSize);
    }, [filteredWords, currentPage]);

    const handleSavePlan = (e) => {
        e.preventDefault();
        const targetGroupType = e.target.targetGroup.value;
        const targetCount = parseInt(e.target.targetCount.value, 10);
        
        const newPlan = { targetCount, targetGroup: { type: targetGroupType } };
        updateStudyPlan(newPlan);
        setStudyPlan(getStudyPlan());
        setIsStudyPlanModalOpen(false);
        toast.success("Đã cập nhật Kế hoạch Ôn tập!");
    };

    const startStudySession = () => {
        // Just navigate to Mixed Game. In the future, Mixed Game could read study plan settings.
        setActiveTab('mixedGame');
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Stats Cards (Modern Glass Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/60 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-xs">
                        <BookAIcon size={24} className="stroke-[2.5]" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Tổng số từ</p>
                        <p className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white leading-none mt-1 tracking-tight">{totalWords.toLocaleString()}</p>
                    </div>
                </div>

                <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-xs">
                        <CheckCircle2 size={24} className="stroke-[2.5]" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Đã thuộc</p>
                        <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 leading-none mt-1 tracking-tight">{learnedWordsCount.toLocaleString()}</p>
                    </div>
                </div>

                <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/60 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 shadow-xs">
                        <Clock size={24} className="stroke-[2.5]" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Chưa thuộc</p>
                        <p className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 leading-none mt-1 tracking-tight">{unlearnedWordsCount.toLocaleString()}</p>
                    </div>
                </div>

                <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-50 dark:bg-purple-950/60 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0 shadow-xs">
                        <Percent size={24} className="stroke-[2.5]" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Tỷ lệ nhớ</p>
                        <p className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 leading-none mt-1 tracking-tight">{learnedPercentage}%</p>
                    </div>
                </div>
            </div>

            {/* Daily Plan & Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Daily Study Plan */}
                <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-base sm:text-lg font-black flex items-center gap-2 text-slate-800 dark:text-white">
                            <Target className="text-rose-500" size={20} /> Mục tiêu Hôm nay
                        </h2>
                        <button 
                            onClick={() => setIsStudyPlanModalOpen(true)} 
                            className="p-2 text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                            title="Tùy chỉnh kế hoạch"
                        >
                            <Settings size={18} />
                        </button>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between text-xs sm:text-sm font-bold">
                            <span className="text-slate-600 dark:text-slate-400">Tiến độ ({studyPlan.completedCount} / {studyPlan.targetCount} từ)</span>
                            <span className="text-blue-600 dark:text-blue-400 font-extrabold">{Math.min(100, Math.round((studyPlan.completedCount / studyPlan.targetCount) * 100))}%</span>
                        </div>
                        <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                            <div className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (studyPlan.completedCount / studyPlan.targetCount) * 100)}%` }}></div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <Calendar size={13} /> Nhóm mục tiêu: <span className="font-semibold text-slate-700 dark:text-slate-300">{studyPlan.targetGroup.type === 'all' ? 'Tất cả từ vựng' : (studyPlan.targetGroup.type === 'unit' ? 'Khóa học' : 'Tùy chọn')}</span>
                        </div>

                        {/* Streak 7 Days */}
                        <div className="pt-2 pb-2">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                                    <Flame size={15} className="text-amber-500 fill-amber-500" /> Chuỗi 7 ngày qua
                                </span>
                            </div>
                            <div className="flex justify-between gap-1.5">
                                {last7Days.map((day, idx) => (
                                    <div key={idx} className="flex flex-col items-center gap-1.5">
                                        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center text-xs font-bold transition-all ${
                                            day.isActive 
                                                ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md shadow-orange-500/25 ring-2 ring-amber-400/30' 
                                                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500'
                                        } ${day.isToday && !day.isActive ? 'border-2 border-amber-500/60 ring-2 ring-amber-400/20' : ''}`}>
                                            {day.isActive ? <Flame size={15} className="fill-white" /> : <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></div>}
                                        </div>
                                        <span className={`text-[11px] font-bold ${day.isToday ? 'text-amber-500 font-extrabold' : 'text-slate-500 dark:text-slate-400'}`}>{day.dayName}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <button 
                            onClick={startStudySession} 
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-98 transition-all"
                        >
                            <PlayCircle size={18} /> Bắt đầu Ôn tập
                        </button>
                    </div>
                </div>

                {/* Vocabulary Distribution */}
                <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
                    <h2 className="text-base sm:text-lg font-black flex items-center gap-2 mb-6 text-slate-800 dark:text-white">
                        <BarChart2 className="text-emerald-500" size={20} /> Phân loại Từ vựng
                    </h2>
                    <div className="space-y-5">
                        {distribution.chuyende > 0 && (
                            <div>
                                <div className="flex justify-between text-xs sm:text-sm font-bold mb-1.5">
                                    <span className="text-slate-700 dark:text-slate-300">Chuyên đề (TOEIC, ETS, Minna...)</span>
                                    <span className="text-purple-600 dark:text-purple-400 font-extrabold">{distribution.chuyende.toLocaleString()}</span>
                                </div>
                                <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                                    <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all" style={{ width: `${totalWords ? (distribution.chuyende / totalWords) * 100 : 0}%` }}></div>
                                </div>
                            </div>
                        )}
                        {distribution.units > 0 && (
                            <div>
                                <div className="flex justify-between text-xs sm:text-sm font-bold mb-1.5">
                                    <span className="text-slate-700 dark:text-slate-300">Khóa học (Unit)</span>
                                    <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{distribution.units.toLocaleString()}</span>
                                </div>
                                <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                                    <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${totalWords ? (distribution.units / totalWords) * 100 : 0}%` }}></div>
                                </div>
                            </div>
                        )}
                        <div>
                            <div className="flex justify-between text-xs sm:text-sm font-bold mb-1.5">
                                <span className="text-slate-700 dark:text-slate-300">Chủ đề Hàng ngày</span>
                                <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{distribution.daily.toLocaleString()}</span>
                            </div>
                            <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                                <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${totalWords ? (distribution.daily / totalWords) * 100 : 0}%` }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs sm:text-sm font-bold mb-1.5">
                                <span className="text-slate-700 dark:text-slate-300">Nhóm Mở rộng (Master)</span>
                                <span className="text-amber-600 dark:text-amber-400 font-extrabold">{distribution.master.toLocaleString()}</span>
                            </div>
                            <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                                <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${totalWords ? (distribution.master / totalWords) * 100 : 0}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex w-full md:w-auto gap-3">
                    <div className="relative flex-1 md:w-72">
                        <Search className="absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" size={17} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm từ vựng (Anh / Việt)..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:text-white transition-all"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:text-white cursor-pointer transition-all"
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                    >
                        <option value="all">Tất cả</option>
                        <option value="learned">Đã thuộc</option>
                        <option value="unlearned">Chưa thuộc</option>
                    </select>
                </div>

                <div className="flex w-full md:w-auto gap-3">
                    <button 
                        onClick={() => setIsAiModalOpen(true)}
                        className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
                    >
                        <Sparkles size={16} /> Thêm từ với AI
                    </button>
                    <button 
                        onClick={() => setActiveTab('manage')}
                        className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
                    >
                        <Layers size={16} /> Quản lý từ vựng
                    </button>
                </div>
            </div>

            {/* Table (Glass Container) */}
            <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800">
                                <th className="px-6 py-4 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Từ vựng</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Nghĩa</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Loại từ</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center">Thuộc</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                            {filteredWords.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-400 dark:text-slate-500">
                                            <BookAIcon size={48} className="mb-4 opacity-20" />
                                            <p>Không có từ vựng nào</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedWords.map((word) => {
                                    const isLearned = learnedWordsList.has(word.id);
                                    return (
                                        <tr key={word.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <button 
                                                        onClick={() => speak(word.en)}
                                                        className="p-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-100 dark:hover:bg-blue-900/50 shrink-0"
                                                    >
                                                        <Volume2 size={16} />
                                                    </button>
                                                    <div>
                                                        <div className="font-bold text-gray-800 dark:text-gray-100 text-sm md:text-base">{word.en}</div>
                                                        <div className="text-xs text-gray-400 dark:text-slate-500 italic">{word.ipa}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400 font-medium">
                                                {word.vi}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1.5">
                                                    <span className="text-[11px] bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-2 py-0.5 rounded-md text-gray-600 dark:text-slate-400">{word.category}</span>
                                                    {word.unit && word.unit <= 12 && !word.master_group && <span className="text-[11px] bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md font-bold">Unit {word.unit}</span>}
                                                    {word.unit && word.unit > 12 && !word.master_group && <span className="text-[11px] bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/50 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md font-bold">Chủ đề {word.unit - 12}</span>}
                                                    {word.master_group && <span className="text-[11px] bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-md font-bold">{word.master_group}</span>}
                                                    {word.sub_group && <span className="text-[11px] bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/50 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-md font-bold">{word.sub_group}</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full border-2 ${isLearned ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 dark:border-slate-600'}`}>
                                                    {isLearned && <CheckCircle2 size={14} className="stroke-[3]" />}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {filteredWords.length > pageSize && (
                    <div className="px-6 py-3.5 border-t border-gray-150 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 dark:text-slate-400 bg-gray-50/50 dark:bg-slate-800/30">
                        <div>
                            Hiển thị <span className="font-bold text-gray-700 dark:text-white">{(currentPage - 1) * pageSize + 1} - {Math.min(filteredWords.length, currentPage * pageSize)}</span> trong tổng số <span className="font-bold text-gray-700 dark:text-white">{filteredWords.length.toLocaleString()}</span> từ
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed font-semibold transition-colors"
                            >
                                Trang trước
                            </button>
                            <span className="font-bold px-2 text-gray-700 dark:text-white">
                                {currentPage} / {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed font-semibold transition-colors"
                            >
                                Trang sau
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <AICreateWordModal 
                isOpen={isAiModalOpen} 
                onClose={() => setIsAiModalOpen(false)} 
                onAddWords={handleAddWordsFromAI}
            />

            {/* Study Plan Settings Modal */}
            {isStudyPlanModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-100 dark:border-slate-800">
                        <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800 dark:text-gray-100">
                                <Settings className="text-blue-500" /> Thiết lập Kế hoạch
                            </h2>
                            <button onClick={() => setIsStudyPlanModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">
                                <CheckCircle2 size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSavePlan} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Số lượng từ vựng / Ngày</label>
                                <input 
                                    name="targetCount"
                                    type="number" 
                                    defaultValue={studyPlan.targetCount}
                                    min="1"
                                    max="500"
                                    required
                                    className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Nhóm từ vựng ưu tiên</label>
                                <select 
                                    name="targetGroup"
                                    defaultValue={studyPlan.targetGroup.type}
                                    className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                                >
                                    <option value="all">Tất cả từ vựng</option>
                                    <option value="unit">Nhóm Khóa học (Unit)</option>
                                    <option value="daily">Nhóm Hàng ngày</option>
                                    <option value="master">Nhóm Tổng (Master)</option>
                                </select>
                            </div>
                            <div className="pt-4">
                                <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl transition shadow-md hover:shadow-blue-200 dark:hover:shadow-none">
                                    Lưu Thiết lập
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
