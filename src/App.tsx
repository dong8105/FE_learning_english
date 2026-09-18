import React, { useState, useEffect, Suspense, lazy, useMemo, useCallback } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import UnitSelector from './components/UnitSelector';
import VoiceSettings from './components/VoiceSettings';
import GlobalSearchModal from './components/GlobalSearchModal';
import BottomNav from './components/BottomNav';
import NotFound404 from './components/NotFound404';
import { audioManager } from './utils/audioManager';

import { AiStatusProvider } from './components/AiStatusProvider';
import AiStatusBadge from './components/AiStatusBadge';
import AiDashboardModal from './components/AiDashboardModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { VisibilityProvider, useVisibility, TOPIC_ALIASES_MAP, getVocabCategory } from './context/VisibilityContext';
import AuthModal from './components/AuthModal';
import { defaultRoutePolicy, IRouteResolution } from './domain/routePolicy';
import { vocabularyApi } from './api/vocabularyApi';
import { initAntiTamper } from './utils/antiTamper';
import { usePresenceHeartbeat } from './hooks/usePresenceHeartbeat';
import { Terminal } from 'lucide-react';
import AdminLogModal from './components/AdminLogModal';
import { adminLogger } from './utils/logger';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Lazy loaded modes for instant initial load and code splitting
const HomePage = lazy(() => import('./components/HomePage'));
const LoginPage = lazy(() => import('./components/LoginPage'));
const DashboardMode = lazy(() => import('./components/DashboardMode'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const FlashcardMode = lazy(() => import('./components/FlashcardMode'));
const QuizMode = lazy(() => import('./components/QuizMode'));
const DictationMode = lazy(() => import('./components/DictationMode'));
const MatchMode = lazy(() => import('./components/MatchMode'));
const TypingMode = lazy(() => import('./components/TypingMode'));
const RelatedWordsMode = lazy(() => import('./components/RelatedWordsMode'));
const WordManager = lazy(() => import('./components/WordManager'));
const ReadingMode = lazy(() => import('./components/ReadingMode'));
const SpeakingMode = lazy(() => import('./components/SpeakingMode'));
const GrammarMode = lazy(() => import('./components/GrammarMode'));
const MixedTestMode = lazy(() => import('./components/MixedTestMode'));
const MixedGameMode = lazy(() => import('./components/MixedGameMode'));
const RecommendationsMode = lazy(() => import('./components/RecommendationsMode'));
const SRSMode = lazy(() => import('./components/SRSMode'));
const OptimalLearningMode = lazy(() => import('./components/OptimalLearningMode'));
const Toeic30DayMode = lazy(() => import('./components/Toeic30DayMode'));
const Toeic500Mode = lazy(() => import('./components/Toeic500Mode'));
const Toeic600Mode = lazy(() => import('./components/Toeic600Mode'));
const Ets2026Mode = lazy(() => import('./components/Ets2026Mode'));
const Sequential3StepMode = lazy(() => import('./components/Sequential3StepMode'));
const Ets2026IpaMode = lazy(() => import('./components/Ets2026IpaMode'));
const JapaneseMinnaMode = lazy(() => import('./components/JapaneseMinnaMode'));
const MemoryMatchGame = lazy(() => import('./components/games/MemoryMatchGame'));
const SurvivalGame = lazy(() => import('./components/games/SurvivalGame'));
const HangmanGame = lazy(() => import('./components/games/HangmanGame'));
const FallingWordsGame = lazy(() => import('./components/games/FallingWordsGame'));
const WordScrambleGame = lazy(() => import('./components/games/WordScrambleGame'));

// Static module-level constants (outside component to guarantee stable references and avoid hook churn)
const VALID_TABS = new Set([
  'home', 'login', 'dashboard', 'admin_dashboard', 'admin_visibility', 'toeic30', 'toeic500', 'toeic600', 'ets2026', 'japaneseMinna',
  'optimal', 'sequential3', 'flashcards', 'quiz', 'dictation', 'ipa',
  'match', 'typing', 'related', 'recommendations', 'srs', 'manage',
  'reading', 'grammar', 'mixed', 'speaking',
  'game_memory', 'game_survival', 'game_hangman', 'game_falling', 'game_scramble'
]);

const CHUYEN_DE_TABS = ['japaneseMinna', 'toeic30', 'toeic500', 'toeic600', 'ets2026'];
const GRAMMAR_TABS = ['reading', 'grammar', 'mixed', 'speaking'];
const GAME_TABS = ['game_memory', 'game_survival', 'game_hangman', 'game_falling', 'game_scramble'];

function AppContent() {
  const { user, isAdmin, openAuthModal, getUserStorageKey } = useAuth();
  const { isTopicVisible, isSectionVisible, isVoiceSettingsVisible, isVocabCategoryVisible, updateSettings: updateVisibilitySettings, settings: visibilitySettings } = useVisibility();
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  // Activate Anti-Tamper & Anti-Cheat protection (F12, right-click, console warning)
  useEffect(() => {
    let cleanup = initAntiTamper(isAdmin);
    const handleToggle = () => {
      if (cleanup) cleanup();
      cleanup = initAntiTamper(isAdmin);
    };
    window.addEventListener('admin_logs_toggle', handleToggle);
    return () => {
      window.removeEventListener('admin_logs_toggle', handleToggle);
      if (cleanup) cleanup();
    };
  }, [isAdmin]);

  // Router resolution logic with 403 / 404 / Auth checks (Delegated to RoutePolicy - SRP)
  const resolveRoute = useCallback((pathname: string): IRouteResolution => {
    let visSettings = null;
    try {
      const rawSettings = localStorage.getItem('engmaster_visibility_settings');
      if (rawSettings) visSettings = JSON.parse(rawSettings);
    } catch {}

    const effectiveUser = user || (() => {
      try {
        const saved = localStorage.getItem('engmaster_user');
        return saved ? JSON.parse(saved) : null;
      } catch {
        return null;
      }
    })();
    const effectiveAdmin = isAdmin || (effectiveUser?.role === 'admin');

    return defaultRoutePolicy.resolveRoute({
      pathname,
      user: effectiveUser,
      isAdmin: effectiveAdmin,
      validTabs: VALID_TABS,
      visibilitySettings: visSettings,
    });
  }, [user, isAdmin]);

  const [routeState, setRouteState] = useState(() => resolveRoute(window.location.pathname));
  const [activeTab, setActiveTab] = useState(() => routeState.tab);
  const [adminInitialSubTab, setAdminInitialSubTab] = useState<any>(() => routeState.subTab);

  // Mở luồng heartbeat theo dõi trạng thái hiện diện người dùng theo tab thực tế
  usePresenceHeartbeat(activeTab);

  // Sync state on browser Back / Forward
  useEffect(() => {
    const handlePopState = () => {
      const res = resolveRoute(window.location.pathname);
      setRouteState(res);
      if (res.status === 'ok') {
        setActiveTab(res.tab);
        if (res.subTab) {
          setAdminInitialSubTab(res.subTab);
        }
        if (res.requiredAuth) {
          window.history.replaceState(null, '', '/login');
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [resolveRoute]);

  // Re-verify route when user or admin status changes (login / logout)
  useEffect(() => {
    const res = resolveRoute(window.location.pathname);
    setRouteState(res);
    if (res.status === 'ok') {
      setActiveTab(res.tab);
      if (res.subTab) {
        setAdminInitialSubTab(res.subTab);
      }
      if (res.requiredAuth) {
        window.history.replaceState(null, '', '/login');
      }
    } else if (res.status === 'forbidden') {
      toast.warning('Đường dẫn này yêu cầu tài khoản Quản trị viên (Admin).');
    }
  }, [user, isAdmin, resolveRoute]);

  // Sync if current tab becomes hidden for non-admin
  useEffect(() => {
    if (!isAdmin) {
      if (CHUYEN_DE_TABS.includes(activeTab)) {
        if (!isTopicVisible(activeTab) || !isVocabCategoryVisible('chuyende')) {
          setActiveTab('dashboard');
          window.history.replaceState(null, '', '/');
        }
      }
      if (!isSectionVisible('grammar') && GRAMMAR_TABS.includes(activeTab)) {
        setActiveTab('dashboard');
        window.history.replaceState(null, '', '/');
      }
      if (!isSectionVisible('games') && GAME_TABS.includes(activeTab)) {
        setActiveTab('dashboard');
        window.history.replaceState(null, '', '/');
      }
    }
  }, [activeTab, isAdmin, isTopicVisible, isVocabCategoryVisible, isSectionVisible]);

  const handleNavigateTab = (tab: string) => {
    // Check both React user state and localStorage to prevent stale closure during login transitions
    const effectiveUser = user || (() => {
      try {
        const saved = localStorage.getItem('engmaster_user');
        return saved ? JSON.parse(saved) : null;
      } catch {
        return null;
      }
    })();
    const effectiveAdmin = isAdmin || (effectiveUser?.role === 'admin');

    // 🔒 Bắt buộc đăng nhập để bắt đầu học
    if (!effectiveUser && tab !== 'home' && tab !== 'login') {
      toast.warning('Vui lòng đăng nhập để bắt đầu học và lưu tiến độ!');
      sessionStorage.setItem('redirectAfterLogin', tab);
      window.history.pushState(null, '', '/login');
      const res = resolveRoute('/login');
      setRouteState(res);
      setActiveTab('login');
      setIsSidebarOpen(false);
      return;
    }

    // 🔒 Kiểm tra quyền Admin trước khi vào các trang quản trị
    if ((tab === 'admin_dashboard' || tab === 'admin_visibility' || tab === 'manage') && !effectiveAdmin) {
      toast.error('Trang Quản trị & Phân quyền chỉ dành riêng cho Quản trị viên (Admin). Vui lòng đăng nhập tài khoản Admin!');
      openAuthModal();
      return;
    }

    // Điều hướng trực tiếp đến tab Phân Quyền trong Admin Dashboard
    if (tab === 'admin_visibility') {
      setAdminInitialSubTab('visibility');
      window.history.pushState(null, '', '/admin?tab=visibility');
      const res = resolveRoute('/admin?tab=visibility');
      setRouteState(res);
      setActiveTab('admin_dashboard');
      setIsSidebarOpen(false);
      return;
    }

    // 🔒 Kiểm tra nếu chuyên đề đang bị Admin ẩn thì không cho học viên vào
    if (!effectiveAdmin) {
      if (CHUYEN_DE_TABS.includes(tab) && (!isTopicVisible(tab) || !isVocabCategoryVisible('chuyende'))) {
        toast.warning('Chuyên đề này hiện đang tạm ẩn.');
        return;
      }
      if (GRAMMAR_TABS.includes(tab) && !isSectionVisible('grammar')) {
        toast.warning('Phân khu Luyện câu & Ngữ pháp hiện đang tạm ẩn.');
        return;
      }
      if (GAME_TABS.includes(tab) && !isSectionVisible('games')) {
        toast.warning('Khu vực Trò chơi hiện đang tạm ẩn.');
        return;
      }
    }

    let targetUrl = `/${tab}`;
    if (tab === 'dashboard') targetUrl = '/';
    else if (tab === 'admin_dashboard') {
      setAdminInitialSubTab(undefined);
      targetUrl = '/admin';
    }
    else if (tab === 'home') targetUrl = '/home';
    else if (tab === 'login') targetUrl = '/login';

    window.history.pushState(null, '', targetUrl);
    const res = resolveRoute(targetUrl);
    setRouteState(res);
    if (res.status === 'ok') {
      setActiveTab(res.tab);
    }
    setIsSidebarOpen(false);
  };

  const [selectedGroup, setSelectedGroup] = useState({ type: 'all' });
  const [words, setWords] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(() => localStorage.getItem('selectedVoice') || '');
  const [speechRate, setSpeechRate] = useState(() => {
    const saved = localStorage.getItem('speechRate');
    return saved ? parseFloat(saved) : 0.8;
  });
  const [globalRandomizeVoice, setGlobalRandomizeVoice] = useState(() => {
    const saved = localStorage.getItem('globalRandomizeVoice');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [selectedJapaneseVoice, setSelectedJapaneseVoice] = useState(() => localStorage.getItem('selectedJapaneseVoice') || '');
  const [japaneseSpeechRate, setJapaneseSpeechRate] = useState(() => {
    const saved = localStorage.getItem('japaneseSpeechRate');
    return saved ? parseFloat(saved) : 0.85;
  });

  const handleSetSelectedVoice = (v: string) => {
    setSelectedVoice(v);
    localStorage.setItem('selectedVoice', v);
  };
  const handleSetSpeechRate = (r: number) => {
    setSpeechRate(r);
    localStorage.setItem('speechRate', r.toString());
  };
  const handleSetGlobalRandomizeVoice = (b: boolean) => {
    setGlobalRandomizeVoice(b);
    localStorage.setItem('globalRandomizeVoice', JSON.stringify(b));
  };
  const handleSetSelectedJapaneseVoice = (v: string) => {
    setSelectedJapaneseVoice(v);
    localStorage.setItem('selectedJapaneseVoice', v);
  };
  const handleSetJapaneseSpeechRate = (r: number) => {
    setJapaneseSpeechRate(r);
    localStorage.setItem('japaneseSpeechRate', r.toString());
  };
  const handleToggleAdminVoiceVisibility = async (lang: 'en' | 'ja') => {
    if (lang === 'en') {
      const next = visibilitySettings.showEnglishVoiceSettings === false ? true : false;
      await updateVisibilitySettings({ showEnglishVoiceSettings: next });
    } else {
      const next = visibilitySettings.showJapaneseVoiceSettings === false ? true : false;
      await updateVisibilitySettings({ showJapaneseVoiceSettings: next });
    }
  };
  const [streak, setStreak] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAdminLogOpen, setIsAdminLogOpen] = useState(false);
  const [isSfxMuted, setIsSfxMuted] = useState(() => 
    typeof audioManager?.isMuted === 'function' ? audioManager.isMuted() : false
  );

  const handleToggleSfx = () => {
    const nextState = typeof audioManager?.toggleMute === 'function' 
      ? audioManager.toggleMute() 
      : !isSfxMuted;
    setIsSfxMuted(nextState);
  };

  // Global keyboard shortcut Ctrl+K to open Quick Search, Ctrl+Shift+L to open Admin Logs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      if (isCtrlOrCmd && !e.shiftKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
      // Ctrl + Shift + L to toggle Admin Logs
      if (isCtrlOrCmd && e.shiftKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        setIsAdminLogOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Isolated streak tracking per user & Sync with MySQL database
  useEffect(() => {
    let isMounted = true;

    const syncStreak = async () => {
      const today = new Date().toDateString();
      const streakKey = getUserStorageKey('streakCount');
      const dateKey = getUserStorageKey('lastActiveDate');

      let currentStreak = parseInt(localStorage.getItem(streakKey) || '0', 10);
      let lastActive = localStorage.getItem(dateKey);

      const token = localStorage.getItem('engmaster_token');

      // 1. If logged in, fetch remote streak from MySQL
      if (user?.id) {
        try {
          const headers: Record<string, string> = {};
          if (token) headers['Authorization'] = `Bearer ${token}`;
          const res = await fetch(`${API_BASE_URL}/api/progress/streak`, {
            credentials: 'include',
            headers
          });
          if (res.ok) {
            const result = await res.json();
            if (result?.data) {
              const remote = typeof result.data === 'string' ? JSON.parse(result.data) : result.data;
              const remoteCount = parseInt(remote.streakCount || '0', 10);
              const remoteDate = remote.lastActiveDate;
              // If remote has valid streak and is at least as updated as local
              if (remoteCount > 0 && remoteDate) {
                if (!lastActive || remoteCount > currentStreak || (remoteCount >= currentStreak && remoteDate === today)) {
                  currentStreak = remoteCount;
                  lastActive = remoteDate;
                  localStorage.setItem(streakKey, currentStreak.toString());
                  localStorage.setItem(dateKey, lastActive);
                }
              }
            }
          }
        } catch (err) {
          console.warn('Could not sync remote streak:', err);
        }
      }

      // 2. Calculate daily continuity
      if (lastActive !== today) {
        if (lastActive) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          if (lastActive === yesterday.toDateString()) {
            currentStreak += 1;
          } else {
            currentStreak = 1;
          }
        } else {
          currentStreak = 1;
        }
        localStorage.setItem(dateKey, today);
        localStorage.setItem(streakKey, currentStreak.toString());
      }

      if (!isMounted) return;
      setStreak(currentStreak);

      // 3. Push active streak up to MySQL
      if (user?.id) {
        try {
          const headers: Record<string, string> = {
            'Content-Type': 'application/json'
          };
          if (token) headers['Authorization'] = `Bearer ${token}`;
          await fetch(`${API_BASE_URL}/api/progress/streak`, {
            method: 'POST',
            credentials: 'include',
            headers,
            body: JSON.stringify({
              data: {
                streakCount: currentStreak,
                lastActiveDate: today,
                lastActiveTimestamp: Date.now()
              }
            })
          });
        } catch (err) {
          console.warn('Could not sync remote streak update:', err);
        }
      }
    };

    syncStreak();

    return () => {
      isMounted = false;
    };
  }, [user?.id, getUserStorageKey]);

  const fetchWords = async () => {
    let data = [];
    try {
      data = await vocabularyApi.getAllWords();
    } catch (err) {
      console.error('Failed to fetch from API:', err);
    }

    if (!data || data.length === 0) {
      const localData = await import('./data/data.json');
      data = localData.default || localData;
    }

    if (Array.isArray(data)) {
      setWords(data);
    }
  };

  useEffect(() => {
    fetchWords();
  }, []);

  const handleRefreshData = useCallback(async () => {
    await fetchWords();
  }, []);

  const handleAddWord = useCallback(async (newWord) => {
    try {
      await vocabularyApi.addWord(newWord);
    } catch (e) {
      console.error('Failed to add word to API, updating local state only:', e);
    }
    setWords(prev => [newWord, ...prev]);
  }, []);

  const handleDeleteWord = useCallback(async (id) => {
    try {
      await vocabularyApi.deleteWord(id);
    } catch (e) {
      console.error('Failed to delete word from API, updating local state only:', e);
    }
    setWords(prev => prev.filter(w => w.id !== id));
  }, []);

  // Voice synthesis initialization (Both English & Japanese)
  useEffect(() => {
    const updateVoices = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const availableVoices = window.speechSynthesis.getVoices();
        // Keep all available voices so both languages can be picked
        setVoices(availableVoices);

        const englishVoices = availableVoices.filter(v => v.lang && v.lang.toLowerCase().includes('en'));
        const japaneseVoices = availableVoices.filter(v => v.lang && (v.lang.toLowerCase().startsWith('ja') || v.lang.toLowerCase().includes('jp')));

        if (englishVoices.length > 0 && !selectedVoice) {
          const defaultVoice = englishVoices.find(v => v.name.includes('Google') || v.name.includes('Natural')) || englishVoices[0];
          const chosen = defaultVoice.voiceURI || defaultVoice.name;
          setSelectedVoice(chosen);
          localStorage.setItem('selectedVoice', chosen);
        }

        if (japaneseVoices.length > 0 && !selectedJapaneseVoice) {
          const defaultJaVoice = japaneseVoices.find(v => v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Nanami') || v.name.includes('Ayumi') || v.name.includes('Keita')) || japaneseVoices[0];
          const chosen = defaultJaVoice.voiceURI || defaultJaVoice.name;
          setSelectedJapaneseVoice(chosen);
          localStorage.setItem('selectedJapaneseVoice', chosen);
        }
      }
    };

    updateVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, [selectedVoice, selectedJapaneseVoice]);

  const speak = useCallback((text, rate = null, lang = 'en-US') => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && text) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);

      const isJapanese = Boolean(lang && typeof lang === 'string' && (lang.toLowerCase().startsWith('ja') || lang.toLowerCase().includes('jp')));

      // 🛡️ CRITICAL: Ensure utterance.rate is ALWAYS a finite valid number (prevents TypeError: The provided float value is non-finite)
      let safeRate = isJapanese ? japaneseSpeechRate : speechRate;
      if (typeof rate === 'number' && Number.isFinite(rate) && rate > 0) {
        safeRate = rate;
      }
      utterance.rate = safeRate;

      if (isJapanese) {
        utterance.lang = 'ja-JP';
        const jaVoices = voices.filter(v => v.lang && (v.lang.toLowerCase().startsWith('ja') || v.lang.toLowerCase().includes('jp')));
        let chosenJaVoice = null;
        if (selectedJapaneseVoice) {
          chosenJaVoice = jaVoices.find(v => v.voiceURI === selectedJapaneseVoice || v.name === selectedJapaneseVoice);
        }
        if (!chosenJaVoice && jaVoices.length > 0) {
          chosenJaVoice = jaVoices[0];
        }
        if (chosenJaVoice) {
          utterance.voice = chosenJaVoice;
        }
      } else {
        utterance.lang = lang || 'en-US';
        const enVoices = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith('en'));

        if (globalRandomizeVoice && enVoices.length > 1) {
          const randomVoice = enVoices[Math.floor(Math.random() * enVoices.length)];
          utterance.voice = randomVoice;
        } else if (selectedVoice) {
          const voice = enVoices.find(v => v.voiceURI === selectedVoice || v.name === selectedVoice) || voices.find(v => v.voiceURI === selectedVoice || v.name === selectedVoice);
          if (voice) utterance.voice = voice;
        }
      }

      window.speechSynthesis.speak(utterance);
    }
  }, [speechRate, japaneseSpeechRate, voices, globalRandomizeVoice, selectedVoice, selectedJapaneseVoice]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Memoize filteredWords to prevent lag
  const filteredWords = useMemo(() => {
    const accessibleWords = words.filter((w: any) => {
      if (w.master_group && !isTopicVisible(w.master_group)) return false;
      const cat = getVocabCategory(w);
      if (cat === 'chuyende' && !isVocabCategoryVisible('chuyende')) return false;
      if (cat === 'daily' && !isVocabCategoryVisible('daily')) return false;
      if (cat === 'master' && !isVocabCategoryVisible('master')) return false;
      return true;
    });

    if (selectedGroup.type === 'all') return accessibleWords;
    if (selectedGroup.type === 'unit') {
      return accessibleWords.filter((w: any) => w.unit === selectedGroup.id);
    }
    if (selectedGroup.type === 'daily') {
      if (!isVocabCategoryVisible('daily')) return [];
      return accessibleWords.filter((w: any) => w.unit === selectedGroup.id);
    }
    if (selectedGroup.type === 'chuyende' || selectedGroup.type === 'special') {
      if (!isVocabCategoryVisible('chuyende')) return [];
      const targetSpecial = selectedGroup.specialName;
      if (!targetSpecial) return accessibleWords;
      return accessibleWords.filter((w: any) => 
        w.master_group === targetSpecial && 
        (!selectedGroup.subName || w.sub_group === selectedGroup.subName)
      );
    }
    if (selectedGroup.type === 'master') {
      if (!isVocabCategoryVisible('master')) return [];
      return accessibleWords.filter((w: any) => w.master_group === selectedGroup.masterName && (!selectedGroup.subName || w.sub_group === selectedGroup.subName));
    }
    return accessibleWords;
  }, [words, selectedGroup, isAdmin, isTopicVisible, isVocabCategoryVisible]);

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-50 dark:bg-[#090D16] font-sans overflow-hidden transition-colors duration-300 relative">
      {/* Ambient Lighting & Cyber-Nebula Glow for Depth */}
      <div className="absolute top-0 right-1/4 w-96 md:w-[550px] h-96 md:h-[550px] bg-indigo-200/20 dark:bg-indigo-600/10 rounded-full blur-[100px] md:blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 left-10 w-80 md:w-[480px] h-80 md:h-[480px] bg-blue-200/20 dark:bg-sky-600/08 rounded-full blur-[100px] md:blur-[130px] pointer-events-none -z-10" />
      <div className="absolute top-1/2 left-1/3 w-72 md:w-[400px] h-72 md:h-[400px] bg-purple-200/15 dark:bg-violet-600/08 rounded-full blur-[110px] md:blur-[140px] pointer-events-none -z-10 hidden dark:block" />

      <AiStatusBadge />
      <AiDashboardModal />
      <Header 
        activeTab={activeTab}
        wordCount={words.length} 
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        onOpenSettings={() => setIsSettingsOpen(true)}
        theme={theme}
        toggleTheme={toggleTheme}
        streak={streak}
        onOpenSearch={() => setIsSearchOpen(true)}
        isSfxMuted={isSfxMuted}
        onToggleSfx={handleToggleSfx}
        onNavigateTab={handleNavigateTab}
      />
      
      <div className="flex flex-1 overflow-hidden relative min-h-0">
        {activeTab !== 'home' && activeTab !== 'login' && (
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={handleNavigateTab} 
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        )}
        
        <main className={`flex-1 flex flex-col overflow-hidden w-full bg-slate-50 dark:bg-[#090D16] transition-colors min-h-0 ${
          activeTab === 'home' || activeTab === 'login' ? 'pb-20 md:pb-6' : 'pb-16 md:pb-0'
        }`}>
          {routeState.status === 'not_found' && (
            <div className="flex-1 overflow-y-auto p-4 md:p-6 min-h-0">
              <NotFound404
                mode="not_found"
                path={window.location.pathname}
                onGoHome={() => handleNavigateTab('home')}
              />
            </div>
          )}

          {routeState.status === 'forbidden' && (
            <div className="flex-1 overflow-y-auto p-4 md:p-6 min-h-0">
              <NotFound404
                mode="forbidden"
                path={window.location.pathname}
                onGoHome={() => handleNavigateTab('home')}
                onLoginAdmin={openAuthModal}
              />
            </div>
          )}

          {routeState.status === 'ok' && (
            <>
              {activeTab !== 'home' && activeTab !== 'login' && activeTab !== 'dashboard' && activeTab !== 'admin_dashboard' && activeTab !== 'reading' && activeTab !== 'manage' && activeTab !== 'speaking' && activeTab !== 'grammar' && activeTab !== 'recommendations' && activeTab !== 'srs' && activeTab !== 'toeic30' && activeTab !== 'toeic500' && activeTab !== 'toeic600' && activeTab !== 'ets2026' && activeTab !== 'japaneseMinna' && (
                <UnitSelector selectedGroup={selectedGroup} onSelectGroup={setSelectedGroup} words={words} />
              )}
            
              <div className="flex-1 overflow-y-auto p-4 md:p-6 min-h-0">
                <Suspense fallback={
                  <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
                    <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin" />
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">
                      Đang tải giao diện...
                    </span>
                  </div>
                }>
                  {activeTab === 'home' && <HomePage wordCount={words.length} onNavigate={handleNavigateTab} speak={speak} />}
                  {activeTab === 'login' && <LoginPage onNavigate={handleNavigateTab} />}
                  {activeTab === 'dashboard' && <DashboardMode words={words} speak={speak} setActiveTab={handleNavigateTab} onRefreshData={handleRefreshData} />}
                  {activeTab === 'admin_dashboard' && <AdminDashboard words={words} speak={speak} setActiveTab={handleNavigateTab} initialSubTab={adminInitialSubTab} />}
                  {activeTab === 'toeic30' && <Toeic30DayMode words={words} speak={speak} onNavigate={handleNavigateTab} setActiveTab={handleNavigateTab} />}
                  {activeTab === 'toeic500' && <Toeic500Mode words={words} speak={speak} />}
                  {activeTab === 'toeic600' && <Toeic600Mode words={words} speak={speak} />}
                  {activeTab === 'ets2026' && <Ets2026Mode words={words} speak={speak} />}
                  {activeTab === 'japaneseMinna' && (
                    <JapaneseMinnaMode 
                      japaneseWords={words.filter(w => w.master_group === 'Từ Vựng Tiếng Nhật Minna No Nihongo' || w.hiragana || w.kanji || (w.sub_group && w.sub_group.includes('Bài')))} 
                      speak={speak} 
                      onExit={() => handleNavigateTab('dashboard')} 
                    />
                  )}
                  {activeTab === 'optimal' && <OptimalLearningMode words={filteredWords} speak={speak} />}
                  {activeTab === 'sequential3' && <Sequential3StepMode words={filteredWords} speak={speak} onExit={() => handleNavigateTab('dashboard')} />}
                  {activeTab === 'flashcards' && <FlashcardMode words={filteredWords} speak={speak} />}
                  {activeTab === 'quiz' && <QuizMode words={filteredWords} speak={speak} />}
                  {activeTab === 'dictation' && <DictationMode words={filteredWords} speak={speak} />}
                  {activeTab === 'ipa' && <Ets2026IpaMode words={filteredWords} allWords={words} speak={speak} onExit={() => handleNavigateTab('dashboard')} />}
                  {activeTab === 'match' && <MatchMode words={filteredWords} speak={speak} />}
                  {activeTab === 'typing' && <TypingMode words={filteredWords} speak={speak} />}
                  {activeTab === 'related' && <RelatedWordsMode words={filteredWords} speak={speak} />}
                  {activeTab === 'recommendations' && <RecommendationsMode words={words} speak={speak} setActiveTab={handleNavigateTab} />}
                  {activeTab === 'srs' && <SRSMode words={words} speak={speak} />}
                  {activeTab === 'manage' && (
                    <WordManager 
                      words={words} 
                      onAddWord={handleAddWord} 
                      onDeleteWord={handleDeleteWord} 
                      onRefreshData={handleRefreshData}
                      speak={speak}
                    />
                  )}
                  {activeTab === 'reading' && <ReadingMode words={words} speak={speak} />}
                  {activeTab === 'grammar' && <GrammarMode />}
                  {activeTab === 'mixed' && <MixedTestMode />}
                  {activeTab === 'speaking' && <SpeakingMode words={filteredWords} />}
                  {activeTab === 'game_memory' && <MemoryMatchGame words={filteredWords} />}
                  {activeTab === 'game_survival' && <SurvivalGame words={filteredWords} />}
                  {activeTab === 'game_hangman' && <HangmanGame words={filteredWords} />}
                  {activeTab === 'game_falling' && <FallingWordsGame words={filteredWords} />}
                  {activeTab === 'game_scramble' && <WordScrambleGame words={filteredWords} />}
                </Suspense>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Global Search Modal (Ctrl + K) */}
      <GlobalSearchModal 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        words={words}
        speak={speak}
      />

      {/* Auth Modal (Login / Register) */}
      <AuthModal />

      {/* Mobile Bottom Navigation */}
      <BottomNav 
        activeTab={activeTab}
        setActiveTab={handleNavigateTab}
        onOpenSearch={() => setIsSearchOpen(true)}
        onToggleSidebar={() => {
          if (activeTab === 'home' || activeTab === 'login') {
            handleNavigateTab('dashboard');
            setIsSidebarOpen(true);
          } else {
            setIsSidebarOpen(prev => !prev);
          }
        }}
      />

      <VoiceSettings 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        voices={voices}
        selectedVoice={selectedVoice}
        setSelectedVoice={handleSetSelectedVoice}
        speechRate={speechRate}
        setSpeechRate={handleSetSpeechRate}
        globalRandomizeVoice={globalRandomizeVoice}
        setGlobalRandomizeVoice={handleSetGlobalRandomizeVoice}
        selectedJapaneseVoice={selectedJapaneseVoice}
        setSelectedJapaneseVoice={handleSetSelectedJapaneseVoice}
        japaneseSpeechRate={japaneseSpeechRate}
        setJapaneseSpeechRate={handleSetJapaneseSpeechRate}
        showEnglishSettings={isVoiceSettingsVisible('en')}
        showJapaneseSettings={isVoiceSettingsVisible('ja')}
        isAdmin={isAdmin}
        onToggleAdminVoiceVisibility={handleToggleAdminVoiceVisibility}
      />

      {/* Admin Floating Debug & Log Trigger Button */}
      {(isAdmin || adminLogger.isDevToolsUnlocked()) && (
        <button
          onClick={() => setIsAdminLogOpen(true)}
          className="fixed bottom-20 md:bottom-6 right-5 z-[9999] flex items-center gap-2 px-3 py-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 shadow-2xl rounded-full text-xs font-bold backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer group"
          title="Mở nhật ký & gỡ lỗi Admin (Ctrl + Shift + L)"
        >
          <div className="relative">
            <Terminal size={15} className="text-indigo-400 group-hover:text-indigo-300" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <span className="hidden sm:inline text-[11px] font-mono">Admin Logs</span>
          <kbd className="hidden lg:inline text-[9px] bg-slate-800 border border-slate-700 px-1 py-0.5 rounded text-slate-400 font-mono">
            Ctrl+Shift+L
          </kbd>
        </button>
      )}

      {/* Admin Log Modal */}
      <AdminLogModal 
        isOpen={isAdminLogOpen} 
        onClose={() => setIsAdminLogOpen(false)} 
      />

      <ToastContainer position="bottom-right" aria-label="Notifications" />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <VisibilityProvider>
        <AiStatusProvider>
          <AppContent />
        </AiStatusProvider>
      </VisibilityProvider>
    </AuthProvider>
  );
}
