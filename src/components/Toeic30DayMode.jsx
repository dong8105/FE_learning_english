import React, { useState, useEffect, useRef } from 'react';
import { 
    Calendar, Trophy, BookOpen, Volume2, Sparkles, 
    CheckCircle2, ArrowLeft, ArrowRight, Play, RefreshCw, 
    HelpCircle, XCircle, Award, Layers, Star, Zap, Edit, 
    BookOpenCheck, LayoutGrid, Check 
} from 'lucide-react';
import { toast } from 'react-toastify';
import { TOEIC_30_DAYS_CURRICULUM } from '../data/toeic30DaysData';

// Import sub-modes to run inside day workspace
import FlashcardMode from './FlashcardMode';
import QuizMode from './QuizMode';
import TypingMode from './TypingMode';
import GrammarMode from './GrammarMode';
import { useAiStatus } from "./AiStatusProvider";
import { useAuth } from '../context/AuthContext';

const STATIC_EXAMPLE_TRANSLATIONS = {
    "The meeting is scheduled for Monday.": "Cuộc họp được lên lịch vào thứ Hai.",
    "Please submit before the deadline.": "Vui lòng nộp trước hạn chót.",
    "She submitted the monthly report.": "Cô ấy đã nộp báo cáo hàng tháng.",
    "Which department do you work in?": "Bạn làm việc ở phòng ban nào?",
    "All employees must attend the training.": "Tất cả nhân viên phải tham gia buổi đào tạo.",
    "The manager approved the budget.": "Quản lý đã phê duyệt ngân sách.",
    "Contact your supervisor for approval.": "Liên hệ với người giám sát của bạn để được phê duyệt.",
    "My colleagues are very supportive.": "Đồng nghiệp của tôi rất biết hỗ trợ.",
    "The headquarters is in New York.": "Trụ sở chính ở New York.",
    "We have branches in 10 cities.": "Chúng tôi có chi nhánh ở 10 thành phố.",
    "Your order has been confirmed.": "Đơn hàng của bạn đã được xác nhận.",
    "She purchased 3 units online.": "Cô ấy đã mua 3 sản phẩm trực tuyến.",
    "Keep your receipt for returns.": "Hãy giữ lại biên lai để đổi trả hàng.",
    "The invoice was sent by email.": "Hóa đơn đã được gửi qua email.",
    "Members receive a 10% discount.": "Thành viên được giảm giá 10%.",
    "Request a refund within 30 days.": "Yêu cầu hoàn tiền trong vòng 30 ngày.",
    "Exchanges are allowed within 14 days.": "Cho phép đổi hàng trong vòng 14 ngày.",
    "Free delivery on orders over $50.": "Giao hàng miễn phí cho đơn hàng trên $50.",
    "The shipment arrived this morning.": "Lô hàng đã đến vào sáng nay.",
    "This item is out of stock.": "Mặt hàng này đã hết hàng.",
    "The flight departs at 7 AM.": "Chuyến bay cất cánh lúc 7 giờ sáng.",
    "Check departure time at Gate B3.": "Kiểm tra giờ khởi hành tại Cổng B3.",
    "Estimated arrival is 3 PM.": "Thời gian đến dự kiến là 3 giờ chiều.",
    "Boarding begins 30 minutes before.": "Việc lên máy bay bắt đầu trước 30 phút.",
    "I'd like to make a reservation.": "Tôi muốn đặt chỗ trước.",
    "Accommodation is included in the package.": "Chỗ ở đã được bao gồm trong gói dịch vụ.",
    "The travel itinerary has been confirmed.": "Lịch trình chuyến đi đã được xác nhận.",
    "No extra baggage fees.": "Không tính thêm phí hành lý.",
    "Declare items at customs.": "Khai báo hàng hóa tại hải quan.",
    "A valid passport is required.": "Yêu cầu hộ chiếu còn hiệu lực.",
    "The annual budget was approved.": "Ngân sách hàng năm đã được phê duyệt.",
    "Track all business expenses carefully.": "Theo dõi cẩn thận tất cả các chi phí kinh doanh.",
    "Revenue grew by 15% last year.": "Doanh thu tăng 15% vào năm ngoái.",
    "The company made a significant profit.": "Công ty đã đạt được mức lợi nhuận đáng kể.",
    "The firm reported a net loss.": "Công ty báo cáo khoản lỗ ròng.",
    "Long-term investment yields better returns.": "Đầu tư dài hạn mang lại lợi nhuận tốt hơn.",
    "Apply for a business loan online.": "Đăng ký khoản vay kinh doanh trực tuyến.",
    "The interest rate is 5% annually.": "Lãi suất là 5% mỗi năm.",
    "File your tax returns by April 15.": "Nộp tờ khai thuế trước ngày 15 tháng 4.",
    "Check your account balance online.": "Kiểm tra số dư tài khoản của bạn trực tuyến.",
    "I have a dentist appointment at 2 PM.": "Tôi có một cuộc hẹn với nha sĩ lúc 2 giờ chiều.",
    "The clinic is open from Monday to Saturday.": "Phòng khám mở cửa từ thứ Hai đến thứ Bảy.",
    "The pharmacist filled my prescription.": "Dược sĩ đã bốc thuốc theo đơn của tôi.",
    "Headache is a common symptom of flu.": "Đau đầu là một triệu chứng phổ biến của bệnh cúm.",
    "The doctor suggested a new treatment.": "Bác sĩ đã đề xuất một phương pháp điều trị mới.",
    "The doctor is examining the patient.": "Bác sĩ đang khám cho bệnh nhân.",
    "Does your insurance cover this surgery?": "Bảo hiểm của bạn có chi trả cho ca phẫu thuật này không?",
    "The physician will examine you now.": "Bác sĩ sẽ khám cho bạn bây giờ.",
    "It took him a week to recover from the cold.": "Anh ấy mất một tuần để bình phục sau trận cảm lạnh.",
    "Take this medication after meals.": "Uống thuốc này sau bữa ăn.",
    "Please notify us of any changes.": "Vui lòng thông báo cho chúng tôi về bất kỳ thay đổi nào.",
    "The meeting was postponed to Thursday.": "Cuộc họp đã được hoãn lại sang thứ Năm.",
    "The event was canceled due to bad weather.": "Sự kiện đã bị hủy do thời tiết xấu.",
    "Follow the company policy at all times.": "Luôn luôn tuân thủ chính sách của công ty.",
    "The procedure has been updated.": "Quy trình đã được cập nhật.",
    "We are recruiting for 5 positions.": "Chúng tôi đang tuyển dụng cho 5 vị trí.",
    "Submit your application by Friday.": "Nộp đơn ứng tuyển của bạn trước thứ Sáu.",
    "Send your resume to HR.": "Gửi CV/sơ yếu lý lịch của bạn cho bộ phận nhân sự.",
    "The interview is on Wednesday.": "Buổi phỏng vấn diễn ra vào thứ Tư.",
    "We hired 10 new employees.": "Chúng tôi đã thuê 10 nhân viên mới.",
    "We have an opening for this position.": "Chúng tôi có một vị trí đang tuyển cho công việc này.",
    "There is a vacancy in accounting.": "Có một vị trí còn trống ở bộ phận kế toán.",
    "Strong qualifications required.": "Yêu cầu năng lực chuyên môn tốt.",
    "Competitive salary offered.": "Mức lương cạnh tranh được đề xuất.",
    "Benefits include health insurance.": "Các phúc lợi bao gồm bảo hiểm y tế.",
    "A 3-month probation period applies.": "Áp dụng thời gian thử việc 3 tháng.",
    "She will retire at the end of the year.": "Cô ấy sẽ nghỉ hưu vào cuối năm nay.",
    "Please provide two references.": "Vui lòng cung cấp hai người tham khảo.",
    "Onboarding begins your first day.": "Quy trình hội nhập bắt đầu vào ngày đầu tiên của bạn.",
    "We rented a small office space.": "Chúng tôi đã thuê một không gian văn phòng nhỏ.",
    "The lease expires next month.": "Hợp đồng thuê sẽ hết hạn vào tháng tới.",
    "The property is located downtown.": "Bất động sản này nằm ở trung tâm thành phố.",
    "The landlord agreed to repair the roof.": "Chủ nhà đã đồng ý sửa mái nhà.",
    "The tenant must pay rent on the first day.": "Người thuê nhà phải trả tiền thuê vào ngày đầu tiên.",
    "We are looking for a convenient location.": "Chúng tôi đang tìm kiếm một địa điểm thuận tiện.",
    "They renovated the kitchen last year.": "Họ đã cải tạo nhà bếp vào năm ngoái.",
    "He sublet his room during the summer.": "Anh ấy đã cho thuê lại phòng của mình trong suốt mùa hè.",
    "We paid a deposit of one month rent.": "Chúng tôi đã trả tiền đặt cọc bằng một tháng tiền thuê.",
    "Inspect the house before buying.": "Hãy kiểm tra kỹ ngôi nhà trước khi mua.",
    "Water and electricity are utilities.": "Nước và điện là các dịch vụ tiện ích.",
    "The apartment is fully furnished.": "Căn hộ đã được trang bị đầy đủ đồ đạc sẵn.",
    "The chef prepared a special dish.": "Đầu bếp đã chuẩn bị một món ăn đặc biệt.",
    "May I see the menu, please?": "Tôi có thể xem thực đơn được không?",
    "Beer and soda are popular beverages.": "Bia và nước ngọt là những đồ uống phổ biến.",
    "We made a reservation for four.": "Chúng tôi đã đặt chỗ cho bốn người.",
    "The food is good but the service is slow.": "Thức ăn ngon nhưng sự phục vụ thì chậm.",
    "Leave a tip for the waiter.": "Hãy để lại tiền boa cho người phục vụ.",
    "Mix all the ingredients in a bowl.": "Trộn tất cả các nguyên liệu trong một cái tô.",
    "This chocolate cake is delicious.": "Bánh sô-cô-la này thật ngon miệng.",
    "She runs a catering business.": "Cô ấy điều hành một doanh nghiệp dịch vụ ăn uống.",
    "Read restaurant reviews before going.": "Đọc nhận xét về nhà hàng trước khi đi.",
    "We ordered appetizers first.": "Chúng tôi đã gọi các món khai vị trước.",
    "Fish is my favorite entree.": "Cá là món chính yêu thích của tôi.",
    "Follow the recipe to cook this.": "Hãy làm theo công thức để nấu món này."
};

const Toeic30DayMode = ({ words = [], speak }) => {
    const { reportAiUsage } = useAiStatus();

    const [progress, setProgress] = useState({});
    const [scores, setScores] = useState({});
    const [streak, setStreak] = useState(0);
    const [selectedDay, setSelectedDay] = useState(null);
    const [activeTab, setActiveTab] = useState('theory'); // theory, vocab, practice
    const [loadingQuiz, setLoadingQuiz] = useState(false);
    const [quizData, setQuizData] = useState(null);
    const [userAnswers, setUserAnswers] = useState({});
    const [showQuizResults, setShowQuizResults] = useState(false);
    const [quizScore, setQuizScore] = useState(0);
    const [playingAudio, setPlayingAudio] = useState(false);

    // Day Vocabulary Sub-modes
    const [vocabSubTab, setVocabSubTab] = useState('list'); // list, context
    const [vocabPartIndices, setVocabPartIndices] = useState([-1]); // [-1] means "Tất cả", or array like [0, 1]
    const [activeVocabStudyMode, setActiveVocabStudyMode] = useState(null); // null, flashcards, quiz, typing
    const [contextIndex, setContextIndex] = useState(0);
    const [typedSentence, setTypedSentence] = useState('');
    const [typedChecked, setTypedChecked] = useState(false);
    const [hasWrittenOnPaper, setHasWrittenOnPaper] = useState({}); // { [wordSpelling]: boolean }
    const inputRef = useRef(null);

    const [showGrammarDrill, setShowGrammarDrill] = useState(false);

    // Load progress and streak from localStorage (isolated per user) & sync with MySQL
    useEffect(() => {
        const storedProgress = localStorage.getItem(PROGRESS_KEY);
        const storedScores = localStorage.getItem(SCORES_KEY);
        setProgress(storedProgress ? JSON.parse(storedProgress) : {});
        setScores(storedScores ? JSON.parse(storedScores) : {});

        const savedStreak = localStorage.getItem(STREAK_KEY) || '0';
        setStreak(parseInt(savedStreak, 10));

        // Sync with backend database if user is logged in
        if (token) {
            fetch('http://localhost:5000/api/progress/toeic30', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(res => res.ok ? res.json() : null)
            .then(resData => {
                if (resData && resData.data) {
                    const serverProgress = resData.data.progress || {};
                    const serverScores = resData.data.scores || {};
                    const serverStreak = resData.data.streak || 0;

                    setProgress(prev => {
                        const merged = { ...prev, ...serverProgress };
                        localStorage.setItem(PROGRESS_KEY, JSON.stringify(merged));
                        return merged;
                    });
                    setScores(prev => {
                        const merged = { ...prev, ...serverScores };
                        localStorage.setItem(SCORES_KEY, JSON.stringify(merged));
                        return merged;
                    });
                    if (serverStreak > 0) {
                        setStreak(serverStreak);
                        localStorage.setItem(STREAK_KEY, serverStreak.toString());
                    }
                }
            })
            .catch(() => {});
        }
    }, [user?.id, token, PROGRESS_KEY, SCORES_KEY, STREAK_KEY]);

    // Reset slide contextual training state when day or sub-tab changes
    useEffect(() => {
        setContextIndex(0);
        setTypedSentence('');
        setTypedChecked(false);
    }, [selectedDay, vocabSubTab, vocabPartIndices]);

    useEffect(() => {
        setTypedSentence('');
        setTypedChecked(false);
        if (inputRef.current) {
            inputRef.current.focus();
        }

        if (selectedDay && vocabSubTab === 'context') {
            const currentDayWords = getFilteredWords(selectedDay);
            if (currentDayWords && currentDayWords[contextIndex] && currentDayWords[contextIndex].example) {
                // Thêm độ trễ nhỏ để trải nghiệm mượt mà hơn khi vừa chuyển slide
                setTimeout(() => {
                    speak(currentDayWords[contextIndex].example, null, 'en-US');
                }, 300);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contextIndex, selectedDay, vocabSubTab]);

    // Save progress to user-scoped localStorage & sync to MySQL
    const saveProgress = (dayNum, isCompleted, quizScoreStr = null) => {
        const newProgress = { ...progress, [dayNum]: isCompleted };
        setProgress(newProgress);
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(newProgress));

        let updatedScores = scores;
        if (quizScoreStr) {
            updatedScores = { ...scores, [dayNum]: quizScoreStr };
            setScores(updatedScores);
            localStorage.setItem(SCORES_KEY, JSON.stringify(updatedScores));
        }

        // Update streak
        let currentStreakVal = streak;
        if (isCompleted && !progress[dayNum]) {
            const today = new Date().toDateString();
            const lastStudyDate = localStorage.getItem(DATE_KEY);

            if (lastStudyDate !== today) {
                if (lastStudyDate) {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    if (lastStudyDate === yesterday.toDateString()) {
                        currentStreakVal += 1;
                    } else {
                        currentStreakVal = 1;
                    }
                } else {
                    currentStreakVal = 1;
                }
                localStorage.setItem(DATE_KEY, today);
                localStorage.setItem(STREAK_KEY, currentStreakVal.toString());
                setStreak(currentStreakVal);
            }
        }

        // Sync to MySQL if user is logged in
        if (token) {
            fetch('http://localhost:5000/api/progress/toeic30', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    data: {
                        progress: newProgress,
                        scores: updatedScores,
                        streak: currentStreakVal
                    }
                })
            }).catch(() => {});
        }
    };

    // Reset all progress for current user
    const handleResetAllProgress = () => {
        if (window.confirm("Bạn có chắc chắn muốn đặt lại toàn bộ tiến trình ôn thi TOEIC 30 ngày?")) {
            setProgress({});
            setScores({});
            setStreak(0);
            localStorage.removeItem(PROGRESS_KEY);
            localStorage.removeItem(SCORES_KEY);
            localStorage.removeItem(STREAK_KEY);
            localStorage.removeItem(DATE_KEY);
            localStorage.removeItem(QUIZZES_KEY);
            localStorage.removeItem(QUIZZES_STATE_KEY);

            if (token) {
                fetch('http://localhost:5000/api/progress/toeic30', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ data: { progress: {}, scores: {}, streak: 0 } })
                }).catch(() => {});
            }

            toast.info("Đã đặt lại tiến độ học tập!");
        }
    };

    const handleReviewWeek = (weekNum) => {
        handleSelectDay({
            day: `review-week-${weekNum}`,
            week: weekNum,
            title: `Ôn Tập Toàn Bộ Từ Vựng Tuần ${weekNum}`,
            objective: `Ôn tập tổng hợp tất cả từ vựng cốt lõi đã học trong tuần ${weekNum}.`,
            isWeeklyReview: true,
            staticVocab: [],
            grammarFocus: "Ôn tập tổng hợp",
            practiceType: "review",
            theory: `### Ôn Tập Từ Vựng Tuần ${weekNum}\n\nĐây là phần ôn tập đặc biệt, tự động tổng hợp toàn bộ từ vựng bạn đã học trong Tuần ${weekNum}. Khối lượng từ vựng sẽ khá lớn, hệ thống đã chia nhỏ thành các phần 15 từ để bạn dễ học. Hãy dùng Flashcard hoặc Trắc nghiệm để đưa từ vựng vào trí nhớ dài hạn nhé!`
        });
    };

    const handleSelectDay = (day) => {
        setSelectedDay(day);
        setActiveTab('theory');
        setVocabSubTab('list');
        setVocabPartIndices([-1]);
        setActiveVocabStudyMode(null);
        setShowGrammarDrill(false);

        // Load cached AI quiz for this day if exists
        const storedQuizzes = localStorage.getItem(QUIZZES_KEY);
        const quizzesMap = storedQuizzes ? JSON.parse(storedQuizzes) : {};
        if (quizzesMap[day.day]) {
            setQuizData(quizzesMap[day.day]);
            
            // Load state
            const storedStates = localStorage.getItem(QUIZZES_STATE_KEY);
            const statesMap = storedStates ? JSON.parse(storedStates) : {};
            if (statesMap[day.day]) {
                setUserAnswers(statesMap[day.day].userAnswers || {});
                setShowQuizResults(statesMap[day.day].showQuizResults || false);
                setQuizScore(statesMap[day.day].quizScore || 0);
            } else {
                setUserAnswers({});
                setShowQuizResults(false);
                setQuizScore(0);
            }
        } else {
            setQuizData(null);
            setUserAnswers({});
            setShowQuizResults(false);
            setQuizScore(0);
        }
    };

    const handleBackToDashboard = () => {
        setSelectedDay(null);
        setQuizData(null);
        setActiveVocabStudyMode(null);
        setShowGrammarDrill(false);
    };

    // Filter matching words from global vocabulary database based on day tags
    const getFilteredWords = (day) => {
        let merged = [];
        let daysToProcess = [day];
        let isVirtualReview = false;

        const normalizeCategory = (cat) => {
            if (!cat) return "Từ vựng";
            let norm = cat.trim();
            norm = norm.replace(/\s*\([a-z]+\)$/i, '');
            const lower = norm.toLowerCase().replace(/\s+/g, '');
            if (lower === "danh/độngtừ" || lower === "danhtừ/độngtừ" || lower === "danh/động") {
                return "Danh từ / Động từ";
            }
            return norm;
        };

        // If this day is a virtual weekly review, fetch all days in the same week
        if (typeof day.day === 'string' && day.day.startsWith('review-week-')) {
            daysToProcess = TOEIC_30_DAYS_CURRICULUM.filter(d => d.week === day.week);
            isVirtualReview = true;
        }

        const finalUnique = [];
        const dayBoundaries = [];

        daysToProcess.forEach(d => {
            const startIdx = finalUnique.length;
            const staticList = (d.staticVocab || []).map(w => ({
                ...w,
                category: normalizeCategory(w.category),
                exampleVi: STATIC_EXAMPLE_TRANSLATIONS[w.example] || ""
            }));

            const dayMerged = [...staticList];

            if (d.vocabSubGroups && d.vocabSubGroups.length > 0) {
                const dbMatchingWords = words.filter(w => 
                    w.master_group === '600 Từ Vựng TOEIC' && 
                    d.vocabSubGroups.includes(w.sub_group)
                );

                dbMatchingWords.forEach(dbWord => {
                    if (!dayMerged.some(w => w.en.toLowerCase() === dbWord.en.toLowerCase())) {
                        dayMerged.push({
                            en: dbWord.en,
                            vi: dbWord.vi,
                            category: normalizeCategory(dbWord.category),
                            example: dbWord.example_en || 'No example sentence cached.',
                            exampleVi: dbWord.example_vi || STATIC_EXAMPLE_TRANSLATIONS[dbWord.example_en] || "",
                            ipa: dbWord.ipa
                        });
                    }
                });
            }

            // Deduplicate into finalUnique
            dayMerged.forEach(w => {
                if (!finalUnique.some(fw => fw.en.toLowerCase() === w.en.toLowerCase())) {
                    finalUnique.push(w);
                }
            });

            const endIdx = finalUnique.length;
            if (endIdx > startIdx) {
                dayBoundaries.push({
                    label: `Ngày ${d.day}`,
                    start: startIdx,
                    end: endIdx,
                    count: endIdx - startIdx
                });
            }
        });

        // Limit the number of words to avoid overwhelming the browser (max 500)
        const sliced = finalUnique.slice(0, 500);
        if (isVirtualReview) {
            sliced._dayBoundaries = dayBoundaries.map(b => ({
                ...b,
                end: Math.min(b.end, 500),
                count: Math.max(0, Math.min(b.end, 500) - b.start)
            })).filter(b => b.count > 0);
        }
        return sliced;
    };


    // AI quiz generator based on day focal grammar/skill
    const handleGenerateQuiz = async () => {
        setLoadingQuiz(true);
        setQuizData(null);
        setUserAnswers({});
        setShowQuizResults(false);
        setQuizScore(0);

        try {
            const numQuestions = 5;
            let prompt = `Bạn là một giáo viên luyện thi TOEIC giàu kinh nghiệm. Hãy tạo ${numQuestions} câu hỏi trắc nghiệm kiểm tra TOEIC bám sát theo yêu cầu sau:
            - Chủ đề ngữ pháp/phần thi: ${selectedDay.grammarFocus}
            - Dạng bài tập: ${selectedDay.practiceType} (ví dụ: grammar_quiz là điền từ ngữ pháp Part 5, listening_partX là trắc nghiệm luyện nghe).
            - Trình độ: Người mất gốc học thi TOEIC (mức độ từ dễ đến vừa, không quá lắt léo).
            
            Hãy trả về một đối tượng JSON BẮT BUỘC có cấu trúc:
            {
                "title": "Tiêu đề bài tập trắc nghiệm",
                "passage": "Đoạn văn đọc hiểu hoặc đoạn hội thoại/độc thoại nghe (nếu là dạng listening_part3/part4 hoặc reading_part6/part7, nếu không cần thì để trống)",
                "questions": [
                    {
                        "id": 1,
                        "question": "Nội dung câu hỏi",
                        "options": ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"],
                        "correctAnswerIndex": 0,
                        "explanation": "Giải thích chi tiết tại sao đáp án đó đúng bằng tiếng Việt",
                        "audioText": "Kịch bản giọng nói đọc to câu hỏi và các tùy chọn (Chỉ bắt buộc có đối với các dạng listening_part1, listening_part2, listening_part3, listening_part4 để đọc to cho học viên nghe)"
                    }
                ]
            }`;

            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ai/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    systemInstruction: "You are a professional TOEIC test maker. You must output valid JSON only.",
                    jsonMode: true
                })
            });

            if (!response.ok) throw new Error('API Error');
            const data = await response.json();
            if (data.metadata) reportAiUsage(data.metadata);
            
            const parsed = JSON.parse(data.text);
            
            // Save to cached quizzes
            const storedQuizzes = localStorage.getItem(QUIZZES_KEY);
            const quizzesMap = storedQuizzes ? JSON.parse(storedQuizzes) : {};
            quizzesMap[selectedDay.day] = parsed;
            localStorage.setItem(QUIZZES_KEY, JSON.stringify(quizzesMap));
            
            // Save empty state to state map
            const storedStates = localStorage.getItem(QUIZZES_STATE_KEY);
            const statesMap = storedStates ? JSON.parse(storedStates) : {};
            statesMap[selectedDay.day] = {
                userAnswers: {},
                showQuizResults: false,
                quizScore: 0
            };
            localStorage.setItem(QUIZZES_STATE_KEY, JSON.stringify(statesMap));

            setQuizData(parsed);
            toast.success("Đã khởi tạo đề thi luyện tập bằng AI!");
        } catch (err) {
            console.error(err);
            toast.error("Lỗi khi kết nối AI để tạo bài tập!");
        } finally {
            setLoadingQuiz(false);
        }
    };

    const handleSelectOption = (qId, optionIdx) => {
        if (showQuizResults) return;
        const newAnswers = { ...userAnswers, [qId]: optionIdx };
        setUserAnswers(newAnswers);

        // Save state to localStorage
        const storedStates = localStorage.getItem(QUIZZES_STATE_KEY);
        const statesMap = storedStates ? JSON.parse(storedStates) : {};
        statesMap[selectedDay.day] = {
            userAnswers: newAnswers,
            showQuizResults: showQuizResults,
            quizScore: quizScore
        };
        localStorage.setItem(QUIZZES_STATE_KEY, JSON.stringify(statesMap));
    };

    const handleSubmitQuiz = () => {
        if (!quizData) return;

        if (Object.keys(userAnswers).length < quizData.questions.length) {
            toast.warning("Vui lòng làm hết tất cả các câu hỏi trước khi nộp bài!");
            return;
        }

        let score = 0;
        quizData.questions.forEach(q => {
            if (userAnswers[q.id] === q.correctAnswerIndex) {
                score++;
            }
        });

        setQuizScore(score);
        setShowQuizResults(true);

        const scoreStr = `${score} / ${quizData.questions.length}`;
        saveProgress(selectedDay.day, true, scoreStr);

        // Save state to localStorage
        const storedStates = localStorage.getItem(QUIZZES_STATE_KEY);
        const statesMap = storedStates ? JSON.parse(storedStates) : {};
        statesMap[selectedDay.day] = {
            userAnswers: userAnswers,
            showQuizResults: true,
            quizScore: score
        };
        localStorage.setItem(QUIZZES_STATE_KEY, JSON.stringify(statesMap));

        toast.success(`Nộp bài thành công! Bạn đúng ${scoreStr} câu.`);
    };

    // Text to speech script reader for Listening Practice
    const playListeningAudio = (audioText) => {
        if (!audioText) return;
        setPlayingAudio(true);
        speak(audioText, null, 'en-US');
        
        // simple timeout to reset state
        const approximateDuration = audioText.split(' ').length * 400; // ~400ms per word
        setTimeout(() => setPlayingAudio(false), Math.min(approximateDuration, 15000));
    };

    const handleMarkDayCompletedWithoutQuiz = () => {
        saveProgress(selectedDay.day, true, "Đã đọc");
        toast.success("Đã lưu tiến trình học tập ngày hôm nay!");
        handleBackToDashboard();
    };

    // Custom Basic Markdown Parser for the Theory Content
    const renderTheoryContent = (text) => {
        if (!text) return null;
        const lines = text.split('\n');
        let inTable = false;
        let tableRows = [];
        const elements = [];

        const flushTable = (key) => {
            if (tableRows.length > 0) {
                const parsedRows = tableRows.map(row => {
                    return row.content.split('|').map(cell => cell.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1);
                }).filter(row => row.length > 0 && !row.every(cell => cell.startsWith('---') || cell.startsWith(':-')));
                
                elements.push(
                    <div key={`table-${key}`} className="overflow-x-auto my-4 shadow-sm border border-gray-200 dark:border-slate-800 rounded-xl">
                        <table className="w-full text-sm text-left text-gray-700 dark:text-slate-350">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-slate-800/80 dark:text-slate-400 border-b border-gray-200 dark:border-slate-800">
                                <tr>
                                    {parsedRows[0]?.map((cell, i) => (
                                        <th key={i} className="px-4 py-3 font-bold text-gray-800 dark:text-slate-200">{cell}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-800/80">
                                {parsedRows.slice(1).map((row, rowIndex) => (
                                    <tr key={rowIndex} className="bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                        {row.map((cell, cellIndex) => (
                                            <td key={cellIndex} className="px-4 py-3 font-medium text-gray-700 dark:text-slate-300">{cell}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
                tableRows = [];
                inTable = false;
            }
        };

        lines.forEach((line, index) => {
            const trimmed = line.trim();
            if (trimmed.startsWith('|')) {
                inTable = true;
                tableRows.push({ raw: line, content: trimmed });
                return;
            } else if (inTable) {
                flushTable(index);
            }

            if (trimmed.startsWith('### ')) {
                elements.push(<h3 key={index} className="text-lg font-black text-gray-800 dark:text-white mt-6 mb-3 border-b border-gray-200 dark:border-slate-800 pb-2">{trimmed.substring(4)}</h3>);
            } else if (trimmed.startsWith('#### ')) {
                elements.push(<h4 key={index} className="text-base font-extrabold text-green-600 dark:text-green-400 mt-4 mb-2">{trimmed.substring(5)}</h4>);
            } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                elements.push(<li key={index} className="ml-5 list-disc text-sm text-gray-700 dark:text-slate-300 mb-1 leading-relaxed">{trimmed.substring(2)}</li>);
            } else if (trimmed.startsWith('> ')) {
                elements.push(<div key={index} className="p-4 bg-green-50/30 dark:bg-green-950/20 border-l-4 border-green-500 rounded-r-xl my-4 text-xs font-semibold text-green-950 dark:text-green-300">{trimmed.substring(2)}</div>);
            } else if (trimmed) {
                elements.push(<p key={index} className="text-sm text-gray-700 dark:text-slate-300 my-2 leading-relaxed">{trimmed}</p>);
            }
        });

        if (inTable) {
            flushTable(lines.length);
        }

        return <div className="space-y-1">{elements}</div>;
    };

    // Calculate overall completion percent
    const completedDays = Object.values(progress).filter(Boolean).length;
    const progressPercent = Math.round((completedDays / 30) * 100);
    const dayWords = selectedDay ? getFilteredWords(selectedDay) : [];

    // Tính toán từ vựng cho phần hiện tại (chia thành 2-3 phần đều nhau)
    const getPartIndices = (total) => {
        if (dayWords._dayBoundaries) {
            return dayWords._dayBoundaries;
        }

        let parts = 1;
        if (total > 45) parts = Math.ceil(total / 15);
        else if (total > 15) parts = 3;
        else if (total > 7) parts = 2;
        
        const result = [];
        for (let i = 0; i < parts; i++) {
            const start = Math.floor((i * total) / parts);
            const end = Math.floor(((i + 1) * total) / parts);
            result.push({ label: `Phần ${i + 1}`, start, end, count: end - start });
        }
        return result;
    };

    const partsInfo = getPartIndices(dayWords.length);
    const numParts = partsInfo.length;
    const currentPartWords = vocabPartIndices.includes(-1) 
        ? dayWords 
        : partsInfo
            .map((part, i) => vocabPartIndices.includes(i) ? dayWords.slice(part.start, part.end) : [])
            .flat();

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            
            {/* OVERVIEW DASHBOARD */}
            {!selectedDay ? (
                <div className="space-y-6 animate-fade-in">
                    
                    {/* Header Banner */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-200 dark:border-slate-800 relative overflow-hidden transition-all">
                        <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-green-500 to-emerald-600" />
                        
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="space-y-2">
                                <span className="text-[10px] uppercase font-bold tracking-widest text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-3 py-1 rounded-full border border-green-100 dark:border-green-900/30">
                                    Lộ Trình Cốt Lõi
                                </span>
                                <h1 className="text-3xl font-black text-gray-800 dark:text-white">
                                    Chương Trình Ôn Thi TOEIC 30 Ngày
                                </h1>
                                <p className="text-gray-500 dark:text-slate-400 text-sm max-w-2xl leading-relaxed">
                                    Thiết kế tinh gọn cho người mất gốc hướng tới mục tiêu **400+ điểm**. 
                                    Học lý thuyết, trau dồi từ vựng cốt lõi và luyện đề thi thử tương tác hàng ngày.
                                </p>
                            </div>

                            {/* Streak & Score Widget */}
                            <div className="flex items-center gap-4 bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-200 dark:border-slate-800">
                                <div className="text-center px-2">
                                    <div className="flex items-center gap-1 justify-center text-amber-500">
                                        <Zap size={20} className="fill-current animate-pulse" />
                                        <span className="text-2xl font-black">{streak}</span>
                                    </div>
                                    <span className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider">Chuỗi Ngày</span>
                                </div>
                                <div className="w-px h-10 bg-gray-200 dark:bg-slate-700" />
                                <div className="text-center px-2">
                                    <span className="text-2xl font-black text-green-600 dark:text-green-400">{completedDays} / 30</span>
                                    <span className="block text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider">Đã Học</span>
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-8 pt-4 border-t border-gray-100 dark:border-slate-800 space-y-2">
                            <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-slate-400">
                                <span>Tiến trình hoàn thành lộ trình</span>
                                <span>{progressPercent}% ({completedDays} ngày)</span>
                            </div>
                            <div className="w-full h-3 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-500" 
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* WEEK GRID GROUPING */}
                    {[1, 2, 3, 4].map(weekNum => {
                        const weekDays = TOEIC_30_DAYS_CURRICULUM.filter(d => d.week === weekNum);
                        return (
                            <div key={weekNum} className="space-y-3">
                                <div className="flex justify-between items-center px-2">
                                    <h2 className="text-sm font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                                        Tuần {weekNum}: {
                                            weekNum === 1 ? "Xây dựng nền tảng từ vựng & phát âm" :
                                            weekNum === 2 ? "Ngữ pháp cốt lõi & từ vựng nâng cao" :
                                            weekNum === 3 ? "Luyện đề thực chiến từng phần" :
                                            "Chiến lược thi & Hoàn thiện"
                                        }
                                    </h2>
                                    <button 
                                        onClick={() => handleReviewWeek(weekNum)}
                                        className="text-xs bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/50 px-3 py-1 rounded-full font-bold transition-colors flex items-center gap-1 shadow-sm"
                                    >
                                        <Layers size={14} /> Ôn Tập Tuần {weekNum}
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                    {weekDays.map(day => {
                                        const isCompleted = progress[day.day];
                                        return (
                                            <button
                                                key={day.day}
                                                onClick={() => handleSelectDay(day)}
                                                className={`p-5 rounded-2xl border text-left flex flex-col justify-between min-h-[140px] transition-all hover:scale-[1.02] cursor-pointer shadow-sm relative group bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 ${
                                                    isCompleted 
                                                        ? 'ring-2 ring-green-500/30 border-green-500/50 bg-green-50/10 dark:bg-green-950/5'
                                                        : 'hover:border-green-400 dark:hover:border-green-500'
                                                }`}
                                            >
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs font-mono font-black text-gray-400 group-hover:text-green-500 transition-colors">
                                                            NGÀY {day.day}
                                                        </span>
                                                        {isCompleted && (
                                                            <CheckCircle2 size={16} className="text-green-500 fill-green-50 dark:fill-slate-900" />
                                                        )}
                                                    </div>
                                                    <h3 className="text-sm font-bold text-gray-800 dark:text-white line-clamp-2 leading-tight group-hover:text-green-600 dark:group-hover:text-green-400">
                                                        {day.title.split(': ')[1]}
                                                    </h3>
                                                </div>

                                                <div className="mt-4 pt-2 border-t border-gray-100 dark:border-slate-800/60 flex items-center justify-between w-full">
                                                    <span className="text-[10px] text-gray-500 dark:text-slate-500 font-bold uppercase truncate max-w-[130px]">
                                                        {day.grammarFocus}
                                                    </span>
                                                    {scores[day.day] && (
                                                        <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-900/30">
                                                            Score: {scores[day.day]}
                                                        </span>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}

                    {/* Footer resets */}
                    <div className="flex justify-end pt-4">
                        <button 
                            onClick={handleResetAllProgress}
                            className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                            Đặt lại tiến trình học tập
                        </button>
                    </div>
                </div>
            ) : (
                
                // DAY WORKSPACE VIEW
                <div className="space-y-6 animate-fade-in">
                    
                    {/* Workspace Header */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-gray-200 dark:border-slate-800 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={handleBackToDashboard}
                                className="p-2.5 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl text-gray-600 dark:text-slate-400 transition cursor-pointer"
                                title="Quay lại Dashboard"
                            >
                                <ArrowLeft size={16} />
                            </button>
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-green-600 dark:text-green-400">
                                    Tuần {selectedDay.week} / Ngày {selectedDay.day}
                                </span>
                                <h1 className="text-xl font-black text-gray-800 dark:text-white leading-tight">
                                    {selectedDay.title}
                                </h1>
                            </div>
                        </div>

                        {/* Complete button status */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                            <button
                                onClick={handleMarkDayCompletedWithoutQuiz}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                            >
                                <CheckCircle2 size={14} /> Đánh dấu hoàn thành
                            </button>
                        </div>
                    </div>

                    {/* DAY WORKSPACE TABS */}
                    {!showGrammarDrill && !activeVocabStudyMode && (
                        <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm transition-colors">
                            {[
                                { id: 'theory', label: '1. Lý thuyết & Kỹ năng', icon: BookOpen },
                                { id: 'vocab', label: '2. Từ vựng cốt lõi', icon: Layers },
                                { id: 'practice', label: '3. Bài tập trắc nghiệm', icon: Sparkles }
                            ].map(tab => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => {
                                            setActiveTab(tab.id);
                                            setShowGrammarDrill(false);
                                            setActiveVocabStudyMode(null);
                                        }}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex-1 justify-center whitespace-nowrap cursor-pointer ${
                                            isActive 
                                                ? 'bg-green-600 text-white shadow-md' 
                                                : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white'
                                        }`}
                                    >
                                        <Icon size={14} />
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* TAB VIEWPORTS */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-200 dark:border-slate-800 min-h-[400px] flex flex-col justify-between transition-colors">
                        
                        {/* ── GRAMMAR DRILL VIEWPORT ── */}
                        {showGrammarDrill ? (
                            <div className="space-y-4 flex-1">
                                <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-slate-800">
                                    <button
                                        onClick={() => setShowGrammarDrill(false)}
                                        className="text-xs font-bold text-gray-500 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
                                    >
                                        <ArrowLeft size={14} /> Quay lại bài học Ngày {selectedDay.day}
                                    </button>
                                    <span className="text-xs font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 px-3 py-1 rounded-full">
                                        Chủ đề: {selectedDay.grammarFocus}
                                    </span>
                                </div>
                                <div className="pt-2">
                                    <GrammarMode initialTopic={selectedDay.grammarFocus} initialLevel="A2 (Sơ cấp)" />
                                </div>
                            </div>
                        ) : activeVocabStudyMode ? (
                            
                            // ── VOCAB STUDY MODE VIEWPORT ──
                            <div className="space-y-4 flex-1">
                                <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-slate-800">
                                    <button
                                        onClick={() => setActiveVocabStudyMode(null)}
                                        className="text-xs font-bold text-slate-500 hover:text-green-600 flex items-center gap-1 cursor-pointer"
                                    >
                                        <ArrowLeft size={14} /> Quay lại danh sách từ vựng
                                    </button>
                                    <span className="text-xs font-black text-green-600 bg-green-50 dark:bg-green-950/30 px-3 py-1 rounded-full capitalize">
                                        Luyện tập: {activeVocabStudyMode === 'flashcards' ? 'Flashcard' : activeVocabStudyMode === 'quiz' ? 'Trắc nghiệm từ' : 'Gõ từ vựng'}
                                    </span>
                                </div>
                                <div className="pt-2">
                                    {activeVocabStudyMode === 'flashcards' && (
                                        <FlashcardMode words={currentPartWords} speak={speak} />
                                    )}
                                    {activeVocabStudyMode === 'quiz' && (
                                        <QuizMode words={currentPartWords} speak={speak} />
                                    )}
                                    {activeVocabStudyMode === 'typing' && (
                                        <TypingMode words={currentPartWords} speak={speak} />
                                    )}
                                </div>
                            </div>
                        ) : (
                            
                            // ── STANDARD TAB CONTENT ──
                            <>
                                {/* 1. THEORY TAB */}
                                {activeTab === 'theory' && (
                                    <div className="space-y-6 flex-1 flex flex-col justify-between">
                                        <div className="space-y-4">
                                            <div className="bg-gray-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-gray-200 dark:border-slate-800">
                                                <h4 className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">Mục tiêu ngày học</h4>
                                                <p className="text-sm font-semibold text-gray-700 dark:text-slate-300">{selectedDay.objective}</p>
                                            </div>
                                            
                                            <div className="prose dark:prose-invert max-w-none">
                                                {renderTheoryContent(selectedDay.theory)}
                                            </div>

                                            {/* Integrated Grammar Mode Entry */}
                                            {selectedDay.grammarFocus && (
                                                <div className="mt-8 bg-indigo-50/40 dark:bg-indigo-950/15 p-5 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                    <div className="space-y-1">
                                                        <h4 className="font-extrabold text-indigo-950 dark:text-indigo-300 text-sm">Luyện Ngữ Pháp Chuyên Sâu</h4>
                                                        <p className="text-xs text-gray-500 dark:text-slate-400">Tự động khởi chạy bài tập trắc nghiệm ngữ pháp AI về chủ đề: **{selectedDay.grammarFocus}**.</p>
                                                    </div>
                                                    <button
                                                        onClick={() => setShowGrammarDrill(true)}
                                                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition shrink-0 cursor-pointer"
                                                    >
                                                        <Sparkles size={14} /> Bắt đầu luyện ngay
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-6 border-t border-gray-200 dark:border-slate-800/80 flex justify-end">
                                            <button 
                                                onClick={() => setActiveTab('vocab')}
                                                className="bg-green-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-green-700 transition flex items-center gap-2 text-xs cursor-pointer"
                                            >
                                                Chuyển sang Từ vựng <ArrowRight size={14} />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* 2. VOCABULARY TAB */}
                                {activeTab === 'vocab' && (
                                    <div className="space-y-6 flex-1 flex flex-col justify-between">
                                        <div className="space-y-6">
                                            
                                            {/* Sub-tab Toolbars */}
                                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-100 dark:bg-slate-800/60 p-3 rounded-2xl border border-gray-200 dark:border-slate-800">
                                                
                                                {/* Visual Selector List/Slideshow */}
                                                <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl border border-gray-200/50 dark:border-slate-800/80 w-fit">
                                                    <button
                                                        onClick={() => setVocabSubTab('list')}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                                                            vocabSubTab === 'list'
                                                                ? 'bg-green-600 text-white shadow-sm'
                                                                : 'text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white'
                                                        }`}
                                                    >
                                                        <LayoutGrid size={13} />
                                                        <span>Danh sách từ</span>
                                                    </button>
                                                    <button
                                                        onClick={() => setVocabSubTab('context')}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                                                            vocabSubTab === 'context'
                                                                ? 'bg-green-600 text-white shadow-sm'
                                                                : 'text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white'
                                                        }`}
                                                    >
                                                        <BookOpenCheck size={13} />
                                                        <span>Học theo ngữ cảnh (Slide)</span>
                                                    </button>
                                                </div>

                                                    {/* Mini sub-learning modes launcher */}
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="text-[10px] font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest mr-1">Các chế độ ôn tập:</span>
                                                        <button
                                                            onClick={() => setActiveVocabStudyMode('flashcards')}
                                                            className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200/40 dark:border-blue-900/40 rounded-lg text-[10px] font-bold hover:bg-blue-100/70 dark:hover:bg-blue-900/40 transition cursor-pointer"
                                                        >
                                                            Luyện Flashcard
                                                        </button>
                                                        <button
                                                            onClick={() => setActiveVocabStudyMode('quiz')}
                                                            className="px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-200/40 dark:border-purple-900/40 rounded-lg text-[10px] font-bold hover:bg-purple-100/70 dark:hover:bg-purple-900/40 transition cursor-pointer"
                                                        >
                                                            Luyện Trắc nghiệm
                                                        </button>
                                                        <button
                                                            onClick={() => setActiveVocabStudyMode('typing')}
                                                            className="px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-600 border border-amber-200/40 dark:border-amber-900/40 rounded-lg text-[10px] font-bold hover:bg-amber-100/70 dark:hover:bg-amber-900/40 transition cursor-pointer"
                                                        >
                                                            Luyện Gõ từ
                                                        </button>
                                                    </div>
                                            </div>

                                            {/* Phần chọn Part từ vựng */}
                                            {numParts > 1 && (
                                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                                    <button
                                                        onClick={() => { setVocabPartIndices([-1]); setContextIndex(0); }}
                                                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                                                            vocabPartIndices.includes(-1)
                                                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                                                        }`}
                                                    >
                                                        Tất cả ({dayWords.length} từ)
                                                    </button>
                                                    {partsInfo.map((part, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => { 
                                                                setVocabPartIndices(prev => {
                                                                    if (prev.includes(-1)) return [i];
                                                                    if (prev.includes(i)) {
                                                                        const next = prev.filter(idx => idx !== i);
                                                                        return next.length === 0 ? [-1] : next;
                                                                    }
                                                                    return [...prev, i];
                                                                });
                                                                setContextIndex(0); 
                                                            }}
                                                            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                                                                !vocabPartIndices.includes(-1) && vocabPartIndices.includes(i)
                                                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                                                            }`}
                                                        >
                                                            {part.label || `Phần ${i + 1}`} ({part.count} từ)
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {/* ── LIST VIEW SUB-TAB ── */}
                                            {vocabSubTab === 'list' && (
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between pb-2">
                                                        <span className="text-xs font-black text-gray-500 dark:text-slate-500 uppercase tracking-wider">
                                                            Chủ đề: {selectedDay.vocabTopic || "Học chung"}
                                                        </span>
                                                        <span className="text-xs font-bold text-green-600 dark:text-green-400">
                                                            {currentPartWords.length} từ vựng
                                                        </span>
                                                    </div>

                                                    {currentPartWords.length === 0 ? (
                                                        <div className="text-center py-12 text-gray-400">Không có từ vựng.</div>
                                                    ) : (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {currentPartWords.map((item, idx) => (
                                                                <div 
                                                                    key={idx} 
                                                                    className="p-5 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 rounded-2xl flex justify-between items-start group shadow-sm hover:scale-[1.01] transition-all"
                                                                >
                                                                    <div className="space-y-2">
                                                                        <div className="flex items-center gap-2 flex-wrap">
                                                                            <h4 className="text-lg font-black text-gray-900 dark:text-white leading-none">{item.en}</h4>
                                                                            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 rounded leading-none">
                                                                                {item.category}
                                                                            </span>
                                                                            {item.ipa && (
                                                                                <span className="text-xs font-mono text-gray-400 dark:text-slate-400">{item.ipa}</span>
                                                                            )}
                                                                        </div>
                                                                        <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">{item.vi}</p>
                                                                        <p className="text-xs text-gray-500 dark:text-slate-400 italic leading-relaxed">
                                                                            <strong className="not-italic text-[10px] font-bold uppercase tracking-wider text-gray-400 mr-1">Ex:</strong>
                                                                            {item.example}
                                                                        </p>
                                                                    </div>
                                                                    <button 
                                                                        onClick={(e) => speak(item.en, e, 'en-US')}
                                                                        className="p-2 bg-white dark:bg-slate-800 hover:bg-green-50 dark:hover:bg-green-950/30 text-gray-400 hover:text-green-600 dark:hover:text-green-400 rounded-full border border-gray-200 dark:border-slate-700 shadow-sm cursor-pointer shrink-0"
                                                                        title="Nghe phát âm"
                                                                    >
                                                                        <Volume2 size={14} />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* ── CONTEXT SLIDESHOW VIEW SUB-TAB ── */}
                                            {vocabSubTab === 'context' && currentPartWords.length > 0 && (
                                                <div className="space-y-4 max-w-xl mx-auto animate-fade-in">
                                                    <div className="flex justify-between items-center text-xs font-bold text-slate-400 dark:text-slate-500">
                                                        <span>Tiến độ từ: {contextIndex + 1} / {currentPartWords.length}</span>
                                                        <span>Mức độ hoàn thành: {Math.round(((contextIndex + 1) / currentPartWords.length) * 100)}%</span>
                                                    </div>

                                                    {/* The Main Vocab Slide Card */}
                                                    <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-6 relative overflow-hidden">
                                                        <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
                                                        
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-3">
                                                                <h3 className="text-3xl font-black text-gray-900 dark:text-white leading-none">
                                                                    {currentPartWords[contextIndex].en}
                                                                </h3>
                                                                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-full border border-indigo-100/30 dark:border-indigo-900/20">
                                                                    {currentPartWords[contextIndex].category}
                                                                </span>
                                                                {currentPartWords[contextIndex].ipa && (
                                                                    <span className="text-xs font-mono text-gray-400 dark:text-slate-500">{currentPartWords[contextIndex].ipa}</span>
                                                                )}
                                                            </div>
                                                            <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                                                                {currentPartWords[contextIndex].vi}
                                                            </p>
                                                        </div>

                                                        {/* Contextual Sentence Box */}
                                                        <div className="space-y-2">
                                                            <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Ngữ cảnh sử dụng:</span>
                                                            <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-200 dark:border-slate-800/80 relative group flex flex-col gap-2.5">
                                                                <div className="flex items-start gap-4 justify-between">
                                                                    <p className="text-xl font-serif italic text-gray-800 dark:text-slate-100 leading-relaxed font-semibold">
                                                                        "{currentPartWords[contextIndex].example}"
                                                                    </p>
                                                                    <button
                                                                        onClick={() => speak(currentPartWords[contextIndex].example, null, 'en-US')}
                                                                        className="p-2 bg-white dark:bg-slate-800 hover:bg-green-50 dark:hover:bg-green-950/30 text-gray-400 hover:text-green-600 dark:hover:text-green-400 rounded-full border border-gray-200 dark:border-slate-700 shadow-sm cursor-pointer shrink-0"
                                                                        title="Nghe câu ví dụ (Ctrl + Space)"
                                                                    >
                                                                        <Volume2 size={16} />
                                                                    </button>
                                                                </div>
                                                                {currentPartWords[contextIndex].exampleVi && (
                                                                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed pl-3 border-l-2 border-green-500 dark:border-green-800 font-medium">
                                                                        {currentPartWords[contextIndex].exampleVi}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Step instruction note */}
                                                        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-305 rounded-xl border border-amber-200 dark:border-amber-900/30 text-sm font-bold leading-relaxed">
                                                            👉 Đọc to câu ví dụ trên 2–3 lần để bộ não ghi nhớ từ vựng qua ngữ cảnh thực tế tốt nhất.
                                                        </div>

                                                        {/* Hand-writing Check or Spelling Check */}
                                                        <div className="pt-4 border-t border-slate-150 dark:border-slate-800/60 space-y-4">
                                                            <div className="space-y-1.5">
                                                                <label className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Gõ lại câu ví dụ trên:</label>
                                                                <input
                                                                    ref={inputRef}
                                                                    type="text"
                                                                    className={`w-full p-3.5 text-base border bg-white dark:bg-slate-950 rounded-xl focus:ring-2 focus:ring-green-500 text-gray-800 dark:text-white outline-none transition-all placeholder-slate-400 dark:placeholder-slate-600 ${
                                                                        typedChecked 
                                                                            ? 'border-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/10' 
                                                                            : 'border-slate-200 dark:border-slate-800 focus:border-green-500'
                                                                    }`}
                                                                    placeholder="Luyện tập trí nhớ (Nhấn Ctrl + Space để nghe lại ví dụ)..."
                                                                    value={typedSentence}
                                                                    onChange={(e) => {
                                                                        setTypedSentence(e.target.value);
                                                                        const cleanA = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '');
                                                                        const cleanB = currentPartWords[contextIndex].example.toLowerCase().replace(/[^a-z0-9]/g, '');
                                                                        setTypedChecked(cleanA === cleanB);
                                                                    }}
                                                                    onKeyDown={(e) => {
                                                                        if (e.ctrlKey && e.code === 'Space') {
                                                                            e.preventDefault();
                                                                            speak(currentPartWords[contextIndex].example, null, 'en-US');
                                                                            return;
                                                                        }
                                                                        if (e.key === 'Enter') {
                                                                            const cleanA = typedSentence.toLowerCase().replace(/[^a-z0-9]/g, '');
                                                                            const cleanB = currentPartWords[contextIndex].example.toLowerCase().replace(/[^a-z0-9]/g, '');
                                                                            if (cleanA === cleanB) {
                                                                                if (contextIndex < currentPartWords.length - 1) {
                                                                                    setContextIndex(prev => prev + 1);
                                                                                } else {
                                                                                    toast.success("Chúc mừng! Bạn đã hoàn thành các từ vựng của ngày hôm nay.");
                                                                                }
                                                                            } else {
                                                                                toast.warning("Vui lòng gõ chính xác câu ví dụ trước khi nhấn Enter!");
                                                                            }
                                                                        }
                                                                    }}
                                                                />
                                                                {typedChecked && (
                                                                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                                                                        <CheckCircle2 size={14} /> Chính xác! Trùng khớp với câu mẫu.
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                                                                <button
                                                                    onClick={() => {
                                                                        const spelling = currentPartWords[contextIndex].en;
                                                                        setHasWrittenOnPaper(prev => ({ ...prev, [spelling]: !prev[spelling] }));
                                                                    }}
                                                                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border transition cursor-pointer self-start ${
                                                                        hasWrittenOnPaper[currentPartWords[contextIndex].en]
                                                                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-sm'
                                                                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                                                    }`}
                                                                >
                                                                    {hasWrittenOnPaper[currentPartWords[contextIndex].en] ? (
                                                                        <Check size={14} />
                                                                    ) : (
                                                                        <Edit size={14} />
                                                                    )}
                                                                    <span>
                                                                        {hasWrittenOnPaper[currentPartWords[contextIndex].en] ? 'Đã viết tay ra nháp câu này ✓' : 'Đã viết nháp bằng bút giấy'}
                                                                    </span>
                                                                </button>

                                                                <span className="text-xs text-slate-400 dark:text-slate-500 italic max-w-sm leading-relaxed">
                                                                    📝 Nhắc nhở: Viết tay câu ví dụ ra nháp buộc não tập trung gấp nhiều lần gõ phím.
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Slideshow Steppers */}
                                                    <div className="flex items-center justify-between gap-4 pt-2">
                                                        <button
                                                            disabled={contextIndex === 0}
                                                            onClick={() => setContextIndex(prev => prev - 1)}
                                                            className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold disabled:opacity-30 transition cursor-pointer"
                                                        >
                                                            Từ trước đó
                                                        </button>
                                                        
                                                        {contextIndex < currentPartWords.length - 1 ? (
                                                            <button
                                                                onClick={() => setContextIndex(prev => prev + 1)}
                                                                className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold shadow-sm hover:shadow-green-500/20 transition cursor-pointer"
                                                            >
                                                                Từ tiếp theo
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => {
                                                                    setVocabSubTab('list');
                                                                    toast.success("Tuyệt vời! Bạn đã hoàn thành 10 từ theo ngữ cảnh.");
                                                                }}
                                                                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                                            >
                                                                <CheckCircle2 size={13} /> Hoàn thành 10 từ
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-6 border-t border-gray-100 dark:border-slate-800/80 flex justify-between items-center">
                                            <button 
                                                onClick={() => setActiveTab('theory')}
                                                className="text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-green-600 dark:hover:text-green-400 cursor-pointer"
                                            >
                                                Quay lại Lý thuyết
                                            </button>
                                            <button 
                                                onClick={() => setActiveTab('practice')}
                                                className="bg-green-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-green-700 transition flex items-center gap-2 text-xs cursor-pointer shadow-sm"
                                            >
                                                Chuyển sang Luyện tập <ArrowRight size={14} />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* 3. PRACTICE TAB */}
                                {activeTab === 'practice' && (
                                    <div className="space-y-6 flex-1 flex flex-col justify-between">
                                        
                                        {/* AI LOADER */}
                                        {loadingQuiz && (
                                            <div className="flex-1 flex flex-col items-center justify-center py-12">
                                                <RefreshCw className="animate-spin text-green-500 w-10 h-10 mb-4" />
                                                <p className="text-gray-500 dark:text-slate-400 font-medium">Gemini AI đang biên soạn đề thi thử TOEIC...</p>
                                            </div>
                                        )}

                                        {/* NOT GENERATED STATE */}
                                        {!loadingQuiz && !quizData && (
                                            <div className="flex-1 flex flex-col items-center justify-center text-center py-12 space-y-5">
                                                <Sparkles className="text-amber-500 w-12 h-12 animate-pulse" />
                                                <div className="space-y-2">
                                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Luyện tập trắc nghiệm bằng AI</h3>
                                                    <p className="text-gray-500 dark:text-slate-400 max-w-md text-sm mx-auto">
                                                        AI sẽ sinh đề thi thử gồm 5 câu trắc nghiệm bám sát mục tiêu **{selectedDay.grammarFocus}** (phương thức {selectedDay.practiceType}).
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={handleGenerateQuiz}
                                                    className="bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-indigo-700 transition flex items-center gap-2 shadow-md text-sm cursor-pointer"
                                                >
                                                    <Sparkles size={16} /> Bắt đầu làm bài luyện tập
                                                </button>
                                            </div>
                                        )}

                                        {/* QUIZ WORKSPACE */}
                                        {!loadingQuiz && quizData && (
                                            <div className="space-y-8 animate-fade-in">
                                                <div className="border-b border-gray-100 dark:border-slate-800 pb-3 flex justify-between items-center">
                                                    <h3 className="text-lg font-black text-gray-800 dark:text-white">{quizData.title}</h3>
                                                    {showQuizResults && (
                                                        <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                                                            Kết quả: {quizScore} / {quizData.questions.length} câu đúng
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Passage reader if any (Listening transcript / reading comprehension) */}
                                                {quizData.passage && (
                                                    <div className="p-5 bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-2xl space-y-3 relative group">
                                                        <h4 className="text-xs font-black uppercase text-gray-400 dark:text-slate-500 tracking-wider">Đoạn văn / Đoạn hội thoại mẫu:</h4>
                                                        <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{quizData.passage}</p>
                                                        
                                                        {/* Text to Speech player for Listening passages */}
                                                        {selectedDay.practiceType.startsWith('listening') && (
                                                            <button 
                                                                onClick={() => playListeningAudio(quizData.passage)}
                                                                disabled={playingAudio}
                                                                className="absolute right-4 top-4 p-2 bg-white dark:bg-slate-700 hover:bg-green-50 dark:hover:bg-green-950/20 text-gray-500 hover:text-green-600 rounded-lg shadow-sm border border-gray-200 dark:border-slate-600 flex items-center gap-1 text-xs cursor-pointer"
                                                            >
                                                                <Play size={14} className={playingAudio ? 'animate-ping' : ''} />
                                                                <span>{playingAudio ? 'Đang đọc...' : 'Nghe hội thoại'}</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Question Cards */}
                                                <div className="space-y-8">
                                                    {quizData.questions.map((q, index) => (
                                                        <div key={q.id} className="border-b border-gray-100 dark:border-slate-800 pb-6 last:border-none">
                                                            
                                                            {/* Question Title & TTS Player */}
                                                            <div className="flex items-start justify-between gap-4 mb-4">
                                                                <p className="text-sm font-bold text-gray-800 dark:text-white leading-relaxed">
                                                                    <span className="text-green-600 dark:text-green-400 font-black mr-2">Câu {index + 1}:</span>
                                                                    {q.question}
                                                                </p>

                                                                {/* Listen single question audio Text */}
                                                                {selectedDay.practiceType.startsWith('listening') && q.audioText && !quizData.passage && (
                                                                    <button 
                                                                        onClick={() => playListeningAudio(q.audioText)}
                                                                        disabled={playingAudio}
                                                                        className="p-2 bg-gray-50 hover:bg-green-50 dark:bg-slate-800 dark:hover:bg-green-950/20 text-gray-500 hover:text-green-600 rounded-full border border-gray-200 dark:border-slate-700 flex items-center gap-1 text-xs shrink-0 cursor-pointer"
                                                                        title="Nghe câu hỏi"
                                                                    >
                                                                        <Volume2 size={14} className={playingAudio ? 'animate-pulse' : ''} />
                                                                    </button>
                                                                )}
                                                            </div>

                                                            {/* Option Grid */}
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                {q.options.map((opt, optIdx) => {
                                                                    const isSelected = userAnswers[q.id] === optIdx;
                                                                    const isCorrect = q.correctAnswerIndex === optIdx;
                                                                    const isWrongSelected = showQuizResults && isSelected && !isCorrect;
                                                                    const isCorrectSelected = showQuizResults && isCorrect;

                                                                    let btnClass = "p-3.5 text-left border-2 rounded-xl text-xs font-semibold transition-all ";
                                                                    if (!showQuizResults) {
                                                                        btnClass += isSelected
                                                                            ? "border-green-500 bg-green-50/50 dark:bg-green-900/20 text-green-700 dark:text-green-400 cursor-pointer"
                                                                            : "border-gray-200/70 dark:border-slate-800 hover:border-green-300 dark:hover:border-green-500 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 cursor-pointer";
                                                                    } else {
                                                                        if (isCorrectSelected) {
                                                                            btnClass += "border-green-500 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 font-extrabold";
                                                                        } else if (isWrongSelected) {
                                                                            btnClass += "border-red-500 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 font-bold";
                                                                        } else {
                                                                            btnClass += "border-gray-200/50 dark:border-slate-800 text-gray-400 dark:text-slate-500 opacity-40 bg-white dark:bg-slate-900";
                                                                        }
                                                                    }

                                                                    return (
                                                                        <button
                                                                            key={optIdx}
                                                                            onClick={() => handleSelectOption(q.id, optIdx)}
                                                                            disabled={showQuizResults}
                                                                            className={btnClass}
                                                                        >
                                                                            <div className="flex items-center justify-between">
                                                                                <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                                                                                {showQuizResults && isCorrectSelected && <CheckCircle2 size={16} className="text-green-500" />}
                                                                                {showQuizResults && isWrongSelected && <XCircle size={16} className="text-red-500" />}
                                                                            </div>
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>

                                                            {/* Explanations */}
                                                            {showQuizResults && (
                                                                <div className="mt-4 p-4 bg-indigo-50/40 dark:bg-indigo-950/10 border border-indigo-200 dark:border-indigo-900/30 rounded-2xl flex gap-3 items-start animate-fade-in shadow-sm">
                                                                    <HelpCircle className="text-indigo-500 shrink-0 mt-0.5" size={16} />
                                                                    <div className="text-xs">
                                                                        <p className="font-extrabold text-indigo-900 dark:text-indigo-300 mb-1">Giải thích chi tiết:</p>
                                                                        <p className="text-indigo-800 dark:text-indigo-400/90 leading-relaxed">{q.explanation}</p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Action buttons footer */}
                                                {!showQuizResults ? (
                                                    <div className="text-center pt-6 border-t border-gray-100 dark:border-slate-800">
                                                        <button 
                                                            onClick={handleSubmitQuiz}
                                                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-12 rounded-xl text-xs shadow-md transition cursor-pointer"
                                                        >
                                                            Nộp bài chấm điểm
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="mt-8 p-6 bg-slate-50/50 dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 text-center transition-all shadow-inner animate-fade-in">
                                                        {quizScore === quizData.questions.length && (
                                                            <div className="flex justify-center mb-2 text-amber-500 animate-bounce">
                                                                <Award size={48} />
                                                            </div>
                                                        )}
                                                        <h4 className="text-lg font-black text-gray-800 dark:text-white mb-2">Báo Cáo Điểm Số</h4>
                                                        <p className="text-4xl font-black text-green-600 dark:text-green-400 mb-2">
                                                            {quizScore} / {quizData.questions.length}
                                                        </p>
                                                        <p className="text-xs text-gray-600 dark:text-slate-400 mb-6 max-w-sm mx-auto font-medium">
                                                            {quizScore === quizData.questions.length ? "🌟 Hoàn hảo! Bạn đã sẵn sàng chinh phục ngày tiếp theo." : 
                                                             quizScore >= quizData.questions.length / 2 ? "👍 Rất tốt! Hãy nghiên cứu thêm giải thích bên dưới để sửa các lỗi sai." : 
                                                             "💪 Tiếp tục cố gắng nhé! Đọc kỹ phần giải thích đáp án và ôn lại lý thuyết."}
                                                        </p>
                                                        <div className="flex items-center justify-center gap-3">
                                                            <button 
                                                                onClick={handleGenerateQuiz}
                                                                className="bg-indigo-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-indigo-700 transition text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                                                            >
                                                                <RefreshCw size={12} /> Làm đề khác
                                                            </button>
                                                            <button 
                                                                onClick={handleBackToDashboard}
                                                                className="bg-green-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-green-700 transition text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                                                            >
                                                                Hoàn thành bài & Quay lại
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="pt-6 border-t border-gray-100 dark:border-slate-800/80 flex justify-between items-center">
                                            <button 
                                                onClick={() => setActiveTab('vocab')}
                                                className="text-xs font-bold text-gray-500 hover:underline cursor-pointer"
                                            >
                                                Quay lại từ vựng
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Toeic30DayMode;
