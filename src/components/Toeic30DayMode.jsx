import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
    Calendar, Trophy, BookOpen, Volume2, Sparkles, 
    CheckCircle2, ArrowLeft, ArrowRight, Play, RefreshCw, 
    HelpCircle, XCircle, Award, Layers, Star, Zap, Edit, 
    BookOpenCheck, LayoutGrid, Check, Keyboard, Lock,
    Search, Filter, BookmarkCheck, ChevronRight, Flame, Target, Compass, Clock, RotateCcw
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
import { useVisibility } from '../context/VisibilityContext';

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

const Toeic30DayMode = ({ words = [], speak, onNavigate, setActiveTab: setParentActiveTab }) => {
    const navigateTab = onNavigate || setParentActiveTab;
    const { reportAiUsage } = useAiStatus();
    const { user, token } = useAuth();
    const { isAiLocked } = useVisibility();
    const userPrefix = user ? `u_${user.id}` : 'guest';
    const PROGRESS_KEY = `${userPrefix}_toeic30_progress`;
    const SCORES_KEY = `${userPrefix}_toeic30_scores`;
    const STREAK_KEY = `${userPrefix}_toeic30_streak`;
    const DATE_KEY = `${userPrefix}_toeic30_last_study_date`;
    const QUIZZES_KEY = `${userPrefix}_toeic30_ai_quizzes`;
    const QUIZZES_STATE_KEY = `${userPrefix}_toeic30_ai_quizzes_state`;

    // Filter by week or status
    const [selectedWeekFilter, setSelectedWeekFilter] = useState('all'); // 'all' | 1 | 2 | 3 | 4 | 'completed' | 'uncompleted'
    const [searchFilter, setSearchFilter] = useState('');

    // Dynamic counts for the 3 core pillars
    const etsWordsCount = useMemo(() => {
        return (words || []).filter(w =>
            w.master_group === 'Từ Vựng ETS 2026' ||
            (w.sub_group && w.sub_group.includes('ETS 2026'))
        ).length;
    }, [words]);

    const toeic500Count = useMemo(() => {
        return (words || []).filter(w =>
            w.master_group === '500 Từ Vựng TOEIC Mất Gốc' ||
            (w.sub_group && w.sub_group.toLowerCase().includes('story'))
        ).length;
    }, [words]);

    const toeic600Count = useMemo(() => {
        return (words || []).filter(w =>
            w.master_group === '600 Từ Vựng TOEIC'
        ).length;
    }, [words]);

    const handleJumpToTopic = (tabId) => {
        if (typeof navigateTab === 'function') {
            navigateTab(tabId);
        }
    };

    // Practice type badge helper
    const getPracticeTypeBadge = (practiceType) => {
        switch (practiceType) {
            case 'listening_part1':
                return { label: 'Nghe Part 1 (Tranh)', color: 'text-sky-700 dark:text-sky-300 bg-sky-100/70 dark:bg-sky-950/50 border-sky-200 dark:border-sky-800/60' };
            case 'listening_part2':
                return { label: 'Nghe Part 2 (Hỏi-Đáp)', color: 'text-blue-700 dark:text-blue-300 bg-blue-100/70 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800/60' };
            case 'listening_part3':
                return { label: 'Nghe Part 3 (Hội thoại)', color: 'text-indigo-700 dark:text-indigo-300 bg-indigo-100/70 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800/60' };
            case 'listening_part4':
                return { label: 'Nghe Part 4 (Độc thoại)', color: 'text-violet-700 dark:text-violet-300 bg-violet-100/70 dark:bg-violet-950/50 border-violet-200 dark:border-violet-800/60' };
            case 'grammar_quiz':
                return { label: 'Ngữ pháp Part 5', color: 'text-purple-700 dark:text-purple-300 bg-purple-100/70 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800/60' };
            case 'reading_part6':
                return { label: 'Đọc điền Part 6', color: 'text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800/60' };
            case 'reading_part7':
                return { label: 'Đọc hiểu Part 7', color: 'text-teal-700 dark:text-teal-300 bg-teal-100/70 dark:bg-teal-950/50 border-teal-200 dark:border-teal-800/60' };
            case 'review':
                return { label: 'Ôn tập tổng hợp', color: 'text-amber-700 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800/60' };
            default:
                return { label: practiceType || 'Luyện tập', color: 'text-slate-700 dark:text-slate-300 bg-slate-100/70 dark:bg-slate-800 border-slate-200 dark:border-slate-700' };
        }
    };

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
    const [practiceMethod, setPracticeMethod] = useState(null); // null, 'flashcards', 'quiz', 'typing', 'ai_quiz'
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
                credentials: 'include',
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
                credentials: 'include',
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
                    credentials: 'include',
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
        setPracticeMethod(null);
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
        setPracticeMethod(null);
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
        if (isAiLocked) {
            toast.warning("Tính năng AI hiện đang tạm khóa bởi Quản trị viên hệ thống!");
            return;
        }

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
                credentials: 'include',
                headers: { 
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    prompt,
                    systemInstruction: "You are a professional TOEIC test maker. You must output valid JSON only.",
                    jsonMode: true
                })
            });

            if (!response.ok) {
                if (response.status === 403) {
                    const errJson = await response.json().catch(() => ({}));
                    if (errJson.aiLocked) {
                        toast.error(errJson.error || "Tính năng AI hiện đang tạm khóa bởi Quản trị viên hệ thống!");
                        return;
                    }
                }
                throw new Error('API Error');
            }
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
                        <table className="w-full text-sm text-left text-gray-700 dark:text-slate-200">
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
                elements.push(<h3 key={index} className="text-lg font-black text-slate-900 dark:text-white mt-6 mb-3 border-b border-slate-200 dark:border-slate-800 pb-2">{trimmed.substring(4)}</h3>);
            } else if (trimmed.startsWith('#### ')) {
                elements.push(<h4 key={index} className="text-base font-extrabold text-indigo-600 dark:text-indigo-400 mt-4 mb-2">{trimmed.substring(5)}</h4>);
            } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                elements.push(<li key={index} className="ml-5 list-disc text-sm text-slate-700 dark:text-slate-300 mb-1 leading-relaxed">{trimmed.substring(2)}</li>);
            } else if (trimmed.startsWith('> ')) {
                elements.push(<div key={index} className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border-l-4 border-indigo-500 rounded-r-xl my-4 text-xs font-semibold text-indigo-950 dark:text-indigo-300">{trimmed.substring(2)}</div>);
            } else if (trimmed) {
                elements.push(<p key={index} className="text-sm text-slate-700 dark:text-slate-300 my-2 leading-relaxed">{trimmed}</p>);
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
        <div className="max-w-5xl mx-auto space-y-8">
            
            {/* OVERVIEW DASHBOARD */}
            {!selectedDay ? (
                <div className="space-y-8 animate-fade-in">
                    
                    {/* ── 1. HERO BANNER ── */}
                    <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-white via-slate-50/90 to-indigo-50/50 dark:from-slate-900/95 dark:via-slate-900/80 dark:to-indigo-950/30 border border-slate-200/90 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] backdrop-blur-xl">
                        {/* Decorative background ambient glow */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-2xl -z-10 pointer-events-none" />

                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            <div className="space-y-3 max-w-2xl">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-[10px] uppercase font-black tracking-widest text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-3 py-1 rounded-full border border-indigo-200/80 dark:border-indigo-900/40 flex items-center gap-1.5 shadow-2xs">
                                        <Compass size={12} /> Lộ Trình Thực Chiến 2026
                                    </span>
                                    <span className="text-[10px] uppercase font-black tracking-widest text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-200/80 dark:border-emerald-900/40 flex items-center gap-1.5 shadow-2xs">
                                        <Trophy size={12} /> Mục Tiêu 400+ Cốt Lõi
                                    </span>
                                </div>

                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                                    Chương Trình Ôn Thi TOEIC 30 Ngày
                                </h1>

                                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-400 leading-relaxed font-medium">
                                    Kế hoạch tinh gọn dành cho người mất gốc hướng tới mục tiêu bứt phá 400+ điểm. 
                                    Học lý thuyết ngữ pháp trọng điểm, tích lũy từ vựng cốt lõi và tự do chọn phương pháp ôn tập linh hoạt (Flashcard, Trắc nghiệm, Gõ từ).
                                </p>
                            </div>

                            {/* Stats Pill Card */}
                            <div className="flex items-center gap-4 sm:gap-6 bg-white dark:bg-slate-800/80 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-700/60 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] shrink-0 self-start lg:self-center">
                                <div className="text-center px-1">
                                    <div className="flex items-center gap-1.5 justify-center text-amber-500 dark:text-amber-400">
                                        <Flame size={22} className="fill-current animate-pulse" />
                                        <span className="text-2xl sm:text-3xl font-black">{streak}</span>
                                    </div>
                                    <span className="text-[10px] text-slate-600 dark:text-slate-400 font-black uppercase tracking-wider block mt-0.5">
                                        Chuỗi Ngày
                                    </span>
                                </div>

                                <div className="w-px h-10 bg-slate-200 dark:bg-slate-700" />

                                <div className="text-center px-1">
                                    <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 block">
                                        {completedDays} <span className="text-xs font-bold text-slate-400 dark:text-slate-500">/ 30</span>
                                    </span>
                                    <span className="text-[10px] text-slate-600 dark:text-slate-400 font-black uppercase tracking-wider block mt-0.5">
                                        Ngày Đã Học
                                    </span>
                                </div>

                                <div className="w-px h-10 bg-slate-200 dark:bg-slate-700" />

                                <div className="text-center px-1">
                                    <span className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 block">
                                        {progressPercent}%
                                    </span>
                                    <span className="text-[10px] text-slate-600 dark:text-slate-400 font-black uppercase tracking-wider block mt-0.5">
                                        Tiến Độ
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-6 pt-4 border-t border-slate-200/80 dark:border-slate-800/80 space-y-2">
                            <div className="flex justify-between items-center text-xs font-bold text-slate-600 dark:text-slate-400">
                                <span>Tiến trình hoàn thành toàn bộ lộ trình</span>
                                <span className="text-indigo-700 dark:text-indigo-400 font-extrabold">{completedDays} / 30 Ngày ({progressPercent}%)</span>
                            </div>
                            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-transparent">
                                <div 
                                    className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 rounded-full transition-all duration-700 shadow-xs" 
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* ── 2. BỘ BA CHUYÊN ĐỀ TỪ VỰNG TOEIC CỐT LÕI ── */}
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
                            <div>
                                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                                    <Target size={20} className="text-indigo-600 dark:text-indigo-400" />
                                    <span>Bộ Ba Chuyên Đề Từ Vựng Trọng Điểm</span>
                                </h2>
                                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                                    Ba kho tàng từ vựng cốt lõi kết hợp chuẩn mực giúp bứt phá điểm số từ mất gốc đến 800+
                                </p>
                            </div>
                            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-500 self-start sm:self-auto">
                                Giáo trình chuẩn ETS quốc tế
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Pillar 1: Từ Vựng ETS 2026 */}
                            <div className="relative group rounded-3xl p-5 border transition-all duration-300 bg-gradient-to-br from-blue-50/90 via-sky-50/40 to-white dark:from-slate-900/90 dark:via-blue-950/20 dark:to-slate-900 border-blue-200/80 dark:border-blue-900/50 shadow-[0_4px_20px_-4px_rgba(37,99,235,0.06)] hover:shadow-md hover:border-blue-400 dark:hover:border-blue-600 flex flex-col justify-between">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                                            <Award size={22} />
                                        </div>
                                        <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-full bg-blue-100/90 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60 shadow-2xs">
                                            {etsWordsCount || '1.626'} Từ Vựng
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                                            Từ Vựng ETS 2026
                                        </h3>
                                        <p className="text-xs font-bold text-blue-700 dark:text-blue-400 mt-0.5">
                                            800 LC + 800 RC Official
                                        </p>
                                        <p className="text-xs text-slate-700 dark:text-slate-400 mt-2 leading-relaxed line-clamp-2">
                                            Trọn bộ 1.626 từ vựng cốt lõi trích xuất trực tiếp từ đề thi ETS 2026 mới nhất của viện khảo thí ETS Hoa Kỳ.
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-5 pt-3 border-t border-blue-100/90 dark:border-slate-800/80 flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                                        Phân chia theo Part
                                    </span>
                                    <button
                                        onClick={() => handleJumpToTopic('ets2026')}
                                        className="text-xs font-black text-blue-700 dark:text-blue-400 hover:text-blue-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-all cursor-pointer"
                                    >
                                        Ôn luyện ETS 2026 <ArrowRight size={13} />
                                    </button>
                                </div>
                            </div>

                            {/* Pillar 2: 500 Từ Vựng Mất Gốc */}
                            <div className="relative group rounded-3xl p-5 border transition-all duration-300 bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-white dark:from-slate-900/90 dark:via-emerald-950/20 dark:to-slate-900 border-emerald-200/80 dark:border-emerald-900/50 shadow-[0_4px_20px_-4px_rgba(5,150,105,0.06)] hover:shadow-md hover:border-emerald-400 dark:hover:border-emerald-600 flex flex-col justify-between">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                                            <BookmarkCheck size={22} />
                                        </div>
                                        <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-full bg-emerald-100/90 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs">
                                            {toeic500Count || '500'} Từ Vựng
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                                            500 Từ Vựng Mất Gốc
                                        </h3>
                                        <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                                            20 Câu Chuyện Ngữ Cảnh
                                        </p>
                                        <p className="text-xs text-slate-700 dark:text-slate-400 mt-2 leading-relaxed line-clamp-2">
                                            Phương pháp học từ vựng qua 20 câu chuyện ngữ cảnh đời sống và công sở, giúp người mất gốc dễ nhớ và phản xạ tự nhiên.
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-5 pt-3 border-t border-emerald-100/90 dark:border-slate-800/80 flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                                        20 Story sinh động
                                    </span>
                                    <button
                                        onClick={() => handleJumpToTopic('toeic500')}
                                        className="text-xs font-black text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-all cursor-pointer"
                                    >
                                        Học qua Story <ArrowRight size={13} />
                                    </button>
                                </div>
                            </div>

                            {/* Pillar 3: 600 Từ Vựng TOEIC */}
                            <div className="relative group rounded-3xl p-5 border transition-all duration-300 bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-white dark:from-slate-900/90 dark:via-amber-950/20 dark:to-slate-900 border-amber-200/80 dark:border-amber-900/50 shadow-[0_4px_20px_-4px_rgba(217,119,6,0.06)] hover:shadow-md hover:border-amber-400 dark:hover:border-amber-600 flex flex-col justify-between">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="w-11 h-11 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
                                            <BookOpen size={22} />
                                        </div>
                                        <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-full bg-amber-100/90 dark:bg-amber-900/60 text-amber-900 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 shadow-2xs">
                                            {toeic600Count || '600'} Từ Vựng
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors">
                                            600 Từ Vựng TOEIC
                                        </h3>
                                        <p className="text-xs font-bold text-amber-800 dark:text-amber-400 mt-0.5">
                                            50 Chủ Đề Căn Bản
                                        </p>
                                        <p className="text-xs text-slate-700 dark:text-slate-400 mt-2 leading-relaxed line-clamp-2">
                                            50 chủ đề từ vựng kinh điển trong đề thi TOEIC: Hợp đồng, Tiếp thị, Nhân sự, Du lịch, Mua sắm và Tài chính ngân hàng.
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-5 pt-3 border-t border-amber-100/90 dark:border-slate-800/80 flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                                        50 Chủ đề nền tảng
                                    </span>
                                    <button
                                        onClick={() => handleJumpToTopic('toeic600')}
                                        className="text-xs font-black text-amber-800 dark:text-amber-400 hover:text-amber-900 flex items-center gap-1 group-hover:translate-x-0.5 transition-all cursor-pointer"
                                    >
                                        Vào 50 chủ đề <ArrowRight size={13} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── 3. FILTER & SEARCH BAR ── */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/90 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)]">
                        {/* Week & Status Tabs */}
                        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                            {[
                                { id: 'all', label: 'Tất cả 30 Ngày' },
                                { id: 1, label: 'Tuần 1' },
                                { id: 2, label: 'Tuần 2' },
                                { id: 3, label: 'Tuần 3' },
                                { id: 4, label: 'Tuần 4' },
                                { id: 'completed', label: `Đã học (${completedDays})` },
                                { id: 'uncompleted', label: `Chưa học (${30 - completedDays})` },
                            ].map(item => {
                                const isSelected = selectedWeekFilter === item.id;
                                return (
                                    <button
                                        key={String(item.id)}
                                        onClick={() => setSelectedWeekFilter(item.id)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                                            isSelected
                                                ? 'bg-indigo-600 text-white shadow-xs'
                                                : 'text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        {item.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Search Input */}
                        <div className="relative min-w-[200px] sm:max-w-xs">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="text"
                                value={searchFilter}
                                onChange={(e) => setSearchFilter(e.target.value)}
                                placeholder="Tìm theo chủ đề, ngữ pháp..."
                                className="w-full pl-9 pr-7 py-1.5 text-xs rounded-xl bg-slate-50 hover:bg-white focus:bg-white dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700 text-slate-900 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                            />
                            {searchFilter && (
                                <button
                                    onClick={() => setSearchFilter('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ── 4. WEEK ROADMAP & DAY CARDS ── */}
                    {(() => {
                        const weeksToRender = [1, 2, 3, 4].filter(weekNum => {
                            if (typeof selectedWeekFilter === 'number') return weekNum === selectedWeekFilter;
                            return true;
                        });

                        const matchingWeeks = weeksToRender.map(weekNum => {
                            let weekDays = TOEIC_30_DAYS_CURRICULUM.filter(d => d.week === weekNum);
                            
                            if (selectedWeekFilter === 'completed') {
                                weekDays = weekDays.filter(d => progress[d.day]);
                            } else if (selectedWeekFilter === 'uncompleted') {
                                weekDays = weekDays.filter(d => !progress[d.day]);
                            }

                            if (searchFilter.trim()) {
                                const q = searchFilter.toLowerCase().trim();
                                weekDays = weekDays.filter(d => 
                                    (d.title && d.title.toLowerCase().includes(q)) ||
                                    (d.grammarFocus && d.grammarFocus.toLowerCase().includes(q)) ||
                                    (d.vocabTopic && d.vocabTopic.toLowerCase().includes(q)) ||
                                    (d.objective && d.objective.toLowerCase().includes(q))
                                );
                            }

                            return { weekNum, weekDays };
                        }).filter(group => group.weekDays.length > 0);

                        if (matchingWeeks.length === 0) {
                            return (
                                <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                                        <Search size={24} />
                                    </div>
                                    <h3 className="text-base font-bold text-slate-800 dark:text-white">Không tìm thấy ngày học phù hợp</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                                        Hãy thử điều chỉnh từ khóa tìm kiếm hoặc bấm để xem lại toàn bộ các ngày học.
                                    </p>
                                    <button
                                        onClick={() => { setSelectedWeekFilter('all'); setSearchFilter(''); }}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                                    >
                                        Xem lại tất cả 30 ngày
                                    </button>
                                </div>
                            );
                        }

                        return matchingWeeks.map(({ weekNum, weekDays }) => {
                            const totalInWeek = TOEIC_30_DAYS_CURRICULUM.filter(d => d.week === weekNum).length;
                            const completedInWeek = TOEIC_30_DAYS_CURRICULUM.filter(d => d.week === weekNum && progress[d.day]).length;

                            return (
                                <div key={weekNum} className="space-y-4">
                                    {/* Week Header */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 border-b border-slate-200/70 dark:border-slate-800/80 pb-3">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-0.5 rounded-full border border-indigo-200/50 dark:border-indigo-900/30">
                                                    Tuần {weekNum}
                                                </span>
                                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                                    Đã học: {completedInWeek}/{totalInWeek} ngày
                                                </span>
                                            </div>
                                            <h3 className="text-sm sm:text-base font-black text-slate-800 dark:text-white">
                                                {weekNum === 1 && "Nền Tảng Từ Vựng & Cấu Trúc Đề Thi (Part 1 - 2)"}
                                                {weekNum === 2 && "Ngữ Pháp Cốt Lõi Part 5 & Đọc Điền Part 6"}
                                                {weekNum === 3 && "Luyện Đề Thực Chiến Nghe Hiểu & Đọc Hiểu Đoạn Đơn"}
                                                {weekNum === 4 && "Chiến Lược Thi Thực Chiến, Bẫy Đề & Hoàn Thiện"}
                                            </h3>
                                        </div>

                                        <button 
                                            onClick={() => handleReviewWeek(weekNum)}
                                            className="text-xs bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/50 px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 shadow-sm shrink-0 self-start sm:self-auto cursor-pointer"
                                        >
                                            <Layers size={14} /> Ôn Tập Tuần {weekNum}
                                        </button>
                                    </div>

                                    {/* Days Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                        {weekDays.map(day => {
                                            const isCompleted = progress[day.day];
                                            const badgeInfo = getPracticeTypeBadge(day.practiceType);

                                            return (
                                                <button
                                                    key={day.day}
                                                    onClick={() => handleSelectDay(day)}
                                                    className={`p-5 rounded-3xl border text-left flex flex-col justify-between min-h-[160px] transition-all duration-200 hover:scale-[1.015] cursor-pointer shadow-[0_2px_8px_-2px_rgba(15,23,42,0.04)] relative group bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800/80 ${
                                                        isCompleted 
                                                            ? 'ring-2 ring-emerald-500/30 border-emerald-500/60 bg-emerald-50/20 dark:bg-emerald-950/10'
                                                            : 'hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md'
                                                    }`}
                                                >
                                                    <div className="space-y-3">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[11px] font-mono font-black text-slate-500 dark:text-slate-500 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">
                                                                NGÀY {day.day < 10 ? `0${day.day}` : day.day}
                                                            </span>
                                                            {isCompleted ? (
                                                                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-900/30 flex items-center gap-1 shadow-2xs">
                                                                    <CheckCircle2 size={12} /> Đã học
                                                                </span>
                                                            ) : (
                                                                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200/60 dark:border-slate-700">
                                                                    Chưa học
                                                                </span>
                                                            )}
                                                        </div>

                                                        <h4 className="text-sm font-black text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">
                                                            {day.title.includes(': ') ? day.title.split(': ')[1] : day.title}
                                                        </h4>
                                                    </div>

                                                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/70 space-y-2">
                                                        <div className="flex items-center justify-between gap-1">
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border truncate max-w-[135px] ${badgeInfo.color}`}>
                                                                {badgeInfo.label}
                                                            </span>

                                                            {scores[day.day] && (
                                                                <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded border border-indigo-200/60 dark:border-indigo-900/30 shrink-0">
                                                                    {scores[day.day]}
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center justify-between text-[10px] text-slate-500 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 font-bold transition-colors">
                                                            <span className="truncate max-w-[130px]">{day.grammarFocus}</span>
                                                            <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        });
                    })()}

                    {/* Footer resets */}
                    <div className="flex justify-between items-center pt-4 border-t border-slate-200/60 dark:border-slate-800/60 text-xs text-slate-400">
                        <span>Lộ trình TOEIC 30 Ngày · Hệ thống học tập thông minh</span>
                        <button 
                            onClick={handleResetAllProgress}
                            className="font-bold text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                            <RotateCcw size={13} /> Đặt lại tiến trình học tập
                        </button>
                    </div>
                </div>
            ) : (
                
                // DAY WORKSPACE VIEW
                <div className="space-y-6 animate-fade-in">
                    
                    {/* Workspace Header */}
                    <div className="relative overflow-hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/80 dark:border-slate-800/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start sm:items-center gap-3.5">
                            <button 
                                onClick={handleBackToDashboard}
                                className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-2xl text-slate-600 dark:text-slate-300 transition-all cursor-pointer hover:scale-105 shrink-0"
                                title="Quay lại Lộ trình"
                            >
                                <ArrowLeft size={18} aria-hidden="true" />
                            </button>
                            <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <button
                                        onClick={handleBackToDashboard}
                                        className="text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
                                    >
                                        Lộ Trình 30 Ngày
                                    </button>
                                    <span className="text-slate-300 dark:text-slate-700">/</span>
                                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                                        Tuần {selectedDay.week}
                                    </span>
                                    <span className="text-slate-300 dark:text-slate-700">/</span>
                                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-full border border-indigo-200/50 dark:border-indigo-900/40">
                                        Ngày {selectedDay.day < 10 ? `0${selectedDay.day}` : selectedDay.day}
                                    </span>
                                    {(() => {
                                        const badge = getPracticeTypeBadge(selectedDay.practiceType);
                                        return (
                                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${badge.color}`}>
                                                {badge.label}
                                            </span>
                                        );
                                    })()}
                                </div>
                                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                                    {selectedDay.title}
                                </h1>
                            </div>
                        </div>

                        {/* Complete button status */}
                        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                            {progress[selectedDay.day] ? (
                                <div className="flex items-center gap-2">
                                    <span className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-black border border-emerald-200/60 dark:border-emerald-800/60 flex items-center gap-1.5">
                                        <CheckCircle2 size={15} aria-hidden="true" /> Đã hoàn thành
                                    </span>
                                    <button
                                        onClick={handleBackToDashboard}
                                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
                                    >
                                        Quay lại
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={handleMarkDayCompletedWithoutQuiz}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm shadow-emerald-500/20 hover:scale-[1.02] transition cursor-pointer"
                                >
                                    <CheckCircle2 size={15} aria-hidden="true" /> Đánh dấu hoàn thành
                                </button>
                            )}
                        </div>
                    </div>

                    {/* DAY WORKSPACE TABS */}
                    {!showGrammarDrill && !activeVocabStudyMode && (
                        <div className="flex bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm transition-colors gap-1.5 overflow-x-auto no-scrollbar">
                            {[
                                { id: 'theory', label: '1. Lý thuyết & Kỹ năng', icon: BookOpen },
                                { id: 'vocab', label: '2. Từ vựng cốt lõi', icon: Layers },
                                { id: 'practice', label: '3. Chọn phương pháp ôn từ vựng', icon: Sparkles }
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
                                            setPracticeMethod(null);
                                        }}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex-1 justify-center whitespace-nowrap cursor-pointer ${
                                            isActive 
                                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' 
                                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        <Icon size={14} aria-hidden="true" />
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* TAB VIEWPORTS */}
                    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/80 dark:border-slate-800/80 min-h-[420px] flex flex-col justify-between transition-colors">
                        
                        {/* ── GRAMMAR DRILL VIEWPORT ── */}
                        {showGrammarDrill ? (
                            <div className="space-y-4 flex-1">
                                <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
                                    <button
                                        onClick={() => setShowGrammarDrill(false)}
                                        className="text-xs font-bold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 cursor-pointer transition"
                                    >
                                        <ArrowLeft size={14} aria-hidden="true" /> Quay lại bài học Ngày {selectedDay.day}
                                    </button>
                                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 rounded-full border border-indigo-200/50 dark:border-indigo-900/30">
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
                                <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
                                    <button
                                        onClick={() => setActiveVocabStudyMode(null)}
                                        className="text-xs font-bold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 cursor-pointer transition"
                                    >
                                        <ArrowLeft size={14} aria-hidden="true" /> Quay lại danh sách từ vựng
                                    </button>
                                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 rounded-full border border-indigo-200/50 dark:border-indigo-900/30 capitalize">
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
                                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
                                                <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Mục tiêu ngày học</h4>
                                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{selectedDay.objective}</p>
                                            </div>
                                            
                                            <div className="prose dark:prose-invert max-w-none">
                                                {renderTheoryContent(selectedDay.theory)}
                                            </div>

                                            {/* Integrated Grammar Mode Entry */}
                                            {selectedDay.grammarFocus && (
                                                <div className="mt-8 bg-indigo-50/40 dark:bg-indigo-950/15 p-5 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                    <div className="space-y-1">
                                                        <h4 className="font-extrabold text-indigo-950 dark:text-indigo-300 text-sm">Luyện Ngữ Pháp Chuyên Sâu</h4>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">Tự động khởi chạy bài tập trắc nghiệm ngữ pháp AI về chủ đề: <strong className="text-indigo-600 dark:text-indigo-400">{selectedDay.grammarFocus}</strong>.</p>
                                                    </div>
                                                    <button
                                                        onClick={() => setShowGrammarDrill(true)}
                                                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm shadow-indigo-500/20 hover:scale-[1.01] transition shrink-0 cursor-pointer"
                                                    >
                                                        <Sparkles size={14} aria-hidden="true" /> Bắt đầu luyện ngay
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-6 border-t border-slate-200/70 dark:border-slate-800/80 flex justify-end">
                                            <button 
                                                onClick={() => setActiveTab('vocab')}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-sm shadow-indigo-500/20 hover:scale-[1.01] transition flex items-center gap-2 text-xs cursor-pointer"
                                            >
                                                Chuyển sang Từ vựng <ArrowRight size={14} aria-hidden="true" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* 2. VOCABULARY TAB */}
                                {activeTab === 'vocab' && (
                                    <div className="space-y-6 flex-1 flex flex-col justify-between">
                                        <div className="space-y-6">
                                            
                                            {/* Sub-tab Toolbars */}
                                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-100/80 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
                                                
                                                {/* Visual Selector List/Slideshow */}
                                                <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200/70 dark:border-slate-800/80 w-fit">
                                                    <button
                                                        onClick={() => setVocabSubTab('list')}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                                                            vocabSubTab === 'list'
                                                                ? 'bg-indigo-600 text-white shadow-sm'
                                                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                                        }`}
                                                    >
                                                        <LayoutGrid size={13} aria-hidden="true" />
                                                        <span>Danh sách từ</span>
                                                    </button>
                                                    <button
                                                        onClick={() => setVocabSubTab('context')}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                                                            vocabSubTab === 'context'
                                                                ? 'bg-indigo-600 text-white shadow-sm'
                                                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                                        }`}
                                                    >
                                                        <BookOpenCheck size={13} aria-hidden="true" />
                                                        <span>Học theo ngữ cảnh (Slide)</span>
                                                    </button>
                                                </div>

                                                {/* Mini sub-learning modes launcher */}
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mr-1">Các chế độ ôn tập:</span>
                                                    <button
                                                        onClick={() => setActiveVocabStudyMode('flashcards')}
                                                        className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-blue-100 dark:hover:bg-blue-900/50 transition cursor-pointer flex items-center gap-1"
                                                    >
                                                        <Layers size={11} aria-hidden="true" /> Luyện Flashcard
                                                    </button>
                                                    <button
                                                        onClick={() => setActiveVocabStudyMode('quiz')}
                                                        className="px-3 py-1.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-purple-100 dark:hover:bg-purple-900/50 transition cursor-pointer flex items-center gap-1"
                                                    >
                                                        <CheckCircle2 size={11} aria-hidden="true" /> Luyện Trắc nghiệm
                                                    </button>
                                                    <button
                                                        onClick={() => setActiveVocabStudyMode('typing')}
                                                        className="px-3 py-1.5 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-amber-100 dark:hover:bg-amber-900/50 transition cursor-pointer flex items-center gap-1"
                                                    >
                                                        <Keyboard size={11} aria-hidden="true" /> Luyện Gõ từ
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
                                                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
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
                                                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                                                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
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
                                                        <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                                            Chủ đề: {selectedDay.vocabTopic || "Học chung"}
                                                        </span>
                                                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
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
                                                                    className="p-5 bg-white dark:bg-slate-800/40 border border-slate-200/90 dark:border-slate-800/80 rounded-2xl flex justify-between items-start group shadow-[0_2px_8px_-2px_rgba(15,23,42,0.04)] hover:shadow-md hover:border-indigo-400/80 hover:scale-[1.01] transition-all"
                                                                >
                                                                    <div className="space-y-2">
                                                                        <div className="flex items-center gap-2 flex-wrap">
                                                                            <h4 className="text-lg font-black text-slate-900 dark:text-white leading-none">{item.en}</h4>
                                                                            <span className="text-[10px] font-bold text-indigo-800 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/30 px-2 py-0.5 rounded leading-none">
                                                                                {item.category}
                                                                            </span>
                                                                            {item.ipa && (
                                                                                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">{item.ipa}</span>
                                                                            )}
                                                                        </div>
                                                                        <p className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">{item.vi}</p>
                                                                        <p className="text-xs text-slate-700 dark:text-slate-400 italic leading-relaxed">
                                                                            <strong className="not-italic text-[10px] font-bold uppercase tracking-wider text-slate-500 mr-1">Ex:</strong>
                                                                            {item.example}
                                                                        </p>
                                                                    </div>
                                                                    <button 
                                                                        onClick={(e) => speak(item.en, e, 'en-US')}
                                                                        className="p-2 bg-slate-50 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/30 text-slate-500 hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-400 rounded-full border border-slate-200/90 dark:border-slate-700 shadow-2xs cursor-pointer shrink-0 transition-colors"
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
                                                                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-500/20 hover:scale-[1.01] transition cursor-pointer"
                                                            >
                                                                Từ tiếp theo
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => {
                                                                    setVocabSubTab('list');
                                                                    toast.success("Tuyệt vời! Bạn đã hoàn thành 10 từ theo ngữ cảnh.");
                                                                }}
                                                                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-sm shadow-emerald-500/20"
                                                            >
                                                                <CheckCircle2 size={13} aria-hidden="true" /> Hoàn thành 10 từ
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-6 border-t border-slate-200/70 dark:border-slate-800/80 flex justify-between items-center">
                                            <button 
                                                onClick={() => setActiveTab('theory')}
                                                className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
                                            >
                                                Quay lại Lý thuyết
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    setActiveTab('practice');
                                                    setPracticeMethod(null);
                                                }}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl hover:scale-[1.01] transition flex items-center gap-2 text-xs cursor-pointer shadow-sm shadow-indigo-500/20"
                                            >
                                                Chuyển sang Ôn từ vựng <ArrowRight size={14} aria-hidden="true" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* 3. PRACTICE TAB */}
                                {activeTab === 'practice' && (
                                    <div className="space-y-6 flex-1 flex flex-col justify-between">
                                        {/* VIEW 1: METHOD SELECTION SCREEN */}
                                        {!practiceMethod && (
                                            <div className="space-y-6 animate-fade-in flex-1 flex flex-col justify-between">
                                                <div className="space-y-6">
                                                    {/* Header Banner */}
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-0.5 rounded-full border border-indigo-200/50 dark:border-indigo-900/30">
                                                                    Ôn Tập & Luyện Phản Xạ
                                                                </span>
                                                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                                                    Ngày {selectedDay.day < 10 ? `0${selectedDay.day}` : selectedDay.day}
                                                                </span>
                                                            </div>
                                                            <h3 className="text-xl font-black text-slate-900 dark:text-white">
                                                                Chọn Phương Pháp Ôn Từ Vựng
                                                            </h3>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                                Lựa chọn hình thức ôn tập phù hợp để củng cố và đưa từ vựng hôm nay ({currentPartWords.length} từ) vào trí nhớ dài hạn.
                                                            </p>
                                                        </div>

                                                        <div className="text-left sm:text-right shrink-0">
                                                            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                                                                Chủ đề từ vựng
                                                            </span>
                                                            <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                                                                {selectedDay.vocabTopic || "Từ vựng cốt lõi"}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Part selector if day has multiple parts */}
                                                    {numParts > 1 && (
                                                        <div className="bg-slate-50/80 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
                                                            <span className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                                                                Phạm vi từ vựng ({currentPartWords.length}/{dayWords.length} từ):
                                                            </span>
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <button
                                                                    onClick={() => setVocabPartIndices([-1])}
                                                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                                                                        vocabPartIndices.includes(-1)
                                                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                                                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
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
                                                                        }}
                                                                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                                                                            !vocabPartIndices.includes(-1) && vocabPartIndices.includes(i)
                                                                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                                                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                                                                        }`}
                                                                    >
                                                                        {part.label || `Phần ${i + 1}`} ({part.count} từ)
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* 3 Main Method Cards */}
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                                        {/* Card 1: Luyện Flashcard */}
                                                        <div 
                                                            onClick={() => setPracticeMethod('flashcards')}
                                                            className="group relative bg-gradient-to-br from-blue-50/60 to-indigo-50/30 dark:from-slate-800/80 dark:to-blue-950/20 border-2 border-blue-200/80 dark:border-blue-900/40 hover:border-blue-500 dark:hover:border-blue-400 p-6 rounded-3xl cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between"
                                                        >
                                                            <div className="space-y-4">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-110 transition-transform">
                                                                        <Layers size={24} />
                                                                    </div>
                                                                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/50 px-2.5 py-1 rounded-full">
                                                                        Ghi nhớ nhanh
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-lg font-black text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                                        Luyện Flashcard
                                                                    </h4>
                                                                    <p className="text-xs text-gray-600 dark:text-slate-400 mt-2 leading-relaxed">
                                                                        Lật thẻ 2 mặt tương tác, nghe phát âm giọng chuẩn bản xứ, trau dồi phiên âm IPA và câu ví dụ thực tế.
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="mt-6 pt-4 border-t border-blue-100 dark:border-slate-800 flex items-center justify-between">
                                                                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                                                                    {currentPartWords.length} từ vựng
                                                                </span>
                                                                <span className="text-xs font-black text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                                                    Bắt đầu <ArrowRight size={14} />
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Card 2: Luyện Trắc nghiệm */}
                                                        <div 
                                                            onClick={() => setPracticeMethod('quiz')}
                                                            className="group relative bg-gradient-to-br from-purple-50/60 to-fuchsia-50/30 dark:from-slate-800/80 dark:to-purple-950/20 border-2 border-purple-200/80 dark:border-purple-900/40 hover:border-purple-500 dark:hover:border-purple-400 p-6 rounded-3xl cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between"
                                                        >
                                                            <div className="space-y-4">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20 group-hover:scale-110 transition-transform">
                                                                        <CheckCircle2 size={24} />
                                                                    </div>
                                                                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/50 px-2.5 py-1 rounded-full">
                                                                        Phản xạ 4 đáp án
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-lg font-black text-gray-800 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                                                        Luyện Trắc nghiệm
                                                                    </h4>
                                                                    <p className="text-xs text-gray-600 dark:text-slate-400 mt-2 leading-relaxed">
                                                                        Chọn đáp án đúng từ 4 phương án ngẫu nhiên, giúp rèn luyện phản xạ nhanh và củng cố nhận diện nghĩa của từ.
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="mt-6 pt-4 border-t border-purple-100 dark:border-slate-800 flex items-center justify-between">
                                                                <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                                                                    {currentPartWords.length} từ vựng
                                                                </span>
                                                                <span className="text-xs font-black text-purple-600 dark:text-purple-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                                                    Bắt đầu <ArrowRight size={14} />
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Card 3: Luyện Gõ từ */}
                                                        <div 
                                                            onClick={() => setPracticeMethod('typing')}
                                                            className="group relative bg-gradient-to-br from-amber-50/60 to-orange-50/30 dark:from-slate-800/80 dark:to-amber-950/20 border-2 border-amber-200/80 dark:border-amber-900/40 hover:border-amber-500 dark:hover:border-amber-400 p-6 rounded-3xl cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between"
                                                        >
                                                            <div className="space-y-4">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-110 transition-transform">
                                                                        <Keyboard size={24} />
                                                                    </div>
                                                                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/50 px-2.5 py-1 rounded-full">
                                                                        Chính tả & Gõ phím
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-lg font-black text-gray-800 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                                                        Luyện Gõ từ
                                                                    </h4>
                                                                    <p className="text-xs text-gray-600 dark:text-slate-400 mt-2 leading-relaxed">
                                                                        Luyện gõ chính xác từng ký tự theo gợi ý phiên âm và nghĩa tiếng Việt, giúp nhớ từ chuẩn xác và bền vững.
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="mt-6 pt-4 border-t border-amber-100 dark:border-slate-800 flex items-center justify-between">
                                                                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                                                                    {currentPartWords.length} từ vựng
                                                                </span>
                                                                <span className="text-xs font-black text-amber-600 dark:text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                                                    Bắt đầu <ArrowRight size={14} />
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Secondary Box: Đề thi thử TOEIC AI (5 câu) */}
                                                    <div className={`p-5 rounded-3xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                                                        isAiLocked 
                                                            ? 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-80' 
                                                            : 'bg-gradient-to-r from-indigo-50/60 via-purple-50/40 to-slate-50 dark:from-slate-800/80 dark:via-indigo-950/20 dark:to-slate-900 border-indigo-100 dark:border-indigo-900/30'
                                                    }`}>
                                                        <div className="flex items-start sm:items-center gap-3.5">
                                                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                                                                isAiLocked ? 'bg-slate-400 dark:bg-slate-700 text-white' : 'bg-indigo-600 text-white'
                                                            }`}>
                                                                {isAiLocked ? <Lock size={18} /> : <Sparkles size={20} />}
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <h5 className="font-extrabold text-sm text-gray-800 dark:text-white">
                                                                        Đề Thi Thử TOEIC AI (5 câu)
                                                                    </h5>
                                                                    {isAiLocked ? (
                                                                        <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full border border-rose-200/50 dark:border-rose-900/30 flex items-center gap-1">
                                                                            <Lock size={10} /> Đang tạm khóa bởi Quản trị viên
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full border border-indigo-200/50 dark:border-indigo-900/30">
                                                                            Bổ trợ
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                                                                    {isAiLocked
                                                                        ? 'Chức năng AI hiện đang tạm tắt để học viên ưu tiên rèn luyện từ vựng qua Flashcard, Trắc nghiệm và Gõ từ.'
                                                                        : `Kiểm tra kiến thức ngữ pháp & kỹ năng (${selectedDay.grammarFocus}) do Gemini AI biên soạn.`}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <button
                                                            onClick={() => {
                                                                if (isAiLocked) {
                                                                    toast.warning("Tính năng AI hiện đang tạm khóa bởi Quản trị viên hệ thống!");
                                                                    return;
                                                                }
                                                                setPracticeMethod('ai_quiz');
                                                            }}
                                                            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm shrink-0 cursor-pointer ${
                                                                isAiLocked
                                                                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'
                                                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                                            }`}
                                                        >
                                                            {isAiLocked ? <Lock size={14} /> : <Sparkles size={14} />} 
                                                            {isAiLocked ? 'AI Tạm Khóa' : 'Làm đề thi thử AI'}
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Footer buttons */}
                                                <div className="pt-6 border-t border-slate-200/70 dark:border-slate-800/80 flex justify-between items-center">
                                                    <button 
                                                        onClick={() => setActiveTab('vocab')}
                                                        className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5 cursor-pointer transition"
                                                    >
                                                        <ArrowLeft size={14} aria-hidden="true" /> Quay lại danh sách từ vựng
                                                    </button>
                                                    <button
                                                        onClick={handleMarkDayCompletedWithoutQuiz}
                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm shadow-emerald-500/20 hover:scale-[1.01] transition cursor-pointer"
                                                    >
                                                        <CheckCircle2 size={14} aria-hidden="true" /> Đánh dấu hoàn thành ngày học
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* VIEW 2: FLASHCARD PRACTICE */}
                                        {practiceMethod === 'flashcards' && (
                                            <div className="space-y-4 flex-1 animate-fade-in">
                                                <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-slate-800">
                                                    <button
                                                        onClick={() => setPracticeMethod(null)}
                                                        className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1.5 cursor-pointer py-1 px-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                                    >
                                                        <ArrowLeft size={14} /> Quay lại chọn phương pháp
                                                    </button>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-black text-blue-600 bg-blue-50 dark:bg-blue-950/30 px-3 py-1 rounded-full border border-blue-200/40 dark:border-blue-900/40 flex items-center gap-1.5">
                                                            <Layers size={13} /> Luyện Flashcard ({currentPartWords.length} từ)
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="pt-2">
                                                    <FlashcardMode words={currentPartWords} speak={speak} />
                                                </div>
                                            </div>
                                        )}

                                        {/* VIEW 3: QUIZ PRACTICE */}
                                        {practiceMethod === 'quiz' && (
                                            <div className="space-y-4 flex-1 animate-fade-in">
                                                <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-slate-800">
                                                    <button
                                                        onClick={() => setPracticeMethod(null)}
                                                        className="text-xs font-bold text-slate-500 hover:text-purple-600 flex items-center gap-1.5 cursor-pointer py-1 px-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                                    >
                                                        <ArrowLeft size={14} /> Quay lại chọn phương pháp
                                                    </button>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-black text-purple-600 bg-purple-50 dark:bg-purple-950/30 px-3 py-1 rounded-full border border-purple-200/40 dark:border-purple-900/40 flex items-center gap-1.5">
                                                            <CheckCircle2 size={13} /> Luyện Trắc nghiệm ({currentPartWords.length} từ)
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="pt-2">
                                                    <QuizMode words={currentPartWords} speak={speak} />
                                                </div>
                                            </div>
                                        )}

                                        {/* VIEW 4: TYPING PRACTICE */}
                                        {practiceMethod === 'typing' && (
                                            <div className="space-y-4 flex-1 animate-fade-in">
                                                <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-slate-800">
                                                    <button
                                                        onClick={() => setPracticeMethod(null)}
                                                        className="text-xs font-bold text-slate-500 hover:text-amber-600 flex items-center gap-1.5 cursor-pointer py-1 px-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                                    >
                                                        <ArrowLeft size={14} /> Quay lại chọn phương pháp
                                                    </button>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-black text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-3 py-1 rounded-full border border-amber-200/40 dark:border-amber-900/40 flex items-center gap-1.5">
                                                            <Keyboard size={13} /> Luyện Gõ từ ({currentPartWords.length} từ)
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="pt-2">
                                                    <TypingMode words={currentPartWords} speak={speak} />
                                                </div>
                                            </div>
                                        )}

                                        {/* VIEW 5: AI QUIZ GENERATOR */}
                                        {practiceMethod === 'ai_quiz' && (
                                            <div className="space-y-6 flex-1 flex flex-col justify-between animate-fade-in">
                                                <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-slate-800">
                                                    <button
                                                        onClick={() => setPracticeMethod(null)}
                                                        className="text-xs font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1.5 cursor-pointer py-1 px-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                                    >
                                                        <ArrowLeft size={14} /> Quay lại chọn phương pháp
                                                    </button>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 px-3 py-1 rounded-full border border-indigo-200/40 dark:border-indigo-900/40 flex items-center gap-1.5">
                                                            <Sparkles size={13} /> Đề thi thử TOEIC AI
                                                        </span>
                                                    </div>
                                                </div>

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
                                                        {isAiLocked ? (
                                                            <div className="max-w-md mx-auto space-y-4 p-6 rounded-3xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 text-center animate-fade-in">
                                                                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                                                                    <Lock size={28} />
                                                                </div>
                                                                <div>
                                                                    <h3 className="text-base font-black text-gray-800 dark:text-white">Tính Năng AI Đang Tạm Khóa</h3>
                                                                    <p className="text-xs text-gray-600 dark:text-slate-400 mt-2 leading-relaxed">
                                                                        Quản trị viên đang tạm khóa tính năng AI trên toàn hệ thống để học viên ưu tiên ôn luyện từ vựng qua Flashcard, Trắc nghiệm và Luyện gõ từ vựng.
                                                                    </p>
                                                                </div>
                                                                <button
                                                                    onClick={() => setPracticeMethod(null)}
                                                                    className="px-5 py-2.5 bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold transition cursor-pointer shadow-sm"
                                                                >
                                                                    Chọn Phương Pháp Ôn Tập Khác
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <>
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
                                                            </>
                                                        )}
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
                                                            <div className="mt-8 p-6 bg-slate-50/70 dark:bg-slate-800/50 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-center transition-all shadow-sm animate-fade-in">
                                                                {quizScore === quizData.questions.length && (
                                                                    <div className="flex justify-center mb-2 text-amber-500 animate-bounce">
                                                                        <Award size={48} aria-hidden="true" />
                                                                    </div>
                                                                )}
                                                                <h4 className="text-lg font-black text-slate-900 dark:text-white mb-2">Báo Cáo Điểm Số</h4>
                                                                <p className="text-4xl font-black text-emerald-600 dark:text-emerald-400 mb-2">
                                                                    {quizScore} / {quizData.questions.length}
                                                                </p>
                                                                <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 max-w-sm mx-auto font-medium">
                                                                    {quizScore === quizData.questions.length ? "🌟 Hoàn hảo! Bạn đã sẵn sàng chinh phục ngày tiếp theo." : 
                                                                     quizScore >= quizData.questions.length / 2 ? "👍 Rất tốt! Hãy nghiên cứu thêm giải thích bên dưới để sửa các lỗi sai." : 
                                                                     "💪 Tiếp tục cố gắng nhé! Đọc kỹ phần giải thích đáp án và ôn lại lý thuyết."}
                                                                </p>
                                                                <div className="flex items-center justify-center gap-3">
                                                                    <button 
                                                                        onClick={handleGenerateQuiz}
                                                                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-sm shadow-indigo-500/20 hover:scale-[1.01] transition text-xs flex items-center gap-1.5 cursor-pointer"
                                                                    >
                                                                        <RefreshCw size={12} aria-hidden="true" /> Làm đề khác
                                                                    </button>
                                                                    <button 
                                                                        onClick={handleBackToDashboard}
                                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-sm shadow-emerald-500/20 hover:scale-[1.01] transition text-xs flex items-center gap-1.5 cursor-pointer"
                                                                    >
                                                                        Hoàn thành bài & Quay lại
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
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
