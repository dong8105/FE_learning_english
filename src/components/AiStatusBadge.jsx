import React, { useState } from 'react';
import { useAiStatus } from './AiStatusProvider';
import { useVisibility } from '../context/VisibilityContext';
import { Bot, AlertTriangle, X, Lock } from 'lucide-react';

const AiStatusBadge = () => {
    const { totalTokens, totalPromptTokens, totalCompletionTokens, lastModelUsed, rateLimitErrors, clearStats, setIsDashboardOpen } = useAiStatus();
    const { isAiLocked } = useVisibility();
    const [isHovered, setIsHovered] = useState(false);

    // Always show the badge, even when 0, so the user knows it's there
    // if (totalTokens === 0 && rateLimitErrors.length === 0) return null;

    const formatTokens = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
        return num.toString();
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 pointer-events-none">
            {/* Rate Limit Errors Toast */}
            {rateLimitErrors.map((err) => (
                <div key={err.id} className="bg-red-500/90 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-right-8 pointer-events-auto max-w-sm backdrop-blur-sm border border-red-400">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <div className="flex-1">
                        <p className="font-bold text-sm">AI Rate Limit (429)</p>
                        <p className="text-xs opacity-90 truncate" title={err.model}>Model: {err.model}</p>
                        <p className="text-xs opacity-80 mt-1 line-clamp-2">{err.message}</p>
                    </div>
                </div>
            ))}

            {/* Token Usage Badge */}
            <div 
                className={`bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-2 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 flex items-center gap-2 transition-all duration-300 pointer-events-auto cursor-pointer hover:shadow-xl hover:-translate-y-1 ${isAiLocked ? 'ring-2 ring-rose-500/80 bg-rose-50/20' : rateLimitErrors.length > 0 ? 'ring-2 ring-red-500' : 'hover:ring-2 hover:ring-blue-400 dark:hover:ring-blue-500'}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={() => setIsDashboardOpen(true)}
                title={isAiLocked ? "AI đang tạm khóa bởi Quản trị viên" : "Mở Trung Tâm Điều Khiển AI"}
            >
                <div className="relative">
                    <Bot className={`w-5 h-5 ${isAiLocked ? 'text-rose-500' : rateLimitErrors.length > 0 ? 'text-red-500 animate-pulse' : 'text-blue-500'}`} />
                    {isAiLocked ? (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center"></span>
                    ) : rateLimitErrors.length > 0 ? (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                    ) : null}
                </div>
                
                {isAiLocked && (
                    <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 bg-rose-100/70 dark:bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-900/50 flex items-center gap-1">
                        <Lock size={10} /> Đã Khóa
                    </span>
                )}
                
                <div className="flex flex-col border-r border-gray-200 dark:border-gray-700 pr-2 mr-1">
                    <span className="text-xs font-bold leading-none text-center">{formatTokens(totalTokens)}</span>
                    <span className="text-[9px] opacity-70 leading-none uppercase tracking-wider mt-0.5 text-center">Total</span>
                </div>

                <div className="flex flex-col gap-0.5 pr-2 mr-1 border-r border-gray-200 dark:border-gray-700">
                    <span className="text-[10px] leading-none opacity-80" title="Prompt Tokens">P: {formatTokens(totalPromptTokens)}</span>
                    <span className="text-[10px] leading-none opacity-80" title="Completion Tokens">C: {formatTokens(totalCompletionTokens)}</span>
                </div>

                <div className="flex items-center gap-2">
                    {lastModelUsed ? (
                        <span className="text-[10px] font-medium opacity-90 truncate max-w-[120px] bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded" title={lastModelUsed}>
                            {lastModelUsed.split('/').pop()}
                        </span>
                    ) : (
                        <span className="text-[10px] opacity-50 italic">No model</span>
                    )}
                    <button 
                        onClick={(e) => { e.stopPropagation(); clearStats(); }}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors text-gray-400 hover:text-red-500"
                        title="Reset Stats"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AiStatusBadge;
