import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Trophy, Clock, Target, Sparkles, CheckCircle2, Flame, Award } from 'lucide-react';

export default function MemoryMatchGame({ words, speak }) {
    const [cards, setCards] = useState([]);
    const [flippedIndexes, setFlippedIndexes] = useState([]);
    const [matchedIds, setMatchedIds] = useState([]);
    const [moves, setMoves] = useState(0);
    const [combo, setCombo] = useState(0);
    const [startTime, setStartTime] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [score, setScore] = useState(0);
    const [bestTime, setBestTime] = useState(() => {
        return parseInt(localStorage.getItem('memory_match_best_time')) || null;
    });

    const initGame = useCallback(() => {
        if (!words || words.length < 8) return;
        
        const validWords = words.filter(w => w.en && w.vi);
        if (validWords.length < 8) return;

        const shuffledWords = [...validWords].sort(() => 0.5 - Math.random()).slice(0, 8);
        
        const deck = [];
        shuffledWords.forEach((word, idx) => {
            const uniqueWordId = word.id || `word-${idx}-${word.en}`;
            const cleanEn = word.en.replace(/\(.*?\)/g, '').trim();
            deck.push({ id: `en_${uniqueWordId}`, text: cleanEn, type: 'en', wordId: uniqueWordId, originalWord: word });
            deck.push({ id: `vi_${uniqueWordId}`, text: word.vi, type: 'vi', wordId: uniqueWordId, originalWord: word });
        });
        
        deck.sort(() => 0.5 - Math.random());
        
        setCards(deck);
        setFlippedIndexes([]);
        setMatchedIds([]);
        setMoves(0);
        setCombo(0);
        setScore(0);
        setStartTime(Date.now());
        setElapsedTime(0);
        setIsFinished(false);
    }, [words]);

    useEffect(() => {
        let interval;
        if (startTime && !isFinished) {
            interval = setInterval(() => {
                setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [startTime, isFinished]);

    useEffect(() => {
        initGame();
    }, [initGame]);

    const handleWin = useCallback(() => {
        setIsFinished(true);
        const finalTime = Math.floor((Date.now() - (startTime || Date.now())) / 1000);
        if (!bestTime || finalTime < bestTime) {
            setBestTime(finalTime);
            localStorage.setItem('memory_match_best_time', finalTime.toString());
        }
    }, [bestTime, startTime]);

    const handleCardClick = (index) => {
        if (isFinished) return;
        if (flippedIndexes.includes(index)) return;
        if (matchedIds.includes(cards[index].wordId)) return;
        if (flippedIndexes.length >= 2) return;

        const newFlipped = [...flippedIndexes, index];
        setFlippedIndexes(newFlipped);
        
        if (cards[index].type === 'en') {
            speak(cards[index].text);
        }

        if (newFlipped.length === 2) {
            setMoves(m => m + 1);
            const firstCard = cards[newFlipped[0]];
            const secondCard = cards[newFlipped[1]];

            if (firstCard.wordId === secondCard.wordId) {
                // Correct Match
                setTimeout(() => {
                    setCombo(c => c + 1);
                    setScore(s => s + 50 + (combo + 1) * 15);
                    setMatchedIds(prev => {
                        const newMatched = [...prev, firstCard.wordId];
                        if (newMatched.length === 8) {
                            handleWin();
                        }
                        return newMatched;
                    });
                    setFlippedIndexes([]);
                    speak(firstCard.type === 'en' ? firstCard.text : secondCard.text);
                }, 400);
            } else {
                // No match
                setTimeout(() => {
                    setCombo(0);
                    setFlippedIndexes([]);
                }, 850);
            }
        }
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    if (!words || words.length < 8) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-xl border border-indigo-100 dark:border-slate-800 text-center">
                <Target size={56} className="text-indigo-400 mb-4 animate-bounce" />
                <h2 className="text-xl font-bold text-gray-700 dark:text-slate-300">Cần ít nhất 8 từ vựng để mở bàn chơi Lật Thẻ Nhớ</h2>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-4 md:space-y-6 animate-fade-in pb-16">
            {/* Header Stats Bar */}
            <div className="relative overflow-hidden bg-gradient-to-r from-violet-600/10 via-indigo-600/10 to-cyan-500/10 dark:from-violet-950/40 dark:via-indigo-950/40 dark:to-cyan-950/40 p-4 md:p-5 rounded-3xl border border-violet-200/50 dark:border-violet-800/40 backdrop-blur-xl shadow-lg flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-5 sm:gap-8 px-2">
                    {/* Score */}
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
                            <Award size={20} />
                        </div>
                        <div>
                            <span className="text-[10px] font-black tracking-widest uppercase text-gray-400 dark:text-slate-400">Điểm</span>
                            <p className="text-2xl font-black text-gray-900 dark:text-white leading-none">{score}</p>
                        </div>
                    </div>

                    {/* Timer */}
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
                            <Clock size={20} />
                        </div>
                        <div>
                            <span className="text-[10px] font-black tracking-widest uppercase text-gray-400 dark:text-slate-400">Thời gian</span>
                            <p className="text-2xl font-black text-cyan-600 dark:text-cyan-400 leading-none">{formatTime(elapsedTime)}</p>
                        </div>
                    </div>

                    {/* Combo Streak */}
                    {combo > 1 && (
                        <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 text-white font-black text-xs shadow-md shadow-rose-500/30 animate-bounce">
                            <Flame size={15} /> Combo x{combo}!
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {bestTime && (
                        <div className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-amber-300/60 dark:border-amber-500/30 text-xs font-black text-amber-600 dark:text-amber-400 shadow-sm">
                            <Trophy size={16} className="text-amber-500" /> Kỷ lục: {formatTime(bestTime)}
                        </div>
                    )}

                    <button 
                        onClick={initGame}
                        className="px-4.5 py-2.5 bg-white dark:bg-slate-800 hover:bg-violet-50 dark:hover:bg-slate-700 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-700 rounded-2xl font-black text-sm flex items-center gap-2 transition transform active:scale-95 shadow-sm cursor-pointer"
                    >
                        <RefreshCw size={16} /> Chơi Lại
                    </button>
                </div>
            </div>

            {/* Victory Modal Overlay */}
            {isFinished && (
                <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-8 md:p-10 rounded-3xl shadow-2xl text-white text-center animate-fade-in my-4 border-2 border-emerald-400/40">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                    <Trophy size={64} className="mx-auto mb-3 text-yellow-300 animate-bounce drop-shadow-[0_10px_15px_rgba(0,0,0,0.3)]" />
                    <h2 className="text-3xl md:text-5xl font-black mb-2 tracking-tight">Chiến Thắng Hoàn Mỹ! 🎉</h2>
                    <p className="text-base md:text-lg opacity-90 mb-6 max-w-md mx-auto">
                        Bạn đã xuất sắc tìm đúng 8 cặp thẻ với tổng điểm <strong className="text-2xl text-yellow-300">{score}</strong> trong thời gian <strong className="text-2xl text-yellow-300">{formatTime(elapsedTime)}</strong> ({moves} lượt lật).
                    </p>
                    <button 
                        onClick={initGame}
                        className="px-8 py-4 bg-white text-emerald-700 hover:bg-emerald-50 rounded-2xl font-black shadow-xl shadow-emerald-950/20 transition transform hover:scale-105 active:scale-95 cursor-pointer text-lg"
                    >
                        Chơi Ván Tiếp Theo 🚀
                    </button>
                </div>
            )}

            {/* Game Grid (4x4) */}
            <div className="grid grid-cols-4 gap-2.5 sm:gap-3.5 md:gap-4.5 select-none">
                {cards.map((card, index) => {
                    const isFlipped = flippedIndexes.includes(index) || matchedIds.includes(card.wordId);
                    const isMatched = matchedIds.includes(card.wordId);

                    return (
                        <div 
                            key={`${card.id}-${index}`}
                            onClick={() => handleCardClick(index)}
                            className={`group relative aspect-[3/4] sm:aspect-square md:aspect-[4/3] rounded-2xl transition-all duration-300 cursor-pointer ${
                                isMatched 
                                    ? 'opacity-80 scale-95 pointer-events-none' 
                                    : isFlipped 
                                    ? 'scale-100 shadow-md' 
                                    : 'hover:scale-104 hover:-translate-y-1 active:scale-95 shadow-md hover:shadow-xl hover:shadow-indigo-500/10'
                            }`}
                        >
                            {!isFlipped ? (
                                /* Card Face Down (Glossy Holographic Back) */
                                <div className="w-full h-full bg-gradient-to-br from-indigo-600 via-violet-600 to-cyan-600 rounded-2xl p-1 shadow-md border-2 border-indigo-400/40 dark:border-indigo-400/20 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300 group-hover:border-cyan-300">
                                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/25 via-transparent to-black/30"></div>
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center text-white/80 font-black text-xl sm:text-2xl shadow-inner group-hover:scale-110 transition-transform">
                                        ?
                                    </div>
                                </div>
                            ) : (
                                /* Card Face Up */
                                <div className={`w-full h-full rounded-2xl shadow-md p-2 sm:p-3.5 flex flex-col items-center justify-center text-center transition-all overflow-hidden ${
                                    isMatched 
                                        ? 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/60 dark:to-teal-950/60 border-2 border-emerald-500 shadow-emerald-500/20' 
                                        : card.type === 'en'
                                        ? 'bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/80 dark:to-blue-950/80 border-2 border-indigo-500 shadow-indigo-500/20'
                                        : 'bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/80 dark:to-purple-950/80 border-2 border-violet-500 shadow-violet-500/20'
                                }`}>
                                    <span className={`font-black leading-snug line-clamp-3 break-words ${
                                        card.type === 'en' 
                                            ? 'text-indigo-700 dark:text-indigo-300 text-sm sm:text-base md:text-xl' 
                                            : 'text-violet-800 dark:text-violet-300 text-xs sm:text-sm md:text-base'
                                    }`}>
                                        {card.text}
                                    </span>
                                    {isMatched && (
                                        <div className="mt-1.5 flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                                            <CheckCircle2 size={14} /> Khớp!
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
