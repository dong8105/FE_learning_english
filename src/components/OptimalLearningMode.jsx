import React, { useState, useEffect } from 'react';
import { 
    Sparkles, BookOpen, Brain, Lightbulb, Link2, 
    ArrowLeft, ArrowRight, Volume2, Edit3, Send, CheckCircle2, 
    XCircle, Calendar, RefreshCw, Layers
} from 'lucide-react';
import { toast } from 'react-toastify';
import { updateSrsWord, getProgress } from '../utils/progressTracker';
import { useAiStatus } from "./AiStatusProvider";

const OptimalLearningMode = ({ words = [], speak }) => {
    const { reportAiUsage } = useAiStatus();

    const [currentIndex, setCurrentIndex] = useState(0);
    const [activeStep, setActiveStep] = useState(1); // 1 to 5
    const [loadingHelper, setLoadingHelper] = useState(false);
    const [helperData, setHelperData] = useState(null);
    const [userSentence, setUserSentence] = useState('');
    const [evaluating, setEvaluating] = useState(false);
    const [evalResult, setEvalResult] = useState(null);
    const [showContextTranslation, setShowContextTranslation] = useState(false);
    const [srsScheduled, setSrsScheduled] = useState(null);

    const currentWord = words[currentIndex];

    // Load helpers when word changes
    useEffect(() => {
        if (!currentWord) return;
        
        setActiveStep(1);
        setUserSentence('');
        setEvalResult(null);
        setShowContextTranslation(false);
        setSrsScheduled(null);

        // If the word has cached helper columns in the DB, parse them
        if (currentWord.collocations && currentWord.mnemonics && currentWord.context_passage && currentWord.io_prompt) {
            try {
                // Collocations might be stringified JSON
                let colls = [];
                try {
                    colls = JSON.parse(currentWord.collocations);
                } catch(e) {
                    // fallback if it's plain text
                    colls = [{ phrase: currentWord.collocations, vi: 'Cụm từ liên quan' }];
                }

                setHelperData({
                    context_passage: currentWord.context_passage,
                    context_translation: currentWord.definition_vi || 'Xem nghĩa đoạn văn', // fallback
                    mnemonics: currentWord.mnemonics,
                    collocations: colls,
                    io_prompt: currentWord.io_prompt
                });
            } catch (err) {
                setHelperData(null);
            }
        } else {
            setHelperData(null);
        }
    }, [currentIndex, currentWord]);

    if (words.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-gray-150 dark:border-slate-800 shadow-sm min-h-[300px]">
                <Layers className="text-gray-300 dark:text-slate-700 w-16 h-16 mb-4 animate-bounce" />
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Chưa chọn nhóm từ vựng</h3>
                <p className="text-gray-500 dark:text-slate-400 max-w-md text-sm">
                    Hãy sử dụng bộ lọc "Lọc từ vựng" ở góc trên màn hình để chọn một Khóa học, Chủ đề Hàng ngày hoặc Nhóm tổng (ví dụ: 600 Từ Vựng TOEIC) để bắt đầu.
                </p>
            </div>
        );
    }

    const handleGenerateHelper = async () => {
        setLoadingHelper(true);
        try {
            const prompt = `Hãy tạo nội dung học tối ưu cho từ vựng tiếng Anh sau:
Từ: "${currentWord.en}" (${currentWord.category})
Nghĩa tiếng Việt: "${currentWord.vi}"

Hãy trả về một đối tượng JSON BẮT BUỘC có cấu trúc:
{
  "context_passage": "Một đoạn văn ngắn (2-3 câu) viết bằng tiếng Anh tự nhiên (kiểu báo chí BBC hoặc đời sống), chứa từ '${currentWord.en}' (hãy bọc từ này bằng tag <b>${currentWord.en}</b> trong đoạn văn).",
  "context_translation": "Bản dịch tiếng Việt tự nhiên của đoạn văn trên.",
  "mnemonics": "Một mẹo liên tưởng độc đáo bằng tiếng Việt để nhớ từ này (ví dụ: dùng phương pháp âm thanh tương tự - từ phát âm giống từ tiếng Việt nào và tạo câu chuyện vui nhộn liên kết âm thanh đó với nghĩa từ).",
  "collocations": [
    { "phrase": "Cụm từ 1 đi kèm từ này", "vi": "Nghĩa tiếng Việt của cụm từ 1" },
    { "phrase": "Cụm từ 2 đi kèm từ này", "vi": "Nghĩa tiếng Việt của cụm từ 2" }
  ],
  "io_prompt": "Một đề bài ngắn bằng tiếng Việt yêu cầu học viên tự đặt một câu tiếng Anh sử dụng từ '${currentWord.en}' trong một tình huống cụ thể."
}`;

            const token = localStorage.getItem('engmaster_token') || localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ai/generate`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    prompt,
                    systemInstruction: "You are an English language coach. You must output valid JSON only.",
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
            
            const parsed = JSON.parse(data.text);

            setHelperData(parsed);

            // Save to database cache
            await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/words/${currentWord.id}/helpers`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    collocations: JSON.stringify(parsed.collocations),
                    mnemonics: parsed.mnemonics,
                    context_passage: parsed.context_passage,
                    io_prompt: parsed.io_prompt
                })
            });

            // Update local memory object so it persists in the session
            currentWord.collocations = JSON.stringify(parsed.collocations);
            currentWord.mnemonics = parsed.mnemonics;
            currentWord.context_passage = parsed.context_passage;
            currentWord.io_prompt = parsed.io_prompt;
            currentWord.definition_vi = parsed.context_translation;

            toast.success("Đã khởi tạo giáo trình học tối ưu bằng AI!");
        } catch (err) {
            console.error(err);
            toast.error("Lỗi khi gọi AI sinh tài liệu học vựng!");
        } finally {
            setLoadingHelper(false);
        }
    };

    const handleSrsRate = (quality) => {
        updateSrsWord(currentWord.id, quality);
        
        let intervalStr = '1 ngày';
        if (quality === 4) intervalStr = '3 ngày';
        if (quality === 5) intervalStr = '6+ ngày';
        if (quality < 3) intervalStr = 'hôm nay';

        setSrsScheduled(`Đã lên lịch ôn tập lại từ này sau: ${intervalStr}`);
        toast.info(`Đã lưu lịch học ngắt quãng!`);
    };

    const handleEvaluateSentence = async () => {
        if (!userSentence.trim()) {
            toast.warning("Vui lòng nhập câu của bạn!");
            return;
        }

        setEvaluating(true);
        setEvalResult(null);

        try {
            const prompt = `Bạn là một giáo viên tiếng Anh bản xứ chấm bài. Hãy chấm điểm và sửa câu sau của học viên:
Từ vựng mục tiêu: "${currentWord.en}"
Đề bài thử thách: "${helperData.io_prompt}"
Câu viết của học viên: "${userSentence}"

Hãy trả về một đối tượng JSON BẮT BUỘC có cấu trúc:
{
  "score": "Điểm số từ 0 đến 10",
  "is_correct": true hoặc false (chỉ true nếu câu hoàn toàn đúng ngữ pháp và dùng từ chính xác),
  "correction": "Câu đã được sửa lại cho đúng ngữ pháp và tự nhiên (hoặc để trống nếu câu của học viên đã hoàn hảo)",
  "feedback": "Nhận xét ngắn gọn bằng tiếng Việt về lỗi sai nếu có, cấu trúc ngữ pháp học viên đã dùng và cách cải thiện câu viết."
}`;

            const token = localStorage.getItem('engmaster_token') || localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ai/generate`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ prompt, jsonMode: true })
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
            
            const parsed = JSON.parse(data.text);
            setEvalResult(parsed);
        } catch (err) {
            console.error(err);
            toast.error("Lỗi khi AI chấm điểm câu viết!");
        } finally {
            setEvaluating(false);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const handleNext = () => {
        if (currentIndex < words.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    // Clean text helper for highlighting
    const renderContextPassage = (passage, word) => {
        if (!passage) return '';
        // Locate <b>...</b> tag in AI output and highlight it
        const parts = passage.split(/(<b>.*?<\/b>|&lt;b&gt;.*?&lt;\/b&gt;)/gi);
        return parts.map((part, i) => {
            if (part.toLowerCase().startsWith('<b>') || part.toLowerCase().startsWith('&lt;b&gt;')) {
                const cleanWord = part.replace(/<\/?b>/gi, '').replace(/&lt;\/?b&gt;/gi, '');
                return <span key={i} className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-bold rounded">{cleanWord}</span>;
            }
            return part;
        });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Word Header Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-150 dark:border-slate-800 transition-colors relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-green-500 to-emerald-600" />
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div>
                            <span className="text-[10px] uppercase font-bold tracking-widest text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-2.5 py-1 rounded-full border border-green-100 dark:border-green-900/30">
                                {currentWord.category || 'Từ vựng'}
                            </span>
                            <h1 className="text-4xl md:text-5xl font-black text-gray-800 dark:text-white mt-2 flex items-center gap-3">
                                {currentWord.en}
                                <button 
                                    onClick={() => speak(currentWord.en)}
                                    className="p-2 bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 rounded-full transition-all border border-gray-150 dark:border-slate-700"
                                    title="Nghe phát âm"
                                >
                                    <Volume2 size={18} />
                                </button>
                            </h1>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-400 dark:text-slate-500">
                                <span className="font-mono text-base">{currentWord.ipa || '/.../'}</span>
                                <span>•</span>
                                <span className="font-semibold text-gray-600 dark:text-slate-400">{currentWord.vi}</span>
                                {currentWord.sub_group && (
                                    <>
                                        <span>•</span>
                                        <span className="italic">{currentWord.sub_group}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                        <button 
                            onClick={handlePrev}
                            disabled={currentIndex === 0}
                            className="p-3 bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 rounded-xl hover:bg-gray-150 dark:hover:bg-slate-700 transition disabled:opacity-40"
                        >
                            <ArrowLeft size={16} />
                        </button>
                        <span className="text-xs font-black text-gray-400 dark:text-slate-500 px-2">
                            {currentIndex + 1} / {words.length}
                        </span>
                        <button 
                            onClick={handleNext}
                            disabled={currentIndex === words.length - 1}
                            className="p-3 bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 rounded-xl hover:bg-gray-150 dark:hover:bg-slate-700 transition disabled:opacity-40"
                        >
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Stepper Steps Tabs */}
            <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-gray-150 dark:border-slate-800 shadow-sm overflow-x-auto custom-scrollbar transition-colors">
                {[
                    { step: 1, label: '1. Ngữ cảnh', icon: BookOpen },
                    { step: 2, label: '2. Lặp lại', icon: Calendar },
                    { step: 3, label: '3. Liên tưởng', icon: Lightbulb },
                    { step: 4, label: '4. Cụm từ', icon: Link2 },
                    { step: 5, label: '5. Thực hành', icon: Edit3 }
                ].map(item => {
                    const Icon = item.icon;
                    const isActive = activeStep === item.step;
                    return (
                        <button
                            key={item.step}
                            onClick={() => {
                                if (helperData || item.step === 2) {
                                    setActiveStep(item.step);
                                } else {
                                    toast.warning("Vui lòng kích hoạt AI tạo nội dung trước!");
                                }
                            }}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex-1 justify-center ${
                                isActive 
                                    ? 'bg-green-600 text-white shadow-md' 
                                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white'
                            }`}
                        >
                            <Icon size={14} />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Main content body */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-150 dark:border-slate-800 min-h-[350px] flex flex-col justify-between transition-colors">
                
                {/* Loader */}
                {loadingHelper && (
                    <div className="flex-1 flex flex-col items-center justify-center py-12">
                        <RefreshCw className="animate-spin text-green-500 w-10 h-10 mb-4" />
                        <p className="text-gray-500 dark:text-slate-400 font-medium">Gemini AI đang biên soạn nội dung học tối ưu...</p>
                    </div>
                )}

                {/* NO AI HELPER DATA STATE */}
                {!loadingHelper && !helperData && activeStep !== 2 && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                        <Sparkles className="text-amber-500 w-12 h-12 mb-4 animate-pulse" />
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Chưa kích hoạt Học Tối Ưu cho từ này</h3>
                        <p className="text-gray-500 dark:text-slate-400 max-w-md text-sm mb-6">
                            Từ vựng này chưa được đồng bộ giáo án học tối ưu (Ngữ cảnh thật, Mnemonics liên tưởng, Collocations và Thử thách viết).
                        </p>
                        <button
                            onClick={handleGenerateHelper}
                            className="bg-green-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-green-700 transition flex items-center gap-2 shadow-md"
                        >
                            <Sparkles size={16} /> Kích hoạt Học Tối Ưu (AI)
                        </button>
                    </div>
                )}

                {/* STEP 1: CONTEXTUAL LEARNING */}
                {!loadingHelper && helperData && activeStep === 1 && (
                    <div className="space-y-6 flex-1 flex flex-col justify-between">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-bold text-sm">
                                <BookOpen size={16} />
                                <span>PHƯƠNG PHÁP 1: HỌC QUA NGỮ CẢNH THẬT (CONTEXTUAL LEARNING)</span>
                            </div>
                            
                            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800 font-serif leading-relaxed text-lg text-gray-800 dark:text-slate-200 relative group">
                                <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => speak(helperData.context_passage)}
                                        className="p-2 bg-white dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:text-green-600 rounded-lg shadow-sm border border-gray-150 dark:border-slate-600"
                                        title="Nghe đọc đoạn văn"
                                    >
                                        <Volume2 size={16} />
                                    </button>
                                </div>
                                <p>{renderContextPassage(helperData.context_passage, currentWord.en)}</p>
                            </div>

                            {showContextTranslation ? (
                                <div className="p-5 bg-green-50/50 dark:bg-green-950/10 border border-green-150 dark:border-green-900/30 rounded-2xl text-green-900 dark:text-green-300 text-sm leading-relaxed animate-fade-in">
                                    <p className="font-bold mb-1">Dịch nghĩa ngữ cảnh:</p>
                                    <p>{helperData.context_translation}</p>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowContextTranslation(true)}
                                    className="text-xs font-bold text-green-600 dark:text-green-400 hover:underline flex items-center gap-1"
                                >
                                    Xem dịch nghĩa tiếng Việt
                                </button>
                            )}
                        </div>

                        <div className="pt-6 border-t border-gray-100 dark:border-slate-800/80 flex justify-end">
                            <button
                                onClick={() => setActiveStep(2)}
                                className="bg-green-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-green-700 transition flex items-center gap-2 shadow-sm text-sm"
                            >
                                Tiếp tục bước 2 <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 2: SPACED REPETITION (SRS) */}
                {!loadingHelper && activeStep === 2 && (
                    <div className="space-y-6 flex-1 flex flex-col justify-between">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                                <Calendar size={16} />
                                <span>PHƯƠNG PHÁP 2: LẶP LẠI NGẮT QUÃNG (SPACED REPETITION)</span>
                            </div>

                            <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed">
                                Thuật toán SM-2 sẽ theo dõi mức độ nhớ từ của bạn để tự động lên lịch kiểm tra lại vào thời điểm vàng, đưa từ vựng từ trí nhớ ngắn hạn sang trí nhớ dài hạn.
                            </p>

                            <div className="bg-indigo-50/50 dark:bg-indigo-950/10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-950/30 text-center">
                                <p className="text-gray-600 dark:text-slate-300 font-medium mb-4">Bạn nhớ từ <span className="font-black text-indigo-600 dark:text-indigo-400">"{currentWord.en}"</span> ở mức độ nào?</p>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-xl mx-auto">
                                    <button onClick={() => handleSrsRate(1)} className="p-4 bg-white dark:bg-slate-800 text-red-600 rounded-xl font-bold border-2 border-red-100 dark:border-red-950/30 hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition flex flex-col items-center gap-1 shadow-sm">
                                        <span className="text-sm">Quên</span>
                                        <span className="text-[10px] font-normal opacity-70">Xem lại ngay</span>
                                    </button>
                                    <button onClick={() => handleSrsRate(3)} className="p-4 bg-white dark:bg-slate-800 text-orange-500 rounded-xl font-bold border-2 border-orange-100 dark:border-orange-950/30 hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition flex flex-col items-center gap-1 shadow-sm">
                                        <span className="text-sm">Khó</span>
                                        <span className="text-[10px] font-normal opacity-70">1 ngày sau</span>
                                    </button>
                                    <button onClick={() => handleSrsRate(4)} className="p-4 bg-white dark:bg-slate-800 text-blue-600 rounded-xl font-bold border-2 border-blue-100 dark:border-blue-950/30 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition flex flex-col items-center gap-1 shadow-sm">
                                        <span className="text-sm">Vừa</span>
                                        <span className="text-[10px] font-normal opacity-70">3 ngày sau</span>
                                    </button>
                                    <button onClick={() => handleSrsRate(5)} className="p-4 bg-white dark:bg-slate-800 text-emerald-600 rounded-xl font-bold border-2 border-emerald-100 dark:border-emerald-950/30 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition flex flex-col items-center gap-1 shadow-sm">
                                        <span className="text-sm">Dễ</span>
                                        <span className="text-[10px] font-normal opacity-70">6+ ngày sau</span>
                                    </button>
                                </div>

                                {srsScheduled && (
                                    <p className="mt-4 text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-pulse bg-emerald-50 dark:bg-emerald-950/20 py-2 px-4 rounded-lg inline-block">{srsScheduled}</p>
                                )}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100 dark:border-slate-800/80 flex justify-between items-center">
                            <button
                                onClick={() => setActiveStep(1)}
                                className="text-xs font-bold text-gray-500 hover:underline"
                            >
                                Quay lại bước 1
                            </button>
                            <button
                                onClick={() => {
                                    if (helperData) {
                                        setActiveStep(3);
                                    } else {
                                        toast.warning("Vui lòng quay lại bước 1 và Kích hoạt AI trước!");
                                    }
                                }}
                                className="bg-green-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-green-700 transition flex items-center gap-2 shadow-sm text-sm"
                            >
                                Tiếp tục bước 3 <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: MNEMONICS */}
                {!loadingHelper && helperData && activeStep === 3 && (
                    <div className="space-y-6 flex-1 flex flex-col justify-between">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-amber-500 font-bold text-sm">
                                <Lightbulb size={16} />
                                <span>PHƯƠNG PHÁP 3: PHƯƠNG PHÁP LIÊN TƯỞNG MNEMONICS</span>
                            </div>

                            <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed">
                                Đánh lừa bộ não bằng cách liên tưởng phát âm tiếng Anh tương tự với các câu từ/hình ảnh vui nhộn hoặc kỳ quặc trong tiếng Việt.
                            </p>

                            <div className="p-6 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/50 dark:border-amber-900/30 rounded-2xl flex gap-4 items-start shadow-sm">
                                <div className="p-3 bg-amber-100 dark:bg-amber-900/50 text-amber-600 rounded-xl shrink-0">
                                    <Lightbulb size={24} />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-extrabold text-gray-800 dark:text-white">Mẹo ghi nhớ liên tưởng:</h4>
                                    <p className="text-gray-700 dark:text-slate-200 leading-relaxed font-medium">{helperData.mnemonics}</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100 dark:border-slate-800/80 flex justify-between items-center">
                            <button
                                onClick={() => setActiveStep(2)}
                                className="text-xs font-bold text-gray-500 hover:underline"
                            >
                                Quay lại bước 2
                            </button>
                            <button
                                onClick={() => setActiveStep(4)}
                                className="bg-green-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-green-700 transition flex items-center gap-2 shadow-sm text-sm"
                            >
                                Tiếp tục bước 4 <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 4: COLLOCATIONS & CHUNKING */}
                {!loadingHelper && helperData && activeStep === 4 && (
                    <div className="space-y-6 flex-1 flex flex-col justify-between">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                                <Link2 size={16} />
                                <span>PHƯƠNG PHÁP 4: HỌC QUA CỤM TỪ (COLLOCATION) & THÀNH NGỮ</span>
                            </div>

                            <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed">
                                Tránh ghép từ rời rạc một cách ngô nghê. Học cả cụm từ cố định giúp bạn diễn đạt tự nhiên như người bản xứ.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {helperData.collocations && helperData.collocations.map((item, i) => (
                                    <div key={i} className="p-5 bg-emerald-50/30 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl flex justify-between items-start group shadow-sm transition-all hover:scale-[1.01]">
                                        <div className="space-y-1">
                                            <p className="font-extrabold text-lg text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                                                {item.phrase}
                                                <button 
                                                    onClick={() => speak(item.phrase)}
                                                    className="p-1 text-gray-400 hover:text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Nghe"
                                                >
                                                    <Volume2 size={14} />
                                                </button>
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-slate-300 font-medium">{item.vi}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100 dark:border-slate-800/80 flex justify-between items-center">
                            <button
                                onClick={() => setActiveStep(3)}
                                className="text-xs font-bold text-gray-500 hover:underline"
                            >
                                Quay lại bước 3
                            </button>
                            <button
                                onClick={() => setActiveStep(5)}
                                className="bg-green-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-green-700 transition flex items-center gap-2 shadow-sm text-sm"
                            >
                                Tiếp tục bước 5 <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 5: INPUT & OUTPUT */}
                {!loadingHelper && helperData && activeStep === 5 && (
                    <div className="space-y-6 flex-1 flex flex-col justify-between">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                                <Edit3 size={16} />
                                <span>PHƯƠNG PHÁP 5: KỸ THUẬT "INPUT & OUTPUT" (SỬ DỤNG LẬP TỨC)</span>
                            </div>

                            <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed">
                                Để ghi nhớ từ vựng vĩnh viễn, bạn cần chuyển hóa từ dạng "nhận biết" (passive) sang dạng "áp dụng thực tế" (active) bằng cách tự viết câu của riêng mình.
                            </p>

                            <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-gray-150 dark:border-slate-800 space-y-2">
                                <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Thử thách từ AI:</p>
                                <p className="font-bold text-gray-800 dark:text-slate-200">{renderContextPassage(helperData.io_prompt)}</p>
                            </div>

                            <div className="space-y-3">
                                <textarea
                                    className="w-full p-4 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-white text-sm shadow-inner resize-none transition-all"
                                    rows={3}
                                    placeholder={`Viết câu tiếng Anh của bạn tại đây, bắt buộc chứa từ "${currentWord.en}"...`}
                                    value={userSentence}
                                    onChange={(e) => setUserSentence(e.target.value)}
                                    disabled={evaluating}
                                />
                                <div className="flex justify-end">
                                    <button
                                        onClick={handleEvaluateSentence}
                                        disabled={evaluating || !userSentence.trim()}
                                        className="bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-indigo-700 disabled:bg-indigo-400 transition flex items-center gap-2 shadow-sm text-sm"
                                    >
                                        {evaluating ? (
                                            <>
                                                <RefreshCw className="animate-spin" size={14} /> Chấm bài...
                                            </>
                                        ) : (
                                            <>
                                                <Send size={14} /> AI chấm điểm & sửa câu
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* EVALUATION RESULT */}
                            {evalResult && (
                                <div className="p-6 bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-700 rounded-2xl shadow-sm space-y-4 animate-fade-in transition-all">
                                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700 pb-3">
                                        <div className="flex items-center gap-2">
                                            {evalResult.is_correct ? (
                                                <span className="text-emerald-500 flex items-center gap-1 text-sm font-bold"><CheckCircle2 size={16} /> Hoàn hảo!</span>
                                            ) : (
                                                <span className="text-red-500 flex items-center gap-1 text-sm font-bold"><XCircle size={16} /> Cần sửa đổi</span>
                                            )}
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-black border ${
                                            parseFloat(evalResult.score) >= 8 
                                                ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border-emerald-200' 
                                                : parseFloat(evalResult.score) >= 5 
                                                ? 'bg-yellow-50 dark:bg-yellow-950/20 text-yellow-600 border-yellow-200'
                                                : 'bg-red-50 dark:bg-red-950/20 text-red-600 border-red-200'
                                        }`}>
                                            Điểm số: {evalResult.score} / 10
                                        </span>
                                    </div>

                                    {evalResult.correction && (
                                        <div className="space-y-1">
                                            <span className="text-xs text-gray-400 font-bold block">Gợi ý sửa đổi:</span>
                                            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/10 p-3 rounded-xl border border-emerald-100/50 dark:border-emerald-900/30">{evalResult.correction}</p>
                                        </div>
                                    )}

                                    <div className="space-y-1 text-sm leading-relaxed text-gray-700 dark:text-slate-300">
                                        <span className="text-xs text-gray-400 font-bold block">Nhận xét chi tiết:</span>
                                        <p>{evalResult.feedback}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="pt-6 border-t border-gray-100 dark:border-slate-800/80 flex justify-between items-center">
                            <button
                                onClick={() => setActiveStep(4)}
                                className="text-xs font-bold text-gray-500 hover:underline"
                            >
                                Quay lại bước 4
                            </button>
                            <span className="text-xs font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
                                <CheckCircle2 size={14} /> Hoàn thành từ vựng này
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OptimalLearningMode;
