import React, { useMemo, useState, useRef, useEffect } from 'react';
import { 
    Network, 
    Volume2, 
    Sparkles, 
    Search, 
    ChevronLeft, 
    ChevronRight,
    Compass,
    Grid3X3,
    Layers,
    ZoomIn,
    ZoomOut,
    RotateCcw,
    X,
    BookOpen
} from 'lucide-react';

/**
 * Union-Find (Disjoint Set Union)
 * Linear time clustering engine O(N) (<30ms)
 */
class DSU {
    constructor(n) {
        this.parent = Array.from({ length: n }, (_, i) => i);
    }
    find(i) {
        if (this.parent[i] === i) return i;
        return (this.parent[i] = this.find(this.parent[i]));
    }
    union(i, j) {
        const rootI = this.find(i);
        const rootJ = this.find(j);
        if (rootI !== rootJ) {
            this.parent[rootI] = rootJ;
        }
    }
}

/**
 * Rule-based English Part-of-Speech (POS) Classifier
 */
function detectPOS(word, isBase = false) {
    if (!word) return 'noun';
    const w = word.trim().toLowerCase();
    
    if (w.includes(' ')) return 'collocation';
    
    // 1. Trạng từ (Adverb)
    if (w.endsWith('ly') || w.endsWith('ward') || w.endsWith('wise')) {
        const adjExceptions = ['friendly', 'lovely', 'lonely', 'ugly', 'silly', 'holy', 'early', 'daily', 'weekly', 'monthly'];
        if (!adjExceptions.includes(w)) return 'adv';
        return 'adj';
    }
    
    // 2. Danh từ (Noun)
    if (w.endsWith('tion') || w.endsWith('sion') || w.endsWith('ment') || w.endsWith('ness') || 
        w.endsWith('ity') || w.endsWith('ties') || w.endsWith('er') || w.endsWith('or') || 
        w.endsWith('ance') || w.endsWith('ence') || w.endsWith('ist') || w.endsWith('ism') || 
        w.endsWith('ship') || w.endsWith('hood') || w.endsWith('age') || w.endsWith('cy') ||
        w.endsWith('th')) {
        return 'noun';
    }
    
    // 3. Tính từ (Adjective)
    if (w.endsWith('ive') || w.endsWith('able') || w.endsWith('ible') || w.endsWith('ful') || 
        w.endsWith('less') || w.endsWith('ous') || w.endsWith('ious') || w.endsWith('ic') || 
        w.endsWith('ical') || w.endsWith('ish') || w.endsWith('ary') || w.endsWith('al') ||
        w.endsWith('ed') || w.endsWith('ing') || w.endsWith('ent') || w.endsWith('ant')) {
        return 'adj';
    }
    
    // 4. Động từ (Verb)
    if (w.endsWith('ate') || w.endsWith('ify') || w.endsWith('ize') || w.endsWith('ise') || 
        w.endsWith('en') || w.startsWith('re') || w.startsWith('inter') || w.startsWith('en') ||
        w.startsWith('de') || w.startsWith('co') || isBase) {
        return 'verb';
    }
    
    return isBase ? 'verb' : 'noun';
}

// Visual Themes matching the Miro Mindmap image exactly:
// Top-Left: Purple (Động từ)
// Bottom-Left: Green (Danh từ)
// Top-Right: Yellow/Amber (Tính từ)
// Bottom-Right: Rose/Pink (Trạng từ)
const BRANCH_CONFIG = {
    verb: {
        title: 'Động từ',
        color: '#9333ea', // Purple
        bgClass: 'bg-purple-600 hover:bg-purple-700 dark:bg-purple-600/90 dark:hover:bg-purple-500 text-white shadow-md shadow-purple-500/20 dark:shadow-purple-950/40 border-2 border-white dark:border-slate-800',
        borderClass: 'border-purple-600 dark:border-purple-500',
        branchBg: 'bg-purple-600 dark:bg-purple-500'
    },
    noun: {
        title: 'Danh từ',
        color: '#16a34a', // Emerald Green
        bgClass: 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600/90 dark:hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/20 dark:shadow-emerald-950/40 border-2 border-white dark:border-slate-800',
        borderClass: 'border-emerald-600 dark:border-emerald-500',
        branchBg: 'bg-emerald-600 dark:bg-emerald-500'
    },
    adj: {
        title: 'Tính từ',
        color: '#f59e0b', // Amber / Golden Yellow
        bgClass: 'bg-amber-400 hover:bg-amber-500 dark:bg-amber-400 dark:hover:bg-amber-300 text-amber-950 font-black shadow-md shadow-amber-500/20 dark:shadow-amber-950/40 border-2 border-white dark:border-slate-800',
        borderClass: 'border-amber-400 dark:border-amber-300',
        branchBg: 'bg-amber-400 dark:bg-amber-400'
    },
    adv: {
        title: 'Trạng từ',
        color: '#e11d48', // Rose / Pink
        bgClass: 'bg-rose-500 hover:bg-rose-600 dark:bg-rose-600/90 dark:hover:bg-rose-500 text-white shadow-md shadow-rose-500/20 dark:shadow-rose-950/40 border-2 border-white dark:border-slate-800',
        borderClass: 'border-rose-500 dark:border-rose-500',
        branchBg: 'bg-rose-500 dark:bg-rose-500'
    },
    collocation: {
        title: 'Cụm từ',
        color: '#0891b2', // Cyan
        bgClass: 'bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-600/90 dark:hover:bg-cyan-500 text-white shadow-md shadow-cyan-500/20 dark:shadow-cyan-950/40 border-2 border-white dark:border-slate-800',
        borderClass: 'border-cyan-600 dark:border-cyan-500',
        branchBg: 'bg-cyan-600 dark:bg-cyan-500'
    }
};

/**
 * Curated knowledge base matching the user's reference format exactly
 */
const WORD_KNOWLEDGE_BASE = {
    address: {
        titleVi: 'trình bày (v) / bài diễn văn (n)',
        posLabel: 'Danh/Động từ',
        defEn: 'To deal with a problem or issue; to speak or write to a person or group.',
        defVi: 'Giải quyết một vấn đề; nói chuyện hoặc viết thư cho một người hoặc một nhóm.',
        exampleEn: 'The director addressed employee concerns during the meeting.',
        exampleVi: 'Giám đốc đã phát biểu giải quyết các mối bận tâm của nhân viên trong cuộc họp.'
    },
    act: {
        titleVi: 'hành động (v) / đạo luật (n)',
        posLabel: 'Danh/Động từ',
        defEn: 'To take action, do something, or perform a role in a play or film.',
        defVi: 'Hành động, thực hiện điều gì đó hoặc biểu diễn một vai kịch/phim.',
        exampleEn: 'The government acted quickly to support affected businesses.',
        exampleVi: 'Chính phủ đã hành động nhanh chóng để hỗ trợ các doanh nghiệp bị ảnh hưởng.'
    },
    action: {
        titleVi: 'hành động, biện pháp (n)',
        posLabel: 'Danh từ',
        defEn: 'The process of doing something, especially to solve a problem or achieve an aim.',
        defVi: 'Quá trình làm điều gì đó, đặc biệt để giải quyết một vấn đề hoặc đạt mục tiêu.',
        exampleEn: 'We must take prompt action to resolve these customer complaints.',
        exampleVi: 'Chúng ta phải có hành động kịp thời để giải quyết các khiếu nại của khách hàng.'
    },
    active: {
        titleVi: 'tích cực, chủ động (adj)',
        posLabel: 'Tính từ',
        defEn: 'Always busy, taking action, or participating with energy.',
        defVi: 'Luôn bận rộn, hành động hoặc tham gia với nhiều năng lượng.',
        exampleEn: 'She plays an active role in developing the new marketing strategy.',
        exampleVi: 'Cô ấy đóng một vai trò tích cực trong việc phát triển chiến lược tiếp thị mới.'
    },
    actively: {
        titleVi: 'một cách chủ động, tích cực (adv)',
        posLabel: 'Trạng từ',
        defEn: 'In a way that involves taking action or making a noticeable effort.',
        defVi: 'Theo cách chủ động hoặc thể hiện nỗ lực rõ rệt.',
        exampleEn: 'Employees are actively participating in the interactive workshop.',
        exampleVi: 'Nhân viên đang tích cực tham gia vào buổi hội thảo tương tác.'
    },
    care: {
        titleVi: 'chăm sóc, quan tâm (v/n)',
        posLabel: 'Danh/Động từ',
        defEn: 'The provision of what is necessary for the health, welfare, and protection of someone.',
        defVi: 'Việc cung cấp những gì cần thiết cho sức khỏe, phúc lợi và sự an toàn.',
        exampleEn: 'Hospital staff care deeply about patient comfort and recovery.',
        exampleVi: 'Nhân viên bệnh viện hết sức quan tâm đến sự thoải mái và hồi phục của bệnh nhân.'
    },
    careful: {
        titleVi: 'cẩn thận, chu đáo (adj)',
        posLabel: 'Tính từ',
        defEn: 'Making sure of avoiding potential danger, mishap, or harm.',
        defVi: 'Đảm bảo tránh các nguy hiểm tiềm ẩn, rủi ro hoặc tổn hại.',
        exampleEn: 'Be careful when reviewing legal contract clauses.',
        exampleVi: 'Hãy cẩn thận khi xem xét các điều khoản hợp đồng pháp lý.'
    },
    carefully: {
        titleVi: 'một cách cẩn thận (adv)',
        posLabel: 'Trạng từ',
        defEn: 'With great attention, caution, or concern for detail.',
        defVi: 'Với sự tập trung cao độ, thận trọng hoặc chú ý đến từng chi tiết.',
        exampleEn: 'The analyst carefully examined all quarterly financial figures.',
        exampleVi: 'Chuyên viên phân tích đã cẩn thận kiểm tra mọi số liệu tài chính theo quý.'
    }
};

/**
 * Extracts and synthesizes comprehensive word details matching screenshot
 */
function getWordDetails(word) {
    if (!word) return null;
    const cleanEn = (word.en || '').trim().toLowerCase();

    // 1. Check curated knowledge base
    if (WORD_KNOWLEDGE_BASE[cleanEn]) {
        return WORD_KNOWLEDGE_BASE[cleanEn];
    }

    // 2. Derive part of speech label
    const detected = detectPOS(word.en);
    let posLabel = 'Danh từ';
    if (detected === 'verb') posLabel = 'Động từ';
    else if (detected === 'adj') posLabel = 'Tính từ';
    else if (detected === 'adv') posLabel = 'Trạng từ';
    else if (detected === 'collocation') posLabel = 'Cụm từ';

    if (word.category) {
        if (word.category.includes('(')) {
            posLabel = word.category;
        } else if (word.category.toLowerCase().includes('động từ')) {
            posLabel = 'Động từ';
        } else if (word.category.toLowerCase().includes('danh từ')) {
            posLabel = 'Danh từ';
        } else if (word.category.toLowerCase().includes('tính từ')) {
            posLabel = 'Tính từ';
        } else if (word.category.toLowerCase().includes('trạng từ')) {
            posLabel = 'Trạng từ';
        }
    }

    const titleVi = word.vi || word.en;

    // 3. Definitions (EN / VI)
    const defEn = word.definition_en || (
        detected === 'verb' ? `To ${cleanEn}; to perform or carry out an action relating to "${word.vi}".` :
        detected === 'noun' ? `The state, concept, or entity representing "${word.vi}".` :
        detected === 'adj' ? `Characterized by or having the quality of "${word.vi}".` :
        detected === 'adv' ? `In a manner or fashion that relates to being "${word.vi}".` :
        `An idiomatic phrase or collocation meaning "${word.vi}".`
    );

    const defVi = word.definition_vi || word.vi || 'Định nghĩa đang được cập nhật.';

    // 4. Examples (EN / VI)
    const exampleEn = word.example_en || (
        detected === 'verb' ? `The manager decided to ${cleanEn} the issue immediately.` :
        detected === 'noun' ? `The company observed significant improvement in ${cleanEn}.` :
        detected === 'adj' ? `This is a highly ${cleanEn} solution for our current workflow.` :
        detected === 'adv' ? `The team worked ${cleanEn} to achieve outstanding quarterly results.` :
        `It is crucial to ${cleanEn} to ensure sustainable success.`
    );

    const exampleVi = word.example_vi || (
        detected === 'verb' ? `Người quản lý đã quyết định ${word.vi.toLowerCase()} vấn đề ngay lập tức.` :
        detected === 'noun' ? `Công ty ghi nhận sự cải thiện đáng kể về ${word.vi.toLowerCase()}.` :
        detected === 'adj' ? `Đây là một giải pháp rất ${word.vi.toLowerCase()} cho quy trình làm việc hiện tại của chúng tôi.` :
        detected === 'adv' ? `Nhóm đã làm việc một cách ${word.vi.toLowerCase()} để đạt kết quả xuất sắc trong quý.` :
        `Điều cốt yếu là ${word.vi.toLowerCase()} để đảm bảo thành công bền vững.`
    );

    return {
        titleVi,
        posLabel,
        defEn,
        defVi,
        exampleEn,
        exampleVi
    };
}

/**
 * Highlights the target word or its stem in bold inside example sentence
 */
function renderHighlightedExample(exampleText, targetWord, highlightClass = 'text-emerald-600 dark:text-emerald-400') {
    if (!exampleText || !targetWord) return exampleText;
    const cleanWord = targetWord.trim().toLowerCase();
    const stem = cleanWord.length >= 4 ? cleanWord.slice(0, 4) : cleanWord;

    try {
        const regex = new RegExp(`(\\b${stem}[a-z]*\\b)`, 'gi');
        const parts = exampleText.split(regex);

        return parts.map((part, idx) => {
            if (part.toLowerCase().startsWith(stem)) {
                return (
                    <strong key={idx} className={`${highlightClass} font-bold not-italic`}>
                        {part}
                    </strong>
                );
            }
            return part;
        });
    } catch {
        return exampleText;
    }
}

/**
 * Right-side Word Details Card (Option 1: Apple / Raycast Sleek Card)
 * Refined, elegant, with synchronized color badges and contextual quote card
 */
const WordDetailPanel = ({ word, clusterMembers = [], onSelectWord, speak, onClose }) => {
    if (!word) return null;

    const details = getWordDetails(word);
    const posType = detectPOS(word.en);

    // Color theme mapping based on POS (synced with Mindmap colors)
    const themeMap = {
        verb: {
            badge: 'bg-purple-50 text-purple-700 border-purple-200/80 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/80',
            dot: 'bg-purple-500',
            accentBorder: 'border-l-purple-500',
            accentText: 'text-purple-600 dark:text-purple-400',
            btn: 'hover:bg-purple-50 dark:hover:bg-purple-950/50 text-purple-600 dark:text-purple-400',
            label: 'Động từ (Verb)'
        },
        noun: {
            badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/80',
            dot: 'bg-emerald-500',
            accentBorder: 'border-l-emerald-500',
            accentText: 'text-emerald-600 dark:text-emerald-400',
            btn: 'hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400',
            label: 'Danh từ (Noun)'
        },
        adj: {
            badge: 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/80',
            dot: 'bg-amber-500',
            accentBorder: 'border-l-amber-500',
            accentText: 'text-amber-600 dark:text-amber-400',
            btn: 'hover:bg-amber-50 dark:hover:bg-amber-950/50 text-amber-600 dark:text-amber-400',
            label: 'Tính từ (Adjective)'
        },
        adv: {
            badge: 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/80',
            dot: 'bg-rose-500',
            accentBorder: 'border-l-rose-500',
            accentText: 'text-rose-600 dark:text-rose-400',
            btn: 'hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400',
            label: 'Trạng từ (Adverb)'
        },
        collocation: {
            badge: 'bg-cyan-50 text-cyan-700 border-cyan-200/80 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-800/80',
            dot: 'bg-cyan-500',
            accentBorder: 'border-l-cyan-500',
            accentText: 'text-cyan-600 dark:text-cyan-400',
            btn: 'hover:bg-cyan-50 dark:hover:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400',
            label: 'Cụm từ (Collocation)'
        }
    };

    const currentTheme = themeMap[posType] || themeMap.noun;

    return (
        <div className="w-full xl:w-[400px] shrink-0 bg-theme-surface/95 backdrop-blur-xl rounded-[2rem] p-6 sm:p-7 border border-theme-subtle shadow-2xl relative animate-fade-in select-text space-y-5">
            
            {/* 1. Header Toolbar (POS Badge + Close Button) */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${currentTheme.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${currentTheme.dot}`} />
                        <span>{details.posLabel || currentTheme.label}</span>
                    </span>
                    {word.master_group && (
                        <span className="text-[11px] font-semibold text-theme-muted truncate max-w-[140px]">
                            {word.master_group}
                        </span>
                    )}
                </div>

                {onClose && (
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-theme-muted hover:text-theme-main hover:bg-theme-subtle transition-colors cursor-pointer"
                        title="Đóng bảng chi tiết"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* 2. Hero Word & Meaning (Clean, Modern, Non-centered Typography) */}
            <div className="space-y-1.5">
                <div className="flex items-baseline justify-between gap-3">
                    <h2 className="text-2xl sm:text-3xl font-black text-theme-main tracking-tight">
                        {word.en}
                    </h2>
                    {word.ipa && (
                        <span className="text-xs font-mono font-medium text-theme-muted bg-theme-subtle px-2 py-0.5 rounded-md">
                            {word.ipa}
                        </span>
                    )}
                </div>

                {/* Primary Meaning in Vietnamese */}
                <p className="text-base sm:text-lg font-bold text-theme-secondary leading-snug">
                    {details.titleVi}
                </p>

                {/* Audio Pronunciation Pill Button */}
                <div className="pt-1 flex items-center gap-2">
                    <button
                        onClick={() => speak(word.en)}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-theme-subtle hover:opacity-90 text-theme-main text-xs font-bold transition-all cursor-pointer shadow-xs group"
                    >
                        <Volume2 size={14} className="text-rose-500 group-hover:scale-110 transition-transform" />
                        <span>Phát âm bản ngữ</span>
                    </button>
                </div>
            </div>

            {/* 3. Section: Định Nghĩa (Clean, Cohesive Card with Theme Variables) */}
            <div className="rounded-2xl p-4 bg-theme-card border border-theme-subtle space-y-3 shadow-xs">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-theme-muted">
                    <BookOpen size={13} className="text-theme-muted" />
                    <span>Định nghĩa</span>
                </div>

                <div className="space-y-2.5 text-sm">
                    {/* English Definition */}
                    <div className="flex items-start gap-2.5">
                        <span className="shrink-0 text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-theme-muted text-theme-secondary uppercase mt-0.5 tracking-wider">
                            EN
                        </span>
                        <p className="text-theme-main leading-relaxed font-normal">
                            {details.defEn}
                        </p>
                    </div>

                    {/* Vietnamese Definition */}
                    <div className="flex items-start gap-2.5 pt-2 border-t border-theme-subtle">
                        <span className="shrink-0 text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-theme-muted text-theme-secondary uppercase mt-0.5 tracking-wider">
                            VI
                        </span>
                        <p className="text-theme-secondary leading-relaxed font-normal">
                            {details.defVi}
                        </p>
                    </div>
                </div>
            </div>

            {/* 4. Section: Ví Dụ Thực Tế (Harmonized Quote Card with POS Left Accent) */}
            <div className={`rounded-2xl p-4 bg-theme-card border border-theme-subtle border-l-4 ${currentTheme.accentBorder} shadow-xs space-y-2.5`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-theme-muted">
                        <Sparkles size={13} className={currentTheme.accentText} />
                        <span>Ví dụ thực tế</span>
                    </div>

                    {/* Audio Listen for Sentence */}
                    <button
                        onClick={() => speak(details.exampleEn)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-theme-surface text-theme-main hover:opacity-90 border border-theme-subtle text-xs font-bold transition-all shadow-2xs cursor-pointer group"
                        title="Nghe phát âm câu ví dụ"
                    >
                        <Volume2 size={12} className="text-theme-muted group-hover:text-rose-500 transition-colors" />
                        <span>Nghe câu</span>
                    </button>
                </div>

                <div className="space-y-1.5">
                    {/* Sentence with subtle highlight synchronized with theme */}
                    <p className="italic text-theme-main text-sm sm:text-[15px] leading-relaxed font-serif">
                        {renderHighlightedExample(details.exampleEn, word.en, currentTheme.accentText)}
                    </p>
                    {/* Vietnamese translation */}
                    <p className="text-xs sm:text-sm text-theme-muted leading-relaxed">
                        {details.exampleVi}
                    </p>
                </div>
            </div>

            {/* 5. Section: Từ Cùng Họ (Word Family Interactive Chips) */}
            {clusterMembers.length > 1 && (
                <div className="space-y-2 pt-1 border-t border-theme-subtle">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-theme-muted">
                            Từ liên kết ({clusterMembers.length})
                        </span>
                        <span className="text-[10px] text-theme-muted">
                            Bấm để tra nhanh
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto custom-scrollbar pr-1">
                        {clusterMembers.map((m) => {
                            const isSelected = m.id === word.id || m.en.toLowerCase() === word.en.toLowerCase();
                            const mPos = detectPOS(m.en);
                            const dotColor = themeMap[mPos]?.dot || 'bg-slate-400';

                            return (
                                <button
                                    key={m.id || m.en}
                                    onClick={() => onSelectWord && onSelectWord(m)}
                                    className={`px-2.5 py-1 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                                        isSelected
                                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm font-bold ring-2 ring-slate-900 dark:ring-white'
                                            : 'bg-theme-subtle hover:opacity-90 text-theme-secondary border border-theme-subtle'
                                    }`}
                                >
                                    <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                                    <span>{m.en}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

        </div>
    );
};

const RelatedWordsMode = ({ words, speak }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeClusterIndex, setActiveClusterIndex] = useState(0);
    const [selectedWord, setSelectedWord] = useState(null);
    const [hoveredNodeId, setHoveredNodeId] = useState(null);
    const [viewMode, setViewMode] = useState('mindmap'); // 'mindmap' | 'grid'
    const [zoomLevel, setZoomLevel] = useState(1);
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);

    // =========================================================================
    // HIGH-PERFORMANCE CLUSTERING ENGINE (<30ms)
    // =========================================================================
    const clusters = useMemo(() => {
        if (!words || words.length === 0) return [];

        const stopWords = new Set([
            'something', 'somebody', 'someone', 'anyone', 'anything', 
            'the', 'and', 'for', 'with', 'from', 'into', 'onto', 'upon', 
            'without', 'within', 'out', 'off', 'too', 'very', 'not', 
            'you', 'your', 'his', 'her', 'its', 'our', 'their', 'this', 'that', 'these', 'those',
            'make', 'take', 'have', 'give', 'get', 'put', 'set'
        ]);

        const tokenMap = new Map();

        words.forEach((w, idx) => {
            if (!w || !w.en) return;
            const rawTokens = (w.en.toLowerCase().match(/[a-z]+/g) || [])
                .filter(t => t.length >= 3 && !stopWords.has(t));
            
            const seen = new Set();
            for (const t of rawTokens) {
                if (!seen.has(t)) {
                    seen.add(t);
                    if (!tokenMap.has(t)) tokenMap.set(t, []);
                    tokenMap.get(t).push(idx);
                }
                if (t.length >= 5) {
                    const stem = t.slice(0, 5);
                    if (!seen.has(stem)) {
                        seen.add(stem);
                        if (!tokenMap.has(stem)) tokenMap.set(stem, []);
                        tokenMap.get(stem).push(idx);
                    }
                }
            }
        });

        const dsu = new DSU(words.length);
        for (const [token, indices] of tokenMap.entries()) {
            if (indices.length > 1 && indices.length <= 40) {
                const first = indices[0];
                for (let k = 1; k < indices.length; k++) {
                    dsu.union(first, indices[k]);
                }
            }
        }

        const groups = new Map();
        for (let i = 0; i < words.length; i++) {
            if (!words[i] || !words[i].en) continue;
            const root = dsu.find(i);
            if (!groups.has(root)) groups.set(root, []);
            groups.get(root).push(words[i]);
        }

        return Array.from(groups.values())
            .filter(g => g.length > 1)
            .sort((a, b) => b.length - a.length);
    }, [words]);

    // Analyze cluster into Root + 4 POS groups
    const analyzedClusters = useMemo(() => {
        return clusters.map((cluster, cIndex) => {
            const singleWords = cluster.filter(w => !w.en.trim().includes(' '));
            const collocations = cluster.filter(w => w.en.trim().includes(' '));

            let rootWord = null;
            if (singleWords.length > 0) {
                const sortedSingles = [...singleWords].sort((a, b) => a.en.length - b.en.length);
                rootWord = sortedSingles[0];
            } else {
                rootWord = collocations[0];
            }

            const posGroups = {
                verb: [],
                noun: [],
                adj: [],
                adv: [],
                collocation: []
            };

            cluster.forEach(w => {
                const isBase = (w.id === rootWord?.id);
                const pos = detectPOS(w.en, isBase);
                if (posGroups[pos]) {
                    posGroups[pos].push(w);
                } else {
                    posGroups.noun.push(w);
                }
            });

            return {
                id: `mindmap-cluster-${cIndex}`,
                index: cIndex,
                rootWord,
                posGroups,
                allMembers: cluster,
                totalCount: cluster.length
            };
        });
    }, [clusters]);

    // Search filter
    const filteredClusters = useMemo(() => {
        if (!searchQuery.trim()) return analyzedClusters;
        const q = searchQuery.toLowerCase().trim();
        return analyzedClusters.filter(c => 
            c.allMembers.some(w => 
                w.en.toLowerCase().includes(q) || 
                (w.vi && w.vi.toLowerCase().includes(q))
            )
        );
    }, [analyzedClusters, searchQuery]);

    const currentCluster = filteredClusters[activeClusterIndex] || filteredClusters[0] || null;

    // Set selected node to root whenever cluster changes
    useEffect(() => {
        if (currentCluster) {
            setSelectedWord(currentCluster.rootWord);
        }
    }, [currentCluster]);

    if (words.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 h-64 text-slate-500 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <p>Không có từ vựng nào để phân tích mindmap.</p>
            </div>
        );
    }

    if (clusters.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 min-h-[320px]">
                <Network size={40} className="text-slate-400 mb-3" />
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Chưa tìm thấy mạng lưới liên kết!</h3>
                <p className="text-sm mt-1 max-w-sm">Hãy thêm từ vựng để hệ thống tự động vẽ sơ đồ Mindmap tỏa tròn.</p>
            </div>
        );
    }

    // Coordinates layout for Miro-style Organic Mindmap
    // Center is (550, 360) on a 1100 x 720 canvas
    const CANVAS_W = 1100;
    const CANVAS_H = 720;
    const CENTER_X = 550;
    const CENTER_Y = 360;

    // 4 Quadrants configuration:
    // Top-Left: Verb (Purple)
    // Bottom-Left: Noun (Green)
    // Top-Right: Adj (Yellow)
    // Bottom-Right: Adv (Rose)
    const activeBranches = [
        {
            key: 'verb',
            group: currentCluster?.posGroups.verb || [],
            side: 'left',
            mainX: 370,
            mainY: 200,
            leafBaseX: 180,
            startY: 110,
            stepY: 55,
            config: BRANCH_CONFIG.verb
        },
        {
            key: 'noun',
            group: currentCluster?.posGroups.noun || [],
            side: 'left',
            mainX: 370,
            mainY: 520,
            leafBaseX: 180,
            startY: 430,
            stepY: 55,
            config: BRANCH_CONFIG.noun
        },
        {
            key: 'adj',
            group: currentCluster?.posGroups.adj || [],
            side: 'right',
            mainX: 730,
            mainY: 200,
            leafBaseX: 920,
            startY: 110,
            stepY: 55,
            config: BRANCH_CONFIG.adj
        },
        {
            key: 'adv',
            group: currentCluster?.posGroups.adv || [],
            side: 'right',
            mainX: 730,
            mainY: 520,
            leafBaseX: 920,
            startY: 430,
            stepY: 55,
            config: BRANCH_CONFIG.adv
        }
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-16 select-none">
            {/* Header Control Panel */}
            <div className="bg-theme-surface text-theme-main p-5 sm:p-7 rounded-3xl border border-theme-subtle shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center font-black shadow-md shrink-0">
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-extrabold tracking-wider uppercase text-rose-600 bg-rose-50 border border-rose-200 dark:text-rose-400 dark:bg-rose-950/80 dark:border-rose-800/70 px-2.5 py-0.5 rounded-md">
                                Sơ Đồ Tư Duy Hữu Cơ
                            </span>
                            <span className="text-xs text-theme-muted">
                                {clusters.length} cụm từ khóa
                            </span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-theme-main mt-0.5">
                            Organic Radial Mindmap
                        </h2>
                    </div>
                </div>

                {/* Search & Navigation Controls */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                    <div className="relative w-full sm:w-64">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setActiveClusterIndex(0);
                            }}
                            placeholder="Tìm từ gốc (vd: act, care)..."
                            className="w-full pl-8 pr-3 py-2 bg-theme-subtle hover:bg-theme-card focus:bg-theme-surface border border-theme-subtle rounded-xl text-xs text-theme-main placeholder:text-theme-faint focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setActiveClusterIndex((prev) => Math.max(0, prev - 1))}
                            disabled={activeClusterIndex === 0}
                            className="p-2 rounded-xl bg-theme-subtle hover:opacity-85 disabled:opacity-30 text-theme-main border border-theme-subtle transition-all cursor-pointer"
                            title="Cụm trước"
                        >
                            <ChevronLeft size={18} />
                        </button>

                        <span className="text-xs font-mono font-bold px-3 py-1.5 bg-theme-card rounded-xl border border-theme-subtle text-rose-600 dark:text-amber-300">
                            {activeClusterIndex + 1}/{filteredClusters.length}
                        </span>

                        <button
                            onClick={() => setActiveClusterIndex((prev) => Math.min(filteredClusters.length - 1, prev + 1))}
                            disabled={activeClusterIndex === filteredClusters.length - 1}
                            className="p-2 rounded-xl bg-theme-subtle hover:opacity-85 disabled:opacity-30 text-theme-main border border-theme-subtle transition-all cursor-pointer"
                            title="Cụm tiếp theo"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>

                    <button
                        onClick={() => setViewMode(viewMode === 'mindmap' ? 'grid' : 'mindmap')}
                        className="px-3.5 py-2 rounded-xl bg-theme-subtle hover:opacity-85 border border-theme-subtle text-xs font-bold text-theme-main flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                        {viewMode === 'mindmap' ? <Grid3X3 size={14} /> : <Compass size={14} />}
                        <span>{viewMode === 'mindmap' ? 'Duyệt lưới' : 'Xem Mindmap'}</span>
                    </button>
                </div>
            </div>

            {/* Quick Gốc Từ Selector Strip */}
            {filteredClusters.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 shrink-0 uppercase tracking-wider">
                        Từ gốc nhanh:
                    </span>
                    {filteredClusters.slice(0, 16).map((c, idx) => (
                        <button
                            key={c.id}
                            onClick={() => {
                                setActiveClusterIndex(idx);
                                setViewMode('mindmap');
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold shrink-0 transition-all cursor-pointer ${
                                idx === activeClusterIndex
                                    ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md shadow-rose-500/20 ring-2 ring-rose-200 dark:ring-rose-900/60'
                                    : 'bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border border-slate-200/90 dark:border-slate-700/90 hover:border-rose-300 dark:hover:border-rose-600 shadow-xs'
                            }`}
                        >
                            {c.rootWord?.en}
                        </button>
                    ))}
                </div>
            )}

            {/* ================================================================= */}
            {/* VIEW MODE 1: MIRO-STYLE ORGANIC RADIAL MINDMAP CANVAS             */}
            {/* ================================================================= */}
            {viewMode === 'mindmap' && currentCluster && (
                <div className="flex flex-col xl:flex-row items-start gap-6">
                    {/* Interactive Canvas Frame */}
                    <div className="flex-1 min-w-0 w-full bg-slate-50/70 dark:bg-slate-900/90 rounded-[2.5rem] p-4 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-black/60 relative overflow-hidden">
                        
                        {/* Canvas Zoom & View Controls */}
                        <div className="absolute top-6 right-6 z-30 flex items-center gap-1.5 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/90 dark:border-slate-700 shadow-md">
                            <button 
                                onClick={() => setZoomLevel(prev => Math.min(1.4, prev + 0.1))}
                                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                                title="Phóng to"
                            >
                                <ZoomIn size={16} />
                            </button>
                            <span className="text-xs font-mono font-bold px-1 text-slate-600 dark:text-slate-300">
                                {Math.round(zoomLevel * 100)}%
                            </span>
                            <button 
                                onClick={() => setZoomLevel(prev => Math.max(0.7, prev - 0.1))}
                                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                                title="Thu nhỏ"
                            >
                                <ZoomOut size={16} />
                            </button>
                            <button 
                                onClick={() => setZoomLevel(1)}
                                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                                title="Mặc định 100%"
                            >
                                <RotateCcw size={16} />
                            </button>
                            {!isSidePanelOpen && (
                                <button
                                    onClick={() => setIsSidePanelOpen(true)}
                                    className="ml-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white text-xs font-bold flex items-center gap-1 shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
                                    title="Mở bảng chi tiết từ vựng"
                                >
                                    <BookOpen size={13} />
                                    <span>Chi tiết</span>
                                </button>
                            )}
                        </div>

                        {/* Mindmap Scrollable Viewport */}
                        <div className="w-full overflow-x-auto overflow-y-hidden custom-scrollbar py-4 flex justify-center bg-white dark:bg-slate-950 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 shadow-inner">
                            <div 
                                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
                                className="relative w-[1100px] h-[720px] shrink-0 transition-transform duration-200"
                            >
                                {/* SVG Connector Lines Layer */}
                                <svg 
                                    viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
                                    className="absolute inset-0 w-full h-full pointer-events-none z-10"
                                >
                                    <defs>
                                        <marker
                                            id="mindmap-arrow"
                                            viewBox="0 0 10 10"
                                            refX="8"
                                            refY="5"
                                            markerWidth="6"
                                            markerHeight="6"
                                            orient="auto-start-reverse"
                                        >
                                            <path d="M 0 1 L 8 5 L 0 9 z" className="fill-slate-400 dark:fill-slate-600" />
                                        </marker>
                                    </defs>

                                    {/* Draw curved lines for all branches */}
                                    {activeBranches.map(b => {
                                        if (b.group.length === 0) return null;
                                        
                                        // 1. Line from Center Hub to Main Branch Node
                                        const cpX = (CENTER_X + b.mainX) / 2;
                                        const mainPath = `M ${CENTER_X} ${CENTER_Y} C ${cpX} ${CENTER_Y}, ${cpX} ${b.mainY}, ${b.mainX} ${b.mainY}`;

                                        // 2. Lines from Main Branch Node to each Leaf Node
                                        const leafPaths = b.group.slice(0, 5).map((w, idx) => {
                                            const leafY = b.startY + (idx * b.stepY);
                                            const lCpX = (b.mainX + b.leafBaseX) / 2;
                                            return `M ${b.mainX} ${b.mainY} C ${lCpX} ${b.mainY}, ${lCpX} ${leafY}, ${b.leafBaseX} ${leafY}`;
                                        });

                                        return (
                                            <g key={b.key}>
                                                {/* Main Branch Trunk Curve */}
                                                <path
                                                    d={mainPath}
                                                    fill="none"
                                                    className="stroke-slate-400/80 dark:stroke-slate-600/80"
                                                    strokeWidth="2.5"
                                                    strokeLinecap="round"
                                                    markerEnd="url(#mindmap-arrow)"
                                                />

                                                {/* Leaf Sub-branch Curves */}
                                                {leafPaths.map((lp, lIdx) => (
                                                    <path
                                                        key={lIdx}
                                                        d={lp}
                                                        fill="none"
                                                        className="stroke-slate-300 dark:stroke-slate-700"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        markerEnd="url(#mindmap-arrow)"
                                                    />
                                                ))}
                                            </g>
                                        );
                                    })}
                                </svg>

                                {/* ========================================================= */}
                                {/* 1. CENTER RED ORB (PROJECT TITLE / TỪ GỐC)                */}
                                {/* ========================================================= */}
                                <div
                                    style={{
                                        position: 'absolute',
                                        left: `${CENTER_X - 52}px`,
                                        top: `${CENTER_Y - 52}px`,
                                        width: '104px',
                                        height: '104px'
                                    }}
                                    onClick={() => {
                                        setSelectedWord(currentCluster.rootWord);
                                        setIsSidePanelOpen(true);
                                        speak(currentCluster.rootWord?.en);
                                    }}
                                    className="rounded-full bg-gradient-to-br from-rose-500 via-red-500 to-rose-600 dark:from-rose-600 dark:via-red-600 dark:to-rose-700 text-white p-3 shadow-2xl shadow-rose-500/30 dark:shadow-rose-950/80 border-2 border-white dark:border-slate-800 ring-4 ring-rose-100 dark:ring-rose-950/50 flex flex-col items-center justify-center text-center cursor-pointer group hover:scale-105 active:scale-95 transition-all duration-300 z-20"
                                    title="Từ gốc - Bấm để xem chi tiết bên phải & nghe phát âm"
                                >
                                    <h3 className="font-black text-sm sm:text-base leading-tight truncate max-w-full px-1">
                                        {currentCluster.rootWord?.en}
                                    </h3>
                                    {currentCluster.rootWord?.ipa && (
                                        <span className="text-[10px] font-mono text-rose-100/90 truncate max-w-full px-1">
                                            {currentCluster.rootWord.ipa}
                                        </span>
                                    )}
                                    {currentCluster.rootWord?.vi && (
                                        <p className="text-[10px] text-rose-100/80 truncate max-w-full px-1 font-medium mt-0.5">
                                            {currentCluster.rootWord.vi}
                                        </p>
                                    )}
                                    <div className="mt-1 w-5 h-5 rounded-full bg-white/25 flex items-center justify-center group-hover:bg-white group-hover:text-rose-600 transition-colors">
                                        <Volume2 size={11} />
                                    </div>
                                </div>

                                {/* ========================================================= */}
                                {/* 2. 4 MAIN BRANCH NODES & THEIR LEAF NODES                 */}
                                {/* ========================================================= */}
                                {activeBranches.map(b => {
                                    if (b.group.length === 0) return null;

                                    return (
                                        <React.Fragment key={`nodes-${b.key}`}>
                                            {/* Main Branch Pill Node (e.g. "Động từ", "Danh từ") */}
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    left: `${b.mainX - 65}px`,
                                                    top: `${b.mainY - 20}px`,
                                                    width: '130px',
                                                    height: '40px'
                                                }}
                                                className={`rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-800 z-20 cursor-default select-none ${b.config.bgClass}`}
                                            >
                                                {b.config.title} ({b.group.length})
                                            </div>

                                            {/* Child Leaf Nodes (Individual Words) */}
                                            {b.group.slice(0, 5).map((w, idx) => {
                                                const leafY = b.startY + (idx * b.stepY);
                                                const isSelected = selectedWord?.id === w.id || selectedWord?.en === w.en;

                                                return (
                                                    <div
                                                        key={w.id || w.en}
                                                        style={{
                                                            position: 'absolute',
                                                            left: `${b.leafBaseX - 65}px`,
                                                            top: `${leafY - 18}px`,
                                                            width: '130px',
                                                            height: '36px'
                                                        }}
                                                        onClick={() => {
                                                            setSelectedWord(w);
                                                            setIsSidePanelOpen(true);
                                                            speak(w.en);
                                                        }}
                                                        onMouseEnter={() => setHoveredNodeId(w.id)}
                                                        onMouseLeave={() => setHoveredNodeId(null)}
                                                        className={`rounded-2xl font-bold text-xs px-2.5 flex items-center justify-between gap-1 shadow-md border-2 border-white dark:border-slate-800 transition-all duration-200 cursor-pointer z-20 group/leaf ${b.config.bgClass} ${
                                                            isSelected ? 'ring-4 ring-slate-900 dark:ring-white scale-105 shadow-xl' : 'hover:scale-105'
                                                        }`}
                                                        title={`${w.en}: ${w.vi} (Click để xem chi tiết bên phải)`}
                                                    >
                                                        <span className="truncate flex-1">{w.en}</span>
                                                        <Volume2 size={12} className="opacity-75 group-hover/leaf:opacity-100 shrink-0" />
                                                    </div>
                                                );
                                            })}
                                        </React.Fragment>
                                    );
                                })}

                            </div>
                        </div>
                    </div>

                    {/* Right-side Word Detail Card (Apple / Raycast Sleek Card Design) */}
                    {isSidePanelOpen && selectedWord && (
                        <WordDetailPanel
                            word={selectedWord}
                            clusterMembers={currentCluster?.allMembers || []}
                            onSelectWord={(w) => {
                                setSelectedWord(w);
                                speak(w.en);
                            }}
                            speak={speak}
                            onClose={() => setIsSidePanelOpen(false)}
                        />
                    )}
                </div>
            )}

            {/* ================================================================= */}
            {/* VIEW MODE 2: OVERVIEW GRID LIST                                  */}
            {/* ================================================================= */}
            {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredClusters.map((clusterItem, cIdx) => (
                        <div
                            key={clusterItem.id}
                            onClick={() => {
                                setActiveClusterIndex(cIdx);
                                setViewMode('mindmap');
                            }}
                            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-rose-500 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md">
                                        Gốc: "{clusterItem.rootWord?.en}"
                                    </span>
                                    <span className="text-xs text-slate-400 font-semibold">
                                        {clusterItem.totalCount} từ
                                    </span>
                                </div>

                                <h4 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-rose-500 transition-colors">
                                    {clusterItem.rootWord?.en}
                                </h4>
                                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                                    {clusterItem.rootWord?.vi}
                                </p>

                                <div className="mt-4 flex flex-wrap gap-1.5">
                                    {clusterItem.posGroups.verb.length > 0 && (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                                            {clusterItem.posGroups.verb.length} Động từ
                                        </span>
                                    )}
                                    {clusterItem.posGroups.noun.length > 0 && (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300">
                                            {clusterItem.posGroups.noun.length} Danh từ
                                        </span>
                                    )}
                                    {clusterItem.posGroups.adj.length > 0 && (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                                            {clusterItem.posGroups.adj.length} Tính từ
                                        </span>
                                    )}
                                    {clusterItem.posGroups.adv.length > 0 && (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                                            {clusterItem.posGroups.adv.length} Trạng từ
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-rose-600 dark:text-rose-400">
                                <span>Mở sơ đồ Mindmap</span>
                                <Compass size={16} className="group-hover:rotate-45 transition-transform" />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RelatedWordsMode;
