import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Trophy, Volume2, HelpCircle, Heart, CheckCircle2, XCircle, ArrowRight, Sparkles, Rocket } from 'lucide-react';

const MAX_WRONG = 6;
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function HangmanGame({ words, speak }) {
    const [targetWord, setTargetWord] = useState(null);
    const [guessedLetters, setGuessedLetters] = useState(new Set());
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [hintsUsed, setHintsUsed] = useState(0);

    const nextWord = useCallback(() => {
        if (!words || words.length === 0) return;
        
        const validWords = words
            .filter(w => w.en && w.vi)
            .map(w => ({
                ...w,
                cleanEn: w.en.replace(/\(.*?\)/g, '').trim(),
            }))
            .filter(w => /[a-zA-Z]/.test(w.cleanEn));

        if (validWords.length === 0) return;

        const randomWord = validWords[Math.floor(Math.random() * validWords.length)];
        setTargetWord(randomWord);
        setGuessedLetters(new Set());
        setHintsUsed(0);
    }, [words]);

    useEffect(() => {
        nextWord();
    }, [nextWord]);

    const targetClean = targetWord ? targetWord.cleanEn.toLowerCase() : '';

    const wrongGuesses = targetWord
        ? Array.from(guessedLetters).filter(letter => !targetClean.includes(letter)).length
        : 0;

    const isWon = targetWord && targetClean
        .split('')
        .filter(char => /[a-zA-Z]/.test(char))
        .every(char => guessedLetters.has(char));

    const isLost = wrongGuesses >= MAX_WRONG;

    useEffect(() => {
        if (isWon && targetWord) {
            speak(targetWord.cleanEn);
            setScore(s => s + 20 + Math.max(0, (MAX_WRONG - wrongGuesses) * 5));
            setStreak(st => st + 1);
        } else if (isLost && targetWord) {
            setStreak(0);
        }
    }, [isWon, isLost]); // eslint-disable-line react-hooks/exhaustive-deps

    const guessLetter = useCallback((char) => {
        const lower = char.toLowerCase();
        if (isWon || isLost || guessedLetters.has(lower)) return;

        setGuessedLetters(prev => {
            const updated = new Set(prev);
            updated.add(lower);
            return updated;
        });
    }, [isWon, isLost, guessedLetters]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            const key = e.key.toUpperCase();
            if (ALPHABET.includes(key)) {
                guessLetter(key);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [guessLetter]);

    const useHint = () => {
        if (!targetWord || isWon || isLost || hintsUsed >= 2) return;
        const unrevealedLetters = targetClean
            .split('')
            .filter(c => /[a-zA-Z]/.test(c) && !guessedLetters.has(c));

        if (unrevealedLetters.length > 0) {
            const randomChar = unrevealedLetters[Math.floor(Math.random() * unrevealedLetters.length)];
            guessLetter(randomChar);
            setHintsUsed(h => h + 1);
        }
    };

    if (!words || words.length === 0 || !targetWord) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200 dark:border-slate-800">
                <HelpCircle size={56} className="text-cyan-400 mb-4 animate-spin" />
                <h2 className="text-xl font-bold text-gray-600 dark:text-slate-300">Đang chuẩn bị phi thuyền...</h2>
            </div>
        );
    }

    const livesLeft = Math.max(0, MAX_WRONG - wrongGuesses);

    return (
        <div className="max-w-3xl mx-auto space-y-4 md:space-y-6 animate-fade-in pb-16">
            {/* Top Bar: Spaceman Theme */}
            <div className="bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-violet-500/10 dark:from-cyan-950/40 dark:via-indigo-950/40 dark:to-violet-950/40 p-4 md:p-5 rounded-3xl border border-cyan-200/50 dark:border-cyan-800/40 backdrop-blur-xl shadow-lg flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-6 px-2">
                    {/* Lives (Oxygen tanks / Hearts) */}
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black tracking-widest uppercase text-cyan-600 dark:text-cyan-400 mr-1">Oxy:</span>
                        {[...Array(MAX_WRONG)].map((_, i) => (
                            <div
                                key={i}
                                className={`w-4 h-6 rounded-md transition-all duration-300 ${
                                    i < livesLeft
                                        ? 'bg-gradient-to-t from-cyan-500 to-blue-400 shadow-sm shadow-cyan-500/50 scale-100'
                                        : 'bg-gray-200 dark:bg-slate-800 opacity-30 scale-90'
                                }`}
                            />
                        ))}
                    </div>

                    <div className="w-px h-8 bg-cyan-200 dark:bg-cyan-800/40 hidden sm:block"></div>

                    {/* Score */}
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black tracking-widest uppercase text-gray-400 dark:text-slate-400">Điểm</span>
                        <span className="text-2xl font-black text-cyan-600 dark:text-cyan-400 leading-none">{score}</span>
                    </div>

                    {streak > 1 && (
                        <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full font-black text-xs shadow-md shadow-orange-500/20 animate-bounce">
                            🚀 x{streak}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={useHint}
                        disabled={isWon || isLost || hintsUsed >= 2}
                        className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-slate-700 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-700/50 rounded-2xl font-black text-xs flex items-center gap-1.5 transition disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed shadow-sm"
                    >
                        <HelpCircle size={15} /> Gợi ý ({2 - hintsUsed})
                    </button>
                    <button
                        onClick={nextWord}
                        className="p-2.5 bg-white dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-slate-700 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800/50 rounded-2xl transition cursor-pointer shadow-sm active:scale-95"
                        title="Đổi từ khác"
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>
            </div>

            {/* Main Stage: Vector Astronaut Scene */}
            <div className="bg-white dark:bg-slate-900 p-5 md:p-8 rounded-3xl shadow-xl border border-gray-200 dark:border-slate-800 transition-colors">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    {/* Space Rescue Graphic */}
                    <div className="md:col-span-5 flex justify-center items-center">
                        <div className="relative w-48 h-56 bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 rounded-3xl p-4 flex flex-col items-center justify-between border-2 border-indigo-900/60 shadow-xl overflow-hidden">
                            {/* Stars background */}
                            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(white_1px,transparent_1px)] [background-size:12px_12px]"></div>

                            {/* Rescue Ship Top */}
                            <div className="relative z-10 flex items-center gap-1 text-cyan-400 text-xs font-black">
                                <Rocket size={18} className="animate-pulse text-cyan-400" /> TRẠM GIẢI CỨU
                            </div>

                            {/* Astronaut SVG */}
                            <svg viewBox="0 0 160 160" className="w-32 h-32 relative z-10 animate-float">
                                {/* Tether Cable */}
                                <path 
                                    d="M 80 0 Q 70 30, 80 50" 
                                    fill="none" 
                                    stroke={wrongGuesses >= 5 ? '#ef4444' : '#38bdf8'} 
                                    strokeWidth="3" 
                                    strokeDasharray={wrongGuesses >= 4 ? "4,4" : "none"} 
                                />

                                {/* Backpack Jetpack */}
                                <rect x="52" y="58" width="56" height="42" rx="8" fill="#475569" stroke="#94a3b8" strokeWidth="2" />
                                {wrongGuesses < 3 && (
                                    <polygon points="58,100 66,114 62,100" fill="#f59e0b" className="animate-pulse" />
                                )}
                                {wrongGuesses < 4 && (
                                    <polygon points="98,100 106,114 102,100" fill="#f59e0b" className="animate-pulse" />
                                )}

                                {/* Astronaut Suit Body */}
                                <ellipse cx="80" cy="85" rx="22" ry="24" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="3" />

                                {/* Helmet */}
                                <circle cx="80" cy="52" r="22" fill="#ffffff" stroke="#94a3b8" strokeWidth="3" />
                                <ellipse 
                                    cx="80" 
                                    cy="52" 
                                    rx="14" 
                                    ry="11" 
                                    fill={wrongGuesses >= 6 ? '#ef4444' : isWon ? '#10b981' : '#0284c7'} 
                                    stroke="#38bdf8" 
                                    strokeWidth="2" 
                                />

                                {/* Arms */}
                                <line x1="60" y1="75" x2="42" y2="90" stroke="#f1f5f9" strokeWidth="7" strokeLinecap="round" />
                                <line x1="100" y1="75" x2="118" y2="90" stroke="#f1f5f9" strokeWidth="7" strokeLinecap="round" />

                                {/* Legs */}
                                <line x1="70" y1="105" x2="65" y2="130" stroke="#f1f5f9" strokeWidth="7" strokeLinecap="round" />
                                <line x1="90" y1="105" x2="95" y2="130" stroke="#f1f5f9" strokeWidth="7" strokeLinecap="round" />
                            </svg>

                            {/* Status label */}
                            <div className="relative z-10 text-[10px] font-black uppercase tracking-wider text-center">
                                {isWon ? (
                                    <span className="text-emerald-400">ĐÃ GIẢI CỨU THÀNH CÔNG!</span>
                                ) : isLost ? (
                                    <span className="text-rose-400">MẤT KẾT NỐI TÀU!</span>
                                ) : (
                                    <span className="text-cyan-300">CÒN {livesLeft} BÌNH OXY</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Word Clues & 3D Letter Slots */}
                    <div className="md:col-span-7 flex flex-col items-center md:items-start text-center md:text-left space-y-3">
                        <div>
                            {targetWord.category && (
                                <span className="inline-block px-3 py-1 bg-gradient-to-r from-cyan-500/15 to-blue-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800/40 text-xs font-black rounded-full mb-1.5">
                                    {targetWord.category}
                                </span>
                            )}
                            <h3 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white leading-tight">
                                {targetWord.vi}
                            </h3>
                            {targetWord.ipa && (isWon || isLost) && (
                                <p className="text-sm font-mono text-gray-400 dark:text-slate-500 mt-1">
                                    {targetWord.ipa}
                                </p>
                            )}
                        </div>

                        {/* Letter Slots */}
                        <div className="flex flex-wrap gap-1.5 md:gap-2 justify-center md:justify-start pt-2">
                            {targetWord.cleanEn.split('').map((char, index) => {
                                const isAlpha = /[a-zA-Z]/.test(char);
                                const isGuessed = guessedLetters.has(char.toLowerCase());
                                const displayChar = !isAlpha ? char : ((isGuessed || isLost) ? char : '');

                                return (
                                    <div
                                        key={index}
                                        className={`w-9 h-12 md:w-11 md:h-14 flex items-center justify-center font-black text-xl md:text-2xl rounded-2xl border-b-4 transition-all shadow-sm ${
                                            !isAlpha
                                                ? 'border-transparent text-gray-400'
                                                : isLost && !isGuessed
                                                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-600 dark:text-rose-400 animate-pulse'
                                                : isGuessed
                                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 scale-102'
                                                : 'bg-gradient-to-b from-white to-gray-100 dark:from-slate-800 dark:to-slate-850 border-cyan-400 dark:border-cyan-600 text-gray-900 dark:text-white'
                                        }`}
                                    >
                                        {displayChar.toUpperCase()}
                                    </div>
                                );
                            })}
                        </div>

                        {(isWon || isLost) && (
                            <button
                                onClick={() => speak(targetWord.cleanEn)}
                                className="mt-2 px-4 py-2 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 transition cursor-pointer"
                            >
                                <Volume2 size={18} /> Nghe phát âm: <span className="underline">{targetWord.cleanEn}</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Win / Loss Banners */}
                {isWon && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-cyan-500/15 border-2 border-emerald-500/40 rounded-2xl flex flex-wrap items-center justify-between gap-3 animate-fade-in shadow-md">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 size={30} className="text-emerald-500 shrink-0" />
                            <div>
                                <h4 className="font-black text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                                    <Sparkles size={16} /> Phi hành gia an toàn trở về!
                                </h4>
                                <p className="text-xs text-emerald-700 dark:text-emerald-400">Từ vựng chuẩn xác: <strong>{targetWord.cleanEn}</strong></p>
                            </div>
                        </div>
                        <button
                            onClick={nextWord}
                            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition transform hover:scale-105 active:scale-95 cursor-pointer"
                        >
                            Chuyến Bay Tiếp Theo <ArrowRight size={16} />
                        </button>
                    </div>
                )}

                {isLost && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-rose-500/15 to-red-500/15 border-2 border-rose-500/40 rounded-2xl flex flex-wrap items-center justify-between gap-3 animate-fade-in shadow-md">
                        <div className="flex items-center gap-3">
                            <XCircle size={30} className="text-rose-500 shrink-0" />
                            <div>
                                <h4 className="font-black text-rose-800 dark:text-rose-300">Tàu cứu hộ hết năng lượng!</h4>
                                <p className="text-xs text-rose-700 dark:text-rose-400">Từ đúng là: <strong className="uppercase">{targetWord.cleanEn}</strong></p>
                            </div>
                        </div>
                        <button
                            onClick={nextWord}
                            className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-sm flex items-center gap-2 shadow-lg shadow-rose-600/30 transition transform hover:scale-105 active:scale-95 cursor-pointer"
                        >
                            Thử Lại Từ Khác <ArrowRight size={16} />
                        </button>
                    </div>
                )}
            </div>

            {/* Virtual Cyber Keyboard */}
            <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-3xl shadow-xl border border-gray-200 dark:border-slate-800">
                <div className="grid grid-cols-7 sm:grid-cols-9 gap-1.5 md:gap-2">
                    {ALPHABET.map((char) => {
                        const lower = char.toLowerCase();
                        const isGuessed = guessedLetters.has(lower);
                        const isInTarget = targetClean.includes(lower);

                        let keyClass = "h-11 md:h-12 font-black rounded-2xl text-base md:text-lg transition-all flex items-center justify-center cursor-pointer shadow-sm";
                        if (!isGuessed) {
                            keyClass += " bg-gradient-to-b from-white to-gray-50 dark:from-slate-800 dark:to-slate-850 hover:border-cyan-500 dark:hover:border-cyan-500 hover:text-cyan-600 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-slate-700 active:scale-90 hover:shadow-md hover:shadow-cyan-500/10";
                        } else if (isInTarget) {
                            keyClass += " bg-gradient-to-br from-emerald-500 to-teal-600 text-white border border-emerald-600 cursor-default opacity-90 scale-95 shadow-md shadow-emerald-500/20";
                        } else {
                            keyClass += " bg-gray-100 dark:bg-slate-800/40 text-gray-400 dark:text-slate-600 border border-transparent cursor-not-allowed opacity-30 scale-90";
                        }

                        return (
                            <button
                                key={char}
                                disabled={isGuessed || isWon || isLost}
                                onClick={() => guessLetter(char)}
                                className={keyClass}
                            >
                                {char}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
