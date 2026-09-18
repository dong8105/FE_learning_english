import React from 'react';
import {
    BrainCircuit,
    Gamepad2,
    CheckCircle2,
    Layers,
    Keyboard,
    BookAIcon,
    Mic,
    Network,
    BookOpen,
    TrendingUp,
    X,
    Shuffle,
    LayoutDashboard,
    Sparkles,
    Calendar,
    Award,
    Flame,
    Volume2,
    BookmarkCheck,
    Heart,
    LayoutGrid,
    CloudRain,
    HelpCircle,
    ShieldCheck,
    Target,
    Home,
    LogIn,
    User as UserIcon,
    Eye
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useVisibility } from '../context/VisibilityContext';

export default function Sidebar({ activeTab, setActiveTab, isOpen, onClose }) {
    const { user, isAdmin } = useAuth();
    const { 
        isTopicVisibleInSidebar, 
        isSectionVisible,
        isTopicHiddenInSidebar,
        isSectionHidden,
        isPracticeItemVisible,
        isPracticeItemHidden,
        isVocabCategoryVisible,
        isVocabCategoryHidden,
        shouldAdminBypass
    } = useVisibility();
    
    const SidebarButton = ({ id, icon: Icon, label, badge }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all w-full text-left group cursor-pointer ${
                activeTab === id
                    ? 'bg-indigo-50 dark:bg-gradient-to-r dark:from-indigo-950/80 dark:to-slate-900/60 text-indigo-700 dark:text-indigo-300 font-bold border-l-4 border-indigo-600 dark:border-indigo-400 shadow-2xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/90 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
            }`}
        >
            <div className="flex items-center gap-3 truncate">
                <Icon size={18} className={`shrink-0 transition-transform group-hover:scale-110 ${activeTab === id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-400'}`} />
                <span className="truncate">{label}</span>
            </div>
            {badge && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200/90 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-transparent dark:border-slate-700/60">
                    {badge}
                </span>
            )}
        </button>
    );

    // Topic visibility checks specifically for Sidebar
    const isChuyendeVisible = isVocabCategoryVisible('chuyende');
    const isChuyendeHidden = isVocabCategoryHidden('chuyende');
    const showToeic30 = isChuyendeVisible && isTopicVisibleInSidebar('toeic30');
    const showToeic500 = isChuyendeVisible && isTopicVisibleInSidebar('toeic500');
    const showEts2026 = isChuyendeVisible && isTopicVisibleInSidebar('ets2026');
    const showMinna = isChuyendeVisible && isTopicVisibleInSidebar('japaneseMinna');
    const showToeic600 = isChuyendeVisible && isTopicVisibleInSidebar('toeic600');
    const hasAnySpecialTopic = showToeic30 || showToeic500 || showEts2026 || showMinna || showToeic600;

    const showVocabPracticeSection = isSectionVisible('vocabPractice');
    const showGrammarSection = isSectionVisible('grammar');
    const showGamesSection = isSectionVisible('games');

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-slate-950/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />
            )}

            <aside className={`
                fixed md:static inset-y-0 left-0 z-50
                w-64 h-full bg-white/95 dark:bg-[#0c1322]/95 backdrop-blur-xl flex flex-col py-5 px-3 gap-6 shrink-0 overflow-y-auto custom-scrollbar
                transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                border-r border-slate-200/80 dark:border-slate-800/80
            `}>
                <div className="flex items-center justify-between md:hidden mb-1 px-2">
                    <span className="font-black text-slate-400 dark:text-slate-500 text-xs uppercase tracking-widest">Menu</span>
                    <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400">
                        <X size={20} />
                    </button>
                </div>

                {/* 1. Admin Exclusive Navigation Section */}
                {isAdmin && (
                    <div className="p-3 bg-amber-50/80 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800/50 shadow-xs">
                        <h2 className="text-[11px] font-black text-amber-700 dark:text-amber-300 uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
                            <ShieldCheck size={15} /> Quản Trị Viên (Admin)
                        </h2>
                        <div className="flex flex-col gap-1">
                            <button
                                onClick={() => setActiveTab('admin_dashboard')}
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold text-xs transition-all w-full text-left cursor-pointer ${
                                    activeTab === 'admin_dashboard' && (!window.location.search || !window.location.search.includes('tab=visibility'))
                                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                                        : 'text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50'
                                }`}
                            >
                                <ShieldCheck size={16} />
                                <span>Admin Dashboard</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('admin_visibility')}
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold text-xs transition-all w-full text-left cursor-pointer ${
                                    activeTab === 'admin_visibility' || (activeTab === 'admin_dashboard' && window.location.search && window.location.search.includes('tab=visibility'))
                                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                                        : 'text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50'
                                }`}
                            >
                                <Eye size={16} />
                                <span>Phân Quyền & Hiển Thị</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('manage')}
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold text-xs transition-all w-full text-left cursor-pointer ${
                                    activeTab === 'manage'
                                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                                        : 'text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50'
                                }`}
                            >
                                <BrainCircuit size={16} />
                                <span>Quản Lý Từ Vựng</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* 2. Học Tập & Tổng Quan */}
                <div>
                    <h2 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-2">
                        Học Tập & Tổng Quan
                    </h2>
                    <div className="flex flex-col gap-1">
                        <SidebarButton id="home" icon={Home} label="Trang Chủ" />
                        <SidebarButton id="dashboard" icon={LayoutDashboard} label="Bàn học từ vựng" />
                        <SidebarButton id="recommendations" icon={TrendingUp} label="Đề xuất ôn tập" />
                        <SidebarButton id="srs" icon={BrainCircuit} label="Ôn tập ngắt quãng (SRS)" />
                    </div>
                </div>

                {/* 3. Bộ Chuyên Đề Trọng Điểm */}
                {hasAnySpecialTopic && (
                    <div>
                        <h2 className="text-xs font-black text-purple-700 dark:text-purple-400 uppercase tracking-wider mb-3 px-2 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                                <Target size={15} /> Bộ Chuyên Đề Trọng Điểm
                            </span>
                            {shouldAdminBypass && isChuyendeHidden && (
                                <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">Đã ẩn</span>
                            )}
                        </h2>
                        <div className="flex flex-col gap-1.5">
                            {showToeic30 && (
                                <button
                                    onClick={() => setActiveTab('toeic30')}
                                    className={`flex flex-col gap-1 px-4 py-3 rounded-2xl font-medium w-full text-left transition-all cursor-pointer ${
                                        activeTab === 'toeic30'
                                            ? 'bg-purple-100 text-purple-900 dark:bg-purple-900/40 dark:text-purple-200 shadow-sm border border-purple-300 dark:border-purple-600/70'
                                            : 'bg-purple-50/90 text-purple-800 dark:bg-purple-950/30 dark:text-purple-300 hover:bg-purple-100/90 dark:hover:bg-purple-900/30 border border-purple-200/70 dark:border-purple-900/40 hover:dark:border-purple-700/60'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Calendar size={20} className={activeTab === 'toeic30' ? 'text-purple-700 dark:text-purple-400' : 'text-purple-600/80 dark:text-purple-500'} />
                                        <div className="flex flex-wrap items-center justify-between w-full pr-1">
                                            <span className="font-bold text-sm whitespace-nowrap">Lộ trình TOEIC 30 Ngày</span>
                                            {shouldAdminBypass && isTopicHiddenInSidebar('toeic30') && (
                                                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">Đã ẩn</span>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-[11px] opacity-80 font-normal ml-8 pl-0.5">Khung 4 Tuần Cốt Lõi 400+</span>
                                </button>
                            )}
                            {showEts2026 && (
                                <button
                                    onClick={() => setActiveTab('ets2026')}
                                    className={`flex flex-col gap-1 px-4 py-3 rounded-2xl font-medium w-full text-left transition-all cursor-pointer ${
                                        activeTab === 'ets2026'
                                            ? 'bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-200 shadow-sm border border-blue-300 dark:border-blue-600/70'
                                            : 'bg-blue-50/90 text-blue-800 dark:bg-blue-950/30 dark:text-blue-300 hover:bg-blue-100/90 dark:hover:bg-blue-900/30 border border-blue-200/70 dark:border-blue-900/40 hover:dark:border-blue-700/60'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Award size={20} className={activeTab === 'ets2026' ? 'text-blue-700 dark:text-blue-400' : 'text-blue-600/80 dark:text-blue-500'} />
                                        <div className="flex flex-wrap items-center justify-between w-full pr-1">
                                            <span className="font-bold text-sm whitespace-nowrap">Từ Vựng ETS 2026</span>
                                            {shouldAdminBypass && isTopicHiddenInSidebar('ets2026') && (
                                                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">Đã ẩn</span>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-[11px] opacity-80 font-normal ml-8 pl-0.5">800 LC + 800 RC Official</span>
                                </button>
                            )}
                            {showToeic500 && (
                                <button
                                    onClick={() => setActiveTab('toeic500')}
                                    className={`flex flex-col gap-1 px-4 py-3 rounded-2xl font-medium w-full text-left transition-all cursor-pointer ${
                                        activeTab === 'toeic500'
                                            ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200 shadow-sm border border-emerald-300 dark:border-emerald-600/70'
                                            : 'bg-emerald-50/90 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 hover:bg-emerald-100/90 dark:hover:bg-emerald-900/30 border border-emerald-200/70 dark:border-emerald-900/40 hover:dark:border-emerald-700/60'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <BookmarkCheck size={20} className={activeTab === 'toeic500' ? 'text-emerald-700 dark:text-emerald-400' : 'text-emerald-600/80 dark:text-emerald-500'} />
                                        <div className="flex flex-wrap items-center justify-between w-full pr-1">
                                            <span className="font-bold text-sm whitespace-nowrap">500 Từ Vựng Mất Gốc</span>
                                            {shouldAdminBypass && isTopicHiddenInSidebar('toeic500') && (
                                                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">Đã ẩn</span>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-[11px] opacity-80 font-normal ml-8 pl-0.5">20 Câu Chuyện Ngữ Cảnh</span>
                                </button>
                            )}
                            {showMinna && (
                                <button
                                    onClick={() => setActiveTab('japaneseMinna')}
                                    className={`flex flex-col gap-1 px-4 py-3 rounded-2xl font-medium w-full text-left transition-all cursor-pointer ${
                                        activeTab === 'japaneseMinna'
                                            ? 'bg-rose-100 text-rose-900 dark:bg-rose-900/40 dark:text-rose-200 shadow-sm border border-rose-300 dark:border-rose-600/70'
                                            : 'bg-rose-50/90 text-rose-800 dark:bg-rose-950/30 dark:text-rose-300 hover:bg-rose-100/90 dark:hover:bg-rose-900/30 border border-rose-200/70 dark:border-rose-900/40 hover:dark:border-rose-700/60'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">🇯🇵</span>
                                        <div className="flex flex-wrap items-center justify-between w-full pr-1">
                                            <span className="font-bold text-sm whitespace-nowrap">Tiếng Nhật Minna</span>
                                            {shouldAdminBypass && isTopicHiddenInSidebar('japaneseminna') && (
                                                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">Đã ẩn</span>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-[11px] opacity-80 font-normal ml-8 pl-0.5">50 Bài Minna No Nihongo</span>
                                </button>
                            )}
                            {showToeic600 && (
                                <button
                                    onClick={() => setActiveTab('toeic600')}
                                    className={`flex flex-col gap-1 px-4 py-3 rounded-2xl font-medium w-full text-left transition-all cursor-pointer ${
                                        activeTab === 'toeic600'
                                            ? 'bg-amber-100 text-amber-950 dark:bg-amber-900/40 dark:text-amber-200 shadow-sm border border-amber-300 dark:border-amber-600/70'
                                            : 'bg-amber-50/90 text-amber-900 dark:bg-amber-950/30 dark:text-amber-300 hover:bg-amber-100/90 dark:hover:bg-amber-900/30 border border-amber-200/70 dark:border-amber-900/40 hover:dark:border-amber-700/60'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <BookOpen size={20} className={activeTab === 'toeic600' ? 'text-amber-700 dark:text-amber-400' : 'text-amber-600/80 dark:text-amber-500'} />
                                        <div className="flex flex-wrap items-center justify-between w-full pr-1">
                                            <span className="font-bold text-sm whitespace-nowrap">600 Từ Vựng TOEIC</span>
                                            {shouldAdminBypass && isTopicHiddenInSidebar('toeic600') && (
                                                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">Đã ẩn</span>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-[11px] opacity-80 font-normal ml-8 pl-0.5">50 Chủ Đề Căn Bản</span>
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* 4. Luyện Tập Từ Vựng */}
                {(showVocabPracticeSection || shouldAdminBypass) && (
                    <div>
                        <h2 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-2 flex items-center justify-between">
                            <span>Luyện Tập Từ Vựng</span>
                            {shouldAdminBypass && isSectionHidden('vocabPractice') && (
                                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 normal-case">Đã ẩn</span>
                            )}
                        </h2>
                        <div className="flex flex-col gap-1">
                            {(isPracticeItemVisible('sequential3') || shouldAdminBypass) && (
                                <button
                                    onClick={() => setActiveTab('sequential3')}
                                    className={`flex flex-col gap-1 px-4 py-3 rounded-2xl font-medium w-full text-left transition-all cursor-pointer ${
                                        activeTab === 'sequential3'
                                            ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md'
                                            : 'bg-amber-50/90 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300 hover:bg-amber-100/90 dark:hover:bg-amber-900/40 border border-amber-200/80 dark:border-amber-800/50 hover:dark:border-amber-700/60'
                                    }`}
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center gap-3">
                                            <Flame size={20} className={activeTab === 'sequential3' ? 'text-white' : 'text-amber-600 dark:text-amber-400'} />
                                            <span className="font-black text-xs sm:text-sm whitespace-nowrap">Lộ trình 3 Bước (Chuyên sâu)</span>
                                        </div>
                                        {shouldAdminBypass && isPracticeItemHidden('sequential3') && (
                                            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">Đã ẩn</span>
                                        )}
                                    </div>
                                    <span className="text-[10px] opacity-90 ml-8">1. Flashcard ➔ 2. Nghe Viết ➔ 3. Gõ Từ</span>
                                </button>
                            )}
                            {(isPracticeItemVisible('optimal') || shouldAdminBypass) && (
                                <SidebarButton id="optimal" icon={Sparkles} label="Học tối ưu (5in1)" badge={shouldAdminBypass && isPracticeItemHidden('optimal') ? "Đã ẩn" : undefined} />
                            )}
                            {(isPracticeItemVisible('flashcards') || shouldAdminBypass) && (
                                <SidebarButton id="flashcards" icon={Layers} label="Flashcards" badge={shouldAdminBypass && isPracticeItemHidden('flashcards') ? "Đã ẩn" : undefined} />
                            )}
                            {(isPracticeItemVisible('quiz') || shouldAdminBypass) && (
                                <SidebarButton id="quiz" icon={CheckCircle2} label="Trắc nghiệm" badge={shouldAdminBypass && isPracticeItemHidden('quiz') ? "Đã ẩn" : undefined} />
                            )}
                            {(isPracticeItemVisible('match') || shouldAdminBypass) && (
                                <SidebarButton id="match" icon={Gamepad2} label="Nối từ với nghĩa" badge={shouldAdminBypass && isPracticeItemHidden('match') ? "Đã ẩn" : undefined} />
                            )}
                            {(isPracticeItemVisible('typing') || shouldAdminBypass) && (
                                <SidebarButton id="typing" icon={Keyboard} label="Gõ từ vựng" badge={shouldAdminBypass && isPracticeItemHidden('typing') ? "Đã ẩn" : undefined} />
                            )}
                            {(isPracticeItemVisible('dictation') || shouldAdminBypass) && (
                                <SidebarButton id="dictation" icon={Mic} label="Nghe viết" badge={shouldAdminBypass && isPracticeItemHidden('dictation') ? "Đã ẩn" : undefined} />
                            )}
                            {(isPracticeItemVisible('ipa') || shouldAdminBypass) && (
                                <SidebarButton id="ipa" icon={Volume2} label="Luyện phát âm IPA" badge={shouldAdminBypass && isPracticeItemHidden('ipa') ? "Đã ẩn" : undefined} />
                            )}
                            
                            {(isPracticeItemVisible('mixedGame') || shouldAdminBypass) && (
                                <button
                                    onClick={() => setActiveTab('mixedGame')}
                                    className={`flex flex-col gap-1 px-4 py-3 rounded-2xl font-medium w-full text-left transition-all cursor-pointer ${
                                        activeTab === 'mixedGame'
                                            ? 'bg-pink-100 text-pink-900 dark:bg-pink-900/40 dark:text-pink-200 shadow-sm border border-pink-300 dark:border-pink-600/70'
                                            : 'bg-pink-50/90 text-pink-800 dark:text-pink-300 hover:bg-pink-100/90 dark:hover:bg-pink-900/30 border border-pink-200/70 dark:border-pink-900/40 hover:dark:border-pink-700/60'
                                    }`}
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center gap-3">
                                            <Shuffle size={20} className={activeTab === 'mixedGame' ? 'text-pink-700 dark:text-pink-400' : 'text-pink-600/80 dark:text-pink-500'} />
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="font-bold text-sm whitespace-nowrap">Game Hỗn hợp</span>
                                            </div>
                                        </div>
                                        {shouldAdminBypass && isPracticeItemHidden('mixedGame') && (
                                            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">Đã ẩn</span>
                                        )}
                                    </div>
                                    <span className="text-xs opacity-80 font-normal ml-8 pl-0.5">Random trắc nghiệm, nghe viết, gõ từ</span>
                                </button>
                            )}
                            
                            {(isPracticeItemVisible('related') || shouldAdminBypass) && (
                                <SidebarButton id="related" icon={Network} label="Từ liên quan" badge={shouldAdminBypass && isPracticeItemHidden('related') ? "Đã ẩn" : undefined} />
                            )}
                        </div>
                    </div>
                )}

                {/* 5. Luyện Câu & Ngữ Pháp */}
                {showGrammarSection && (
                    <div>
                        <h2 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-2 flex items-center justify-between">
                            <span>Luyện Câu & Ngữ Pháp</span>
                            {shouldAdminBypass && isSectionHidden('grammar') && (
                                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 normal-case">Đã ẩn</span>
                            )}
                        </h2>
                        <div className="flex flex-col gap-1">
                            <SidebarButton id="reading" icon={BookAIcon} label="Đọc & Trả Lời"/>
                            <SidebarButton id="grammar" icon={BookOpen} label="Luyện Ngữ Pháp"/>
                            <SidebarButton id="mixed" icon={Layers} label="Bài Tập Tổng Hợp"/>
                            <SidebarButton id="speaking" icon={Mic} label="Luyện Đọc (AI)"/>
                        </div>
                    </div>
                )}

                {/* 6. Khu Vực Trò Chơi */}
                {showGamesSection && (
                    <div>
                        <h2 className="text-xs font-black text-violet-700 dark:text-violet-400 uppercase tracking-wider mb-3 px-2 flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <Gamepad2 size={16} /> Khu vực Trò chơi
                            </span>
                            {shouldAdminBypass && isSectionHidden('games') && (
                                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 normal-case">Đã ẩn</span>
                            )}
                        </h2>
                        <div className="flex flex-col gap-1">
                            <SidebarButton id="game_memory" icon={LayoutGrid} label="Lật Thẻ Nhớ" />
                            <SidebarButton id="game_survival" icon={Heart} label="Sinh Tồn 5s" />
                            <SidebarButton id="game_hangman" icon={HelpCircle} label="Đoán Chữ (Hangman)" />
                            <SidebarButton id="game_falling" icon={CloudRain} label="Mưa Từ Vựng" />
                            <SidebarButton id="game_scramble" icon={Shuffle} label="Xếp Chữ (Đảo Từ)" />
                        </div>
                    </div>
                )}

                {/* 7. Tài Khoản & Đăng Nhập */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <SidebarButton 
                        id="login" 
                        icon={user ? UserIcon : LogIn} 
                        label={user ? (user.name || user.username) : 'Đăng Nhập / Đăng Ký'} 
                    />
                </div>
            </aside>
        </>
    );
}
