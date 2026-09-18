import { ArrowRight, CheckCircle, CheckCircle2, RotateCcw, Volume2, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import IpaGuide from "./IpaGuide";
import { recordWordResult } from "../utils/progressTracker";
import { isAnswerCorrect } from "../utils/answerChecker";

const DictationMode = ({ words, speak }) => {
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [userInput, setUserInput] = useState("");
    const [feedback, setFeedback] = useState(null);
    const [shuffledWords, setShuffledWords] = useState([]);
    const [wrongWords, setWrongWords] = useState([]);
    const [isFinished, setIsFinished] = useState(false);
    const [score, setScore] = useState(0);
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
        }
        else {
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
        if (currentWord && !isFinished) {
            const timer = setTimeout(() => {
                speak(speechTarget);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [currentWord, isFinished, speechTarget]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Enter") {
                if (feedback === null) {
                    handleCheck(e);
                } else {
                    handleNext();
                }
            }

            if (e.key === 'ArrowUp' || (e.ctrlKey && e.code === 'Space')) {
                e.preventDefault();
                handlePlayAudio();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [feedback, userInput, currentWord, speechTarget]);

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
            setTimeout(() => {
                if (inputRef.current) inputRef.current.focus();
            }, 100);
        }
        else {
            setIsFinished(true);
        }
    };

    const handlePlayAudio = () => {
        if (currentWord) {
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
                <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Câu hỏi {currentWordIndex + 1} / {shuffledWords.length}</span>
                <span className="text-sm font-bold text-green-600">Chính xác {score} </span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-lg border-b-4 border-gray-200 dark:border-slate-800 mb-6 flex flex-col items-center transition-colors">
                <div className="mb-6">
                    <button className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:scale-105 transition shadow-sm border-2 border-indigo-100 dark:border-indigo-800/50 animate-pulse"
                        onClick={handlePlayAudio}
                        title="Nghe lại phát âm"
                    >
                        <Volume2 size={48} />
                    </button>
                    <p className="text-center text-gray-400 dark:text-slate-500 text-sm mt-3">Đang đọc...</p>
                </div>

                <div className="mb-6 text-center">
                    <span className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 px-3 py-1 rounded-full text-sm font-bold">Nghĩa gợi ý:</span>
                    <p className="text-xl font-medium text-gray-800 dark:text-white mt-2">{currentWord.vi}</p>
                </div>

                <form onSubmit={handleCheck} className="w-full max-w-md">
                    <div className="relative ">
                        <input
                            ref={inputRef}
                            type='text'
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            disabled={feedback !== null}
                            className={`w-full p-4 text-center text-2xl font-bold border-2 rounded-xl outline-none transition bg-white dark:bg-slate-800 dark:text-white
                        ${feedback === 'correct' ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400' : ''}
                        ${feedback === 'incorrect' ? 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400' : ''}
                        ${feedback === null ? 'border-gray-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 focus:border-indigo-500 dark:focus:border-indigo-500' : ''}`}
                            placeholder={isJapanese ? "Gõ từ bạn nghe được (Hiragana, Kanji hoặc Romaji)..." : "Nhập từ bạn nghe được..."}
                            autoFocus
                        />
                        {feedback === 'correct' && <CheckCircle2 className="absolute right-4 top-4 text-green-500" />}
                        {feedback === 'incorrect' && <XCircle className="absolute right-4 top-4 text-red-500" />}

                    </div>

                    {feedback === 'incorrect' && (
                        <div className="mt-4 text-center animate-fade-in">
                            <p className="text-red-500 font-bold mb-1">Sai rồi!</p>
                            <p className="text-gray-600 dark:text-slate-400">Đáp án đúng: <span className="text-green-600 dark:text-green-400 font-extrabold text-xl">{isJapanese ? (currentWord.displayWord || currentWord.en) : currentWord.en}</span> </p>
                            {currentWord.ipa && <p className="text-gray-400 dark:text-slate-500 font-mono text-sm mt-1">{currentWord.ipa}</p>}
                            {!isJapanese && currentWord.ipa && <IpaGuide ipa={currentWord.ipa} />}
                        </div>
                    )}

                    <div className="mt-8 flex justify-center">
                        {feedback === null ? (
                            <button type="submit"
                                className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg w-full">Kiểm tra</button>
                        ) :
                            (
                                <button
                                    type="button"

                                    onClick={handleNext}

                                    className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition shadow-lg w-full flex items-center justify-center gap-2"
                                >
                                    Tiếp tục <ArrowRight size={20} />
                                </button>
                            )
                        }

                    </div>
                </form>

            </div>
        </div>
    )
}
export default DictationMode;
