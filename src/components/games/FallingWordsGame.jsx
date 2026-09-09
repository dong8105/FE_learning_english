import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Heart, Trophy, Zap, Volume2, RotateCcw, Play, Pause, AlertCircle } from 'lucide-react';

export default function FallingWordsGame({ words, speak }) {
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [combo, setCombo] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [fallingWords, setFallingWords] = useState([]);
    const [destroyedWord, setDestroyedWord] = useState(null);

    const [highScore, setHighScore] = useState(() => {
        return parseInt(localStorage.getItem('falling_words_high_score')) || 0;
    });

    const inputRef = useRef(null);
    const wordIdCounter = useRef(1);
    const isGameOverRef = useRef(false);
    const isPausedRef = useRef(false);

    isGameOverRef.current = isGameOver;
    isPausedRef.current = isPaused;

    // Filter valid words with clean English
    const validWords = (words || [])
        .filter(w => w.en && w.vi)
        .map(w => ({
            ...w,
            cleanEn: w.en.replace(/\(.*?\)/g, '').trim(),
        }))
        .filter(w => w.cleanEn.length > 0);

    // Speed scales gently with score
    const speed = Math.min(1.1, 0.35 + Math.floor(score / 50) * 0.08);

    // Spawn a new falling word
    const spawnWord = useCallback(() => {
        if (validWords.length === 0 || isGameOverRef.current || isPausedRef.current) return;

        const randomWord = validWords[Math.floor(Math.random() * validWords.length)];
        const xPos = Math.floor(Math.random() * 65) + 8;

        const newFallingWord = {
            id: wordIdCounter.current++,
            word: randomWord,
            x: xPos,
            y: 0,
        };

        setFallingWords(prev => {
            if (prev.length >= 4) return prev;
            return [...prev, newFallingWord];
        });
    }, [validWords]);

    // Spawn timer
    useEffect(() => {
        if (isGameOver || isPaused || validWords.length === 0) return;

        const spawnInterval = setInterval(() => {
            spawnWord();
        }, Math.max(1800, 3200 - Math.floor(score / 40) * 180));

        return () => clearInterval(spawnInterval);
    }, [spawnWord, isGameOver, isPaused, score, validWords.length]);

    // Game loop (advances words down)
    useEffect(() => {
        if (isGameOver || isPaused || validWords.length === 0) return;

        const interval = setInterval(() => {
            let reachedBottomCount = 0;

            setFallingWords(prev => {
                const survivors = [];
                for (const item of prev) {
                    const nextY = item.y + speed;
                    if (nextY >= 86) {
                        reachedBottomCount++;
                    } else {
                        survivors.push({ ...item, y: nextY });
                    }
                }
                return survivors;
            });

            if (reachedBottomCount > 0) {
                setCombo(0);
                setLives(prevLives => {
                    const nextLives = Math.max(0, prevLives - reachedBottomCount);
                    if (nextLives <= 0) {
                        setIsGameOver(true);
                        setScore(finalScore => {
                            if (finalScore > highScore) {
                                setHighScore(finalScore);
                                localStorage.setItem('falling_words_high_score', finalScore.toString());
                            }
                            return finalScore;
                        });
                    }
                    return nextLives;
                });
            }
        }, 50);

        return () => clearInterval(interval);
    }, [isGameOver, isPaused, speed, highScore, validWords.length]);

    // Auto-focus input
    useEffect(() => {
        if (!isGameOver && !isPaused && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isGameOver, isPaused]);

    // Check typed answer
    const checkMatch = (value) => {
        const cleanInput = value.trim().toLowerCase();
        if (!cleanInput) return;

        const matchedIndex = fallingWords.findIndex(item =>
            item.word.cleanEn.toLowerCase() === cleanInput
        );

        if (matchedIndex !== -1) {
            const matched = fallingWords[matchedIndex];
            speak(matched.word.cleanEn);

            setDestroyedWord({ x: matched.x, y: matched.y, text: matched.word.cleanEn });
            setTimeout(() => setDestroyedWord(null), 650);

            const points = 10 + combo * 2;
            setScore(s => s + points);
            setCombo(c => c + 1);

            setFallingWords(prev => prev.filter((_, idx) => idx !== matchedIndex));
            setInputValue('');
        }
    };

    const handleInputChange = (e) => {
        const val = e.target.value;
        setInputValue(val);
        checkMatch(val);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            checkMatch(inputValue);
            setInputValue('');
        }
    };

    const initGame = () => {
        setScore(0);
        setLives(3);
        setCombo(0);
        setIsGameOver(false);
        setIsPaused(false);
        setFallingWords([]);
        setInputValue('');
        wordIdCounter.current = 1;
        setTimeout(() => spawnWord(), 400);
    };

    if (validWords.length < 5) {
        return (
            <div className="flex flex-col items-center justify-center p-10 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-800">
                <AlertCircle size={48} className="text-gray-300 dark:text-slate-600 mb-4" />
                <h2 className="text-xl font-bold text-gray-600 dark:text-slate-400">Cần ít nhất 5 từ vựng để chơi Mưa Từ Vựng</h2>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-4 animate-fade-in pb-16">
            {/* Top Bar: Stats & Controls */}
            <div className="flex flex-wrap items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-800 gap-4">
                <div className="flex items-center gap-6 px-2">
                    {/* Lives */}
                    <div className="flex items-center gap-1">
                        {[1, 2, 3].map(i => (
                            <Heart
                                key={i}
                                size={24}
                                className={i <= lives ? 'fill-red-500 text-red-500 transition-all' : 'text-gray-300 dark:text-slate-700'}
                            />
                        ))}
                    </div>

                    <div className="w-px h-8 bg-gray-200 dark:bg-slate-700"></div>

                    {/* Score */}
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Điểm</span>
                        <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 leading-none">{score}</span>
                    </div>

                    {/* Combo */}
                    {combo > 1 && (
                        <div className="flex items-center gap-1 px-3 py-1 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-full font-black text-xs animate-bounce">
                            <Zap size={14} /> x{combo}!
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-slate-800 rounded-xl text-xs font-bold text-gray-500 dark:text-slate-400">
                        <Trophy size={14} className="text-amber-500" /> Kỷ lục: {highScore}
                    </div>

                    <button
                        onClick={() => setIsPaused(p => !p)}
                        className="p-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl transition cursor-pointer"
                        title={isPaused ? "Tiếp tục" : "Tạm dừng"}
                    >
                        {isPaused ? <Play size={18} /> : <Pause size={18} />}
                    </button>

                    <button
                        onClick={initGame}
                        className="p-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl transition cursor-pointer"
                        title="Chơi lại"
                    >
                        <RotateCcw size={18} />
                    </button>
                </div>
            </div>

            {/* Game Arena */}
            <div className="relative h-[380px] md:h-[450px] bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 rounded-3xl border-2 border-indigo-900/50 shadow-inner overflow-hidden select-none">
                {/* Danger Zone Line */}
                <div className="absolute bottom-[14%] left-0 right-0 border-b-2 border-dashed border-red-500/40 flex justify-between px-4">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-red-400/60">Vạch nguy hiểm</span>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-red-400/60">Danger</span>
                </div>

                {/* Falling Words */}
                {fallingWords.map((item) => (
                    <div
                        key={item.id}
                        className="absolute transform -translate-x-1/2 transition-all duration-75 ease-linear pointer-events-none"
                        style={{
                            left: `${item.x}%`,
                            top: `${item.y}%`,
                        }}
                    >
                        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-xl border-2 border-indigo-400 flex flex-col items-center max-w-[150px]">
                            <span className="text-sm font-black text-indigo-700 dark:text-indigo-300 truncate">
                                {item.word.cleanEn}
                            </span>
                            <span className="text-[10px] text-gray-500 dark:text-slate-400 truncate w-full text-center">
                                {item.word.vi}
                            </span>
                        </div>
                    </div>
                ))}

                {/* Explosion Effect on Hit */}
                {destroyedWord && (
                    <div
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-ping"
                        style={{
                            left: `${destroyedWord.x}%`,
                            top: `${destroyedWord.y}%`,
                        }}
                    >
                        <div className="px-3.5 py-1.5 bg-green-500 text-white font-black rounded-full shadow-2xl text-sm">
                            💥 {destroyedWord.text} +10
                        </div>
                    </div>
                )}

                {/* Pause Overlay */}
                {isPaused && !isGameOver && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center z-10 animate-fade-in">
                        <Pause size={48} className="text-white mb-2" />
                        <h3 className="text-2xl font-black text-white mb-4">Đang tạm dừng</h3>
                        <button
                            onClick={() => setIsPaused(false)}
                            className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition cursor-pointer"
                        >
                            Tiếp Tục Chơi
                        </button>
                    </div>
                )}

                {/* Game Over Modal */}
                {isGameOver && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-20 animate-fade-in text-white text-center p-6">
                        <Trophy size={56} className="text-yellow-400 mb-2 animate-bounce" />
                        <h2 className="text-3xl md:text-4xl font-black mb-1">Hết Mạng Rồi!</h2>
                        <p className="text-lg opacity-80 mb-4">Bạn đạt được <strong className="text-2xl text-indigo-400">{score}</strong> điểm.</p>
                        <button
                            onClick={initGame}
                            className="px-8 py-3.5 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-black rounded-2xl shadow-xl transition transform hover:scale-105 flex items-center gap-2 cursor-pointer"
                        >
                            <RotateCcw size={20} /> Chơi Lại Màn Mới
                        </button>
                    </div>
                )}
            </div>

            {/* Input Bar */}
            <div className="bg-white dark:bg-slate-900 p-3.5 md:p-4 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-800">
                <div className="relative flex items-center">
                    <input
                        ref={inputRef}
                        type="text"
                        disabled={isGameOver || isPaused}
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Gõ từ tiếng Anh đang rơi và nhấn Enter..."
                        className="w-full pl-4 pr-24 py-3 bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 dark:focus:border-indigo-500 rounded-2xl outline-none font-bold text-gray-800 dark:text-white placeholder-gray-400 transition text-base"
                    />
                    <button
                        onClick={() => {
                            checkMatch(inputValue);
                            setInputValue('');
                        }}
                        disabled={isGameOver || isPaused || !inputValue.trim()}
                        className="absolute right-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-black rounded-xl text-sm transition cursor-pointer disabled:cursor-not-allowed shadow-sm"
                    >
                        Bắn 🚀
                    </button>
                </div>
            </div>
        </div>
    );
}
