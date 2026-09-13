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
  BookAIcon, 
  Network, 
  Heart,
  TrendingUp,
  Cpu,
  Star
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useVisibility } from '../context/VisibilityContext';
import { audioManager } from '../utils/audioManager';

interface HomePageProps {
  wordCount?: number;
  onNavigate: (tab: string) => void;
  speak?: (text: string) => void;
}

export default function HomePage({ wordCount = 4650, onNavigate, speak }: HomePageProps) {
  const { user, isAdmin } = useAuth();
  const { isTopicVisible, isSectionVisible } = useVisibility();

  const handleAction = (tab: string) => {
    if (audioManager && typeof audioManager.playClick === 'function') {
      audioManager.playClick();
    }
    onNavigate(tab);
  };

  const showToeic30 = isTopicVisible('toeic30') || isTopicVisible('Lộ trình TOEIC 30 Ngày');
  const showToeic500 = isTopicVisible('toeic500') || isTopicVisible('500 Từ Vựng TOEIC Mất Gốc');
  const showEts2026 = isTopicVisible('ets2026') || isTopicVisible('Từ Vựng ETS 2026');
  const showMinna = isTopicVisible('japaneseMinna') || isTopicVisible('Từ Vựng Tiếng Nhật Minna No Nihongo');

  const showGrammar = isSectionVisible('grammar');
  const showGames = isSectionVisible('games');

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-12 animate-fade-in">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 text-white p-6 sm:p-10 md:p-12 shadow-xl">
        {/* Background decorative glows */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-bold text-white shadow-xs">
            <Sparkles size={15} className="text-amber-300 animate-pulse" />
            <span>Nền Tảng Luyện Tiếng Anh & TOEIC Thông Minh 2026</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Chinh Phục Tiếng Anh Tự Tin Mỗi Ngày Cùng AI & Lộ Trình Toàn Diện
          </h1>

          {/* Subtext */}
          <p className="text-sm sm:text-base md:text-lg text-blue-100 font-normal leading-relaxed">
            Hơn <span className="font-bold text-white">{wordCount.toLocaleString()}</span> từ vựng chuẩn kèm phát âm IPA, lộ trình TOEIC 30 ngày từng bước, ngữ pháp tương tác và các trò chơi rèn luyện phản xạ ghi nhớ sâu.
          </p>

          {/* Welcome User Banner or CTA Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
            <button
              onClick={() => handleAction('dashboard')}
              className="px-6 py-3.5 bg-white hover:bg-blue-50 text-blue-700 hover:text-blue-800 font-black text-sm rounded-2xl shadow-lg shadow-black/10 active:scale-95 transition-all flex items-center gap-2"
            >
              <span>🚀 Vào Bàn Học Ngay</span>
              <ArrowRight size={18} />
            </button>

            {showToeic30 && (
              <button
                onClick={() => handleAction('toeic30')}
                className="px-5 py-3.5 bg-white/15 hover:bg-white/25 backdrop-blur-md text-white font-bold text-sm rounded-2xl border border-white/25 active:scale-95 transition-all flex items-center gap-2"
              >
                <Calendar size={18} className="text-amber-300" />
                <span>Lộ Trình TOEIC 30 Ngày</span>
              </button>
            )}

            {!user ? (
              <button
                onClick={() => handleAction('login')}
                className="px-5 py-3.5 bg-slate-900/40 hover:bg-slate-900/60 backdrop-blur-md text-white font-bold text-sm rounded-2xl border border-white/20 active:scale-95 transition-all flex items-center gap-2"
              >
                <LogIn size={18} />
                <span>Đăng Nhập / Tạo Tài Khoản</span>
              </button>
            ) : (
              <div className="flex items-center gap-2.5 px-4 py-2 bg-white/20 backdrop-blur-md rounded-2xl border border-white/25">
                <div className="w-8 h-8 rounded-xl bg-white text-blue-700 font-black flex items-center justify-center text-xs">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white truncate max-w-[150px]">
                    Chào bạn, {user.name || user.username}!
                  </div>
                  <div className="text-[10px] text-blue-200">
                    {isAdmin ? '👑 Quản Trị Viên' : '🎓 Học Viên'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. LIVE METRICS COUNTER */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-2xl shrink-0">
            <BookOpen size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800 dark:text-white">
              {wordCount.toLocaleString()}+
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Từ vựng chuẩn & IPA
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-2xl shrink-0">
            <Calendar size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800 dark:text-white">
              30 Ngày
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Lộ trình TOEIC bám sát
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl shrink-0">
            <BrainCircuit size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800 dark:text-white">
              10+ Chế Độ
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Học & Ôn luyện thông minh
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-2xl shrink-0">
            <Gamepad2 size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800 dark:text-white">
              5 Trò Chơi
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Đấu trường luyện phản xạ
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE LEARNING PATHWAYS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
              <Target size={22} className="text-blue-600 dark:text-blue-400" />
              <span>Các Chuyên Đề Học Tập Trọng Điểm</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
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
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700/60 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black">
                  <Calendar size={26} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-black text-base text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      Lộ Trình TOEIC 30 Ngày
                    </h3>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 rounded-full">
                      Hot
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Kế hoạch tự học 30 ngày bài bản. Phân bổ từ vựng theo ngày, kiểm tra đánh giá và lưu tiến độ cá nhân vào MySQL.
                  </p>
                </div>
              </div>
              <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400">
                <span>Tham gia lộ trình</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          )}

          {/* Card 2: ETS 2026 */}
          {showEts2026 && (
            <div 
              onClick={() => handleAction('ets2026')}
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700/60 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black">
                  <Award size={26} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-black text-base text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      Từ Vựng ETS 2026 Thực Chiến
                    </h3>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 rounded-full">
                      Mới
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
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
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700/60 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
                  <Flame size={26} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-black text-base text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      500 Từ TOEIC Lấy Gốc Cấp Tốc
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Khóa từ vựng cốt lõi thiết yếu giúp học viên xây dựng nền tảng vững chắc để đạt mốc 450 - 550+ TOEIC.
                  </p>
                </div>
              </div>
              <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400">
                <span>Học lấy gốc</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          )}

          {/* Card 4: Minna no Nihongo */}
          {showMinna && (
            <div 
              onClick={() => handleAction('japaneseMinna')}
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700/60 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-black">
                  <Star size={26} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-black text-base text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      Tiếng Nhật Minna No Nihongo
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Giáo trình tiếng Nhật sơ cấp 50 bài tiêu chuẩn kèm Hiragana, Kanji và phát âm mẫu chuẩn xác.
                  </p>
                </div>
              </div>
              <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400">
                <span>Mở giáo trình</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. GRAMMAR & GAMES FEATURE CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Grammar & Reading */}
        {showGrammar && (
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-900 dark:to-indigo-950/30 p-6 sm:p-8 rounded-3xl border border-indigo-100 dark:border-indigo-900/40 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-md shadow-indigo-600/20">
                <BookAIcon size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800 dark:text-white">
                  Luyện Câu & Ngữ Pháp Chuyên Sâu
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Rèn luyện phản xạ ngữ pháp và đọc hiểu theo ngữ cảnh
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Bao gồm phân tích cấu trúc thì động từ, câu điều kiện, mệnh đề quan hệ và bài đọc hiểu có phân tích từ khóa giúp bạn hiểu sâu bản chất ngữ pháp.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={() => handleAction('grammar')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm"
              >
                Học Ngữ Pháp
              </button>
              <button
                onClick={() => handleAction('reading')}
                className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-indigo-50 text-indigo-700 dark:text-indigo-300 font-bold text-xs rounded-xl border border-indigo-200 dark:border-indigo-800 transition-all"
              >
                Luyện Đọc Hiểu
              </button>
              <button
                onClick={() => handleAction('speaking')}
                className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-indigo-50 text-indigo-700 dark:text-indigo-300 font-bold text-xs rounded-xl border border-indigo-200 dark:border-indigo-800 transition-all"
              >
                Luyện Nói AI
              </button>
            </div>
          </div>
        )}

        {/* Mini Games Arena */}
        {showGames && (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-900 dark:to-amber-950/30 p-6 sm:p-8 rounded-3xl border border-amber-100 dark:border-amber-900/40 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500 text-slate-950 rounded-2xl shadow-md shadow-amber-500/20">
                <Gamepad2 size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800 dark:text-white">
                  Đấu Trường Mini Games Thú Vị
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Vừa chơi vừa học, ghi nhớ từ vựng tự nhiên và bền lâu
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Trải nghiệm 5 trò chơi phản xạ nhanh: Thử Thách Sinh Tồn tính điểm, Lật Thẻ Trí Nhớ, Treo Cổ (Hangman), Mưa Từ Rơi và Ghép Chữ Scramble.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={() => handleAction('game_survival')}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl transition-all shadow-sm"
              >
                Thử Thách Sinh Tồn
              </button>
              <button
                onClick={() => handleAction('game_memory')}
                className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-amber-50 text-amber-800 dark:text-amber-300 font-bold text-xs rounded-xl border border-amber-200 dark:border-amber-800 transition-all"
              >
                Lật Thẻ Trí Nhớ
              </button>
              <button
                onClick={() => handleAction('game_hangman')}
                className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-amber-50 text-amber-800 dark:text-amber-300 font-bold text-xs rounded-xl border border-amber-200 dark:border-amber-800 transition-all"
              >
                Treo Cổ (Hangman)
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 5. SCIENTIFIC STUDY TOOLS TILES */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <BrainCircuit size={22} className="text-purple-600 dark:text-purple-400" />
            <span>Phương Pháp Học Tập Khoa Học Tích Hợp</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Ứng dụng các quy luật ghi nhớ não bộ và phản xạ ngôn ngữ thực tế
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
          <button
            onClick={() => handleAction('flashcards')}
            className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-blue-500 hover:shadow-md transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold mb-3">
              🗂️
            </div>
            <div className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors">
              Flashcard
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Lật thẻ 2 mặt</div>
          </button>

          <button
            onClick={() => handleAction('quiz')}
            className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-500 hover:shadow-md transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold mb-3">
              📝
            </div>
            <div className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white group-hover:text-indigo-600 transition-colors">
              Trắc Nghiệm
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Thử thách 4 đáp án</div>
          </button>

          <button
            onClick={() => handleAction('dictation')}
            className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-violet-500 hover:shadow-md transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950 text-violet-600 flex items-center justify-center font-bold mb-3">
              🎧
            </div>
            <div className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white group-hover:text-violet-600 transition-colors">
              Nghe Chép
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Luyện tai phản xạ</div>
          </button>

          <button
            onClick={() => handleAction('srs')}
            className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold mb-3">
              🔄
            </div>
            <div className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white group-hover:text-emerald-600 transition-colors">
              Lặp Lại SRS
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Ghi nhớ vĩnh viễn</div>
          </button>

          <button
            onClick={() => handleAction('typing')}
            className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-amber-500 hover:shadow-md transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center font-bold mb-3">
              ⌨️
            </div>
            <div className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white group-hover:text-amber-600 transition-colors">
              Gõ Chính Tả
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Nhớ chuẩn mặt chữ</div>
          </button>
        </div>
      </section>

      {/* 6. BOTTOM CTA */}
      <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-amber-400 font-black text-sm">
            <Flame size={18} />
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
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-600/30 active:scale-95 transition-all flex items-center gap-2"
            >
              <LogIn size={18} />
              <span>Đăng Nhập Tài Khoản</span>
            </button>
          ) : (
            <button
              onClick={() => handleAction('dashboard')}
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-600/30 active:scale-95 transition-all flex items-center gap-2"
            >
              <span>Vào Bàn Học Tiếp Tục</span>
              <ArrowRight size={18} />
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
