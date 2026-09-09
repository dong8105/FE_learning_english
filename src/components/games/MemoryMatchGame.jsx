import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Trophy, Clock, Target, Sparkles, CheckCircle2 } from 'lucide-react';

export default function MemoryMatchGame({ words, speak }) {
    const [cards, setCards] = useState([]);
    const [flippedIndexes, setFlippedIndexes] = useState([]);
    const [matchedIds, setMatchedIds] = useState([]);
    const [moves, setMoves] = useState(0);
    const [startTime, setStartTime] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [bestTime, setBestTime] = useState(() => {
        return parseInt(localStorage.getItem('memory_match_best_time')) || null;
    });

    const initGame = useCallback(() => {
        if (!words || words.length < 8) return;
        
        // Filter words with valid en and vi
        const validWords = words.filter(w => w.en && w.vi);
        if (validWords.length < 8) return;

        // Pick 8 random unique words
        const shuffledWords = [...validWords].sort(() => 0.5 - Math.random()).slice(0, 8);
        
        // Create 16 cards (8 EN, 8 VI)
        const deck = [];
        shuffledWords.forEach((word, idx) => {
            const uniqueWordId = word.id || `word-${idx}-${word.en}`;
            const cleanEn = word.en.replace(/\(.*?\)/g, '').trim();
            deck.push({ id: `en_${uniqueWordId}`, text: cleanEn, type: 'en', wordId: uniqueWordId, originalWord: word });
            deck.push({ id: `vi_${uniqueWordId}`, text: word.vi, type: 'vi', wordId: uniqueWordId, originalWord: word });
        });
        
        // Shuffle deck
        deck.sort(() => 0.5 - Math.random());
        
        setCards(deck);
        setFlippedIndexes([]);
        setMatchedIds([]);
        setMoves(0);
        setStartTime(Date.now());
        setElapsedTime(0);
        setIsFinished(false);
    }, [words]);

    // Timer effect
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
        
        // Read the word if it's English
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
                // No match, flip back
                setTimeout(() => {
                    setFlippedIndexes([]);
                }, 900);
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
            <div className="flex flex-col items-center justify-center p-10 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-800">
                <Target size={48} className="text-gray-300 dark:text-slate-600 mb-4" />
                <h2 className="text-xl font-bold text-gray-600 dark:text-slate-400">Cần ít nhất 8 từ vựng để chơi Lật Thẻ Nhớ</h2>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-4 md:space-y-6 animate-fade-in pb-16">
            {/* Header Stats */}
            <div className="flex flex-wrap items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-800 gap-4">
                <div className="flex items-center gap-6 px-2">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Lượt lật</span>
                        <span className="text-2xl font-black text-blue-600 dark:text-blue-400 leading-none">{moves}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Thời gian</span>
                        <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 leading-none">
                            <Clock size={18} className="opacity-50" />
                            {formatTime(elapsedTime)}
                        </span>
                    </div>
                    {bestTime && (
                        <div className="flex flex-col hidden sm:flex">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Kỷ lục</span>
                            <span className="text-2xl font-black text-amber-500 flex items-center gap-1.5 leading-none">
                                <Trophy size={18} className="opacity-50" />
                                {formatTime(bestTime)}
                            </span>
                        </div>
                    )}
                </div>
                <button 
                    onClick={initGame}
                    className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm flex items-center gap-2 transition cursor-pointer"
                >
                    <RefreshCw size={16} /> Chơi Lại
                </button>
            </div>

            {/* Victory Screen */}
            {isFinished && (
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 md:p-8 rounded-3xl shadow-lg text-white text-center animate-fade-in my-4">
                    <Trophy size={56} className="mx-auto mb-3 text-yellow-300 animate-bounce" />
                    <h2 className="text-3xl md:text-4xl font-black mb-1">Xuất Sắc!</h2>
                    <p className="text-base md:text-lg opacity-90 mb-4">Bạn đã lật xong tất cả thẻ với {moves} lượt trong {formatTime(elapsedTime)}.</p>
                    <button 
                        onClick={initGame}
                        className="px-7 py-3.5 bg-white text-green-700 hover:bg-green-50 rounded-2xl font-black shadow-md transition transform hover:scale-105 cursor-pointer text-base"
                    >
                        Chơi Ván Mới
                    </button>
                </div>
            )}

            {/* Game Grid (4x4) */}
            <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4 select-none">
                {cards.map((card, index) => {
                    const isFlipped = flippedIndexes.includes(index) || matchedIds.includes(card.wordId);
                    const isMatched = matchedIds.includes(card.wordId);

                    return (
                        <div 
                            key={`${card.id}-${index}`}
                            onClick={() => handleCardClick(index)}
                            className={`relative aspect-[3/4] sm:aspect-square md:aspect-[4/3] rounded-2xl transition-all duration-300 transform cursor-pointer ${
                                isMatched 
                                    ? 'opacity-85 scale-95' 
                                    : isFlipped 
                                    ? 'scale-100' 
                                    : 'hover:scale-103 active:scale-95'
                            }`}
                        >
                            {!isFlipped ? (
                                /* Card Face Down */
                                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl shadow-sm border border-indigo-400 dark:border-indigo-700 flex flex-col items-center justify-center text-white">
                                    <span className="text-2xl sm:text-3xl md:text-4xl font-black opacity-40">?</span>
                                </div>
                            ) : (
                                /* Card Face Up */
                                <div className={`w-full h-full rounded-2xl shadow-sm p-2 sm:p-3 flex flex-col items-center justify-center text-center transition-colors overflow-hidden ${
                                    isMatched 
                                        ? 'bg-green-100 dark:bg-green-950/50 border-2 border-green-500' 
                                        : 'bg-white dark:bg-slate-800 border-2 border-indigo-400 dark:border-slate-600'
                                }`}>
                                    <span className={`font-bold leading-tight line-clamp-3 break-words ${
                                        card.type === 'en' 
                                            ? 'text-indigo-700 dark:text-indigo-300 text-sm sm:text-base md:text-xl font-black' 
                                            : 'text-gray-800 dark:text-gray-200 text-xs sm:text-xs md:text-sm'
                                    }`}>
                                        {card.text}
                                    </span>
                                    {isMatched && (
                                        <CheckCircle2 size={14} className="text-green-500 mt-1 shrink-0" />
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
