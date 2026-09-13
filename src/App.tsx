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
import { VisibilityProvider } from './context/VisibilityContext';
import AuthModal from './components/AuthModal';

import { vocabularyApi } from './api/vocabularyApi';

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
const Ets2026Mode = lazy(() => import('./components/Ets2026Mode'));
const Sequential3StepMode = lazy(() => import('./components/Sequential3StepMode'));
const Ets2026IpaMode = lazy(() => import('./components/Ets2026IpaMode'));
const JapaneseMinnaMode = lazy(() => import('./components/JapaneseMinnaMode'));
const MemoryMatchGame = lazy(() => import('./components/games/MemoryMatchGame'));
const SurvivalGame = lazy(() => import('./components/games/SurvivalGame'));
const HangmanGame = lazy(() => import('./components/games/HangmanGame'));
const FallingWordsGame = lazy(() => import('./components/games/FallingWordsGame'));
const WordScrambleGame = lazy(() => import('./components/games/WordScrambleGame'));

function AppContent() {
  const { user, isAdmin, openAuthModal, getUserStorageKey } = useAuth();
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  
  // Valid registered tab names
  const VALID_TABS = useMemo(() => new Set([
    'home', 'login', 'dashboard', 'admin_dashboard', 'toeic30', 'toeic500', 'ets2026', 'japaneseMinna',
    'optimal', 'sequential3', 'flashcards', 'quiz', 'dictation', 'ipa',
    'match', 'typing', 'related', 'recommendations', 'srs', 'manage',
    'reading', 'grammar', 'mixed', 'speaking',
    'game_memory', 'game_survival', 'game_hangman', 'game_falling', 'game_scramble'
  ]), []);

  // Router resolution logic with 403 / 404 / Auth checks
  const resolveRoute = useCallback((pathname: string) => {
    let clean = pathname.replace(/^\//, '').trim().toLowerCase();
    
    // Support root path '/'
    if (!clean) {
      if (!user) {
        return { status: 'ok' as const, tab: 'home' };
      }
      return { status: 'ok' as const, tab: 'dashboard' };
    }
    
    // Support /home
    if (clean === 'home') {
      return { status: 'ok' as const, tab: 'home' };
    }

    // Support /login and aliases
    if (clean === 'login' || clean === 'register' || clean === 'signin' || clean === 'signup' || clean === 'auth') {
      return { status: 'ok' as const, tab: 'login' };
    }

    if (clean === 'admin' || clean === 'admindashboard') {
      clean = 'admin_dashboard';
    }

    // 🔒 BẮT BUỘC ĐĂNG NHẬP: Người dùng phải đăng nhập trước khi vào bất kỳ chế độ học tập nào
    if (!user) {
      if (VALID_TABS.has(clean) || clean === 'admin_dashboard') {
        sessionStorage.setItem('redirectAfterLogin', clean);
      }
      return { status: 'ok' as const, tab: 'login', requiredAuth: true };
    }

    // Check permission for admin-only routes
    if (clean === 'admin_dashboard' || clean === 'manage') {
      if (!isAdmin) {
        return { status: 'forbidden' as const, tab: clean };
      }
      return { status: 'ok' as const, tab: clean };
    }

    if (VALID_TABS.has(clean)) {
      return { status: 'ok' as const, tab: clean };
    }

    return { status: 'not_found' as const, tab: clean };
  }, [user, isAdmin, VALID_TABS]);

  const [routeState, setRouteState] = useState(() => resolveRoute(window.location.pathname));
  const [activeTab, setActiveTab] = useState(() => routeState.tab);

  // Sync state on browser Back / Forward
  useEffect(() => {
    const handlePopState = () => {
      const res = resolveRoute(window.location.pathname);
      setRouteState(res);
      if (res.status === 'ok') {
        setActiveTab(res.tab);
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
      if (res.requiredAuth) {
        window.history.replaceState(null, '', '/login');
      }
    } else if (res.status === 'forbidden') {
      setActiveTab('dashboard');
      window.history.replaceState(null, '', '/');
    }
  }, [user, isAdmin, resolveRoute]);

  const handleNavigateTab = (tab: string) => {
    // 🔒 Bắt buộc đăng nhập để bắt đầu học
    if (!user && tab !== 'home' && tab !== 'login') {
      toast.warning('Vui lòng đăng nhập để bắt đầu học và lưu tiến độ!');
      sessionStorage.setItem('redirectAfterLogin', tab);
      window.history.pushState(null, '', '/login');
      const res = resolveRoute('/login');
      setRouteState(res);
      setActiveTab('login');
      setIsSidebarOpen(false);
      return;
    }

    let targetUrl = `/${tab}`;
    if (tab === 'dashboard') targetUrl = '/';
    else if (tab === 'admin_dashboard') targetUrl = '/admin';
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
  const [selectedVoice, setSelectedVoice] = useState('');
  const [speechRate, setSpeechRate] = useState(0.8);
  const [globalRandomizeVoice, setGlobalRandomizeVoice] = useState(() => {
    const saved = localStorage.getItem('globalRandomizeVoice');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [streak, setStreak] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSfxMuted, setIsSfxMuted] = useState(() => 
    typeof audioManager?.isMuted === 'function' ? audioManager.isMuted() : false
  );

  const handleToggleSfx = () => {
    const nextState = typeof audioManager?.toggleMute === 'function' 
      ? audioManager.toggleMute() 
      : !isSfxMuted;
    setIsSfxMuted(nextState);
  };

  // Global keyboard shortcut Ctrl+K / Cmd+K to open Quick Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Isolated streak tracking per user
  useEffect(() => {
    const today = new Date().toDateString();
    const streakKey = getUserStorageKey('streakCount');
    const dateKey = getUserStorageKey('lastActiveDate');

    const lastActive = localStorage.getItem(dateKey);
    let currentStreak = parseInt(localStorage.getItem(streakKey) || '0', 10);

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
    setStreak(currentStreak);
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

  // Voice synthesis initialization
  useEffect(() => {
    const updateVoices = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const availableVoices = window.speechSynthesis.getVoices();
        const englishVoices = availableVoices.filter(v => v.lang.includes('en'));
        setVoices(englishVoices.length > 0 ? englishVoices : availableVoices);
        if (englishVoices.length > 0 && !selectedVoice) {
          const defaultVoice = englishVoices.find(v => v.name.includes('Google') || v.name.includes('Natural')) || englishVoices[0];
          setSelectedVoice(defaultVoice.name);
        }
      }
    };

    updateVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, [selectedVoice]);

  const speak = useCallback((text, rate = null, lang = 'en-US') => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate !== null ? rate : speechRate;
      utterance.lang = lang;

      if (globalRandomizeVoice && voices.length > 1) {
        const randomVoice = voices[Math.floor(Math.random() * voices.length)];
        utterance.voice = randomVoice;
      } else if (selectedVoice) {
        const voice = voices.find(v => v.name === selectedVoice);
        if (voice) utterance.voice = voice;
      }

      window.speechSynthesis.speak(utterance);
    }
  }, [speechRate, voices, globalRandomizeVoice, selectedVoice]);

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
    if (selectedGroup.type === 'all') return words;
    if (selectedGroup.type === 'unit') {
      return words.filter(w => w.unit === selectedGroup.id);
    }
    if (selectedGroup.type === 'daily') {
      return words.filter(w => w.unit === selectedGroup.id);
    }
    if (selectedGroup.type === 'chuyende' || selectedGroup.type === 'special') {
      const targetSpecial = selectedGroup.specialName;
      if (!targetSpecial) return words;
      return words.filter(w => 
        w.master_group === targetSpecial && 
        (!selectedGroup.subName || w.sub_group === selectedGroup.subName)
      );
    }
    if (selectedGroup.type === 'master') {
      return words.filter(w => w.master_group === selectedGroup.masterName && (!selectedGroup.subName || w.sub_group === selectedGroup.subName));
    }
    return words;
  }, [words, selectedGroup]);

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-50 dark:bg-slate-950 font-sans overflow-hidden transition-colors duration-300">
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
        
        <main className={`flex-1 flex flex-col overflow-hidden w-full bg-gray-50 dark:bg-slate-950 transition-colors min-h-0 ${
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
              {activeTab !== 'home' && activeTab !== 'login' && activeTab !== 'dashboard' && activeTab !== 'admin_dashboard' && activeTab !== 'reading' && activeTab !== 'manage' && activeTab !== 'speaking' && activeTab !== 'grammar' && activeTab !== 'recommendations' && activeTab !== 'srs' && activeTab !== 'toeic30' && activeTab !== 'ets2026' && activeTab !== 'japaneseMinna' && (
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
                  {activeTab === 'admin_dashboard' && <AdminDashboard words={words} speak={speak} setActiveTab={handleNavigateTab} />}
                  {activeTab === 'toeic30' && <Toeic30DayMode words={words} speak={speak} />}
                  {activeTab === 'toeic500' && <Toeic500Mode words={words} speak={speak} />}
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
        setSelectedVoice={setSelectedVoice}
        speechRate={speechRate}
        setSpeechRate={setSpeechRate}
        globalRandomizeVoice={globalRandomizeVoice}
        setGlobalRandomizeVoice={setGlobalRandomizeVoice}
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
