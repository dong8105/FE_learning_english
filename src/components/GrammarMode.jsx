import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { 
    CheckCircle2, XCircle, HelpCircle, BookOpen, 
    Lightbulb, Sparkles, Star, Award, Settings, Check 
} from "lucide-react";
import { recordGrammarResult } from "../utils/progressTracker";
import { useAiStatus } from "./AiStatusProvider";

const GrammarMode = ({ initialTopic = null, initialLevel = null }) => {
    const { reportAiUsage } = useAiStatus();

    const [topic, setTopic] = useState(initialTopic || "Hiện tại đơn (Present Simple)");
    const [level, setLevel] = useState(initialLevel || "A2 (Sơ cấp)");

    useEffect(() => {
        if (initialTopic) setTopic(initialTopic);
        if (initialLevel) setLevel(initialLevel);
    }, [initialTopic, initialLevel]);
    const [questionType, setQuestionType] = useState("multiple_choice"); // multiple_choice, find_mistake
    const [questionCount, setQuestionCount] = useState(5);
    const [difficultyProgression, setDifficultyProgression] = useState("ascending");
    const [isLoading, setIsLoading] = useState(false);
    const [questions, setQuestions] = useState(null);
    const [userAnswers, setUserAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);

    // Load cached grammar quiz for topic & level
    useEffect(() => {
        const cacheKey = `${topic}_${level}`;
        const storedQuizzes = localStorage.getItem('grammar_ai_quizzes');
        const quizzesMap = storedQuizzes ? JSON.parse(storedQuizzes) : {};
        
        if (quizzesMap[cacheKey]) {
            setQuestions(quizzesMap[cacheKey]);
            
            const storedStates = localStorage.getItem('grammar_ai_quizzes_state');
            const statesMap = storedStates ? JSON.parse(storedStates) : {};
            if (statesMap[cacheKey]) {
                setUserAnswers(statesMap[cacheKey].userAnswers || {});
                setShowResults(statesMap[cacheKey].showResults || false);
                setScore(statesMap[cacheKey].score || 0);
            } else {
                setUserAnswers({});
                setShowResults(false);
                setScore(0);
            }
        } else {
            setQuestions(null);
            setUserAnswers({});
            setShowResults(false);
            setScore(0);
        }
    }, [topic, level]);

    const grammarTopics = [
        "Hiện tại đơn (Present Simple)",
        "Quá khứ đơn (Past Simple)",
        "Tương lai đơn (Future Simple)",
        "Hiện tại tiếp diễn (Present Continuous)",
        "Hiện tại hoàn thành (Present Perfect)",
        "Câu phức (Complex Sentences)",
        "Câu điều kiện loại 1, 2 (Conditionals Type 1, 2)",
        "Câu bị động (Passive Voice)",
        "Mệnh đề quan hệ (Relative Clauses)",
        "Câu gián tiếp (Reported Speech)",
        "Câu so sánh (Comparisons)",
        "V-ing và To-V (Gerunds & Infinitives)",
        "Mạo từ (Articles: a, an, the)",
        "Giới từ (Prepositions)"
    ];

    const levelsList = [
        { key: "A1 (Cơ bản)", label: "A1", desc: "Cơ bản", color: "from-green-500 to-emerald-600 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400" },
        { key: "A2 (Sơ cấp)", label: "A2", desc: "Sơ cấp", color: "from-teal-500 to-cyan-600 bg-teal-50 dark:bg-teal-950/20 text-teal-700 dark:text-teal-400" },
        { key: "B1 (Trung cấp)", label: "B1", desc: "Trung cấp", color: "from-blue-500 to-indigo-600 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400" },
        { key: "B2 (Trung cao cấp)", label: "B2", desc: "Khá", color: "from-indigo-500 to-purple-600 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400" },
        { key: "C1 (Cao cấp)", label: "C1", desc: "Cao cấp", color: "from-purple-500 to-pink-600 bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400" }
    ];

    const handleGenerate = async () => {
        setIsLoading(true);
        // Do not clear questions/states until successfully generated
        try {
            let difficultyInstruction = "";
            if (difficultyProgression === "ascending") {
                difficultyInstruction = "Mức độ khó của các câu hỏi phải tăng dần từ dễ đến khó.";
            } else if (difficultyProgression === "random") {
                difficultyInstruction = "Mức độ khó của các câu hỏi ngẫu nhiên.";
            } else {
                difficultyInstruction = `Mức độ khó của các câu hỏi đồng đều ở trình độ ${level}.`;
            }

            const prompt = `Hãy tạo ${questionCount} câu hỏi bài tập ngữ pháp tiếng Anh.
Chủ đề ngữ pháp: ${topic}
Trình độ: ${level}
Loại câu hỏi: ${questionType === 'multiple_choice' ? 'Trắc nghiệm (chọn A, B, C, hoặc D)' : 'Tìm lỗi sai (chọn phần bị sai trong câu)'}
Yêu cầu độ khó: ${difficultyInstruction}

Trả về định dạng JSON BẮT BUỘC như sau:
{
    "title": "Tiêu đề bài tập",
    "theory": {
        "usage": "Cách sử dụng của chủ đề ngữ pháp này (viết ngắn gọn, dễ hiểu).",
        "formula": "Công thức chi tiết. BẮT BUỘC sử dụng ký tự xuống dòng (\\n) và khoảng trắng để trình bày rõ ràng, dễ nhìn. Ví dụ:\n1. Với động từ to be:\nKhẳng định:\n    S + was/were\nPhủ định:\n    S + was/were + not\n2. Với động từ thường:\nKhẳng định:\n    S + V2/-ed\nPhủ định:\n    S + didn't + V-inf\nNghi vấn:\n    Did + S + V-inf?",
        "signs": "Dấu hiệu nhận biết (các từ thường đi kèm, ngữ cảnh...)."
    },
    "questions": [
        {
            "id": 1,
            "question": "Nội dung câu hỏi (nếu là tìm lỗi sai, hãy viết một câu có 1 lỗi sai)",
            "options": ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"],
            "correctAnswerIndex": 0,
            "explanation": "Giải thích chi tiết bằng tiếng Việt tại sao đáp án đó đúng hoặc tại sao phần đó sai và cách sửa."
        }
    ]
}`;

            const token = localStorage.getItem('engmaster_token') || localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ai/generate`, {
                method: 'POST',
                credentials: 'include',
                headers: { 
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ 
                    prompt, 
                    systemInstruction: "Bạn là một giáo viên tiếng Anh chuyên ra đề thi ngữ pháp. Luôn trả về JSON hợp lệ.", 
                    jsonMode: true 
                })
            });
            
            if (!response.ok) {
                if (response.status === 403) {
                    const errJson = await response.json().catch(() => ({}));
                    if (errJson.aiLocked) {
                        toast.error(errJson.error || "Tính năng AI đang tạm khóa bởi Quản trị viên!");
                        return;
                    }
                }
                throw new Error('API Error');
            }
            const data = await response.json();
            if (data.metadata) reportAiUsage(data.metadata);
            const parsedData = JSON.parse(data.text);

            // Save to cached quizzes
            const cacheKey = `${topic}_${level}`;
            const storedQuizzes = localStorage.getItem('grammar_ai_quizzes');
            const quizzesMap = storedQuizzes ? JSON.parse(storedQuizzes) : {};
            quizzesMap[cacheKey] = parsedData;
            localStorage.setItem('grammar_ai_quizzes', JSON.stringify(quizzesMap));
            
            // Save empty state
            const storedStates = localStorage.getItem('grammar_ai_quizzes_state');
            const statesMap = storedStates ? JSON.parse(storedStates) : {};
            statesMap[cacheKey] = {
                userAnswers: {},
                showResults: false,
                score: 0
            };
            localStorage.setItem('grammar_ai_quizzes_state', JSON.stringify(statesMap));

            setQuestions(parsedData);
            setUserAnswers({});
            setShowResults(false);
            setScore(0);
            toast.success("Đã sinh bài tập ngữ pháp mới bằng AI!");
        } catch (error) {
            console.error("Lỗi từ Gemini API:", error);
            toast.error("Lỗi kết nối hoặc AI trả về sai định dạng!");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectAnswer = (qId, optionIndex) => {
        if (showResults) return;
        const newAnswers = {
            ...userAnswers,
            [qId]: optionIndex
        };
        setUserAnswers(newAnswers);

        // Save state
        const cacheKey = `${topic}_${level}`;
        const storedStates = localStorage.getItem('grammar_ai_quizzes_state');
        const statesMap = storedStates ? JSON.parse(storedStates) : {};
        statesMap[cacheKey] = {
            userAnswers: newAnswers,
            showResults: showResults,
            score: score
        };
        localStorage.setItem('grammar_ai_quizzes_state', JSON.stringify(statesMap));
    };

    const handleSubmit = () => {
        if (!questions) return;
        
        if (Object.keys(userAnswers).length < questions.questions.length) {
            toast.warning("Vui lòng trả lời tất cả các câu hỏi trước khi nộp bài!");
            return;
        }

        let currentScore = 0;
        questions.questions.forEach(q => {
            if (userAnswers[q.id] === q.correctAnswerIndex) {
                currentScore++;
            }
        });
        setScore(currentScore);
        setShowResults(true);
        recordGrammarResult(topic, currentScore, questions.questions.length);

        // Save state
        const cacheKey = `${topic}_${level}`;
        const storedStates = localStorage.getItem('grammar_ai_quizzes_state');
        const statesMap = storedStates ? JSON.parse(storedStates) : {};
        statesMap[cacheKey] = {
            userAnswers: userAnswers,
            showResults: true,
            score: currentScore
        };
        localStorage.setItem('grammar_ai_quizzes_state', JSON.stringify(statesMap));
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in mt-2">
            {/* Topic Select & Setup Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-150 dark:border-slate-800 transition-colors">
                <h2 className="text-2xl font-black mb-6 text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                    <BookOpen size={26} /> Luyện Ngữ Pháp AI
                </h2>
                
                <div className="space-y-6">
                    {/* Level Visual Cards */}
                    <div>
                        <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">Chọn trình độ</label>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                            {levelsList.map(item => {
                                const isSelected = level === item.key;
                                return (
                                    <button
                                        key={item.key}
                                        onClick={() => setLevel(item.key)}
                                        className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                                            isSelected 
                                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-[1.03]' 
                                                : 'bg-slate-50 dark:bg-slate-800/40 text-gray-700 dark:text-slate-300 border-gray-200/50 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-gray-300'
                                        }`}
                                    >
                                        <span className={`text-xs font-black px-2 py-0.5 rounded-md ${isSelected ? 'bg-white/20 text-white' : item.color.split(' ').slice(1).join(' ')}`}>
                                            {item.label}
                                        </span>
                                        <span className="text-xs font-bold">{item.desc}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Dropdown Topic Select Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Chủ đề ngữ pháp</label>
                            <div className="relative">
                                <select 
                                    className="appearance-none w-full p-3 bg-slate-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-white font-semibold cursor-pointer shadow-sm text-sm"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                >
                                    {grammarTopics.map(t => <option key={t} value={t} className="bg-white dark:bg-slate-800">{t}</option>)}
                                </select>
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">▼</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Dạng bài</label>
                            <div className="flex bg-slate-50 dark:bg-slate-850 p-1.5 rounded-xl border border-gray-200/50 dark:border-slate-800 w-fit">
                                <button
                                    onClick={() => setQuestionType("multiple_choice")}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        questionType === "multiple_choice"
                                            ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                            : 'text-gray-500 dark:text-slate-400'
                                    }`}
                                >
                                    Trắc nghiệm
                                </button>
                                <button
                                    onClick={() => setQuestionType("find_mistake")}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        questionType === "find_mistake"
                                            ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                            : 'text-gray-500 dark:text-slate-400'
                                    }`}
                                >
                                    Tìm lỗi sai
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Advanced parameters selectors */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div>
                            <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Số lượng câu</label>
                            <div className="flex bg-slate-50 dark:bg-slate-850 p-1 rounded-xl border border-gray-200/50 dark:border-slate-800 w-fit">
                                {[3, 5, 10].map(c => (
                                    <button
                                        key={c}
                                        onClick={() => setQuestionCount(c)}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                            questionCount === c
                                                ? 'bg-white dark:bg-slate-700 text-indigo-650 dark:text-indigo-400 shadow-sm'
                                                : 'text-gray-500 dark:text-slate-400'
                                        }`}
                                    >
                                        {c} câu
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Mức độ khó</label>
                            <div className="relative">
                                <select 
                                    className="appearance-none w-full sm:w-auto min-w-[150px] p-2 bg-slate-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-white font-semibold cursor-pointer shadow-sm text-xs"
                                    value={difficultyProgression}
                                    onChange={(e) => setDifficultyProgression(e.target.value)}
                                >
                                    <option value="ascending" className="bg-white dark:bg-slate-800">Từ dễ đến khó</option>
                                    <option value="uniform" className="bg-white dark:bg-slate-800">Đồng đều</option>
                                    <option value="random" className="bg-white dark:bg-slate-800">Ngẫu nhiên</option>
                                </select>
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-[9px]">▼</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <button 
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-6 rounded-2xl transition shadow-md disabled:bg-indigo-400 flex items-center justify-center gap-2 text-sm"
                    >
                        {isLoading ? (
                            <>Đang thiết lập đề thi...</>
                        ) : (
                            <>
                                <Sparkles size={16} /> Bắt đầu luyện tập bằng AI
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Questions area */}
            {questions && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-150 dark:border-slate-800 transition-colors">
                    <h3 className="text-xl font-black text-gray-850 dark:text-white mb-6 text-center border-b border-gray-100 dark:border-slate-850 pb-4">{questions.title}</h3>
                    
                    {/* Theory Helper box */}
                    {questions.theory && (
                        <div className="mb-8 bg-indigo-50/50 dark:bg-indigo-950/10 rounded-2xl p-6 border border-indigo-150/40 dark:border-indigo-900/30">
                            <h4 className="text-base font-extrabold text-indigo-950 dark:text-indigo-300 mb-3 flex items-center gap-2">
                                <Lightbulb size={18} className="text-amber-500" /> Lý thuyết cần nhớ
                            </h4>
                            <div className="space-y-4 text-xs md:text-sm text-gray-700 dark:text-slate-300 leading-relaxed">
                                <div>
                                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400">Cách sử dụng: </span>
                                    <span>{questions.theory.usage}</span>
                                </div>
                                <div>
                                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400">Công thức: </span>
                                    <p className="whitespace-pre-wrap mt-1.5 bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-150 dark:border-slate-800 font-mono text-xs text-gray-800 dark:text-slate-250 shadow-inner leading-relaxed">{questions.theory.formula}</p>
                                </div>
                                <div>
                                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400">Dấu hiệu: </span>
                                    <span>{questions.theory.signs}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-8">
                        {questions.questions.map((q, index) => (
                            <div key={q.id} className="border-b border-gray-100 dark:border-slate-850 pb-6 last:border-0 last:pb-0">
                                <p className="text-base font-bold text-gray-800 dark:text-white mb-4 leading-relaxed">
                                    <span className="text-indigo-600 dark:text-indigo-400 font-black mr-2">Câu {index + 1}:</span>
                                    {q.question}
                                </p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {q.options.map((opt, optIdx) => {
                                        const isSelected = userAnswers[q.id] === optIdx;
                                        const isCorrect = q.correctAnswerIndex === optIdx;
                                        const isWrongSelected = showResults && isSelected && !isCorrect;
                                        const isCorrectSelected = showResults && isCorrect;

                                        let btnClass = "p-3.5 text-left border-2 rounded-xl text-xs font-semibold transition-all ";
                                        
                                        if (!showResults) {
                                            btnClass += isSelected 
                                                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400" 
                                                : "border-gray-200/70 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300";
                                        } else {
                                            if (isCorrectSelected) {
                                                btnClass += "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-extrabold";
                                            } else if (isWrongSelected) {
                                                btnClass += "border-red-500 bg-red-50 dark:bg-red-950/20 text-red-705 dark:text-red-400 font-bold";
                                            } else {
                                                btnClass += "border-gray-200/50 dark:border-slate-800 text-gray-400 dark:text-slate-500 opacity-40 bg-white dark:bg-slate-900";
                                            }
                                        }

                                        return (
                                            <button 
                                                key={optIdx}
                                                onClick={() => handleSelectAnswer(q.id, optIdx)}
                                                disabled={showResults}
                                                className={btnClass}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                                                    {showResults && isCorrectSelected && <CheckCircle2 size={16} className="text-emerald-500" />}
                                                    {showResults && isWrongSelected && <XCircle size={16} className="text-red-500" />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Correct answer explanation */}
                                {showResults && (
                                    <div className="mt-4 p-4 bg-blue-50/50 dark:bg-blue-950/10 rounded-2xl border border-blue-150 dark:border-blue-900/30 flex gap-3 items-start animate-fade-in shadow-sm">
                                        <HelpCircle className="text-blue-500 shrink-0 mt-0.5" size={16} />
                                        <div className="text-xs">
                                            <p className="font-extrabold text-blue-800 dark:text-blue-300 mb-1">Giải thích đáp án:</p>
                                            <p className="text-blue-700 dark:text-blue-450 leading-relaxed">{q.explanation}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Submit and rating section */}
                    {!showResults ? (
                        <div className="mt-8 text-center border-t border-gray-100 dark:border-slate-850 pt-6">
                            <button 
                                onClick={handleSubmit}
                                className="bg-emerald-600 text-white font-bold py-3 px-12 rounded-xl hover:bg-emerald-700 transition shadow-md text-sm"
                            >
                                Nộp bài kiểm tra
                            </button>
                        </div>
                    ) : (
                        <div className="mt-8 p-6 bg-slate-50/50 dark:bg-slate-850/50 rounded-3xl border border-gray-150 dark:border-slate-800 text-center transition-all shadow-inner animate-fade-in">
                            {score === questions.questions.length ? (
                                <div className="flex justify-center mb-2 text-amber-500 animate-bounce">
                                    <Award size={48} />
                                </div>
                            ) : null}
                            <h4 className="text-xl font-black text-gray-800 dark:text-white mb-2">Báo Cáo Điểm Số</h4>
                            
                            <p className="text-5xl font-black text-indigo-650 dark:text-indigo-400 mb-3 tracking-tight">
                                {score} / {questions.questions.length}
                            </p>
                            
                            <p className="text-sm text-gray-600 dark:text-slate-400 mb-6 max-w-md mx-auto font-medium">
                                {score === questions.questions.length ? "🌟 Hoàn hảo! Bạn có năng lực ngữ pháp rất tốt cho phần này." : 
                                 score >= questions.questions.length / 2 ? "👍 Khá tốt! Đọc thêm các giải thích bên dưới để sửa các từ chưa đúng nhé." : 
                                 "💪 Cố gắng lên! Hãy đọc kỹ và luyện lại lý thuyết ngữ pháp."}
                            </p>
                            <button 
                                onClick={handleGenerate}
                                className="bg-indigo-600 text-white font-bold py-2.5 px-8 rounded-xl hover:bg-indigo-700 transition shadow-md text-xs"
                            >
                                Tiếp tục luyện câu khác
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default GrammarMode;
