import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Heart, Trophy, Timer, Volume2, CheckCircle2, XCircle, RotateCcw, Zap, Flame, Award } from 'lucide-react';

const QUESTION_TIME = 6;

export default function SurvivalGame({ words, speak }) {
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [streak, setStreak] = useState(0);
    const [currentQ, setCurrentQ] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isGameOver, setIsGameOver] = useState(false);
    const [isAnswering, setIsAnswering] = useState(false);
    const [highScore, setHighScore] = useState(() => {
        return parseInt(localStorage.getItem('survival_high_score')) || 0;
    });

    const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
    const timerRef = useRef(null);
    const questionStartTimeRef = useRef(null);

    const generateQuestion = useCallback(() => {
        if (!words || words.length < 4) return null;

        const validWords = words.filter(w => w.en && w.vi);
        if (validWords.length < 4) return null;

        const target = validWords[Math.floor(Math.random() * validWords.length)];
        const otherWords = validWords.filter(w => w.en.toLowerCase() !== target.en.toLowerCase() && w.vi !== target.vi);
        const shuffledOthers = [...otherWords].sort(() => 0.5 - Math.random());
        const distractors = shuffledOthers.slice(0, 3);
        const options = [target, ...distractors].sort(() => 0.5 - Math.random());

        return {
            target,
            options,
        };
    }, [words]);

    const proceedNext = useCallback((currentRemainingLives) => {
        if (currentRemainingLives <= 0) {
            setIsGameOver(true);
            setScore(finalScore => {
                if (finalScore > highScore) {
                    setHighScore(finalScore);
                    localStorage.setItem('survival_high_score', finalScore.toString());
                }
                return finalScore;
            });
            return;
        }

        const nextQ = generateQuestion();
        if (!nextQ) return;

        setCurrentQ(nextQ);
        setSelectedOption(null);
        setIsAnswering(false);
        setTimeLeft(QUESTION_TIME);
        questionStartTimeRef.current = Date.now();
    }, [generateQuestion, highScore]);

    const initGame = useCallback(() => {
        if (!words || words.length < 4) return;
        if (timerRef.current) clearInterval(timerRef.current);

        setScore(0);
        setLives(3);
        setStreak(0);
        setIsGameOver(false);
        setIsAnswering(false);
        setSelectedOption(null);
        setTimeLeft(QUESTION_TIME);

        const firstQ = generateQuestion();
        setCurrentQ(firstQ);
        questionStartTimeRef.current = Date.now();
    }, [words, generateQuestion]);

    useEffect(() => {
        initGame();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [initGame]);

    // Timer Loop
    useEffect(() => {
        if (isGameOver || isAnswering || !currentQ) {
            if (timerRef.current) clearInterval(timerRef.current);
            return;
        }

        questionStartTimeRef.current = Date.now();

        timerRef.current = setInterval(() => {
            const elapsed = (Date.now() - questionStartTimeRef.current) / 1000;
            const remaining = Math.max(0, QUESTION_TIME - elapsed);
            setTimeLeft(remaining);

            if (remaining <= 0) {
                clearInterval(timerRef.current);
                handleTimeout();
            }
        }, 50);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [currentQ, isGameOver, isAnswering]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleTimeout = () => {
        if (isAnswering || isGameOver) return;
        if (timerRef.current) clearInterval(timerRef.current);

        setIsAnswering(true);
        setSelectedOption('TIMEOUT');
        setStreak(0);

        setLives(prevLives => {
            const nextLives = prevLives - 1;
            setTimeout(() => {
                proceedNext(nextLives);
            }, 1200);
            return nextLives;
        });
    };

    const handleAnswer = (option) => {
        if (isAnswering || isGameOver || selectedOption !== null) return;
        if (timerRef.current) clearInterval(timerRef.current);

        setIsAnswering(true);
        setSelectedOption(option);

        const isCorrect = option.en.toLowerCase() === currentQ.target.en.toLowerCase();

        if (isCorrect) {
            speak(currentQ.target.en);
            setStreak(st => st + 1);
            setScore(s => s + 10 + (streak + 1) * 2);
            setTimeout(() => {
                proceedNext(lives);
            }, 600);
        } else {
            setStreak(0);
            setLives(prevLives => {
                const nextLives = prevLives - 1;
                setTimeout(() => {
                    proceedNext(nextLives);
                }, 1200);
                return nextLives;
            });
        }
    };

    if (!words || words.length < 4) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200 dark:border-slate-800 text-center">
                <Heart size={56} className="text-rose-400 mb-4 animate-bounce" />
                <h2 className="text-xl font-bold text-gray-700 dark:text-slate-300">Cần ít nhất 4 từ vựng để mở chế độ Sinh Tồn</h2>
            </div>
        );
    }

    if (isGameOver) {
        return (
            <div className="max-w-md mx-auto bg-gradient-to-br from-rose-600 via-red-600 to-orange-600 p-8 md:p-10 rounded-3xl shadow-2xl text-white text-center animate-fade-in my-8 border-2 border-rose-400/40">
                <Trophy size={64} className="mx-auto mb-3 text-yellow-300 animate-bounce drop-shadow-[0_10px_15px_rgba(0,0,0,0.3)]" />
                <h2 className="text-3xl md:text-5xl font-black mb-2 tracking-tight">Hết Mạng!</h2>
                <p className="text-lg opacity-90 mb-4">Bạn đã trụ lại được tổng cộng <strong className="text-3xl text-yellow-300 font-black">{score}</strong> điểm.</p>
                {score >= highScore && score > 0 && (
                    <div className="bg-white/20 backdrop-blur-xs px-4 py-2 rounded-2xl mb-6 inline-block font-black text-sm border border-white/30">
                        🏆 KỶ LỤC ĐIỂM CAO MỚI! 🏆
                    </div>
                )}
                <div className="flex justify-center">
                    <button 
                        onClick={initGame}
                        className="px-8 py-4 bg-white text-rose-600 hover:bg-rose-50 rounded-2xl font-black shadow-xl transition transform hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer text-lg"
                    >
                        <RotateCcw size={20} /> Chơi Lại Màn Mới
                    </button>
                </div>
            </div>
        );
    }

    if (!currentQ) return null;

    const timePercentage = (timeLeft / QUESTION_TIME) * 100;
    const isUrgent = timeLeft <= 2.0;

    let barGradient = 'from-emerald-400 to-teal-500';
    if (timeLeft <= 2) barGradient = 'from-rose-500 to-red-600';
    else if (timeLeft <= 3.8) barGradient = 'from-amber-400 to-orange-500';

    return (
        <div className="max-w-2xl mx-auto space-y-4 md:space-y-6 animate-fade-in pb-16">
            {/* Header Stats */}
            <div className="bg-gradient-to-r from-rose-500/10 via-orange-500/10 to-amber-500/10 dark:from-rose-950/40 dark:via-orange-950/40 dark:to-amber-950/40 p-4 md:p-5 rounded-3xl border border-rose-200/50 dark:border-rose-800/40 backdrop-blur-xl shadow-lg flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-5 sm:gap-8 px-2">
                    {/* Hearts Lives */}
                    <div className="flex items-center gap-1.5">
                        {[1, 2, 3].map(i => (
                            <Heart 
                                key={i} 
                                size={28} 
                                className={`${
                                    i <= lives 
                                        ? 'fill-rose-500 text-rose-500 drop-shadow-[0_2px_8px_rgba(244,63,94,0.4)] animate-pulse' 
                                        : 'text-gray-300 dark:text-slate-700 opacity-40'
                                } transition-all duration-300`} 
                            />
                        ))}
                    </div>

                    <div className="w-px h-8 bg-rose-200 dark:bg-rose-800/50 hidden sm:block"></div>

                    {/* Score */}
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                            <Zap size={20} />
                        </div>
                        <div>
                            <span className="text-[10px] font-black tracking-widest uppercase text-gray-400 dark:text-slate-400">Điểm</span>
                            <p className="text-2xl font-black text-gray-900 dark:text-white leading-none">{score}</p>
                        </div>
                    </div>

                    {/* Streak */}
                    {streak > 1 && (
                        <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs shadow-md shadow-orange-500/30 animate-bounce">
                            <Flame size={15} /> x{streak}!
                        </div>
                    )}
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-amber-300/60 dark:border-amber-500/30 text-xs font-black text-amber-600 dark:text-amber-400 shadow-sm">
                        <Trophy size={16} className="text-amber-500" /> Kỷ lục: {highScore}
                    </div>
                    <button
                        onClick={initGame}
                        className="p-2.5 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-slate-700 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-2xl transition cursor-pointer shadow-sm active:scale-95"
                        title="Chơi lại từ đầu"
                    >
                        <RotateCcw size={18} />
                    </button>
                </div>
            </div>

            {/* Main Question Card with Urgency Glow */}
            <div className={`bg-white dark:bg-slate-900 p-5 md:p-8 rounded-3xl shadow-xl border-2 transition-all relative overflow-hidden ${
                isUrgent 
                    ? 'border-rose-500 dark:border-rose-500 shadow-rose-500/20 danger-pulse' 
                    : 'border-gray-200/80 dark:border-slate-800 shadow-indigo-500/5'
            }`}>
                {/* Glowing Laser Timer Bar */}
                <div className="absolute top-0 left-0 w-full h-3 bg-gray-100 dark:bg-slate-800">
                    <div 
                        className={`h-full bg-gradient-to-r ${barGradient} transition-all duration-75 ease-linear shadow-md`}
                        style={{ width: `${timePercentage}%` }}
                    ></div>
                </div>

                <div className="text-center mt-4 mb-6">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 dark:bg-slate-800 text-[11px] font-black uppercase text-gray-500 dark:text-slate-400 tracking-wider mb-3">
                        <Timer size={14} className={isUrgent ? 'text-rose-500 animate-spin' : 'text-indigo-500'} />
                        <span className={isUrgent ? 'text-rose-600 dark:text-rose-400 font-bold' : ''}>
                            {timeLeft.toFixed(1)}s còn lại
                        </span>
                    </div>

                    <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight break-words flex items-center justify-center gap-3">
                        {currentQ.target.en}
                        <button 
                            onClick={(e) => speak(currentQ.target.en, e)}
                            className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-2xl hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition cursor-pointer shrink-0 shadow-sm"
                            title="Nghe phát âm"
                        >
                            <Volume2 size={22} />
                        </button>
                    </h2>
                    {currentQ.target.ipa && (
                        <p className="text-gray-400 dark:text-slate-500 font-mono text-base md:text-lg mt-1.5">{currentQ.target.ipa}</p>
                    )}
                </div>

                {/* 3D-effect Options Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    {currentQ.options.map((opt, idx) => {
                        const isTarget = opt.en.toLowerCase() === currentQ.target.en.toLowerCase();
                        const isSelected = selectedOption && selectedOption !== 'TIMEOUT' && selectedOption.en.toLowerCase() === opt.en.toLowerCase();
                        
                        let buttonClass = "group p-4 bg-gradient-to-b from-white to-gray-50 dark:from-slate-800 dark:to-slate-850 border-2 border-gray-200/80 dark:border-slate-700/80 rounded-2xl text-gray-800 dark:text-gray-100 font-bold hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-0.5 transition-all text-left relative overflow-hidden cursor-pointer active:scale-98 shadow-sm";
                        let icon = null;

                        if (isAnswering) {
                            if (isTarget) {
                                buttonClass = "p-4 bg-gradient-to-b from-emerald-50 to-teal-50 dark:from-emerald-950/60 dark:to-teal-950/60 border-2 border-emerald-500 rounded-2xl text-emerald-900 dark:text-emerald-200 font-black text-left relative overflow-hidden shadow-md shadow-emerald-500/20";
                                icon = <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500" size={24} />;
                            } else if (isSelected) {
                                buttonClass = "p-4 bg-gradient-to-b from-rose-50 to-red-50 dark:from-rose-950/60 dark:to-red-950/60 border-2 border-rose-500 rounded-2xl text-rose-900 dark:text-rose-200 font-black text-left relative overflow-hidden shadow-md shadow-rose-500/20";
                                icon = <XCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-500" size={24} />;
                            } else {
                                buttonClass = "p-4 bg-gray-50/50 dark:bg-slate-800/30 border-2 border-transparent rounded-2xl text-gray-400 dark:text-slate-600 font-medium text-left opacity-35 cursor-default";
                            }
                        }

                        return (
                            <button 
                                key={`${opt.id || opt.en}-${idx}`}
                                className={buttonClass}
                                onClick={() => handleAnswer(opt)}
                                disabled={isAnswering}
                            >
                                <span className="block text-base md:text-lg leading-snug break-words pr-7">
                                    {opt.vi}
                                </span>
                                {icon}
                            </button>
                        );
                    })}
                </div>

                {/* Timeout Indicator */}
                {selectedOption === 'TIMEOUT' && (
                    <div className="mt-4 p-3 bg-rose-50 dark:bg-rose-950/50 border-2 border-rose-500/50 rounded-2xl text-center text-xs font-black text-rose-600 dark:text-rose-400 animate-bounce">
                        ⚡ HẾT GIỜ! BỊ TRỪ 1 TRÁI TIM! 💔
                    </div>
                )}
            </div>
        </div>
    );
}
