import { ArrowRight, CheckCircle, CheckCircle2, RotateCcw, Volume2, XCircle, Type } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import IpaGuide from "./IpaGuide";
import { recordWordResult } from "../utils/progressTracker";
import { isAnswerCorrect } from "../utils/answerChecker";

const TypingMode = ({ words, speak }) => {
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [userInput, setUserInput] = useState("");
    const [feedback, setFeedback] = useState(null);
    const [shuffledWords, setShuffledWords] = useState([]);
    const [wrongWords, setWrongWords] = useState([]);
    const [isFinished, setIsFinished] = useState(false);
    const [score, setScore] = useState(0);
    const [hintUsed, setHintUsed] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        if (words.length > 0) {
            const shuffled = [...words].sort(() => 0.5 - Math.random());
            setShuffledWords(shuffled);
            setCurrentWordIndex(0);
            setUserInput("");
            setFeedback(null);
            setIsFinished(false);
            setScore(0);
            setWrongWords([]);
            setHintUsed(false);
        } else {
            setShuffledWords([]);
        }
    }, [words]);

    const currentWord = shuffledWords[currentWordIndex];
    const isJapanese = Boolean(
        currentWord?.isJapanese ||
        currentWord?.master_group === 'Từ Vựng Tiếng Nhật Minna No Nihongo' ||
        /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/.test(currentWord?.en || '')
    );
    const speechTarget = currentWord ? (currentWord.speechText || currentWord.hiragana || currentWord.kanji || currentWord.en) : '';

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.code === 'Space') {
                e.preventDefault();
                if (feedback === null) {
                    handlePlayAudio();
                }
                return;
            }
            if (e.key === "Enter") {
                if (feedback === null) {
                    handleCheck(e);
                } else {
                    handleNext();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [feedback, userInput, currentWord]);

    const handleCheck = (e) => {
        e.preventDefault();
        if (!userInput.trim() || !currentWord) return;

        if (isAnswerCorrect(userInput, currentWord)) {
            setFeedback("correct");
            setScore(prev => prev + 1);
            recordWordResult(currentWord.id, true);
            if (!isJapanese) speak("Correct!");
        } else {
            setFeedback("incorrect");
            recordWordResult(currentWord.id, false);
            setWrongWords(prev => {
                if (!prev.find(w => w.en === currentWord.en)) {
                    return [...prev, currentWord];
                }
                return prev;
            });
            if (!isJapanese) speak("Wrong!");
        }
    };

    const handleNext = () => {
        if (currentWordIndex + 1 < shuffledWords.length) {
            setCurrentWordIndex(prev => prev + 1);
            setUserInput("");
            setFeedback(null);
            setHintUsed(false);
            setTimeout(() => {
                if (inputRef.current) inputRef.current.focus();
            }, 100);
        } else {
            setIsFinished(true);
        }
    };

    const handlePlayAudio = () => {
        if (currentWord) {
            setHintUsed(true);
            speak(speechTarget);
        }
    };

    const handleRestart = () => {
        const shuffled = [...words].sort(() => 0.5 - Math.random());
        setShuffledWords(shuffled);
        setCurrentWordIndex(0);
        setUserInput("");
        setFeedback(null);
        setIsFinished(false);
        setScore(0);
        setWrongWords([]);
        setHintUsed(false);
    };

    const handlePracticeWrongWords = () => {
        const shuffled = [...wrongWords].sort(() => 0.5 - Math.random());
        setShuffledWords(shuffled);
        setCurrentWordIndex(0);
        setUserInput("");
        setFeedback(null);
        setIsFinished(false);
        setScore(0);
        setWrongWords([]);
        setHintUsed(false);
    };

    if (words.length == 0) return (
        <div className="flex flex-col items-center justify-center p-10 h-64 text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
            <p>Không có từ vựng nào để luyện tập.</p>
        </div>
    );

    if (isFinished) return (
        <div className="text-center bg-white dark:bg-slate-900 p-10 rounded-3xl shadow-lg border-2 border-green-100 dark:border-green-900/50 max-w-lg mx-auto animate-fade-in transition-colors">
            <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Hoàn thành</h2>
            <p className="text-gray-500 dark:text-slate-400 mb-6">Kết quả của bạn</p>
            <div className="text-6xl font-black text-green-600 mb-8">{score}/{shuffledWords.length}</div>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                    onClick={handleRestart}
                >
                    <RotateCcw size={20} /> Làm lại từ đầu
                </button>
                {wrongWords.length > 0 && (
                    <button className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition flex items-center justify-center gap-2"
                        onClick={handlePracticeWrongWords}
                    >
                        <XCircle size={20} /> Luyện từ sai ({wrongWords.length})
                    </button>
                )}
            </div>
        </div>
    );

    if (!currentWord) return <div>Loading ...</div>

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6 flex justify-between items-end">
                <span className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Câu hỏi {currentWordIndex + 1} / {shuffledWords.length}</span>
                <span className="text-sm font-bold text-green-600">Chính xác {score} </span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-lg border-b-4 border-gray-200 dark:border-slate-800 mb-6 flex flex-col items-center transition-colors">
                <div className="mb-6 flex flex-col items-center">
                    <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center shadow-sm border-2 border-emerald-100 dark:border-emerald-800/50 mb-4">
                        <Type size={40} />
                    </div>
                    <span className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 px-3 py-1 rounded-full text-sm font-bold mb-3">Nghĩa tiếng Việt:</span>
                    <h2 className="text-3xl font-black text-gray-800 dark:text-white text-center">{currentWord.vi}</h2>
                </div>

                <form onSubmit={handleCheck} className="w-full max-w-md">
                    <div className="relative">
                        <input
                            ref={inputRef}
                            type='text'
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            disabled={feedback !== null}
                            className={`w-full p-4 text-center text-2xl font-bold border-2 rounded-xl outline-none transition bg-white dark:bg-slate-800 dark:text-white
                        ${feedback === 'correct' ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400' : ''}
                        ${feedback === 'incorrect' ? 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400' : ''}
                        ${feedback === null ? 'border-gray-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 focus:border-emerald-500 dark:focus:border-emerald-500' : ''}`}
                            placeholder={isJapanese ? "Gõ Hiragana, Kanji hoặc Romaji..." : "Nhập từ tiếng Anh..."}
                            autoFocus
                        />
                        {feedback === 'correct' && <CheckCircle2 className="absolute right-4 top-4 text-green-500" />}
                        {feedback === 'incorrect' && <XCircle className="absolute right-4 top-4 text-red-500" />}
                    </div>

                    <div className="mt-4 flex justify-between items-center">
                        <span className="text-sm text-gray-400 dark:text-slate-500 font-medium">
                            {isJapanese ? `Gợi ý: ${currentWord.hiragana || currentWord.kanji || currentWord.en}` : `Gợi ý: ${currentWord.en?.length || 0} chữ cái`}
                        </span>
                        <button 
                            type="button" 
                            onClick={handlePlayAudio}
                            disabled={feedback !== null}
                            className={`text-sm flex items-center gap-1 px-3 py-1.5 rounded-lg transition ${hintUsed ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'} ${feedback !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Volume2 size={16} /> Nghe phát âm (Ctrl + Space)
                        </button>
                    </div>

                    {feedback === 'incorrect' && (
                        <div className="mt-4 text-center animate-fade-in bg-red-50 dark:bg-red-900/30 p-4 rounded-xl border border-red-100 dark:border-red-900">
                            <p className="text-red-500 dark:text-red-400 font-bold mb-1">Sai rồi!</p>
                            <p className="text-gray-600 dark:text-slate-400">Đáp án đúng: <span className="text-green-600 dark:text-green-400 font-extrabold text-xl">{isJapanese ? (currentWord.displayWord || currentWord.en) : currentWord.en}</span> </p>
                            {currentWord.ipa && <p className="text-gray-400 dark:text-slate-500 font-mono text-sm mt-1">{currentWord.ipa}</p>}
                            {!isJapanese && currentWord.ipa && <IpaGuide ipa={currentWord.ipa} />}
                        </div>
                    )}

                    <div className="mt-8 flex justify-center">
                        {feedback === null ? (
                            <button type="submit"
                                className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg w-full flex items-center justify-center gap-2">
                                Kiểm tra <ArrowRight size={20} />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleNext}
                                className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition shadow-lg w-full flex items-center justify-center gap-2"
                            >
                                Tiếp tục <ArrowRight size={20} />
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    )
}
export default TypingMode;
