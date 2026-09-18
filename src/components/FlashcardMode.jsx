import { ArrowLeft, ArrowRight, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
import IpaGuide from "./IpaGuide";

const FlashcardMode = ({ words, speak }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
        setIsFlipped(false);
        setCurrentIndex(0);
    }, [words]);

    const handleNext = () => {
        setIsFlipped(false);
        setTimeout(() => setCurrentIndex((prev) => (prev + 1) % words.length), 300);
    };
    const handlePrev = () => {
        setIsFlipped(false);
        setTimeout(() => setCurrentIndex((prev) => (prev - 1 + words.length) % words.length), 300);
    };

    const currentWord = words[currentIndex];

    const handlePlayAudio = () => {
        if (currentWord) speak(currentWord.speechText || currentWord.hiragana || currentWord.kanji || currentWord.en);
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.code === 'Space') {
                e.preventDefault();
                const exampleText = currentWord.example_en || currentWord.example;
                if (exampleText) speak(exampleText);
                return;
            }
            if (e.key === 'ArrowRight') handleNext();
            else if (e.key === 'ArrowLeft') handlePrev();
            else if (e.key === 'Enter') { e.preventDefault(); setIsFlipped(prev => !prev); }
            else if (e.key === ' ') { e.preventDefault(); handlePlayAudio(); }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [words.length, currentIndex, currentWord]);

    if (words.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] text-gray-500 dark:text-slate-400">
                Không có từ vựng nào. Vui lòng thêm từ vựng để xem thẻ ghi nhớ.
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center px-4 py-6">

            {/* ── Card ── */}
            {/*
                CSS Grid stacking trick:
                Both faces get gridArea "1/1" → they occupy the same grid cell.
                The grid container height = max(frontHeight, backHeight) automatically.
                No fixed height needed → no overflow → no scrollbar.
                3D flip still works perfectly via rotateY + backface-visibility.
            */}
            <div
                className="w-full max-w-sm md:max-w-md cursor-pointer"
                style={{ perspective: '1200px' }}
                onClick={() => setIsFlipped(f => !f)}
            >
                <div
                    className="grid w-full"
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {/* ── FRONT FACE ── */}
                    <div
                        className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border-b-4 border-blue-500 p-6 md:p-8 flex flex-col items-center justify-center min-h-64 transition-colors"
                        style={{
                            gridArea: '1 / 1',
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden',
                            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                            transition: 'transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1)',
                        }}
                    >
                        <div className="absolute top-4 right-4 md:top-5 md:right-5 z-10">
                            <button
                                className="p-2 md:p-2.5 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:text-blue-600 dark:hover:text-blue-400 transition shadow-sm"
                                title="Nghe phát âm"
                                onClick={(e) => { e.stopPropagation(); handlePlayAudio(); }}
                            >
                                <Volume2 size={18} />
                            </button>
                        </div>

                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded-full mb-4">
                            Mặt trước
                        </span>
                        <h2 className="text-3xl md:text-5xl font-extrabold text-gray-800 dark:text-white mb-2 text-center break-words">
                            {currentWord.en}
                        </h2>
                        <p className="text-gray-400 dark:text-slate-500 font-mono text-base md:text-lg">
                            {currentWord.ipa}
                        </p>
                        <IpaGuide ipa={currentWord.ipa} />
                        <p className="mt-5 text-[10px] md:text-xs text-gray-400 dark:text-slate-500 animate-pulse">
                            Chạm hoặc nhấn Enter để lật
                        </p>
                    </div>

                    {/* ── BACK FACE ── */}
                    <div
                        className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border-b-4 border-indigo-500 p-6 flex flex-col text-left transition-colors min-h-64"
                        style={{
                            gridArea: '1 / 1',
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden',
                            transform: isFlipped ? 'rotateY(0deg)' : 'rotateY(-180deg)',
                            transition: 'transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1)',
                        }}
                    >
                        {/* Header row */}
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full">
                                Mặt sau
                            </span>
                            <span className="text-[10px] md:text-xs font-bold text-gray-500 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                                {currentWord.unit ? (
                                    parseInt(currentWord.unit) >= 13
                                        ? `Chủ đề ${parseInt(currentWord.unit) - 12}`
                                        : `Bài ${currentWord.unit}`
                                ) : (
                                    "Từ vựng 30 Ngày"
                                )}
                            </span>
                        </div>

                        {/* Vietnamese word */}
                        <div className="text-center mb-4">
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white break-words">
                                {currentWord.vi}
                            </h2>
                            <p className="text-indigo-500 dark:text-indigo-400 italic text-sm mt-1">
                                {currentWord.category}
                            </p>
                        </div>

                        {/* Definitions + example */}
                        {(currentWord.definition_en || currentWord.example_en || currentWord.example) ? (
                            <div className="w-full space-y-4">
                                {currentWord.definition_en && (
                                    <div>
                                        <h3 className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase mb-1 tracking-wider">
                                            Định nghĩa
                                        </h3>
                                        <p className="text-sm md:text-base text-gray-800 dark:text-slate-200 leading-relaxed">
                                            <span className="font-bold text-gray-500 dark:text-slate-400 mr-1">EN:</span>
                                            {currentWord.definition_en}
                                        </p>
                                        <p className="text-sm md:text-base text-gray-600 dark:text-slate-400 leading-relaxed mt-1">
                                            <span className="font-bold text-gray-500 dark:text-slate-400 mr-1">VI:</span>
                                            {currentWord.definition_vi}
                                        </p>
                                    </div>
                                )}

                                {(currentWord.example_en || currentWord.example) && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                                                Ví dụ
                                            </h3>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); speak(currentWord.example_en || currentWord.example); }}
                                                className="text-blue-500 hover:text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 p-1 rounded transition"
                                                title="Nghe câu ví dụ (Ctrl + Space)"
                                            >
                                                <Volume2 size={14} />
                                            </button>
                                        </div>
                                        <p className="text-sm md:text-base text-gray-800 dark:text-slate-200 italic leading-relaxed">
                                            {(currentWord.example_en || currentWord.example)
                                                .split(new RegExp(`(${currentWord.en})`, 'gi'))
                                                .map((part, i) =>
                                                    part.toLowerCase() === currentWord.en.toLowerCase()
                                                        ? <span key={i} className="text-green-600 dark:text-green-400 font-bold not-italic">{part}</span>
                                                        : part
                                                )}
                                        </p>
                                        <p className="text-sm md:text-base text-gray-600 dark:text-slate-400 leading-relaxed mt-1">
                                            {currentWord.example_vi || currentWord.exampleVi}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center">
                                <p className="text-sm text-gray-400 italic">Đang tải hoặc chưa có định nghĩa chi tiết...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Navigation ── */}
            <div className="flex items-center gap-4 md:gap-6 mt-8 md:mt-10">
                <button
                    className="p-3 md:p-4 rounded-full bg-white dark:bg-slate-800 shadow-md hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-400 transition"
                    title="Mũi tên trái"
                    onClick={handlePrev}
                >
                    <ArrowLeft size={18} />
                </button>
                <span className="font-bold text-sm md:text-base text-gray-500 dark:text-slate-400">
                    {currentIndex + 1} / {words.length}
                </span>
                <button
                    className="p-3 md:p-4 rounded-full bg-blue-600 shadow-lg shadow-blue-200 hover:bg-blue-700 text-white transition"
                    title="Mũi tên phải"
                    onClick={handleNext}
                >
                    <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default FlashcardMode;
