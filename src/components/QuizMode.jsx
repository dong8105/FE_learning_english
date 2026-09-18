import React, { useEffect, useState, useRef } from "react";
import { CheckCircle2, Volume2, XCircle, Sparkles, BookOpen, RefreshCw, Headphones, Tag, MessageSquare, Settings2, ChevronDown, ChevronUp } from "lucide-react";
import IpaGuide from "./IpaGuide";
import { recordWordResult } from "../utils/progressTracker";

class QuizErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error("QuizMode crashed:", error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="p-6 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-200 rounded-2xl border border-red-200 dark:border-red-800">
                    <h2 className="font-bold text-xl mb-2 flex items-center gap-2">
                        <XCircle size={24} /> UI Crash
                    </h2>
                    <p className="text-sm mb-4">Vui lòng chụp ảnh màn hình này và gửi cho dev:</p>
                    <pre className="text-xs font-mono bg-white dark:bg-slate-900 p-4 rounded-xl overflow-x-auto whitespace-pre-wrap border border-red-100 dark:border-red-900/50">
                        {this.state.error && this.state.error.toString()}
                        {'\n'}
                        {this.state.error && this.state.error.stack}
                    </pre>
                </div>
            );
        }
        return this.props.children;
    }
}

const QuizModeInner = ({ words, speak }) => {
    const [started, setStarted] = useState(false);
    const [quizDirection, setQuizDirection] = useState("mixed"); // en_to_vi, vi_to_en, mixed
    const [autoNext, setAutoNext] = useState(true);
    const [currentQ, setCurrentQ] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [key, setKey] = useState(0);
    const [selectedOptionId, setSelectedOptionId] = useState(null); // stores selected opt.en

    // Advanced Settings
    const defaultSettings = {
        en_to_vi: true,
        vi_to_en: true,
        listen_to_en: true,
        listen_to_vi: true,
        listen_example: true,
        en_to_category: true,
        category_to_en: true,
        transitionSpeed: 'normal'
    };
    
    const [quizSettings, setQuizSettings] = useState(() => {
        try {
            const saved = localStorage.getItem('toeic_quiz_advanced_settings');
            return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
        } catch {
            return defaultSettings;
        }
    });
    const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

    useEffect(() => {
        localStorage.setItem('toeic_quiz_advanced_settings', JSON.stringify(quizSettings));
    }, [quizSettings]);

    const timerRef = useRef(null);

    // Clear timeout on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    // Global Keydown Handler for Shortcuts
    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            if (!started || showResult) return;
            // Only capture if not typing in an input (in case they have some settings input open)
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            const currentQuestion = questions[currentQ];
            if (!currentQuestion || !currentQuestion.options) return;

            // Handle audio replay: Space
            if (e.key === ' ') {
                e.preventDefault();
                // Prevent spoiler in vi_to_en and category_to_en before answering
                if ((currentQuestion.type === 'vi_to_en' || currentQuestion.type === 'category_to_en') && selectedOptionId === null) {
                    return;
                }
                
                if (currentQuestion.type === 'listen_example') {
                    speak(currentQuestion.target.example_en || currentQuestion.target.example);
                } else {
                    speak(currentQuestion.target.en);
                }
                return;
            }

            // Handle option selection: 1,2,3,4 or A,B,C,D
            if (selectedOptionId === null) {
                let optionIndex = -1;
                if (['1', '2', '3', '4'].includes(e.key)) {
                    optionIndex = parseInt(e.key, 10) - 1;
                } else if (['a', 'b', 'c', 'd'].includes(e.key.toLowerCase())) {
                    optionIndex = e.key.toLowerCase().charCodeAt(0) - 97;
                }

                if (optionIndex >= 0 && optionIndex < currentQuestion.options.length) {
                    const opt = currentQuestion.options[optionIndex];
                    const optId = currentQuestion.type === 'en_to_category' ? (opt.category || "Từ vựng") : opt.en;
                    handleAnswer(opt.en);
                    return;
                }
            }

            // Handle next question
            if (selectedOptionId !== null) {
                if (e.key === 'Enter' || e.key === 'ArrowRight') {
                    e.preventDefault();
                    if (!autoNext) {
                        moveToNextQuestion();
                    } else {
                        // If autoNext is on, allow them to skip the wait time!
                        if (timerRef.current) clearTimeout(timerRef.current);
                        moveToNextQuestion();
                    }
                }
            }
        };

        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [started, currentQ, questions, selectedOptionId, showResult, autoNext]);

    useEffect(() => {
        try {
            if (timerRef.current) clearTimeout(timerRef.current);
            if (words.length < 4) {
                setQuestions([]);
                return;
            }
            
            // Only generate questions when the quiz has actually started
            if (!started) return;
            
            // Shuffle and test all available words of the day
            const shuffled = [...words].sort(() => 0.5 - Math.random());
            const selected = shuffled;

            const generatedQuestions = selected.map(target => {
                // Set question type based on configuration selection
                let type;
                const exEn = target.example_en || target.example;

                if (quizDirection === 'en_to_vi') {
                    type = 'en_to_vi';
                } else if (quizDirection === 'vi_to_en') {
                    type = 'vi_to_en';
                } else if (quizDirection === 'listen_to_en') {
                    type = 'listen_to_en';
                } else if (quizDirection === 'listen_to_vi') {
                    type = 'listen_to_vi';
                } else if (quizDirection === 'en_to_category') {
                    type = 'en_to_category';
                } else if (quizDirection === 'category_to_en') {
                    type = 'category_to_en';
                } else if (quizDirection === 'listen_example') {
                    type = exEn ? 'listen_example' : 'listen_to_en';
                } else {
                    let types = [];
                    if (quizSettings.en_to_vi) types.push('en_to_vi');
                    if (quizSettings.vi_to_en) types.push('vi_to_en');
                    if (quizSettings.listen_to_en) types.push('listen_to_en');
                    if (quizSettings.listen_to_vi) types.push('listen_to_vi');
                    if (quizSettings.en_to_category) types.push('en_to_category');
                    if (quizSettings.category_to_en) types.push('category_to_en');
                    if (quizSettings.listen_example && exEn) types.push('listen_example');
                    
                    if (types.length === 0) {
                        types = ['en_to_vi']; // Fallback if user disabled everything
                    }
                    type = types[Math.floor(Math.random() * types.length)];
                }
                
                let finalOptions;
            if (type === 'en_to_category') {
                const targetCat = target.category || "Từ vựng";
                // Get unique categories from words
                let availableCats = [...new Set(words.map(w => w.category).filter(c => c && c !== targetCat))];

                // Fallback if not enough unique categories
                if (availableCats.length < 3) {
                    const fallbacks = ["Danh từ (n)", "Động từ (v)", "Tính từ (adj)", "Trạng từ (adv)", "Cụm từ (phrase)"];
                    fallbacks.forEach(f => {
                        if (f !== targetCat && !availableCats.includes(f)) {
                            availableCats.push(f);
                        }
                    });
                }

                // Pick 3 random distractors
                const selectedDistractors = availableCats.sort(() => 0.5 - Math.random()).slice(0, 3);

                // Construct pseudo-word objects where 'en' and 'vi' are both the category string
                finalOptions = [targetCat, ...selectedDistractors].map(cat => ({
                    en: cat,
                    vi: cat,
                    category: cat
                })).sort(() => 0.5 - Math.random()).slice(0, 4);
            } else {
                // Filter out target word and deduplicate distractors by unique 'en' and 'vi'
                const targetEnNorm = (target.en || '').toLowerCase().trim();
                const targetViNorm = (target.vi || '').toLowerCase().trim();

                const seenEn = new Set([targetEnNorm]);
                const seenVi = new Set([targetViNorm]);
                const uniqueDistractors = [];

                let attempts = 0;
                while (uniqueDistractors.length < 3 && attempts < 50) {
                    attempts++;
                    const randomWord = words[Math.floor(Math.random() * words.length)];
                    if (!randomWord.en || !randomWord.vi) continue;
                    
                    const normEn = randomWord.en.toLowerCase().trim();
                    const normVi = randomWord.vi.toLowerCase().trim();
                    
                    if (!seenEn.has(normEn) && !seenVi.has(normVi)) {
                        if (type === 'category_to_en' && (randomWord.category || "Từ vựng") === (target.category || "Từ vựng")) {
                            continue;
                        }
                        if (type === 'listen_example' && exEn) {
                            try {
                                const regex = new RegExp(`\\b${randomWord.en}\\b`, 'i');
                                if (regex.test(exEn)) continue;
                            } catch (e) {
                                if (exEn.toLowerCase().includes(randomWord.en.toLowerCase())) continue;
                            }
                        }
                        
                        seenEn.add(normEn);
                        seenVi.add(normVi);
                        uniqueDistractors.push(randomWord);
                    }
                }

                // Fallback if not enough unique distractors found
                if (uniqueDistractors.length < 3) {
                    for (const w of words) {
                        if (!w.en) continue;
                        const normEn = w.en.toLowerCase().trim();
                        if (normEn !== targetEnNorm && !uniqueDistractors.some(d => d.en.toLowerCase().trim() === normEn)) {
                            uniqueDistractors.push(w);
                            if (uniqueDistractors.length >= 3) break;
                        }
                    }
                }

                finalOptions = [target, ...uniqueDistractors.slice(0, 3)].sort(() => 0.5 - Math.random()).slice(0, 4);
            }

            return { target, options: finalOptions, type };
        });

        setQuestions(generatedQuestions);
        setScore(0);
        setCurrentQ(0);
        setShowResult(false);
        setSelectedOptionId(null);
        } catch (error) {
            console.error("QuizMode generation error:", error);
        }
    }, [words, key, quizDirection, quizSettings, started]);

    // Auto-pronounce for standard (en_to_vi), listening and en_to_category questions at question load
    useEffect(() => {
        if (started && questions.length > 0 && !showResult) {
            const currentQuestion = questions[currentQ];
            if (currentQuestion && (currentQuestion.type === 'en_to_vi' || currentQuestion.type === 'en_to_category' || currentQuestion.type.startsWith('listen_'))) {
                const timer = setTimeout(() => {
                    if (currentQuestion.type === 'listen_example') {
                        speak(currentQuestion.target.example_en || currentQuestion.target.example);
                    } else {
                        speak(currentQuestion.target.en);
                    }
                }, 500);
                return () => clearTimeout(timer);
            }
        }
    }, [currentQ, questions, showResult, started]);

    // Listen for Ctrl + Space keyboard shortcut to repeat pronunciation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.code === 'Space') {
                e.preventDefault();
                if (started && questions.length > 0 && !showResult) {
                    const currentQuestion = questions[currentQ];
                    speak(currentQuestion.target.en);
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [started, questions, currentQ, showResult]);

    const moveToNextQuestion = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        setSelectedOptionId(null);
        if (currentQ + 1 < questions.length) {
            setCurrentQ(currentQ + 1);
        } else {
            setShowResult(true);
        }
    };

    const handleAnswer = (optId) => {
        if (selectedOptionId !== null) return; // Prevent clicking again while waiting

        const currentQuestion = questions[currentQ];
        const isCorrect = currentQuestion.type === 'en_to_category' 
            ? optId === (currentQuestion.target.category || "Từ vựng")
            : optId === currentQuestion.target.en;
        setSelectedOptionId(optId);

        recordWordResult(currentQuestion.target.id || currentQuestion.target.en, isCorrect);
        
        if (isCorrect) {
            setScore(score + 1);
        }
        
        // Play correct answer pronunciation immediately for reinforcement
        speak(currentQuestion.target.en);

        // Auto transition after a comfortable duration
        if (autoNext) {
            let delayCorrect = 2500;
            let delayIncorrect = 4500;
            
            if (quizSettings.transitionSpeed === 'fast') {
                delayCorrect = 1500;
                delayIncorrect = 3000;
            } else if (quizSettings.transitionSpeed === 'slow') {
                delayCorrect = 4000;
                delayIncorrect = 6500;
            }

            timerRef.current = setTimeout(() => {
                moveToNextQuestion();
            }, isCorrect ? delayCorrect : delayIncorrect); // dynamically chosen delay
        }
    };

    const handleStartQuiz = () => {
        setKey(prev => prev + 1); // trigger reshuffle and regeneration
        setStarted(true);
    };

    const resetQuiz = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setStarted(false);
        setShowResult(false);
    };

    if (words.length < 4) {
        return (
            <div className="flex flex-col items-center justify-center p-10 h-64 text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
                <p className="text-lg mb-4">Không đủ từ vựng để tạo bài kiểm tra trắc nghiệm (cần tối thiểu 4 từ).</p>
            </div>
        );
    }

    // SETUP CONFIGURATION SCREEN
    if (!started) {
        return (
            <div className="max-w-md mx-auto bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-gray-250 dark:border-slate-800 shadow-sm transition-colors space-y-6 animate-fade-in">
                <div className="text-center space-y-2">
                    <Sparkles className="w-10 h-10 text-indigo-500 mx-auto animate-pulse" />
                    <h2 className="text-xl font-black text-gray-800 dark:text-white">Cấu Hình Trắc Nghiệm</h2>
                    <p className="text-xs text-gray-400 dark:text-slate-500">Chọn hướng câu hỏi để bắt đầu bài ôn tập từ vựng.</p>
                </div>

                <div className="space-y-3">
                    {[
                        { 
                            id: 'en_to_vi', 
                            label: 'Anh ➔ Việt', 
                            desc: 'Đọc từ tiếng Anh, chọn nghĩa tiếng Việt chính xác.', 
                            icon: BookOpen,
                            color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20'
                        },
                        { 
                            id: 'vi_to_en', 
                            label: 'Việt ➔ Anh (Trắc nghiệm ngược)', 
                            desc: 'Xem nghĩa tiếng Việt, chọn từ tiếng Anh tương ứng.', 
                            icon: Sparkles,
                            color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/20'
                        },
                        { 
                            id: 'listen_to_en', 
                            label: 'Nghe ➔ Anh', 
                            desc: 'Nghe phát âm, chọn từ tiếng Anh đúng.', 
                            icon: Headphones,
                            color: 'text-pink-500 bg-pink-50 dark:bg-pink-950/20'
                        },
                        { 
                            id: 'listen_to_vi', 
                            label: 'Nghe ➔ Việt', 
                            desc: 'Nghe phát âm, chọn nghĩa tiếng Việt.', 
                            icon: Volume2,
                            color: 'text-teal-500 bg-teal-50 dark:bg-teal-950/20'
                        },
                        { 
                            id: 'en_to_category', 
                            label: 'Phân Biệt Loại Từ', 
                            desc: 'Xác định từ vựng thuộc loại từ (danh, động...) hay nhóm nào.', 
                            icon: Tag,
                            color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/20'
                        },
                        { 
                            id: 'category_to_en', 
                            label: 'Từ Loại ➔ Tiếng Anh', 
                            desc: 'Xem loại từ (danh, động...), chọn từ tiếng Anh tương ứng.', 
                            icon: Tag,
                            color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
                        },
                        ...(words && words.some(w => w.example) ? [{
                            id: 'listen_example',
                            label: 'Nghe ➔ Câu Ví Dụ',
                            desc: 'Nghe câu ví dụ và chọn từ đã xuất hiện.',
                            icon: MessageSquare,
                            color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/20'
                        }] : []),
                        { 
                            id: 'mixed', 
                            label: 'Hỗn hợp ngẫu nhiên', 
                            desc: 'Trộn lẫn ngẫu nhiên các hướng câu hỏi.', 
                            icon: RefreshCw,
                            color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20'
                        }
                    ].map(mode => {
                        const isSelected = quizDirection === mode.id;
                        const Icon = mode.icon;
                        return (
                            <button
                                key={mode.id}
                                onClick={() => setQuizDirection(mode.id)}
                                className={`select-none w-full p-4 text-left border-2 rounded-2xl transition-all cursor-pointer flex items-center gap-4 ${
                                    isSelected
                                        ? 'border-green-500 bg-green-50/20 text-green-700 dark:text-green-400 dark:bg-green-950/10'
                                        : 'border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700 text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-900'
                                }`}
                            >
                                <div className={`p-2.5 rounded-xl shrink-0 ${mode.color}`}>
                                    <Icon size={18} />
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="text-sm font-extrabold">{mode.label}</p>
                                    <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5 leading-tight">{mode.desc}</p>
                                </div>
                                {isSelected && <CheckCircle2 size={18} className="text-green-600 shrink-0" />}
                            </button>
                        );
                    })}
                </div>

                {quizDirection === 'mixed' && (
                    <div className="border border-gray-200 dark:border-slate-800 rounded-2xl animate-fade-in">
                        <button 
                            type="button"
                            onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                            className={`w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 transition-colors cursor-pointer ${showAdvancedSettings ? 'rounded-t-2xl' : 'rounded-2xl'}`}
                        >
                            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                                <Settings2 size={18} />
                                <span className="font-bold text-sm">Cài đặt chuyên sâu (Hỗn hợp)</span>
                            </div>
                            {showAdvancedSettings ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
                        </button>
                        
                        {showAdvancedSettings && (
                            <div className="p-4 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 space-y-4 rounded-b-2xl">
                                {[
                                    { key: 'en_to_vi', label: 'Nhìn Tiếng Anh ➔ Chọn Tiếng Việt' },
                                    { key: 'vi_to_en', label: 'Nhìn Tiếng Việt ➔ Chọn Tiếng Anh' },
                                    { key: 'listen_to_en', label: 'Nghe ➔ Chọn Tiếng Anh' },
                                    { key: 'listen_to_vi', label: 'Nghe ➔ Chọn Tiếng Việt' },
                                    { key: 'listen_example', label: 'Nghe câu ví dụ ➔ Chọn Từ vựng' },
                                    { key: 'en_to_category', label: 'Nhìn Tiếng Anh ➔ Chọn Từ loại' },
                                    { key: 'category_to_en', label: 'Nhìn Từ loại ➔ Chọn Tiếng Anh' },
                                ].map(setting => (
                                    <label key={setting.key} className="relative flex items-center justify-between cursor-pointer group select-none" translate="no">
                                        <span className="text-sm font-medium text-gray-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            {setting.label}
                                        </span>
                                        <input 
                                            type="checkbox" 
                                            className="sr-only peer"
                                            checked={!!quizSettings?.[setting.key]}
                                            onChange={(e) => setQuizSettings(prev => ({...(prev || defaultSettings), [setting.key]: e.target.checked}))}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600 relative"></div>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800">
                        <div>
                            <p className="font-semibold text-gray-800 dark:text-gray-200">Tự động chuyển câu</p>
                            <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5 leading-tight">Sau khi xem đáp án, tự chuyển sang câu tiếp theo</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="sr-only peer"
                                checked={autoNext}
                                onChange={(e) => setAutoNext(e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>

                    {autoNext && (
                        <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800 animate-fade-in">
                            <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 mb-3">Tốc độ chuyển câu</p>
                            <div className="flex gap-2 bg-gray-200/50 dark:bg-slate-800 p-1.5 rounded-xl border border-gray-200 dark:border-slate-700/50">
                                {[
                                    { id: 'fast', label: 'Nhanh' },
                                    { id: 'normal', label: 'Bình thường' },
                                    { id: 'slow', label: 'Chậm' },
                                ].map(speed => (
                                    <button
                                        type="button"
                                        key={speed.id}
                                        onClick={() => setQuizSettings({ ...quizSettings, transitionSpeed: speed.id })}
                                        className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all cursor-pointer ${
                                            quizSettings?.transitionSpeed === speed.id
                                                ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400'
                                                : 'text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-300'
                                        }`}
                                    >
                                        {speed.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    onClick={handleStartQuiz}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl text-xs shadow-md transition cursor-pointer"
                >
                    Bắt đầu ôn tập
                </button>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="text-center p-10 text-gray-500 dark:text-slate-400">Đang tạo bài kiểm tra...</div>
        );
    }

    if (showResult) {
        return (
            <div className="text-center bg-white dark:bg-slate-900 p-10 rounded-3xl shadow-lg border-2 border-blue-100 dark:border-blue-900/50 max-w-lg mx-auto transition-colors animate-fade-in">
                <CheckCircle2 size={64} className="mx-auto text-blue-500 mb-4 animate-bounce" />
                <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400">Hoàn thành bài kiểm tra!</h2>
                <p className="text-gray-600 dark:text-slate-400 mb-6 mt-2">Điểm của bạn: <span className="font-extrabold text-blue-500">{score}</span> / {questions.length}</p>
                <button 
                    onClick={resetQuiz}
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-750 transition font-bold text-xs shadow-sm cursor-pointer"
                >
                    Quay lại Cấu hình
                </button>
            </div>
        );
    }

    const q = questions[currentQ];
    
    return (
        <div className="max-w-2xl mx-auto animate-fade-in space-y-3 md:space-y-6 pb-20 md:pb-0">
            <div className="flex justify-between items-end px-2 md:px-0">
                <span className="text-xs font-mono font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest">
                    CÂU HỎI {currentQ + 1} / {questions.length}
                </span>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900/30">
                    Điểm: {score}
                </span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 md:p-8 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-800 relative transition-colors">
                
                {/* Audio speaker button (Hidden in vi_to_en and category_to_en until user answers to avoid spoilers) */}
                <div className="absolute right-3 top-3 md:right-4 md:top-4">
                    {!q.type.startsWith('listen_') && (q.type === 'en_to_vi' || q.type === 'en_to_category' || selectedOptionId !== null) ? (
                        <button 
                            onClick={(e) => speak(q.target.en, e)}
                            className="p-2 md:p-3 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition cursor-pointer"
                            title="Nghe phát âm (Space)"
                        >
                            <Volume2 size={20} />
                        </button>
                    ) : (
                        <div className="w-10 h-10 md:w-11 md:h-11" />
                    )}
                </div>

                <p className="text-center text-[10px] md:text-xs font-black uppercase text-gray-400 dark:text-slate-500 tracking-wider mb-2 mt-4 md:mt-0">
                    {q.type === 'en_to_vi' ? 'Từ này có nghĩa là gì?' : 
                     q.type === 'vi_to_en' ? 'Nghĩa này là của từ tiếng Anh nào?' :
                     q.type === 'en_to_category' ? 'Từ này thuộc loại từ / nhóm nào?' :
                     q.type === 'category_to_en' ? 'Từ tiếng Anh nào thuộc loại từ này?' :
                     q.type === 'listen_example' ? 'Nghe câu ví dụ và chọn từ đã xuất hiện' :
                     q.type === 'listen_to_en' ? 'Nghe và chọn từ tiếng Anh' :
                     'Nghe và chọn nghĩa tiếng Việt'}
                </p>

                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-center text-indigo-700 dark:text-indigo-400 leading-tight break-words px-2 md:px-8">
                    {q.type === 'en_to_vi' || q.type === 'en_to_category' ? q.target.en : 
                     q.type === 'vi_to_en' ? q.target.vi : 
                     q.type === 'category_to_en' ? (q.target.category || "Từ vựng") :
                     (
                        <button 
                            onClick={(e) => speak(q.type === 'listen_example' ? (q.target.example_en || q.target.example) : q.target.en, e)}
                            className="p-5 md:p-6 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-800/50 transition cursor-pointer mx-auto block mt-4"
                            title="Nghe lại (Space)"
                        >
                            <Headphones size={36} className={`md:w-12 md:h-12 ${selectedOptionId === null ? "animate-pulse" : ""}`} />
                        </button>
                     )}
                </h2>

                {q.type.startsWith('listen_') && selectedOptionId !== null && (
                    <div className="animate-fade-in text-center mt-2 flex flex-col items-center gap-1">
                        <p className={`font-bold text-indigo-600 dark:text-indigo-400 ${q.type === 'listen_example' ? 'text-lg px-4' : 'text-xl'}`}>
                            {q.type === 'listen_example' ? (
                                <span>
                                    {(q.target.example_en || q.target.example || '').split(new RegExp(`(${q.target.en})`, 'gi')).map((part, i) => 
                                        part.toLowerCase() === q.target.en.toLowerCase() 
                                            ? <span key={i} className="text-green-600 dark:text-green-400 underline">{part}</span> 
                                            : part
                                    )}
                                </span>
                            ) : q.target.en}
                        </p>
                        {q.type === 'listen_example' && (q.target.example_vi || q.target.exampleVi) && (
                            <p className="text-sm font-medium text-gray-500 dark:text-slate-400 italic px-4">
                                {q.target.example_vi || q.target.exampleVi}
                            </p>
                        )}
                    </div>
                )}

                {q.target.category && q.type !== 'en_to_category' && q.type !== 'category_to_en' && (
                    <div className="mt-3 flex justify-center animate-fade-in">
                        <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-semibold rounded-full border border-indigo-100 dark:border-indigo-800/50">
                            {q.target.category}
                        </span>
                    </div>
                )}

                {/* Show pronunciation only for en_to_vi, OR for vi_to_en after selection */}
                {(q.type === 'en_to_vi' || selectedOptionId !== null) && q.target.ipa && (
                    <div className="mt-4 animate-fade-in">
                        <p className="text-center text-gray-400 dark:text-slate-500 font-mono text-xl">{q.target.ipa}</p>
                        <IpaGuide ipa={q.target.ipa} />
                    </div>
                )}
            </div>

            {/* Multiple Choice Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
                {q.options.map((opt, index) => {
                    const isTargetOpt = q.type === 'en_to_category' 
                        ? opt.en === (q.target.category || "Từ vựng") 
                        : opt.en === q.target.en;
                    const isSelectedOpt = opt.en === selectedOptionId;
                    
                    let buttonClass = "p-3 md:p-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-md transition text-gray-700 dark:text-slate-200 text-left relative overflow-hidden cursor-pointer";
                    let icon = null;
                    
                    if (selectedOptionId !== null) {
                        if (isTargetOpt) {
                            // Highlight the correct answer in green
                            buttonClass = "p-3 md:p-4 bg-green-50 dark:bg-green-950/20 border-2 border-green-500 dark:border-green-600 rounded-2xl shadow-sm text-green-800 dark:text-green-400 text-left font-bold relative overflow-hidden";
                            icon = <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" size={20} />;
                        } else if (isSelectedOpt) {
                            // Highlight the wrong selected answer in red
                            buttonClass = "p-3 md:p-4 bg-red-50 dark:bg-red-950/20 border-2 border-red-500 dark:border-red-600 rounded-2xl shadow-sm text-red-800 dark:text-red-400 text-left font-bold relative overflow-hidden";
                            icon = <XCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500" size={20} />;
                        } else {
                            // Dim out other options
                            buttonClass = "p-3 md:p-4 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl shadow-sm text-gray-400 dark:text-slate-500 text-left opacity-40 relative overflow-hidden";
                        }
                    }

                    const letter = String.fromCharCode(65 + index); // A, B, C, D

                    return (
                        <button 
                            key={`${opt.en}-${index}`}
                            onClick={() => handleAnswer(opt.en)}
                            disabled={selectedOptionId !== null}
                            className={buttonClass}
                        >
                            <span className="pr-8 block font-semibold text-sm flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded-md bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 text-[10px] font-bold border border-gray-200 dark:border-slate-700 shrink-0">
                                    {letter}
                                </span>
                                {q.type === 'en_to_vi' || q.type === 'listen_to_vi' ? opt.vi : opt.en}
                            </span>
                            {selectedOptionId !== null && q.type !== 'en_to_category' && (
                                <span className="text-xs text-gray-500 dark:text-slate-400 block mt-1 animate-fade-in pl-8">
                                    {q.type === 'en_to_vi' || q.type === 'listen_to_vi' ? opt.en : opt.vi}
                                </span>
                            )}
                            {icon}
                        </button>
                    );
                })}
            </div>
            
            {/* Interactive Feedback Banners */}
            {selectedOptionId !== null && selectedOptionId !== (q.type === 'en_to_category' ? (q.target.category || "Từ vựng") : q.target.en) && (
                <div className="p-4 bg-red-50 dark:bg-red-950/25 border border-red-200 dark:border-red-900/40 rounded-2xl text-center animate-fade-in shadow-sm">
                    <p className="text-red-600 dark:text-red-400 font-extrabold text-sm">Rất tiếc, đáp án chưa chính xác!</p>
                    <p className="text-slate-700 dark:text-slate-300 text-xs mt-1">
                        Đáp án đúng là: <span className="font-extrabold text-green-600 dark:text-green-400">{
                            q.type === 'en_to_category' ? (q.target.category || "Từ vựng") :
                            (q.type === 'en_to_vi' || q.type === 'listen_to_vi' ? q.target.vi : q.target.en)
                        }</span>
                    </p>
                </div>
            )}
            
            {selectedOptionId !== null && selectedOptionId === (q.type === 'en_to_category' ? (q.target.category || "Từ vựng") : q.target.en) && (
                <div className="p-4 bg-green-50 dark:bg-green-950/25 border border-green-200 dark:border-green-900/40 rounded-2xl text-center animate-fade-in shadow-sm">
                    <p className="text-green-600 dark:text-green-400 font-extrabold text-sm">Tuyệt vời! Đáp án hoàn toàn chính xác. 🎯</p>
                </div>
            )}

            {/* Manual Skip/Transition Button */}
            {selectedOptionId !== null && (
                <div className="flex justify-end animate-fade-in">
                    <button
                        onClick={moveToNextQuestion}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-extrabold text-xs shadow-md transition cursor-pointer"
                    >
                        {currentQ + 1 < questions.length ? "Tiếp theo ➔" : "Xem kết quả ➔"}
                    </button>
                </div>
            )}
        </div>
    );
};

export default function QuizMode(props) {
    return (
        <QuizErrorBoundary>
            <QuizModeInner {...props} />
        </QuizErrorBoundary>
    );
}
