import React, { useState, useEffect, useMemo } from 'react';
import { 
    BookAIcon, 
    CheckCircle2, 
    Clock, 
    Percent, 
    Search, 
    Sparkles, 
    Layers, 
    Volume2, 
    Target, 
    Calendar, 
    BarChart2, 
    PlayCircle, 
    Settings, 
    Flame,
    Trophy,
    GraduationCap,
    Globe,
    ArrowRight,
    TrendingUp,
    Check,
    FolderOpen,
    Filter
} from 'lucide-react';
import { getProgress, getStudyPlan, updateStudyPlan } from '../utils/progressTracker';
import AICreateWordModal from './AICreateWordModal';
import { vocabularyApi } from '../api/vocabularyApi';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useVisibility, getVocabCategory } from '../context/VisibilityContext';
import { audioManager } from '../utils/audioManager';

const KNOWN_GROUPS_META = {
    toeic600: {
        key: 'toeic600',
        title: '600 Từ Vựng TOEIC Căn Bản',
        shortTitle: '600 Từ TOEIC',
        desc: '50 chủ đề từ vựng cốt lõi thường gặp nhất trong đề thi TOEIC',
        tab: 'toeic600',
        color: 'amber',
        icon: 'trophy',
    },
    ets2026: {
        key: 'ets2026',
        title: 'Từ Vựng ETS 2026',
        shortTitle: 'ETS 2026',
        desc: 'Trọn bộ từ vựng đề thi mới nhất ETS 2026 (800 LC + 800 RC)',
        tab: 'ets2026',
        color: 'cyan',
        icon: 'sparkles',
    },
    toeic500: {
        key: 'toeic500',
        title: '500 Từ TOEIC Mất Gốc',
        shortTitle: '500 Từ Mất Gốc',
        desc: 'Bộ 20 câu chuyện ngữ cảnh trực quan lấy lại căn bản cấp tốc',
        tab: 'toeic500',
        color: 'emerald',
        icon: 'flame',
    },
    japaneseMinna: {
        key: 'japaneseMinna',
        title: 'Tiếng Nhật Minna No Nihongo',
        shortTitle: 'Tiếng Nhật Minna',
        desc: 'Giáo trình Minna No Nihongo sơ cấp 50 bài chuẩn quốc tế',
        tab: 'japaneseMinna',
        color: 'rose',
        icon: 'globe',
    }
};

const getWordGroupKey = (w) => {
    if (!w) return null;
    const mg = (w.master_group || '').toLowerCase();
    if (mg.includes('600')) return 'toeic600';
    if (mg.includes('ets')) return 'ets2026';
    if (mg.includes('500') || mg.includes('mất gốc') || mg.includes('mat goc')) return 'toeic500';
    if (mg.includes('minna') || mg.includes('tiếng nhật') || mg.includes('nhật') || w.hiragana) return 'japaneseMinna';
    return null;
};

const getGroupIcon = (iconName, size = 16) => {
    switch (iconName) {
        case 'trophy': return <Trophy size={size} className="text-amber-500" />;
        case 'flame': return <Flame size={size} className="text-orange-500 fill-orange-500" />;
        case 'sparkles': return <Sparkles size={size} className="text-cyan-500" />;
        case 'globe': return <Globe size={size} className="text-rose-500" />;
        default: return <Target size={size} className="text-indigo-500" />;
    }
};

export default function DashboardMode({ words, speak, setActiveTab, onRefreshData }) {
    const { isAdmin } = useAuth();
    const { isWordCountVisible, isWordCountHidden, shouldAdminBypass, isTopicVisible, isVocabCategoryVisible, isVocabCategoryHidden } = useVisibility();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'learned', 'unlearned'
    const [selectedGroup, setSelectedGroup] = useState('all'); // 'all', 'toeic600', 'toeic500', etc.
    const [learnedWordsList, setLearnedWordsList] = useState(new Set());
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    
    // Filter accessible words for current learner
    const accessibleWords = useMemo(() => {
        return words.filter(w => {
            if (w.master_group && !isTopicVisible(w.master_group)) return false;
            const cat = getVocabCategory(w);
            if (cat === 'chuyende' && !isVocabCategoryVisible('chuyende')) return false;
            if (cat === 'daily' && !isVocabCategoryVisible('daily')) return false;
            if (cat === 'master' && !isVocabCategoryVisible('master')) return false;
            return true;
        });
    }, [words, isTopicVisible, isVocabCategoryVisible]);

    // Study Plan State
    const [studyPlan, setStudyPlan] = useState(() => getStudyPlan());
    const [isStudyPlanModalOpen, setIsStudyPlanModalOpen] = useState(false);

    // Distribution Stats
    const distribution = useMemo(() => {
        const dist = { units: 0, daily: 0, chuyende: 0, master: 0 };
        words.forEach(w => {
            const cat = getVocabCategory(w);
            if (cat === 'chuyende') dist.chuyende++;
            else if (cat === 'master') dist.master++;
            else if (cat === 'daily') dist.daily++;
            else if (cat === 'unit') dist.units++;
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
        accessibleWords.forEach(word => {
            let isLearned = false;
            if (progress.srs && progress.srs[word.id] && progress.srs[word.id].repetition >= 2) isLearned = true;
            if (!isLearned && progress.words && progress.words[word.id]) {
                const stat = progress.words[word.id];
                if (stat.total >= 3 && (stat.correct / stat.total) >= 0.7) isLearned = true;
            }
            if (isLearned) learned.add(word.id);
        });
        setLearnedWordsList(learned);
    }, [accessibleWords]);

    // Lọc riêng danh sách từ vựng thuộc 4 Chuyên Đề Trọng Điểm (loại bỏ toàn bộ các nhóm con nhỏ lẻ)
    const chuyendeWords = useMemo(() => {
        return accessibleWords.filter(w => getWordGroupKey(w) !== null);
    }, [accessibleWords]);

    // Summarize words and progress grouped ONLY by the primary Chuyên Đề
    const groupsSummary = useMemo(() => {
        const map = new Map();

        chuyendeWords.forEach(w => {
            const gKey = getWordGroupKey(w);
            if (!gKey || !KNOWN_GROUPS_META[gKey]) return;
            if (!map.has(gKey)) {
                map.set(gKey, { words: [], learnedCount: 0 });
            }
            const entry = map.get(gKey);
            entry.words.push(w);
            if (learnedWordsList.has(w.id)) {
                entry.learnedCount++;
            }
        });

        const list = [];
        const order = ['toeic600', 'ets2026', 'toeic500', 'japaneseMinna'];

        order.forEach(key => {
            const meta = KNOWN_GROUPS_META[key];
            if (!meta) return;
            const data = map.get(key) || { words: [], learnedCount: 0 };
            const total = data.words.length;
            if (total === 0) return;
            const learned = data.learnedCount;
            const unlearned = total - learned;
            const percent = total > 0 ? Math.round((learned / total) * 100) : 0;

            list.push({
                ...meta,
                totalWords: total,
                learnedWords: learned,
                unlearnedWords: unlearned,
                percentage: percent,
                words: data.words
            });
        });

        return list;
    }, [chuyendeWords, learnedWordsList]);

    // Current active statistics based on selectedGroup
    const currentStats = useMemo(() => {
        if (selectedGroup === 'all') {
            const total = chuyendeWords.length;
            const learned = chuyendeWords.filter(w => learnedWordsList.has(w.id)).length;
            const unlearned = total - learned;
            const percent = total === 0 ? 0 : Math.round((learned / total) * 100);
            return {
                key: 'all',
                title: 'Tất Cả Chuyên Đề',
                shortTitle: '4 Chuyên Đề',
                desc: 'Tổng hợp 4 bộ chuyên đề trọng điểm (TOEIC 600, ETS 2026, TOEIC 500, Tiếng Nhật Minna)',
                totalWords: total,
                learnedWords: learned,
                unlearnedWords: unlearned,
                percentage: percent,
                color: 'blue'
            };
        }
        const found = groupsSummary.find(g => g.key === selectedGroup);
        if (found) return found;
        return {
            key: selectedGroup,
            title: 'Chuyên Đề',
            shortTitle: 'Đã Chọn',
            desc: '',
            totalWords: 0,
            learnedWords: 0,
            unlearnedWords: 0,
            percentage: 0,
            color: 'blue'
        };
    }, [selectedGroup, chuyendeWords, learnedWordsList, groupsSummary]);

    const totalWords = chuyendeWords.length;
    const learnedWordsCount = chuyendeWords.filter(w => learnedWordsList.has(w.id)).length;
    const unlearnedWordsCount = totalWords - learnedWordsCount;
    const learnedPercentage = totalWords === 0 ? 0 : Math.round((learnedWordsCount / totalWords) * 100);

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 30;

    const filteredWords = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        return chuyendeWords.filter(word => {
            if (selectedGroup !== 'all') {
                const gKey = getWordGroupKey(word);
                if (gKey !== selectedGroup) return false;
            }
            if (q) {
                const matchesSearch = (word.en && word.en.toLowerCase().includes(q)) || 
                                      (word.vi && word.vi.toLowerCase().includes(q));
                if (!matchesSearch) return false;
            }
            if (filterStatus === 'learned') return learnedWordsList.has(word.id);
            if (filterStatus === 'unlearned') return !learnedWordsList.has(word.id);
            return true;
        });
    }, [chuyendeWords, searchTerm, filterStatus, selectedGroup, learnedWordsList]);

    // Reset page to 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus, selectedGroup]);

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
            {/* 1. Header & Group Switcher Bar (Chuyên Đề Trọng Điểm) */}
            <div className="bg-white dark:bg-[#0f172a]/90 backdrop-blur-xl p-5 sm:p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.4)] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-100/80 dark:border-blue-900/60 shadow-2xs">
                            <Target size={22} className="stroke-[2.5]" />
                        </div>
                        <div>
                            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <span>Thống Kê Tiến Độ 4 Chuyên Đề Trọng Điểm</span>
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Theo dõi số lượng đã thuộc, chưa thuộc và tỷ lệ nhớ riêng biệt của từng chuyên đề.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Đang xem:</span>
                        <span className="px-3 py-1 text-xs font-black rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 shadow-xs">
                            {currentStats.title} ({currentStats.totalWords.toLocaleString()} từ)
                        </span>
                    </div>
                </div>

                {/* Scrollable Group Filter Pills Bar */}
                <div className="flex gap-2 overflow-x-auto pb-1.5 pt-1 custom-scrollbar">
                    {/* Option: All Chuyên Đề */}
                    <button
                        onClick={() => {
                            audioManager.playClick();
                            setSelectedGroup('all');
                            setCurrentPage(1);
                        }}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                            selectedGroup === 'all'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 scale-[1.02]'
                                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700/60'
                        }`}
                    >
                        <Layers size={15} />
                        <span>Tất cả chuyên đề</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            selectedGroup === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                        }`}>
                            {chuyendeWords.length.toLocaleString()}
                        </span>
                    </button>

                    {/* Individual Chuyên Đề Pills */}
                    {groupsSummary.map((group) => {
                        const isSelected = selectedGroup === group.key;
                        return (
                            <button
                                key={group.key}
                                onClick={() => {
                                    audioManager.playClick();
                                    setSelectedGroup(group.key);
                                    setCurrentPage(1);
                                }}
                                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                                    isSelected
                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 scale-[1.02]'
                                        : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700/60'
                                }`}
                            >
                                {getGroupIcon(group.icon, 15)}
                                <span>{group.shortTitle}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                                }`}>
                                    {group.totalWords.toLocaleString()}
                                </span>
                                {group.percentage > 0 && (
                                    <span className={`text-[10px] font-bold ${isSelected ? 'text-emerald-300' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                        ({group.percentage}%)
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 2. Stats Cards (4 Hero KPI Cards) - Dynamic to selectedGroup */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* Card 1: Tổng số từ */}
                <div className="bg-white dark:bg-[#0f172a]/90 backdrop-blur-xl p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_25px_-4px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 transition-all flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tổng số từ</p>
                            {shouldAdminBypass && isWordCountHidden() && (
                                <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">Đã ẩn</span>
                            )}
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-none tracking-tight">
                            {isWordCountVisible() ? currentStats.totalWords.toLocaleString() : '---'}
                        </p>
                        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                            {selectedGroup === 'all' ? 'Tổng 4 chuyên đề trọng điểm' : currentStats.shortTitle}
                        </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/60 rounded-2xl flex items-center justify-center text-blue-700 dark:text-blue-300 shrink-0 border border-blue-100/80 dark:border-blue-900/60 shadow-2xs">
                        <BookAIcon size={24} className="stroke-[2.5]" />
                    </div>
                </div>

                {/* Card 2: Đã thuộc */}
                <div className="bg-white dark:bg-[#0f172a]/90 backdrop-blur-xl p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_25px_-4px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 transition-all flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Đã thuộc</p>
                        <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 leading-none tracking-tight">
                            {currentStats.learnedWords.toLocaleString()}
                        </p>
                        <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <Check size={12} />
                            <span>{currentStats.percentage}% mục tiêu chuyên đề</span>
                        </p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl flex items-center justify-center text-emerald-700 dark:text-emerald-300 shrink-0 border border-emerald-100/80 dark:border-emerald-900/60 shadow-2xs">
                        <CheckCircle2 size={24} className="stroke-[2.5]" />
                    </div>
                </div>

                {/* Card 3: Chưa thuộc */}
                <div className="bg-white dark:bg-[#0f172a]/90 backdrop-blur-xl p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_25px_-4px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 transition-all flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Chưa thuộc</p>
                        <p className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 leading-none tracking-tight">
                            {currentStats.unlearnedWords.toLocaleString()}
                        </p>
                        <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
                            Cần luyện tập & lặp lại
                        </p>
                    </div>
                    <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/60 rounded-2xl flex items-center justify-center text-amber-800 dark:text-amber-300 shrink-0 border border-amber-100/80 dark:border-amber-900/60 shadow-2xs">
                        <Clock size={24} className="stroke-[2.5]" />
                    </div>
                </div>

                {/* Card 4: Tỷ lệ nhớ */}
                <div className="bg-white dark:bg-[#0f172a]/90 backdrop-blur-xl p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_25px_-4px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 transition-all flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tỷ lệ nhớ</p>
                        <p className="text-2xl sm:text-3xl font-black text-purple-700 dark:text-purple-400 leading-none tracking-tight">
                            {currentStats.percentage}%
                        </p>
                        <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                            <div 
                                className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full transition-all duration-500"
                                style={{ width: `${currentStats.percentage}%` }}
                            />
                        </div>
                    </div>
                    <div className="w-12 h-12 bg-purple-50 dark:bg-purple-950/60 rounded-2xl flex items-center justify-center text-purple-700 dark:text-purple-300 shrink-0 border border-purple-100/80 dark:border-purple-900/60 shadow-2xs">
                        <Percent size={24} className="stroke-[2.5]" />
                    </div>
                </div>
            </div>

            {/* 3. Bento Grid: Phân Tích & Tiến Độ Chi Tiết Từng Chuyên Đề */}
            <div className="bg-white dark:bg-[#0f172a]/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.4)] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <Target className="text-blue-600" size={20} />
                        <span>Tiến Độ Từng Chuyên Đề Trọng Điểm</span>
                    </h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                        {groupsSummary.length} chuyên đề trọng điểm
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
                    {groupsSummary.map((group) => {
                        const isSelected = selectedGroup === group.key;
                        return (
                            <div
                                key={group.key}
                                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                                    isSelected
                                        ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700 ring-2 ring-blue-500/20 shadow-md'
                                        : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
                                }`}
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2.5">
                                            <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-xs text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60">
                                                {getGroupIcon(group.icon, 18)}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-sm text-slate-900 dark:text-white leading-tight">
                                                    {group.title}
                                                </h4>
                                                <span className="text-[11px] text-slate-400 font-medium">
                                                    {group.totalWords.toLocaleString()} từ vựng
                                                </span>
                                            </div>
                                        </div>
                                        <span className="text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-lg border border-blue-200/60 dark:border-blue-800/60">
                                            {group.percentage}%
                                        </span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mt-3.5 space-y-1.5">
                                        <div className="flex justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                            <span>Đã thuộc: <strong className="text-emerald-600 dark:text-emerald-400">{group.learnedWords}</strong></span>
                                            <span>Chưa thuộc: <strong className="text-amber-600 dark:text-amber-400">{group.unlearnedWords}</strong></span>
                                        </div>
                                        <div className="h-2 bg-slate-200/80 dark:bg-slate-700/80 rounded-full overflow-hidden p-0.5">
                                            <div
                                                className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                                                style={{ width: `${group.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                                    <button
                                        onClick={() => {
                                            audioManager.playClick();
                                            setSelectedGroup(group.key);
                                            setCurrentPage(1);
                                        }}
                                        className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                                            isSelected
                                                ? 'bg-blue-600 text-white shadow-xs'
                                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700'
                                        }`}
                                    >
                                        {isSelected ? 'Đang chọn xem' : 'Lọc chuyên đề'}
                                    </button>

                                    <button
                                        onClick={() => {
                                            audioManager.playClick();
                                            setActiveTab(group.tab);
                                        }}
                                        className="py-1.5 px-3 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-1 transition-all cursor-pointer"
                                        title={`Chuyển đến màn hình học ${group.title}`}
                                    >
                                        <span>Vào học</span>
                                        <ArrowRight size={13} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Daily Plan & Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Daily Study Plan */}
                <div className="bg-white dark:bg-[#0f172a]/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.4)] space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-base sm:text-lg font-black flex items-center gap-2 text-slate-900 dark:text-white">
                            <Target className="text-rose-500" size={20} /> Mục tiêu Hôm nay
                        </h2>
                        <button 
                            onClick={() => setIsStudyPlanModalOpen(true)} 
                            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                            title="Tùy chỉnh kế hoạch"
                        >
                            <Settings size={18} />
                        </button>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between text-xs sm:text-sm font-bold">
                            <span className="text-slate-700 dark:text-slate-300">Tiến độ ({studyPlan.completedCount} / {studyPlan.targetCount} từ)</span>
                            <span className="text-blue-600 dark:text-blue-400 font-extrabold">{Math.min(100, Math.round((studyPlan.completedCount / studyPlan.targetCount) * 100))}%</span>
                        </div>
                        <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-transparent">
                            <div className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (studyPlan.completedCount / studyPlan.targetCount) * 100)}%` }}></div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                            <Calendar size={13} /> Nhóm mục tiêu: <span className="font-bold text-slate-800 dark:text-slate-300">{studyPlan.targetGroup.type === 'all' ? 'Tất cả từ vựng' : (studyPlan.targetGroup.type === 'unit' ? 'Khóa học' : 'Tùy chọn')}</span>
                        </div>

                        {/* Streak 7 Days */}
                        <div className="pt-2 pb-2">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                    <Flame size={15} className="text-amber-500 fill-amber-500" /> Chuỗi 7 ngày qua
                                </span>
                            </div>
                            <div className="flex justify-between gap-1.5">
                                {last7Days.map((day, idx) => (
                                    <div key={idx} className="flex flex-col items-center gap-1.5">
                                        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center text-xs font-bold transition-all ${
                                            day.isActive 
                                                ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md shadow-orange-500/25 ring-2 ring-amber-400/30' 
                                                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60'
                                        } ${day.isToday && !day.isActive ? 'border-2 border-amber-500/60 ring-2 ring-amber-400/20' : ''}`}>
                                            {day.isActive ? <Flame size={15} className="fill-white" /> : <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></div>}
                                        </div>
                                        <span className={`text-[11px] font-bold ${day.isToday ? 'text-amber-600 font-extrabold' : 'text-slate-600 dark:text-slate-400'}`}>{day.dayName}</span>
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

                {/* Vocabulary Distribution - Cơ Cấu Chuyên Đề Trọng Điểm */}
                <div className="bg-white dark:bg-[#0f172a]/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.4)]">
                    <h2 className="text-base sm:text-lg font-black flex items-center gap-2 mb-6 text-slate-900 dark:text-white">
                        <BarChart2 className="text-emerald-600" size={20} /> Cơ Cấu 4 Chuyên Đề Trọng Điểm
                    </h2>
                    <div className="space-y-4">
                        {groupsSummary.map((group) => {
                            const pct = chuyendeWords.length > 0 ? Math.round((group.totalWords / chuyendeWords.length) * 100) : 0;
                            return (
                                <div key={group.key}>
                                    <div className="flex justify-between text-xs sm:text-sm font-bold mb-1.5">
                                        <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                            {getGroupIcon(group.icon, 14)}
                                            <span>{group.title}</span>
                                        </span>
                                        <span className="text-slate-800 dark:text-slate-200 font-extrabold">
                                            {isWordCountVisible() ? group.totalWords.toLocaleString() : '---'} từ ({pct}%)
                                        </span>
                                    </div>
                                    <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-transparent">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="bg-white dark:bg-[#0f172a]/90 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.4)] flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex w-full md:w-auto gap-3">
                    <div className="relative flex-1 md:w-72">
                        <Search className="absolute left-3.5 top-3 text-slate-500 dark:text-slate-400" size={17} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm từ vựng (Anh / Việt)..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-white focus:bg-white dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all shadow-2xs"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="bg-slate-50 hover:bg-white dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 cursor-pointer transition-all shadow-2xs max-w-[180px] sm:max-w-[220px] truncate"
                        value={selectedGroup}
                        onChange={e => {
                            setSelectedGroup(e.target.value);
                            setCurrentPage(1);
                        }}
                        title="Lọc theo chuyên đề"
                    >
                        <option value="all">Tất cả chuyên đề ({chuyendeWords.length.toLocaleString()})</option>
                        {groupsSummary.map(g => (
                            <option key={g.key} value={g.key}>
                                {g.shortTitle} ({g.totalWords.toLocaleString()})
                            </option>
                        ))}
                    </select>
                    <select
                        className="bg-slate-50 hover:bg-white dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 cursor-pointer transition-all shadow-2xs"
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                    >
                        <option value="all">Trạng thái: Tất cả</option>
                        <option value="learned">Đã thuộc</option>
                        <option value="unlearned">Chưa thuộc</option>
                    </select>
                </div>

                {isAdmin && (
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
                )}
            </div>

            {/* Table (Glass Container) */}
            <div className="bg-white dark:bg-[#0f172a]/90 backdrop-blur-xl rounded-3xl border border-slate-200/90 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.4)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200/90 dark:border-slate-800">
                                <th className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Từ vựng</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Nghĩa</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Loại từ</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-center">Thuộc</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredWords.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                                            <BookAIcon size={48} className="mb-4 opacity-30" />
                                            <p className="font-semibold">Không có từ vựng nào</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedWords.map((word) => {
                                    const isLearned = learnedWordsList.has(word.id);
                                    return (
                                        <tr key={word.id} className="hover:bg-indigo-50/30 dark:hover:bg-slate-800/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <button 
                                                        onClick={() => speak(word.en)}
                                                        className="p-1.5 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-100 dark:hover:bg-blue-900/60 shrink-0"
                                                    >
                                                        <Volume2 size={16} />
                                                    </button>
                                                    <div>
                                                        <div className="font-black text-slate-900 dark:text-white text-sm md:text-base">{word.en}</div>
                                                        <div className="text-xs text-slate-500 dark:text-slate-400 italic font-medium">{word.ipa}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-200 font-medium">
                                                {word.vi}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1.5">
                                                    <span className="text-[11px] bg-slate-100 dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 px-2 py-0.5 rounded-md text-slate-700 dark:text-slate-300 font-medium">{word.category}</span>
                                                    {word.unit && word.unit <= 12 && !word.master_group && <span className="text-[11px] bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-md font-bold">Unit {word.unit}</span>}
                                                    {word.unit && word.unit > 12 && !word.master_group && <span className="text-[11px] bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/60 text-indigo-800 dark:text-indigo-300 px-2 py-0.5 rounded-md font-bold">Chủ đề {word.unit - 12}</span>}
                                                    {word.master_group && <span className="text-[11px] bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/60 text-amber-900 dark:text-amber-300 px-2 py-0.5 rounded-md font-bold">{word.master_group}</span>}
                                                    {word.sub_group && <span className="text-[11px] bg-purple-50 dark:bg-purple-950/60 border border-purple-200/80 dark:border-purple-800/60 text-purple-900 dark:text-purple-300 px-2 py-0.5 rounded-md font-bold">{word.sub_group}</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full border-2 ${isLearned ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
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
                    <div className="px-6 py-3.5 border-t border-slate-200/90 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-800/30">
                        <div>
                            {isWordCountVisible() ? (
                                <>Hiển thị <span className="font-bold text-slate-900 dark:text-white">{(currentPage - 1) * pageSize + 1} - {Math.min(filteredWords.length, currentPage * pageSize)}</span> trong tổng số <span className="font-bold text-slate-900 dark:text-white">{filteredWords.length.toLocaleString()}</span> từ</>
                            ) : (
                                <>Trang <span className="font-bold text-slate-900 dark:text-white">{currentPage}</span> / <span className="font-bold text-slate-900 dark:text-white">{totalPages}</span></>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 rounded-lg border border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed font-semibold shadow-2xs transition-colors"
                            >
                                Trang trước
                            </button>
                            <span className="font-bold px-2 text-slate-800 dark:text-white">
                                {currentPage} / {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1.5 rounded-lg border border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed font-semibold shadow-2xs transition-colors"
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
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200/90 dark:border-slate-800">
                        <div className="p-6 border-b border-slate-200/90 dark:border-slate-800 flex justify-between items-center">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-gray-100">
                                <Settings className="text-blue-600" /> Thiết lập Kế hoạch
                            </h2>
                            <button onClick={() => setIsStudyPlanModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-gray-300 transition">
                                <CheckCircle2 size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSavePlan} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-800 dark:text-gray-300 mb-2">Số lượng từ vựng / Ngày</label>
                                <input 
                                    name="targetCount"
                                    type="number" 
                                    defaultValue={studyPlan.targetCount}
                                    min="1"
                                    max="500"
                                    required
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/40 text-slate-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-800 dark:text-gray-300 mb-2">Nhóm từ vựng ưu tiên</label>
                                <select 
                                    name="targetGroup"
                                    defaultValue={studyPlan.targetGroup.type}
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/40 text-slate-900 dark:text-white"
                                >
                                    <option value="all">Tất cả từ vựng</option>
                                    <option value="unit">Nhóm Khóa học (Unit)</option>
                                    <option value="daily">Nhóm Hàng ngày</option>
                                    <option value="master">Nhóm Tổng (Master)</option>
                                </select>
                            </div>
                            <div className="pt-4">
                                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition shadow-md hover:shadow-indigo-200 dark:hover:shadow-none">
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
