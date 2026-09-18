import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import * as diff from "diff"; 
import { Volume2, Edit, Cpu, BookOpen, FileText, ChevronDown, Check, HelpCircle } from "lucide-react";
import { useAiStatus } from "./AiStatusProvider";

const ReadingMode = ({ words = [], speak }) => {
    const { reportAiUsage } = useAiStatus();

    const [genMode, setGenMode] = useState("paragraph"); // "paragraph" or "sentences"
    const [selectedUnits, setSelectedUnits] = useState(["1"]);
    const [sentenceCount, setSentenceCount] = useState(5);
    const availableUnits = [...new Set(words.map(w => w.unit))].filter(u => u != null).sort((a, b) => a - b);

    const [prompt, setPrompt] = useState("");
    const [level, setLevel] = useState("A2 (Sơ cấp)");
    const [selectedGrammars, setSelectedGrammars] = useState([]);
    const [isGrammarOpen, setIsGrammarOpen] = useState(false);
    const [topic, setTopic] = useState("Bản thân & Gia đình");

    const grammarGroups = [
        {
            label: "Các thì (Tenses)",
            options: [
                { label: "Hiện tại đơn", value: "Hiện tại đơn (Present Simple)" },
                { label: "Quá khứ đơn", value: "Quá khứ đơn (Past Simple)" },
                { label: "Tương lai đơn", value: "Tương lai đơn (Future Simple)" },
                { label: "Hiện tại tiếp diễn", value: "Hiện tại tiếp diễn (Present Continuous)" },
                { label: "Hiện tại hoàn thành", value: "Hiện tại hoàn thành (Present Perfect)" }
            ]
        },
        {
            label: "Cấu trúc câu (Structures)",
            options: [
                { label: "Câu phức", value: "Câu phức (Complex Sentences)" },
                { label: "Câu ghép", value: "Câu ghép (Compound Sentences)" },
                { label: "Câu điều kiện loại 1, 2", value: "Câu điều kiện loại 1, 2 (Conditionals Type 1, 2)" },
                { label: "Câu điều kiện loại 3, hỗn hợp", value: "Câu điều kiện loại 3, hỗn hợp (Conditionals Type 3, Mixed)" },
                { label: "Câu bị động", value: "Câu bị động (Passive Voice)" },
                { label: "Mệnh đề quan hệ", value: "Mệnh đề quan hệ (Relative Clauses)" },
                { label: "Câu gián tiếp", value: "Câu gián tiếp (Reported Speech)" },
                { label: "Câu so sánh", value: "Câu so sánh (Comparisons)" },
                { label: "V-ing và To-V", value: "Cấu trúc V-ing và To-V (Gerunds & Infinitives)" }
            ]
        }
    ];
    const [resultData, setResultData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [userSentences, setUserSentences] = useState([]);
    const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
    const [completedSentences, setCompletedSentences] = useState(new Set());
    
    const [diffResult, setDiffResult] = useState(null);
    const [aiFeedback, setAiFeedback] = useState(null);
    const [isEvaluating, setIsEvaluating] = useState(false);

    // Load cached reading workspace on mount
    useEffect(() => {
        const storedResult = localStorage.getItem('reading_ai_resultData');
        if (storedResult) {
            setResultData(JSON.parse(storedResult));
            
            const storedUserSentences = localStorage.getItem('reading_ai_userSentences');
            if (storedUserSentences) setUserSentences(JSON.parse(storedUserSentences));
            
            const storedCompleted = localStorage.getItem('reading_ai_completedSentences');
            if (storedCompleted) setCompletedSentences(new Set(JSON.parse(storedCompleted)));
            
            const storedDiff = localStorage.getItem('reading_ai_diffResult');
            if (storedDiff) setDiffResult(JSON.parse(storedDiff));
            
            const storedFeedback = localStorage.getItem('reading_ai_feedback');
            if (storedFeedback) setAiFeedback(JSON.parse(storedFeedback));
            
            const storedIndex = localStorage.getItem('reading_ai_currentSentenceIndex');
            if (storedIndex) setCurrentSentenceIndex(parseInt(storedIndex, 10));
        }
    }, []);

    const handleAskAI = async () => {
        setIsLoading(true);
        setResultData(null); 
        setDiffResult(null); 
        setAiFeedback(null);

        try {
            const unitWords = words.filter(w => selectedUnits.includes(w.unit.toString())).map(w => w.en).join(', ');
            
            const grammarText = selectedGrammars.length > 0 ? selectedGrammars.join(", ") : "Tự do (Kết hợp)";
            
            const finalPrompt = genMode === "paragraph"
                ? `Hãy viết một đoạn văn tiếng Anh.
                    - Trình độ CEFR: ${level}
                    - Chủ đề từ vựng: ${topic}
                    - Ngữ pháp trọng tâm: ${grammarText}
                    - Yêu cầu thêm từ người dùng: ${prompt || "Không có"}
                  `
                : `Hãy viết ĐÚNG ${sentenceCount} câu tiếng Anh riêng biệt.
                    - Ngữ pháp trọng tâm: ${grammarText}
                    - BẮT BUỘC sử dụng các từ vựng sau trong các câu: ${unitWords || "tự do"}
                    - Yêu cầu thêm từ người dùng: ${prompt || "Không có"}
                  `;

            const token = localStorage.getItem('engmaster_token') || localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ai/generate`, {
                method: 'POST',
                credentials: 'include',
                headers: { 
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ 
                    prompt: finalPrompt, 
                    systemInstruction: `Bạn là một trợ giảng ngôn ngữ Anh. Người dùng sẽ gửi chủ đề.
                    Mọi câu trả lời của bạn BẮT BUỘC phải là JSON hợp lệ.
                    Cấu trúc JSON bắt buộc:
                    {
                        "english_title": "Tiêu đề tiếng Anh",
                        "english_sentences": ["Câu 1 tiếng Anh.", "Câu 2 tiếng Anh."],
                        "vietnamese_title": "Tiêu đề tiếng Việt",
                        "vietnamese_sentences": ["Câu 1 dịch tiếng Việt.", "Câu 2 dịch tiếng Việt."]
                    }
                    Lưu ý: Tách mỗi câu thành một chuỗi (string) trong mảng (array).`, 
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

            const interactiveSentences = parsedData.english_sentences.map((enSentence, index) => {
                return {
                    id: index,
                    en: enSentence,
                    vn: parsedData.vietnamese_sentences[index],
                    showTranslation: false
                }
            });

            // Save to localStorage
            localStorage.setItem('reading_ai_resultData', JSON.stringify({
                english_title: parsedData.english_title,
                vietnamese_title: parsedData.vietnamese_title,
                sentences: interactiveSentences 
            }));
            const defaultUserSentences = new Array(interactiveSentences.length).fill("");
            localStorage.setItem('reading_ai_userSentences', JSON.stringify(defaultUserSentences));
            localStorage.setItem('reading_ai_completedSentences', JSON.stringify([]));
            localStorage.removeItem('reading_ai_diffResult');
            localStorage.removeItem('reading_ai_feedback');
            localStorage.setItem('reading_ai_currentSentenceIndex', '0');

            setResultData({
                english_title: parsedData.english_title,
                vietnamese_title: parsedData.vietnamese_title,
                sentences: interactiveSentences 
            });
            setUserSentences(defaultUserSentences);
            setCurrentSentenceIndex(0);
            setCompletedSentences(new Set());
            setDiffResult(null);
            setAiFeedback(null);

        } catch (error) {
            console.error("Lỗi từ Gemini API:", error);
            toast.error("Lỗi kết nối hoặc AI trả về sai định dạng!");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCompareText = () => {
        if (!resultData) {
            toast.warning("Vui lòng tạo bài mẫu từ AI trước khi kiểm tra!");
            return;
        }

        const hasContent = userSentences.some(s => s.trim().length > 0);
        if (!hasContent) {
            toast.warning("Bạn chưa viết gì cả!");
            return;
        }

        const newCompleted = new Set(completedSentences);
        const sentenceComparisons = resultData.sentences.map((aiSentence, index) => {
            const targetSentence = aiSentence.en; 
            const userSentence = userSentences[index]?.trim() || ""; 
            if (userSentence) newCompleted.add(index);

            return {
                sentenceNumber: index + 1,
                target: targetSentence,
                user: userSentence,
                diffs: diff.diffWords(targetSentence, userSentence)
            };
        });

        setCompletedSentences(newCompleted);
        setDiffResult(sentenceComparisons);
        setAiFeedback(null);

        localStorage.setItem('reading_ai_completedSentences', JSON.stringify(Array.from(newCompleted)));
        localStorage.setItem('reading_ai_diffResult', JSON.stringify(sentenceComparisons));
        localStorage.removeItem('reading_ai_feedback');
    };

    const handleAIEvaluation = async () => {
        if (!resultData) {
            toast.warning("Vui lòng tạo bài mẫu từ AI trước khi kiểm tra!");
            return;
        }

        const combinedUserText = userSentences.filter(s => s.trim()).join(' ');
        if (!combinedUserText) {
            toast.warning("Bạn chưa viết gì cả!");
            return;
        }

        setIsEvaluating(true);
        setDiffResult(null);
        setAiFeedback(null);

        try {
            const originalText = resultData.sentences.map(s => s.en).join(' ');
            const prompt = `Bạn là một giáo viên tiếng Anh chấm bài.
Bài viết gốc (đáp án chuẩn):
"${originalText}"
 
Bài viết của học viên:
"${combinedUserText}"

Hãy phân tích cực kỳ chi tiết từng lỗi sai của học viên (sai ở đâu, thiếu từ gì, sai cấu trúc ngữ pháp nào, sai chính tả chữ nào) so với bài gốc.
Trả về kết quả dưới dạng JSON với cấu trúc:
{
    "score": "Điểm số trên 10 (ví dụ: 8.5/10)",
    "general_comment": "Nhận xét chung về bài làm",
    "errors": [
        {
            "user_text": "Đoạn văn/câu học viên viết sai",
            "correction": "Cách sửa lại cho đúng",
            "error_type": "Loại lỗi (Thiếu từ / Sai ngữ pháp / Sai chính tả / Sai nghĩa)",
            "explanation": "Giải thích chi tiết: Sai ở chữ nào? Thiếu chữ gì? Tại sao lại sai? Cấu trúc đúng là gì?"
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

            const parsedFeedback = JSON.parse(data.text);
            setAiFeedback(parsedFeedback);
            localStorage.setItem('reading_ai_feedback', JSON.stringify(parsedFeedback));
            localStorage.removeItem('reading_ai_diffResult');
        } catch (error) {
            console.error("Lỗi khi AI chấm bài:", error);
            toast.error("Có lỗi xảy ra khi AI chấm bài!");
        } finally {
            setIsEvaluating(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in mt-2">
            <div className="flex flex-col lg:flex-row gap-6 h-[720px] items-stretch">

                {/* Left Panel: Writing Workspace */}
                <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-gray-150 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
                    <div className="bg-slate-50 dark:bg-slate-800/80 px-6 py-4 border-b border-gray-150 dark:border-slate-800 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-2">
                            <span className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
                                <Edit size={16} />
                            </span>
                            <span className="font-extrabold text-gray-800 dark:text-white text-sm">📝 Khu vực Luyện viết</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-800 px-2.5 py-1 rounded-full border border-gray-200/30 dark:border-slate-700">
                                {userSentences.filter(s => s.trim()).length} / {resultData?.sentences.length || 0} câu
                            </span>
                            <button 
                                onClick={handleCompareText}
                                className="bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 text-xs px-3.5 py-2 rounded-xl font-bold border border-gray-200 dark:border-slate-700 shadow-sm transition-all"
                            >
                                So sánh nhanh
                            </button>
                            <button 
                                onClick={handleAIEvaluation}
                                disabled={isEvaluating}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3.5 py-2 rounded-xl font-bold shadow-sm transition disabled:bg-blue-400 flex items-center gap-1.5"
                            >
                                {isEvaluating ? (
                                    <>Đang chấm...</>
                                ) : (
                                    <>
                                        <Cpu size={14} /> AI Chấm chi tiết
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4 bg-slate-50/30 dark:bg-slate-900/10">
                        {!resultData ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-slate-500 italic text-center px-8">
                                <FileText size={48} className="text-gray-300 dark:text-slate-700 mb-3" />
                                <p className="text-sm">Vui lòng yêu cầu AI tạo bài mẫu ở cột bên phải trước khi bắt đầu luyện dịch và viết.</p>
                            </div>
                        ) : (
                            resultData.sentences.map((item, index) => {
                                const isCurrent = currentSentenceIndex === index;
                                return (
                                    <div 
                                        key={item.id} 
                                        className={`transition-all duration-300 ${isCurrent ? 'opacity-100 scale-100' : 'opacity-60 scale-[0.98]'}`}
                                        onClick={() => {
                                            setCurrentSentenceIndex(index);
                                            localStorage.setItem('reading_ai_currentSentenceIndex', index.toString());
                                        }}
                                    >
                                        <div className="flex justify-between items-center mb-1.5 px-1">
                                            <span className={`text-[10px] uppercase tracking-widest font-black ${isCurrent ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>Câu {index + 1}</span>
                                        </div>
                                        <textarea
                                            id={`sentence-input-${index}`}
                                            className={`w-full p-4 rounded-2xl resize-none outline-none transition-all text-sm border ${
                                                isCurrent 
                                                    ? 'bg-white dark:bg-slate-800 ring-4 ring-blue-500/10 border-blue-500 text-gray-800 dark:text-white shadow-md' 
                                                    : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-400 border-gray-150 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700'
                                            }`}
                                            rows={2}
                                            value={userSentences[index] || ""}
                                            onChange={(e) => {
                                                const newSentences = [...userSentences];
                                                newSentences[index] = e.target.value;
                                                setUserSentences(newSentences);
                                                localStorage.setItem('reading_ai_userSentences', JSON.stringify(newSentences));

                                                const newCompleted = new Set(completedSentences);
                                                newCompleted.delete(index);
                                                setCompletedSentences(newCompleted);
                                                localStorage.setItem('reading_ai_completedSentences', JSON.stringify(Array.from(newCompleted)));

                                                if (diffResult) {
                                                    setDiffResult(null);
                                                    localStorage.removeItem('reading_ai_diffResult');
                                                }
                                                if (aiFeedback) {
                                                    setAiFeedback(null);
                                                    localStorage.removeItem('reading_ai_feedback');
                                                }
                                            }}
                                            onFocus={() => {
                                                setCurrentSentenceIndex(index);
                                                localStorage.setItem('reading_ai_currentSentenceIndex', index.toString());
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();

                                                    const newCompleted = new Set(completedSentences);
                                                    newCompleted.add(index);
                                                    setCompletedSentences(newCompleted);
                                                    localStorage.setItem('reading_ai_completedSentences', JSON.stringify(Array.from(newCompleted)));

                                                    if (index < resultData.sentences.length - 1) {
                                                        setCurrentSentenceIndex(index + 1);
                                                        localStorage.setItem('reading_ai_currentSentenceIndex', (index + 1).toString());
                                                        const nextEl = document.getElementById(`sentence-input-${index + 1}`);
                                                        if (nextEl) nextEl.focus();
                                                    }
                                                }
                                            }}
                                            placeholder={`Dịch câu ${index + 1} sang tiếng Anh...`}
                                            spellCheck="false"
                                        />
                                    </div>
                                )
                            })
                        )}
                    </div>

                    {/* Compare result (diffs) */}
                    {diffResult && (
                        <div className="h-2/5 border-t border-gray-150 dark:border-slate-850 bg-white dark:bg-slate-900 p-5 overflow-y-auto custom-scrollbar transition-colors">
                            <p className="text-xs text-gray-400 dark:text-slate-500 mb-3 uppercase tracking-widest font-black">Kết quả đối chiếu từng câu:</p>
                            <div className="flex flex-col gap-3">
                                {diffResult.map((item) => (
                                    <div key={item.sentenceNumber} className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs text-blue-600 dark:text-blue-400 font-black">Câu {item.sentenceNumber}</span>
                                        </div>
                                        
                                        <div className="leading-relaxed text-base font-serif text-gray-800 dark:text-slate-200">
                                            {item.diffs.map((part, i) => {
                                                if (part.added) {
                                                    return <span key={i} className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 line-through px-1 rounded mx-0.5">{part.value}</span>;
                                                }
                                                if (part.removed) {
                                                    return <span key={i} className="bg-green-50 dark:bg-green-955/20 text-green-600 dark:text-green-400 underline decoration-green-500 dark:decoration-green-400 px-1 rounded mx-0.5 font-bold">{part.value}</span>;
                                                }
                                                return <span key={i}>{part.value}</span>;
                                            })}
                                        </div>

                                        {!item.user && (
                                            <p className="text-xs text-red-500 mt-2 font-semibold">⚠️ Bạn chưa viết câu này!</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* AI Feedback */}
                    {aiFeedback && (
                        <div className="h-2/5 border-t border-gray-150 dark:border-slate-850 bg-white dark:bg-slate-900 p-5 overflow-y-auto custom-scrollbar transition-colors">
                            <div className="flex justify-between items-center mb-3">
                                <p className="text-xs text-blue-600 dark:text-blue-400 uppercase tracking-widest font-black">🤖 AI Nhận xét chi tiết:</p>
                                <span className="bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 px-3 py-1 rounded-full text-xs font-black border border-green-200 dark:border-green-800/40">
                                    Điểm: {aiFeedback.score}
                                </span>
                            </div>
                            <p className="text-gray-600 dark:text-slate-300 text-sm mb-4 italic bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-gray-250/20 dark:border-slate-800">
                                "{aiFeedback.general_comment}"
                            </p>
                            
                            <div className="flex flex-col gap-3">
                                {aiFeedback.errors && aiFeedback.errors.length > 0 ? (
                                    aiFeedback.errors.map((err, idx) => (
                                        <div key={idx} className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-red-100/30 dark:border-red-950/20 shadow-sm space-y-3">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div>
                                                    <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block mb-0.5">Bạn viết:</span>
                                                    <p className="text-red-600 dark:text-red-400 line-through text-xs font-medium">{err.user_text}</p>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block mb-0.5">Sửa lại:</span>
                                                    <p className="text-emerald-600 dark:text-emerald-400 text-xs font-black">{err.correction}</p>
                                                </div>
                                            </div>
                                            <div className="pt-2.5 border-t border-gray-150 dark:border-slate-700">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Giải thích:</span>
                                                    <span className="text-[9px] font-bold bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full border border-red-150 dark:border-red-900/30">{err.error_type}</span>
                                                </div>
                                                <p className="text-gray-600 dark:text-slate-300 text-xs leading-relaxed">{err.explanation}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-2xl border border-green-200 dark:border-green-800/40 text-center shadow-sm">
                                        <p className="text-green-600 dark:text-green-400 font-bold text-sm">🎉 Tuyệt vời! Bạn không mắc lỗi nào đáng kể.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Panel: AI Tutor Instruction Panel */}
                <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-gray-150 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
                    <div className="bg-slate-50 dark:bg-slate-800/80 px-6 py-4 border-b border-gray-150 dark:border-slate-800 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-2">
                            <span className="p-2 bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 rounded-xl">
                                <BookOpen size={16} />
                            </span>
                            <span className="font-extrabold text-gray-800 dark:text-white text-sm">🤖 AI Trợ Giảng</span>
                        </div>
                        {resultData && (
                            <button 
                                onClick={(e) => speak(resultData.sentences.map(s => s.en).join(' '), e)}
                                className="text-xs bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 px-3 py-1.5 rounded-xl text-gray-700 dark:text-slate-300 font-bold border border-gray-200 dark:border-slate-700 flex items-center gap-1 shadow-sm transition"
                            >
                                <Volume2 size={13} /> Đọc toàn bài
                            </button>
                        )}
                    </div>

                    <div className="p-6 flex flex-col h-full gap-4 overflow-y-auto custom-scrollbar bg-slate-50/30 dark:bg-slate-900/10">
                        
                        {/* Selector Controls Card */}
                        <div className="flex flex-col gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-150 dark:border-slate-700 shadow-sm">
                            <div className="flex gap-4 mb-1 border-b border-gray-100 dark:border-slate-700 pb-2">
                                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700 dark:text-slate-300">
                                    <input 
                                        type="radio" 
                                        name="genMode" 
                                        value="paragraph" 
                                        checked={genMode === "paragraph"} 
                                        onChange={() => setGenMode("paragraph")}
                                        className="text-green-600 focus:ring-green-500 dark:bg-slate-900 dark:border-slate-700"
                                    />
                                    Tạo đoạn văn
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700 dark:text-slate-300">
                                    <input 
                                        type="radio" 
                                        name="genMode" 
                                        value="sentences" 
                                        checked={genMode === "sentences"} 
                                        onChange={() => setGenMode("sentences")}
                                        className="text-green-600 focus:ring-green-500 dark:bg-slate-900 dark:border-slate-700"
                                    />
                                    Tạo câu từ Unit
                                </label>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {genMode === "paragraph" ? (
                                    <>
                                        <div className="relative">
                                            <select 
                                                className="appearance-none w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold text-gray-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-green-500 transition cursor-pointer"
                                                value={level}
                                                onChange={(e) => setLevel(e.target.value)}
                                            >
                                                <option value="A1 (Cơ bản)">A1 (Cơ bản)</option>
                                                <option value="A2 (Sơ cấp)">A2 (Sơ cấp)</option>
                                                <option value="B1 (Trung cấp)">B1 (Trung cấp)</option>
                                                <option value="B2 (Trung cao cấp)">B2 (Trung cao cấp)</option>
                                                <option value="C1 (Cao cấp)">C1 (Cao cấp)</option>
                                                <option value="C2 (Thành thạo)">C2 (Thành thạo)</option>
                                            </select>
                                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        </div>

                                        <div className="relative">
                                            <select 
                                                className="appearance-none w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold text-gray-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-green-500 transition cursor-pointer"
                                                value={topic}
                                                onChange={(e) => setTopic(e.target.value)}
                                            >
                                                <option value="Tự do (Theo yêu cầu dưới)">Chủ đề: Tự do</option>
                                                <option value="Bản thân & Gia đình">Bản thân & Gia đình</option>
                                                <option value="Trường học & Giáo dục">Trường học & Giáo dục</option>
                                                <option value="Công việc & Nghề nghiệp">Công việc & Nghề nghiệp</option>
                                                <option value="Sở thích & Giải trí">Sở thích & Giải trí</option>
                                                <option value="Du lịch & Giao thông">Du lịch & Giao thông</option>
                                                <option value="Sức khỏe & Thể thao">Sức khỏe & Thể thao</option>
                                                <option value="Công nghệ & Internet">Công nghệ & Internet</option>
                                                <option value="Môi trường & Thiên nhiên">Môi trường & Thiên nhiên</option>
                                            </select>
                                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        </div>
                                    </>
                                ) : (
                                    <div className="col-span-2 flex flex-wrap gap-1 max-h-24 overflow-y-auto custom-scrollbar p-1.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl">
                                        {availableUnits.length > 0 ? (
                                            availableUnits.map(u => (
                                                <button
                                                    key={u}
                                                    onClick={() => {
                                                        if (selectedUnits.includes(u.toString())) {
                                                            if (selectedUnits.length > 1) {
                                                                setSelectedUnits(selectedUnits.filter(id => id !== u.toString()));
                                                            }
                                                        } else {
                                                            setSelectedUnits([...selectedUnits, u.toString()]);
                                                        }
                                                    }}
                                                    className={`px-2 py-1 text-[10px] font-black rounded-lg transition-all ${
                                                        selectedUnits.includes(u.toString()) 
                                                            ? 'bg-green-600 text-white shadow-sm' 
                                                            : 'bg-white dark:bg-slate-800 text-gray-500 border border-gray-200 dark:border-slate-700 hover:text-gray-800 dark:hover:text-white'
                                                    }`}
                                                >
                                                    {parseInt(u) >= 13 ? `Chủ đề ${parseInt(u) - 12}` : `Unit ${u}`}
                                                </button>
                                            ))
                                        ) : (
                                            <span className="text-xs text-gray-400 p-1">Không có Unit nào</span>
                                        )}
                                    </div>
                                )}
                                
                                <div className="relative">
                                    <div 
                                        className="p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold text-gray-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-green-500 cursor-pointer flex justify-between items-center h-full shadow-sm"
                                        onClick={() => setIsGrammarOpen(!isGrammarOpen)}
                                    >
                                        <span className="truncate">
                                            {selectedGrammars.length === 0 ? "Ngữ pháp: Tự do" : `Ngữ pháp: ${selectedGrammars.length} mục`}
                                        </span>
                                        <ChevronDown size={14} className="text-gray-400" />
                                    </div>
                                    
                                    {isGrammarOpen && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setIsGrammarOpen(false)}></div>
                                            <div className="absolute z-20 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar p-2 flex flex-col gap-2">
                                                <div 
                                                    className={`p-2 text-xs font-bold rounded-lg cursor-pointer transition ${selectedGrammars.length === 0 ? 'bg-green-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-650 dark:text-slate-300'}`}
                                                    onClick={() => {
                                                        setSelectedGrammars([]);
                                                        setIsGrammarOpen(false);
                                                    }}
                                                >
                                                    Tự do (Kết hợp)
                                                </div>
                                                {grammarGroups.map((group, idx) => (
                                                    <div key={idx} className="border-t border-gray-100 dark:border-slate-700 pt-1.5 mt-1.5 first:border-0 first:pt-0 first:mt-0">
                                                        <div className="text-[9px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 px-1">{group.label}</div>
                                                        {group.options.map(opt => {
                                                            const isSelected = selectedGrammars.includes(opt.value);
                                                            return (
                                                                <div 
                                                                    key={opt.value}
                                                                    className={`p-2 text-xs font-medium rounded-lg cursor-pointer transition flex items-center gap-2 ${isSelected ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-650 dark:text-slate-300'}`}
                                                                    onClick={() => {
                                                                        if (isSelected) {
                                                                            setSelectedGrammars(selectedGrammars.filter(g => g !== opt.value));
                                                                        } else {
                                                                            setSelectedGrammars([...selectedGrammars, opt.value]);
                                                                        }
                                                                    }}
                                                                >
                                                                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${isSelected ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-300 dark:border-slate-600'}`}>
                                                                        {isSelected && <Check size={10} />}
                                                                    </div>
                                                                    {opt.label}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2">
                                {genMode === "sentences" && (
                                    <div className="flex items-center bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 shadow-sm" title="Số lượng câu">
                                        <span className="text-xs text-gray-400 dark:text-slate-500 font-bold whitespace-nowrap">Số câu:</span>
                                        <input
                                            type="number"
                                            min="1"
                                            max="20"
                                            value={sentenceCount}
                                            onChange={(e) => setSentenceCount(e.target.value)}
                                            className="w-10 bg-transparent text-gray-800 dark:text-white text-xs font-bold outline-none text-center ml-1"
                                        />
                                    </div>
                                )}
                                <input
                                    type="text"
                                    className="flex-1 p-2.5 border border-gray-250 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-900 text-gray-800 dark:text-white text-xs shadow-inner"
                                    placeholder="Yêu cầu thêm (VD: Viết về một chuyến đi Đà Lạt...)"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
                                />
                                <button
                                    onClick={handleAskAI}
                                    disabled={isLoading}
                                    className="bg-green-600 text-white font-black px-6 py-2.5 rounded-xl hover:bg-green-700 disabled:bg-gray-250 transition shadow-sm text-xs whitespace-nowrap"
                                >
                                    {isLoading ? "Đang tạo..." : "Tạo bài"}
                                </button>
                            </div>
                        </div>

                        {/* AI Generated Passage display */}
                        <div className="flex-1 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-3xl p-5 overflow-y-auto custom-scrollbar shadow-sm transition-all min-h-[300px]">
                            {resultData ? (
                                <div className="flex flex-col gap-4">
                                    <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                                        <div className="flex items-center gap-2 mb-3 border-b border-gray-200/50 dark:border-slate-700 pb-2">
                                            <span className="text-lg">🇬🇧/🇻🇳</span>
                                            <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Đoạn văn mẫu song ngữ</span>
                                        </div>
                                        <h3 className="text-lg font-black text-gray-850 dark:text-white mb-4 flex flex-col gap-1.5">
                                            <span className="text-slate-800 dark:text-slate-200">🇻🇳 {resultData.vietnamese_title}</span>
                                            <span className="text-xs text-gray-400 dark:text-slate-500 font-serif flex items-center gap-2 italic">
                                                🇬🇧 {resultData.english_title}
                                                <button onClick={(e) => speak(resultData.english_title, e)} className="text-gray-400 hover:text-blue-500 transition">
                                                    <Volume2 size={14} />
                                                </button>
                                            </span>
                                        </h3>
                                        <div className="space-y-4">
                                            {resultData.sentences.map((item, index) => {
                                                const isCurrent = currentSentenceIndex === index;
                                                const isCompleted = completedSentences.has(index);
                                                return (
                                                    <div 
                                                        key={item.id} 
                                                        className={`group p-4 rounded-2xl transition-all duration-300 border ${
                                                            isCurrent 
                                                                ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-500/50 opacity-100 shadow-md' 
                                                                : 'opacity-40 hover:opacity-90 bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-850'
                                                        }`}
                                                        onClick={() => setCurrentSentenceIndex(index)}
                                                    >
                                                        <div className="leading-relaxed text-sm flex items-start gap-2.5 text-gray-700 dark:text-slate-300">
                                                            <span className={`text-xs font-black ${isCurrent ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>{item.id + 1}.</span> 
                                                            <span className="flex-1 font-medium">{item.vn}</span>
                                                            {isCompleted && (
                                                                <button onClick={(e) => speak(item.en, e)} className={`transition p-1.5 rounded-lg ${isCurrent ? 'text-blue-500 bg-blue-100 dark:bg-blue-900/50' : 'text-gray-400 hover:bg-gray-150 dark:hover:bg-slate-800 opacity-0 group-hover:opacity-100'}`}>
                                                                    <Volume2 size={16} />
                                                                </button>
                                                            )}
                                                        </div>
                                                        {isCompleted ? (
                                                            <p className={`text-sm mt-3 ml-6 font-serif border-l-2 border-emerald-500 pl-3 ${isCurrent ? 'text-emerald-700 dark:text-emerald-400 font-bold block' : 'text-emerald-600/70 dark:text-emerald-500/70 hidden group-hover:block'}`}>
                                                                🇬🇧 {item.en}
                                                            </p>
                                                        ) : (
                                                            <p className={`text-xs mt-3 ml-6 italic text-gray-400 pl-3 ${isCurrent ? 'block animate-pulse' : 'hidden group-hover:block'}`}>
                                                                🔒 Nhấn Enter sau khi viết xong để xem đáp án...
                                                            </p>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex h-full items-center justify-center text-center py-12">
                                    <span className="text-gray-400 dark:text-slate-500 text-xs italic px-8 max-w-sm block">
                                        Yêu cầu AI viết văn bản, sau đó chép lại sang ô bên trái để kiểm tra độ chính xác nhé!
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ReadingMode;
