import React, { useState, useEffect, useRef } from 'react';
import {
    Layers, Keyboard, Mic, ArrowRight, ArrowLeft, CheckCircle2,
    Trophy, Sparkles, RefreshCw, Flame, Check, Volume2, HelpCircle,
    Eye, EyeOff, AlertCircle, Command
} from 'lucide-react';
import { isAnswerCorrect } from '../utils/answerChecker';

export default function Sequential3StepMode({ words = [], speak, onExit }) {
    const [wordIndex, setWordIndex] = useState(0);
    // microStep: 1 = Flashcard | 2 = Nghe Viết (Dictation) | 3 = Gõ Từ (Typing)
    const [microStep, setMicroStep] = useState(1);
    const [isCompleted, setIsCompleted] = useState(false);

    // Flashcard state
    const [isFlipped, setIsFlipped] = useState(false);

    // Dictation (Step 2) state
    const [dictationInput, setDictationInput] = useState('');
    const [dictationStatus, setDictationStatus] = useState('idle'); // 'idle' | 'correct' | 'wrong'
    const [showDictationHint, setShowDictationHint] = useState(false);
    const dictationRef = useRef(null);

    // Typing (Step 3) state
    const [typingInput, setTypingInput] = useState('');
    const [typingStatus, setTypingStatus] = useState('idle'); // 'idle' | 'correct' | 'wrong'
    const typingRef = useRef(null);

    // Completed words tracking
    const [masteredIndices, setMasteredIndices] = useState([]);
    const [showShortcuts, setShowShortcuts] = useState(false);

    const currentWord = words[wordIndex] || {};
    const isJapanese = Boolean(
        currentWord.isJapanese ||
        currentWord.master_group === 'Từ Vựng Tiếng Nhật Minna No Nihongo' ||
        /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/.test(currentWord.en || '')
    );
    const speechTarget = currentWord.speechText || currentWord.hiragana || currentWord.kanji || currentWord.en;

    const renderCategoryBadge = (cat, isFlippedCard = false) => {
        if (!cat) return null;
        const lower = cat.toLowerCase();
        let bg = isFlippedCard ? 'bg-white/20 text-white border-white/30' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
        if (lower.includes('danh')) bg = isFlippedCard ? 'bg-white/20 text-white border-white/30' : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
        if (lower.includes('động') || lower.includes('(v)')) bg = isFlippedCard ? 'bg-white/20 text-white border-white/30' : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
        if (lower.includes('tính') || lower.includes('adj')) bg = isFlippedCard ? 'bg-white/20 text-white border-white/30' : 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
        if (lower.includes('trạng') || lower.includes('adv')) bg = isFlippedCard ? 'bg-white/20 text-white border-white/30' : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';

        return (
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-sm ${bg}`}>
                {cat}
            </span>
        );
    };

    // Web Audio subtle sound
    const playSuccessSound = () => {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, ctx.currentTime);
            osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.35);
        } catch (e) {}
    };

    // Reset when words prop changes
    useEffect(() => {
        setWordIndex(0);
        setMicroStep(1);
        setIsCompleted(false);
        setIsFlipped(false);
        setDictationInput('');
        setDictationStatus('idle');
        setShowDictationHint(false);
        setTypingInput('');
        setTypingStatus('idle');
        setMasteredIndices([]);
    }, [words]);

    // Focus input or play audio when step changes
    useEffect(() => {
        setIsFlipped(false);
        setDictationInput('');
        setDictationStatus('idle');
        setShowDictationHint(false);
        setTypingInput('');
        setTypingStatus('idle');

        if (microStep === 1 && speechTarget && speak) {
            speak(speechTarget);
        } else if (microStep === 2) {
            if (speechTarget && speak) {
                speak(speechTarget);
            }
            setTimeout(() => {
                dictationRef.current?.focus();
            }, 100);
        } else if (microStep === 3) {
            setTimeout(() => {
                typingRef.current?.focus();
            }, 100);
        }
    }, [wordIndex, microStep]);

    // Keyboard shortcuts handler
    useEffect(() => {
        const handleKeyDown = (e) => {
            const isInputFocused = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';

            // Global shortcut: Ctrl+Space or Alt+P -> Play audio anytime
            if ((e.ctrlKey && e.code === 'Space') || (e.altKey && e.key.toLowerCase() === 'p')) {
                e.preventDefault();
                if (speechTarget && speak) speak(speechTarget);
                return;
            }

            // Shortcuts when NOT typing inside an input field
            if (!isInputFocused) {
                if (e.code === 'Space') {
                    e.preventDefault();
                    if (microStep === 1) {
                        setIsFlipped(prev => !prev);
                    } else if (speechTarget && speak) {
                        speak(speechTarget);
                    }
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    if (microStep === 1) {
                        setMicroStep(2); // Sang Nghe Viết
                    }
                } else if (e.key === '1') {
                    e.preventDefault();
                    setMicroStep(1);
                } else if (e.key === '2') {
                    e.preventDefault();
                    setMicroStep(2);
                } else if (e.key === '3') {
                    e.preventDefault();
                    setMicroStep(3);
                } else if (e.key.toLowerCase() === 'p') {
                    e.preventDefault();
                    if (speechTarget && speak) speak(speechTarget);
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    if (microStep < 3) {
                        setMicroStep(prev => prev + 1);
                    } else if (wordIndex < words.length - 1) {
                        setWordIndex(prev => prev + 1);
                        setMicroStep(1);
                    }
                } else if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    if (microStep > 1) {
                        setMicroStep(prev => prev - 1);
                    } else if (wordIndex > 0) {
                        setWordIndex(prev => prev - 1);
                        setMicroStep(1);
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [microStep, wordIndex, words.length, currentWord, speechTarget, speak]);

    // Step 2: Handle check Dictation (Nghe Viết)
    const handleCheckDictation = (e) => {
        if (e) e.preventDefault();
        if (!currentWord.en && !currentWord.hiragana) return;

        if (isAnswerCorrect(dictationInput, currentWord)) {
            setDictationStatus('correct');
            playSuccessSound();
            setTimeout(() => {
                setMicroStep(3); // Chuyển tiếp sang Bước 3: Gõ Từ
            }, 800);
        } else {
            setDictationStatus('wrong');
            setTimeout(() => setDictationStatus('idle'), 1200);
        }
    };

    // Step 3: Handle check Typing (Gõ Từ)
    const handleCheckTyping = (e) => {
        if (e) e.preventDefault();
        if (!currentWord.en && !currentWord.hiragana) return;

        if (isAnswerCorrect(typingInput, currentWord)) {
            setTypingStatus('correct');
            playSuccessSound();

            if (!masteredIndices.includes(wordIndex)) {
                setMasteredIndices(prev => [...prev, wordIndex]);
            }

            setTimeout(() => {
                if (wordIndex < words.length - 1) {
                    setWordIndex(prev => prev + 1);
                    setMicroStep(1);
                } else {
                    setIsCompleted(true);
                }
            }, 1000);
        } else {
            setTypingStatus('wrong');
            setTimeout(() => setTypingStatus('idle'), 1200);
        }
    };

    // Advance manually
    const advanceToNextWord = () => {
        if (!masteredIndices.includes(wordIndex)) {
            setMasteredIndices(prev => [...prev, wordIndex]);
        }
        if (wordIndex < words.length - 1) {
            setWordIndex(prev => prev + 1);
            setMicroStep(1);
        } else {
            setIsCompleted(true);
        }
    };

    if (!words || words.length === 0) {
        return (
            <div className="max-w-3xl mx-auto p-12 bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 text-center space-y-4">
                <HelpCircle size={48} className="mx-auto text-gray-400" />
                <h3 className="text-lg font-bold text-gray-800 dark:text-slate-200">
                    Chưa có từ vựng nào được chọn
                </h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                    Vui lòng chọn một nhóm từ vựng để bắt đầu học Từng từ một (1. Flashcard ➔ 2. Nghe Viết ➔ 3. Gõ Từ).
                </p>
                {onExit && (
                    <button
                        onClick={onExit}
                        className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition cursor-pointer"
                    >
                        Quay lại danh sách
                    </button>
                )}
            </div>
        );
    }

    if (isCompleted) {
        return (
            <div className="max-w-3xl mx-auto p-8 md:p-12 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 rounded-3xl text-white shadow-2xl text-center space-y-8 animate-fade-in border border-white/10">
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-amber-400/20 blur-3xl rounded-full" />
                    <div className="relative w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                        <Trophy size={48} className="text-white animate-bounce" />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-black tracking-wide">
                        <Sparkles size={14} />
                        <span>HOÀN THÀNH CHUYÊN SÂU TỪNG TỪ</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black">
                        Chúc Mừng Bạn Đã Làm Chủ Toàn Bộ {words.length} Từ Vựng!
                    </h2>
                    <p className="text-sm text-purple-200 max-w-md mx-auto">
                        Mỗi từ đều đã được củng cố theo quy trình chuẩn: <span className="text-amber-300 font-bold">1. Flashcard ➔ 2. Nghe Viết ➔ 3. Gõ Từ</span>.
                    </p>
                </div>

                <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
                    <div className="bg-white/10 p-4 rounded-2xl border border-white/10 text-center">
                        <div className="text-2xl font-black text-emerald-400">{words.length}</div>
                        <div className="text-[11px] text-purple-200 uppercase font-bold">Từ vựng đã thuộc</div>
                    </div>
                    <div className="bg-white/10 p-4 rounded-2xl border border-white/10 text-center">
                        <div className="text-2xl font-black text-amber-300">3/3</div>
                        <div className="text-[11px] text-purple-200 uppercase font-bold">Bước mỗi từ</div>
                    </div>
                    <div className="bg-white/10 p-4 rounded-2xl border border-white/10 text-center">
                        <div className="text-2xl font-black text-blue-300">100%</div>
                        <div className="text-[11px] text-purple-200 uppercase font-bold">Hoàn thành</div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                    <button
                        onClick={() => {
                            setWordIndex(0);
                            setMicroStep(1);
                            setIsCompleted(false);
                            setMasteredIndices([]);
                        }}
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition cursor-pointer"
                    >
                        <RefreshCw size={16} />
                        <span>Luyện lại từ đầu</span>
                    </button>

                    {onExit && (
                        <button
                            onClick={onExit}
                            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs shadow-lg transition cursor-pointer"
                        >
                            <span>Quay lại danh sách từ vựng</span>
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto animate-fade-in pb-12">
            {/* 1. Header Banner & Overall Word Progress Bar */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white shadow-md">
                            <Flame size={20} />
                        </div>
                        <div>
                            <h2 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                                <span>Học Chuyên Sâu Từng Từ Một</span>
                                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                                    Từ {wordIndex + 1} / {words.length}
                                </span>
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">
                                Quy trình chuẩn cho từng từ: 1. Flashcard ➔ 2. Nghe Viết ➔ 3. Gõ Từ
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowShortcuts(!showShortcuts)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold hover:bg-purple-100 transition cursor-pointer"
                        >
                            <Command size={14} />
                            <span>Phím tắt</span>
                        </button>

                        {onExit && (
                            <button
                                onClick={onExit}
                                className="text-xs font-bold px-4 py-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-200 transition cursor-pointer"
                            >
                                Thoát chế độ
                            </button>
                        )}
                    </div>
                </div>

                {/* Keyboard shortcuts drawer */}
                {showShortcuts && (
                    <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-purple-900/10 to-blue-900/10 dark:bg-slate-800/80 border border-purple-200 dark:border-purple-800/40 text-xs space-y-2 animate-fade-in">
                        <div className="font-black text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                            <Command size={14} /> Danh sách Phím tắt giúp học siêu nhanh:
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-gray-700 dark:text-slate-300">
                            <div><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border font-mono font-bold">Space</kbd> Lật thẻ / Nghe phát âm</div>
                            <div><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border font-mono font-bold">Enter</kbd> Kiểm tra / Chuyển tiếp</div>
                            <div><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border font-mono font-bold">1</kbd> <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border font-mono font-bold">2</kbd> <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border font-mono font-bold">3</kbd> Chọn nhanh 3 bước</div>
                            <div><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border font-mono font-bold">←</kbd> <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border font-mono font-bold">→</kbd> Chuyển từ trước/sau</div>
                        </div>
                    </div>
                )}

                {/* Progress bar across all words */}
                <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-600 dark:text-slate-400">
                        <span>Tiến độ tổng thể</span>
                        <span>{Math.round(((wordIndex) / words.length) * 100)}% ({masteredIndices.length} từ đã thuộc)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
                            style={{ width: `${((wordIndex) / words.length) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Word Navigation Pills */}
                <div className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-1">
                    {words.map((w, idx) => {
                        const isMastered = masteredIndices.includes(idx);
                        const isCurrent = idx === wordIndex;
                        return (
                            <button
                                key={idx}
                                onClick={() => {
                                    setWordIndex(idx);
                                    setMicroStep(1);
                                }}
                                title={w.en}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 transition cursor-pointer flex items-center gap-1 ${
                                    isCurrent
                                        ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-300 scale-105'
                                        : isMastered
                                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                            : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-200'
                                }`}
                            >
                                <span>#{idx + 1}</span>
                                {isMastered && <Check size={12} />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 2. Micro-Step 3-Stage Stepper for currentWord */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    <button
                        onClick={() => setMicroStep(1)}
                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-bold text-xs sm:text-sm transition cursor-pointer ${
                            microStep === 1
                                ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                                : microStep > 1
                                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-300/60'
                                    : 'bg-gray-50 dark:bg-slate-800/60 text-gray-500 dark:text-slate-400 border-gray-200 dark:border-slate-800'
                        }`}
                    >
                        {microStep > 1 ? <Check size={16} /> : <Layers size={16} />}
                        <span>1. Flashcard</span>
                    </button>

                    <button
                        onClick={() => setMicroStep(2)}
                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-bold text-xs sm:text-sm transition cursor-pointer ${
                            microStep === 2
                                ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                                : microStep > 2
                                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-300/60'
                                    : 'bg-gray-50 dark:bg-slate-800/60 text-gray-500 dark:text-slate-400 border-gray-200 dark:border-slate-800'
                        }`}
                    >
                        {microStep > 2 ? <Check size={16} /> : <Mic size={16} />}
                        <span>2. Nghe Viết</span>
                    </button>

                    <button
                        onClick={() => setMicroStep(3)}
                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-bold text-xs sm:text-sm transition cursor-pointer ${
                            microStep === 3
                                ? 'bg-amber-500 text-white border-amber-500 shadow-md'
                                : 'bg-gray-50 dark:bg-slate-800/60 text-gray-500 dark:text-slate-400 border-gray-200 dark:border-slate-800'
                        }`}
                    >
                        <Keyboard size={16} />
                        <span>3. Gõ Từ</span>
                    </button>
                </div>
            </div>

            {/* 3. MICRO-STEP 1: FLASHCARD */}
            {microStep === 1 && (
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm text-center space-y-8">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                            Bước 1/3: Ghi Nhớ Mặt Chữ & Nghĩa
                        </span>

                        <button
                            onClick={() => speak && speak(currentWord.en)}
                            className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                        >
                            <Volume2 size={16} /> Nghe phát âm <kbd className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900 text-[10px] font-mono">P</kbd>
                        </button>
                    </div>

                    {/* Interactive Flashcard Card */}
                    <div
                        onClick={() => setIsFlipped(!isFlipped)}
                        className={`min-h-[260px] rounded-3xl p-8 border-2 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center select-none shadow-md ${
                            isFlipped
                                ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-blue-500'
                                : 'bg-gray-50/80 dark:bg-slate-800/60 text-gray-900 dark:text-white border-gray-200 dark:border-slate-700 hover:border-blue-400'
                        }`}
                    >
                        {!isFlipped ? (
                            <div className="space-y-4">
                                <span className="text-xs uppercase font-black tracking-widest text-gray-400 dark:text-slate-400 block">
                                    Nhấn hoặc phím [Space] để lật thẻ
                                </span>
                                {renderCategoryBadge(currentWord.category, false)}
                                <h3 className="text-4xl sm:text-5xl font-black tracking-tight">
                                    {currentWord.en}
                                </h3>
                                {currentWord.ipa && (
                                    <p className="text-base font-mono text-gray-500 dark:text-slate-400">
                                        {currentWord.ipa}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4 max-w-xl">
                                <span className="text-xs uppercase font-black tracking-widest text-blue-200 block">
                                    Nghĩa tiếng Việt
                                </span>
                                {renderCategoryBadge(currentWord.category, true)}
                                <h4 className="text-3xl sm:text-4xl font-black">
                                    {currentWord.vi}
                                </h4>
                                {currentWord.en && (
                                    <p className="text-sm text-blue-100 font-semibold">
                                        {currentWord.en} {currentWord.ipa && `(${currentWord.ipa})`}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Action navigation */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100 dark:border-slate-800">
                        <button
                            onClick={() => setIsFlipped(!isFlipped)}
                            className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 font-bold text-xs hover:bg-gray-200 transition cursor-pointer"
                        >
                            {isFlipped ? (isJapanese ? 'Quay mặt tiếng Nhật [Space]' : 'Quay mặt tiếng Anh [Space]') : 'Lật xem tiếng Việt [Space]'}
                        </button>

                        <button
                            onClick={() => setMicroStep(2)}
                            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg transition cursor-pointer ml-auto"
                        >
                            <span>Đã Nhớ ➔ Bước 2: Nghe Viết</span>
                            <kbd className="px-1.5 py-0.5 rounded bg-blue-700 text-white text-[10px] font-mono">Enter</kbd>
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* 4. MICRO-STEP 2: NGHE VIẾT (DICTATION) */}
            {microStep === 2 && (
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-purple-700 bg-purple-50 dark:bg-purple-900/30 px-3 py-1 rounded-full">
                            Bước 2/3: Luyện Nghe Viết Phản Xạ
                        </span>

                        <button
                            onClick={() => setMicroStep(1)}
                            className="text-xs font-bold text-gray-500 hover:text-gray-800 dark:hover:text-white transition cursor-pointer"
                        >
                            ← Xem lại Flashcard
                        </button>
                    </div>

                    {/* Audio play button */}
                    <div className="text-center space-y-4">
                        <button
                            onClick={() => speak && speak(speechTarget)}
                            className="mx-auto p-6 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 hover:scale-110 active:scale-95 transition shadow-lg cursor-pointer"
                            title="Nghe lại âm thanh (Ctrl+Space)"
                        >
                            <Volume2 size={40} />
                        </button>

                        <div className="flex justify-center">
                            {renderCategoryBadge(currentWord.category)}
                        </div>

                        <p className="text-xs font-bold text-gray-500 dark:text-slate-400">
                            Nhấn để nghe phát âm và gõ lại từ {isJapanese ? 'tiếng Nhật' : 'tiếng Anh'} <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-800 text-[10px] font-mono">Ctrl+Space</kbd>
                        </p>

                        {showDictationHint && (
                            <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 max-w-sm mx-auto text-xs font-semibold text-gray-700 dark:text-slate-300">
                                Nghĩa tiếng Việt: <span className="font-bold text-purple-600 dark:text-purple-400">{currentWord.vi}</span>
                            </div>
                        )}
                    </div>

                    {/* Dictation Form */}
                    <form onSubmit={handleCheckDictation} className="max-w-md mx-auto space-y-4">
                        <div className="relative">
                            <input
                                ref={dictationRef}
                                type="text"
                                placeholder={isJapanese ? "Lắng nghe & gõ tiếng Nhật (Hiragana, Kanji hoặc Romaji)..." : "Lắng nghe & gõ từ vựng tiếng Anh..."}
                                value={dictationInput}
                                onChange={(e) => setDictationInput(e.target.value)}
                                className={`w-full px-5 py-4 rounded-2xl text-center text-lg font-bold border-2 outline-none transition ${
                                    dictationStatus === 'correct'
                                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400'
                                        : dictationStatus === 'wrong'
                                            ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 animate-shake'
                                            : 'border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/60 text-gray-900 dark:text-white focus:border-purple-500'
                                }`}
                                autoFocus
                            />
                        </div>

                        {dictationStatus === 'correct' && (
                            <div className="flex items-center justify-center gap-2 text-sm font-black text-emerald-600 dark:text-emerald-400 animate-bounce">
                                <Check size={18} /> Tuyệt vời! Đang sang Bước 3: Gõ Từ...
                            </div>
                        )}

                        {dictationStatus === 'wrong' && (
                            <div className="flex items-center justify-center gap-2 text-xs font-bold text-rose-500">
                                <AlertCircle size={16} /> Chưa chính xác với âm thanh! Hãy nghe kỹ lại nhé.
                            </div>
                        )}

                        <div className="flex items-center gap-3">
                            <button
                                type="submit"
                                className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                            >
                                <span>Kiểm tra Nghe Viết</span>
                                <kbd className="px-1.5 py-0.5 rounded bg-purple-700 text-white text-[10px] font-mono">Enter</kbd>
                            </button>
                        </div>
                    </form>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-slate-800 text-xs">
                        <button
                            onClick={() => setShowDictationHint(!showDictationHint)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 font-bold transition cursor-pointer flex items-center gap-1"
                        >
                            {showDictationHint ? <EyeOff size={14} /> : <Eye size={14} />}
                            <span>{showDictationHint ? 'Ẩn gợi ý nghĩa' : 'Gợi ý nghĩa tiếng Việt'}</span>
                        </button>

                        <button
                            onClick={() => setMicroStep(3)}
                            className="text-purple-600 hover:text-purple-700 font-bold transition cursor-pointer flex items-center gap-1"
                        >
                            <span>Bỏ qua sang Bước 3</span>
                            <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            )}

            {/* 5. MICRO-STEP 3: TYPING (GÕ TỪ VỰNG) */}
            {microStep === 3 && (
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-amber-700 bg-amber-50 dark:bg-amber-900/30 px-3 py-1 rounded-full">
                            Bước 3/3: Luyện Gõ Từ & Dịch Nghĩa
                        </span>

                        <button
                            onClick={() => setMicroStep(2)}
                            className="text-xs font-bold text-gray-500 hover:text-gray-800 dark:hover:text-white transition cursor-pointer"
                        >
                            ← Quay lại Nghe Viết
                        </button>
                    </div>

                    <div className="text-center space-y-3">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            {isJapanese ? "Dịch sang tiếng Nhật" : "Dịch sang tiếng Anh"}
                        </p>
                        <div className="flex justify-center">
                            {renderCategoryBadge(currentWord.category)}
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                            {currentWord.vi}
                        </h3>
                        {currentWord.ipa && (
                            <p className="text-sm font-mono text-gray-400 dark:text-slate-500">
                                Phát âm: {currentWord.ipa}
                            </p>
                        )}
                    </div>

                    {/* Form input */}
                    <form onSubmit={handleCheckTyping} className="max-w-md mx-auto space-y-4">
                        <div className="relative">
                            <input
                                ref={typingRef}
                                type="text"
                                placeholder={isJapanese ? "Gõ Hiragana, Kanji hoặc Romaji..." : "Gõ từ tiếng Anh vào đây..."}
                                value={typingInput}
                                onChange={(e) => setTypingInput(e.target.value)}
                                className={`w-full px-5 py-4 rounded-2xl text-center text-lg font-bold border-2 outline-none transition ${
                                    typingStatus === 'correct'
                                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400'
                                        : typingStatus === 'wrong'
                                            ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 animate-shake'
                                            : 'border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/60 text-gray-900 dark:text-white focus:border-amber-500'
                                }`}
                                autoFocus
                            />
                        </div>

                        {typingStatus === 'correct' && (
                            <div className="flex items-center justify-center gap-2 text-sm font-black text-emerald-600 dark:text-emerald-400 animate-bounce">
                                <Check size={18} /> Xuất sắc! Hoàn thành trọn vẹn từ vựng #{wordIndex + 1}!
                            </div>
                        )}

                        {typingStatus === 'wrong' && (
                            <div className="flex items-center justify-center gap-2 text-xs font-bold text-rose-500">
                                <AlertCircle size={16} /> {isJapanese ? `Chưa chính xác, hãy thử lại! (Gợi ý: ${currentWord.hiragana || currentWord.kanji || currentWord.en})` : `Chưa chính xác, hãy thử lại! (Gợi ý chữ đầu: ${currentWord.en?.[0]?.toUpperCase()})`}
                            </div>
                        )}

                        <div className="flex items-center gap-3">
                            <button
                                type="submit"
                                className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                            >
                                <span>Hoàn thành & Sang từ tiếp theo</span>
                                <kbd className="px-1.5 py-0.5 rounded bg-amber-600 text-white text-[10px] font-mono">Enter</kbd>
                            </button>
                        </div>
                    </form>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-slate-800 text-xs">
                        <button
                            onClick={() => setTypingInput(currentWord.hiragana || currentWord.kanji || currentWord.en || '')}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 font-bold transition cursor-pointer"
                        >
                            Xem đáp án
                        </button>

                        <button
                            onClick={advanceToNextWord}
                            className="text-blue-600 hover:text-blue-700 font-bold transition cursor-pointer flex items-center gap-1"
                        >
                            <span>Sang từ tiếp theo (#{wordIndex + 2})</span>
                            <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            )}

            {/* Bottom quick control */}
            <div className="flex items-center justify-between px-2">
                <button
                    onClick={() => {
                        if (wordIndex > 0) {
                            setWordIndex(wordIndex - 1);
                            setMicroStep(1);
                        }
                    }}
                    disabled={wordIndex === 0}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-xs font-bold disabled:opacity-40 transition cursor-pointer"
                >
                    <ArrowLeft size={14} /> Từ trước [←]
                </button>

                <button
                    onClick={advanceToNextWord}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition cursor-pointer"
                >
                    <span>Từ tiếp theo ({wordIndex + 1}/{words.length}) [→]</span>
                    <ArrowRight size={14} />
                </button>
            </div>
        </div>
    );
}
