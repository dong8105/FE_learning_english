import React, { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import UnitSelector from './components/UnitSelector';
import FlashcardMode from './components/FlashcardMode';
import QuizMode from './components/QuizMode';
import DictationMode from './components/DictationMode';
import MatchMode from './components/MatchMode';
import TypingMode from './components/TypingMode';
import RelatedWordsMode from './components/RelatedWordsMode';
import WordManager from './components/WordManager';
import ReadingMode from './components/ReadingMode';
import SpeakingMode from './components/SpeakingMode';
import VoiceSettings from './components/VoiceSettings';
import GrammarMode from './components/GrammarMode';
import MixedTestMode from './components/MixedTestMode';
import MixedGameMode from './components/MixedGameMode';
import RecommendationsMode from './components/RecommendationsMode';
import SRSMode from './components/SRSMode';
import TranslatorMode from './components/TranslatorMode';
import DashboardMode from './components/DashboardMode';
import OptimalLearningMode from './components/OptimalLearningMode';
import Toeic30DayMode from './components/Toeic30DayMode';
import Toeic500Mode from './components/Toeic500Mode';
import Ets2026Mode from './components/Ets2026Mode';
import Sequential3StepMode from './components/Sequential3StepMode';
import Ets2026IpaMode from './components/Ets2026IpaMode';
import JapaneseMinnaMode from './components/JapaneseMinnaMode';
import MemoryMatchGame from './components/games/MemoryMatchGame';
import SurvivalGame from './components/games/SurvivalGame';
import HangmanGame from './components/games/HangmanGame';
import FallingWordsGame from './components/games/FallingWordsGame';
import WordScrambleGame from './components/games/WordScrambleGame';
import { AiStatusProvider } from './components/AiStatusProvider';
import AiStatusBadge from './components/AiStatusBadge';
import AiDashboardModal from './components/AiDashboardModal';

import { vocabularyApi } from './api/vocabularyApi';

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedGroup, setSelectedGroup] = useState({ type: 'all' });
  const [words, setWords] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [speechRate, setSpeechRate] = useState(0.8);
  const [globalRandomizeVoice, setGlobalRandomizeVoice] = useState(() => {
    const saved = localStorage.getItem('globalRandomizeVoice');
    return saved !== null ? JSON.parse(saved) : true; // Default is true for TOEIC
  });
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const today = new Date().toDateString();
    const lastActive = localStorage.getItem('lastActiveDate');
    let currentStreak = parseInt(localStorage.getItem('streakCount') || '0', 10);

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
      localStorage.setItem('lastActiveDate', today);
      localStorage.setItem('streakCount', currentStreak.toString());
    }
    setStreak(currentStreak);
  }, []);

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
    setWords(data);
  };

  useEffect(() => {
    fetchWords();
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('globalRandomizeVoice', JSON.stringify(globalRandomizeVoice));
  }, [globalRandomizeVoice]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    let isMounted = true;
    const loadVoices = () => {
      if (!isMounted) return;
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length === 0) return;

      const englishVoices = availableVoices.filter(v => v.lang.startsWith('en'));
      setVoices(englishVoices.length > 0 ? englishVoices : availableVoices);

      setSelectedVoice(prev => {
        if (prev) return prev;
        const defaultVoice = englishVoices.find(v => v.name.includes('Google') || v.name.includes('Microsoft')) || englishVoices[0] || availableVoices[0];
        return defaultVoice ? defaultVoice.voiceURI : '';
      });
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    return () => { isMounted = false; };
  }, []);

  const speak = (text, e, lang = 'en-US') => {
    if (e) e.stopPropagation();
    window.speechSynthesis.cancel();
    
    // Clean up text by removing parentheses and their contents (e.g. "(v,n)", "(v)", "(adj)")
    let cleanText = text || '';
    if (typeof cleanText === 'string') {
      cleanText = cleanText.replace(/\(.*?\)/g, '').trim();
    }
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = speechRate;

    const targetLang = lang === 'en' ? 'en-US' : lang === 'vi' ? 'vi-VN' : lang === 'ja' ? 'ja-JP' : lang;

    if (targetLang.startsWith('ja')) {
      // JAPANESE VOICE SELECTION
      utterance.lang = 'ja-JP';
      const jaVoices = voices.filter(v => v.lang === 'ja-JP' || v.lang.startsWith('ja') || v.name.toLowerCase().includes('japanese'));
      if (jaVoices.length > 0) {
        const goodJaVoice = jaVoices.find(v => v.name.includes('Google') || v.name.includes('Microsoft') || v.name.includes('Kyoko') || v.name.includes('Nanami') || v.name.includes('Otoya') || v.name.includes('Keita'));
        utterance.voice = goodJaVoice || jaVoices[0];
      }
    } else if (targetLang.startsWith('vi')) {
      // VIETNAMESE VOICE SELECTION
      utterance.lang = 'vi-VN';
      const viVoices = voices.filter(v => v.lang === 'vi-VN' || v.lang.startsWith('vi') || v.name.toLowerCase().includes('vietnamese'));
      if (viVoices.length > 0) {
        utterance.voice = viVoices[0];
      }
    } else if (globalRandomizeVoice && targetLang.startsWith('en')) {
      // ENGLISH TOEIC RANDOM ACCENT SELECTION
      const toeicLangs = ['en-US', 'en-GB', 'en-AU', 'en-CA'];
      const availableAccents = toeicLangs.filter(acc => 
        voices.some(v => v.lang === acc || v.lang.startsWith(acc))
      );
      if (availableAccents.length > 0) {
        const randomLang = availableAccents[Math.floor(Math.random() * availableAccents.length)];
        utterance.lang = randomLang;
        const matchingVoices = voices.filter(v => v.lang === randomLang || v.lang.startsWith(randomLang));
        const goodVoices = matchingVoices.filter(v => v.name.includes('Google') || v.name.includes('Microsoft'));
        const pool = goodVoices.length > 0 ? goodVoices : matchingVoices;
        utterance.voice = pool[Math.floor(Math.random() * pool.length)];
      } else {
        utterance.lang = 'en-US';
      }
    } else {
      // ENGLISH DEFAULT / SELECTED VOICE SELECTION
      utterance.lang = targetLang;
      if (selectedVoice && targetLang.startsWith('en')) {
        const voice = voices.find(v => v.voiceURI === selectedVoice);
        if (voice) utterance.voice = voice;
      }
    }

    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 40);
  };

  const handleAddWord = async (newWord) => {
    const wordWithId = { ...newWord, id: Date.now().toString() };
    await vocabularyApi.addWord(wordWithId);
    fetchWords();
  };

  const handleDeleteWord = async (id) => {
    await vocabularyApi.deleteWord(id);
    fetchWords();
  };

  const handleRefreshData = () => {
    fetchWords();
  };

  const filteredWords = (() => {
    if (selectedGroup.type === 'all') return words;
    if (selectedGroup.type === 'unit') {
      return words.filter(w => w.unit === selectedGroup.id);
    }
    if (selectedGroup.type === 'daily') {
      return words.filter(w => w.unit === selectedGroup.id);
    }
    if (selectedGroup.type === 'master') {
      return words.filter(w => w.master_group === selectedGroup.masterName && (!selectedGroup.subName || w.sub_group === selectedGroup.subName));
    }
    return words;
  })();

  return (
    <AiStatusProvider>
      <div className="flex flex-col h-[100dvh] bg-gray-50 dark:bg-slate-950 font-sans overflow-hidden transition-colors duration-300">
        <AiStatusBadge />
        <AiDashboardModal />
        <Header 
          wordCount={words.length} 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
          onOpenSettings={() => setIsSettingsOpen(true)}
          theme={theme}
          toggleTheme={toggleTheme}
          streak={streak}
        />
        
        <div className="flex flex-1 overflow-hidden relative min-h-0">
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={(tab) => {
              setActiveTab(tab);
              setIsSidebarOpen(false);
            }} 
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
          
          <main className="flex-1 flex flex-col overflow-hidden w-full bg-gray-50 dark:bg-slate-950 transition-colors min-h-0">
            {activeTab !== 'dashboard' && activeTab !== 'reading' && activeTab !== 'manage' && activeTab !== 'speaking' && activeTab !== 'grammar' && activeTab !== 'recommendations' && activeTab !== 'srs' && activeTab !== 'translator' && activeTab !== 'toeic30' && activeTab !== 'ets2026' && activeTab !== 'japaneseMinna' && (
              <UnitSelector selectedGroup={selectedGroup} onSelectGroup={setSelectedGroup} words={words} />
            )}
            
            <div className="flex-1 overflow-y-auto p-4 md:p-6 min-h-0">
              {activeTab === 'dashboard' && <DashboardMode words={words} speak={speak} setActiveTab={setActiveTab} onRefreshData={handleRefreshData} />}
              {activeTab === 'toeic30' && <Toeic30DayMode words={words} speak={speak} />}
              {activeTab === 'toeic500' && <Toeic500Mode words={words} speak={speak} />}
              {activeTab === 'ets2026' && <Ets2026Mode words={words} speak={speak} />}
              {activeTab === 'japaneseMinna' && (
                <JapaneseMinnaMode 
                  japaneseWords={words.filter(w => w.master_group === 'Từ Vựng Tiếng Nhật Minna No Nihongo' || w.hiragana || w.kanji || (w.sub_group && w.sub_group.includes('Bài')))} 
                  speak={speak} 
                  onExit={() => setActiveTab('dashboard')} 
                />
              )}
              {activeTab === 'optimal' && <OptimalLearningMode words={filteredWords} speak={speak} />}
              {activeTab === 'sequential3' && <Sequential3StepMode words={filteredWords} speak={speak} onExit={() => setActiveTab('dashboard')} />}
              {activeTab === 'flashcards' && <FlashcardMode words={filteredWords} speak={speak} />}
              {activeTab === 'quiz' && <QuizMode words={filteredWords} speak={speak} />}
              {activeTab === 'dictation' && <DictationMode words={filteredWords} speak={speak} />}
              {activeTab === 'ipa' && <Ets2026IpaMode words={filteredWords} allWords={words} speak={speak} onExit={() => setActiveTab('dashboard')} />}
              {activeTab === 'match' && <MatchMode words={filteredWords} speak={speak} />}
              {activeTab === 'typing' && <TypingMode words={filteredWords} speak={speak} />}
              {activeTab === 'related' && <RelatedWordsMode words={filteredWords} speak={speak} />}
              {activeTab === 'recommendations' && <RecommendationsMode words={words} speak={speak} setActiveTab={setActiveTab} />}
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
              {activeTab === 'mixedGame' && <MixedGameMode words={words} speak={speak} />}
              {activeTab === 'speaking' && <SpeakingMode words={words} />}
              {activeTab === 'translator' && <TranslatorMode speak={speak} />}
              {activeTab === 'game_memory' && <MemoryMatchGame words={filteredWords} speak={speak} />}
              {activeTab === 'game_survival' && <SurvivalGame words={filteredWords} speak={speak} />}
              {activeTab === 'game_hangman' && <HangmanGame words={filteredWords} speak={speak} />}
              {activeTab === 'game_falling' && <FallingWordsGame words={filteredWords} speak={speak} />}
              {activeTab === 'game_scramble' && <WordScrambleGame words={filteredWords} speak={speak} />}
            </div>
          </main>
        </div>
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
    </AiStatusProvider>
  );
}

export default App;
