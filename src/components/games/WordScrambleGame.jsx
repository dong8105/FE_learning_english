import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Shuffle, HelpCircle, Volume2, CheckCircle2, ArrowRight, RotateCcw, Sparkles, Award } from 'lucide-react';

export default function WordScrambleGame({ words, speak }) {
    const [currentWord, setCurrentWord] = useState(null);
    const [scrambledTiles, setScrambledTiles] = useState([]);
    const [placedTiles, setPlacedTiles] = useState([]);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [hintsRemaining, setHintsRemaining] = useState(2);
    const [isSolved, setIsSolved] = useState(false);

    const shuffleArray = (arr) => {
        const copy = [...arr];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    };

    const nextWord = useCallback(() => {
        if (!words || words.length === 0) return;
        
        const validWords = words
            .filter(w => w.en && w.vi)
            .map(w => ({
                ...w,
                cleanEn: w.en.replace(/\(.*?\)/g, '').trim(),
            }))
            .filter(w => w.cleanEn.length >= 3 && /^[a-zA-Z\s-]+$/.test(w.cleanEn));

        if (validWords.length === 0) return;

        const target = validWords[Math.floor(Math.random() * validWords.length)];
        setCurrentWord(target);

        const cleanLetters = target.cleanEn.toUpperCase().replace(/\s+/g, '').split('');
        let shuffled = shuffleArray(cleanLetters);
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

    useEffect(() => {
        if (!currentWord || isSolved) return;

        const currentAnswer = placedTiles.map(t => t.char).join('');
        const targetClean = currentWord.cleanEn.toUpperCase().replace(/\s+/g, '');

        if (currentAnswer.length === targetClean.length && currentAnswer === targetClean) {
            setIsSolved(true);
            speak(currentWord.cleanEn);
            setScore(s => s + 20 + Math.min(30, targetClean.length * 3));
            setStreak(st => st + 1);
        }
    }, [placedTiles, currentWord, isSolved, speak]);

    const handlePickTile = (tile) => {
        if (isSolved || tile.isUsed) return;

        setScrambledTiles(prev =>
            prev.map(t => (t.id === tile.id ? { ...t, isUsed: true } : t))
        );

        setPlacedTiles(prev => [...prev, { tileId: tile.id, char: tile.char }]);
    };

    const handleRemovePlaced = (index) => {
        if (isSolved) return;

        const removed = placedTiles[index];
        setPlacedTiles(prev => prev.filter((_, i) => i !== index));

        setScrambledTiles(prev =>
            prev.map(t => (t.id === removed.tileId ? { ...t, isUsed: false } : t))
        );
    };

    const handleClearAll = () => {
        if (isSolved) return;
        setPlacedTiles([]);
        setScrambledTiles(prev => prev.map(t => ({ ...t, isUsed: false })));
    };

    const handleShufflePool = () => {
        setScrambledTiles(prev => {
            const unused = prev.filter(t => !t.isUsed);
            const shuffledUnused = shuffleArray(unused);
            let uIdx = 0;
            return prev.map(t => (t.isUsed ? t : shuffledUnused[uIdx++]));
        });
    };

    const handleUseHint = () => {
        if (!currentWord || isSolved || hintsRemaining <= 0) return;

        const targetLetters = currentWord.cleanEn.toUpperCase().replace(/\s+/g, '').split('');
        const nextIndex = placedTiles.length;

        if (nextIndex < targetLetters.length) {
            const neededChar = targetLetters[nextIndex];
            const availableTile = scrambledTiles.find(t => !t.isUsed && t.char === neededChar);

            if (availableTile) {
                handlePickTile(availableTile);
                setHintsRemaining(h => h - 1);
            } else {
                handleClearAll();
            }
        }
    };

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
            <div className="flex flex-col items-center justify-center p-12 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200 dark:border-slate-800">
                <Shuffle size={56} className="text-amber-400 mb-4 animate-spin" />
                <h2 className="text-xl font-bold text-gray-700 dark:text-slate-300">Đang chuẩn bị ô chữ...</h2>
            </div>
        );
    }

    const targetLength = currentWord.cleanEn.toUpperCase().replace(/\s+/g, '').length;

    return (
        <div className="max-w-3xl mx-auto space-y-4 md:space-y-6 animate-fade-in pb-16">
            {/* Top Bar */}
            <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-yellow-500/10 dark:from-amber-950/40 dark:via-orange-950/40 dark:to-yellow-950/40 p-4 md:p-5 rounded-3xl border border-amber-200/50 dark:border-amber-800/40 backdrop-blur-xl shadow-lg flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-6 px-2">
                    {/* Score */}
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
                            <Award size={20} />
                        </div>
                        <div>
                            <span className="text-[10px] font-black tracking-widest uppercase text-gray-400 dark:text-slate-400">Điểm</span>
                            <p className="text-2xl font-black text-gray-900 dark:text-white leading-none">{score}</p>
                        </div>
                    </div>

                    {streak > 1 && (
                        <div className="flex items-center gap-1 px-3.5 py-1.5 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-full font-black text-xs shadow-md shadow-orange-500/20 animate-bounce">
                            🔥 Chuỗi x{streak}!
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleUseHint}
                        disabled={isSolved || hintsRemaining <= 0}
                        className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-slate-700 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-700/50 rounded-2xl font-black text-xs flex items-center gap-1.5 transition disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed shadow-sm"
                    >
                        <HelpCircle size={15} /> Gợi ý ({hintsRemaining})
                    </button>

                    <button
                        onClick={handleShufflePool}
                        disabled={isSolved}
                        className="p-2.5 bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-slate-700 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 rounded-2xl transition cursor-pointer shadow-sm active:scale-95"
                        title="Đảo vị trí các chữ cái"
                    >
                        <Shuffle size={16} />
                    </button>

                    <button
                        onClick={nextWord}
                        className="p-2.5 bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-slate-700 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 rounded-2xl transition cursor-pointer shadow-sm active:scale-95"
                        title="Đổi từ khác"
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>
            </div>

            {/* Clue & Target Slots Card */}
            <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl shadow-xl border border-gray-200 dark:border-slate-800 text-center transition-colors">
                <span className="text-[11px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider mb-2 inline-block px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200/50 dark:border-amber-800/30">
                    Sắp xếp các chữ cái thành từ tiếng Anh đúng
                </span>

                {currentWord.category && (
                    <div className="mb-2">
                        <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-full">
                            {currentWord.category}
                        </span>
                    </div>
                )}

                <h3 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
                    {currentWord.vi}
                </h3>

                {currentWord.ipa && isSolved && (
                    <p className="text-sm font-mono text-gray-400 dark:text-slate-500 mb-2">
                        {currentWord.ipa}
                    </p>
                )}

                {/* 3D Scrabble Target Slots */}
                <div className="flex flex-wrap gap-2 md:gap-3 justify-center mt-6 mb-3 min-h-[56px]">
                    {[...Array(targetLength)].map((_, index) => {
                        const placed = placedTiles[index];
                        return (
                            <button
                                key={index}
                                onClick={() => placed && handleRemovePlaced(index)}
                                disabled={isSolved || !placed}
                                className={`w-11 h-13 md:w-14 md:h-16 rounded-2xl flex items-center justify-center font-black text-xl md:text-2xl transition-all shadow-md ${
                                    isSolved
                                        ? 'bg-gradient-to-tr from-emerald-500 to-teal-500 text-white border-2 border-emerald-400 scale-105 shadow-emerald-500/30'
                                        : placed
                                        ? 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white border-b-4 border-indigo-800 hover:brightness-110 cursor-pointer active:translate-y-1 active:border-b-0'
                                        : 'bg-gray-100 dark:bg-slate-800/60 border-2 border-dashed border-gray-300 dark:border-slate-700 text-transparent cursor-default'
                                }`}
                            >
                                {placed ? placed.char : ''}
                            </button>
                        );
                    })}
                </div>

                {placedTiles.length > 0 && !isSolved && (
                    <button
                        onClick={handleClearAll}
                        className="text-xs font-bold text-gray-400 hover:text-rose-500 flex items-center gap-1 mx-auto mt-3 transition cursor-pointer"
                    >
                        <RotateCcw size={12} /> Xóa hết để xếp lại
                    </button>
                )}

                {/* Solved Victory Banner */}
                {isSolved && (
                    <div className="mt-6 p-4.5 bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-cyan-500/15 border-2 border-emerald-500/40 rounded-2xl flex flex-wrap items-center justify-between gap-3 animate-fade-in shadow-md">
                        <div className="flex items-center gap-3 text-left">
                            <CheckCircle2 size={32} className="text-emerald-500 shrink-0" />
                            <div>
                                <h4 className="font-black text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 text-base">
                                    <Sparkles size={16} /> Chính xác! Ghép từ siêu đỉnh!
                                </h4>
                                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                                    Từ vựng: <strong>{currentWord.cleanEn}</strong> ({currentWord.vi})
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => speak(currentWord.cleanEn)}
                                className="p-2.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-xl hover:bg-emerald-200 transition cursor-pointer shadow-sm"
                                title="Phát âm"
                            >
                                <Volume2 size={18} />
                            </button>

                            <button
                                onClick={nextWord}
                                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition transform hover:scale-105 active:scale-95 cursor-pointer"
                            >
                                Từ Tiếp Theo <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* 3D Scramble Letter Tiles Pool */}
            {!isSolved && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-xl border border-gray-200 dark:border-slate-800 text-center">
                    <p className="text-xs font-black uppercase text-gray-400 dark:text-slate-400 tracking-wider mb-4">
                        Chọn các chữ cái bên dưới (hoặc gõ trực tiếp từ bàn phím):
                    </p>
                    <div className="flex flex-wrap gap-2.5 md:gap-3.5 justify-center">
                        {scrambledTiles.map((tile) => (
                            <button
                                key={tile.id}
                                disabled={tile.isUsed || isSolved}
                                onClick={() => handlePickTile(tile)}
                                className={`w-12 h-14 md:w-14 md:h-16 rounded-2xl font-black text-xl md:text-2xl transition-all shadow-md ${
                                    tile.isUsed
                                        ? 'bg-gray-100 dark:bg-slate-800/40 text-gray-300 dark:text-slate-700 border border-transparent cursor-not-allowed scale-90 opacity-25'
                                        : 'bg-gradient-to-b from-white to-gray-100 dark:from-slate-800 dark:to-slate-850 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-slate-700 border-b-4 border-b-gray-300 dark:border-b-slate-950 hover:border-amber-500 dark:hover:border-amber-500 hover:scale-105 active:border-b-2 active:translate-y-0.5 cursor-pointer hover:shadow-lg hover:shadow-amber-500/10'
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
