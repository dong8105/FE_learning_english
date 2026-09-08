import React, { useState, useEffect } from 'react';
import { RefreshCw, Trophy, Clock, Target } from 'lucide-react';

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

    const initGame = () => {
        if (!words || words.length < 8) return;
        
        // Pick 8 random unique words
        const shuffledWords = [...words].sort(() => 0.5 - Math.random()).slice(0, 8);
        
        // Create 16 cards (8 EN, 8 VI)
        const deck = [];
        shuffledWords.forEach(word => {
            deck.push({ id: `en_${word.id}`, text: word.en, type: 'en', wordId: word.id, originalWord: word });
            deck.push({ id: `vi_${word.id}`, text: word.vi, type: 'vi', wordId: word.id, originalWord: word });
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
    };

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [words]);

    const handleCardClick = (index) => {
        // Prevent clicking if game finished, card already flipped, card already matched, or waiting for animation
        if (isFinished) return;
        if (flippedIndexes.includes(index)) return;
        if (matchedIds.includes(cards[index].wordId)) return;
        if (flippedIndexes.length === 2) return;

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
                // Match
                setTimeout(() => {
                    setMatchedIds(prev => {
                        const newMatched = [...prev, firstCard.wordId];
                        if (newMatched.length === 8) {
                            handleWin();
                        }
                        return newMatched;
                    });
                    setFlippedIndexes([]);
                    // Optional: speak again on match
                    speak(firstCard.type === 'en' ? firstCard.text : secondCard.text);
                }, 500);
            } else {
                // No match
                setTimeout(() => {
                    setFlippedIndexes([]);
                }, 1000);
            }
        }
    };

    const handleWin = () => {
        setIsFinished(true);
        const finalTime = Math.floor((Date.now() - startTime) / 1000);
        if (!bestTime || finalTime < bestTime) {
            setBestTime(finalTime);
            localStorage.setItem('memory_match_best_time', finalTime.toString());
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
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-10">
            {/* Header Stats */}
            <div className="flex flex-wrap items-center justify-between bg-white dark:bg-slate-900 p-4 md:p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-800 gap-4">
                <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Lượt lật</span>
                        <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{moves}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Thời gian</span>
                        <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                            <Clock size={20} className="hidden sm:block opacity-50" />
                            {formatTime(elapsedTime)}
                        </span>
                    </div>
                    {bestTime && (
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Kỷ lục</span>
                            <span className="text-2xl font-black text-amber-500 flex items-center gap-2">
                                <Trophy size={20} className="hidden sm:block opacity-50" />
                                {formatTime(bestTime)}
                            </span>
                        </div>
                    )}
                </div>
                <button 
                    onClick={initGame}
                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold flex items-center gap-2 transition"
                >
                    <RefreshCw size={18} /> Lập lại
                </button>
            </div>

            {/* Victory Screen */}
            {isFinished && (
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 rounded-3xl shadow-lg text-white text-center animate-fade-in">
                    <Trophy size={64} className="mx-auto mb-4 text-yellow-300 animate-bounce" />
                    <h2 className="text-4xl font-black mb-2">Tuyệt Vời!</h2>
                    <p className="text-lg opacity-90 mb-6">Bạn đã hoàn thành với {moves} lượt lật trong {formatTime(elapsedTime)}.</p>
                    <button 
                        onClick={initGame}
                        className="px-8 py-4 bg-white text-green-600 hover:bg-green-50 rounded-2xl font-black shadow-md transition transform hover:scale-105"
                    >
                        Chơi Lại Ngay
                    </button>
                </div>
            )}

            {/* Game Grid */}
            <div className="grid grid-cols-4 gap-3 md:gap-4 perspective-1000">
                {cards.map((card, index) => {
                    const isFlipped = flippedIndexes.includes(index) || matchedIds.includes(card.wordId);
                    const isMatched = matchedIds.includes(card.wordId);

                    return (
                        <div 
                            key={`${card.id}-${index}`}
                            onClick={() => handleCardClick(index)}
                            className={`relative aspect-square md:aspect-[4/3] cursor-pointer transition-all duration-500 transform-style-3d ${
                                isFlipped ? 'rotate-y-180' : ''
                            }`}
                        >
                            {/* Card Front (Hidden when flipped) */}
                            <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl shadow-sm border border-indigo-400 dark:border-indigo-700 flex items-center justify-center hover:shadow-md transition-shadow">
                                <span className="text-4xl opacity-50">?</span>
                            </div>

                            {/* Card Back (Visible when flipped) */}
                            <div className={`absolute inset-0 backface-hidden rotate-y-180 rounded-2xl shadow-sm flex items-center justify-center p-3 text-center transition-colors ${
                                isMatched 
                                    ? 'bg-green-100 dark:bg-green-900/40 border-2 border-green-500 dark:border-green-500' 
                                    : 'bg-white dark:bg-slate-800 border-2 border-indigo-200 dark:border-slate-700'
                            }`}>
                                <span className={`font-bold break-words w-full ${
                                    card.type === 'en' 
                                        ? 'text-indigo-700 dark:text-indigo-300 text-lg md:text-2xl' 
                                        : 'text-gray-700 dark:text-gray-300 text-sm md:text-lg'
                                }`}>
                                    {card.text}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
