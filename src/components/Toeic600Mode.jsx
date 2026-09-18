import React, { useState, useMemo } from 'react';
import {
    BookOpen, Award, Sparkles, CheckCircle2, Gamepad2, Keyboard,
    Mic, Search, Volume2, ArrowLeft, Filter, Flame, Check, Zap,
    Layers, ChevronRight, BookmarkCheck, Briefcase, Building2,
    DollarSign, Plane, Coffee, HeartPulse, ShoppingBag, FolderKanban,
    Info, X, RotateCcw
} from 'lucide-react';

import OptimalLearningMode from './OptimalLearningMode';
import FlashcardMode from './FlashcardMode';
import QuizMode from './QuizMode';
import MatchMode from './MatchMode';
import TypingMode from './TypingMode';
import DictationMode from './DictationMode';
import Sequential3StepMode from './Sequential3StepMode';
import Ets2026IpaMode from './Ets2026IpaMode';

// 8 Nhóm lĩnh vực kinh doanh lớn bao quát toàn bộ 50 chủ đề TOEIC
const MACRO_DOMAINS = [
    { id: 'all', label: 'Tất cả 50 Chủ đề', icon: BookOpen },
    { id: 'business', label: 'Kinh doanh & Hợp đồng', icon: Briefcase },
    { id: 'office', label: 'Văn phòng & Công nghệ', icon: Building2 },
    { id: 'personnel', label: 'Nhân sự & Tuyển dụng', icon: FolderKanban },
    { id: 'finance', label: 'Tài chính & Ngân hàng', icon: DollarSign },
    { id: 'logistics', label: 'Mua sắm & Phân phối', icon: ShoppingBag },
    { id: 'travel', label: 'Du lịch & Giao thông', icon: Plane },
    { id: 'dining', label: 'Ẩm thực & Giải trí', icon: Coffee },
    { id: 'health', label: 'Y tế & Quản trị', icon: HeartPulse }
];

// Bản đồ phân loại 50 chủ đề theo 8 nhóm lĩnh vực
const TOPIC_DOMAIN_MAP = {
    // Kinh doanh & Hợp đồng
    'Contracts (Hợp đồng)': 'business',
    'Marketing (Tiếp thị)': 'business',
    'Warranties (bảo hành)': 'business',
    'Business planning (Kế hoạch kinh doanh)': 'business',
    'Conferences (Hội nghị)': 'business',
    'Media (Truyền thông)': 'business',

    // Văn phòng & Công nghệ
    'Office procedures (Thủ tục văn phòng)': 'office',
    'Office Technology (Công nghệ văn phòng)': 'office',
    'Computers (Máy tính)': 'office',
    'Correspondences (Thư tín)': 'office',
    'Electronics (Điện tử)': 'office',

    // Nhân sự & Tuyển dụng
    'Applying and Interviewing (Ứng tuyển và Phỏng vấn)': 'personnel',
    'Hiring and Training (Tuyển dụng và Đào tạo)': 'personnel',
    'Salaries and Benefits (Lương và Phúc lợi)': 'personnel',
    'Promotions, Pensions and Awards (Thăng tiến, Lương hưu và Giải thưởng)': 'personnel',
    'Job Advertising and Recruiting (Mô tả công việc và Tuyển dụng)': 'personnel',

    // Tài chính & Ngân hàng
    'Banking (Giao dịch ngân hàng)': 'finance',
    'Accounting (Kế toán)': 'finance',
    'Taxes (Thuế)': 'finance',
    'Financial Statements (Báo cáo tài chính)': 'finance',
    'Investments (Đầu tư)': 'finance',

    // Mua sắm & Phân phối
    'Shopping (Mua sắm)': 'logistics',
    'Ordering Supplies (Đặt hàng nhà cung cấp)': 'logistics',
    'Shipping (Vận chuyển)': 'logistics',
    'Invoices (Hóa đơn)': 'logistics',
    'Inventory (Hàng hóa)': 'logistics',

    // Du lịch & Giao thông
    'Airlines (Hàng không)': 'travel',
    'Trains (Xe lửa)': 'travel',
    'Hotels (Khách sạn)': 'travel',
    'Car Rentals (Thuê ô tô)': 'travel',
    'General Travel (Du lịch)': 'travel',

    // Ẩm thực & Giải trí
    'Movies (Phim ảnh)': 'dining',
    'Theater (Rạp phim)': 'dining',
    'Music (Âm nhạc)': 'dining',
    'Museums (Bảo tàng)': 'dining',
    'Eating out (Đi ăn ngoài)': 'dining',
    'Ordering Lunch (Đặt bữa trưa)': 'dining',
    'Cooking As A Career (Nấu ăn là sự nghiệp)': 'dining',
    'Selecting A Restaurant (Chọn nhà hàng)': 'dining',
    'Events (Sự kiện)': 'dining',

    // Y tế & Quản trị
    'Dentist’s Office (Phòng khám nha khoa)': 'health',
    'Doctor’s Office (Phòng khám bác sĩ)': 'health',
    'Hospitals (Bệnh viện)': 'health',
    'Pharmacy (Hiệu thuốc)': 'health',
    'Health Insurance (Bảo hiểm sức khỏe)': 'health',
    'Board meetings and Committees (Họp Hội đồng và Phòng ban)': 'health',
    'Quality Control (Quản trị chất lượng)': 'health',
    'Product Development (Phát triển sản phẩm)': 'health',
    'Renting and Leasing (Thuê và Cho thuê)': 'health',
    'Property and Departments (Tài sản và Phòng ban)': 'health'
};

export default function Toeic600Mode({ words = [], speak }) {
    const [selectedTopics, setSelectedTopics] = useState([]); // [] = All 50 topics, or Array of topic titles
    const [selectedDomain, setSelectedDomain] = useState('all'); // Macro domain filter
    const [selectedCategory, setSelectedCategory] = useState('all'); // POS filter
    const [searchQuery, setSearchQuery] = useState('');
    const [activeStudyMode, setActiveStudyMode] = useState(null);
    const [expandedDefinitions, setExpandedDefinitions] = useState({}); // { wordId: boolean }

    // 1. Lọc toàn bộ 600 từ vựng TOEIC
    const toeic600Words = useMemo(() => {
        return (words || []).filter(w =>
            w.master_group === '600 Từ Vựng TOEIC' ||
            (w.sub_group && (w.master_group || '').includes('600'))
        );
    }, [words]);

    // 2. Danh sách 50 Chủ đề có trong 600 từ vựng
    const topicsList = useMemo(() => {
        const set = new Set();
        toeic600Words.forEach(w => w.sub_group && set.add(w.sub_group));
        return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    }, [toeic600Words]);

    // 3. Danh sách các từ loại (POS)
    const categoriesList = useMemo(() => {
        const set = new Set();
        toeic600Words.forEach(w => w.category && set.add(w.category));
        return Array.from(set).sort();
    }, [toeic600Words]);

    // 4. Danh sách các chủ đề hiển thị theo Domain được chọn
    const visibleTopicsList = useMemo(() => {
        if (selectedDomain === 'all') return topicsList;
        return topicsList.filter(topic => TOPIC_DOMAIN_MAP[topic] === selectedDomain);
    }, [topicsList, selectedDomain]);

    // 5. Toggle chọn / bỏ chọn từng chủ đề
    const handleToggleTopic = (topicTitle) => {
        if (topicTitle === 'all') {
            setSelectedTopics([]);
            return;
        }

        setSelectedTopics(prev => {
            if (prev.includes(topicTitle)) {
                return prev.filter(t => t !== topicTitle);
            } else {
                const next = [...prev, topicTitle];
                if (next.length === topicsList.length) return [];
                return next;
            }
        });
    };

    // 6. Chọn toàn bộ các chủ đề trong Domain hiện tại
    const handleSelectCurrentDomainTopics = () => {
        if (visibleTopicsList.length === 0) return;
        setSelectedTopics(prev => {
            const set = new Set(prev);
            visibleTopicsList.forEach(t => set.add(t));
            if (set.size === topicsList.length) return [];
            return Array.from(set);
        });
    };

    // 7. Toggle hiển thị định nghĩa chi tiết
    const toggleDefinition = (id) => {
        setExpandedDefinitions(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    // 8. Danh sách từ vựng hiện tại (lọc theo Chủ đề đã chọn, Từ loại, và Từ khóa tìm kiếm)
    const currentWords = useMemo(() => {
        let list = (selectedTopics.length === 0)
            ? toeic600Words
            : toeic600Words.filter(w => selectedTopics.includes(w.sub_group));

        if (selectedCategory !== 'all') {
            list = list.filter(w => w.category === selectedCategory);
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            list = list.filter(w =>
                (w.en && w.en.toLowerCase().includes(q)) ||
                (w.vi && w.vi.toLowerCase().includes(q)) ||
                (w.ipa && w.ipa.toLowerCase().includes(q)) ||
                (w.sub_group && w.sub_group.toLowerCase().includes(q))
            );
        }

        return list;
    }, [selectedTopics, selectedCategory, toeic600Words, searchQuery]);

    // Format tên chủ đề (Tách tiếng Anh và tiếng Việt nếu cần)
    const splitTopicTitle = (fullTitle) => {
        if (!fullTitle) return { en: '', vi: '' };
        const match = fullTitle.match(/^(.*?)\s*\((.*?)\)$/);
        if (match) {
            return { en: match[1].trim(), vi: match[2].trim() };
        }
        return { en: fullTitle, vi: '' };
    };

    // Màn hình đang trong chế độ học cụ thể (Flashcard, Quiz, Gõ từ, v.v.)
    if (activeStudyMode) {
        return (
            <div className="space-y-4 max-w-7xl mx-auto animate-fade-in pb-12">
                {/* Header thanh quay lại */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm backdrop-blur-xl">
                    <button
                        onClick={() => setActiveStudyMode(null)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                    >
                        <ArrowLeft size={16} aria-hidden="true" />
                        <span>Quay lại 50 Chủ đề</span>
                    </button>

                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-black text-xs border border-amber-200 dark:border-amber-800/60">
                            {selectedTopics.length === 0
                                ? 'Tất cả 50 Chủ Đề 600 TOEIC'
                                : selectedTopics.length === 1
                                    ? selectedTopics[0]
                                    : `Đang chọn ${selectedTopics.length} Chủ Đề`}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                            ({currentWords.length} từ vựng)
                        </span>
                    </div>
                </div>

                {/* Nội dung chế độ học tương ứng */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 md:p-6 shadow-sm min-h-[520px]">
                    {activeStudyMode === 'optimal' && <OptimalLearningMode words={currentWords} speak={speak} />}
                    {activeStudyMode === 'sequential3' && <Sequential3StepMode words={currentWords} speak={speak} onExit={() => setActiveStudyMode(null)} />}
                    {activeStudyMode === 'flashcards' && <FlashcardMode words={currentWords} speak={speak} />}
                    {activeStudyMode === 'quiz' && <QuizMode words={currentWords} speak={speak} />}
                    {activeStudyMode === 'match' && <MatchMode words={currentWords} speak={speak} />}
                    {activeStudyMode === 'typing' && <TypingMode words={currentWords} speak={speak} />}
                    {activeStudyMode === 'dictation' && <DictationMode words={currentWords} speak={speak} />}
                    {activeStudyMode === 'ipa' && <Ets2026IpaMode words={currentWords} allWords={toeic600Words} speak={speak} onExit={() => setActiveStudyMode(null)} />}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
            {/* ── 1. HERO BANNER SẮC HỔ PHÁCH / VÀNG CAM 2026 ── */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 p-6 md:p-8 text-white shadow-xl">
                <div className="absolute right-0 top-0 -mt-10 -mr-10 h-72 w-72 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                <div className="absolute left-1/3 bottom-0 -mb-10 h-48 w-48 rounded-full bg-amber-400/20 blur-xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-2.5 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black tracking-wide">
                            <Award size={14} className="text-amber-200" aria-hidden="true" />
                            <span>BARRON'S 600 ESSENTIAL WORDS FOR THE TOEIC</span>
                        </div>
                        <h1 className="text-2xl md:text-4xl font-black tracking-tight">
                            600 Từ Vựng TOEIC Căn Bản
                        </h1>
                        <p className="text-xs md:text-sm text-amber-100 leading-relaxed opacity-95">
                            50 chủ đề từ vựng cốt lõi thường gặp nhất trong đề thi TOEIC: Hợp đồng, Tiếp thị, Nhân sự, Tài chính, Du lịch, Khách sạn...
                            Giúp xây dựng nền tảng từ vựng vững vàng để tự tin chinh phục mốc điểm 500 - 750+.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                        <div className="bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center flex-1 sm:flex-none">
                            <div className="text-2xl font-black text-white">{toeic600Words.length}</div>
                            <div className="text-[11px] font-bold text-amber-100 uppercase tracking-wider">Từ vựng chuẩn</div>
                        </div>
                        <div className="bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center flex-1 sm:flex-none">
                            <div className="text-2xl font-black text-amber-200">{topicsList.length}</div>
                            <div className="text-[11px] font-bold text-amber-100 uppercase tracking-wider">Chủ đề kinh điển</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── 2. THANH LAUNCHER 8 CHẾ ĐỘ HỌC CHUYÊN SÂU ── */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <Zap className="text-amber-500 fill-amber-400" size={20} aria-hidden="true" />
                        <span>Chọn Chế Độ Ôn Tập Chuyên Sâu ({currentWords.length} từ đang chọn)</span>
                    </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-3">
                    <button
                        onClick={() => setActiveStudyMode('sequential3')}
                        className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white hover:shadow-lg hover:scale-[1.02] transition cursor-pointer flex flex-col items-center justify-center text-center space-y-1.5 col-span-2 sm:col-span-2 min-h-[72px]"
                    >
                        <Flame size={22} className="fill-white" aria-hidden="true" />
                        <span className="text-xs font-black">Lộ trình 3 Bước 🔥</span>
                        <span className="text-[10px] opacity-95 font-semibold">Flashcard ➔ Nghe ➔ Gõ</span>
                    </button>

                    <button
                        onClick={() => setActiveStudyMode('optimal')}
                        className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 text-amber-900 dark:text-amber-300 hover:bg-amber-100/80 dark:hover:bg-amber-950/60 hover:scale-[1.02] transition cursor-pointer flex flex-col items-center justify-center text-center space-y-1 min-h-[72px] shadow-2xs"
                    >
                        <Sparkles size={20} className="text-amber-600 dark:text-amber-400" aria-hidden="true" />
                        <span className="text-xs font-bold">Học 5in1</span>
                    </button>

                    <button
                        onClick={() => setActiveStudyMode('flashcards')}
                        className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/60 text-blue-900 dark:text-blue-300 hover:bg-blue-100/80 dark:hover:bg-blue-950/60 hover:scale-[1.02] transition cursor-pointer flex flex-col items-center justify-center text-center space-y-1 min-h-[72px] shadow-2xs"
                    >
                        <Layers size={20} className="text-blue-600 dark:text-blue-400" aria-hidden="true" />
                        <span className="text-xs font-bold">Flashcard</span>
                    </button>

                    <button
                        onClick={() => setActiveStudyMode('quiz')}
                        className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/60 text-purple-900 dark:text-purple-300 hover:bg-purple-100/80 dark:hover:bg-purple-950/60 hover:scale-[1.02] transition cursor-pointer flex flex-col items-center justify-center text-center space-y-1 min-h-[72px] shadow-2xs"
                    >
                        <CheckCircle2 size={20} className="text-purple-600 dark:text-purple-400" aria-hidden="true" />
                        <span className="text-xs font-bold">Trắc nghiệm</span>
                    </button>

                    <button
                        onClick={() => setActiveStudyMode('match')}
                        className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 text-indigo-900 dark:text-indigo-300 hover:bg-indigo-100/80 dark:hover:bg-indigo-950/60 hover:scale-[1.02] transition cursor-pointer flex flex-col items-center justify-center text-center space-y-1 min-h-[72px] shadow-2xs"
                    >
                        <Gamepad2 size={20} className="text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                        <span className="text-xs font-bold">Nối từ</span>
                    </button>

                    <button
                        onClick={() => setActiveStudyMode('typing')}
                        className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-800/60 text-teal-900 dark:text-teal-300 hover:bg-teal-100/80 dark:hover:bg-teal-950/60 hover:scale-[1.02] transition cursor-pointer flex flex-col items-center justify-center text-center space-y-1 min-h-[72px] shadow-2xs"
                    >
                        <Keyboard size={20} className="text-teal-600 dark:text-teal-400" aria-hidden="true" />
                        <span className="text-xs font-bold">Gõ từ</span>
                    </button>

                    <button
                        onClick={() => setActiveStudyMode('dictation')}
                        className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-800/60 text-rose-900 dark:text-rose-300 hover:bg-rose-100/80 dark:hover:bg-rose-950/60 hover:scale-[1.02] transition cursor-pointer flex flex-col items-center justify-center text-center space-y-1 min-h-[72px] shadow-2xs"
                    >
                        <Mic size={20} className="text-rose-600 dark:text-rose-400" aria-hidden="true" />
                        <span className="text-xs font-bold">Nghe viết</span>
                    </button>
                </div>
            </div>

            {/* ── 3. BỘ LỌC 50 CHỦ ĐỀ & PHÂN NHÓM LĨNH VỰC ── */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
                {/* Header bộ lọc & Ô tìm kiếm */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                        <Filter className="text-amber-600 dark:text-amber-400 shrink-0" size={20} aria-hidden="true" />
                        <div>
                            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <span>Danh Sách 50 Chủ Đề Kinh Điển</span>
                                <span className="text-xs font-normal text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                                    Chọn 1 hoặc nhiều chủ đề
                                </span>
                            </h3>
                            {selectedTopics.length > 0 && (
                                <p className="text-xs text-amber-600 dark:text-amber-400 font-bold mt-0.5 flex items-center gap-2">
                                    <span>Đang chọn {selectedTopics.length} / {topicsList.length} Chủ Đề ({currentWords.length} từ)</span>
                                    <button
                                        onClick={() => setSelectedTopics([])}
                                        className="text-rose-500 hover:underline font-semibold text-[11px] cursor-pointer"
                                    >
                                        [Bỏ chọn tất cả]
                                    </button>
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="relative w-full sm:w-80">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                        <input
                            type="text"
                            placeholder="Tìm chủ đề hoặc từ vựng..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-amber-500 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none transition"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Macro Domain Tabs (Phân loại theo lĩnh vực kinh doanh) */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 border-b border-slate-100 dark:border-slate-800/80">
                    {MACRO_DOMAINS.map(domain => {
                        const Icon = domain.icon;
                        const isCurrent = selectedDomain === domain.id;
                        return (
                            <button
                                key={domain.id}
                                onClick={() => setSelectedDomain(domain.id)}
                                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                                    isCurrent
                                        ? 'bg-amber-600 text-white shadow-xs font-black'
                                        : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                                }`}
                            >
                                <Icon size={14} aria-hidden="true" />
                                <span>{domain.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Lưới các thẻ chủ đề (Topic Badges / Cards) */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold px-1">
                        <span>Hiển thị {visibleTopicsList.length} chủ đề trong danh mục:</span>
                        {selectedDomain !== 'all' && (
                            <button
                                onClick={handleSelectCurrentDomainTopics}
                                className="text-amber-600 dark:text-amber-400 hover:underline text-[11px] cursor-pointer"
                            >
                                + Chọn tất cả chủ đề trong nhóm này
                            </button>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 max-h-72 overflow-y-auto custom-scrollbar p-1">
                        <button
                            onClick={() => handleToggleTopic('all')}
                            className={`px-3.5 py-2 rounded-2xl text-xs font-black transition cursor-pointer border ${
                                selectedTopics.length === 0
                                    ? 'bg-amber-600 text-white border-amber-600 shadow-md scale-[1.02]'
                                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400'
                            }`}
                        >
                            🌟 Tất cả 50 Chủ Đề ({toeic600Words.length} từ)
                        </button>

                        {visibleTopicsList.map((topic, idx) => {
                            const count = toeic600Words.filter(w => w.sub_group === topic).length;
                            const isSelected = selectedTopics.includes(topic);
                            const { en, vi } = splitTopicTitle(topic);

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleToggleTopic(topic)}
                                    className={`px-3.5 py-2 rounded-2xl text-xs transition cursor-pointer border flex items-center gap-1.5 ${
                                        isSelected
                                            ? 'bg-amber-600 text-white border-amber-600 shadow-md scale-[1.02] font-black'
                                            : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400'
                                    }`}
                                >
                                    {isSelected && <Check size={14} className="shrink-0 text-white" aria-hidden="true" />}
                                    <span className="font-bold">{en}</span>
                                    {vi && <span className="opacity-80 text-[11px] font-normal">({vi})</span>}
                                    <span className="opacity-75 text-[10px] font-mono ml-0.5">[{count}]</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Filter Pills Từ Loại (POS) */}
                {categoriesList.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 mr-1">Từ loại:</span>
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                                selectedCategory === 'all'
                                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-black'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
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
                                        ? 'bg-amber-600 text-white font-black shadow-xs'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* ── 4. DANH SÁCH TỪ VỰNG CHI TIẾT (VOCABULARY CARDS) ── */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
                    <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">
                            {selectedTopics.length === 0
                                ? 'Trọn Bộ 600 Từ Vựng TOEIC Căn Bản'
                                : selectedTopics.length === 1
                                    ? selectedTopics[0]
                                    : `Tổng Hợp ${selectedTopics.length} Chủ Đề Đang Chọn`}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Hiển thị {currentWords.length} từ vựng phù hợp
                        </p>
                    </div>

                    <button
                        onClick={() => setActiveStudyMode('sequential3')}
                        className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                        <span>Bắt đầu học 3 Bước</span>
                        <ChevronRight size={16} aria-hidden="true" />
                    </button>
                </div>

                {currentWords.length === 0 ? (
                    <div className="py-16 text-center text-sm text-slate-400 space-y-3">
                        <BookOpen size={40} className="mx-auto text-slate-300 dark:text-slate-600" aria-hidden="true" />
                        <p className="font-medium">Không tìm thấy từ vựng nào khớp với bộ lọc hoặc từ khóa tìm kiếm.</p>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="text-amber-600 dark:text-amber-400 font-bold underline cursor-pointer"
                            >
                                Xóa tìm kiếm
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                        {currentWords.map((w, idx) => {
                            const isExpanded = Boolean(expandedDefinitions[w.id || idx]);
                            return (
                                <div
                                    key={w.id || idx}
                                    className="p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-800/40 hover:border-amber-500/80 dark:hover:border-amber-500/60 transition-all duration-200 space-y-2.5 flex flex-col justify-between shadow-[0_2px_8px_-2px_rgba(15,23,42,0.04)] hover:shadow-md"
                                >
                                    <div className="space-y-2">
                                        {/* Row 1: Word + Sound Button */}
                                        <div className="flex items-start justify-between gap-2">
                                            <h4 className="font-black text-base text-slate-900 dark:text-white tracking-tight">
                                                {w.en}
                                            </h4>
                                            <button
                                                onClick={() => speak && speak(w.en)}
                                                className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/60 transition shrink-0 cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                                                title={`Phát âm ${w.en}`}
                                                aria-label={`Phát âm ${w.en}`}
                                            >
                                                <Volume2 size={16} aria-hidden="true" />
                                            </button>
                                        </div>

                                        {/* Row 2: IPA */}
                                        {w.ipa && (
                                            <div className="text-xs font-mono text-amber-700 dark:text-amber-400 font-medium">
                                                {w.ipa}
                                            </div>
                                        )}

                                        {/* Row 3: Vietnamese Meaning */}
                                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">
                                            {w.vi}
                                        </div>

                                        {/* Row 4: Definition Toggle (English & Vietnamese) */}
                                        {(w.definition_en || w.definition_vi) && (
                                            <div className="text-[11px] pt-1">
                                                <button
                                                    onClick={() => toggleDefinition(w.id || idx)}
                                                    className="text-amber-600 dark:text-amber-400 hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
                                                >
                                                    <Info size={12} aria-hidden="true" />
                                                    <span>{isExpanded ? 'Thu gọn định nghĩa' : 'Xem định nghĩa'}</span>
                                                </button>

                                                {isExpanded && (
                                                    <div className="mt-1.5 p-2 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/50 space-y-1">
                                                        {w.definition_en && (
                                                            <p className="text-slate-700 dark:text-slate-300 italic">
                                                                {w.definition_en}
                                                            </p>
                                                        )}
                                                        {w.definition_vi && (
                                                            <p className="text-amber-900 dark:text-amber-300 font-medium">
                                                                ➔ {w.definition_vi}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Row 5: Example Sentence */}
                                        {w.example_en && (
                                            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 text-[11px] space-y-1">
                                                <p className="text-slate-700 dark:text-slate-300 italic font-medium flex items-start gap-1">
                                                    <span>“{w.example_en}”</span>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); speak && speak(w.example_en); }}
                                                        className="text-amber-600 hover:text-amber-700 dark:text-amber-400 p-0.5 rounded transition shrink-0 cursor-pointer"
                                                        title="Nghe câu ví dụ"
                                                        aria-label="Nghe câu ví dụ"
                                                    >
                                                        <Volume2 size={12} aria-hidden="true" />
                                                    </button>
                                                </p>
                                                {w.example_vi && (
                                                    <p className="text-slate-500 dark:text-slate-400 font-normal">
                                                        ➔ {w.example_vi}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Card Footer: Category & Topic Name */}
                                    <div className="pt-2.5 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 font-semibold gap-1">
                                        <span className="px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 shrink-0">
                                            {w.category || 'Từ vựng'}
                                        </span>
                                        <span className="truncate max-w-[130px] text-right" title={w.sub_group}>
                                            {w.sub_group?.split('(')[0]?.trim() || w.sub_group}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
