import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Heart, Trophy, Zap, Volume2, RotateCcw, Play, Pause, AlertCircle, Sparkles, Crosshair } from 'lucide-react';
import { audioManager } from '../../utils/audioManager';

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

    const validWords = (words || [])
        .filter(w => w.en && w.vi)
        .map(w => ({
            ...w,
            cleanEn: w.en.replace(/\(.*?\)/g, '').trim(),
        }))
        .filter(w => w.cleanEn.length > 0);

    const speed = Math.min(1.1, 0.35 + Math.floor(score / 50) * 0.08);

    const spawnWord = useCallback(() => {
        if (validWords.length === 0 || isGameOverRef.current || isPausedRef.current) return;

        const randomWord = validWords[Math.floor(Math.random() * validWords.length)];
        const xPos = Math.floor(Math.random() * 64) + 10;

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

    useEffect(() => {
        if (isGameOver || isPaused || validWords.length === 0) return;

        const spawnInterval = setInterval(() => {
            spawnWord();
        }, Math.max(1800, 3200 - Math.floor(score / 40) * 180));

        return () => clearInterval(spawnInterval);
    }, [spawnWord, isGameOver, isPaused, score, validWords.length]);

    useEffect(() => {
        if (isGameOver || isPaused || validWords.length === 0) return;

        const interval = setInterval(() => {
            let reachedBottomCount = 0;

            setFallingWords(prev => {
                const survivors = [];
                for (const item of prev) {
                    const nextY = item.y + speed;
                    if (nextY >= 85) {
                        reachedBottomCount++;
                    } else {
                        survivors.push({ ...item, y: nextY });
                    }
                }
                return survivors;
            });

            if (reachedBottomCount > 0) {
                audioManager.playWrong();
                setCombo(0);
                setLives(prevLives => {
                    const nextLives = Math.max(0, prevLives - reachedBottomCount);
                    if (nextLives <= 0) {
                        setIsGameOver(true);
                        audioManager.playGameOver();
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

    useEffect(() => {
        if (!isGameOver && !isPaused && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isGameOver, isPaused]);

    const checkMatch = (value) => {
        const cleanInput = value.trim().toLowerCase();
        if (!cleanInput) return;

        const matchedIndex = fallingWords.findIndex(item =>
            item.word.cleanEn.toLowerCase() === cleanInput
        );

        if (matchedIndex !== -1) {
            const matched = fallingWords[matchedIndex];
            speak(matched.word.cleanEn);

            const nextCombo = combo + 1;
            if (nextCombo % 5 === 0) {
                audioManager.playStreak();
            } else {
                audioManager.playCorrect();
            }

            setDestroyedWord({ x: matched.x, y: matched.y, text: matched.word.cleanEn, combo: nextCombo });
            setTimeout(() => setDestroyedWord(null), 650);

            const points = 10 + combo * 3;
            setScore(s => s + points);
            setCombo(nextCombo);

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
            <div className="flex flex-col items-center justify-center p-12 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200 dark:border-slate-800 text-center">
                <AlertCircle size={56} className="text-amber-400 mb-4 animate-bounce" />
                <h2 className="text-xl font-bold text-gray-700 dark:text-slate-300">Cần ít nhất 5 từ vựng để mở chiến trường Mưa Từ Vựng</h2>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-4 animate-fade-in pb-16">
            {/* Top Bar: Cyber Arcade Header */}
            <div className="bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-indigo-500/10 dark:from-violet-950/40 dark:via-fuchsia-950/40 dark:to-indigo-950/40 p-4 md:p-5 rounded-3xl border border-violet-200/50 dark:border-violet-800/40 backdrop-blur-xl shadow-lg flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-6 px-2">
                    {/* Lives (Shield hearts) */}
                    <div className="flex items-center gap-1.5">
                        {[1, 2, 3].map(i => (
                            <Heart
                                key={i}
                                size={26}
                                className={`${
                                    i <= lives 
                                        ? 'fill-rose-500 text-rose-500 drop-shadow-[0_2px_8px_rgba(244,63,94,0.4)] animate-pulse' 
                                        : 'text-gray-300 dark:text-slate-700 opacity-40'
                                } transition-all duration-300`}
                            />
                        ))}
                    </div>

                    <div className="w-px h-8 bg-violet-200 dark:bg-violet-800/50 hidden sm:block"></div>

                    {/* Score */}
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-fuchsia-500 to-pink-600 flex items-center justify-center text-white shadow-md shadow-fuchsia-500/20">
                            <Zap size={18} />
                        </div>
                        <div>
                            <span className="text-[10px] font-black tracking-widest uppercase text-gray-400 dark:text-slate-400">Điểm</span>
                            <p className="text-2xl font-black text-gray-900 dark:text-white leading-none">{score}</p>
                        </div>
                    </div>

                    {/* Combo */}
                    {combo > 1 && (
                        <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs shadow-md shadow-orange-500/30 animate-bounce">
                            ⚡ COMBO x{combo}!
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-amber-300/60 dark:border-amber-500/30 text-xs font-black text-amber-600 dark:text-amber-400 shadow-sm">
                        <Trophy size={16} className="text-amber-500" /> Kỷ lục: {highScore}
                    </div>

                    <button
                        onClick={() => setIsPaused(p => !p)}
                        className="p-2.5 bg-white dark:bg-slate-800 hover:bg-violet-50 dark:hover:bg-slate-700 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800/50 rounded-2xl transition cursor-pointer shadow-sm active:scale-95"
                        title={isPaused ? "Tiếp tục" : "Tạm dừng"}
                    >
                        {isPaused ? <Play size={18} /> : <Pause size={18} />}
                    </button>

                    <button
                        onClick={initGame}
                        className="p-2.5 bg-white dark:bg-slate-800 hover:bg-violet-50 dark:hover:bg-slate-700 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800/50 rounded-2xl transition cursor-pointer shadow-sm active:scale-95"
                        title="Chơi lại"
                    >
                        <RotateCcw size={18} />
                    </button>
                </div>
            </div>

            {/* Neon Arcade Battle Arena */}
            <div className="relative h-[400px] md:h-[460px] bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 rounded-3xl border-2 border-indigo-500/40 shadow-2xl overflow-hidden select-none">
                {/* Cyber Grid Background */}
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#818cf8_1.5px,transparent_1.5px)] [background-size:20px_20px]"></div>

                {/* Glowing Laser Danger Line */}
                <div className="absolute bottom-[14%] left-0 right-0 border-b-2 border-rose-500 flex justify-between px-4 py-1 shadow-[0_0_15px_rgba(244,63,94,0.7)]">
                    <span className="text-[10px] uppercase font-black tracking-widest text-rose-400">⚡ RÀO CHẮN NĂNG LƯỢNG ⚡</span>
                    <span className="text-[10px] uppercase font-black tracking-widest text-rose-400">DANGER SHIELD</span>
                </div>

                {/* Falling Meteor Word Chips */}
                {fallingWords.map((item) => (
                    <div
                        key={item.id}
                        className="absolute transform -translate-x-1/2 transition-all duration-75 ease-linear pointer-events-none"
                        style={{
                            left: `${item.x}%`,
                            top: `${item.y}%`,
                        }}
                    >
                        <div className="relative group">
                            {/* Meteor thruster glow */}
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-gradient-to-b from-amber-400 to-transparent rounded-full blur-xs opacity-80"></div>
                            
                            {/* Chip Body */}
                            <div className="relative bg-gradient-to-b from-slate-900/95 to-indigo-950/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border-2 border-cyan-400 shadow-cyan-500/20 flex flex-col items-center max-w-[170px]">
                                <span className="text-sm md:text-base font-black text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] truncate">
                                    {item.word.cleanEn}
                                </span>
                                <span className="text-[10px] text-gray-300 truncate w-full text-center">
                                    {item.word.vi}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Explosion Laser Blast Effect */}
                {destroyedWord && (
                    <div
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-ping z-10"
                        style={{
                            left: `${destroyedWord.x}%`,
                            top: `${destroyedWord.y}%`,
                        }}
                    >
                        <div className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-black rounded-full shadow-2xl text-base flex items-center gap-1.5 border-2 border-white">
                            💥 {destroyedWord.text} +{10 + (destroyedWord.combo - 1) * 3}!
                        </div>
                    </div>
                )}

                {/* Pause Overlay */}
                {isPaused && !isGameOver && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex flex-col items-center justify-center z-20 animate-fade-in">
                        <Pause size={56} className="text-cyan-400 mb-2 animate-pulse" />
                        <h3 className="text-2xl font-black text-white mb-4">Đang Tạm Dừng</h3>
                        <button
                            onClick={() => setIsPaused(false)}
                            className="px-7 py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-black rounded-2xl shadow-xl hover:from-indigo-700 hover:to-cyan-700 transition cursor-pointer"
                        >
                            Tiếp Tục Bắn 🚀
                        </button>
                    </div>
                )}

                {/* Game Over Modal */}
                {isGameOver && (
                    <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center z-30 animate-fade-in text-white text-center p-6">
                        <Trophy size={64} className="text-yellow-400 mb-3 animate-bounce drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)]" />
                        <h2 className="text-3xl md:text-5xl font-black mb-1 tracking-tight">Căn Cứ Thất Thủ!</h2>
                        <p className="text-lg opacity-85 mb-6">Bạn đã tiêu diệt thiên thạch và đạt <strong className="text-3xl text-cyan-400 font-black">{score}</strong> điểm.</p>
                        <button
                            onClick={initGame}
                            className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 text-white font-black rounded-2xl shadow-2xl transition transform hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer text-lg"
                        >
                            <RotateCcw size={20} /> Tái Khởi Động Trận Đấu
                        </button>
                    </div>
                )}
            </div>

            {/* Laser Crosshair Input Bar */}
            <div className="bg-white dark:bg-slate-900 p-3.5 md:p-4 rounded-3xl shadow-xl border border-gray-200 dark:border-slate-800">
                <div className="relative flex items-center">
                    <div className="absolute left-4 text-indigo-500 dark:text-indigo-400 pointer-events-none">
                        <Crosshair size={20} className="animate-spin" />
                    </div>
                    <input
                        ref={inputRef}
                        type="text"
                        disabled={isGameOver || isPaused}
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Gõ từ tiếng Anh đang rơi và nhấn Enter để bắn..."
                        className="w-full pl-12 pr-28 py-3.5 bg-gray-50 dark:bg-slate-800/80 border-2 border-transparent focus:border-indigo-500 dark:focus:border-indigo-500 rounded-2xl outline-none font-bold text-gray-900 dark:text-white placeholder-gray-400 transition text-base shadow-inner"
                    />
                    <button
                        onClick={() => {
                            checkMatch(inputValue);
                            setInputValue('');
                        }}
                        disabled={isGameOver || isPaused || !inputValue.trim()}
                        className="absolute right-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-40 text-white font-black rounded-xl text-sm transition cursor-pointer disabled:cursor-not-allowed shadow-md shadow-indigo-600/30 active:scale-95"
                    >
                        Bắn 🚀
                    </button>
                </div>
            </div>
        </div>
    );
}
