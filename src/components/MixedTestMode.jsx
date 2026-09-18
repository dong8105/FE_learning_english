import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { 
    CheckCircle2, XCircle, HelpCircle, FileText, 
    BookOpen, Lightbulb, Clock, Eye, Send, Award, AlertCircle, Edit
} from "lucide-react";
import { useAiStatus } from "./AiStatusProvider";

const MixedTestMode = () => {
    const { reportAiUsage } = useAiStatus();

    const [level, setLevel] = useState(() => {
        return localStorage.getItem("vstep_mock_level") || "VSTEP Bậc 3 (B1)";
    });
    const [isLoading, setIsLoading] = useState(false);
    const [testData, setTestData] = useState(() => {
        const cached = localStorage.getItem("vstep_mock_testData");
        return cached ? JSON.parse(cached) : null;
    });
    const [userAnswers, setUserAnswers] = useState(() => {
        const cached = localStorage.getItem("vstep_mock_userAnswers");
        return cached ? JSON.parse(cached) : {};
    });
    const [showResults, setShowResults] = useState(() => {
        const cached = localStorage.getItem("vstep_mock_showResults");
        return cached ? JSON.parse(cached) : false;
    });
    const [score, setScore] = useState(() => {
        const cached = localStorage.getItem("vstep_mock_score");
        return cached ? Number(cached) : 0;
    });
    
    // VSTEP Exam Tab: 'reading' or 'writing'
    const [activeSectionTab, setActiveSectionTab] = useState(() => {
        return localStorage.getItem("vstep_mock_activeSectionTab") || "reading";
    });
    
    // Timer state
    const [timeLeft, setTimeLeft] = useState(() => {
        const cached = localStorage.getItem("vstep_mock_timeLeft");
        return cached ? Number(cached) : 0;
    });
    const timerRef = useRef(null);

    const handleTabChange = (tab) => {
        setActiveSectionTab(tab);
        localStorage.setItem("vstep_mock_activeSectionTab", tab);
    };

    // Start Timer when testData is loaded
    useEffect(() => {
        if (testData && !showResults) {
            if (timerRef.current) clearInterval(timerRef.current);
            
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    const nextTime = prev <= 1 ? 0 : prev - 1;
                    localStorage.setItem("vstep_mock_timeLeft", nextTime.toString());
                    if (nextTime === 0) {
                        clearInterval(timerRef.current);
                        handleSubmit(true); // Auto submit when time runs out
                    }
                    return nextTime;
                });
            }, 1000);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [testData, showResults]);

    const handleGenerate = async () => {
        setIsLoading(true);
        setTestData(null);
        setUserAnswers({});
        setShowResults(false);
        setScore(0);
        setActiveSectionTab("reading");
        setTimeLeft(3600);

        localStorage.removeItem("vstep_mock_testData");
        localStorage.setItem("vstep_mock_userAnswers", JSON.stringify({}));
        localStorage.setItem("vstep_mock_showResults", "false");
        localStorage.setItem("vstep_mock_score", "0");
        localStorage.setItem("vstep_mock_activeSectionTab", "reading");
        localStorage.setItem("vstep_mock_timeLeft", "3600");

        try {
            const prompt = `Hãy tạo một bài kiểm tra mô phỏng kỳ thi VSTEP môn tiếng Anh.
Trình độ: ${level}

Bài kiểm tra cần sát với định dạng đề thi VSTEP thực tế cho 2 kỹ năng Đọc (Reading) và Viết (Writing):
1. Đọc hiểu (Reading): Cung cấp 2 đoạn văn (1 học thuật, 1 đời sống). Mỗi đoạn văn đi kèm 4 câu hỏi trắc nghiệm kiểm tra từ vựng, ý chính, chi tiết, suy luận.
2. Viết (Writing):
- Task 1: Chủ đề viết thư/email hoặc tóm tắt thông tin (Mô phỏng VSTEP Task 1).
- Task 2: Viết luận (khoảng 250-300 từ) về một chủ đề xã hội (Mô phỏng VSTEP Task 2).

Trả về định dạng JSON BẮT BUỘC như sau. Đặc biệt chú ý thuộc tính "type" của câu hỏi phải là "multiple_choice" hoặc "writing":
{
    "title": "Đề thi thử VSTEP - Trình độ ${level}",
    "sections": [
        {
            "id": "reading_1",
            "title": "Phần 1: Đọc hiểu (Reading) - Đoạn 1",
            "instruction": "Đọc đoạn văn sau và chọn đáp án đúng.",
            "passage": "Nội dung đoạn văn...",
            "questions": [
                {
                    "id": "r1",
                    "type": "multiple_choice",
                    "question": "Nội dung câu hỏi",
                    "options": ["A", "B", "C", "D"],
                    "correctAnswerIndex": 0,
                    "explanation": "Giải thích"
                }
            ]
        },
        {
            "id": "writing_1",
            "title": "Phần 2: Viết (Writing)",
            "instruction": "Đọc kỹ yêu cầu và viết bài luận hoặc email/thư.",
            "questions": [
                {
                    "id": "w1",
                    "type": "writing",
                    "question": "Writing Task 1: (Mô tả tình huống viết thư/email...)",
                    "sampleAnswer": "Bài viết mẫu cho Task 1..."
                },
                {
                    "id": "w2",
                    "type": "writing",
                    "question": "Writing Task 2: (Mô tả đề bài luận...)",
                    "sampleAnswer": "Bài viết mẫu cho Task 2..."
                }
            ]
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
                    systemInstruction: "Bạn là một giám khảo chuyên ra đề thi VSTEP. Luôn trả về JSON hợp lệ với cấu trúc chuẩn xác.", 
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
            
            setTestData(parsedData);
            setTimeLeft(3600);
            
            localStorage.setItem("vstep_mock_testData", JSON.stringify(parsedData));
            localStorage.setItem("vstep_mock_timeLeft", "3600");
            toast.success("Đã sinh đề thi thử VSTEP mới!");
        } catch (error) {
            console.error("Lỗi từ Gemini API:", error);
            toast.error("Lỗi kết nối hoặc AI trả về sai định dạng!");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectAnswer = (qId, value) => {
        if (showResults) return;
        setUserAnswers(prev => {
            const updated = {
                ...prev,
                [qId]: value
            };
            localStorage.setItem("vstep_mock_userAnswers", JSON.stringify(updated));
            return updated;
        });
    };

    const getTotalMCQ = () => {
        if (!testData) return 0;
        return testData.sections.reduce((acc, sec) => 
            acc + sec.questions.filter(q => q.type !== 'writing').length
        , 0);
    };

    const handleSubmit = (auto = false) => {
        if (!testData) return;
        
        if (timerRef.current) clearInterval(timerRef.current);

        // Ensure all multiple choice questions are answered (only if not auto-submitted)
        if (!auto) {
            const allMcqAnswered = testData.sections.every(sec => 
                sec.questions
                   .filter(q => q.type !== 'writing')
                   .every(q => userAnswers[q.id] !== undefined)
            );

            if (!allMcqAnswered) {
                toast.warning("Vui lòng trả lời tất cả các câu hỏi trắc nghiệm!");
                return;
            }
        }

        let currentScore = 0;
        testData.sections.forEach(sec => {
            sec.questions.forEach(q => {
                if (q.type !== 'writing') {
                    if (userAnswers[q.id] === q.correctAnswerIndex) {
                        currentScore++;
                    }
                }
            });
        });
        
        setScore(currentScore);
        setShowResults(true);
        localStorage.setItem("vstep_mock_score", currentScore.toString());
        localStorage.setItem("vstep_mock_showResults", "true");

        if (auto) {
            toast.error("Đã hết thời gian làm bài! Hệ thống tự động nộp bài.");
        } else {
            toast.success("Nộp bài thi thành công!");
        }
    };

    // Format seconds to MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Filter sections based on active tab
    const filteredSections = testData?.sections.filter(sec => {
        const isWritingSection = sec.id.toLowerCase().includes('writing') || sec.questions.some(q => q.type === 'writing');
        if (activeSectionTab === 'reading') {
            return !isWritingSection;
        } else {
            return isWritingSection;
        }
    }) || [];

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in mt-2">
            
            {/* Control Panel Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-150 dark:border-slate-800 transition-colors">
                <h2 className="text-2xl font-black mb-6 text-indigo-650 dark:text-indigo-400 flex items-center gap-2">
                    <FileText size={26} /> Bài Tập Tổng Hợp AI (VSTEP)
                </h2>
                
                <div className="flex flex-col sm:flex-row gap-4 items-end justify-between">
                    <div className="flex-1 w-full">
                        <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Trình độ VSTEP</label>
                        <select 
                            className="appearance-none w-full p-3 bg-slate-50 dark:bg-slate-800 border border-gray-250 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-white font-semibold cursor-pointer shadow-sm text-sm"
                            value={level}
                            onChange={(e) => {
                                setLevel(e.target.value);
                                localStorage.setItem("vstep_mock_level", e.target.value);
                            }}
                        >
                            <option value="VSTEP Bậc 2 (A2)" className="bg-white dark:bg-slate-800">VSTEP Bậc 2 (A2)</option>
                            <option value="VSTEP Bậc 3 (B1)" className="bg-white dark:bg-slate-800">VSTEP Bậc 3 (B1)</option>
                            <option value="VSTEP Bậc 4 (B2)" className="bg-white dark:bg-slate-800">VSTEP Bậc 4 (B2)</option>
                            <option value="VSTEP Bậc 5 (C1)" className="bg-white dark:bg-slate-800">VSTEP Bậc 5 (C1)</option>
                        </select>
                    </div>
                    <button 
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-750 text-white font-bold py-3.5 px-8 rounded-2xl transition shadow-md disabled:bg-indigo-400 text-sm whitespace-nowrap"
                    >
                        {isLoading ? "Đang tạo đề thi..." : "Bắt đầu thi thử"}
                    </button>
                </div>
            </div>

            {/* Test Area */}
            {testData && (
                <div className="space-y-6">
                    {/* Header bar: Timer & Tab Switchers */}
                    <div className="flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-gray-150 dark:border-slate-800 gap-4 transition-colors">
                        
                        {/* Section Tab Switchers */}
                        <div className="flex bg-slate-50 dark:bg-slate-850 p-1 rounded-2xl border border-gray-150 dark:border-slate-800/60 w-fit">
                            <button
                                onClick={() => handleTabChange("reading")}
                                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                                    activeSectionTab === "reading"
                                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm font-black'
                                        : 'text-gray-500 dark:text-slate-400'
                                }`}
                            >
                                <BookOpen size={14} /> 📖 Đọc hiểu (Reading)
                            </button>
                            <button
                                onClick={() => handleTabChange("writing")}
                                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                                    activeSectionTab === "writing"
                                        ? 'bg-white dark:bg-slate-700 text-indigo-650 dark:text-indigo-400 shadow-sm font-black'
                                        : 'text-gray-500 dark:text-slate-400'
                                }`}
                            >
                                <Edit size={14} /> ✍️ Viết luận (Writing)
                            </button>
                        </div>

                        {/* Countdown Timer */}
                        {!showResults && (
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border font-bold text-sm ${
                                timeLeft < 300 
                                    ? 'bg-red-50 dark:bg-red-950/20 text-red-650 border-red-200 animate-pulse' 
                                    : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 border-amber-200'
                            }`}>
                                <Clock size={16} />
                                <span>Thời gian làm bài: {formatTime(timeLeft)}</span>
                            </div>
                        )}

                        {showResults && (
                            <div className="bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-250/30 text-emerald-600 px-4 py-2 rounded-2xl font-bold text-xs">
                                Đã nộp bài thi
                            </div>
                        )}
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-150 dark:border-slate-800 transition-colors">
                        <h3 className="text-xl font-black text-gray-800 dark:text-white mb-6 text-center border-b border-gray-100 dark:border-slate-850 pb-4">
                            {testData.title}
                        </h3>
                        
                        {/* Render active section */}
                        <div className="space-y-8 animate-fade-in">
                            {filteredSections.map((section) => (
                                <div key={section.id} className="space-y-6">
                                    <div className="border-b border-gray-100 dark:border-slate-850 pb-4">
                                        <h4 className="text-lg font-black text-indigo-600 dark:text-indigo-400">{section.title}</h4>
                                        <p className="text-xs text-gray-400 dark:text-slate-500 italic mt-1">{section.instruction}</p>
                                    </div>
                                    
                                    {section.passage && (
                                        <div className="p-6 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-gray-150 dark:border-slate-850 text-gray-850 dark:text-slate-200 leading-relaxed shadow-inner font-serif text-base transition-colors">
                                            {section.passage}
                                        </div>
                                    )}

                                    <div className="space-y-8">
                                        {section.questions.map((q, qIdx) => (
                                            <div key={q.id} className="bg-slate-50/50 dark:bg-slate-850/40 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
                                                <p className="text-base font-bold text-gray-800 dark:text-white leading-relaxed">
                                                    <span className="text-indigo-650 dark:text-indigo-400 font-black mr-2">
                                                        {q.type === 'writing' ? `Writing Task ${qIdx + 1}` : `Câu ${qIdx + 1}`}:
                                                    </span>
                                                    {q.question}
                                                </p>
                                                
                                                {q.type === 'writing' ? (
                                                    <div className="space-y-4">
                                                        <textarea
                                                            className="w-full p-4 border border-gray-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 min-h-[300px] text-sm text-gray-800 dark:text-white shadow-inner resize-y transition-all"
                                                            placeholder="Soạn thảo bài viết của bạn tại đây (Từ 150 - 300 từ)..."
                                                            value={userAnswers[q.id] || ''}
                                                            onChange={(e) => handleSelectAnswer(q.id, e.target.value)}
                                                            disabled={showResults}
                                                        />
                                                        
                                                        {showResults && (
                                                            <div className="p-5 bg-yellow-50 dark:bg-yellow-950/20 rounded-2xl border border-yellow-150/40 dark:border-yellow-900/30 shadow-sm animate-fade-in transition-colors">
                                                                <p className="font-extrabold text-yellow-800 dark:text-yellow-400 mb-2.5 flex items-center gap-2 text-xs uppercase tracking-wider">
                                                                    <Lightbulb size={16} /> Bài Trả Lời Mẫu (Sample Answer)
                                                                </p>
                                                                <div className="whitespace-pre-wrap text-gray-700 dark:text-slate-200 text-sm leading-relaxed font-serif bg-white/60 dark:bg-slate-900/40 p-4 rounded-xl border border-yellow-100 dark:border-yellow-900/20 shadow-inner">
                                                                    {q.sampleAnswer}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">
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
                                                                        : "border-gray-250/70 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 shadow-sm";
                                                                } else {
                                                                    if (isCorrectSelected) {
                                                                        btnClass += "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-extrabold";
                                                                    } else if (isWrongSelected) {
                                                                        btnClass += "border-red-500 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 font-bold";
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

                                                        {showResults && (
                                                            <div className="p-4 bg-blue-50/50 dark:bg-blue-950/10 rounded-2xl border border-blue-150 dark:border-blue-900/30 flex gap-3 items-start animate-fade-in shadow-sm">
                                                                <HelpCircle className="text-blue-500 shrink-0 mt-0.5" size={16} />
                                                                <div className="text-xs">
                                                                    <p className="font-extrabold text-blue-800 dark:text-blue-300 mb-1">Giải thích:</p>
                                                                    <p className="text-blue-700 dark:text-blue-400 leading-relaxed">{q.explanation}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Submit Button Section */}
                        {!showResults ? (
                            <div className="mt-8 text-center border-t border-gray-100 dark:border-slate-850 pt-6 flex justify-between items-center flex-wrap gap-4">
                                <p className="text-xs text-gray-400 font-bold flex items-center gap-1.5 bg-gray-50 dark:bg-slate-950/30 py-2 px-4 rounded-xl border border-gray-200/20 dark:border-slate-800">
                                    <AlertCircle size={14} className="text-amber-500" /> Vui lòng kiểm tra lại tất cả các Tab trước khi nộp bài.
                                </p>
                                <button 
                                    onClick={() => handleSubmit(false)}
                                    className="bg-emerald-600 text-white font-bold py-3 px-12 rounded-xl hover:bg-emerald-700 transition shadow-md text-sm flex items-center gap-2 self-end"
                                >
                                    <Send size={14} /> Nộp bài thi
                                </button>
                            </div>
                        ) : (
                            <div className="mt-8 p-6 bg-slate-50/60 dark:bg-slate-850/60 rounded-3xl border border-gray-150 dark:border-slate-800 text-center transition-all shadow-inner animate-fade-in">
                                <div className="flex justify-center mb-2 text-indigo-600 dark:text-indigo-400">
                                    <Award size={48} />
                                </div>
                                <h4 className="text-lg font-black text-gray-800 dark:text-white mb-2">Báo Cáo Kết Quả Thi VSTEP</h4>
                                
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm inline-block min-w-[250px] mb-5 transition-colors">
                                    <p className="text-xs text-gray-450 dark:text-slate-400 font-bold uppercase tracking-wider mb-2">Điểm trắc nghiệm (Reading)</p>
                                    <p className="text-5xl font-black text-indigo-650 dark:text-indigo-400">
                                        {score} / {getTotalMCQ()}
                                    </p>
                                </div>
                                
                                <div className="max-w-lg mx-auto bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-150/40 dark:border-yellow-900/30 p-4 rounded-2xl mb-6 shadow-sm">
                                    <p className="text-yellow-800 dark:text-yellow-400 font-bold text-xs flex items-center gap-1.5 justify-center">
                                        <Eye size={14} /> Phần thi Viết (Writing Task 1 & 2)
                                    </p>
                                    <p className="text-gray-650 dark:text-slate-300 text-xs mt-1.5 leading-relaxed">Không chấm điểm tự động. Vui lòng chuyển sang Tab Viết luận ở trên để đối chiếu bài viết của bạn với Bài làm mẫu của chuyên gia.</p>
                                </div>

                                <p className="text-gray-600 dark:text-slate-400 mb-6 font-medium text-sm">
                                    {score === getTotalMCQ() ? "🏆 Xuất sắc! Bạn đạt điểm tối đa trắc nghiệm Đọc hiểu." : 
                                     score >= getTotalMCQ() / 2 ? "🎉 Khá tốt! Luyện tập viết bài luận thường xuyên sẽ tăng band nhanh chóng." : 
                                     "💪 Cố gắng lên! Hãy kiên trì học và làm thêm các đề thi tiếp theo."}
                                </p>
                                <button 
                                    onClick={handleGenerate}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl transition shadow-md text-xs"
                                >
                                    Tạo Đề VSTEP khác
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MixedTestMode;
