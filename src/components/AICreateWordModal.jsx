import React, { useState } from 'react';
import { X, Sparkles, Image as ImageIcon, BookOpen, Type, Lightbulb } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAiStatus } from "./AiStatusProvider";

export default function AICreateWordModal({ isOpen, onClose, onAddWords }) {
    const { reportAiUsage, preferredModel } = useAiStatus();

    const [activeTab, setActiveTab] = useState('topic');
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleGenerate = async () => {
        if (!inputText.trim()) {
            toast.warning("Vui lòng nhập chủ đề hoặc đoạn văn!");
            return;
        }

        setIsLoading(true);
        try {
            const prompt = `You are an English vocabulary extractor. 
            Based on the following topic or text: "${inputText}", 
            generate a list of up to 10 English vocabulary words.
            Respond ONLY with a valid JSON array of objects. 
            Each object must have exactly these keys:
            - "en": the English word
            - "vi": the Vietnamese meaning
            - "ipa": the IPA pronunciation (e.g., "/ˈæpəl/")
            - "category": the part of speech (e.g., "Noun", "Verb", "Adjective")
            - "unit": a number, use 100 for AI generated.
            
            Do not include markdown blocks like \`\`\`json or any other text.`;

            const token = localStorage.getItem('engmaster_token') || localStorage.getItem('token');
            const response = await fetch(`${(import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '')}/api/ai/generate`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ 
                    prompt, 
                    preferredModel: preferredModel === 'auto' ? null : preferredModel 
                })
            });

            if (!response.ok) {
                if (response.status === 403) {
                    const errJson = await response.json().catch(() => ({}));
                    if (errJson.aiLocked) {
                        toast.error(errJson.error || "Tính năng AI hiện đang tạm thời bị khóa bởi Quản trị viên hệ thống!");
                        return;
                    }
                }
                throw new Error('Lỗi kết nối API');
            }
            
            const data = await response.json();
            if (data.metadata) reportAiUsage(data.metadata);
            
            let parsedData;
            try {
                // Try to parse the text directly, in case it returns valid JSON array
                const cleanedText = data.text.replace(/```json/g, '').replace(/```/g, '').trim();
                parsedData = JSON.parse(cleanedText);
            } catch (e) {
                throw new Error('Định dạng dữ liệu trả về không hợp lệ');
            }

            if (Array.isArray(parsedData) && parsedData.length > 0) {
                // Call parent function to add words
                await onAddWords(parsedData);
                toast.success(`Đã tạo thành công ${parsedData.length} từ vựng! 🎉`);
                setInputText('');
                onClose();
            } else {
                toast.warning("Không tìm thấy từ vựng nào. Hãy thử mô tả rõ hơn.");
            }

        } catch (error) {
            console.error(error);
            toast.error("Có lỗi xảy ra khi tạo từ vựng. Vui lòng thử lại!");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-slate-800">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-500 font-bold text-lg px-2">
                        <Sparkles size={24} />
                        <span>Tạo từ vựng với AI</span>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {/* Tabs */}
                    <div className="flex gap-2 mb-6 border-b border-gray-100 dark:border-slate-800 pb-2">
                        <button 
                            onClick={() => setActiveTab('topic')}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${
                                activeTab === 'topic' 
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                    : 'text-gray-500 hover:bg-gray-50 dark:text-slate-400 dark:hover:bg-slate-800'
                            }`}
                        >
                            <Type size={18} /> Nhập chủ đề
                        </button>
                        <button 
                            onClick={() => setActiveTab('reading')}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${
                                activeTab === 'reading' 
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                    : 'text-gray-500 hover:bg-gray-50 dark:text-slate-400 dark:hover:bg-slate-800'
                            }`}
                        >
                            <BookOpen size={18} /> Đọc hiểu
                        </button>
                        <button 
                            onClick={() => setActiveTab('image')}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${
                                activeTab === 'image' 
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                    : 'text-gray-500 hover:bg-gray-50 dark:text-slate-400 dark:hover:bg-slate-800'
                            }`}
                        >
                            <ImageIcon size={18} /> Hình ảnh
                            <span className="text-[10px] bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 px-1.5 py-0.5 rounded-md ml-1">BETA</span>
                        </button>
                    </div>

                    {/* Content area based on tab */}
                    {activeTab === 'topic' && (
                        <div className="relative">
                            <textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                maxLength={1000}
                                placeholder="Nhập chủ đề (VD: animals, technology) hoặc đoạn văn tiếng Anh để trích xuất từ vựng..."
                                className="w-full h-40 p-4 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-2xl resize-none outline-none focus:ring-2 focus:ring-green-500 dark:text-slate-200 transition-colors placeholder-gray-400 dark:placeholder-slate-500"
                            />
                            
                            <div className="flex items-start gap-2 mt-4 text-sm text-gray-500 dark:text-slate-400">
                                <Lightbulb size={16} className="text-amber-500 shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p>Nhập tên chủ đề để AI tạo từ vựng về chủ đề đó, hoặc nhập một đoạn văn tiếng Anh để AI trích xuất từ vựng quan trọng. Thêm không quá 50 từ 1 lần để AI phản hồi chính xác.</p>
                                </div>
                                <span className="shrink-0 text-xs text-gray-400">{inputText.length}/1000</span>
                            </div>
                        </div>
                    )}
                    
                    {activeTab !== 'topic' && (
                        <div className="h-40 flex flex-col items-center justify-center text-gray-400 dark:text-slate-500 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800">
                            <Sparkles size={32} className="mb-2 opacity-50" />
                            <p>Tính năng này đang được phát triển...</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 dark:border-slate-800 flex flex-col gap-3">
                    <button 
                        onClick={handleGenerate}
                        disabled={isLoading || (activeTab === 'topic' && !inputText.trim())}
                        className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl transition-colors shadow-sm disabled:bg-gray-300 disabled:dark:bg-slate-700 flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Đang tạo...
                            </>
                        ) : (
                            <>
                                <Sparkles size={20} />
                                Tạo từ vựng với AI
                            </>
                        )}
                    </button>
                    <button 
                        onClick={onClose}
                        className="w-full py-3 text-blue-500 dark:text-blue-400 font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-2xl transition-colors"
                    >
                        Hủy
                    </button>
                </div>
            </div>
        </div>
    );
}
