import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Trophy, Volume2, HelpCircle, Heart, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

const MAX_WRONG = 6;
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function HangmanGame({ words, speak }) {
    const [targetWord, setTargetWord] = useState(null);
    const [guessedLetters, setGuessedLetters] = useState(new Set());
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [hintsUsed, setHintsUsed] = useState(0);
    const [showFullWord, setShowFullWord] = useState(false);

    // Pick a new word
    const nextWord = useCallback(() => {
        if (!words || words.length === 0) return;
        // Filter words that have valid English letters
        const validWords = words.filter(w => w.en && /[a-zA-Z]/.test(w.en));
        if (validWords.length === 0) return;

        const randomWord = validWords[Math.floor(Math.random() * validWords.length)];
        setTargetWord(randomWord);
        setGuessedLetters(new Set());
        setHintsUsed(0);
        setShowFullWord(false);
    }, [words]);

    useEffect(() => {
        nextWord();
    }, [nextWord]);

    // Calculate wrong guesses
    const wrongGuesses = targetWord
        ? Array.from(guessedLetters).filter(letter => !targetWord.en.toLowerCase().includes(letter)).length
        : 0;

    const isWon = targetWord && targetWord.en
        .toLowerCase()
        .split('')
        .filter(char => /[a-zA-Z]/.test(char))
        .every(char => guessedLetters.has(char));

    const isLost = wrongGuesses >= MAX_WRONG;

    // Speak word on win
    useEffect(() => {
        if (isWon && targetWord) {
            speak(targetWord.en);
            setScore(s => s + 10 + Math.max(0, (MAX_WRONG - wrongGuesses) * 2));
            setStreak(st => st + 1);
        } else if (isLost && targetWord) {
            setStreak(0);
        }
    }, [isWon, isLost]); // eslint-disable-line react-hooks/exhaustive-deps

    // Guess letter handler
    const guessLetter = useCallback((char) => {
        const lower = char.toLowerCase();
        if (isWon || isLost || guessedLetters.has(lower)) return;

        setGuessedLetters(prev => {
            const updated = new Set(prev);
            updated.add(lower);
            return updated;
        });
    }, [isWon, isLost, guessedLetters]);

    // Keyboard listener for desktop
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

    // Hint function
    const useHint = () => {
        if (!targetWord || isWon || isLost || hintsUsed >= 2) return;
        const unrevealedLetters = targetWord.en
            .toLowerCase()
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
            <div className="flex flex-col items-center justify-center p-10 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-800">
                <HelpCircle size={48} className="text-gray-300 dark:text-slate-600 mb-4 animate-spin" />
                <h2 className="text-xl font-bold text-gray-600 dark:text-slate-400">Đang nạp từ vựng...</h2>
            </div>
        );
    }

    const livesLeft = Math.max(0, MAX_WRONG - wrongGuesses);

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-16">
            {/* Top Bar: Score & Lives */}
            <div className="flex flex-wrap items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-800 gap-4">
                <div className="flex items-center gap-6">
                    {/* Lives / Hearts */}
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">Mạng:</span>
                        {[...Array(MAX_WRONG)].map((_, i) => (
                            <Heart
                                key={i}
                                size={22}
                                className={i < livesLeft ? 'fill-red-500 text-red-500 transition-all' : 'text-gray-300 dark:text-slate-700'}
                            />
                        ))}
                    </div>

                    <div className="w-px h-8 bg-gray-200 dark:bg-slate-700 hidden sm:block"></div>

                    {/* Score */}
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Điểm</span>
                        <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 leading-none">{score}</span>
                    </div>

                    {/* Streak */}
                    {streak > 1 && (
                        <div className="flex items-center gap-1 px-3 py-1 bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 rounded-full font-black text-xs">
                            🔥 x{streak}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={useHint}
                        disabled={isWon || isLost || hintsUsed >= 2}
                        className="px-4 py-2 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/30 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded-xl font-bold text-sm flex items-center gap-1.5 transition disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                        title="Gợi ý mở 1 chữ cái"
                    >
                        <HelpCircle size={16} /> Gợi ý ({2 - hintsUsed})
                    </button>
                    <button
                        onClick={nextWord}
                        className="p-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl transition cursor-pointer"
                        title="Đổi từ khác"
                    >
                        <RefreshCw size={18} />
                    </button>
                </div>
            </div>

            {/* Main Stage: Hangman Graphic + Clues */}
            <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-800 transition-colors">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    {/* Hangman SVG Illustration */}
                    <div className="md:col-span-4 flex justify-center items-center">
                        <svg viewBox="0 0 200 240" className="w-36 h-44 md:w-44 md:h-52 stroke-current text-slate-700 dark:text-slate-300">
                            {/* Base / Gallows */}
                            <line x1="20" y1="220" x2="100" y2="220" strokeWidth="6" strokeLinecap="round" />
                            <line x1="60" y1="220" x2="60" y2="20" strokeWidth="6" strokeLinecap="round" />
                            <line x1="60" y1="20" x2="150" y2="20" strokeWidth="6" strokeLinecap="round" />
                            <line x1="150" y1="20" x2="150" y2="50" strokeWidth="4" strokeLinecap="round" />
                            <line x1="60" y1="50" x2="90" y2="20" strokeWidth="4" strokeLinecap="round" />

                            {/* 1. Head */}
                            {wrongGuesses >= 1 && (
                                <circle cx="150" cy="70" r="20" strokeWidth="4" fill="none" className="text-indigo-600 dark:text-indigo-400" />
                            )}
                            {/* 2. Body */}
                            {wrongGuesses >= 2 && (
                                <line x1="150" y1="90" x2="150" y2="150" strokeWidth="4" strokeLinecap="round" className="text-indigo-600 dark:text-indigo-400" />
                            )}
                            {/* 3. Left Arm */}
                            {wrongGuesses >= 3 && (
                                <line x1="150" y1="105" x2="120" y2="135" strokeWidth="4" strokeLinecap="round" className="text-indigo-600 dark:text-indigo-400" />
                            )}
                            {/* 4. Right Arm */}
                            {wrongGuesses >= 4 && (
                                <line x1="150" y1="105" x2="180" y2="135" strokeWidth="4" strokeLinecap="round" className="text-indigo-600 dark:text-indigo-400" />
                            )}
                            {/* 5. Left Leg */}
                            {wrongGuesses >= 5 && (
                                <line x1="150" y1="150" x2="125" y2="195" strokeWidth="4" strokeLinecap="round" className="text-indigo-600 dark:text-indigo-400" />
                            )}
                            {/* 6. Right Leg (Final mistake) */}
                            {wrongGuesses >= 6 && (
                                <line x1="150" y1="150" x2="175" y2="195" strokeWidth="4" strokeLinecap="round" className="text-red-500" />
                            )}
                        </svg>
                    </div>

                    {/* Word Clues & Letter Slots */}
                    <div className="md:col-span-8 flex flex-col items-center md:items-start text-center md:text-left space-y-4">
                        {/* Clue Category & Meaning */}
                        <div>
                            {targetWord.category && (
                                <span className="inline-block px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-full mb-2">
                                    {targetWord.category}
                                </span>
                            )}
                            <h3 className="text-xl md:text-2xl font-black text-gray-800 dark:text-white leading-snug">
                                {targetWord.vi}
                            </h3>
                            {targetWord.ipa && (isWon || isLost) && (
                                <p className="text-sm font-mono text-gray-400 dark:text-slate-500 mt-1">
                                    {targetWord.ipa}
                                </p>
                            )}
                        </div>

                        {/* Letter Slots */}
                        <div className="flex flex-wrap gap-2 justify-center md:justify-start pt-2">
                            {targetWord.en.split('').map((char, index) => {
                                const isAlpha = /[a-zA-Z]/.test(char);
                                const isGuessed = guessedLetters.has(char.toLowerCase());
                                const displayChar = !isAlpha ? char : ((isGuessed || isLost || showFullWord) ? char : '');

                                return (
                                    <div
                                        key={index}
                                        className={`w-9 h-12 md:w-11 md:h-14 flex items-center justify-center font-black text-xl md:text-2xl rounded-xl border-b-4 transition-all ${
                                            !isAlpha
                                                ? 'border-transparent text-gray-400'
                                                : isLost && !isGuessed
                                                ? 'bg-red-50 dark:bg-red-950/30 border-red-500 text-red-600 dark:text-red-400 animate-pulse'
                                                : isGuessed
                                                ? 'bg-green-50 dark:bg-green-950/30 border-green-500 text-green-700 dark:text-green-400'
                                                : 'bg-gray-50 dark:bg-slate-800 border-indigo-400 dark:border-indigo-600 text-gray-800 dark:text-white'
                                        }`}
                                    >
                                        {displayChar.toUpperCase()}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Audio speaker button when finished */}
                        {(isWon || isLost) && (
                            <button
                                onClick={() => speak(targetWord.en)}
                                className="mt-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-indigo-100 transition cursor-pointer"
                            >
                                <Volume2 size={18} /> Nghe phát âm từ: <span className="underline">{targetWord.en}</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Win / Loss Banners */}
                {isWon && (
                    <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/40 rounded-2xl flex flex-wrap items-center justify-between gap-3 animate-fade-in">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 size={28} className="text-green-500" />
                            <div>
                                <h4 className="font-bold text-green-800 dark:text-green-400">Chính xác! Xuất sắc lắm!</h4>
                                <p className="text-xs text-green-700 dark:text-green-500">Từ đúng là: <strong>{targetWord.en}</strong></p>
                            </div>
                        </div>
                        <button
                            onClick={nextWord}
                            className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black text-sm flex items-center gap-2 shadow-md transition cursor-pointer"
                        >
                            Từ Tiếp Theo <ArrowRight size={16} />
                        </button>
                    </div>
                )}

                {isLost && (
                    <div className="mt-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 rounded-2xl flex flex-wrap items-center justify-between gap-3 animate-fade-in">
                        <div className="flex items-center gap-3">
                            <XCircle size={28} className="text-red-500" />
                            <div>
                                <h4 className="font-bold text-red-800 dark:text-red-400">Bạn đã hết lượt đoán!</h4>
                                <p className="text-xs text-red-700 dark:text-red-500">Từ đúng là: <strong className="uppercase">{targetWord.en}</strong></p>
                            </div>
                        </div>
                        <button
                            onClick={nextWord}
                            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-sm flex items-center gap-2 shadow-md transition cursor-pointer"
                        >
                            Thử Từ Khác <ArrowRight size={16} />
                        </button>
                    </div>
                )}
            </div>

            {/* Virtual On-Screen Keyboard */}
            <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-800">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 text-center">
                    Bấm bàn phím hoặc click các chữ cái bên dưới:
                </p>
                <div className="grid grid-cols-7 sm:grid-cols-9 gap-1.5 md:gap-2">
                    {ALPHABET.map((char) => {
                        const lower = char.toLowerCase();
                        const isGuessed = guessedLetters.has(lower);
                        const isInTarget = targetWord.en.toLowerCase().includes(lower);

                        let keyClass = "h-11 md:h-12 font-black rounded-xl text-base md:text-lg transition-all flex items-center justify-center cursor-pointer shadow-sm";
                        if (!isGuessed) {
                            keyClass += " bg-gray-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 hover:text-indigo-600 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-slate-700 active:scale-95";
                        } else if (isInTarget) {
                            keyClass += " bg-green-500 text-white border border-green-600 cursor-default opacity-90 scale-95";
                        } else {
                            keyClass += " bg-gray-200 dark:bg-slate-800/40 text-gray-400 dark:text-slate-600 border border-transparent cursor-not-allowed opacity-40";
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
