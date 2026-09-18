import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
    Network,
    Volume2,
    Sparkles,
    Search,
    ChevronLeft,
    ChevronRight,
    Compass,
    Grid3X3,
    ZoomIn,
    ZoomOut,
    RotateCcw,
    X,
    BookOpen,
    Layers,
    Tag,
    Hash,
    ArrowLeft,
    Globe,
    BookMarked
} from 'lucide-react';

/**
 * Curated Sino-Vietnamese (Hán-Việt) & Meaning mapping for Minna Kanji
 */
const KANJI_KNOWLEDGE_BASE = {
    '学': { hanViet: 'HỌC', meaning: 'Học tập, trường học, sinh viên' },
    '校': { hanViet: 'HIỆU', meaning: 'Trường học, hiệu trưởng' },
    '生': { hanViet: 'SINH', meaning: 'Học sinh, sinh ra, cuộc sống' },
    '先': { hanViet: 'TIÊN', meaning: 'Trước, đi trước, tiên sinh' },
    '人': { hanViet: 'NHÂN', meaning: 'Người, con người' },
    '方': { hanViet: 'PHƯƠNG', meaning: 'Vị, ngài, phương hướng, cách thức' },
    '私': { hanViet: 'TƯ', meaning: 'Tôi, riêng tư, cá nhân' },
    '本': { hanViet: 'BẢN', meaning: 'Sách, gốc rễ, Nhật Bản' },
    '日': { hanViet: 'NHẬT', meaning: 'Ngày, mặt trời, Nhật Bản' },
    '語': { hanViet: 'NGỮ', meaning: 'Ngôn ngữ, từ ngữ, tiếng' },
    '国': { hanViet: 'QUỐC', meaning: 'Đất nước, quốc gia' },
    '社': { hanViet: 'XÃ', meaning: 'Công ty, xã hội, đền thờ' },
    '員': { hanViet: 'VIÊN', meaning: 'Thành viên, nhân viên' },
    '会': { hanViet: 'HỘI', meaning: 'Gặp gỡ, hội họp, công ty' },
    '院': { hanViet: 'VIỆN', meaning: 'Bệnh viện, học viện, viện nghiên cứu' },
    '医': { hanViet: 'Y', meaning: 'Y học, bác sĩ, thầy thuốc' },
    '者': { hanViet: 'GIẢ', meaning: 'Người làm việc gì đó, học giả' },
    '車': { hanViet: 'XA', meaning: 'Xe cộ, phương tiện bánh xe' },
    '自': { hanViet: 'TỰ', meaning: 'Bản thân, tự mình, tự động' },
    '動': { hanViet: 'ĐỘNG', meaning: 'Chuyển động, vận động, hành động' },
    '行': { hanViet: 'HÀNH', meaning: 'Đi, thực hiện, ngân hàng' },
    '来': { hanViet: 'LAI', meaning: 'Đến, tới, tương lai' },
    '帰': { hanViet: 'QUY', meaning: 'Về, trở về quê nhà' },
    '食': { hanViet: 'THỰC', meaning: 'Ăn, ẩm thực, đồ ăn' },
    '飲': { hanViet: 'ẨM', meaning: 'Uống, đồ uống' },
    '見': { hanViet: 'KIẾN', meaning: 'Nhìn, xem, thấy, ý kiến' },
    '聞': { hanViet: 'VĂN', meaning: 'Nghe, hỏi, tin tức' },
    '読': { hanViet: 'ĐỘC', meaning: 'Đọc sách, độc giả' },
    '書': { hanViet: 'THƯ', meaning: 'Viết, sách, tài liệu, thư viện' },
    '買': { hanViet: 'MÃI', meaning: 'Mua hàng, mua sắm' },
    '売': { hanViet: 'MẠI', meaning: 'Bán hàng, thương mại' },
    '話': { hanViet: 'THOẠI', meaning: 'Nói chuyện, câu chuyện, điện thoại' },
    '友': { hanViet: 'HỮU', meaning: 'Bạn bè, thân thiết, hữu nghị' },
    '大': { hanViet: 'ĐẠI', meaning: 'To lớn, quan trọng, đại học' },
    '小': { hanViet: 'TIỂU', meaning: 'Nhỏ bé, tiểu học' },
    '高': { hanViet: 'CAO', meaning: 'Cao, đắt tiền, trường cấp 3' },
    '安': { hanViet: 'AN', meaning: 'Rẻ, an toàn, yên tâm' },
    '新': { hanViet: 'TÂN', meaning: 'Mới, mới mẻ, báo chí' },
    '古': { hanViet: 'CỔ', meaning: 'Cũ, cổ xưa' },
    '多': { hanViet: 'ĐA', meaning: 'Nhiều, đa số' },
    '少': { hanViet: 'THIỂU', meaning: 'Ít, một chút, thiếu niên' },
    '近': { hanViet: 'CẬN', meaning: 'Gần gũi, lân cận, gần đây' },
    '遠': { hanViet: 'VIỄN', meaning: 'Xa xôi, viễn xứ' },
    '時': { hanViet: 'THỜI', meaning: 'Thời gian, giờ giấc, lúc' },
    '分': { hanViet: 'PHÂN', meaning: 'Phút, chia ra, hiểu biết' },
    '半': { hanViet: 'BÁN', meaning: 'Nửa, rưỡi, một nửa' },
    '月': { hanViet: 'NGUYỆT', meaning: 'Tháng, mặt trăng, thứ 2' },
    '年': { hanViet: 'NIÊN', meaning: 'Năm, tuổi tác, niên đại' },
    '金': { hanViet: 'KIM', meaning: 'Vàng, tiền bạc, thứ 6' },
    '木': { hanViet: 'MỘC', meaning: 'Cây cối, gỗ, thứ 5' },
    '水': { hanViet: 'THỦY', meaning: 'Nước, thứ 4' },
    '火': { hanViet: 'HỎA', meaning: 'Lửa, thứ 3' },
    '土': { hanViet: 'THỔ', meaning: 'Đất, thứ 7' },
    '天': { hanViet: 'THIÊN', meaning: 'Trời, thời tiết, thiên nhiên' },
    '気': { hanViet: 'KHÍ', meaning: 'Khí sắc, tinh thần, thời tiết' },
    '雨': { hanViet: 'VŨ', meaning: 'Mưa' },
    '電': { hanViet: 'ĐIỆN', meaning: 'Điện lực, tàu điện, điện thoại' },
    '道': { hanViet: 'ĐẠO', meaning: 'Con đường, đạo lí, võ đạo' },
    '駅': { hanViet: 'DỊCH', meaning: 'Nhà ga tàu điện' },
    '店': { hanViet: 'ĐIẾM', meaning: 'Cửa hàng, quán xá, tiệm' },
    '名': { hanViet: 'DANH', meaning: 'Tên, nổi tiếng, danh thiếp' },
    '前': { hanViet: 'TIỀN', meaning: 'Phía trước, trước đây' },
    '後': { hanViet: 'HẬU', meaning: 'Phía sau, sau này' },
    '上': { hanViet: 'THƯỢNG', meaning: 'Phía trên, lên' },
    '下': { hanViet: 'HẠ', meaning: 'Phía dưới, xuống' },
    '中': { hanViet: 'TRUNG', meaning: 'Bên trong, ở giữa, Trung Quốc' },
    '右': { hanViet: 'HỮU', meaning: 'Bên phải' },
    '左': { hanViet: 'TẢ', meaning: 'Bên trái' },
    '外': { hanViet: 'NGOẠI', meaning: 'Bên ngoài, nước ngoài' },
    '間': { hanViet: 'GIAN', meaning: 'Khoảng giữa, không gian, thời gian' },
    '手': { hanViet: 'THỦ', meaning: 'Bàn tay, thủ công' },
    '目': { hanViet: 'MỤC', meaning: 'Mắt, mục tiêu, mục lục' },
    '耳': { hanViet: 'NHĨ', meaning: 'Lỗ tai' },
    '口': { hanViet: 'KHẨU', meaning: 'Miệng, lối ra vào' },
    '足': { hanViet: 'TÚC', meaning: 'Chân, đầy đủ' },
    '物': { hanViet: 'VẬT', meaning: 'Đồ vật, con vật, vật thể' },
    '事': { hanViet: 'SỰ', meaning: 'Sự việc, công việc' },
    '言': { hanViet: 'NGÔN', meaning: 'Nói, lời nói, ngôn ngữ' },
    '思': { hanViet: 'TƯ', meaning: 'Nghĩ, suy nghĩ, tư tưởng' },
    '知': { hanViet: 'TRI', meaning: 'Biết, tri thức' },
    '作': { hanViet: 'TÁC', meaning: 'Làm, chế tác, sáng tác' },
    '使': { hanViet: 'SỬ', meaning: 'Dùng, sử dụng, sứ giả' },
    '住': { hanViet: 'TRÚ', meaning: 'Sống, cư trú' },
    '立': { hanViet: 'LẬP', meaning: 'Đứng, thiết lập' },
    '座': { hanViet: 'TỌA', meaning: 'Ngồi, chỗ ngồi' },
    '待': { hanViet: 'ĐÃI', meaning: 'Chờ đợi, đối đãi' },
    '持': { hanViet: 'TRÌ', meaning: 'Cầm, mang theo, duy trì' },
    '休': { hanViet: 'HƯU', meaning: 'Nghỉ ngơi, nghỉ phép' },
    '花': { hanViet: 'HOA', meaning: 'Bông hoa' },
    '茶': { hanViet: 'TRÀ', meaning: 'Trà, chè' },
    '魚': { hanViet: 'NGƯ', meaning: 'Con cá' },
    '肉': { hanViet: 'NHỤC', meaning: 'Thịt' },
    '犬': { hanViet: 'KHUYỂN', meaning: 'Con chó' },
    '猫': { hanViet: 'MIÊU', meaning: 'Con mèo' },
    '親': { hanViet: 'THÂN', meaning: 'Bố mẹ, thân thiết, gần gũi' },
    '切': { hanViet: 'THIẾT', meaning: 'Cắt, khẩn cấp, thân thiết (親切)' },
    '父': { hanViet: 'PHỤ', meaning: 'Bố, cha' },
    '母': { hanViet: 'MẪU', meaning: 'Mẹ' },
    '兄': { hanViet: 'HUYNH', meaning: 'Anh trai' },
    '弟': { hanViet: 'ĐỆ', meaning: 'Em trai' },
    '姉': { hanViet: 'TỶ', meaning: 'Chị gái' },
    '妹': { hanViet: 'MUỘI', meaning: 'Em gái' },
    '家': { hanViet: 'GIA', meaning: 'Nhà, gia đình' },
    '男': { hanViet: 'NAM', meaning: 'Đàn ông, con trai' },
    '女': { hanViet: 'NỮ', meaning: 'Phụ nữ, con gái' },
    '子': { hanViet: 'TỬ', meaning: 'Đứa trẻ, con cái' },
    '好': { hanViet: 'HẢO', meaning: 'Thích, tốt đẹp' },
    '早': { hanViet: 'TẢO', meaning: 'Sớm, nhanh chóng' },
    '白': { hanViet: 'BẠCH', meaning: 'Màu trắng' },
    '黒': { hanViet: 'HẮC', meaning: 'Màu đen' },
    '赤': { hanViet: 'XÍCH', meaning: 'Màu đỏ' },
    '青': { hanViet: 'THANH', meaning: 'Màu xanh da trời, thanh xuân' },
    '桜': { hanViet: 'ANH', meaning: 'Hoa anh đào' },
    '悪': { hanViet: 'ÁC', meaning: 'Xấu xa, ác liệt, dở' },
    '暑': { hanViet: 'THỬ', meaning: 'Nóng bức (thời tiết)' },
    '熱': { hanViet: 'NHIỆT', meaning: 'Nóng (đồ vật), nhiệt tình, sốt' },
    '寒': { hanViet: 'HÀN', meaning: 'Lạnh lẽo (thời tiết)' },
    '冷': { hanViet: 'LÃNH', meaning: 'Lạnh (đồ vật, nước), nguội' },
    '仕': { hanViet: 'SĨ', meaning: 'Làm việc, phục vụ (仕事)' },
    '研': { hanViet: 'NGHIÊN', meaning: 'Mài giũa, nghiên cứu' },
    '究': { hanViet: 'CỨU', meaning: 'Nghiên cứu, đến cùng' },
    '銀': { hanViet: 'NGÂN', meaning: 'Bạc, ngân hàng, tiền tệ' },
    '病': { hanViet: 'BỆNH', meaning: 'Bệnh tật, ốm đau' },
    '体': { hanViet: 'THỂ', meaning: 'Cơ thể, thân thể' },
    '頭': { hanViet: 'ĐẦU', meaning: 'Cái đầu, hàng đầu' },
    '顔': { hanViet: 'NHAN', meaning: 'Khuôn mặt, nét mặt' },
    '声': { hanViet: 'THANH', meaning: 'Âm thanh, giọng nói' },
    '心': { hanViet: 'TÂM', meaning: 'Trái tim, tấm lòng, tâm trí' },
    '映': { hanViet: 'ÁNH', meaning: 'Phản chiếu, chiếu phim' },
    '画': { hanViet: 'HỌA', meaning: 'Bức tranh, nét vẽ, phim ảnh' },
    '音': { hanViet: 'ÂM', meaning: 'Âm thanh, tiếng động' },
    '楽': { hanViet: 'LẠC/NHẠC', meaning: 'Vui vẻ, thoải mái, âm nhạc' },
    '歌': { hanViet: 'CA', meaning: 'Bài hát, ca hát' },
    '写': { hanViet: 'TẢ', meaning: 'Sao chép, chụp ảnh' },
    '真': { hanViet: 'CHÂN', meaning: 'Chân thật, ảnh chụp' },
    '旅': { hanViet: 'LỮ', meaning: 'Chuyến đi, du lịch' },
    '理': { hanViet: 'LÝ', meaning: 'Lí lẽ, nấu ăn (料理)' },
    '料': { hanViet: 'LIỆU', meaning: 'Nguyên liệu, phí, tiền nong' },
    '図': { hanViet: 'ĐỒ', meaning: 'Bản đồ, biểu đồ, hình vẽ' },
    '館': { hanViet: 'QUÁN', meaning: 'Tòa nhà lớn, hội quán, thư viện' },
    '勉': { hanViet: 'MIỄN', meaning: 'Cố gắng, chăm chỉ (勉強)' },
    '強': { hanViet: 'CƯỜNG', meaning: 'Mạnh mẽ, kiên cường' },
    '歩': { hanViet: 'BỘ', meaning: 'Đi bộ, bước chân' },
    '走': { hanViet: 'TẨU', meaning: 'Chạy' },
    '泳': { hanViet: 'VỊNH', meaning: 'Bơi lội' },
    '願': { hanViet: 'NGUYỆN', meaning: 'Cầu mong, nhờ cậy, nguyện vọng' }
};

/**
 * Robust normalizer for Japanese Word objects coming from DB / API
 * Parses kanji, hiragana, romaji from w.en and w.ipa if missing
 */
export function normalizeJapaneseWord(w) {
    if (!w) return null;
    let kanji = (w.kanji || '').trim();
    let hiragana = (w.hiragana || '').trim();
    let romaji = (w.romaji || '').trim();

    // If kanji or hiragana is missing, extract from w.en (e.g., "親切(な) (しんせつ(な))" or "私 (わたし)")
    if ((!kanji || !hiragana) && w.en) {
        const raw = w.en.trim();
        if (raw.endsWith(')')) {
            let depth = 0;
            let splitIdx = -1;
            for (let i = raw.length - 1; i >= 0; i--) {
                if (raw[i] === ')') depth++;
                else if (raw[i] === '(') {
                    depth--;
                    if (depth === 0) {
                        splitIdx = i;
                        break;
                    }
                }
            }
            if (splitIdx > 0) {
                const p1 = raw.slice(0, splitIdx).trim();
                const p2 = raw.slice(splitIdx + 1, -1).trim();
                if (/[\u4e00-\u9faf]/.test(p1) || /[\u3040-\u309f\u30a0-\u30ff]/.test(p2)) {
                    kanji = kanji || p1;
                    hiragana = hiragana || p2;
                }
            }
        }
        if (!kanji && !hiragana) {
            if (/[\u4e00-\u9faf]/.test(raw)) kanji = raw;
            else hiragana = raw;
        }
    }

    // Extract romaji from w.ipa (e.g. "[shinsetsu(na)]" -> "shinsetsu(na)")
    if (!romaji && w.ipa) {
        romaji = w.ipa.replace(/^\[|\]$/g, '').trim();
    }

    const displayWord = kanji || hiragana || w.en || '';
    const displaySub = (kanji && hiragana && kanji !== hiragana) ? hiragana : (romaji || '');
    const speechText = hiragana || kanji || displayWord;

    return {
        ...w,
        kanji: kanji || (hiragana ? '' : displayWord),
        hiragana: hiragana || displayWord,
        romaji,
        displayWord,
        displaySub,
        speechText
    };
}

/**
 * Classify Part-of-speech (POS) of Japanese word
 */
function detectJapanesePOS(word) {
    if (!word) return 'noun';
    const cat = (word.category || '').toLowerCase();

    if (cat.includes('động từ') || cat.includes('verb') || cat.includes('(v)')) return 'verb';
    if (cat.includes('danh từ') || cat.includes('noun') || cat.includes('(n)')) return 'noun';
    if (cat.includes('tính từ') || cat.includes('adj')) {
        if (cat.includes('na') || cat.includes('(na)')) return 'adj_na';
        return 'adj_i';
    }
    if (cat.includes('phó từ') || cat.includes('trạng từ') || cat.includes('adv')) return 'adv';
    if (cat.includes('cụm') || cat.includes('thán') || cat.includes('liên kết') || cat.includes('thành ngữ') || cat.includes('hậu tố') || cat.includes('đại từ')) return 'collocation';

    // Heuristic fallbacks
    const h = (word.hiragana || word.displayWord || '').trim();
    if (h.endsWith('ます') || h.endsWith('る') || h.endsWith('う') || h.endsWith('く') || h.endsWith('す')) return 'verb';
    if (h.endsWith('い') && !h.endsWith('たい')) return 'adj_i';

    return 'noun';
}

const BRANCH_CONFIG = {
    verb: {
        title: 'Động từ (動詞)',
        color: '#9333ea',
        bgClass: 'bg-purple-600 hover:bg-purple-700 dark:bg-purple-600/90 dark:hover:bg-purple-500 text-white shadow-md shadow-purple-500/20 dark:shadow-purple-950/40 border-2 border-white dark:border-slate-800',
        badge: 'bg-purple-50 text-purple-700 border-purple-200/80 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/80',
        dot: 'bg-purple-500',
        accentBorder: 'border-l-purple-500',
        accentText: 'text-purple-600 dark:text-purple-400'
    },
    noun: {
        title: 'Danh từ (名詞)',
        color: '#16a34a',
        bgClass: 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600/90 dark:hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/20 dark:shadow-emerald-950/40 border-2 border-white dark:border-slate-800',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/80',
        dot: 'bg-emerald-500',
        accentBorder: 'border-l-emerald-500',
        accentText: 'text-emerald-600 dark:text-emerald-400'
    },
    adj_i: {
        title: 'Tính từ (形容詞)',
        color: '#d97706',
        bgClass: 'bg-amber-500 hover:bg-amber-600 dark:bg-amber-600/90 dark:hover:bg-amber-500 text-white shadow-md shadow-amber-500/20 dark:shadow-amber-950/40 border-2 border-white dark:border-slate-800',
        badge: 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/80',
        dot: 'bg-amber-500',
        accentBorder: 'border-l-amber-500',
        accentText: 'text-amber-600 dark:text-amber-400'
    },
    adv: {
        title: 'Phó từ & Cụm (副詞・連語)',
        color: '#e11d48',
        bgClass: 'bg-rose-600 hover:bg-rose-700 dark:bg-rose-600/90 dark:hover:bg-rose-500 text-white shadow-md shadow-rose-500/20 dark:shadow-rose-950/40 border-2 border-white dark:border-slate-800',
        badge: 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/80',
        dot: 'bg-rose-500',
        accentBorder: 'border-l-rose-500',
        accentText: 'text-rose-600 dark:text-rose-400'
    }
};

/**
 * Slide-over Panel for Word Details (Raycast style)
 */
const JapaneseWordDetailPanel = ({ word, clusterMembers = [], onSelectWord, speak, onClose }) => {
    if (!word) return null;

    const pos = detectJapanesePOS(word);
    const config = BRANCH_CONFIG[pos] || BRANCH_CONFIG.noun;

    // Extract all unique Kanji in this word
    const kanjiChars = useMemo(() => {
        if (!word) return [];
        const source = `${word.kanji || ''} ${word.displayWord || ''} ${word.en || ''}`;
        const matches = source.match(/[\u4e00-\u9faf]/g);
        if (!matches) return [];
        return Array.from(new Set(matches));
    }, [word]);

    return (
        <div className="w-full xl:w-96 shrink-0 bg-theme-surface rounded-3xl p-5 sm:p-6 border border-theme-subtle shadow-xl space-y-5 animate-fade-in text-theme-main select-text">
            {/* Header: Badge POS & Close button */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${config.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                        <span>{word.category || config.title}</span>
                    </span>
                    {word.sub_group && (
                        <span className="text-[11px] font-semibold text-theme-muted">
                            {word.sub_group}
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

            {/* Hero Word: Kanji / Furigana / Romaji */}
            <div className="space-y-2">
                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                    <div>
                        <h2 className="text-3xl sm:text-4xl font-black text-theme-main tracking-tight font-serif">
                            {word.displayWord}
                        </h2>
                        {word.displaySub && (
                            <span className="text-base font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-lg border border-rose-200/60 dark:border-rose-800/60 inline-block mt-1">
                                {word.displaySub}
                            </span>
                        )}
                    </div>
                </div>

                {word.romaji && (
                    <div className="text-xs font-mono font-medium text-theme-muted">
                        Romaji: <span className="text-theme-main font-semibold">[{word.romaji}]</span>
                    </div>
                )}

                {/* Primary Meaning in Vietnamese */}
                <p className="text-lg sm:text-xl font-bold text-theme-secondary leading-snug pt-1">
                    {word.vi}
                </p>

                {/* Pronunciation Button */}
                <div className="pt-2 flex items-center gap-2">
                    <button
                        onClick={() => speak(word.speechText || word.displayWord)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-rose-600/20 active:scale-95 group"
                    >
                        <Volume2 size={15} className="group-hover:scale-110 transition-transform" />
                        <span>Phát âm tiếng Nhật</span>
                    </button>
                </div>
            </div>

            {/* Section: Phân Tích Hán Tự (Kanji Breakdown) */}
            {kanjiChars.length > 0 && (
                <div className="rounded-2xl p-4 bg-theme-card border border-theme-subtle space-y-3 shadow-xs">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-theme-muted">
                        <Tag size={13} className="text-theme-muted" />
                        <span>Phân tích chữ Hán ({kanjiChars.length} Kanji)</span>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                        {kanjiChars.map((kc, idx) => {
                            const info = KANJI_KNOWLEDGE_BASE[kc];
                            return (
                                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-theme-subtle border border-theme-subtle">
                                    <div className="flex items-center gap-3">
                                        <span className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center text-xl font-black font-serif shadow-xs shrink-0">
                                            {kc}
                                        </span>
                                        <div>
                                            <div className="text-xs font-black text-theme-main">
                                                Âm Hán Việt: <span className="text-rose-600 dark:text-rose-400 uppercase">{info ? info.hanViet : 'Hán Tự'}</span>
                                            </div>
                                            <div className="text-[11px] text-theme-muted mt-0.5">
                                                {info ? info.meaning : 'Chữ Hán trong hệ thống Minna No Nihongo'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Context Card: Giáo trình Minna */}
            <div className="rounded-2xl p-4 bg-theme-card border border-theme-subtle space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-theme-main flex items-center gap-1.5">
                        <BookOpen size={14} className="text-emerald-500" />
                        <span>Chủ đề & Giáo trình</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-theme-muted text-theme-secondary font-bold">
                        Minna No Nihongo
                    </span>
                </div>
                <p className="text-xs text-theme-secondary leading-relaxed">
                    Từ vựng thuộc <strong className="text-theme-main font-bold">{word.sub_group || 'Bài học sơ cấp'}</strong>. Từ vựng cốt lõi thường gặp trong các kỳ thi JLPT N5 - N4 và giao tiếp hàng ngày.
                </p>
            </div>

            {/* Section: Từ Cùng Nhóm / Cùng Hán Tự */}
            {clusterMembers.length > 1 && (
                <div className="space-y-2.5 pt-1 border-t border-theme-subtle">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-theme-muted">
                            Từ vựng liên kết ({clusterMembers.length})
                        </span>
                        <span className="text-[10px] text-theme-muted">
                            Bấm để tra nhanh
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto custom-scrollbar pr-1">
                        {clusterMembers.map((m) => {
                            const isSelected = m.id === word.id || m.displayWord === word.displayWord;
                            const mPos = detectJapanesePOS(m);
                            const dotColor = BRANCH_CONFIG[mPos]?.dot || 'bg-slate-400';

                            return (
                                <button
                                    key={m.id || m.displayWord}
                                    onClick={() => onSelectWord && onSelectWord(m)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                                        isSelected
                                            ? 'bg-rose-600 text-white font-bold shadow-sm'
                                            : 'bg-theme-subtle hover:bg-theme-card text-theme-secondary border border-theme-subtle hover:border-rose-300'
                                    }`}
                                >
                                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
                                    <span className="truncate max-w-[130px] font-semibold">{m.displayWord}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * Main Japanese Related Words Mindmap Mode
 */
const JapaneseRelatedWordsMode = ({ japaneseWords = [], allWords = [], speak, onExit }) => {
    const [clusterMode, setClusterMode] = useState('kanji'); // 'kanji' | 'lesson'
    const [kanjiScope, setKanjiScope] = useState('all'); // 'all' (All 50 Lessons) | 'selected' (Current Selected Lesson)
    const [searchQuery, setSearchQuery] = useState('');
    const [activeClusterIndex, setActiveClusterIndex] = useState(0);
    const [selectedWord, setSelectedWord] = useState(null);
    const [viewMode, setViewMode] = useState('mindmap'); // 'mindmap' | 'grid'
    const [zoomLevel, setZoomLevel] = useState(1);
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);

    const scrollContainerRef = useRef(null);

    // Normalize all input words so that kanji, hiragana, displayWord, displaySub, speechText are guaranteed
    const normalizedSelectedWords = useMemo(() => {
        return (japaneseWords || []).map(normalizeJapaneseWord).filter(Boolean);
    }, [japaneseWords]);

    const normalizedAllWords = useMemo(() => {
        const pool = (allWords && allWords.length > 0) ? allWords : japaneseWords;
        return (pool || []).map(normalizeJapaneseWord).filter(Boolean);
    }, [allWords, japaneseWords]);

    // Choose word source for Kanji clustering based on scope
    const wordsForKanji = useMemo(() => {
        if (kanjiScope === 'selected' && normalizedSelectedWords.length > 0) {
            return normalizedSelectedWords;
        }
        return normalizedAllWords.length > 0 ? normalizedAllWords : normalizedSelectedWords;
    }, [kanjiScope, normalizedSelectedWords, normalizedAllWords]);

    // 1. Build Kanji Family Clusters (Group by common Kanji character >= 2 words)
    const kanjiClusters = useMemo(() => {
        const kanjiMap = new Map();

        wordsForKanji.forEach((w) => {
            if (!w) return;
            const sourceStr = `${w.kanji || ''} ${w.displayWord || ''} ${w.en || ''}`;
            const matches = sourceStr.match(/[\u4e00-\u9faf]/g);
            if (!matches) return;

            const uniqueKanjisInWord = Array.from(new Set(matches));
            uniqueKanjisInWord.forEach((k) => {
                if (!kanjiMap.has(k)) {
                    kanjiMap.set(k, []);
                }
                kanjiMap.get(k).push(w);
            });
        });

        const clusters = [];
        kanjiMap.forEach((members, kanjiChar) => {
            if (members.length < 2) return;

            // Deduplicate words in same cluster by displayWord
            const uniqueMembers = [];
            const seen = new Set();
            members.forEach((m) => {
                const key = m.displayWord || m.id;
                if (!seen.has(key)) {
                    seen.add(key);
                    uniqueMembers.push(m);
                }
            });

            if (uniqueMembers.length < 2) return;

            // Classify members into 4 branches
            const posGroups = {
                verb: uniqueMembers.filter(w => detectJapanesePOS(w) === 'verb'),
                noun: uniqueMembers.filter(w => detectJapanesePOS(w) === 'noun'),
                adj_i: uniqueMembers.filter(w => detectJapanesePOS(w) === 'adj_i' || detectJapanesePOS(w) === 'adj_na'),
                adv: uniqueMembers.filter(w => detectJapanesePOS(w) === 'adv' || detectJapanesePOS(w) === 'collocation')
            };

            const info = KANJI_KNOWLEDGE_BASE[kanjiChar];

            clusters.push({
                id: `kanji-${kanjiChar}`,
                type: 'kanji',
                title: kanjiChar,
                subtitle: info ? `${info.hanViet} (${info.meaning})` : 'Chữ Hán căn bản',
                hanViet: info ? info.hanViet : '',
                totalCount: uniqueMembers.length,
                allMembers: uniqueMembers,
                posGroups,
                rootItem: {
                    title: kanjiChar,
                    sub: info ? info.hanViet : '',
                    desc: info ? info.meaning : `${uniqueMembers.length} từ ghép`,
                    type: 'kanji'
                }
            });
        });

        // Sort by totalCount descending
        return clusters.sort((a, b) => b.totalCount - a.totalCount);
    }, [wordsForKanji]);

    // 2. Build Lesson POS Clusters (Group by Minna Lesson)
    const lessonClusters = useMemo(() => {
        const lessonMap = new Map();

        normalizedSelectedWords.forEach((w) => {
            const lessonKey = w.sub_group || (w.lesson ? `Bài ${String(w.lesson).padStart(2, '0')}` : 'Bài 01');
            if (!lessonMap.has(lessonKey)) {
                lessonMap.set(lessonKey, []);
            }
            lessonMap.get(lessonKey).push(w);
        });

        const clusters = [];
        lessonMap.forEach((members, lessonKey) => {
            if (members.length === 0) return;

            // Deduplicate
            const uniqueMembers = [];
            const seen = new Set();
            members.forEach((m) => {
                const key = m.displayWord || m.id;
                if (!seen.has(key)) {
                    seen.add(key);
                    uniqueMembers.push(m);
                }
            });

            const posGroups = {
                verb: uniqueMembers.filter(w => detectJapanesePOS(w) === 'verb'),
                noun: uniqueMembers.filter(w => detectJapanesePOS(w) === 'noun'),
                adj_i: uniqueMembers.filter(w => detectJapanesePOS(w) === 'adj_i' || detectJapanesePOS(w) === 'adj_na'),
                adv: uniqueMembers.filter(w => detectJapanesePOS(w) === 'adv' || detectJapanesePOS(w) === 'collocation')
            };

            clusters.push({
                id: `lesson-${lessonKey}`,
                type: 'lesson',
                title: lessonKey,
                subtitle: `Giáo trình Minna No Nihongo`,
                totalCount: uniqueMembers.length,
                allMembers: uniqueMembers,
                posGroups,
                rootItem: {
                    title: lessonKey,
                    sub: 'Minna No Nihongo',
                    desc: `${uniqueMembers.length} từ vựng`,
                    type: 'lesson'
                }
            });
        });

        // Sort naturally by lesson number (Bài 01 -> Bài 50)
        return clusters.sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true }));
    }, [normalizedSelectedWords]);

    // Active clusters based on current mode
    const activeClusters = clusterMode === 'kanji' ? kanjiClusters : lessonClusters;

    // Filter clusters by search query
    const filteredClusters = useMemo(() => {
        if (!searchQuery.trim()) return activeClusters;
        const q = searchQuery.toLowerCase().trim();

        return activeClusters.filter((c) => {
            const titleMatch = c.title.toLowerCase().includes(q);
            const subMatch = c.subtitle && c.subtitle.toLowerCase().includes(q);
            const hanVietMatch = c.hanViet && c.hanViet.toLowerCase().includes(q);
            const memberMatch = c.allMembers.some(
                (m) =>
                    (m.displayWord && m.displayWord.toLowerCase().includes(q)) ||
                    (m.displaySub && m.displaySub.toLowerCase().includes(q)) ||
                    (m.vi && m.vi.toLowerCase().includes(q)) ||
                    (m.romaji && m.romaji.toLowerCase().includes(q))
            );
            return titleMatch || subMatch || hanVietMatch || memberMatch;
        });
    }, [activeClusters, searchQuery]);

    const currentCluster = filteredClusters[activeClusterIndex] || filteredClusters[0] || null;

    // Default select first word in cluster
    useEffect(() => {
        if (currentCluster && currentCluster.allMembers.length > 0) {
            setSelectedWord(currentCluster.allMembers[0]);
        }
    }, [currentCluster]);

    // Reset cluster index when mode changes
    useEffect(() => {
        setActiveClusterIndex(0);
    }, [clusterMode, kanjiScope]);

    // Auto-center canvas on cluster change
    useEffect(() => {
        if (scrollContainerRef.current) {
            const el = scrollContainerRef.current;
            const targetLeft = Math.max(0, (520 * zoomLevel) - (el.clientWidth / 2));
            const targetTop = Math.max(0, (340 * zoomLevel) - (el.clientHeight / 2));
            el.scrollTo({
                left: targetLeft,
                top: targetTop,
                behavior: 'smooth'
            });
        }
    }, [currentCluster, zoomLevel]);

    // Speak helper for Japanese
    const handleSpeakJapanese = (text) => {
        if (speak && text) {
            speak(text, 0.85, 'ja-JP');
        }
    };

    // Canvas layout coordinates (centered & balanced)
    const CANVAS_W = 1040;
    const CANVAS_H = 680;
    const CENTER_X = 520;
    const CENTER_Y = 340;

    // 4 Quadrants configuration:
    // Top-Left: Verb (Purple)
    // Bottom-Left: Noun (Green)
    // Top-Right: Adj (Yellow)
    // Bottom-Right: Adv / Collocation (Rose)
    const activeBranches = useMemo(() => {
        if (!currentCluster) return [];
        return [
            {
                key: 'verb',
                group: currentCluster.posGroups.verb || [],
                side: 'left',
                mainX: 350,
                mainY: 190,
                leafBaseX: 170,
                startY: 100,
                stepY: 52,
                config: BRANCH_CONFIG.verb
            },
            {
                key: 'noun',
                group: currentCluster.posGroups.noun || [],
                side: 'left',
                mainX: 350,
                mainY: 490,
                leafBaseX: 170,
                startY: 400,
                stepY: 52,
                config: BRANCH_CONFIG.noun
            },
            {
                key: 'adj_i',
                group: currentCluster.posGroups.adj_i || [],
                side: 'right',
                mainX: 690,
                mainY: 190,
                leafBaseX: 870,
                startY: 100,
                stepY: 52,
                config: BRANCH_CONFIG.adj_i
            },
            {
                key: 'adv',
                group: currentCluster.posGroups.adv || [],
                side: 'right',
                mainX: 690,
                mainY: 490,
                leafBaseX: 870,
                startY: 400,
                stepY: 52,
                config: BRANCH_CONFIG.adv
            }
        ];
    }, [currentCluster]);

    if (!normalizedSelectedWords || normalizedSelectedWords.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-theme-muted bg-theme-surface rounded-3xl border border-theme-subtle">
                <p>Không có từ vựng tiếng Nhật nào để vẽ sơ đồ tư duy.</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-16 select-none">
            {/* Header Control Panel */}
            <div className="bg-theme-surface text-theme-main p-5 sm:p-7 rounded-3xl border border-theme-subtle shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 w-full md:w-auto">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-amber-500 text-white flex items-center justify-center font-black shadow-md shrink-0 text-xl font-serif">
                        漢
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-extrabold tracking-wider uppercase text-rose-600 bg-rose-50 border border-rose-200 dark:text-rose-400 dark:bg-rose-950/80 dark:border-rose-800/70 px-2.5 py-0.5 rounded-md">
                                Sơ Đồ Tư Duy Tiếng Nhật
                            </span>
                            <span className="text-xs text-theme-muted">
                                {filteredClusters.length} nhóm liên kết
                            </span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-theme-main mt-0.5">
                            {clusterMode === 'kanji' ? 'Mạng Lưới Chữ Hán Gốc (Kanji Family)' : 'Cấu Trúc Từ Vựng Theo Bài Học Minna'}
                        </h2>
                    </div>
                </div>

                {/* Mode Selector & Controls */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
                    {/* Switch Mode: Kanji vs Lesson */}
                    <div className="flex items-center p-1 bg-theme-subtle rounded-2xl border border-theme-subtle">
                        <button
                            onClick={() => {
                                setClusterMode('kanji');
                                setViewMode('mindmap');
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                clusterMode === 'kanji'
                                    ? 'bg-rose-600 text-white shadow-sm'
                                    : 'text-theme-secondary hover:text-theme-main'
                            }`}
                        >
                            <Sparkles size={14} />
                            <span>Theo Chữ Hán</span>
                        </button>
                        <button
                            onClick={() => {
                                setClusterMode('lesson');
                                setViewMode('mindmap');
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                clusterMode === 'lesson'
                                    ? 'bg-rose-600 text-white shadow-sm'
                                    : 'text-theme-secondary hover:text-theme-main'
                            }`}
                        >
                            <BookOpen size={14} />
                            <span>Theo Bài Học</span>
                        </button>
                    </div>

                    {/* Scope toggle for Kanji mode (All 50 lessons vs Selected lesson) */}
                    {clusterMode === 'kanji' && (
                        <div className="flex items-center p-1 bg-theme-subtle rounded-2xl border border-theme-subtle">
                            <button
                                onClick={() => setKanjiScope('all')}
                                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                    kanjiScope === 'all'
                                        ? 'bg-theme-card text-rose-600 dark:text-rose-400 shadow-xs border border-theme-subtle'
                                        : 'text-theme-muted hover:text-theme-main'
                                }`}
                                title="Gom cụm Kanji trên toàn bộ 50 bài Minna"
                            >
                                <Globe size={13} />
                                <span>Tất cả bài</span>
                            </button>
                            <button
                                onClick={() => setKanjiScope('selected')}
                                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                    kanjiScope === 'selected'
                                        ? 'bg-theme-card text-rose-600 dark:text-rose-400 shadow-xs border border-theme-subtle'
                                        : 'text-theme-muted hover:text-theme-main'
                                }`}
                                title="Gom cụm Kanji trong các bài bạn đang lọc"
                            >
                                <BookMarked size={13} />
                                <span>Bài đang lọc</span>
                            </button>
                        </div>
                    )}

                    {/* Search Input */}
                    <div className="relative w-full sm:w-52">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setActiveClusterIndex(0);
                            }}
                            placeholder={clusterMode === 'kanji' ? 'Tìm Hán tự (学, 人, 食)...' : 'Tìm bài (Bài 01)...'}
                            className="w-full pl-8 pr-3 py-2 bg-theme-subtle hover:bg-theme-card focus:bg-theme-surface border border-theme-subtle rounded-xl text-xs text-theme-main placeholder:text-theme-faint focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                        />
                    </div>

                    {/* Pagination buttons */}
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setActiveClusterIndex((prev) => Math.max(0, prev - 1))}
                            disabled={activeClusterIndex === 0}
                            className="p-2 rounded-xl bg-theme-subtle hover:opacity-85 disabled:opacity-30 text-theme-main border border-theme-subtle transition-all cursor-pointer"
                            title="Nhóm trước"
                        >
                            <ChevronLeft size={18} />
                        </button>

                        <span className="text-xs font-mono font-bold px-3 py-1.5 bg-theme-card rounded-xl border border-theme-subtle text-rose-600 dark:text-amber-300">
                            {filteredClusters.length > 0 ? activeClusterIndex + 1 : 0}/{filteredClusters.length}
                        </span>

                        <button
                            onClick={() => setActiveClusterIndex((prev) => Math.min(filteredClusters.length - 1, prev + 1))}
                            disabled={activeClusterIndex >= filteredClusters.length - 1}
                            className="p-2 rounded-xl bg-theme-subtle hover:opacity-85 disabled:opacity-30 text-theme-main border border-theme-subtle transition-all cursor-pointer"
                            title="Nhóm tiếp theo"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>

                    {/* View Mode toggle button */}
                    <button
                        onClick={() => setViewMode(viewMode === 'mindmap' ? 'grid' : 'mindmap')}
                        className="px-3.5 py-2 rounded-xl bg-theme-subtle hover:opacity-85 border border-theme-subtle text-xs font-bold text-theme-main flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                        {viewMode === 'mindmap' ? <Grid3X3 size={14} /> : <Compass size={14} />}
                        <span>{viewMode === 'mindmap' ? 'Duyệt lưới' : 'Xem Mindmap'}</span>
                    </button>
                </div>
            </div>

            {/* Quick Strip Selector */}
            {filteredClusters.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                    <span className="text-xs font-bold text-theme-muted shrink-0 uppercase tracking-wider">
                        {clusterMode === 'kanji' ? 'Hán tự nhanh:' : 'Bài học nhanh:'}
                    </span>
                    {filteredClusters.slice(0, 24).map((c, idx) => (
                        <button
                            key={c.id}
                            onClick={() => {
                                setActiveClusterIndex(idx);
                                setViewMode('mindmap');
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                                idx === activeClusterIndex
                                    ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md shadow-rose-500/20 ring-2 ring-rose-200 dark:ring-rose-900/60'
                                    : 'bg-theme-surface hover:bg-theme-card text-theme-secondary border border-theme-subtle hover:border-rose-300 shadow-xs'
                            }`}
                        >
                            {clusterMode === 'kanji' ? (
                                <>
                                    <span className="font-serif font-black text-sm">{c.title}</span>
                                    {c.hanViet && <span className="opacity-80 text-[10px] font-mono">({c.hanViet})</span>}
                                </>
                            ) : (
                                <span>{c.title}</span>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* VIEW MODE 1: ORGANIC RADIAL MINDMAP */}
            {viewMode === 'mindmap' && currentCluster && (
                <div className="flex flex-col xl:flex-row items-start gap-6">
                    {/* Interactive Canvas Frame */}
                    <div className="flex-1 min-w-0 w-full bg-slate-50/70 dark:bg-slate-900/90 rounded-[2.5rem] p-4 sm:p-6 border border-theme-subtle shadow-xl relative overflow-hidden">
                        {/* Canvas Zoom Controls */}
                        <div className="absolute top-6 right-6 z-30 flex items-center gap-1.5 bg-theme-surface/95 backdrop-blur-md p-1.5 rounded-2xl border border-theme-subtle shadow-md">
                            <button
                                onClick={() => setZoomLevel((prev) => Math.min(1.4, Number((prev + 0.1).toFixed(1))))}
                                className="p-1.5 rounded-xl hover:bg-theme-subtle text-theme-main transition-colors cursor-pointer"
                                title="Phóng to"
                            >
                                <ZoomIn size={16} />
                            </button>
                            <span className="text-xs font-mono font-bold px-1 text-theme-secondary">
                                {Math.round(zoomLevel * 100)}%
                            </span>
                            <button
                                onClick={() => setZoomLevel((prev) => Math.max(0.7, Number((prev - 0.1).toFixed(1))))}
                                className="p-1.5 rounded-xl hover:bg-theme-subtle text-theme-main transition-colors cursor-pointer"
                                title="Thu nhỏ"
                            >
                                <ZoomOut size={16} />
                            </button>
                            <button
                                onClick={() => setZoomLevel(1)}
                                className="p-1.5 rounded-xl hover:bg-theme-subtle text-theme-main transition-colors cursor-pointer"
                                title="Đặt lại zoom"
                            >
                                <RotateCcw size={16} />
                            </button>
                        </div>

                        {/* Viewport Box (Block scroll container without clipping justify-center) */}
                        <div
                            ref={scrollContainerRef}
                            className="w-full h-[640px] sm:h-[700px] overflow-auto custom-scrollbar relative bg-white dark:bg-slate-950 rounded-[2rem] border border-theme-subtle"
                        >
                            <div
                                style={{
                                    width: `${CANVAS_W}px`,
                                    height: `${CANVAS_H}px`,
                                    margin: '0 auto',
                                    transform: `scale(${zoomLevel})`,
                                    transformOrigin: 'top center',
                                    transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                                    position: 'relative'
                                }}
                                className="select-none shrink-0"
                            >
                                {/* SVG Bezier Connections */}
                                <svg
                                    width={CANVAS_W}
                                    height={CANVAS_H}
                                    className="absolute inset-0 pointer-events-none z-10"
                                >
                                    <defs>
                                        <marker
                                            id="mindmap-arrow-ja"
                                            viewBox="0 0 10 10"
                                            refX="6"
                                            refY="5"
                                            markerWidth="5"
                                            markerHeight="5"
                                            orient="auto-start-reverse"
                                        >
                                            <path d="M 0 1 L 9 5 L 0 9 z" className="fill-slate-400 dark:fill-slate-600" />
                                        </marker>
                                    </defs>

                                    {activeBranches.map((b) => {
                                        if (b.group.length === 0) return null;

                                        const cpX = (CENTER_X + b.mainX) / 2;
                                        const cpY = (CENTER_Y + b.mainY) / 2;
                                        const mainPath = `M ${CENTER_X} ${CENTER_Y} Q ${cpX} ${cpY}, ${b.mainX} ${b.mainY}`;

                                        const leafPaths = b.group.slice(0, 5).map((_, idx) => {
                                            const leafY = b.startY + idx * b.stepY;
                                            const lCpX = (b.mainX + b.leafBaseX) / 2;
                                            return `M ${b.mainX} ${b.mainY} C ${lCpX} ${b.mainY}, ${lCpX} ${leafY}, ${b.leafBaseX} ${leafY}`;
                                        });

                                        return (
                                            <g key={b.key}>
                                                <path
                                                    d={mainPath}
                                                    fill="none"
                                                    className="stroke-slate-400/80 dark:stroke-slate-600/80"
                                                    strokeWidth="2.5"
                                                    strokeLinecap="round"
                                                    markerEnd="url(#mindmap-arrow-ja)"
                                                />
                                                {leafPaths.map((lp, lIdx) => (
                                                    <path
                                                        key={lIdx}
                                                        d={lp}
                                                        fill="none"
                                                        className="stroke-slate-300 dark:stroke-slate-700"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        markerEnd="url(#mindmap-arrow-ja)"
                                                    />
                                                ))}
                                            </g>
                                        );
                                    })}
                                </svg>

                                {/* Center Root Orb */}
                                <div
                                    style={{
                                        position: 'absolute',
                                        left: `${CENTER_X - 56}px`,
                                        top: `${CENTER_Y - 56}px`,
                                        width: '112px',
                                        height: '112px'
                                    }}
                                    onClick={() => {
                                        if (currentCluster.allMembers[0]) {
                                            setSelectedWord(currentCluster.allMembers[0]);
                                            setIsSidePanelOpen(true);
                                            handleSpeakJapanese(currentCluster.allMembers[0].speechText || currentCluster.allMembers[0].displayWord);
                                        }
                                    }}
                                    className="rounded-full bg-gradient-to-br from-rose-500 via-red-500 to-rose-600 dark:from-rose-600 dark:via-red-600 dark:to-rose-700 text-white p-3 shadow-2xl shadow-rose-500/30 dark:shadow-rose-950/80 border-2 border-white dark:border-slate-800 ring-4 ring-rose-100 dark:ring-rose-950/50 flex flex-col items-center justify-center text-center cursor-pointer group hover:scale-105 active:scale-95 transition-all duration-300 z-20"
                                    title="Gốc liên kết - Bấm để xem chi tiết"
                                >
                                    <h3 className="font-black text-xl sm:text-2xl leading-tight font-serif truncate max-w-full px-1">
                                        {currentCluster.rootItem.title}
                                    </h3>
                                    {currentCluster.rootItem.sub && (
                                        <span className="text-[11px] font-mono text-rose-100 font-bold uppercase truncate max-w-full px-1">
                                            {currentCluster.rootItem.sub}
                                        </span>
                                    )}
                                    <p className="text-[10px] text-rose-100/90 truncate max-w-full px-1 font-medium mt-0.5">
                                        {currentCluster.rootItem.desc}
                                    </p>
                                </div>

                                {/* 4 Main Branches & Leaf Nodes */}
                                {activeBranches.map((b) => {
                                    if (b.group.length === 0) return null;

                                    return (
                                        <React.Fragment key={`nodes-${b.key}`}>
                                            {/* Branch Pill Node */}
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    left: `${b.mainX - 75}px`,
                                                    top: `${b.mainY - 20}px`,
                                                    width: '150px',
                                                    height: '40px'
                                                }}
                                                className={`rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-800 z-20 cursor-default select-none ${b.config.bgClass}`}
                                            >
                                                {b.config.title} ({b.group.length})
                                            </div>

                                            {/* Individual Leaf Words */}
                                            {b.group.slice(0, 5).map((w, idx) => {
                                                const leafY = b.startY + idx * b.stepY;
                                                const isSelected = selectedWord?.id === w.id || selectedWord?.displayWord === w.displayWord;

                                                return (
                                                    <div
                                                        key={w.id || w.displayWord || idx}
                                                        style={{
                                                            position: 'absolute',
                                                            left: `${b.leafBaseX - 75}px`,
                                                            top: `${leafY - 19}px`,
                                                            width: '150px',
                                                            height: '38px'
                                                        }}
                                                        onClick={() => {
                                                            setSelectedWord(w);
                                                            setIsSidePanelOpen(true);
                                                            handleSpeakJapanese(w.speechText || w.displayWord);
                                                        }}
                                                        className={`rounded-2xl font-bold text-xs px-3 flex items-center justify-between gap-1 shadow-md border-2 border-white dark:border-slate-800 transition-all duration-200 cursor-pointer z-20 group/leaf ${b.config.bgClass} ${
                                                            isSelected ? 'ring-4 ring-slate-900 dark:ring-white scale-105 shadow-xl' : 'hover:scale-105'
                                                        }`}
                                                        title={`${w.displayWord}${w.displaySub ? ` (${w.displaySub})` : ''}: ${w.vi}`}
                                                    >
                                                        <div className="truncate flex-1 text-left">
                                                            <span className="font-serif font-black tracking-wide">{w.displayWord}</span>
                                                            {w.displaySub && (
                                                                <span className="text-[10px] opacity-90 block leading-tight truncate">
                                                                    {w.displaySub}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <Volume2 size={13} className="opacity-75 group-hover/leaf:opacity-100 shrink-0" />
                                                    </div>
                                                );
                                            })}
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right-side Detail Card */}
                    {isSidePanelOpen && selectedWord && (
                        <JapaneseWordDetailPanel
                            word={selectedWord}
                            clusterMembers={currentCluster?.allMembers || []}
                            onSelectWord={(w) => {
                                setSelectedWord(w);
                                handleSpeakJapanese(w.speechText || w.displayWord);
                            }}
                            speak={handleSpeakJapanese}
                            onClose={() => setIsSidePanelOpen(false)}
                        />
                    )}
                </div>
            )}

            {/* VIEW MODE 2: OVERVIEW GRID LIST */}
            {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredClusters.map((clusterItem, cIdx) => (
                        <div
                            key={clusterItem.id}
                            onClick={() => {
                                setActiveClusterIndex(cIdx);
                                setViewMode('mindmap');
                            }}
                            className="p-5 rounded-3xl bg-theme-surface border border-theme-subtle hover:border-rose-500 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md">
                                        {clusterMode === 'kanji' ? `Hán tự: ${clusterItem.title}` : clusterItem.title}
                                    </span>
                                    <span className="text-xs text-theme-muted font-semibold">
                                        {clusterItem.totalCount} từ ghép
                                    </span>
                                </div>

                                <h4 className="text-2xl font-black text-theme-main group-hover:text-rose-500 transition-colors font-serif">
                                    {clusterItem.title}
                                </h4>
                                <p className="text-xs text-theme-secondary mt-1 font-medium">
                                    {clusterItem.subtitle}
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
                                    {clusterItem.posGroups.adj_i.length > 0 && (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                                            {clusterItem.posGroups.adj_i.length} Tính từ
                                        </span>
                                    )}
                                    {clusterItem.posGroups.adv.length > 0 && (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                                            {clusterItem.posGroups.adv.length} Phó từ
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="mt-5 pt-3 border-t border-theme-subtle flex items-center justify-between text-xs font-bold text-rose-600 dark:text-rose-400">
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

export default JapaneseRelatedWordsMode;
