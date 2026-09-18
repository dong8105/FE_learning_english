import React, { useState, useMemo } from "react";
import { Settings2, Volume2, X, AlertCircle, Info, Sparkles, ShieldCheck, Eye, EyeOff } from "lucide-react";

const VoiceSettings = ({ 
    isOpen, 
    onClose, 
    voices = [], 
    selectedVoice = '', 
    setSelectedVoice, 
    speechRate = 0.8, 
    setSpeechRate, 
    globalRandomizeVoice = true, 
    setGlobalRandomizeVoice,
    selectedJapaneseVoice = '',
    setSelectedJapaneseVoice,
    japaneseSpeechRate = 0.85,
    setJapaneseSpeechRate,
    showEnglishSettings = true,
    showJapaneseSettings = true,
    isAdmin = false,
    onToggleAdminVoiceVisibility
}) => {
    const [activeTab, setActiveTab] = useState('en'); // 'en' | 'ja'

    // Filter English voices
    const englishVoices = useMemo(() => {
        return voices.filter(v => v.lang && v.lang.toLowerCase().includes('en'));
    }, [voices]);

    const usVoices = useMemo(() => englishVoices.filter(v => {
        const l = v.lang.toLowerCase();
        return l.includes('en-us') || l.includes('en_us');
    }), [englishVoices]);

    const ukVoices = useMemo(() => englishVoices.filter(v => {
        const l = v.lang.toLowerCase();
        return l.includes('en-gb') || l.includes('en_gb');
    }), [englishVoices]);

    const auVoices = useMemo(() => englishVoices.filter(v => {
        const l = v.lang.toLowerCase();
        return l.includes('en-au') || l.includes('en_au');
    }), [englishVoices]);

    const caVoices = useMemo(() => englishVoices.filter(v => {
        const l = v.lang.toLowerCase();
        return l.includes('en-ca') || l.includes('en_ca');
    }), [englishVoices]);

    const otherEnVoices = useMemo(() => englishVoices.filter(v => {
        const l = v.lang.toLowerCase();
        return !l.includes('en-us') && !l.includes('en_us') &&
               !l.includes('en-gb') && !l.includes('en_gb') &&
               !l.includes('en-au') && !l.includes('en_au') &&
               !l.includes('en-ca') && !l.includes('en_ca');
    }), [englishVoices]);

    // Filter Japanese voices
    const japaneseVoices = useMemo(() => {
        return voices.filter(v => v.lang && (v.lang.toLowerCase().startsWith('ja') || v.lang.toLowerCase().includes('jp')));
    }, [voices]);

    // Determine effective active tab
    const effectiveTab = useMemo(() => {
        if (isAdmin) return activeTab;
        if (!showEnglishSettings && showJapaneseSettings) return 'ja';
        if (showEnglishSettings && !showJapaneseSettings) return 'en';
        return activeTab;
    }, [isAdmin, showEnglishSettings, showJapaneseSettings, activeTab]);

    const isAllHiddenForUser = useMemo(() => {
        return !isAdmin && !showEnglishSettings && !showJapaneseSettings;
    }, [isAdmin, showEnglishSettings, showJapaneseSettings]);

    // English Test Handler with safe rate sanitization
    const handleTestEnglishVoice = () => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance("Hello, welcome to Bluebell English learning!");
        utterance.lang = 'en-US';
        const safeRate = (typeof speechRate === 'number' && Number.isFinite(speechRate) && speechRate > 0) 
            ? speechRate 
            : 0.8;
        utterance.rate = safeRate;

        if (globalRandomizeVoice && englishVoices.length > 1) {
            const randomVoice = englishVoices[Math.floor(Math.random() * englishVoices.length)];
            utterance.voice = randomVoice;
        } else if (selectedVoice) {
            const voice = englishVoices.find(v => v.voiceURI === selectedVoice || v.name === selectedVoice);
            if (voice) utterance.voice = voice;
        }
        window.speechSynthesis.speak(utterance);
    };

    // Japanese Test Handler with safe rate sanitization
    const handleTestJapaneseVoice = () => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance("こんにちは、日本語の勉強を始めましょう！");
        utterance.lang = 'ja-JP';
        const safeRate = (typeof japaneseSpeechRate === 'number' && Number.isFinite(japaneseSpeechRate) && japaneseSpeechRate > 0) 
            ? japaneseSpeechRate 
            : 0.85;
        utterance.rate = safeRate;

        if (selectedJapaneseVoice) {
            const voice = japaneseVoices.find(v => v.voiceURI === selectedJapaneseVoice || v.name === selectedJapaneseVoice);
            if (voice) utterance.voice = voice;
        } else if (japaneseVoices.length > 0) {
            utterance.voice = japaneseVoices[0];
        }
        window.speechSynthesis.speak(utterance);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-gray-100 dark:border-slate-800 animate-in fade-in zoom-in duration-200 transition-colors">
                {/* Header */}
                <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100 dark:border-slate-800">
                    <h2 className="text-xl font-black text-gray-800 dark:text-white flex items-center gap-2.5">
                        <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                            <Settings2 size={20} />
                        </span>
                        <span>Cài đặt Giọng đọc & Phát âm</span>
                    </h2>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer"
                        title="Đóng"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* All Voice Settings Locked Banner (Learners Only) */}
                {isAllHiddenForUser && (
                    <div className="p-6 text-center space-y-4 my-2">
                        <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
                            <AlertCircle size={28} />
                        </div>
                        <div className="space-y-1.5">
                            <h3 className="font-black text-base text-gray-800 dark:text-white">
                                Cài Đặt Giọng Đọc Đang Bị Ẩn
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                                Quản trị viên hiện đang tạm khóa quyền tùy chỉnh giọng đọc Tiếng Anh &amp; Tiếng Nhật đối với học viên. Hệ thống vẫn tự động phát âm chuẩn tự nhiên khi bạn học từ vựng.
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer"
                        >
                            Đóng cửa sổ
                        </button>
                    </div>
                )}

                {/* Language Switch Tabs (If 2 languages accessible or Admin) */}
                {!isAllHiddenForUser && (isAdmin || (showEnglishSettings && showJapaneseSettings)) && (
                    <div className="flex p-1 bg-gray-100 dark:bg-slate-800 rounded-2xl mb-6">
                        <button
                            onClick={() => setActiveTab('en')}
                            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                effectiveTab === 'en'
                                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
                            }`}
                        >
                            <span className="text-base leading-none">🇬🇧</span>
                            <span>Tiếng Anh</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-bold">
                                {englishVoices.length}
                            </span>
                            {isAdmin && !showEnglishSettings && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-black border border-rose-200 dark:border-rose-900/40" title="Đang ẩn với học viên">
                                    Ẩn
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('ja')}
                            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                effectiveTab === 'ja'
                                    ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm'
                                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
                            }`}
                        >
                            <span className="text-base leading-none">🇯🇵</span>
                            <span>Tiếng Nhật</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                                japaneseVoices.length > 0 
                                    ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300' 
                                    : 'bg-gray-200 dark:bg-slate-600 text-gray-600 dark:text-slate-300'
                            }`}>
                                {japaneseVoices.length}
                            </span>
                            {isAdmin && !showJapaneseSettings && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-black border border-rose-200 dark:border-rose-900/40" title="Đang ẩn với học viên">
                                    Ẩn
                                </span>
                            )}
                        </button>
                    </div>
                )}

                {/* Single Language Banner for Learners */}
                {!isAllHiddenForUser && !isAdmin && showEnglishSettings && !showJapaneseSettings && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 rounded-2xl mb-5 text-xs font-bold text-blue-700 dark:text-blue-300">
                        <span className="text-base">🇬🇧</span>
                        <span>Cài đặt Giọng đọc Tiếng Anh (English Voice)</span>
                    </div>
                )}
                {!isAllHiddenForUser && !isAdmin && !showEnglishSettings && showJapaneseSettings && (
                    <div className="flex items-center gap-2 p-3 bg-rose-50/70 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/40 rounded-2xl mb-5 text-xs font-bold text-rose-700 dark:text-rose-300">
                        <span className="text-base">🇯🇵</span>
                        <span>Cài đặt Giọng đọc Tiếng Nhật (Minna no Nihongo)</span>
                    </div>
                )}

                {/* ── ENGLISH TAB ── */}
                {!isAllHiddenForUser && effectiveTab === 'en' && (
                    <div className="space-y-5 animate-in fade-in duration-150">
                        {/* Admin Quick Visibility Toggle */}
                        {isAdmin && (
                            <div className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
                                !showEnglishSettings 
                                    ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 text-rose-900 dark:text-rose-300' 
                                    : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                            }`}>
                                <div className="flex items-center gap-2 min-w-0">
                                    <ShieldCheck size={16} className={!showEnglishSettings ? 'text-rose-600 dark:text-rose-400 shrink-0' : 'text-blue-600 dark:text-blue-400 shrink-0'} />
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-xs font-black truncate">
                                            Admin: {!showEnglishSettings ? 'Cài đặt Tiếng Anh đang ẩn với học viên' : 'Cài đặt Tiếng Anh đang mở cho học viên'}
                                        </span>
                                        <span className="text-[11px] opacity-75 truncate">
                                            {!showEnglishSettings ? 'Học viên không thể tùy chỉnh tab này' : 'Học viên được phép cấu hình giọng đọc'}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => onToggleAdminVoiceVisibility && onToggleAdminVoiceVisibility('en')}
                                    className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs ${
                                        !showEnglishSettings
                                            ? 'bg-rose-600 hover:bg-rose-700 text-white'
                                            : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200'
                                    }`}
                                >
                                    {!showEnglishSettings ? 'Mở cho học viên' : 'Ẩn với học viên'}
                                </button>
                            </div>
                        )}

                        {/* Voice Selection */}
                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-gray-600 dark:text-slate-300 mb-2">
                                Giọng đọc Tiếng Anh mặc định
                            </label>
                            <select
                                className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold dark:text-white transition-colors cursor-pointer disabled:opacity-50"
                                value={selectedVoice || ''}
                                onChange={(e) => setSelectedVoice && setSelectedVoice(e.target.value)}
                                disabled={globalRandomizeVoice}
                            >
                                {usVoices.length > 0 && (
                                    <optgroup label="🇺🇸 Giọng Mỹ (US English)">
                                        {usVoices.map(voice => (
                                            <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name}</option>
                                        ))}
                                    </optgroup>
                                )}
                                {ukVoices.length > 0 && (
                                    <optgroup label="🇬🇧 Giọng Anh (UK English)">
                                        {ukVoices.map(voice => (
                                            <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name}</option>
                                        ))}
                                    </optgroup>
                                )}
                                {auVoices.length > 0 && (
                                    <optgroup label="🇦🇺 Giọng Úc (AU English)">
                                        {auVoices.map(voice => (
                                            <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name}</option>
                                        ))}
                                    </optgroup>
                                )}
                                {caVoices.length > 0 && (
                                    <optgroup label="🇨🇦 Giọng Canada (CA English)">
                                        {caVoices.map(voice => (
                                            <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name}</option>
                                        ))}
                                    </optgroup>
                                )}
                                {otherEnVoices.length > 0 && (
                                    <optgroup label="🌐 Giọng Tiếng Anh khác">
                                        {otherEnVoices.map(voice => (
                                            <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name} ({voice.lang})</option>
                                        ))}
                                    </optgroup>
                                )}
                                {englishVoices.length === 0 && <option value="">Đang nạp danh sách giọng đọc...</option>}
                            </select>
                        </div>

                        {/* Speech Rate Slider */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-xs font-black uppercase tracking-wider text-gray-600 dark:text-slate-300">
                                    Tốc độ đọc Tiếng Anh
                                </label>
                                <span className="px-2 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-black">
                                    {speechRate}x
                                </span>
                            </div>
                            <input
                                type="range"
                                min="0.5"
                                max="1.5"
                                step="0.05"
                                value={speechRate}
                                onChange={(e) => setSpeechRate && setSpeechRate(parseFloat(e.target.value))}
                                className="w-full accent-blue-600 cursor-pointer h-2 bg-gray-200 dark:bg-slate-700 rounded-lg"
                            />
                            <div className="flex justify-between text-[11px] font-bold text-gray-400 dark:text-slate-500 mt-1">
                                <span>Chậm (0.5x)</span>
                                <span>Tiêu chuẩn (0.8x - 1.0x)</span>
                                <span>Nhanh (1.5x)</span>
                            </div>
                        </div>

                        {/* TOEIC Accent Randomizer */}
                        <div className="flex items-start gap-3 p-3.5 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-2xl">
                            <input 
                                type="checkbox" 
                                id="global-random-voice-toggle"
                                checked={globalRandomizeVoice}
                                onChange={(e) => setGlobalRandomizeVoice && setGlobalRandomizeVoice(e.target.checked)}
                                className="w-4 h-4 mt-0.5 text-blue-600 rounded cursor-pointer accent-blue-600"
                            />
                            <div className="flex flex-col">
                                <label htmlFor="global-random-voice-toggle" className="text-xs font-black text-gray-800 dark:text-slate-200 cursor-pointer flex items-center gap-1.5">
                                    <Sparkles size={14} className="text-amber-500" />
                                    <span>Tự động đổi giọng chuẩn đề thi TOEIC</span>
                                </label>
                                <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                                    Mỗi từ vựng sẽ được phát ngẫu nhiên luân phiên giữa các giọng US, UK, AU, CA để rèn luyện phản xạ nghe thực chiến.
                                </p>
                            </div>
                        </div>

                        {/* Test Button */}
                        <button
                            onClick={handleTestEnglishVoice}
                            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 cursor-pointer"
                        >
                            <Volume2 size={18} />
                            <span>Nghe thử Tiếng Anh ("Hello, welcome to Bluebell...")</span>
                        </button>
                    </div>
                )}

                {/* ── JAPANESE TAB ── */}
                {!isAllHiddenForUser && effectiveTab === 'ja' && (
                    <div className="space-y-5 animate-in fade-in duration-150">
                        {/* Admin Quick Visibility Toggle */}
                        {isAdmin && (
                            <div className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
                                !showJapaneseSettings 
                                    ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 text-rose-900 dark:text-rose-300' 
                                    : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                            }`}>
                                <div className="flex items-center gap-2 min-w-0">
                                    <ShieldCheck size={16} className={!showJapaneseSettings ? 'text-rose-600 dark:text-rose-400 shrink-0' : 'text-rose-600 dark:text-rose-400 shrink-0'} />
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-xs font-black truncate">
                                            Admin: {!showJapaneseSettings ? 'Cài đặt Tiếng Nhật đang ẩn với học viên' : 'Cài đặt Tiếng Nhật đang mở cho học viên'}
                                        </span>
                                        <span className="text-[11px] opacity-75 truncate">
                                            {!showJapaneseSettings ? 'Học viên không thể tùy chỉnh tab này' : 'Học viên được phép cấu hình giọng đọc'}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => onToggleAdminVoiceVisibility && onToggleAdminVoiceVisibility('ja')}
                                    className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs ${
                                        !showJapaneseSettings
                                            ? 'bg-rose-600 hover:bg-rose-700 text-white'
                                            : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200'
                                    }`}
                                >
                                    {!showJapaneseSettings ? 'Mở cho học viên' : 'Ẩn với học viên'}
                                </button>
                            </div>
                        )}

                        {/* Voice Selection */}
                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-gray-600 dark:text-slate-300 mb-2">
                                Giọng đọc Tiếng Nhật (Japanese Voice)
                            </label>
                            {japaneseVoices.length > 0 ? (
                                <select
                                    className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 text-sm font-semibold dark:text-white transition-colors cursor-pointer"
                                    value={selectedJapaneseVoice || ''}
                                    onChange={(e) => setSelectedJapaneseVoice && setSelectedJapaneseVoice(e.target.value)}
                                >
                                    {japaneseVoices.map(voice => (
                                        <option key={voice.voiceURI} value={voice.voiceURI}>
                                            {voice.name} ({voice.lang})
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl text-xs space-y-2 text-amber-800 dark:text-amber-300">
                                    <div className="flex items-center gap-2 font-black">
                                        <AlertCircle size={16} className="text-amber-600 shrink-0" />
                                        <span>Chưa phát hiện giọng Tiếng Nhật riêng biệt trên máy</span>
                                    </div>
                                    <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-400">
                                        Trình duyệt sẽ tự động kích hoạt bộ chuyển ngữ dự phòng để phát âm. Để có chất lượng giọng đọc tự nhiên chuẩn Tokyo:
                                    </p>
                                    <div className="bg-white/70 dark:bg-slate-900/70 p-2.5 rounded-xl text-[11px] text-gray-700 dark:text-slate-300 space-y-1 font-medium">
                                        <div>1. Mở <strong>Windows Settings</strong> &gt; <strong>Time &amp; Language</strong> &gt; <strong>Speech</strong></div>
                                        <div>2. Tại mục <i>Manage voices</i>, nhấn <strong>Add voices</strong></div>
                                        <div>3. Tìm và tải gói <strong>Japanese (Japan)</strong></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Speech Rate Slider for Japanese */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-xs font-black uppercase tracking-wider text-gray-600 dark:text-slate-300">
                                    Tốc độ đọc Tiếng Nhật
                                </label>
                                <span className="px-2 py-0.5 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 text-xs font-black">
                                    {japaneseSpeechRate}x
                                </span>
                            </div>
                            <input
                                type="range"
                                min="0.5"
                                max="1.5"
                                step="0.05"
                                value={japaneseSpeechRate}
                                onChange={(e) => setJapaneseSpeechRate && setJapaneseSpeechRate(parseFloat(e.target.value))}
                                className="w-full accent-rose-600 cursor-pointer h-2 bg-gray-200 dark:bg-slate-700 rounded-lg"
                            />
                            <div className="flex justify-between text-[11px] font-bold text-gray-400 dark:text-slate-500 mt-1">
                                <span>Rất chậm (0.5x)</span>
                                <span>Khuyên dùng (0.8x - 0.9x)</span>
                                <span>Bình thường (1.0x)</span>
                            </div>
                        </div>

                        <div className="p-3 bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-2xl flex items-start gap-2.5">
                            <Info size={16} className="text-rose-500 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-gray-600 dark:text-slate-300 leading-relaxed font-medium">
                                💡 Đối với từ vựng Minna no Nihongo (Hiragana, Kanji, Romaji), phát âm ở tốc độ <strong>0.85x</strong> giúp người học nghe rõ từng trường âm và âm ngắt (っ).
                            </p>
                        </div>

                        {/* Test Japanese Button */}
                        <button
                            onClick={handleTestJapaneseVoice}
                            className="w-full py-3 px-4 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-black rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-rose-500/25 cursor-pointer"
                        >
                            <Volume2 size={18} />
                            <span>Nghe thử Tiếng Nhật ("こんにちは、日本語の...")</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VoiceSettings;
