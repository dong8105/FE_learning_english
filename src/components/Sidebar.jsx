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
    User as UserIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useVisibility } from '../context/VisibilityContext';

export default function Sidebar({ activeTab, setActiveTab, isOpen, onClose }) {
    const { user, isAdmin } = useAuth();
    const { isTopicVisible, isSectionVisible } = useVisibility();
    
    const SidebarButton = ({ id, icon: Icon, label, badge }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all w-full text-left group ${
                activeTab === id
                    ? 'bg-blue-50/90 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold border-l-4 border-blue-600 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
        >
            <div className="flex items-center gap-3 truncate">
                <Icon size={18} className={`shrink-0 transition-transform group-hover:scale-110 ${activeTab === id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                <span className="truncate">{label}</span>
            </div>
            {badge && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                    {badge}
                </span>
            )}
        </button>
    );

    // Topic visibility checks
    const showToeic30 = isTopicVisible('toeic30') || isTopicVisible('Lộ trình TOEIC 30 Ngày');
    const showToeic500 = isTopicVisible('toeic500') || isTopicVisible('500 Từ Vựng TOEIC Mất Gốc');
    const showEts2026 = isTopicVisible('ets2026') || isTopicVisible('Từ Vựng ETS 2026');
    const showMinna = isTopicVisible('japaneseMinna') || isTopicVisible('Từ Vựng Tiếng Nhật Minna No Nihongo');
    const hasAnySpecialTopic = showToeic30 || showToeic500 || showEts2026 || showMinna;

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
                w-64 h-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl flex flex-col py-5 px-3 gap-6 shrink-0 overflow-y-auto custom-scrollbar
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
                    <div className="p-3 bg-amber-50/80 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800/60 shadow-xs">
                        <h2 className="text-[11px] font-black text-amber-700 dark:text-amber-300 uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
                            <ShieldCheck size={15} /> Quản Trị Viên (Admin)
                        </h2>
                        <div className="flex flex-col gap-1">
                            <button
                                onClick={() => setActiveTab('admin_dashboard')}
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold text-xs transition-all w-full text-left ${
                                    activeTab === 'admin_dashboard'
                                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                                        : 'text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50'
                                }`}
                            >
                                <ShieldCheck size={16} />
                                <span>Admin Dashboard</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('manage')}
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold text-xs transition-all w-full text-left ${
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
                    <h2 className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-2">
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
                        <h2 className="text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-3 px-2 flex items-center gap-1.5">
                            <Target size={15} /> Bộ Chuyên Đề Trọng Điểm
                        </h2>
                        <div className="flex flex-col gap-1.5">
                            {showToeic30 && (
                                <SidebarButton id="toeic30" icon={Calendar} label="Lộ trình TOEIC 30 Ngày" />
                            )}
                            {showEts2026 && (
                                <button
                                    onClick={() => setActiveTab('ets2026')}
                                    className={`flex flex-col gap-1 px-4 py-3 rounded-2xl font-medium w-full text-left transition-all ${
                                        activeTab === 'ets2026'
                                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 shadow-sm border border-blue-200 dark:border-blue-800/50'
                                            : 'bg-blue-50/70 text-blue-700 dark:bg-blue-900/10 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-transparent'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Award size={20} className={activeTab === 'ets2026' ? 'text-blue-600 dark:text-blue-400' : 'text-blue-500/70 dark:text-blue-500'} />
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-bold text-sm whitespace-nowrap">Từ Vựng ETS 2026</span>
                                        </div>
                                    </div>
                                    <span className="text-[11px] opacity-80 font-normal ml-8 pl-0.5">800 LC + 800 RC Official</span>
                                </button>
                            )}
                            {showToeic500 && (
                                <button
                                    onClick={() => setActiveTab('toeic500')}
                                    className={`flex flex-col gap-1 px-4 py-3 rounded-2xl font-medium w-full text-left transition-all ${
                                        activeTab === 'toeic500'
                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 shadow-sm border border-emerald-200 dark:border-emerald-800/50'
                                            : 'bg-emerald-50/70 text-emerald-700 dark:bg-emerald-900/10 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 border border-transparent'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <BookmarkCheck size={20} className={activeTab === 'toeic500' ? 'text-emerald-600 dark:text-emerald-400' : 'text-emerald-500/70 dark:text-emerald-500'} />
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-bold text-sm whitespace-nowrap">500 Từ Vựng Mất Gốc</span>
                                        </div>
                                    </div>
                                    <span className="text-[11px] opacity-80 font-normal ml-8 pl-0.5">20 Câu Chuyện Ngữ Cảnh</span>
                                </button>
                            )}
                            {showMinna && (
                                <button
                                    onClick={() => setActiveTab('japaneseMinna')}
                                    className={`flex flex-col gap-1 px-4 py-3 rounded-2xl font-medium w-full text-left transition-all ${
                                        activeTab === 'japaneseMinna'
                                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 shadow-sm border border-red-200 dark:border-red-800/50'
                                            : 'bg-red-50/70 text-red-700 dark:bg-red-900/10 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 border border-transparent'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">🇯🇵</span>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-bold text-sm whitespace-nowrap">Tiếng Nhật Minna</span>
                                        </div>
                                    </div>
                                    <span className="text-[11px] opacity-80 font-normal ml-8 pl-0.5">50 Bài Minna No Nihongo</span>
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* 4. Luyện Tập Từ Vựng */}
                <div>
                    <h2 className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-2">
                        Luyện Tập Từ Vựng
                    </h2>
                    <div className="flex flex-col gap-1">
                        <button
                            onClick={() => setActiveTab('sequential3')}
                            className={`flex flex-col gap-1 px-4 py-3 rounded-2xl font-medium w-full text-left transition-all ${
                                activeTab === 'sequential3'
                                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md'
                                    : 'bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 border border-amber-200/50 dark:border-amber-800/40'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <Flame size={20} className={activeTab === 'sequential3' ? 'text-white' : 'text-amber-600 dark:text-amber-400'} />
                                <span className="font-black text-xs sm:text-sm whitespace-nowrap">Lộ trình 3 Bước (Chuyên sâu)</span>
                            </div>
                            <span className="text-[10px] opacity-90 ml-8">1. Flashcard ➔ 2. Nghe Viết ➔ 3. Gõ Từ</span>
                        </button>
                        <SidebarButton id="optimal" icon={Sparkles} label="Học tối ưu (5in1)" />
                        <SidebarButton id="flashcards" icon={Layers} label="Flashcards" />
                        <SidebarButton id="quiz" icon={CheckCircle2} label="Trắc nghiệm" />
                        <SidebarButton id="match" icon={Gamepad2} label="Nối từ với nghĩa" />
                        <SidebarButton id="typing" icon={Keyboard} label="Gõ từ vựng" />
                        <SidebarButton id="dictation" icon={Mic} label="Nghe viết" />
                        <SidebarButton id="ipa" icon={Volume2} label="Luyện phát âm IPA" />
                        
                        <button
                            onClick={() => setActiveTab('mixedGame')}
                            className={`flex flex-col gap-1 px-4 py-3 rounded-2xl font-medium w-full text-left transition-all ${
                                activeTab === 'mixedGame'
                                    ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 shadow-sm border border-pink-200 dark:border-pink-800/50'
                                    : 'bg-pink-50 text-pink-700 dark:bg-pink-900/10 dark:text-pink-400 hover:bg-pink-100 dark:hover:bg-pink-900/30 border border-transparent'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <Shuffle size={20} className={activeTab === 'mixedGame' ? 'text-pink-600 dark:text-pink-400' : 'text-pink-500/70 dark:text-pink-500'} />
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-bold text-base whitespace-nowrap">Game Hỗn hợp</span>
                                </div>
                            </div>
                            <span className="text-xs opacity-80 font-normal ml-8 pl-0.5">Random trắc nghiệm, nghe viết, gõ từ</span>
                        </button>
                        
                        <SidebarButton id="related" icon={Network} label="Từ liên quan" />
                        <SidebarButton id="manage" icon={BrainCircuit} label="Quản lý từ" />
                    </div>
                </div>

                {/* 5. Luyện Câu & Ngữ Pháp */}
                {showGrammarSection && (
                    <div>
                        <h2 className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-2">
                            Luyện Câu & Ngữ Pháp
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
                        <h2 className="text-xs font-black text-violet-500 dark:text-violet-400 uppercase tracking-wider mb-3 px-2 flex items-center gap-2">
                            <Gamepad2 size={16} /> Khu vực Trò chơi
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
