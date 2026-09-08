import React, { useState, useEffect, useRef } from 'react';
import { Heart, Trophy, Timer, Volume2, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';

export default function SurvivalGame({ words, speak }) {
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [currentQ, setCurrentQ] = useState(null);
    const [selectedOptionId, setSelectedOptionId] = useState(null);
    const [isGameOver, setIsGameOver] = useState(false);
    const [highScore, setHighScore] = useState(() => {
        return parseInt(localStorage.getItem('survival_high_score')) || 0;
    });

    const [timeLeft, setTimeLeft] = useState(5);
    const timerRef = useRef(null);
    const [isPaused, setIsPaused] = useState(false); // Used when showing answer

    const TIME_LIMIT = 5;

    const generateQuestion = () => {
        if (!words || words.length < 4) return null;
        
        // Randomly pick a target word
        const target = words[Math.floor(Math.random() * words.length)];
        
        // Pick 3 distractors
        const distractors = [];
        const availableDistractors = words.filter(w => w.id !== target.id);
        
        // Need to ensure unique distractors
        const shuffledAvailable = availableDistractors.sort(() => 0.5 - Math.random());
        distractors.push(...shuffledAvailable.slice(0, 3));
        
        // Combine and shuffle
        const options = [target, ...distractors].sort(() => 0.5 - Math.random());
        
        return {
            target,
            options
        };
    };

    const startNextQuestion = () => {
        const nextQ = generateQuestion();
        setCurrentQ(nextQ);
        setSelectedOptionId(null);
        setTimeLeft(TIME_LIMIT);
        setIsPaused(false);
    };

    const initGame = () => {
        if (!words || words.length < 4) return;
        setScore(0);
        setLives(3);
        setIsGameOver(false);
        startNextQuestion();
    };

    useEffect(() => {
        initGame();
        return () => clearInterval(timerRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [words]);

    // Timer logic
    useEffect(() => {
        if (isGameOver || isPaused || !currentQ) return;

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 0.1) {
                    clearInterval(timerRef.current);
                    handleTimeout();
                    return 0;
                }
                return prev - 0.1;
            });
        }, 100);

        return () => clearInterval(timerRef.current);
    }, [isGameOver, isPaused, currentQ]);

    const handleTimeout = () => {
        setIsPaused(true);
        // Timeout means wrong answer essentially (but no selection)
        setSelectedOptionId('TIMEOUT');
        handleLifeLoss();
    };

    const handleAnswer = (option) => {
        if (isPaused || isGameOver || selectedOptionId !== null) return;
        
        setIsPaused(true);
        setSelectedOptionId(option.id);
        
        if (option.id === currentQ.target.id) {
            // Correct
            speak(option.en);
            setScore(s => s + 1);
            setTimeout(() => {
                startNextQuestion();
            }, 800);
        } else {
            // Wrong
            handleLifeLoss();
        }
    };

    const handleLifeLoss = () => {
        setLives(l => {
            const newLives = l - 1;
            if (newLives <= 0) {
                setTimeout(() => {
                    handleGameOver();
                }, 1500);
            } else {
                setTimeout(() => {
                    startNextQuestion();
                }, 1500);
            }
            return newLives;
        });
    };

    const handleGameOver = () => {
        setIsGameOver(true);
        if (score > highScore) {
            setHighScore(score);
            localStorage.setItem('survival_high_score', score.toString());
        }
    };

    if (!words || words.length < 4) {
        return (
            <div className="flex flex-col items-center justify-center p-10 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-800">
                <Heart size={48} className="text-gray-300 dark:text-slate-600 mb-4" />
                <h2 className="text-xl font-bold text-gray-600 dark:text-slate-400">Cần ít nhất 4 từ vựng để chơi Sinh Tồn</h2>
            </div>
        );
    }

    if (isGameOver) {
        return (
            <div className="max-w-md mx-auto bg-gradient-to-br from-red-500 to-rose-600 p-8 rounded-3xl shadow-lg text-white text-center animate-fade-in">
                <Trophy size={64} className="mx-auto mb-4 text-yellow-300 animate-bounce" />
                <h2 className="text-4xl font-black mb-2">Game Over!</h2>
                <p className="text-xl opacity-90 mb-6">Bạn đã sinh tồn được <strong className="text-3xl">{score}</strong> câu.</p>
                {score >= highScore && score > 0 && (
                    <div className="bg-white/20 p-3 rounded-xl mb-6 inline-block font-bold">
                        🎉 Kỷ Lục Mới! 🎉
                    </div>
                )}
                <div className="flex justify-center mb-6">
                    <button 
                        onClick={initGame}
                        className="px-8 py-4 bg-white text-red-600 hover:bg-red-50 rounded-2xl font-black shadow-md transition transform hover:scale-105 flex items-center gap-2"
                    >
                        <RotateCcw size={20} /> Chơi Lại Màn Mới
                    </button>
                </div>
            </div>
        );
    }

    if (!currentQ) return null;

    // Progress bar color based on time left
    let barColor = 'bg-green-500';
    if (timeLeft <= 2) barColor = 'bg-red-500';
    else if (timeLeft <= 3.5) barColor = 'bg-amber-500';

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in pb-10">
            {/* Header Stats */}
            <div className="flex flex-wrap items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-800 gap-4">
                <div className="flex items-center gap-6 px-2">
                    {/* Lives */}
                    <div className="flex gap-1">
                        {[1, 2, 3].map(i => (
                            <Heart 
                                key={i} 
                                size={28} 
                                className={`${i <= lives ? 'fill-red-500 text-red-500 animate-pulse' : 'text-gray-300 dark:text-slate-700'}`} 
                            />
                        ))}
                    </div>
                    <div className="w-px h-8 bg-gray-200 dark:bg-slate-700"></div>
                    {/* Score */}
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Điểm</span>
                        <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 leading-none">{score}</span>
                    </div>
                </div>
                
                {/* High Score */}
                <div className="flex items-center gap-2 px-2 bg-amber-50 dark:bg-amber-900/20 py-2 rounded-xl text-amber-600 dark:text-amber-500 font-bold">
                    <Trophy size={18} /> Kỷ lục: {highScore}
                </div>
            </div>

            {/* Main Question Card */}
            <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-800 relative transition-colors overflow-hidden">
                {/* Timer Bar */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gray-100 dark:bg-slate-800">
                    <div 
                        className={`h-full ${barColor} transition-all duration-100 ease-linear`}
                        style={{ width: `${(timeLeft / TIME_LIMIT) * 100}%` }}
                    ></div>
                </div>

                <div className="text-center mt-6 mb-8">
                    <p className="text-xs font-black uppercase text-gray-400 dark:text-slate-500 tracking-wider mb-2 flex items-center justify-center gap-2">
                        <Timer size={16} /> Nhanh tay chọn nghĩa của từ
                    </p>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-indigo-700 dark:text-indigo-400 break-words flex items-center justify-center gap-3">
                        {currentQ.target.en}
                        <button 
                            onClick={(e) => speak(currentQ.target.en, e)}
                            className="p-2 md:p-3 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition cursor-pointer"
                        >
                            <Volume2 size={24} />
                        </button>
                    </h2>
                    {currentQ.target.ipa && (
                        <p className="text-gray-400 dark:text-slate-500 font-mono text-xl mt-2">{currentQ.target.ipa}</p>
                    )}
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    {currentQ.options.map((opt) => {
                        const isTarget = opt.id === currentQ.target.id;
                        const isSelected = opt.id === selectedOptionId;
                        
                        let buttonClass = "p-4 bg-gray-50 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl text-gray-700 dark:text-gray-300 font-bold hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-200 dark:hover:border-indigo-800 transition text-left relative overflow-hidden";
                        let icon = null;

                        if (isPaused) {
                            if (isTarget) {
                                // Correct answer highlights in green
                                buttonClass = "p-4 bg-green-50 dark:bg-green-900/30 border-2 border-green-500 rounded-2xl text-green-700 dark:text-green-400 font-bold text-left relative overflow-hidden";
                                icon = <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" size={24} />;
                            } else if (isSelected) {
                                // Wrong selected answer highlights in red
                                buttonClass = "p-4 bg-red-50 dark:bg-red-900/30 border-2 border-red-500 rounded-2xl text-red-700 dark:text-red-400 font-bold text-left relative overflow-hidden";
                                icon = <XCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500" size={24} />;
                            } else {
                                // Dim others
                                buttonClass = "p-4 bg-gray-50 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl text-gray-400 dark:text-slate-600 font-bold text-left opacity-50 relative overflow-hidden";
                            }
                        }

                        return (
                            <button 
                                key={opt.id}
                                className={buttonClass}
                                onClick={() => handleAnswer(opt)}
                                disabled={isPaused}
                            >
                                <span className="block text-lg leading-tight break-words pr-8">
                                    {opt.vi}
                                </span>
                                {icon}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
