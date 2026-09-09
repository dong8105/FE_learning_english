import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Shuffle, HelpCircle, Volume2, CheckCircle2, ArrowRight, RotateCcw, Sparkles } from 'lucide-react';

export default function WordScrambleGame({ words, speak }) {
    const [currentWord, setCurrentWord] = useState(null);
    const [scrambledTiles, setScrambledTiles] = useState([]); // { id, char, isUsed }
    const [placedTiles, setPlacedTiles] = useState([]); // { tileId, char }
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [hintsRemaining, setHintsRemaining] = useState(2);
    const [isSolved, setIsSolved] = useState(false);

    // Shuffle array utility
    const shuffleArray = (arr) => {
        const copy = [...arr];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    };

    // Pick new word
    const nextWord = useCallback(() => {
        if (!words || words.length === 0) return;
        const validWords = words.filter(w => w.en && w.en.trim().length >= 3);
        if (validWords.length === 0) return;

        const target = validWords[Math.floor(Math.random() * validWords.length)];
        setCurrentWord(target);

        const cleanLetters = target.en.trim().toUpperCase().split('');
        let shuffled = shuffleArray(cleanLetters);
        // Ensure not identical to original if length > 3
        let attempts = 0;
        while (shuffled.join('') === cleanLetters.join('') && attempts < 5) {
            shuffled = shuffleArray(cleanLetters);
            attempts++;
        }

        const tiles = shuffled.map((char, index) => ({
            id: `tile-${index}-${char}`,
            char,
            isUsed: false,
        }));

        setScrambledTiles(tiles);
        setPlacedTiles([]);
        setIsSolved(false);
        setHintsRemaining(2);
    }, [words]);

    useEffect(() => {
        nextWord();
    }, [nextWord]);

    // Check win condition whenever placedTiles changes
    useEffect(() => {
        if (!currentWord || isSolved) return;

        const currentAnswer = placedTiles.map(t => t.char).join('');
        const targetClean = currentWord.en.trim().toUpperCase();

        if (currentAnswer.length === targetClean.length && currentAnswer === targetClean) {
            setIsSolved(true);
            speak(currentWord.en);
            setScore(s => s + 10 + Math.min(20, targetClean.length * 2));
            setStreak(st => st + 1);
        }
    }, [placedTiles, currentWord, isSolved, speak]);

    // Click tile in bottom pool -> place in slot
    const handlePickTile = (tile) => {
        if (isSolved || tile.isUsed) return;

        setScrambledTiles(prev =>
            prev.map(t => (t.id === tile.id ? { ...t, isUsed: true } : t))
        );

        setPlacedTiles(prev => [...prev, { tileId: tile.id, char: tile.char }]);
    };

    // Click placed tile -> return to bottom pool
    const handleRemovePlaced = (index) => {
        if (isSolved) return;

        const removed = placedTiles[index];
        setPlacedTiles(prev => prev.filter((_, i) => i !== index));

        setScrambledTiles(prev =>
            prev.map(t => (t.id === removed.tileId ? { ...t, isUsed: false } : t))
        );
    };

    // Reset all placed letters
    const handleClearAll = () => {
        if (isSolved) return;
        setPlacedTiles([]);
        setScrambledTiles(prev => prev.map(t => ({ ...t, isUsed: false })));
    };

    // Shuffle unused tiles
    const handleShufflePool = () => {
        setScrambledTiles(prev => {
            const unused = prev.filter(t => !t.isUsed);
            const shuffledUnused = shuffleArray(unused);
            let uIdx = 0;
            return prev.map(t => (t.isUsed ? t : shuffledUnused[uIdx++]));
        });
    };

    // Hint: fills next correct letter
    const handleUseHint = () => {
        if (!currentWord || isSolved || hintsRemaining <= 0) return;

        const targetLetters = currentWord.en.trim().toUpperCase().split('');
        const nextIndex = placedTiles.length;

        if (nextIndex < targetLetters.length) {
            const neededChar = targetLetters[nextIndex];

            // Find an unused tile with this char
            const availableTile = scrambledTiles.find(t => !t.isUsed && t.char === neededChar);

            if (availableTile) {
                handlePickTile(availableTile);
                setHintsRemaining(h => h - 1);
            } else {
                // If it was already placed in a wrong position earlier, clear and place
                handleClearAll();
            }
        }
    };

    // Keyboard support: Type letters to place, Backspace to remove
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (isSolved || !currentWord) return;
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            if (e.key === 'Backspace') {
                e.preventDefault();
                if (placedTiles.length > 0) {
                    handleRemovePlaced(placedTiles.length - 1);
                }
                return;
            }

            const char = e.key.toUpperCase();
            if (/^[A-Z]$/.test(char)) {
                // Find matching unused tile
                const match = scrambledTiles.find(t => !t.isUsed && t.char === char);
                if (match) {
                    handlePickTile(match);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [scrambledTiles, placedTiles, isSolved, currentWord]); // eslint-disable-line react-hooks/exhaustive-deps

    if (!words || words.length === 0 || !currentWord) {
        return (
            <div className="flex flex-col items-center justify-center p-10 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-800">
                <Shuffle size={48} className="text-gray-300 dark:text-slate-600 mb-4 animate-spin" />
                <h2 className="text-xl font-bold text-gray-600 dark:text-slate-400">Đang chuẩn bị ô chữ...</h2>
            </div>
        );
    }

    const targetLength = currentWord.en.trim().length;

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-16">
            {/* Top Bar: Stats & Controls */}
            <div className="flex flex-wrap items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-800 gap-4">
                <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Điểm</span>
                        <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 leading-none">{score}</span>
                    </div>

                    {streak > 1 && (
                        <div className="flex items-center gap-1 px-3 py-1 bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 rounded-full font-black text-xs">
                            🔥 Chuỗi x{streak}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleUseHint}
                        disabled={isSolved || hintsRemaining <= 0}
                        className="px-4 py-2 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/30 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded-xl font-bold text-sm flex items-center gap-1.5 transition disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                        title="Điền trước 1 chữ cái"
                    >
                        <HelpCircle size={16} /> Gợi ý ({hintsRemaining})
                    </button>

                    <button
                        onClick={handleShufflePool}
                        disabled={isSolved}
                        className="p-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl transition cursor-pointer"
                        title="Đảo vị trí các chữ cái"
                    >
                        <Shuffle size={18} />
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

            {/* Clue Card */}
            <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-800 text-center transition-colors">
                <span className="text-xs font-black uppercase text-gray-400 dark:text-slate-500 tracking-wider mb-2 inline-block">
                    Sắp xếp các chữ cái thành từ đúng
                </span>

                {currentWord.category && (
                    <div className="mb-2">
                        <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-full">
                            {currentWord.category}
                        </span>
                    </div>
                )}

                <h3 className="text-2xl md:text-3xl font-black text-gray-800 dark:text-white mb-2">
                    {currentWord.vi}
                </h3>

                {currentWord.ipa && isSolved && (
                    <p className="text-sm font-mono text-gray-400 dark:text-slate-500 mb-2">
                        {currentWord.ipa}
                    </p>
                )}

                {/* Target Slots (Placed letters) */}
                <div className="flex flex-wrap gap-2 md:gap-2.5 justify-center mt-6 mb-4 min-h-[56px]">
                    {[...Array(targetLength)].map((_, index) => {
                        const placed = placedTiles[index];
                        return (
                            <button
                                key={index}
                                onClick={() => placed && handleRemovePlaced(index)}
                                disabled={isSolved || !placed}
                                className={`w-11 h-13 md:w-13 md:h-16 rounded-2xl flex items-center justify-center font-black text-xl md:text-2xl transition-all shadow-sm ${
                                    isSolved
                                        ? 'bg-green-500 text-white border-2 border-green-600 scale-105'
                                        : placed
                                        ? 'bg-indigo-600 text-white border-2 border-indigo-700 hover:bg-indigo-700 cursor-pointer active:scale-95'
                                        : 'bg-gray-100 dark:bg-slate-800 border-2 border-dashed border-gray-300 dark:border-slate-700 text-transparent cursor-default'
                                }`}
                            >
                                {placed ? placed.char : ''}
                            </button>
                        );
                    })}
                </div>

                {/* Clear all button */}
                {placedTiles.length > 0 && !isSolved && (
                    <button
                        onClick={handleClearAll}
                        className="text-xs font-bold text-gray-400 hover:text-red-500 flex items-center gap-1 mx-auto mt-2 transition cursor-pointer"
                    >
                        <RotateCcw size={12} /> Xóa hết để xếp lại
                    </button>
                )}

                {/* Solved Victory Message */}
                {isSolved && (
                    <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/40 rounded-2xl flex flex-wrap items-center justify-between gap-3 animate-fade-in">
                        <div className="flex items-center gap-3 text-left">
                            <CheckCircle2 size={32} className="text-green-500 shrink-0" />
                            <div>
                                <h4 className="font-bold text-green-800 dark:text-green-400 flex items-center gap-1.5">
                                    <Sparkles size={16} /> Chính xác! Tuyệt cú mèo!
                                </h4>
                                <p className="text-xs text-green-700 dark:text-green-500">
                                    Từ vựng: <strong>{currentWord.en}</strong> ({currentWord.vi})
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => speak(currentWord.en)}
                                className="p-2.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-xl hover:bg-green-200 transition cursor-pointer"
                                title="Phát âm"
                            >
                                <Volume2 size={18} />
                            </button>

                            <button
                                onClick={nextWord}
                                className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black text-sm flex items-center gap-2 shadow-md transition cursor-pointer"
                            >
                                Từ Tiếp Theo <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Scrambled Letters Pool */}
            {!isSolved && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-800 text-center">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                        Chọn các chữ cái bên dưới (hoặc gõ bàn phím):
                    </p>
                    <div className="flex flex-wrap gap-2 md:gap-3 justify-center">
                        {scrambledTiles.map((tile) => (
                            <button
                                key={tile.id}
                                disabled={tile.isUsed || isSolved}
                                onClick={() => handlePickTile(tile)}
                                className={`w-12 h-14 md:w-14 md:h-16 rounded-2xl font-black text-xl md:text-2xl transition-all shadow-sm ${
                                    tile.isUsed
                                        ? 'bg-gray-100 dark:bg-slate-800/40 text-gray-300 dark:text-slate-700 border border-transparent cursor-not-allowed scale-90 opacity-30'
                                        : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-white border-2 border-gray-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:scale-105 active:scale-95 cursor-pointer shadow-md'
                                }`}
                            >
                                {tile.char}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
