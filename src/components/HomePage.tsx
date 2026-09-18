import React from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Flame, 
  ArrowRight, 
  Target, 
  Gamepad2, 
  BrainCircuit, 
  Layers, 
  CheckCircle2, 
  Award, 
  LogIn, 
  Volume2, 
  Clock, 
  Calendar, 
  ShieldCheck, 
  BookA, 
  Network, 
  Heart,
  TrendingUp,
  Cpu,
  Star,
  Lock,
  Crown,
  GraduationCap,
  ListChecks,
  Headphones,
  RotateCcw,
  Keyboard,
  Languages,
  FileText,
  Mic,
  Zap,
  AlertCircle,
  Rocket
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useVisibility } from '../context/VisibilityContext';
import { audioManager } from '../utils/audioManager';
import { toast } from 'react-toastify';

interface HomePageProps {
  wordCount?: number;
  onNavigate: (tab: string) => void;
  speak?: (text: string) => void;
}

export default function HomePage({ wordCount = 4650, onNavigate, speak }: HomePageProps) {
  const { user, isAdmin } = useAuth();
  const { 
    isTopicVisible, 
    isSectionVisible, 
    isTopicHidden, 
    isSectionHidden, 
    isPracticeItemVisible,
    isPracticeItemHidden,
    shouldAdminBypass,
    isWordCountVisible,
    isWordCountHidden,
    isVocabCategoryVisible,
    isVocabCategoryHidden
  } = useVisibility();

  const handleAction = (tab: string) => {
    if (audioManager && typeof audioManager.playClick === 'function') {
      audioManager.playClick();
    }
    if (!user && tab !== 'home' && tab !== 'login') {
      toast.info('Bạn cần đăng nhập tài khoản để bắt đầu học và lưu tiến độ!');
      sessionStorage.setItem('redirectAfterLogin', tab);
      onNavigate('login');
      return;
    }
    onNavigate(tab);
  };

  const isChuyendeVisible = isVocabCategoryVisible('chuyende');
  const isChuyendeHidden = isVocabCategoryHidden('chuyende');

  const showToeic30 = isChuyendeVisible && isTopicVisible('toeic30') && isTopicVisible('Lộ trình TOEIC 30 Ngày');
  const showToeic500 = isChuyendeVisible && isTopicVisible('toeic500') && isTopicVisible('500 Từ Vựng TOEIC Mất Gốc');
  const showToeic600 = isChuyendeVisible && isTopicVisible('toeic600') && isTopicVisible('600 Từ Vựng TOEIC');
  const showEts2026 = isChuyendeVisible && isTopicVisible('ets2026') && isTopicVisible('Từ Vựng ETS 2026');
  const showMinna = isChuyendeVisible && isTopicVisible('japaneseMinna') && isTopicVisible('Từ Vựng Tiếng Nhật Minna No Nihongo');

  const hasAnyCorePathway = showToeic30 || showToeic500 || showToeic600 || showEts2026 || showMinna;

  const showGrammar = isSectionVisible('grammar');
  const showGames = isSectionVisible('games');
  const showVocabPractice = isSectionVisible('vocabPractice');

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-14 animate-fade-in">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 text-white p-7 sm:p-12 md:p-14 shadow-2xl shadow-indigo-500/10">
        {/* Background decorative glows */}
        <div className="absolute -right-16 -top-16 w-96 h-96 bg-white/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-blue-400/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 bottom-0 w-64 h-64 bg-violet-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-xl border border-white/25 text-xs font-black text-white shadow-xs">
            <Sparkles size={15} className="text-amber-300 animate-spin-slow" />
            <span className="tracking-wide">NỀN TẢNG LUYỆN TIẾNG ANH & TOEIC THÔNG MINH 2026</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.15]">
            Chinh Phục Tiếng Anh <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-white via-blue-100 to-amber-200 bg-clip-text text-transparent">
              Tự Tin Cùng AI
            </span> & Lộ Trình Chuẩn
          </h1>

          {/* Subtext */}
          <p className="text-sm sm:text-base md:text-lg text-blue-100/90 font-normal leading-relaxed max-w-2xl">
            {isWordCountVisible() ? (
              <>
                Hơn <span className="font-extrabold text-white underline decoration-amber-400 decoration-2 underline-offset-4">{wordCount.toLocaleString()}+</span> từ vựng chuẩn kèm phát âm IPA, lộ trình TOEIC 30 ngày từng bước, ngữ pháp tương tác và các trò chơi rèn luyện phản xạ ghi nhớ sâu.
                {shouldAdminBypass && isWordCountHidden() && (
                  <span className="ml-2 px-2 py-0.5 text-[10px] font-bold bg-rose-500/80 text-white rounded-full">
                    Đã ẩn số lượng
                  </span>
                )}
              </>
            ) : (
              <>
                Kho từ vựng chuẩn kèm phát âm IPA, lộ trình TOEIC 30 ngày từng bước, ngữ pháp tương tác và các trò chơi rèn luyện phản xạ ghi nhớ sâu.
              </>
            )}
          </p>

          {/* Welcome User Banner or CTA Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3.5 sm:gap-4">
            {!user ? (
              <button
                onClick={() => handleAction('login')}
                className="px-6 py-3.5 bg-white hover:bg-blue-50 text-blue-700 hover:text-blue-800 font-black text-sm rounded-2xl shadow-xl shadow-black/15 hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <LogIn size={18} className="text-blue-600 stroke-[2.5]" />
                <span>Đăng Nhập Để Bắt Đầu Học</span>
                <ArrowRight size={18} />
              </button>
            ) : (
              <button
                onClick={() => handleAction('dashboard')}
                className="px-7 py-3.5 bg-white hover:bg-blue-50 text-blue-700 hover:text-blue-800 font-black text-sm rounded-2xl shadow-xl shadow-black/15 hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Rocket size={18} className="text-blue-600 stroke-[2.2]" />
                <span>Vào Bàn Học Ngay</span>
                <ArrowRight size={18} />
              </button>
            )}

            {showToeic30 && (
              <button
                onClick={() => handleAction('toeic30')}
                className="px-5 py-3.5 bg-white/15 hover:bg-white/25 backdrop-blur-xl text-white font-bold text-sm rounded-2xl border border-white/25 hover:border-white/40 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Calendar size={18} className="text-amber-300" />
                <span>Lộ Trình TOEIC 30 Ngày</span>
                {!user && <Lock size={14} className="text-amber-300 ml-0.5 opacity-90" />}
              </button>
            )}

            {user && (
              <div className="flex items-center gap-3 px-4 py-2 bg-white/15 backdrop-blur-xl rounded-2xl border border-white/25 shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-white text-blue-700 font-black flex items-center justify-center text-xs shadow-xs">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white truncate max-w-[150px]">
                    Chào bạn, {user.name || user.username}!
                  </div>
                  <div className="text-[10px] text-blue-200 font-medium flex items-center gap-1">
                    {isAdmin ? (
                      <>
                        <Crown size={12} className="text-amber-300 fill-amber-300" />
                        <span>Quản Trị Viên</span>
                      </>
                    ) : (
                      <>
                        <GraduationCap size={12} className="text-blue-200" />
                        <span>Học Viên</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {!user && (
            <div className="flex items-center gap-2 text-xs text-blue-100/90 font-medium pt-1">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-300 shrink-0">
                <AlertCircle size={13} />
              </span>
              <span>Bắt buộc đăng nhập tài khoản để vào bàn học, làm bài tập và theo dõi lộ trình</span>
            </div>
          )}
        </div>
      </section>

      {/* 2. LIVE METRICS COUNTER (Modern Glass Cards) */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900/85 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] hover:shadow-lg hover:-translate-y-1 transition-all flex items-center gap-4">
          <div className="p-3.5 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/70 dark:to-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl shrink-0 shadow-xs">
            <BookOpen size={24} className="stroke-[2.5]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              {isWordCountVisible() ? `${wordCount.toLocaleString()}+` : '---'}
              {shouldAdminBypass && isWordCountHidden() && (
                <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                  Đã ẩn
                </span>
              )}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 font-semibold mt-0.5">
              {isWordCountVisible() ? 'Từ vựng chuẩn & IPA' : 'Kho từ vựng & IPA'}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/85 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] hover:shadow-lg hover:-translate-y-1 transition-all flex items-center gap-4">
          <div className="p-3.5 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/70 dark:to-amber-900/40 text-amber-600 dark:text-amber-400 rounded-2xl shrink-0 shadow-xs">
            <Calendar size={24} className="stroke-[2.5]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              30 Ngày
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 font-semibold mt-0.5">
              Lộ trình TOEIC bám sát
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/85 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] hover:shadow-lg hover:-translate-y-1 transition-all flex items-center gap-4">
          <div className="p-3.5 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/70 dark:to-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-2xl shrink-0 shadow-xs">
            <BrainCircuit size={24} className="stroke-[2.5]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              10+ Chế Độ
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 font-semibold mt-0.5">
              Học & Ôn luyện thông minh
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/85 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] hover:shadow-lg hover:-translate-y-1 transition-all flex items-center gap-4">
          <div className="p-3.5 bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950/70 dark:to-rose-900/40 text-rose-600 dark:text-rose-400 rounded-2xl shrink-0 shadow-xs">
            <Gamepad2 size={24} className="stroke-[2.5]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              5 Trò Chơi
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 font-semibold mt-0.5">
              Đấu trường luyện phản xạ
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE LEARNING PATHWAYS */}
      {hasAnyCorePathway && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Target size={22} className="text-blue-600 dark:text-blue-400" />
                <span>Các Chuyên Đề Học Tập Trọng Điểm</span>
                {shouldAdminBypass && isChuyendeHidden && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 rounded-full">
                    Đã ẩn
                  </span>
                )}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Tuyển tập giáo trình chuẩn quốc tế phân nhóm khoa học từ cơ bản đến nâng cao
              </p>
            </div>
            <button
              onClick={() => handleAction('dashboard')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>Xem tất cả</span>
              <ArrowRight size={14} />
            </button>
          </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: TOEIC 30 Ngày */}
          {showToeic30 && (
            <div 
              onClick={() => handleAction('toeic30')}
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] hover:shadow-xl hover:border-purple-300 dark:hover:border-purple-700/60 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black shadow-xs">
                  <Calendar size={26} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-black text-base text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      Lộ Trình TOEIC 30 Ngày
                    </h3>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 rounded-full">
                      Hot
                    </span>
                    {shouldAdminBypass && isTopicHidden('toeic30') && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 rounded-full">
                        Đã ẩn
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Kế hoạch tự học 30 ngày bài bản. Phân bổ từ vựng theo ngày, kiểm tra đánh giá và tự động lưu tiến độ học tập.
                  </p>
                </div>
              </div>
              <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-purple-600 dark:text-purple-400">
                <span>Tham gia lộ trình</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          )}

          {/* Card 2: ETS 2026 */}
          {showEts2026 && (
            <div 
              onClick={() => handleAction('ets2026')}
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700/60 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black shadow-xs">
                  <Award size={26} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-black text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      Từ Vựng ETS 2026 Thực Chiến
                    </h3>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 rounded-full">
                      Mới
                    </span>
                    {shouldAdminBypass && isTopicHidden('ets2026') && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 rounded-full">
                        Đã ẩn
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Cập nhật toàn bộ các cấu trúc và từ vựng xuất hiện liên tục trong đề thi ETS 2026 chuẩn quốc tế.
                  </p>
                </div>
              </div>
              <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400">
                <span>Ôn luyện ngay</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          )}

          {/* Card 3: 500 Từ TOEIC Mất Gốc */}
          {showToeic500 && (
            <div 
              onClick={() => handleAction('toeic500')}
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] hover:shadow-xl hover:border-emerald-300 dark:hover:border-emerald-700/60 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black shadow-xs">
                  <Flame size={26} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-black text-base text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      500 Từ TOEIC Lấy Gốc Cấp Tốc
                    </h3>
                    {shouldAdminBypass && isTopicHidden('toeic500') && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 rounded-full">
                        Đã ẩn
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Khóa từ vựng cốt lõi thiết yếu giúp học viên xây dựng nền tảng vững chắc để đạt mốc 450 - 550+ TOEIC.
                  </p>
                </div>
              </div>
              <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span>Học lấy gốc</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          )}

          {/* Card 4: 600 Từ Vựng TOEIC (50 Chủ Đề Căn Bản) */}
          {showToeic600 && (
            <div 
              onClick={() => handleAction('toeic600')}
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] hover:shadow-xl hover:border-amber-300 dark:hover:border-amber-700/60 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black shadow-xs">
                  <BookOpen size={26} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-black text-base text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      600 Từ Vựng TOEIC Căn Bản
                    </h3>
                    {shouldAdminBypass && isTopicHidden('toeic600') && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 rounded-full">
                        Đã ẩn
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    50 chủ đề từ vựng cốt lõi bao quát toàn diện đề thi: Hợp đồng, Tiếp thị, Văn phòng, Tài chính, Du lịch.
                  </p>
                </div>
              </div>
              <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400">
                <span>Vào 50 chủ đề</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          )}

          {/* Card 5: Minna no Nihongo */}
          {showMinna && (
            <div 
              onClick={() => handleAction('japaneseMinna')}
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] hover:shadow-xl hover:border-rose-300 dark:hover:border-rose-700/60 hover:-translate-y-1 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950/70 dark:to-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center font-black shadow-xs group-hover:scale-105 transition-transform">
                  <Languages size={26} className="stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-black text-base text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                      Tiếng Nhật Minna No Nihongo
                    </h3>
                    {shouldAdminBypass && isTopicHidden('japaneseminna') && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 rounded-full">
                        Đã ẩn
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Giáo trình tiếng Nhật sơ cấp 50 bài tiêu chuẩn kèm Hiragana, Kanji và phát âm mẫu chuẩn xác.
                  </p>
                </div>
              </div>
              <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-rose-600 dark:text-rose-400">
                <span>Mở giáo trình</span>
                <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>
          )}
        </div>
      </section>
      )}

      {/* 4. GRAMMAR & GAMES FEATURE CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Grammar & Reading */}
        {showGrammar && (
          <div className="bg-gradient-to-br from-indigo-50/90 via-white to-blue-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30 p-6 sm:p-8 rounded-3xl border border-indigo-200/90 dark:border-indigo-500/30 shadow-[0_4px_20px_-4px_rgba(99,102,241,0.08)] dark:shadow-[0_4px_25px_-4px_rgba(0,0,0,0.5),0_0_15px_-3px_rgba(99,102,241,0.08)] space-y-4 transition-all">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-md shadow-indigo-600/20">
                <BookA size={24} className="stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Luyện Câu & Ngữ Pháp Chuyên Sâu
                  </h3>
                  {shouldAdminBypass && isSectionHidden('grammar') && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 rounded-full">
                      Đã ẩn
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Rèn luyện phản xạ ngữ pháp và đọc hiểu theo ngữ cảnh
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Bao gồm phân tích cấu trúc thì động từ, câu điều kiện, mệnh đề quan hệ và bài đọc hiểu có phân tích từ khóa giúp bạn hiểu sâu bản chất ngữ pháp.
            </p>
            <div className="flex flex-wrap gap-2.5 pt-2">
              <button
                onClick={() => handleAction('grammar')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-indigo-600/20 cursor-pointer active:scale-95 flex items-center gap-1.5"
              >
                <BookOpen size={14} />
                <span>Học Ngữ Pháp</span>
              </button>
              <button
                onClick={() => handleAction('reading')}
                className="px-4 py-2 bg-white dark:bg-slate-800/90 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold text-xs rounded-xl border border-indigo-200/90 dark:border-indigo-500/30 shadow-xs transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
              >
                <FileText size={14} />
                <span>Luyện Đọc Hiểu</span>
              </button>
              <button
                onClick={() => handleAction('speaking')}
                className="px-4 py-2 bg-white dark:bg-slate-800/90 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold text-xs rounded-xl border border-indigo-200/90 dark:border-indigo-500/30 shadow-xs transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
              >
                <Mic size={14} />
                <span>Luyện Nói AI</span>
              </button>
            </div>
          </div>
        )}

        {/* Mini Games Arena */}
        {showGames && (
          <div className="bg-gradient-to-br from-amber-50/90 via-white to-orange-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/30 p-6 sm:p-8 rounded-3xl border border-amber-200/90 dark:border-amber-500/30 shadow-[0_4px_20px_-4px_rgba(245,158,11,0.08)] dark:shadow-[0_4px_25px_-4px_rgba(0,0,0,0.5),0_0_15px_-3px_rgba(245,158,11,0.08)] space-y-4 transition-all">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 rounded-2xl shadow-md shadow-amber-500/20">
                <Gamepad2 size={24} className="stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Đấu Trường Mini Games Thú Vị
                  </h3>
                  {shouldAdminBypass && isSectionHidden('games') && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 rounded-full">
                      Đã ẩn
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Vừa chơi vừa học, ghi nhớ từ vựng tự nhiên và bền lâu
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Trải nghiệm 5 trò chơi phản xạ nhanh: Thử Thách Sinh Tồn tính điểm, Lật Thẻ Trí Nhớ, Treo Cổ (Hangman), Mưa Từ Rơi và Ghép Chữ Scramble.
            </p>
            <div className="flex flex-wrap gap-2.5 pt-2">
              <button
                onClick={() => handleAction('game_survival')}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md shadow-amber-500/20 cursor-pointer active:scale-95 flex items-center gap-1.5"
              >
                <Zap size={14} className="stroke-[2.5]" />
                <span>Thử Thách Sinh Tồn</span>
              </button>
              <button
                onClick={() => handleAction('game_memory')}
                className="px-4 py-2 bg-white dark:bg-slate-800/90 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold text-xs rounded-xl border border-amber-200/90 dark:border-amber-500/30 shadow-xs transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
              >
                <BrainCircuit size={14} />
                <span>Lật Thẻ Trí Nhớ</span>
              </button>
              <button
                onClick={() => handleAction('game_hangman')}
                className="px-4 py-2 bg-white dark:bg-slate-800/90 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold text-xs rounded-xl border border-amber-200/90 dark:border-amber-500/30 shadow-xs transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
              >
                <Gamepad2 size={14} />
                <span>Treo Cổ (Hangman)</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 5. SCIENTIFIC STUDY TOOLS TILES (Full Lucide SVG Icons, No Raw Emojis) */}
      {(showVocabPractice || shouldAdminBypass) && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
              <BrainCircuit size={22} className="text-purple-600 dark:text-purple-400 stroke-[2.5]" />
              <span>Phương Pháp Học Tập Khoa Học Tích Hợp</span>
              {shouldAdminBypass && isSectionHidden('vocabPractice') && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 rounded-full">
                  Đã ẩn
                </span>
              )}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Ứng dụng các quy luật ghi nhớ não bộ và phản xạ ngôn ngữ thực tế
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
            {/* Tool 1: Flashcard */}
            {(isPracticeItemVisible('flashcards') || shouldAdminBypass) && (
              <button
                onClick={() => handleAction('flashcards')}
                className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.04)] hover:border-blue-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 text-left group cursor-pointer"
              >
                <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold mb-3 shadow-xs group-hover:scale-110 transition-transform">
                  <Layers size={22} className="stroke-[2.3]" />
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-black text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Flashcard
                  </span>
                  {shouldAdminBypass && isPracticeItemHidden('flashcards') && (
                    <span className="px-1.5 py-0.2 text-[9px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 rounded">
                      Đã ẩn
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Lật thẻ 2 mặt</div>
              </button>
            )}

            {/* Tool 2: Trắc Nghiệm */}
            {(isPracticeItemVisible('quiz') || shouldAdminBypass) && (
              <button
                onClick={() => handleAction('quiz')}
                className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.04)] hover:border-indigo-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 text-left group cursor-pointer"
              >
                <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold mb-3 shadow-xs group-hover:scale-110 transition-transform">
                  <ListChecks size={22} className="stroke-[2.3]" />
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-black text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    Trắc Nghiệm
                  </span>
                  {shouldAdminBypass && isPracticeItemHidden('quiz') && (
                    <span className="px-1.5 py-0.2 text-[9px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 rounded">
                      Đã ẩn
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Thử thách 4 đáp án</div>
              </button>
            )}

            {/* Tool 3: Nghe Chép */}
            {(isPracticeItemVisible('dictation') || shouldAdminBypass) && (
              <button
                onClick={() => handleAction('dictation')}
                className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.04)] hover:border-violet-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 text-left group cursor-pointer"
              >
                <div className="w-11 h-11 rounded-xl bg-violet-50 dark:bg-violet-950/70 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold mb-3 shadow-xs group-hover:scale-110 transition-transform">
                  <Headphones size={22} className="stroke-[2.3]" />
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-black text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                    Nghe Chép
                  </span>
                  {shouldAdminBypass && isPracticeItemHidden('dictation') && (
                    <span className="px-1.5 py-0.2 text-[9px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 rounded">
                      Đã ẩn
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Luyện tai phản xạ</div>
              </button>
            )}

            {/* Tool 4: Lặp Lại SRS */}
            <button
              onClick={() => handleAction('srs')}
              className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.04)] hover:border-emerald-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 text-left group cursor-pointer"
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold mb-3 shadow-xs group-hover:scale-110 transition-transform">
                <RotateCcw size={22} className="stroke-[2.3]" />
              </div>
              <div className="font-black text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Lặp Lại SRS
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Ghi nhớ vĩnh viễn</div>
            </button>

            {/* Tool 5: Gõ Chính Tả */}
            {(isPracticeItemVisible('typing') || shouldAdminBypass) && (
              <button
                onClick={() => handleAction('typing')}
                className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.04)] hover:border-amber-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 text-left group cursor-pointer"
              >
                <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold mb-3 shadow-xs group-hover:scale-110 transition-transform">
                  <Keyboard size={22} className="stroke-[2.3]" />
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-black text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    Gõ Chính Tả
                  </span>
                  {shouldAdminBypass && isPracticeItemHidden('typing') && (
                    <span className="px-1.5 py-0.2 text-[9px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 rounded">
                      Đã ẩn
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Nhớ chuẩn mặt chữ</div>
              </button>
            )}
          </div>
        </section>
      )}

      {/* 6. BOTTOM MOTIVATIONAL CTA (Glassmorphic Deep Navy Card) */}
      <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-10 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-amber-400 font-black text-sm">
            <Flame size={18} className="stroke-[2.5]" />
            <span>Xây Dựng Thói Quen Học Tập Mỗi Ngày</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black">
            Bắt Đầu Ngay Hôm Nay Để Chinh Phục Mục Tiêu Tiếng Anh!
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Dữ liệu và chuỗi học tập (Streak) của bạn sẽ được lưu giữ đồng bộ tự động khi đăng nhập.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {!user ? (
            <button
              onClick={() => handleAction('login')}
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-600/30 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <LogIn size={18} />
              <span>Đăng Nhập Tài Khoản</span>
            </button>
          ) : (
            <button
              onClick={() => handleAction('dashboard')}
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-600/30 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Rocket size={18} />
              <span>Vào Bàn Học Tiếp Tục</span>
              <ArrowRight size={18} />
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
