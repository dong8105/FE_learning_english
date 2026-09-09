import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Heart, Trophy, Timer, Volume2, CheckCircle2, XCircle, RotateCcw, Play, Zap } from 'lucide-react';

const QUESTION_TIME = 6; // 6 seconds per question

export default function SurvivalGame({ words, speak }) {
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [currentQ, setCurrentQ] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null); // the option object chosen or 'TIMEOUT'
    const [isGameOver, setIsGameOver] = useState(false);
    const [isAnswering, setIsAnswering] = useState(false); // true while showing answer result
    const [highScore, setHighScore] = useState(() => {
        return parseInt(localStorage.getItem('survival_high_score')) || 0;
    });

    const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
    const timerRef = useRef(null);
    const questionStartTimeRef = useRef(null);

    // Generate 1 target word and 3 distractors
    const generateQuestion = useCallback(() => {
        if (!words || words.length < 4) return null;

        // Valid words with English and Vietnamese
        const validWords = words.filter(w => w.en && w.vi);
        if (validWords.length < 4) return null;

        // Pick 1 target
        const target = validWords[Math.floor(Math.random() * validWords.length)];

        // Pick 3 distractors with different English and Vietnamese
        const otherWords = validWords.filter(w => w.en.toLowerCase() !== target.en.toLowerCase() && w.vi !== target.vi);
        const shuffledOthers = [...otherWords].sort(() => 0.5 - Math.random());
        const distractors = shuffledOthers.slice(0, 3);

        // Combine & shuffle 4 options
        const options = [target, ...distractors].sort(() => 0.5 - Math.random());

        return {
            target,
            options,
        };
    }, [words]);

    // Move to next question or end game
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

    // Start or restart game
    const initGame = useCallback(() => {
        if (!words || words.length < 4) return;
        if (timerRef.current) clearInterval(timerRef.current);

        setScore(0);
        setLives(3);
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

    // Handle Timeout
    const handleTimeout = () => {
        if (isAnswering || isGameOver) return;
        if (timerRef.current) clearInterval(timerRef.current);

        setIsAnswering(true);
        setSelectedOption('TIMEOUT');

        setLives(prevLives => {
            const nextLives = prevLives - 1;
            setTimeout(() => {
                proceedNext(nextLives);
            }, 1200);
            return nextLives;
        });
    };

    // Handle Option Click
    const handleAnswer = (option) => {
        if (isAnswering || isGameOver || selectedOption !== null) return;
        if (timerRef.current) clearInterval(timerRef.current);

        setIsAnswering(true);
        setSelectedOption(option);

        const isCorrect = option.en.toLowerCase() === currentQ.target.en.toLowerCase();

        if (isCorrect) {
            speak(currentQ.target.en);
            setScore(s => s + 1);
            setTimeout(() => {
                proceedNext(lives);
            }, 700);
        } else {
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
            <div className="flex flex-col items-center justify-center p-10 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-800">
                <Heart size={48} className="text-gray-300 dark:text-slate-600 mb-4" />
                <h2 className="text-xl font-bold text-gray-600 dark:text-slate-400">Cần ít nhất 4 từ vựng để chơi Sinh Tồn</h2>
                <p className="text-sm text-gray-400 mt-1">Hãy chọn danh mục hoặc bài học có nhiều từ hơn để bắt đầu!</p>
            </div>
        );
    }

    if (isGameOver) {
        return (
            <div className="max-w-md mx-auto bg-gradient-to-br from-red-500 to-rose-600 p-8 rounded-3xl shadow-lg text-white text-center animate-fade-in my-6">
                <Trophy size={64} className="mx-auto mb-4 text-yellow-300 animate-bounce" />
                <h2 className="text-4xl font-black mb-2">Game Over!</h2>
                <p className="text-xl opacity-90 mb-4">Bạn đã sinh tồn được <strong className="text-3xl font-black">{score}</strong> câu.</p>
                {score >= highScore && score > 0 && (
                    <div className="bg-white/20 p-3 rounded-xl mb-6 inline-block font-bold">
                        🎉 Kỷ Lục Mới Của Bạn! 🎉
                    </div>
                )}
                <div className="flex justify-center">
                    <button 
                        onClick={initGame}
                        className="px-8 py-4 bg-white text-red-600 hover:bg-red-50 rounded-2xl font-black shadow-md transition transform hover:scale-105 flex items-center gap-2 cursor-pointer"
                    >
                        <RotateCcw size={20} /> Chơi Lại Màn Mới
                    </button>
                </div>
            </div>
        );
    }

    if (!currentQ) return null;

    // Timer bar percentage and color
    const timePercentage = (timeLeft / QUESTION_TIME) * 100;
    let barColor = 'bg-green-500';
    if (timeLeft <= 2) barColor = 'bg-red-500';
    else if (timeLeft <= 3.8) barColor = 'bg-amber-500';

    return (
        <div className="max-w-2xl mx-auto space-y-4 md:space-y-6 animate-fade-in pb-16">
            {/* Header Stats */}
            <div className="flex flex-wrap items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-800 gap-4">
                <div className="flex items-center gap-5 px-2">
                    {/* Lives */}
                    <div className="flex items-center gap-1">
                        {[1, 2, 3].map(i => (
                            <Heart 
                                key={i} 
                                size={26} 
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
                
                {/* High Score & Restart */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/30 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-400">
                        <Trophy size={16} /> Kỷ lục: {highScore}
                    </div>
                    <button
                        onClick={initGame}
                        className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl transition cursor-pointer"
                        title="Chơi lại từ đầu"
                    >
                        <RotateCcw size={16} />
                    </button>
                </div>
            </div>

            {/* Main Question Card */}
            <div className="bg-white dark:bg-slate-900 p-5 md:p-8 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-800 relative transition-colors overflow-hidden">
                {/* Timer Bar */}
                <div className="absolute top-0 left-0 w-full h-2.5 bg-gray-100 dark:bg-slate-800">
                    <div 
                        className={`h-full ${barColor} transition-all duration-75 ease-linear`}
                        style={{ width: `${timePercentage}%` }}
                    ></div>
                </div>

                <div className="text-center mt-4 mb-6">
                    <p className="text-[11px] font-black uppercase text-gray-400 dark:text-slate-500 tracking-wider mb-2 flex items-center justify-center gap-1.5">
                        <Timer size={15} /> {timeLeft.toFixed(1)}s - Chọn nghĩa đúng thật nhanh!
                    </p>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-indigo-700 dark:text-indigo-400 break-words flex items-center justify-center gap-3">
                        {currentQ.target.en}
                        <button 
                            onClick={(e) => speak(currentQ.target.en, e)}
                            className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition cursor-pointer shrink-0"
                            title="Nghe phát âm"
                        >
                            <Volume2 size={20} />
                        </button>
                    </h2>
                    {currentQ.target.ipa && (
                        <p className="text-gray-400 dark:text-slate-500 font-mono text-base mt-1">{currentQ.target.ipa}</p>
                    )}
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 md:gap-4">
                    {currentQ.options.map((opt, idx) => {
                        const isTarget = opt.en.toLowerCase() === currentQ.target.en.toLowerCase();
                        const isSelected = selectedOption && selectedOption !== 'TIMEOUT' && selectedOption.en.toLowerCase() === opt.en.toLowerCase();
                        
                        let buttonClass = "p-3.5 md:p-4 bg-gray-50 dark:bg-slate-800/60 border-2 border-gray-200/60 dark:border-slate-700/60 rounded-2xl text-gray-700 dark:text-gray-200 font-bold hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:border-indigo-300 dark:hover:border-indigo-700 transition text-left relative overflow-hidden cursor-pointer active:scale-98";
                        let icon = null;

                        if (isAnswering) {
                            if (isTarget) {
                                // Correct answer highlights in green
                                buttonClass = "p-3.5 md:p-4 bg-green-50 dark:bg-green-950/40 border-2 border-green-500 rounded-2xl text-green-800 dark:text-green-300 font-bold text-left relative overflow-hidden";
                                icon = <CheckCircle2 className="absolute right-3.5 top-1/2 -translate-y-1/2 text-green-500" size={22} />;
                            } else if (isSelected) {
                                // Wrong selected answer highlights in red
                                buttonClass = "p-3.5 md:p-4 bg-red-50 dark:bg-red-950/40 border-2 border-red-500 rounded-2xl text-red-800 dark:text-red-300 font-bold text-left relative overflow-hidden";
                                icon = <XCircle className="absolute right-3.5 top-1/2 -translate-y-1/2 text-red-500" size={22} />;
                            } else {
                                // Dim others
                                buttonClass = "p-3.5 md:p-4 bg-gray-50 dark:bg-slate-800/30 border-2 border-transparent rounded-2xl text-gray-400 dark:text-slate-600 font-medium text-left opacity-40 cursor-default";
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
                    <div className="mt-4 p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 rounded-xl text-center text-xs font-bold text-red-600 dark:text-red-400 animate-pulse">
                        ⏰ Hết giờ rồi! Bị trừ 1 mạng ❤️
                    </div>
                )}
            </div>
        </div>
    );
}
