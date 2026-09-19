import React, { useState, useEffect, useRef } from 'react';
import { toast } from "react-toastify";
import * as diff from "diff";
import { 
    Volume2, Mic, Square, RefreshCw, ChevronLeft, ChevronRight, 
    AudioLines, Play, Square as SquareIcon, CheckCircle, Trophy, 
    Sparkles, AlertCircle, Settings
} from "lucide-react";
import { useAiStatus } from "./AiStatusProvider";

const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64data = reader.result.split(',')[1];
            resolve(base64data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

const SpeakingMode = ({ words = [] }) => {
    const { reportAiUsage } = useAiStatus();

    const [level, setLevel] = useState("A2 (Sơ cấp)");
    const [topic, setTopic] = useState("Bản thân & Gia đình");
    const [noiseSuppression, setNoiseSuppression] = useState(true);
    const [sentenceCount, setSentenceCount] = useState(3);
    const [speechRate, setSpeechRate] = useState(0.9);
    const [selectedVoice, setSelectedVoice] = useState("Kore");
    const geminiVoices = [
        { id: "Aoede", name: "Aoede (Nữ, Trầm ấm)" },
        { id: "Charon", name: "Charon (Nam, Trầm)" },
        { id: "Fenrir", name: "Fenrir (Nam, Mạnh mẽ)" },
        { id: "Kore", name: "Kore (Nữ, Trong trẻo)" },
        { id: "Puck", name: "Puck (Nam, Trẻ trung)" },
        { id: "Zephyr", name: "Zephyr (Nữ, Năng động)" }
    ];
    
    const [title, setTitle] = useState("");
    const [sentences, setSentences] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [transcripts, setTranscripts] = useState([]);
    const [evaluations, setEvaluations] = useState([]);
    
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    // Load cached speaking state on mount
    useEffect(() => {
        const storedTitle = localStorage.getItem('speaking_ai_title');
        if (storedTitle) {
            setTitle(storedTitle);
            
            const storedSentences = localStorage.getItem('speaking_ai_sentences');
            if (storedSentences) setSentences(JSON.parse(storedSentences));
            
            const storedIndex = localStorage.getItem('speaking_ai_currentIndex');
            if (storedIndex) setCurrentIndex(parseInt(storedIndex, 10));
            
            const storedTranscripts = localStorage.getItem('speaking_ai_transcripts');
            if (storedTranscripts) setTranscripts(JSON.parse(storedTranscripts));
            
            const storedEvaluations = localStorage.getItem('speaking_ai_evaluations');
            if (storedEvaluations) setEvaluations(JSON.parse(storedEvaluations));
            
            const storedFinished = localStorage.getItem('speaking_ai_isFinished');
            if (storedFinished) setIsFinished(JSON.parse(storedFinished));
        }
    }, []);

    const recognitionRef = useRef(null);
    const currentIndexRef = useRef(0);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const audioRef = useRef(null);

    useEffect(() => {
        currentIndexRef.current = currentIndex;
    }, [currentIndex]);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = (event) => {
                let currentTranscript = '';
                for (let i = 0; i < event.results.length; i++) {
                    currentTranscript += event.results[i][0].transcript;
                }
                setTranscripts(prev => {
                    const newT = [...prev];
                    newT[currentIndexRef.current] = currentTranscript;
                    return newT;
                });
            };

            recognition.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                if (event.error !== 'no-speech') {
                    toast.error(`Lỗi nhận diện giọng nói: ${event.error}`);
                    setIsRecording(false);
                    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                        mediaRecorderRef.current.stop();
                    }
                }
            };

            recognition.onend = () => {
                setIsRecording(false);
                if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                    mediaRecorderRef.current.stop();
                }
            };

            recognitionRef.current = recognition;
        } else {
            toast.error("Trình duyệt của bạn không hỗ trợ nhận diện giọng nói (Speech Recognition). Vui lòng sử dụng Chrome.");
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            if (audioRef.current) {
                audioRef.current.source.stop();
                audioRef.current.audioCtx.close();
            }
        };
    }, []);

    const speak = async (text) => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        setIsSpeaking(true);
        window.speechSynthesis.cancel();
        
        let cleanText = text || '';
        if (typeof cleanText === 'string') {
            cleanText = cleanText.replace(/\(.*?\)/g, '').trim();
        }
        
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'en-US';
        utterance.rate = speechRate;
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
    };

    const handleGenerateText = async () => {
        setIsLoading(true);
        setTitle("");
        setSentences([]);
        setCurrentIndex(0);
        setTranscripts([]);
        setEvaluations([]);
        setIsFinished(false);

        if (isRecording && recognitionRef.current) {
            recognitionRef.current.stop();
            setIsRecording(false);
        }

        try {
            const prompt = `Trích xuất ngẫu nhiên chính xác ${sentenceCount} câu giao tiếp tiếng Anh thông dụng (từ bộ 2500 câu giao tiếp thực tế) theo yêu cầu sau:
                - Trình độ CEFR: ${level}
                - Chủ đề: ${topic}
                
                Lưu ý: Các câu này phải là những câu giao tiếp tự nhiên, thường dùng trong hội thoại hàng ngày. Chúng là các câu độc lập, không cần phải nối tiếp nhau thành một đoạn văn.
                
                Trả về kết quả dưới dạng JSON với cấu trúc:
                {
                    "title": "Chủ đề: [Tên chủ đề bằng tiếng Anh]",
                    "sentences": [
                        {
                            "en": "Câu giao tiếp tiếng Anh 1",
                            "vn": "Bản dịch tiếng Việt 1"
                        },
                        {
                            "en": "Câu giao tiếp tiếng Anh 2",
                            "vn": "Bản dịch tiếng Việt 2"
                        }
                    ]
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
            setTitle(parsedData.title);
            setSentences(parsedData.sentences);
            setTranscripts(new Array(parsedData.sentences.length).fill(""));
            setEvaluations(new Array(parsedData.sentences.length).fill(null));
            setCurrentIndex(0);

            // Save generated state to localStorage
            localStorage.setItem('speaking_ai_title', parsedData.title);
            localStorage.setItem('speaking_ai_sentences', JSON.stringify(parsedData.sentences));
            localStorage.setItem('speaking_ai_transcripts', JSON.stringify(new Array(parsedData.sentences.length).fill("")));
            localStorage.setItem('speaking_ai_evaluations', JSON.stringify(new Array(parsedData.sentences.length).fill(null)));
            localStorage.setItem('speaking_ai_currentIndex', '0');
            localStorage.setItem('speaking_ai_isFinished', 'false');

            toast.success("Đã tạo câu giao tiếp mới!");
        } catch (error) {
            console.error("Lỗi từ Gemini API:", error);
            toast.error("Lỗi kết nối hoặc AI trả về sai định dạng!");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleRecording = async () => {
        if (!recognitionRef.current && !navigator.mediaDevices) {
            toast.error("Trình duyệt không hỗ trợ nhận diện giọng nói.");
            return;
        }

        if (isRecording) {
            if (recognitionRef.current) recognitionRef.current.stop();
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
            }
            setIsRecording(false);
        } else {
            setTranscripts(prev => {
                const newT = [...prev];
                newT[currentIndex] = "";
                return newT;
            });
            setEvaluations(prev => {
                const newE = [...prev];
                newE[currentIndex] = null;
                return newE;
            });
            
            try {
                if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                    const stream = await navigator.mediaDevices.getUserMedia({
                        audio: {
                            noiseSuppression: noiseSuppression,
                            echoCancellation: true,
                            autoGainControl: true
                        }
                    });
                    window.audioStream = stream;

                    const mediaRecorder = new MediaRecorder(stream);
                    mediaRecorderRef.current = mediaRecorder;
                    audioChunksRef.current = [];

                    mediaRecorder.ondataavailable = (event) => {
                        if (event.data.size > 0) {
                            audioChunksRef.current.push(event.data);
                        }
                    };

                    mediaRecorder.onstop = async () => {
                        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType });
                        if (window.audioStream) {
                            window.audioStream.getTracks().forEach(track => track.stop());
                            window.audioStream = null;
                        }
                        await processAudioWithGemini(audioBlob, sentences[currentIndexRef.current]?.en);
                    };

                    mediaRecorder.start();
                }

                if (recognitionRef.current) {
                    recognitionRef.current.start();
                }
                setIsRecording(true);
            } catch (e) {
                console.error(e);
                toast.error("Không thể truy cập micro. Vui lòng kiểm tra quyền.");
            }
        }
    };

    const processAudioWithGemini = async (audioBlob, targetText) => {
        setIsEvaluating(true);
        try {
            const base64Audio = await blobToBase64(audioBlob);
            let mimeType = audioBlob.type || 'audio/webm';
            if (mimeType.includes(';')) {
                mimeType = mimeType.split(';')[0];
            }
            
            const prompt = `Bạn là một giáo viên dạy phát âm tiếng Anh.
Học viên vừa đọc câu tiếng Anh sau: "${targetText}"

Hãy nghe đoạn âm thanh đính kèm và thực hiện các yêu cầu sau:
1. Chép lại chính xác những gì học viên đã nói trong đoạn âm thanh (transcript). Chú ý nghe kỹ từng từ.
2. Phân tích lỗi phát âm của học viên dựa trên sự khác biệt giữa câu gốc và những gì họ thực sự nói.

Trả về kết quả dưới dạng JSON với cấu trúc:
{
    "transcript": "Nội dung chính xác học viên đã nói",
    "score": "Điểm số trên 100 (ví dụ: 85)",
    "feedback": "Nhận xét ngắn gọn về khả năng phát âm câu này",
    "mispronounced_words": [
        {
            "word": "Từ phát âm sai hoặc bị thiếu",
            "suggestion": "Cách phát âm đúng hoặc mẹo để đọc đúng từ này"
        }
    ]
}`;

            const token = localStorage.getItem('engmaster_token') || localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ai/audio`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ 
                    base64Audio,
                    mimeType,
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
            const parsedResult = JSON.parse(data.text);
            
            setTranscripts(prev => {
                const newT = [...prev];
                newT[currentIndexRef.current] = parsedResult.transcript;
                return newT;
            });

            const cleanTarget = targetText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").toLowerCase();
            const cleanTranscript = parsedResult.transcript.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").toLowerCase();
            const diffs = diff.diffWords(cleanTarget, cleanTranscript);

            // Parse score to number
            const numScore = parseInt(parsedResult.score.toString().replace('/100', ''), 10) || 70;

            setEvaluations(prev => {
                const newE = [...prev];
                newE[currentIndexRef.current] = { 
                    diffs, 
                    aiFeedback: {
                        score: numScore,
                        feedback: parsedResult.feedback,
                        mispronounced_words: parsedResult.mispronounced_words
                    } 
                };
                return newE;
            });

        } catch (error) {
            console.error("Lỗi khi xử lý âm thanh với Gemini:", error);
            toast.error("Có lỗi xảy ra khi phân tích âm thanh! Vui lòng thử lại.");
        } finally {
            setIsEvaluating(false);
        }
    };

    const handleCompare = async () => {
        const targetText = sentences[currentIndex]?.en;
        const transcript = transcripts[currentIndex];
        
        if (!targetText || !transcript) {
            toast.warning("Cần có bản thu âm để so sánh!");
            return;
        }

        const cleanTarget = targetText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").toLowerCase();
        const cleanTranscript = transcript.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").toLowerCase();

        const diffs = diff.diffWords(cleanTarget, cleanTranscript);
        
        setEvaluations(prev => {
            const newE = [...prev];
            newE[currentIndex] = { diffs, aiFeedback: null };
            return newE;
        });

        handleAIEvaluation(targetText, transcript, diffs);
    };

    const handleAIEvaluation = async (targetText, transcript, diffs) => {
        setIsEvaluating(true);
        try {
            const prompt = `Bạn là một giáo viên dạy phát âm tiếng Anh.
Học viên vừa đọc một câu tiếng Anh. Dưới đây là câu gốc và câu mà hệ thống nhận diện giọng nói nghe được từ học viên.

Câu gốc: "${targetText}"
Câu nhận diện được: "${transcript}"

Hãy phân tích lỗi phát âm của học viên dựa trên sự khác biệt này. 
Lưu ý: Hệ thống nhận diện có thể không hoàn hảo, nhưng hãy chỉ ra những từ học viên có thể đã phát âm sai (những từ có trong bản gốc nhưng không có trong bản nhận diện, hoặc những từ bị nhận diện nhầm thành từ khác).

Trả về kết quả dưới dạng JSON với cấu trúc:
{
    "score": "Điểm số trên 100 (ví dụ: 85)",
    "feedback": "Nhận xét ngắn gọn về khả năng phát âm câu này",
    "mispronounced_words": [
        {
            "word": "Từ phát âm sai hoặc bị thiếu",
            "suggestion": "Cách phát âm đúng hoặc mẹo để đọc đúng từ này"
        }
    ]
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
            const parsedFeedback = JSON.parse(data.text);
            const numScore = parseInt(parsedFeedback.score.toString().replace('/100', ''), 10) || 70;
            
            setEvaluations(prev => {
                const newE = [...prev];
                newE[currentIndex] = { diffs, aiFeedback: { ...parsedFeedback, score: numScore } };
                localStorage.setItem('speaking_ai_evaluations', JSON.stringify(newE));
                return newE;
            });
        } catch (error) {
            console.error("Lỗi khi AI chấm bài:", error);
            toast.error("Có lỗi xảy ra khi AI đánh giá!");
        } finally {
            setIsEvaluating(false);
        }
    };

    const handleNext = () => {
        if (isRecording) toggleRecording();
        if (currentIndex < sentences.length - 1) {
            const nextIdx = currentIndex + 1;
            setCurrentIndex(nextIdx);
            localStorage.setItem('speaking_ai_currentIndex', nextIdx.toString());
        }
    };

    const handlePrev = () => {
        if (isRecording) toggleRecording();
        if (currentIndex > 0) {
            const prevIdx = currentIndex - 1;
            setCurrentIndex(prevIdx);
            localStorage.setItem('speaking_ai_currentIndex', prevIdx.toString());
        }
    };

    const currentEval = evaluations[currentIndex];

    const getScoreColor = (score) => {
        if (score >= 80) return "text-green-700 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/30";
        if (score >= 60) return "text-orange-750 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/30";
        return "text-red-700 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30";
    };

    if (isFinished) {
        const totalScore = evaluations.reduce((acc, curr) => acc + (curr?.aiFeedback?.score || 0), 0);
        const evaluatedCount = evaluations.filter(e => e).length;
        const avgScore = evaluatedCount > 0 ? Math.round(totalScore / evaluatedCount) : 0;
        
        return (
            <div className="max-w-3xl mx-auto p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-150 dark:border-slate-800 mt-10 text-center animate-in fade-in zoom-in duration-500 transition-colors">
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-amber-50 dark:bg-amber-950/20 rounded-full flex items-center justify-center border-4 border-amber-200/50 animate-bounce">
                        <Trophy size={40} className="text-amber-500" />
                    </div>
                </div>
                <h2 className="text-3xl font-black mb-2 text-gray-800 dark:text-white">Hoàn thành bài luyện nói!</h2>
                <p className="text-sm text-gray-400 dark:text-slate-500 mb-8">{title || `Chủ đề: ${topic}`}</p>
                
                <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-2xl border border-gray-150 dark:border-slate-700 mb-8 inline-block min-w-[300px] transition-colors shadow-inner">
                    <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">Điểm nói trung bình</p>
                    <div className={`text-7xl font-black ${avgScore >= 80 ? 'text-green-500' : avgScore >= 60 ? 'text-orange-500' : 'text-red-500'}`}>
                        {avgScore} <span className="text-3xl font-bold opacity-60">/ 100</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-3 font-semibold">Đã chấm điểm {evaluatedCount} / {sentences.length} câu</p>
                </div>
                
                <div className="flex justify-center gap-4 flex-wrap">
                    <button 
                        onClick={() => {
                            setIsFinished(false);
                            setCurrentIndex(0);
                            localStorage.setItem('speaking_ai_isFinished', 'false');
                            localStorage.setItem('speaking_ai_currentIndex', '0');
                        }}
                        className="px-6 py-3 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition flex items-center gap-2 text-sm"
                    >
                        <RefreshCw size={16} /> Xem lại bài
                    </button>
                    <button 
                        onClick={() => {
                            setIsFinished(false);
                            handleGenerateText();
                        }}
                        className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-md flex items-center gap-2 text-sm"
                    >
                        <Play size={16} fill="currentColor" /> Tạo bài nói mới
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-6 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-150 dark:border-slate-800 mt-2 transition-colors">
            <h2 className="text-2xl font-black mb-6 text-gray-800 dark:text-white flex items-center gap-2">
                <Mic className="text-blue-500" /> Luyện Đọc & Phát Âm với AI
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                
                {/* Configuration Column */}
                <div className="lg:col-span-1 flex flex-col gap-4 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-gray-150 dark:border-slate-800 transition-colors">
                    <div className="flex items-center gap-1.5 border-b border-gray-200/50 dark:border-slate-700 pb-2">
                        <Settings size={16} className="text-blue-500" />
                        <h3 className="font-extrabold text-sm text-gray-700 dark:text-slate-200">Cài đặt câu giao tiếp</h3>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 mb-1.5 uppercase tracking-wide">Trình độ</label>
                        <select 
                            className="w-full p-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-200 transition-colors cursor-pointer"
                            value={level}
                            onChange={(e) => setLevel(e.target.value)}
                        >
                            <option value="A1 (Cơ bản)" className="bg-white dark:bg-slate-900">A1 (Cơ bản)</option>
                            <option value="A2 (Sơ cấp)" className="bg-white dark:bg-slate-900">A2 (Sơ cấp)</option>
                            <option value="B1 (Trung cấp)" className="bg-white dark:bg-slate-900">B1 (Trung cấp)</option>
                            <option value="B2 (Trung cao cấp)" className="bg-white dark:bg-slate-900">B2 (Trung cao cấp)</option>
                            <option value="C1 (Cao cấp)" className="bg-white dark:bg-slate-900">C1 (Cao cấp)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 mb-1.5 uppercase tracking-wide">Chủ đề hội thoại</label>
                        <select 
                            className="w-full p-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-200 transition-colors cursor-pointer"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                        >
                            <option value="Chào hỏi & Tạm biệt" className="bg-white dark:bg-slate-900">Chào hỏi & Tạm biệt</option>
                            <option value="Bản thân & Gia đình" className="bg-white dark:bg-slate-900">Bản thân & Gia đình</option>
                            <option value="Trường học & Giáo dục" className="bg-white dark:bg-slate-900">Trường học & Giáo dục</option>
                            <option value="Công việc & Nghề nghiệp" className="bg-white dark:bg-slate-900">Công việc & Nghề nghiệp</option>
                            <option value="Sở thích & Giải trí" className="bg-white dark:bg-slate-900">Sở thích & Giải trí</option>
                            <option value="Du lịch & Giao thông" className="bg-white dark:bg-slate-900">Du lịch & Giao thông</option>
                            <option value="Mua sắm & Nhà hàng" className="bg-white dark:bg-slate-900">Mua sắm & Nhà hàng</option>
                            <option value="Sức khỏe & Thể thao" className="bg-white dark:bg-slate-900">Sức khỏe & Thể thao</option>
                            <option value="Cảm xúc & Ý kiến" className="bg-white dark:bg-slate-900">Cảm xúc & Ý kiến</option>
                        </select>
                    </div>

                    <div>
                        <div className="flex justify-between items-center text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-1.5">
                            <span>Số câu ngẫu nhiên</span>
                            <span className="text-blue-600 dark:text-blue-400 font-extrabold">{sentenceCount} câu</span>
                        </div>
                        <input 
                            type="range" 
                            min="2" max="10" 
                            value={sentenceCount} 
                            onChange={(e) => setSentenceCount(Number(e.target.value))} 
                            className="w-full accent-blue-600 cursor-pointer h-1.5 bg-gray-200 dark:bg-slate-700 rounded-lg"
                        />
                    </div>

                    <div className="border-t border-gray-150 dark:border-slate-700 pt-3 space-y-3">
                        <h3 className="font-extrabold text-xs text-gray-700 dark:text-slate-200 flex items-center gap-1.5">
                            <Volume2 size={14} className="text-blue-500"/> Giọng đọc mẫu (AI)
                        </h3>
                        <div>
                            <select 
                                className="w-full p-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-200 transition cursor-pointer"
                                value={selectedVoice}
                                onChange={(e) => setSelectedVoice(e.target.value)}
                            >
                                {geminiVoices.map(v => (
                                    <option key={v.id} value={v.id}>{v.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 mb-1">
                                <span>Tốc độ phát âm</span>
                                <span className="text-blue-600">{speechRate}x</span>
                            </div>
                            <input 
                                type="range" 
                                min="0.5" max="1.5" step="0.1" 
                                value={speechRate} 
                                onChange={(e) => setSpeechRate(Number(e.target.value))} 
                                className="w-full accent-blue-600 cursor-pointer h-1.5 bg-gray-200 dark:bg-slate-700 rounded-lg"
                            />
                        </div>
                    </div>

                    <div className="border-t border-gray-150 dark:border-slate-700 pt-3 space-y-2">
                        <h3 className="font-extrabold text-xs text-gray-700 dark:text-slate-200 flex items-center gap-1.5">
                            <AudioLines size={14} className="text-blue-500"/> Lọc âm nâng cao
                        </h3>
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-600 dark:text-slate-300">
                            <input 
                                type="checkbox" 
                                checked={noiseSuppression} 
                                onChange={(e) => setNoiseSuppression(e.target.checked)}
                                className="text-blue-600 focus:ring-blue-500 rounded w-4 h-4 dark:bg-slate-900 dark:border-slate-700"
                            />
                            Lọc tiếng ồn & chống vang
                        </label>
                    </div>

                    <button
                        onClick={handleGenerateText}
                        disabled={isLoading}
                        className="mt-2 bg-blue-650 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl disabled:bg-gray-300 transition flex items-center justify-center gap-2 text-xs shadow-sm"
                    >
                        {isLoading ? <RefreshCw className="animate-spin" size={14} /> : "Tạo bài nói mới"}
                    </button>
                </div>

                {/* Main Content Workspace Column */}
                <div className="lg:col-span-2 flex flex-col gap-4 justify-between">
                    {sentences.length > 0 ? (
                        <>
                            {/* Sentence Card Title */}
                            <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-150 dark:border-slate-700 shadow-sm transition-colors">
                                <h3 className="font-bold text-sm text-gray-800 dark:text-white truncate max-w-[70%]">{title}</h3>
                                <div className="text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900/50">
                                    Câu {currentIndex + 1} / {sentences.length}
                                </div>
                            </div>

                            {/* Main Target Sentence Block */}
                            <div className="bg-blue-50/50 dark:bg-blue-950/10 p-8 rounded-3xl border border-blue-100 dark:border-blue-900/25 min-h-[200px] flex flex-col justify-center relative shadow-inner transition-colors">
                                <div className="absolute top-4 right-4">
                                    <button 
                                        onClick={() => speak(sentences[currentIndex].en)}
                                        disabled={isEvaluating || isRecording}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full transition shadow-sm font-bold text-xs ${
                                            isSpeaking 
                                                ? 'bg-red-50 text-red-650 hover:bg-red-100 border border-red-200' 
                                                : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 shadow-sm'
                                        }`}
                                        title="Nghe đọc mẫu"
                                    >
                                        {isSpeaking ? (
                                            <><SquareIcon size={12} fill="currentColor" /> Dừng nghe</>
                                        ) : (
                                            <><Volume2 size={12} /> Nghe mẫu</>
                                        )}
                                    </button>
                                </div>
                                <p className="text-2xl md:text-3xl text-gray-850 dark:text-white leading-relaxed font-bold text-center mb-6 mt-4">
                                    {sentences[currentIndex].en}
                                </p>
                                <p className="text-sm text-gray-400 dark:text-slate-500 italic text-center border-t border-blue-100 dark:border-blue-900/30 pt-4">
                                    {sentences[currentIndex].vn}
                                </p>
                            </div>

                            {/* Voice recording console */}
                            <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-gray-150 dark:border-slate-800 shadow-sm transition-colors space-y-4">
                                <div className="flex justify-between items-center">
                                    <button 
                                        onClick={handlePrev} 
                                        disabled={currentIndex === 0}
                                        className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-700 border border-gray-250 dark:border-slate-600 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-655 disabled:opacity-50 transition"
                                    >
                                        <ChevronLeft size={14} /> Trước
                                    </button>
                                    
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={toggleRecording}
                                            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-xs transition border shadow-sm ${
                                                isRecording 
                                                    ? 'bg-red-550 hover:bg-red-600 text-white border-red-550 animate-pulse' 
                                                    : 'bg-green-600 hover:bg-green-700 text-white border-green-600'
                                            }`}
                                        >
                                            {isRecording ? (
                                                <>
                                                    {/* Wave animation simulation */}
                                                    <div className="flex items-center gap-1.5 mr-1 h-3">
                                                        <span className="w-0.5 bg-white rounded-full animate-bounce h-2" style={{ animationDelay: '0.1s' }} />
                                                        <span className="w-0.5 bg-white rounded-full animate-bounce h-3" style={{ animationDelay: '0.3s' }} />
                                                        <span className="w-0.5 bg-white rounded-full animate-bounce h-1.5" style={{ animationDelay: '0.5s' }} />
                                                    </div>
                                                    Dừng thu âm
                                                </>
                                            ) : (
                                                <><Mic size={14} /> Bắt đầu đọc</>
                                            )}
                                        </button>
                                        
                                        {isEvaluating && (
                                            <div className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full font-bold text-xs border border-blue-200 dark:border-blue-900/30">
                                                <RefreshCw size={12} className="animate-spin" /> AI đang phân tích âm...
                                            </div>
                                        )}
                                        
                                        {transcripts[currentIndex] && !isRecording && !isEvaluating && !currentEval && (
                                            <button
                                                onClick={handleCompare}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full font-bold text-xs transition shadow-sm"
                                            >
                                                AI Chấm điểm
                                            </button>
                                        )}
                                    </div>

                                    <div>
                                        {currentIndex === sentences.length - 1 ? (
                                            <button 
                                                onClick={() => {
                                                    setIsFinished(true);
                                                    localStorage.setItem('speaking_ai_isFinished', 'true');
                                                }} 
                                                disabled={!currentEval}
                                                className="flex items-center gap-1 px-4 py-2 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl disabled:opacity-50 transition shadow-sm"
                                            >
                                                Hoàn thành <CheckCircle size={14} />
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={handleNext} 
                                                className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-700 border border-gray-250 dark:border-slate-600 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-655 transition"
                                            >
                                                Sau <ChevronRight size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="min-h-[80px] p-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-150 dark:border-slate-800 text-center flex items-center justify-center relative transition-colors shadow-inner">
                                    {isRecording && noiseSuppression && (
                                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 text-[9px] font-black text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 px-2.5 py-1 rounded-full border border-green-150 dark:border-green-900/30">
                                            <AudioLines size={10} className="animate-pulse" /> Đang lọc ồn
                                        </div>
                                    )}
                                    {transcripts[currentIndex] ? (
                                        <p className="text-base text-gray-800 dark:text-slate-200 font-medium">"{transcripts[currentIndex]}"</p>
                                    ) : (
                                        <p className="text-gray-400 dark:text-slate-500 italic text-xs">
                                            {isRecording ? "Đang thu âm... Vui lòng đọc câu trên bằng tiếng Anh." : "Bản dịch ghi âm của bạn sẽ hiển thị ở đây."}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Evaluation Report */}
                            {currentEval && (
                                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-150 dark:border-slate-700 shadow-sm animate-fade-in transition-colors space-y-4">
                                    <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-700 pb-2">
                                        <h3 className="font-extrabold text-sm text-gray-800 dark:text-white">Báo cáo phát âm</h3>
                                        {currentEval.aiFeedback && (
                                            <span className={`px-3 py-1 rounded-full text-xs font-black border ${getScoreColor(currentEval.aiFeedback.score)}`}>
                                                Điểm phát âm: {currentEval.aiFeedback.score}/100
                                            </span>
                                        )}
                                    </div>
                                    
                                    {currentEval.diffs && (
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phân tích từ từ:</p>
                                            <div className="leading-relaxed text-base bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700 text-center flex flex-wrap gap-x-2 gap-y-1 justify-center transition-colors">
                                                {currentEval.diffs.map((part, i) => {
                                                    if (part.added) {
                                                        // Extra word spoken
                                                        return <span key={i} className="text-xs px-2 py-0.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded-lg line-through">{part.value}</span>;
                                                    }
                                                    if (part.removed) {
                                                        // Missing or mispronounced word
                                                        return <span key={i} className="text-xs px-2 py-0.5 bg-orange-50 dark:bg-orange-950/20 text-orange-650 dark:text-orange-400 border border-orange-200/50 dark:border-orange-900/30 rounded-lg font-bold" title="Từ này phát âm sai hoặc bị đọc thiếu">{part.value}</span>;
                                                    }
                                                    // Correct
                                                    return <span key={i} className="text-xs px-2 py-0.5 bg-green-50 dark:bg-green-955/20 text-green-700 dark:text-green-400 border border-green-150 dark:border-green-905/30 rounded-lg font-semibold">{part.value}</span>;
                                                })}
                                            </div>
                                            <div className="flex justify-center gap-4 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                                <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-green-600 rounded-full inline-block"></span> Khớp</span>
                                                <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-orange-500 rounded-full inline-block"></span> Sai/Thiếu</span>
                                                <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-red-500 rounded-full inline-block"></span> Dư thừa</span>
                                            </div>
                                        </div>
                                    )}

                                    {currentEval.aiFeedback && (
                                        <div className="space-y-3">
                                            <p className="text-gray-750 dark:text-slate-200 text-xs italic bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100/50 dark:border-blue-900/20 leading-relaxed shadow-sm">
                                                "{currentEval.aiFeedback.feedback}"
                                            </p>
                                            
                                            {currentEval.aiFeedback.mispronounced_words && currentEval.aiFeedback.mispronounced_words.length > 0 && (
                                                <div className="space-y-2">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Gợi ý cách đọc đúng:</p>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {currentEval.aiFeedback.mispronounced_words.map((item, idx) => (
                                                            <div key={idx} className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded-xl border border-orange-100 dark:border-orange-900/20 text-xs shadow-sm">
                                                                <p className="font-extrabold text-orange-700 dark:text-orange-400 mb-1 text-sm">{item.word}</p>
                                                                <p className="text-gray-650 dark:text-slate-300">{item.suggestion}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="bg-slate-50 dark:bg-slate-800/20 p-10 rounded-3xl border border-gray-150 dark:border-slate-800 flex flex-col items-center justify-center text-gray-400 dark:text-slate-500 italic min-h-[400px] transition-colors shadow-inner text-center">
                            <Mic size={48} className="text-gray-300 dark:text-slate-700 mb-4 animate-pulse" />
                            <p className="text-sm">Bấm "Tạo bài nói mới" ở cột bên trái để bắt đầu luyện tập</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SpeakingMode;
