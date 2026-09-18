import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Save, 
  Gamepad2, 
  BookOpen, 
  Users, 
  Database, 
  Activity, 
  Download, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Cpu, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  BarChart3, 
  Server, 
  HardDrive,
  FileSpreadsheet,
  FileJson,
  Layers,
  ArrowRight,
  PanelLeft,
  Bot,
  Lock,
  Flame,
  Keyboard,
  Mic,
  Volume2,
  Shuffle,
  Network,
  Trophy,
  Search,
  Calendar,
  Edit3,
  Check,
  X,
  Clock,
  ArrowUpDown,
  SlidersHorizontal,
  Target,
  FolderTree,
  Radio,
  Wifi,
  WifiOff,
  UserCheck,
  GraduationCap,
  Crown,
  Compass,
  Monitor,
  Smartphone,
  Globe,
  Filter,
  TrendingUp,
  Zap,
  Terminal,
  Hash
} from 'lucide-react';
import { toast } from 'react-toastify';
import { audioManager } from '../utils/audioManager';
import { useAuth, User } from '../context/AuthContext';
import { useVisibility } from '../context/VisibilityContext';
import AdminLogViewer from './AdminLogViewer';

export type AdminSubTab = 'overview' | 'users' | 'online' | 'backup' | 'settings' | 'visibility' | 'logs';

interface AdminDashboardProps {
  words: any[];
  speak?: (text: string) => void;
  setActiveTab: (tab: string) => void;
  initialSubTab?: AdminSubTab;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminDashboard({ words, setActiveTab, initialSubTab }: AdminDashboardProps) {
  const { user, getAuthHeaders } = useAuth();

  const getStartingSubTab = (): AdminSubTab => {
    if (initialSubTab) return initialSubTab;
    try {
      const params = new URLSearchParams(window.location.search);
      const qTab = params.get('tab') || params.get('subtab');
      if (qTab && ['overview', 'users', 'online', 'backup', 'settings', 'visibility', 'logs'].includes(qTab.toLowerCase())) {
        return qTab.toLowerCase() as AdminSubTab;
      }
      const path = window.location.pathname.toLowerCase();
      if (path.includes('visibility') || path.includes('phanquyen') || path.includes('phan-quyen') || path.includes('permissions')) {
        return 'visibility';
      }
      if (path.includes('logs') || path.includes('log')) return 'logs';
      if (path.includes('users')) return 'users';
      if (path.includes('online')) return 'online';
      if (path.includes('backup')) return 'backup';
      if (path.includes('settings')) return 'settings';
    } catch {}
    return 'overview';
  };

  const [activeSubTab, setActiveSubTab] = useState<AdminSubTab>(getStartingSubTab);

  // Đồng bộ khi initialSubTab thay đổi từ bên ngoài (ví dụ click từ Sidebar)
  useEffect(() => {
    if (initialSubTab && initialSubTab !== activeSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const handleSwitchSubTab = (newTab: AdminSubTab) => {
    setActiveSubTab(newTab);
    try {
      const targetUrl = newTab === 'overview' ? '/admin' : `/admin?tab=${newTab}`;
      window.history.replaceState(null, '', targetUrl);
    } catch {}
  };
  const [serverMetrics, setServerMetrics] = useState<any>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Online presence & live stream state
  const [onlineStats, setOnlineStats] = useState<{
    totalOnline: number;
    learnersCount: number;
    adminsCount: number;
    guestsCount: number;
    tabDistribution: Record<string, number>;
    users: Array<{
      sessionId: string;
      userId: string | null;
      username: string;
      name: string;
      role: string;
      currentTab: string;
      firstSeen: number;
      lastPing: number;
      idleSeconds: number;
    }>;
  }>({
    totalOnline: 0,
    learnersCount: 0,
    adminsCount: 0,
    guestsCount: 0,
    tabDistribution: {},
    users: []
  });
  const [streamConnected, setStreamConnected] = useState<boolean>(false);
  const [streamMode, setStreamMode] = useState<'sse' | 'polling'>('sse');
  const [lastStreamUpdate, setLastStreamUpdate] = useState<Date>(new Date());
  const [onlineSearchQuery, setOnlineSearchQuery] = useState('');
  const [onlineRoleFilter, setOnlineRoleFilter] = useState<'all' | 'user' | 'admin' | 'guest'>('all');
  const [onlineTabFilter, setOnlineTabFilter] = useState<string>('all');

  // New user form state
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'user'>('user');

  const { settings: visibilitySettings, updateSettings: updateVisibilitySettings, refetchSettings } = useVisibility();
  const [localVisibility, setLocalVisibility] = useState(visibilitySettings);
  const [savingVisibility, setSavingVisibility] = useState(false);
  const [selectedVisibilityUser, setSelectedVisibilityUser] = useState<string>('global');
  const [customUsersList, setCustomUsersList] = useState<string[]>([]);
  const [hasCustomSettings, setHasCustomSettings] = useState(false);
  const [loadingUserVisibility, setLoadingUserVisibility] = useState(false);
  const [revertingVisibility, setRevertingVisibility] = useState(false);

  // Users search & streak filter/modal state
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userSortFilter, setUserSortFilter] = useState<'all' | 'streak_desc' | 'online_today' | 'active_streak' | 'newest' | 'admins' | 'learners'>('all');
  const [selectedStreakUser, setSelectedStreakUser] = useState<User | null>(null);
  const [editStreakCount, setEditStreakCount] = useState<number>(0);
  const [savingStreak, setSavingStreak] = useState<boolean>(false);

  useEffect(() => {
    if (selectedVisibilityUser === 'global') {
      setLocalVisibility(visibilitySettings);
    }
  }, [visibilitySettings, selectedVisibilityUser]);

  const SPECIAL_TOPICS_LIST = [
    { key: '600 Từ Vựng TOEIC', title: '600 Từ Vựng TOEIC Căn Bản', desc: 'Bộ từ vựng cốt lõi phân theo 50 chủ đề kinh điển của TOEIC' },
    { key: 'Từ Vựng ETS 2026', title: 'Từ Vựng ETS 2026 Mới Nhất', desc: 'Cập nhật đề thi ETS 2026 thực chiến và bộ đề chuẩn' },
    { key: '500 Từ Vựng TOEIC Mất Gốc', title: '500 Từ TOEIC Lấy Gốc Cấp Tốc', desc: 'Dành cho người mới bắt đầu hoặc lấy lại căn bản' },
    { key: 'Từ Vựng Tiếng Nhật Minna No Nihongo', title: 'Tiếng Nhật Minna No Nihongo', desc: 'Giáo trình tiếng Nhật sơ cấp 50 bài tiêu chuẩn' },
    { key: 'Lộ trình TOEIC 30 Ngày', title: 'Lộ trình TOEIC 30 Ngày Tự Học', desc: 'Kế hoạch học tập 30 ngày từng bước chinh phục mục tiêu' },
  ];

  const allTopics = useMemo(() => {
    const list = [...SPECIAL_TOPICS_LIST];
    const knownKeys = new Set(list.map(t => t.key));
    words.forEach(w => {
      if (w.master_group && !knownKeys.has(w.master_group)) {
        list.push({
          key: w.master_group,
          title: w.master_group,
          desc: 'Chuyên đề học tập bổ sung'
        });
        knownKeys.add(w.master_group);
      }
    });
    return list;
  }, [words]);

  const toggleTopicVisibility = (topicKey: string) => {
    setLocalVisibility(prev => {
      const isHidden = prev.hiddenTopics.includes(topicKey);
      const newHidden = isHidden
        ? prev.hiddenTopics.filter(t => t !== topicKey)
        : [...prev.hiddenTopics, topicKey];
      return { ...prev, hiddenTopics: newHidden };
    });
  };

  const toggleSidebarVisibility = (topicKey: string) => {
    setLocalVisibility(prev => {
      const current = prev.sidebarHiddenTopics || [];
      const isHidden = current.includes(topicKey);
      const newSidebarHidden = isHidden
        ? current.filter(t => t !== topicKey)
        : [...current, topicKey];
      return { ...prev, sidebarHiddenTopics: newSidebarHidden };
    });
  };

  const toggleSectionVisibility = (section: 'grammar' | 'games') => {
    setLocalVisibility(prev => {
      if (section === 'grammar') return { ...prev, showGrammar: !prev.showGrammar };
      return { ...prev, showGames: !prev.showGames };
    });
  };

  const PRACTICE_ITEMS_CONFIG = [
    { key: 'sequential3', title: 'Lộ trình 3 Bước (Chuyên sâu)', desc: '1. Flashcard ➔ 2. Nghe Viết ➔ 3. Gõ Từ', icon: Flame },
    { key: 'optimal', title: 'Học tối ưu (5in1)', desc: 'Tổng hợp 5 bước rèn luyện khoa học', icon: Sparkles },
    { key: 'flashcards', title: 'Flashcards', desc: 'Lật thẻ 2 mặt ghi nhớ từ vựng', icon: Layers },
    { key: 'quiz', title: 'Trắc nghiệm', desc: 'Lựa chọn 4 đáp án thử thách phản xạ', icon: CheckCircle2 },
    { key: 'match', title: 'Nối từ với nghĩa', desc: 'Trò chơi kéo ghép cặp từ và nghĩa', icon: Gamepad2 },
    { key: 'typing', title: 'Gõ từ vựng', desc: 'Rèn luyện phản xạ gõ phím chuẩn xác', icon: Keyboard },
    { key: 'dictation', title: 'Nghe viết', desc: 'Luyện nghe chép chính tả chuẩn IPA', icon: Mic },
    { key: 'ipa', title: 'Luyện phát âm IPA', desc: 'Học phát âm bảng ký hiệu ngữ âm quốc tế', icon: Volume2 },
    { key: 'mixedGame', title: 'Game Hỗn hợp', desc: 'Random trắc nghiệm, nghe viết, gõ từ', icon: Shuffle },
    { key: 'related', title: 'Từ liên quan', desc: 'Mạng lưới từ đồng nghĩa, trái nghĩa', icon: Network },
  ];

  const toggleVocabPracticeSection = () => {
    setLocalVisibility(prev => ({
      ...prev,
      showVocabPractice: prev.showVocabPractice === false ? true : false,
    }));
  };

  const togglePracticeItem = (itemKey: string) => {
    setLocalVisibility(prev => {
      const current = prev.hiddenPracticeItems || [];
      const normalizedKey = itemKey.toLowerCase();
      const isHidden = current.some(k => k.toLowerCase() === normalizedKey);
      const newHidden = isHidden
        ? current.filter(k => k.toLowerCase() !== normalizedKey)
        : [...current, itemKey];
      return { ...prev, hiddenPracticeItems: newHidden };
    });
  };

  const enableAllPracticeItems = () => {
    setLocalVisibility(prev => ({
      ...prev,
      hiddenPracticeItems: [],
    }));
  };

  const disableAllPracticeItems = () => {
    setLocalVisibility(prev => ({
      ...prev,
      hiddenPracticeItems: PRACTICE_ITEMS_CONFIG.map(p => p.key),
    }));
  };

  const toggleAdminBypass = () => {
    setLocalVisibility(prev => ({
      ...prev,
      adminBypassHidden: prev.adminBypassHidden === false ? true : false,
    }));
  };

  const toggleLockAi = () => {
    setLocalVisibility(prev => ({
      ...prev,
      lockAi: !prev.lockAi,
    }));
  };

  const toggleVoiceSettingsVisibility = (lang: 'en' | 'ja') => {
    setLocalVisibility(prev => {
      if (lang === 'en') {
        return {
          ...prev,
          showEnglishVoiceSettings: prev.showEnglishVoiceSettings === false ? true : false,
        };
      } else {
        return {
          ...prev,
          showJapaneseVoiceSettings: prev.showJapaneseVoiceSettings === false ? true : false,
        };
      }
    });
  };

  const toggleWordCountVisibility = () => {
    setLocalVisibility(prev => ({
      ...prev,
      showWordCount: prev.showWordCount === false ? true : false,
    }));
  };

  const toggleChuyendeVocab = () => {
    setLocalVisibility(prev => ({
      ...prev,
      showChuyendeVocab: prev.showChuyendeVocab === false ? true : false,
    }));
  };

  const toggleDailyVocab = () => {
    setLocalVisibility(prev => ({
      ...prev,
      showDailyVocab: prev.showDailyVocab === false ? true : false,
    }));
  };

  const toggleMasterVocab = () => {
    setLocalVisibility(prev => ({
      ...prev,
      showMasterVocab: prev.showMasterVocab === false ? true : false,
    }));
  };

  const enableAllVocabCategories = () => {
    setLocalVisibility(prev => ({
      ...prev,
      showChuyendeVocab: true,
      showDailyVocab: true,
      showMasterVocab: true,
    }));
  };

  const disableAllVocabCategories = () => {
    setLocalVisibility(prev => ({
      ...prev,
      showChuyendeVocab: false,
      showDailyVocab: false,
      showMasterVocab: false,
    }));
  };

  // Fetch list of user IDs who have custom visibility overrides
  const fetchCustomUsers = async () => {
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${API_BASE_URL}/api/admin/visibility/custom-users`, { credentials: 'include', headers });
      if (res.ok) {
        const data = await res.json();
        setCustomUsersList(data.customUserIds || []);
      }
    } catch (err) {
      console.error('Error fetching custom users list:', err);
    }
  };

  // Switch between Global Default and a specific student
  const handleSelectVisibilityUser = async (targetId: string) => {
    setSelectedVisibilityUser(targetId);
    if (targetId === 'global') {
      setHasCustomSettings(false);
      try {
        await refetchSettings();
      } catch {}
      setLocalVisibility(visibilitySettings);
      return;
    }

    setLoadingUserVisibility(true);
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${targetId}/visibility`, { credentials: 'include', headers });
      if (res.ok) {
        const data = await res.json();
        setLocalVisibility({
          hiddenTopics: Array.isArray(data.settings?.hiddenTopics) ? data.settings.hiddenTopics : [],
          sidebarHiddenTopics: Array.isArray(data.settings?.sidebarHiddenTopics) ? data.settings.sidebarHiddenTopics : [],
          showGrammar: data.settings?.showGrammar !== false,
          showGames: data.settings?.showGames !== false,
          showVocabPractice: data.settings?.showVocabPractice !== false,
          hiddenPracticeItems: Array.isArray(data.settings?.hiddenPracticeItems) ? data.settings.hiddenPracticeItems : [],
          adminBypassHidden: data.settings?.adminBypassHidden !== false,
          lockAi: data.settings?.lockAi === true,
          showEnglishVoiceSettings: data.settings?.showEnglishVoiceSettings !== false,
          showJapaneseVoiceSettings: data.settings?.showJapaneseVoiceSettings !== false,
          showWordCount: data.settings?.showWordCount !== false,
          showChuyendeVocab: data.settings?.showChuyendeVocab !== false,
          showDailyVocab: data.settings?.showDailyVocab !== false,
          showMasterVocab: data.settings?.showMasterVocab !== false,
        });
        setHasCustomSettings(Boolean(data.hasCustom));
      }
    } catch (err) {
      console.error('Error loading custom user visibility:', err);
      toast.error('Không thể tải cấu hình riêng của học viên này');
    } finally {
      setLoadingUserVisibility(false);
    }
  };

  const handleSaveVisibility = async () => {
    setSavingVisibility(true);
    try {
      if (selectedVisibilityUser === 'global') {
        const ok = await updateVisibilitySettings(localVisibility);
        if (!ok) {
          throw new Error('Lỗi từ chối lưu cài đặt trên server');
        }
        try { audioManager.playSuccess?.(); } catch {}
        toast.success("Đã lưu cài đặt hiển thị vào cơ sở dữ liệu thành công!");
      } else {
        const headers = getAuthHeaders();
        const res = await fetch(`${API_BASE_URL}/api/admin/users/${selectedVisibilityUser}/visibility`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(localVisibility),
        });
        if (!res.ok) throw new Error('Failed to save user visibility');

        try { audioManager.playSuccess?.(); } catch {}
        setHasCustomSettings(true);
        if (!customUsersList.includes(selectedVisibilityUser)) {
          setCustomUsersList(prev => [...prev, selectedVisibilityUser]);
        }
        const targetUser = usersList.find(u => u.id === selectedVisibilityUser);
        toast.success(`Đã lưu cấu hình riêng cho học viên ${targetUser?.name || targetUser?.username || ''}!`);
      }
    } catch (err) {
      console.error('Save visibility error:', err);
      try { audioManager.playWrong?.(); } catch {}
      toast.error("Lỗi khi lưu cấu hình hiển thị vào cơ sở dữ liệu!");
    } finally {
      setSavingVisibility(false);
    }
  };

  const handleResetUserVisibility = async () => {
    if (selectedVisibilityUser === 'global') return;
    const targetUser = usersList.find(u => u.id === selectedVisibilityUser);
    const targetName = targetUser?.name || targetUser?.username || 'học viên';

    if (!window.confirm(`Bạn có chắc chắn muốn hủy cấu hình riêng của "${targetName}" để đưa về dùng cấu hình mặc định chung không?`)) {
      return;
    }

    setRevertingVisibility(true);
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${selectedVisibilityUser}/visibility`, {
        method: 'DELETE',
        credentials: 'include',
        headers,
      });
      if (!res.ok) throw new Error('Failed to reset user visibility');

      try { audioManager.playSuccess?.(); } catch {}
      setHasCustomSettings(false);
      setCustomUsersList(prev => prev.filter(id => id !== selectedVisibilityUser));
      setLocalVisibility(visibilitySettings);
      toast.success(`Đã hoàn tác về cấu hình mặc định chung cho học viên ${targetName}!`);
    } catch (err) {
      toast.error('Lỗi khi khôi phục cấu hình mặc định');
    } finally {
      setRevertingVisibility(false);
    }
  };

  const fetchServerMetrics = async () => {
    setLoadingMetrics(true);
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${API_BASE_URL}/api/admin/metrics`, { credentials: 'include', headers });
      if (res.ok) {
        const data = await res.json();
        const metrics = data.metrics || data;
        setServerMetrics(metrics);
        if (metrics.onlineStats) {
          setOnlineStats(metrics.onlineStats);
        }
      }
    } catch {
      // Offline fallback metrics calculated from local state
      const withIpa = words.filter(w => w.ipa && w.ipa.trim().length > 0).length;
      const withExample = words.filter(w => w.example_en && w.example_en.trim().length > 0).length;
      setServerMetrics({
        totalWords: words.length,
        withIpa,
        withExample,
        totalUsers: usersList.length || 2,
        memoryRssMb: 128,
        memoryHeapUsedMb: 64,
        nodeVersion: 'Local Browser v18+',
        platform: 'Win32',
      });
    } finally {
      setLoadingMetrics(false);
    }
  };

  // Polling helper for online presence
  const fetchOnlinePolling = useCallback(async () => {
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${API_BASE_URL}/api/admin/presence/online-users`, {
        credentials: 'include',
        headers
      });
      if (res.ok) {
        const data = await res.json();
        setOnlineStats({
          totalOnline: data.totalOnline || 0,
          learnersCount: data.learnersCount || 0,
          adminsCount: data.adminsCount || 0,
          guestsCount: data.guestsCount || 0,
          tabDistribution: data.tabDistribution || {},
          users: data.users || []
        });
        setLastStreamUpdate(new Date());
        setStreamConnected(true);
      }
    } catch {
      setStreamConnected(false);
    }
  }, [getAuthHeaders]);

  // Live SSE Presence Stream & Polling
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let pollingTimer: any = null;

    const token = localStorage.getItem('engmaster_token');

    if (streamMode === 'sse') {
      try {
        const sseUrl = `${API_BASE_URL}/api/admin/presence/stream${token ? `?token=${encodeURIComponent(token)}` : ''}`;
        eventSource = new EventSource(sseUrl, { withCredentials: true });

        eventSource.onopen = () => {
          setStreamConnected(true);
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'snapshot' || data.type === 'update') {
              setOnlineStats({
                totalOnline: data.totalOnline || 0,
                learnersCount: data.learnersCount || 0,
                adminsCount: data.adminsCount || 0,
                guestsCount: data.guestsCount || 0,
                tabDistribution: data.tabDistribution || {},
                users: data.users || []
              });
              setLastStreamUpdate(new Date());
              setStreamConnected(true);
            }
          } catch (e) {
            console.error('Error parsing SSE presence update:', e);
          }
        };

        eventSource.onerror = () => {
          setStreamConnected(false);
          // Fallback to polling
          fetchOnlinePolling();
        };
      } catch {
        setStreamMode('polling');
      }
    } else {
      fetchOnlinePolling();
      pollingTimer = setInterval(fetchOnlinePolling, 5000);
    }

    return () => {
      if (eventSource) eventSource.close();
      if (pollingTimer) clearInterval(pollingTimer);
    };
  }, [streamMode, fetchOnlinePolling]);

  // Real-time filtered online users list
  const filteredOnlineUsers = useMemo(() => {
    let list = onlineStats.users || [];

    if (onlineSearchQuery.trim()) {
      const q = onlineSearchQuery.toLowerCase().trim();
      list = list.filter(u => 
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.username && u.username.toLowerCase().includes(q)) ||
        (u.sessionId && u.sessionId.toLowerCase().includes(q))
      );
    }

    if (onlineRoleFilter !== 'all') {
      list = list.filter(u => {
        if (onlineRoleFilter === 'guest') return u.role === 'guest';
        if (onlineRoleFilter === 'admin') return u.role === 'admin';
        return u.role === 'user' || u.role === 'learner';
      });
    }

    if (onlineTabFilter !== 'all') {
      list = list.filter(u => u.currentTab === onlineTabFilter);
    }

    return list;
  }, [onlineStats.users, onlineSearchQuery, onlineRoleFilter, onlineTabFilter]);

  const getTabBadgeInfo = (tab: string) => {
    switch (tab) {
      case 'home':
        return { label: 'Trang Chủ', color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800' };
      case 'dashboard':
        return { label: 'Bàn Học Cá Nhân', color: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' };
      case 'toeic30':
        return { label: 'Lộ Trình TOEIC 30 Ngày', color: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800' };
      case 'toeic500':
        return { label: '500 Từ TOEIC Mất Gốc', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' };
      case 'toeic600':
        return { label: '600 Từ Vựng TOEIC', color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800' };
      case 'ets2026':
        return { label: 'Từ Vựng ETS 2026', color: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800' };
      case 'japaneseMinna':
        return { label: 'Tiếng Nhật Minna', color: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800' };
      case 'grammar':
        return { label: 'Luyện Ngữ Pháp', color: 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800' };
      case 'reading':
        return { label: 'Luyện Đọc Hiểu', color: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800' };
      case 'speaking':
        return { label: 'Luyện Nói AI', color: 'bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 border-violet-200 dark:border-violet-800' };
      case 'flashcards':
        return { label: 'Học Flashcard', color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800' };
      case 'quiz':
        return { label: 'Trắc Nghiệm', color: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' };
      case 'dictation':
        return { label: 'Nghe Chép Chính Tả', color: 'bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-950/60 dark:text-fuchsia-300 border-fuchsia-200 dark:border-fuchsia-800' };
      case 'srs':
        return { label: 'Lặp Lại SRS', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' };
      case 'typing':
        return { label: 'Gõ Phím', color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800' };
      case 'game_survival':
      case 'game_memory':
      case 'game_hangman':
      case 'game_falling':
      case 'game_scramble':
        return { label: 'Đấu Trường Mini Game', color: 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800' };
      case 'admin_dashboard':
        return { label: 'Bảng Quản Trị', color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700' };
      default:
        return { label: tab, color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700' };
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${API_BASE_URL}/api/admin/users`, { credentials: 'include', headers });
      if (res.ok) {
        const data = await res.json();
        setUsersList(data);
      } else {
        throw new Error('Failed to fetch from server');
      }
    } catch {
      // Fallback default mock users
      setUsersList([
        { id: 'user-admin-001', username: 'admin', name: 'Quản Trị Viên (Admin)', role: 'admin', createdAt: '2026-09-01' },
        { id: 'user-learner-001', username: 'user', name: 'Học Viên Mẫu', role: 'user', createdAt: '2026-09-05' },
        { id: 'user-learner-002', username: 'tienganh2026', name: 'Nguyễn Văn Minh', role: 'user', createdAt: '2026-09-10' },
      ]);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchServerMetrics();
    fetchUsers();
    fetchCustomUsers();
  }, [words.length]);

  useEffect(() => {
    if (activeSubTab === 'visibility') {
      fetchCustomUsers();
      if (usersList.length === 0) fetchUsers();
      if (selectedVisibilityUser === 'global') {
        refetchSettings().catch(() => {});
      }
    }
  }, [activeSubTab]);

  // Export database as JSON
  const handleExportJSON = () => {
    audioManager.playClick();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(words, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `bluebell_vocabulary_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success(`Đã xuất thành công ${words.length} từ vựng sang file JSON!`);
  };

  // Export database as CSV
  const handleExportCSV = () => {
    audioManager.playClick();
    if (!words || words.length === 0) return;

    const headers = ["id", "en", "vi", "ipa", "category", "unit", "master_group", "sub_group"];
    const csvRows = [headers.join(",")];

    for (const w of words) {
      const row = [
        `"${(w.id || '').toString().replace(/"/g, '""')}"`,
        `"${(w.en || '').toString().replace(/"/g, '""')}"`,
        `"${(w.vi || '').toString().replace(/"/g, '""')}"`,
        `"${(w.ipa || '').toString().replace(/"/g, '""')}"`,
        `"${(w.category || '').toString().replace(/"/g, '""')}"`,
        `"${(w.unit || '').toString().replace(/"/g, '""')}"`,
        `"${(w.master_group || '').toString().replace(/"/g, '""')}"`,
        `"${(w.sub_group || '').toString().replace(/"/g, '""')}"`,
      ];
      csvRows.push(row.join(","));
    }

    const blob = new Blob(["\uFEFF" + csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `bluebell_vocabulary_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Đã xuất file CSV thành công!`);
  };

  // Handle Add New User
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword) {
      toast.warning("Vui lòng nhập tên đăng nhập và mật khẩu!");
      return;
    }

    audioManager.playClick();
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUsername.trim(),
          password: newPassword.trim(),
          name: newName.trim() || newUsername.trim(),
          role: newRole,
        }),
      });

      if (res.ok) {
        toast.success(`Đã tạo tài khoản ${newUsername} (${newRole}) thành công!`);
        setNewUsername('');
        setNewPassword('');
        setNewName('');
        fetchUsers();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Tạo tài khoản không thành công");
      }
    } catch {
      // Local fallback
      const newUserObj: User = {
        id: `user-local-${Date.now()}`,
        username: newUsername.trim(),
        name: newName.trim() || newUsername.trim(),
        role: newRole,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setUsersList(prev => [newUserObj, ...prev]);
      toast.success(`Đã tạo tài khoản cục bộ: ${newUsername}`);
      setNewUsername('');
      setNewPassword('');
      setNewName('');
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (id: string, username: string) => {
    if (username === 'admin') {
      toast.error("Không thể xóa tài khoản Quản trị viên chính!");
      return;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn xóa tài khoản ${username}?`)) return;

    audioManager.playClick();
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers,
      });
      if (res.ok) {
        toast.success(`Đã xóa tài khoản ${username}`);
        setCustomUsersList(prev => prev.filter(uid => uid !== id));
        if (selectedVisibilityUser === id) {
          handleSelectVisibilityUser('global');
        }
        fetchUsers();
      } else {
        throw new Error();
      }
    } catch {
      setUsersList(prev => prev.filter(u => u.id !== id));
      setCustomUsersList(prev => prev.filter(uid => uid !== id));
      if (selectedVisibilityUser === id) {
        handleSelectVisibilityUser('global');
      }
      toast.success(`Đã xóa tài khoản ${username} khỏi giao diện`);
    }
  };

  // Handle open streak modal
  const handleOpenStreakModal = (u: User) => {
    audioManager.playClick();
    setSelectedStreakUser(u);
    setEditStreakCount(u.streak?.count || 0);
  };

  // Handle Admin update / adjust / restore user streak
  const handleSaveUserStreak = async (userId: string, targetCount: number) => {
    if (targetCount < 0) {
      toast.warning('Chuỗi ngày học không thể nhỏ hơn 0');
      return;
    }
    setSavingStreak(true);
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/streak`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          streakCount: targetCount,
          lastActiveDate: new Date().toDateString(),
        }),
      });

      if (!res.ok) throw new Error('Không thể cập nhật chuỗi');

      try { audioManager.playSuccess?.(); } catch {}
      toast.success(`Đã cập nhật chuỗi thành công: ${targetCount} ngày!`);

      // Update in usersList
      setUsersList(prev => prev.map(u => {
        if (u.id === userId) {
          return {
            ...u,
            streak: {
              count: targetCount,
              lastActiveDate: new Date().toDateString(),
              lastActiveTimestamp: Date.now(),
              isOnlineToday: true,
              isStreakActive: true,
              updatedAt: new Date().toISOString(),
            },
          };
        }
        return u;
      }));

      // Update modal selectedStreakUser state
      setSelectedStreakUser(prev => prev && prev.id === userId ? {
        ...prev,
        streak: {
          count: targetCount,
          lastActiveDate: new Date().toDateString(),
          lastActiveTimestamp: Date.now(),
          isOnlineToday: true,
          isStreakActive: true,
          updatedAt: new Date().toISOString(),
        },
      } : null);
    } catch (err) {
      console.error('Save streak error:', err);
      try { audioManager.playWrong?.(); } catch {}
      toast.error('Lỗi khi lưu chuỗi học tập của học viên');
    } finally {
      setSavingStreak(false);
    }
  };

  // Compute Streak Statistics across users
  const streakStats = useMemo(() => {
    const nonAdminUsers = usersList.filter(u => u.role !== 'admin');
    const adminUsers = usersList.filter(u => u.role === 'admin');
    const totalStudents = nonAdminUsers.length;
    const totalAdmins = adminUsers.length;
    const activeStreaks = nonAdminUsers.filter(u => (u.streak?.count || 0) > 0 && u.streak?.isStreakActive);
    const onlineToday = nonAdminUsers.filter(u => u.streak?.isOnlineToday);

    const distribution = {
      zero: 0,
      oneToThree: 0,
      fourToSeven: 0,
      eightToThirty: 0,
      moreThanThirty: 0
    };

    let highestStreak = 0;
    let highestStreakUser: User | null = null;
    let totalStreakDays = 0;

    nonAdminUsers.forEach(u => {
      const count = u.streak?.count || 0;
      totalStreakDays += count;
      if (count > highestStreak) {
        highestStreak = count;
        highestStreakUser = u;
      }

      if (count === 0) distribution.zero++;
      else if (count <= 3) distribution.oneToThree++;
      else if (count <= 7) distribution.fourToSeven++;
      else if (count <= 30) distribution.eightToThirty++;
      else distribution.moreThanThirty++;
    });

    const topLearners = [...nonAdminUsers]
      .filter(u => (u.streak?.count || 0) > 0)
      .sort((a, b) => (b.streak?.count || 0) - (a.streak?.count || 0))
      .slice(0, 5);

    const activeStreakRate = totalStudents > 0 ? Math.round((activeStreaks.length / totalStudents) * 100) : 0;
    const avgStreakDays = totalStudents > 0 ? (totalStreakDays / totalStudents).toFixed(1) : '0';

    return {
      totalStudents,
      totalAdmins,
      activeStreaksCount: activeStreaks.length,
      onlineTodayCount: onlineToday.length,
      highestStreak,
      highestStreakUser,
      distribution,
      topLearners,
      activeStreakRate,
      avgStreakDays
    };
  }, [usersList]);

  // Search & Filtered users list
  const filteredAndSortedUsers = useMemo(() => {
    let list = [...usersList];

    if (userSearchQuery.trim()) {
      const q = userSearchQuery.toLowerCase().trim();
      list = list.filter(u =>
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.username && u.username.toLowerCase().includes(q)) ||
        (u.id && u.id.toLowerCase().includes(q))
      );
    }

    if (userSortFilter === 'streak_desc') {
      list.sort((a, b) => (b.streak?.count || 0) - (a.streak?.count || 0));
    } else if (userSortFilter === 'online_today') {
      list = list.filter(u => u.streak?.isOnlineToday);
    } else if (userSortFilter === 'active_streak') {
      list = list.filter(u => (u.streak?.count || 0) > 0 && u.streak?.isStreakActive);
      list.sort((a, b) => (b.streak?.count || 0) - (a.streak?.count || 0));
    } else if (userSortFilter === 'admins') {
      list = list.filter(u => u.role === 'admin');
    } else if (userSortFilter === 'learners') {
      list = list.filter(u => u.role !== 'admin');
    } else if (userSortFilter === 'newest') {
      list.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    }

    return list;
  }, [usersList, userSearchQuery, userSortFilter]);

  // Calculate statistics
  const totalWordsCount = words.length;
  const withIpaCount = words.filter(w => w.ipa && w.ipa.trim().length > 0).length;
  const withExampleCount = words.filter(w => w.example_en && w.example_en.trim().length > 0).length;
  const toeicWordsCount = words.filter(w => (w.master_group && w.master_group.includes('TOEIC')) || (w.sub_group && w.sub_group.includes('Day'))).length;
  const minnaWordsCount = words.filter(w => (w.master_group && w.master_group.includes('Minna')) || w.hiragana).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 md:p-8 text-white shadow-2xl border border-indigo-900/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl shadow-lg shadow-indigo-500/30 text-white">
              <ShieldCheck size={36} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight">Admin Dashboard</h1>
                <span className="px-2.5 py-0.5 text-xs font-black bg-amber-400 text-slate-900 rounded-full uppercase tracking-wider">
                  Pro
                </span>
              </div>
              <p className="text-xs md:text-sm text-indigo-200/80">
                Chào mừng trở lại, <span className="font-bold text-white">{user?.name || 'Administrator'}</span>. Toàn quyền quản trị hệ thống Bluebell.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                audioManager.playClick();
                fetchServerMetrics();
                fetchUsers();
                toast.info("Đã làm mới số liệu hệ thống!");
              }}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-sm border border-white/10 transition-all"
            >
              <RefreshCw size={15} className={loadingMetrics ? 'animate-spin' : ''} />
              <span>Làm mới</span>
            </button>

            <button
              onClick={handleExportJSON}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold bg-blue-600/80 hover:bg-blue-600 text-white rounded-xl shadow-sm transition-all"
            >
              <FileJson size={15} />
              <span>Sao lưu JSON</span>
            </button>

            <button
              onClick={() => {
                audioManager.playClick();
                setActiveTab('manage');
              }}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-all"
            >
              <Database size={15} />
              <span>Quản lý từ vựng</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Cards Grid (5-Card Pro Max Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Card 1: Total Words */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tổng Từ Vựng</span>
            <div className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white mt-1">
              {totalWordsCount.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 size={13} />
              <span>{Math.round((withIpaCount / (totalWordsCount || 1)) * 100)}% có IPA</span>
            </div>
          </div>
          <div className="p-3.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-2xl">
            <Layers size={26} />
          </div>
        </div>

        {/* Card 2: Total Users */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tài Khoản Học Viên</span>
            <div className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white mt-1">
              {usersList.length}
            </div>
            <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1 flex items-center gap-1">
              <Users size={13} />
              <span>{streakStats.totalStudents} học viên · {streakStats.totalAdmins} quản trị</span>
            </div>
          </div>
          <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-2xl">
            <Users size={26} />
          </div>
        </div>

        {/* Card 3: Live Online Users (NEW) */}
        <div 
          onClick={() => { audioManager.playClick(); handleSwitchSubTab('online'); }}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-500/60 hover:-translate-y-0.5 transition-all group"
        >
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Đang Online</span>
              <span className="px-1.5 py-0.2 text-[9px] font-black rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                LIVE
              </span>
            </div>
            <div className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white mt-1 flex items-center gap-2">
              <span>{onlineStats.totalOnline}</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              <Radio size={12} className="animate-pulse" />
              <span>{onlineStats.learnersCount} học viên · {onlineStats.guestsCount} khách</span>
            </div>
          </div>
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-2xl group-hover:scale-105 transition-transform">
            <Radio size={26} className="animate-pulse" />
          </div>
        </div>

        {/* Card 4: Streak Active */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Đang Giữ Chuỗi</span>
            <div className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white mt-1">
              {streakStats.activeStreaksCount}
            </div>
            <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1 flex items-center gap-1">
              <Flame size={13} className="fill-amber-500 text-amber-500" />
              <span>{streakStats.activeStreakRate}% học viên duy trì</span>
            </div>
          </div>
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-2xl">
            <Flame size={26} className="fill-amber-500" />
          </div>
        </div>

        {/* Card 5: Server Health */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Máy Chủ</span>
            <div className="text-xl md:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span>Sẵn sàng</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-1">
              RAM: {serverMetrics?.memoryRssMb || 128} MB
            </div>
          </div>
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-2xl">
            <Server size={26} />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => {
            audioManager.playClick();
            handleSwitchSubTab('overview');
          }}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'overview'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <BarChart3 size={18} />
          <span>Tổng quan & Sức khỏe</span>
        </button>

        <button
          onClick={() => {
            audioManager.playClick();
            handleSwitchSubTab('users');
          }}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'users'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Users size={18} />
          <span>Quản lý Tài khoản ({usersList.length})</span>
        </button>

        <button
          onClick={() => {
            audioManager.playClick();
            handleSwitchSubTab('online');
          }}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'online'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <div className="relative">
            <Radio size={18} className={streamConnected ? 'text-emerald-500 animate-pulse' : ''} />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <span>Giám Sát Online ({onlineStats.totalOnline})</span>
        </button>

        <button
          onClick={() => {
            audioManager.playClick();
            handleSwitchSubTab('backup');
          }}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'backup'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <HardDrive size={18} />
          <span>Sao lưu & Kho Dữ liệu</span>
        </button>

        <button
          onClick={() => {
            audioManager.playClick();
            handleSwitchSubTab('visibility');
          }}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'visibility'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Eye size={18} />
          <span>Phân Quyền & Hiển Thị</span>
        </button>

        <button
          onClick={() => {
            audioManager.playClick();
            handleSwitchSubTab('settings');
          }}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'settings'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Cpu size={18} />
          <span>Cấu hình & AI</span>
        </button>

        <button
          onClick={() => {
            audioManager.playClick();
            handleSwitchSubTab('logs');
          }}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'logs'
              ? 'border-indigo-500 text-indigo-500 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Terminal size={18} />
          <span>Nhật Ký & Gỡ Lỗi</span>
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
              <h3 className="text-base font-black text-slate-800 dark:text-white flex items-center gap-2">
                <Activity size={18} className="text-blue-600" />
                Độ Hoàn Thiện Cơ Sở Dữ Liệu Từ Vựng
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                    <span>Phiên âm Quốc tế IPA ({withIpaCount}/{totalWordsCount})</span>
                    <span>{Math.round((withIpaCount / (totalWordsCount || 1)) * 100)}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500" 
                      style={{ width: `${(withIpaCount / (totalWordsCount || 1)) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                    <span>Ví dụ câu & Ngữ cảnh ({withExampleCount}/{totalWordsCount})</span>
                    <span>{Math.round((withExampleCount / (totalWordsCount || 1)) * 100)}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-500" 
                      style={{ width: `${(withExampleCount / (totalWordsCount || 1)) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                    <span>Bản dịch Tiếng Việt chuẩn hóa</span>
                    <span>100%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-full w-full" />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Gợi ý quản trị:</span>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Hệ thống đang lưu trữ hơn {totalWordsCount.toLocaleString()} từ vựng. Bạn có thể sử dụng công cụ AI tự động bổ sung ví dụ và phiên âm IPA trong tab Quản lý Từ Vựng để nâng cao trải nghiệm học tập của học viên.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-base font-black text-slate-800 dark:text-white flex items-center gap-2">
                <Server size={18} className="text-emerald-500" />
                Thông Tin Môi Trường Máy Chủ
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Trạng thái Node.js:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">Online</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Cơ sở dữ liệu:</span>
                  <span className="font-bold text-slate-800 dark:text-white">MySQL 8.0 (Local)</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Bộ nhớ Heap sử dụng:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-white">
                    {serverMetrics?.memoryHeapUsedMb || 48} MB
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Nền tảng chạy:</span>
                  <span className="font-bold text-slate-800 dark:text-white">
                    {serverMetrics?.platform || 'Windows (Node.js)'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-500">SFX Engine:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">Web Audio Synth (OK)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Real-Time & User Analytics Row in Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Live Presence Quick Card */}
            <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-900 p-6 rounded-3xl border border-emerald-800/40 text-white shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                    <Radio size={20} className="animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-black text-white text-sm">Luồng Trực Tuyến Thời Gian Thực</h4>
                    <p className="text-[11px] text-emerald-300/80">SSE Live Stream · Heartbeat 15s</p>
                  </div>
                </div>
                <button
                  onClick={() => { audioManager.playClick(); handleSwitchSubTab('online'); }}
                  className="text-xs font-bold text-emerald-300 hover:text-white flex items-center gap-1 group transition-colors"
                >
                  <span>Xem chi tiết</span>
                  <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Đang Online</span>
                  <span className="text-2xl font-black text-emerald-400 mt-0.5 block">{onlineStats.totalOnline}</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Học Viên</span>
                  <span className="text-2xl font-black text-blue-400 mt-0.5 block">{onlineStats.learnersCount}</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Khách</span>
                  <span className="text-2xl font-black text-amber-400 mt-0.5 block">{onlineStats.guestsCount}</span>
                </div>
              </div>

              {Object.keys(onlineStats.tabDistribution).length > 0 && (
                <div className="text-[11px] text-slate-300 flex items-center gap-2 pt-1">
                  <span className="text-slate-400">Đang học:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(onlineStats.tabDistribution).slice(0, 3).map(([k, count]) => (
                      <span key={k} className="px-2 py-0.5 rounded-lg bg-white/10 text-[10px] font-bold">
                        {getTabBadgeInfo(k).label}: {count}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Streak & Learner Growth Quick Card */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-200 dark:border-amber-800/40">
                    <Flame size={20} className="fill-amber-500" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 dark:text-white text-sm">Chỉ Số Gắn Kết Học Viên</h4>
                    <p className="text-[11px] text-slate-400">Chuỗi ngày học liên tục (Streak)</p>
                  </div>
                </div>
                <button
                  onClick={() => { audioManager.playClick(); handleSwitchSubTab('users'); }}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 group"
                >
                  <span>Bảng học viên</span>
                  <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3 text-center border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Giữ Chuỗi</span>
                  <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5 block">{streakStats.activeStreaksCount}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3 text-center border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Học Hôm Nay</span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">{streakStats.onlineTodayCount}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3 text-center border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Kỷ Lục</span>
                  <span className="text-2xl font-black text-yellow-600 dark:text-yellow-400 mt-0.5 block">{streakStats.highestStreak}d</span>
                </div>
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1">
                <span>Tỷ lệ duy trì chuỗi: <strong className="text-slate-800 dark:text-white">{streakStats.activeStreakRate}%</strong></span>
                <span>Trung bình: <strong className="text-slate-800 dark:text-white">{streakStats.avgStreakDays} ngày/học viên</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: User Management & Learner Streaks */}
      {activeSubTab === 'users' && (
        <div className="space-y-6">
          {/* Top Streak Statistics Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Active Streaks */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-amber-300 dark:hover:border-amber-700/50 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Đang Giữ Chuỗi</p>
                  <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {streakStats.activeStreaksCount} <span className="text-xs font-semibold text-slate-400">/ {streakStats.totalStudents} học viên</span>
                  </h4>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <Flame size={24} className="animate-pulse fill-white" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                <span>Duy trì thói quen học tập đều đặn</span>
              </div>
            </div>

            {/* Card 2: Active Today */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-emerald-300 dark:hover:border-emerald-700/50 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Học Hôm Nay</p>
                  <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {streakStats.onlineTodayCount} <span className="text-xs font-semibold text-slate-400">học viên</span>
                  </h4>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Activity size={24} />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                <span>Hoạt động học tập ghi nhận hôm nay</span>
              </div>
            </div>

            {/* Card 3: Highest Streak */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-yellow-300 dark:hover:border-yellow-700/50 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Kỷ Lục Chuỗi</p>
                  <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {streakStats.highestStreak} <span className="text-xs font-semibold text-slate-400">ngày liên tục</span>
                  </h4>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-yellow-500/20">
                  <Trophy size={24} />
                </div>
              </div>
              <div className="mt-3 truncate text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                {streakStats.highestStreakUser ? (
                  <span className="font-bold text-amber-600 dark:text-amber-400 inline-flex items-center gap-1">
                    <Crown size={12} className="text-amber-500 fill-amber-500" />
                    <span>{streakStats.highestStreakUser.name || streakStats.highestStreakUser.username}</span>
                  </span>
                ) : (
                  <span>Chưa có dữ liệu kỷ lục</span>
                )}
              </div>
            </div>

            {/* Card 4: Total Users */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-blue-300 dark:hover:border-blue-700/50 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tổng Tài Khoản</p>
                  <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {usersList.length} <span className="text-xs font-semibold text-slate-400">người dùng</span>
                  </h4>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Users size={24} />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                <span>{streakStats.totalStudents} học viên · {usersList.length - streakStats.totalStudents} quản trị</span>
              </div>
            </div>
          </div>

          {/* User Analytics & Streak Deep Dive */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Streak Distribution Card */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
                  <BarChart3 size={16} className="text-indigo-600" />
                  <span>Phân Bố Chuỗi Ngày Học (Streak)</span>
                </h4>
                <span className="text-[11px] font-semibold text-slate-400">
                  {streakStats.totalStudents} học viên
                </span>
              </div>

              <div className="space-y-3 pt-1">
                {/* 0 days */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                      <span>Chưa có chuỗi (0 ngày)</span>
                    </span>
                    <span className="font-mono">
                      {streakStats.distribution.zero} ({streakStats.totalStudents > 0 ? Math.round((streakStats.distribution.zero / streakStats.totalStudents) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-slate-400 rounded-full" 
                      style={{ width: `${streakStats.totalStudents > 0 ? (streakStats.distribution.zero / streakStats.totalStudents) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* 1-3 days */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <span>Mới khởi động (1 - 3 ngày)</span>
                    </span>
                    <span className="font-mono">
                      {streakStats.distribution.oneToThree} ({streakStats.totalStudents > 0 ? Math.round((streakStats.distribution.oneToThree / streakStats.totalStudents) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full" 
                      style={{ width: `${streakStats.totalStudents > 0 ? (streakStats.distribution.oneToThree / streakStats.totalStudents) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* 4-7 days */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Hình thành thói quen (4 - 7 ngày)</span>
                    </span>
                    <span className="font-mono">
                      {streakStats.distribution.fourToSeven} ({streakStats.totalStudents > 0 ? Math.round((streakStats.distribution.fourToSeven / streakStats.totalStudents) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full" 
                      style={{ width: `${streakStats.totalStudents > 0 ? (streakStats.distribution.fourToSeven / streakStats.totalStudents) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* 8-30 days */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span>Chăm chỉ kiên định (8 - 30 ngày)</span>
                    </span>
                    <span className="font-mono">
                      {streakStats.distribution.eightToThirty} ({streakStats.totalStudents > 0 ? Math.round((streakStats.distribution.eightToThirty / streakStats.totalStudents) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" 
                      style={{ width: `${streakStats.totalStudents > 0 ? (streakStats.distribution.eightToThirty / streakStats.totalStudents) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* >30 days */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-500" />
                      <span>Bậc thầy thói quen (&gt; 30 ngày)</span>
                    </span>
                    <span className="font-mono">
                      {streakStats.distribution.moreThanThirty} ({streakStats.totalStudents > 0 ? Math.round((streakStats.distribution.moreThanThirty / streakStats.totalStudents) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" 
                      style={{ width: `${streakStats.totalStudents > 0 ? (streakStats.distribution.moreThanThirty / streakStats.totalStudents) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Top 5 Streaks Leaderboard */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
                  <Trophy size={16} className="text-yellow-500" />
                  <span>Bảng Vàng Học Viên Chăm Chỉ Nhất</span>
                </h4>
                <span className="text-[11px] font-semibold text-slate-400">Top 5 chuỗi</span>
              </div>

              {streakStats.topLearners.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs italic">
                  Chưa có học viên nào ghi nhận chuỗi ngày học liên tục.
                </div>
              ) : (
                <div className="space-y-2.5 pt-1">
                  {streakStats.topLearners.map((learner, idx) => (
                    <div 
                      key={learner.id}
                      className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-800/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                          idx === 0 
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300' 
                            : idx === 1 
                            ? 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300' 
                            : idx === 2 
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300' 
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-400'
                        }`}>
                          {idx === 0 ? <Crown size={14} className="text-amber-600 fill-amber-500" /> : idx + 1}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{learner.name || learner.username}</span>
                            <span className="text-[10px] text-slate-400 font-mono">@{learner.username}</span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Ngày gần nhất: {learner.streak?.lastActiveDate || 'Hôm nay'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50 text-xs font-black">
                          <Flame size={12} className="text-amber-500 fill-amber-500" />
                          <span>{learner.streak?.count || 0} ngày</span>
                        </div>
                        <button
                          onClick={() => handleOpenStreakModal(learner)}
                          className="p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors"
                          title="Điều chỉnh chuỗi"
                        >
                          <Edit3 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Create User Form */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-black text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Plus size={18} className="text-blue-600" />
              Thêm Người Dùng Mới
            </h3>

            <form onSubmit={handleAddUser} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Tên đăng nhập *"
                className="px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mật khẩu *"
                className="px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
              />
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Họ và tên"
                className="px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
              />
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as 'admin' | 'user')}
                className="px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
              >
                <option value="user">Vai trò: Học Viên (User)</option>
                <option value="admin">Vai trò: Quản Trị (Admin)</option>
              </select>
              <button
                type="submit"
                className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
              >
                <Plus size={16} />
                <span>Thêm Tài Khoản</span>
              </button>
            </form>
          </div>

          {/* Users Table & Streak Management */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            {/* Table Header & Search Controls */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-slate-800 dark:text-white flex items-center gap-2">
                  <span>Danh Sách Học Viên & Chuỗi Học Tập</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
                    {filteredAndSortedUsers.length} / {usersList.length}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Theo dõi chuỗi ngày liên tục (streak), ngày học gần nhất và hỗ trợ bù chuỗi cho học viên.
                </p>
              </div>

              {/* Action Tools */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Search Box */}
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Tìm theo tên, tài khoản..."
                    className="pl-8 pr-7 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white w-48 sm:w-56"
                  />
                  {userSearchQuery && (
                    <button
                      onClick={() => setUserSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* Sort / Filter Dropdown */}
                <select
                  value={userSortFilter}
                  onChange={(e) => setUserSortFilter(e.target.value as any)}
                  className="px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                >
                  <option value="all">Tất cả tài khoản</option>
                  <option value="streak_desc">Chuỗi ngày cao nhất</option>
                  <option value="online_today">Đã học hôm nay</option>
                  <option value="active_streak">Đang duy trì chuỗi</option>
                  <option value="newest">Tài khoản mới nhất</option>
                </select>

                {/* Refresh button */}
                <button
                  onClick={() => {
                    audioManager.playClick();
                    fetchUsers();
                    toast.info('Đang cập nhật danh sách học viên từ máy chủ...');
                  }}
                  className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl transition-colors border border-slate-200 dark:border-slate-700"
                  title="Làm mới dữ liệu từ MySQL"
                >
                  <RefreshCw size={15} className={loadingUsers ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Người Dùng</th>
                    <th className="px-5 py-3.5">Tên Đăng Nhập</th>
                    <th className="px-5 py-3.5">Vai Trò</th>
                    <th className="px-5 py-3.5">Chuỗi Học Tập (Streak)</th>
                    <th className="px-5 py-3.5">Hoạt Động / Tham Gia</th>
                    <th className="px-5 py-3.5 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {filteredAndSortedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                        Không tìm thấy người dùng nào phù hợp với bộ lọc tìm kiếm.
                      </td>
                    </tr>
                  ) : (
                    filteredAndSortedUsers.map((u) => {
                      const count = u.streak?.count || 0;
                      const isToday = u.streak?.isOnlineToday;
                      const isActive = u.streak?.isStreakActive;

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="px-5 py-4 font-bold">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                                u.role === 'admin' 
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400' 
                                  : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                              }`}>
                                {u.name ? u.name.charAt(0).toUpperCase() : u.username.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="text-slate-900 dark:text-white flex items-center gap-1.5">
                                  <span>{u.name || u.username}</span>
                                  {count >= 7 && (
                                    <Flame size={14} className="text-amber-500 fill-amber-500 inline" title="Chuỗi học chăm chỉ 7+ ngày" />
                                  )}
                                  {count >= 30 && (
                                    <Crown size={14} className="text-yellow-500 fill-yellow-500 inline" title="Chuỗi kỷ lục 30+ ngày" />
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">{u.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 font-mono font-medium">{u.username}</td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[11px] ${
                              u.role === 'admin'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50'
                            }`}>
                              {u.role === 'admin' ? <Crown size={13} className="text-amber-600" /> : <GraduationCap size={13} className="text-blue-600" />}
                              <span>{u.role === 'admin' ? 'Quản Trị Viên' : 'Học Viên'}</span>
                            </span>
                          </td>

                          {/* Streak Column */}
                          <td className="px-5 py-4">
                            {u.role === 'admin' ? (
                              <div className="flex items-center gap-1 text-slate-400 italic text-[11px]">
                                <span>Tài khoản Quản trị</span>
                              </div>
                            ) : count > 0 ? (
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-rose-500/15 border border-amber-300 dark:border-amber-700/60 rounded-xl text-amber-700 dark:text-amber-300 font-black text-xs shadow-sm">
                                    <Flame size={14} className="text-amber-500 fill-amber-500 animate-pulse" />
                                    <span>{count} ngày</span>
                                  </div>
                                  {isToday ? (
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/40">
                                      ✓ Hôm nay
                                    </span>
                                  ) : isActive ? (
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-800/40">
                                      ⚡ Hôm qua
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800/40">
                                      Đã ngắt
                                    </span>
                                  )}
                                  <button
                                    onClick={() => handleOpenStreakModal(u)}
                                    className="p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 rounded-lg transition-colors"
                                    title="Xem chi tiết & Điều chỉnh chuỗi"
                                  >
                                    <Edit3 size={13} />
                                  </button>
                                </div>
                                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                  <Clock size={10} />
                                  <span>Gần nhất: {u.streak?.lastActiveDate || 'Chưa rõ'}</span>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="text-slate-400 text-xs italic">0 ngày</span>
                                <button
                                  onClick={() => handleOpenStreakModal(u)}
                                  className="px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 rounded-lg border border-amber-200 dark:border-amber-800/40 transition-colors flex items-center gap-1"
                                  title="Khởi tạo hoặc bù chuỗi ngày học cho học viên"
                                >
                                  <Flame size={11} />
                                  <span>+ Bù chuỗi</span>
                                </button>
                              </div>
                            )}
                          </td>

                          {/* Created / Last Activity */}
                          <td className="px-5 py-4 text-slate-500">
                            <div>{u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : 'Hôm nay'}</div>
                            {u.lastActivityAt && (
                              <div className="text-[10px] text-slate-400">
                                Hoạt động: {new Date(u.lastActivityAt).toLocaleDateString('vi-VN')}
                              </div>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {u.role !== 'admin' && (
                                <>
                                  <button
                                    onClick={() => handleOpenStreakModal(u)}
                                    className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-xl transition-colors"
                                    title="Quản lý Chuỗi Học Tập"
                                  >
                                    <Flame size={16} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      audioManager.playClick();
                                      handleSwitchSubTab('visibility');
                                      handleSelectVisibilityUser(u.id);
                                    }}
                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl transition-colors"
                                    title="Cấu hình hiển thị riêng cho học viên này"
                                  >
                                    <Eye size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUser(u.id, u.username)}
                                    className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                                    title="Xóa tài khoản"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </>
                              )}
                              {u.role === 'admin' && (
                                <span className="text-[11px] text-slate-400 italic px-2">Mặc định</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive Streak Management Modal */}
          {selectedStreakUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden space-y-5 p-6">
                {/* Modal Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
                      <Flame size={22} className="fill-white" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-slate-800 dark:text-white">
                        Quản Lý Chuỗi Học Tập (Streak)
                      </h4>
                      <p className="text-xs text-slate-500">
                        Học viên: <span className="font-bold text-slate-700 dark:text-slate-300">{selectedStreakUser.name || selectedStreakUser.username}</span> (@{selectedStreakUser.username})
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedStreakUser(null)}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Current Streak Status Card */}
                <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-rose-500/10 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                        Chuỗi ghi nhận trên hệ thống
                      </p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-3xl font-black text-slate-900 dark:text-white">
                          {selectedStreakUser.streak?.count || 0}
                        </span>
                        <span className="text-sm font-bold text-amber-600 dark:text-amber-400">ngày liên tục 🔥</span>
                      </div>
                    </div>
                    <div className="text-right">
                      {selectedStreakUser.streak?.isOnlineToday ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 rounded-full font-bold text-xs border border-emerald-300 dark:border-emerald-700/50">
                          <Check size={13} />
                          <span>Đã học hôm nay</span>
                        </span>
                      ) : selectedStreakUser.streak?.isStreakActive ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 rounded-full font-bold text-xs border border-blue-300 dark:border-blue-700/50">
                          <span>⚡ Duy trì (Học hôm qua)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 rounded-full font-bold text-xs border border-rose-300 dark:border-rose-700/50">
                          <span>⚠️ Đã ngắt chuỗi</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-amber-200/60 dark:border-amber-800/40 grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                    <div>
                      <span className="text-slate-400">Ngày hoạt động gần nhất:</span>
                      <div className="font-semibold text-slate-700 dark:text-slate-300">
                        {selectedStreakUser.streak?.lastActiveDate || 'Chưa ghi nhận'}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400">Lần đồng bộ cuối:</span>
                      <div className="font-semibold text-slate-700 dark:text-slate-300">
                        {selectedStreakUser.streak?.updatedAt ? new Date(selectedStreakUser.streak.updatedAt).toLocaleString('vi-VN') : 'Mới tạo'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Adjuster Tool */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                    Điều chỉnh số ngày chuỗi (Admin Override):
                  </label>
                  
                  {/* Stepper Input */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setEditStreakCount(prev => Math.max(0, prev - 1))}
                      className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-black text-lg flex items-center justify-center transition-colors"
                      title="Giảm 1 ngày"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={0}
                      value={editStreakCount}
                      onChange={(e) => setEditStreakCount(Math.max(0, parseInt(e.target.value || '0', 10)))}
                      className="flex-1 py-2.5 px-4 text-center text-lg font-black bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none dark:text-white"
                    />
                    <button
                      onClick={() => setEditStreakCount(prev => prev + 1)}
                      className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-black text-lg flex items-center justify-center transition-colors"
                      title="Tăng 1 ngày"
                    >
                      +
                    </button>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setEditStreakCount(prev => prev + 1)}
                      className="px-2.5 py-1.5 text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50 rounded-lg hover:bg-amber-100 transition-colors"
                    >
                      +1 Ngày (Bù lỡ)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditStreakCount(7)}
                      className="px-2.5 py-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      7 Ngày (1 tuần)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditStreakCount(14)}
                      className="px-2.5 py-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      14 Ngày (2 tuần)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditStreakCount(30)}
                      className="px-2.5 py-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      30 Ngày (1 tháng)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditStreakCount(0)}
                      className="px-2.5 py-1.5 text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 rounded-lg hover:bg-rose-100 transition-colors ml-auto"
                    >
                      Reset về 0
                    </button>
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedStreakUser(null)}
                    className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="button"
                    disabled={savingStreak}
                    onClick={() => handleSaveUserStreak(selectedStreakUser.id, editStreakCount)}
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-orange-500/25 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {savingStreak ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Đang lưu...</span>
                      </>
                    ) : (
                      <>
                        <Save size={14} />
                        <span>Lưu Thay Đổi Chuỗi</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Real-Time Online Presence Monitor */}
      {activeSubTab === 'online' && (
        <div className="space-y-6">
          {/* Real-time Status Header */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="relative p-3.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 shadow-sm">
                <Radio size={24} className={streamConnected ? 'animate-pulse' : ''} />
                {streamConnected && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Giám Sát Người Dùng Trực Tuyến
                  </h3>
                  <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full flex items-center gap-1.5 ${
                    streamConnected 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' 
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                  }`}>
                    {streamConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
                    <span>{streamConnected ? (streamMode === 'sse' ? 'Luồng Trực Tiếp SSE' : 'Đang Thăm Dò (Polling)') : 'Mất Kết Nối'}</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex flex-wrap items-center gap-2">
                  <span>Tự động cập nhật thời gian thực khi người dùng chuyển trang hoặc làm bài tập.</span>
                  <span className="text-slate-300 dark:text-slate-700">·</span>
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Clock size={11} />
                    Cập nhật: {lastStreamUpdate.toLocaleTimeString('vi-VN')}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  audioManager.playClick();
                  setStreamMode(prev => prev === 'sse' ? 'polling' : 'sse');
                  toast.info(streamMode === 'sse' ? 'Đã chuyển sang chế độ Polling (thăm dò chu kỳ)' : 'Đã chuyển sang luồng SSE thời gian thực');
                }}
                className="px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5"
                title="Chuyển đổi giao thức luồng dữ liệu"
              >
                {streamMode === 'sse' ? <Activity size={14} className="text-emerald-600" /> : <RefreshCw size={14} className="text-blue-600" />}
                <span>Chế độ: {streamMode.toUpperCase()}</span>
              </button>

              <button
                onClick={() => {
                  audioManager.playClick();
                  fetchOnlinePolling();
                  toast.success('Đã làm mới dữ liệu người dùng trực tuyến');
                }}
                className="px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all flex items-center gap-1.5"
              >
                <RefreshCw size={14} />
                <span>Làm mới</span>
              </button>
            </div>
          </div>

          {/* 4 Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Online */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tổng Đang Truy Cập</p>
                  <h4 className="text-3xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
                    <span>{onlineStats.totalOnline}</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  </h4>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <Radio size={24} className="animate-pulse" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                <Globe size={13} />
                <span>Số phiên đang kết nối đồng thời</span>
              </div>
            </div>

            {/* Card 2: Learners Online */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Học Viên Học Tập</p>
                  <h4 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                    {onlineStats.learnersCount}
                  </h4>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <GraduationCap size={24} />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                <UserCheck size={13} />
                <span>Đã đăng nhập tài khoản học viên</span>
              </div>
            </div>

            {/* Card 3: Admins Online */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Quản Trị Viên</p>
                  <h4 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                    {onlineStats.adminsCount}
                  </h4>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/25">
                  <Crown size={24} />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-[11px] text-purple-600 dark:text-purple-400 font-semibold">
                <ShieldCheck size={13} />
                <span>Đang theo dõi bảng điều khiển</span>
              </div>
            </div>

            {/* Card 4: Guests Online */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Khách Tham Quan</p>
                  <h4 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                    {onlineStats.guestsCount}
                  </h4>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/25">
                  <Compass size={24} />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                <Zap size={13} />
                <span>Chưa đăng nhập tài khoản</span>
              </div>
            </div>
          </div>

          {/* Room / Feature Distribution */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h4 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
                <Activity size={16} className="text-blue-600" />
                <span>Phân Bố Người Dùng Theo Tính Năng & Phòng Học</span>
              </h4>
              {onlineTabFilter !== 'all' && (
                <button
                  onClick={() => setOnlineTabFilter('all')}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <X size={12} />
                  <span>Xóa lọc phòng ({getTabBadgeInfo(onlineTabFilter).label})</span>
                </button>
              )}
            </div>

            {Object.keys(onlineStats.tabDistribution).length === 0 ? (
              <p className="text-xs text-slate-400 italic">Chưa có dữ liệu phòng học đang mở.</p>
            ) : (
              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={() => setOnlineTabFilter('all')}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                    onlineTabFilter === 'all'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                  }`}
                >
                  <span>Tất cả phòng học</span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                    onlineTabFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                  }`}>
                    {onlineStats.totalOnline}
                  </span>
                </button>

                {Object.entries(onlineStats.tabDistribution).map(([tabKey, count]) => {
                  const info = getTabBadgeInfo(tabKey);
                  const isSelected = onlineTabFilter === tabKey;
                  return (
                    <button 
                      key={tabKey}
                      onClick={() => setOnlineTabFilter(prev => prev === tabKey ? 'all' : tabKey)}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${info.color} ${
                        isSelected ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-slate-900 scale-105 shadow-sm' : 'hover:scale-[1.02]'
                      }`}
                    >
                      <span>{info.label}</span>
                      <span className="px-2 py-0.5 rounded-full bg-white/90 dark:bg-slate-900/90 text-[11px] font-black shadow-xs">
                        {count} người
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Real-time Users List Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            {/* Table Filters */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-black text-slate-800 dark:text-white flex items-center gap-2">
                  <span>Chi Tiết Người Dùng Trực Tuyến</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                    {filteredOnlineUsers.length} / {onlineStats.users.length} phiên
                  </span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Theo dõi danh tính, vị trí phòng học và nhịp tim định kỳ (heartbeat) thời gian thực.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Search */}
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={onlineSearchQuery}
                    onChange={(e) => setOnlineSearchQuery(e.target.value)}
                    placeholder="Tìm tên, tài khoản, session..."
                    className="pl-8 pr-7 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white w-48 sm:w-56"
                  />
                  {onlineSearchQuery && (
                    <button
                      onClick={() => setOnlineSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* Role Filter */}
                <select
                  value={onlineRoleFilter}
                  onChange={(e) => setOnlineRoleFilter(e.target.value as any)}
                  className="px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                >
                  <option value="all">Tất cả vai trò</option>
                  <option value="user">Chỉ học viên</option>
                  <option value="admin">Chỉ quản trị viên</option>
                  <option value="guest">Chỉ khách tham quan</option>
                </select>
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Người Dùng</th>
                    <th className="px-5 py-3.5">Vai Trò</th>
                    <th className="px-5 py-3.5">Vị Trí Đang Học</th>
                    <th className="px-5 py-3.5">Trạng Thái / Phản Hồi</th>
                    <th className="px-5 py-3.5">Mã Phiên (Session ID)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {filteredOnlineUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Radio size={32} className="text-slate-300 dark:text-slate-700 animate-pulse" />
                          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Không tìm thấy phiên kết nối nào phù hợp</p>
                          <p className="text-xs text-slate-400">Hệ thống sẽ tự động cập nhật ngay khi có người mở website</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredOnlineUsers.map((u) => {
                      const tabInfo = getTabBadgeInfo(u.currentTab);
                      const isLearner = u.role === 'user' || u.role === 'learner';
                      const isAdmin = u.role === 'admin';

                      return (
                        <tr key={u.sessionId} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                          {/* User Profile */}
                          <td className="px-5 py-4 font-bold">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-xs shadow-sm ${
                                  isAdmin
                                    ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white'
                                    : isLearner
                                    ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white'
                                    : 'bg-gradient-to-br from-slate-400 to-slate-500 text-white'
                                }`}>
                                  {u.name ? u.name.charAt(0).toUpperCase() : u.username ? u.username.charAt(0).toUpperCase() : 'G'}
                                </div>
                                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                              </div>
                              <div>
                                <div className="text-slate-900 dark:text-white font-bold text-sm">
                                  {u.name || u.username || 'Khách vãng lai'}
                                </div>
                                <div className="text-[11px] text-slate-400 font-mono">
                                  {u.userId ? `@${u.username}` : 'Chưa đăng nhập'}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Role */}
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                              isAdmin
                                ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800/50'
                                : isLearner
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800/50'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                            }`}>
                              {isAdmin ? <Crown size={13} className="text-purple-600" /> : isLearner ? <GraduationCap size={13} className="text-blue-600" /> : <Compass size={13} className="text-slate-500" />}
                              <span>{isAdmin ? 'Quản Trị Viên' : isLearner ? 'Học Viên' : 'Khách Vãng Lai'}</span>
                            </span>
                          </td>

                          {/* Room / Tab */}
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${tabInfo.color}`}>
                              <Monitor size={13} />
                              <span>{tabInfo.label}</span>
                            </span>
                          </td>

                          {/* Idle / Heartbeat */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${
                                u.idleSeconds < 15 
                                  ? 'bg-emerald-500 animate-pulse' 
                                  : u.idleSeconds < 30 
                                  ? 'bg-amber-500' 
                                  : 'bg-slate-400'
                              }`} />
                              <span className="font-medium text-slate-700 dark:text-slate-300">
                                {u.idleSeconds < 5 
                                  ? 'Vừa xong' 
                                  : `${u.idleSeconds}s trước`}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Nhịp tim: 15s/lần
                            </div>
                          </td>

                          {/* Session ID */}
                          <td className="px-5 py-4">
                            <code className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-500 dark:text-slate-400">
                              {u.sessionId.slice(0, 16)}...
                            </code>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Backup & Data Storage */}
      {activeSubTab === 'backup' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-2xl">
                <FileJson size={24} />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-800 dark:text-white">Xuất File JSON Đầy Đủ</h4>
                <p className="text-xs text-slate-500">Định dạng JSON chuẩn, lưu trữ trọn vẹn mọi trường thuộc tính.</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Thích hợp cho việc sao lưu định kỳ, migrate máy chủ hoặc khôi phục dữ liệu khi cài đặt lại môi trường.
            </p>
            <button
              onClick={handleExportJSON}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Download size={16} />
              <span>Tải Xuống JSON ({totalWordsCount} từ)</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                <FileSpreadsheet size={24} />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-800 dark:text-white">Xuất Bảng Tính Excel (CSV)</h4>
                <p className="text-xs text-slate-500">Mở và chỉnh sửa trực tiếp bằng Microsoft Excel hoặc Google Sheets.</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Bao gồm mã ID, từ tiếng Anh, dịch tiếng Việt, phiên âm IPA, nhóm bài học và phân loại từ loại.
            </p>
            <button
              onClick={handleExportCSV}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Download size={16} />
              <span>Tải Xuống Bảng Tính CSV</span>
            </button>
          </div>
        </div>
      )}


      {/* Tab 5: Visibility & Permissions */}
      {activeSubTab === 'visibility' && (
        <div className="space-y-6">
          {/* Header Action Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
                  <Eye size={20} />
                </span>
                <h3 className="text-lg font-black text-slate-800 dark:text-white">
                  Phân Quyền & Quản Lý Hiển Thị Cho Học Viên
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Chủ động cấu hình bật/tắt hiển thị chuyên đề và phân khu chức năng theo mặc định chung toàn hệ thống, hoặc thiết lập cấu hình hiển thị độc lập cho từng học viên. Tài khoản Quản trị viên (Admin) luôn xem được toàn bộ.
              </p>
            </div>
          </div>

          {/* Target User Selector Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Users size={15} className="text-blue-600 dark:text-blue-400" />
                  <span>Chọn đối tượng áp dụng cấu hình hiển thị:</span>
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={selectedVisibilityUser}
                    onChange={(e) => handleSelectVisibilityUser(e.target.value)}
                    className="px-4 py-2.5 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white min-w-[280px]"
                  >
                    <option value="global">🌐 Cấu hình mặc định chung (Tất cả học viên)</option>
                    <optgroup label="Từng học viên cụ thể">
                      {usersList
                        .filter(u => u.role !== 'admin')
                        .map(u => {
                          const isCustom = customUsersList.includes(u.id);
                          return (
                            <option key={u.id} value={u.id}>
                              👤 {u.name || u.username} ({u.username}) {isCustom ? '⭐ [Đã có cấu hình riêng]' : '— [Dùng mặc định]'}
                            </option>
                          );
                        })}
                    </optgroup>
                  </select>

                  {/* Status Badge */}
                  {selectedVisibilityUser === 'global' ? (
                    <span className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-xl border border-blue-200 dark:border-blue-800/40 flex items-center gap-1.5">
                      <span>🌐 Đang cấu hình Mặc định chung cho toàn hệ thống</span>
                    </span>
                  ) : hasCustomSettings ? (
                    <span className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-bold rounded-xl border border-amber-200 dark:border-amber-800/40 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-amber-500" />
                      <span>Đang áp dụng cấu hình riêng cho học viên này</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
                      <span>ℹ️ Học viên này đang kế thừa cấu hình mặc định chung</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5">
                {selectedVisibilityUser !== 'global' && hasCustomSettings && (
                  <button
                    type="button"
                    onClick={handleResetUserVisibility}
                    disabled={revertingVisibility}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-all disabled:opacity-50"
                    title="Hủy cấu hình riêng và đưa về cấu hình chung"
                  >
                    <RefreshCw size={14} className={revertingVisibility ? 'animate-spin' : ''} />
                    <span>Đặt lại về mặc định</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSaveVisibility}
                  disabled={savingVisibility || loadingUserVisibility}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
                >
                  <Save size={16} className={savingVisibility ? 'animate-spin' : ''} />
                  <span>
                    {savingVisibility
                      ? 'Đang lưu...'
                      : selectedVisibilityUser === 'global'
                        ? 'Lưu Cấu Hình Mặc Định'
                        : 'Lưu Riêng Cho Học Viên Này'}
                  </span>
                </button>
              </div>
            </div>

            {loadingUserVisibility && (
              <div className="text-xs text-blue-600 dark:text-blue-400 animate-pulse font-semibold flex items-center gap-2 pt-1">
                <RefreshCw size={12} className="animate-spin" />
                <span>Đang tải cấu hình hiển thị của học viên...</span>
              </div>
            )}
          </div>

          {/* Section 0: Đặc Quyền Xem Của Quản Trị Viên */}
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-500/15 dark:via-transparent p-6 rounded-3xl border border-amber-300/80 dark:border-amber-700/60 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={20} className="text-amber-600 dark:text-amber-400" />
                  <h4 className="text-sm font-black text-slate-800 dark:text-white">
                    Đặc Quyền Xem Của Quản Trị Viên (Admin View Privilege)
                  </h4>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    localVisibility.adminBypassHidden !== false
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {localVisibility.adminBypassHidden !== false ? '🛡️ Admin thấy tất cả' : '👁️ Mô phỏng giao diện Học Viên'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
                  <strong>Bật (Mặc định):</strong> Admin luôn xem và quản lý được toàn bộ các chuyên đề và phân khu trên thanh Sidebar & Trang chủ (các mục bị ẩn đối với học viên sẽ được gắn nhãn <span className="font-bold text-amber-600 dark:text-amber-400">[Đã ẩn]</span>).<br />
                  <strong>Tắt:</strong> Admin sẽ ẩn các mục hoàn toàn giống học viên để bạn kiểm thử trực tiếp góc nhìn của người học.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={toggleAdminBypass}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                    localVisibility.adminBypassHidden !== false ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      localVisibility.adminBypassHidden !== false ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Section 1: Chuyên đề học tập */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
                  <BookOpen size={16} className="text-purple-600" />
                  Quản Lý Ẩn/Hiện Chuyên Đề Trọng Điểm
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tùy chỉnh hiển thị từng chuyên đề trên thanh <strong>Sidebar (Slidebar)</strong> và trong <strong>Danh mục bài học</strong>.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg flex items-center gap-1">
                  <PanelLeft size={13} />
                  Ẩn khỏi Sidebar: {(localVisibility.sidebarHiddenTopics || []).length}
                </span>
                <span className="text-xs font-bold px-2.5 py-1 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-lg flex items-center gap-1">
                  <EyeOff size={13} />
                  Khóa toàn bộ: {localVisibility.hiddenTopics.length}
                </span>
                <button
                  type="button"
                  onClick={handleSaveVisibility}
                  disabled={savingVisibility || loadingUserVisibility}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
                >
                  <Save size={14} className={savingVisibility ? 'animate-spin' : ''} />
                  <span>{savingVisibility ? 'Đang lưu...' : 'Lưu Cài Đặt'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {allTopics.map((topic) => {
                const isGlobalHidden = localVisibility.hiddenTopics.includes(topic.key);
                const isSidebarHidden = (localVisibility.sidebarHiddenTopics || []).includes(topic.key);
                const isActuallyInSidebar = !isGlobalHidden && !isSidebarHidden;

                return (
                  <div
                    key={topic.key}
                    className={`p-4 rounded-2xl border transition-all space-y-3 ${
                      isGlobalHidden
                        ? 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-80'
                        : isSidebarHidden
                        ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-800/40 shadow-xs'
                        : 'bg-white dark:bg-slate-800/80 border-purple-200/60 dark:border-purple-800/40 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">
                            {topic.title}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                              isActuallyInSidebar
                                ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {isActuallyInSidebar ? '✓ Hiện ở Sidebar' : '✕ Ẩn khỏi Sidebar'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                          {topic.desc}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-700/50">
                      {/* Control 1: Sidebar Toggle */}
                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <PanelLeft size={13} className={isActuallyInSidebar ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'} />
                          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate">
                            Hiện ở Sidebar
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleSidebarVisibility(topic.key)}
                          disabled={isGlobalHidden}
                          title={isGlobalHidden ? 'Chuyên đề đang bị khóa toàn diện' : 'Bật/Tắt hiển thị trên Sidebar'}
                          className={`shrink-0 relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                            isActuallyInSidebar ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                          } ${isGlobalHidden ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                              isActuallyInSidebar ? 'translate-x-4.5' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Control 2: Global Course Toggle */}
                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <BookOpen size={13} className={!isGlobalHidden ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'} />
                          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate">
                            Mở khóa học
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleTopicVisibility(topic.key)}
                          title="Bật/Tắt truy cập chuyên đề học tập"
                          className={`shrink-0 relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                            !isGlobalHidden ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                              !isGlobalHidden ? 'translate-x-4.5' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Phân khu Luyện câu & Khu vực Trò chơi */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
                  <Layers size={16} className="text-blue-600" />
                  Quản Lý Ẩn/Hiện Phân Khu Chức Năng
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Cho phép ẩn toàn bộ nhóm chức năng Ngữ pháp và Trò chơi khi muốn học viên tập trung học từ vựng.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveVisibility}
                  disabled={savingVisibility || loadingUserVisibility}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
                >
                  <Save size={15} className={savingVisibility ? 'animate-spin' : ''} />
                  <span>{savingVisibility ? 'Đang lưu...' : 'Lưu Cài Đặt Phân Khu'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Grammar & Sentence Section Toggle */}
              <div
                className={`p-5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                  !localVisibility.showGrammar
                    ? 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-75'
                    : 'bg-white dark:bg-slate-800/80 border-blue-200/60 dark:border-blue-800/40 shadow-sm'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                      ✍️ Luyện Câu & Ngữ Pháp
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        !localVisibility.showGrammar
                          ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
                          : 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {localVisibility.showGrammar ? 'Đang mở' : 'Đang ẩn'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Bao gồm: Luyện đọc hiểu, Ngữ pháp chuyên sâu, Luyện câu ghép và Luyện phát âm AI.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => toggleSectionVisibility('grammar')}
                  className={`shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    localVisibility.showGrammar ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      localVisibility.showGrammar ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Games Section Toggle */}
              <div
                className={`p-5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                  !localVisibility.showGames
                    ? 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-75'
                    : 'bg-white dark:bg-slate-800/80 border-amber-200/60 dark:border-amber-800/40 shadow-sm'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                      🎮 Khu Vực Trò Chơi
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        !localVisibility.showGames
                          ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
                          : 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {localVisibility.showGames ? 'Đang mở' : 'Đang ẩn'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Bao gồm: Lật Thẻ Trí Nhớ, Thử Thách Sinh Tồn, Treo Cổ (Hangman), Mưa Từ Rơi, Ghép Chữ Scramble.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => toggleSectionVisibility('games')}
                  className={`shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    localVisibility.showGames ? 'bg-amber-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      localVisibility.showGames ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Section 2.5: Quản Lý Phân Khu Luyện Tập Từ Vựng & Các Chế Độ Con */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
                  <Flame size={18} className="text-amber-500" />
                  Quản Lý Phân Khu "Luyện Tập Từ Vựng" & 10 Chế Độ Con
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Bật/tắt toàn bộ phân khu Luyện Tập hoặc tùy chọn ẩn/hiện độc lập từng phương pháp học tập đối với học viên.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={enableAllPracticeItems}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs rounded-xl border border-emerald-200 dark:border-emerald-800 transition-all cursor-pointer"
                  title="Hiện tất cả 10 chế độ học tập"
                >
                  ✓ Hiện tất cả (10)
                </button>
                <button
                  type="button"
                  onClick={disableAllPracticeItems}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                  title="Ẩn tất cả các chế độ học tập"
                >
                  ✕ Ẩn tất cả
                </button>
                <button
                  type="button"
                  onClick={handleSaveVisibility}
                  disabled={savingVisibility || loadingUserVisibility}
                  className="flex items-center justify-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Save size={14} className={savingVisibility ? 'animate-spin' : ''} />
                  <span>{savingVisibility ? 'Đang lưu...' : 'Lưu Thay Đổi'}</span>
                </button>
              </div>
            </div>

            {/* Master Toggle Banner */}
            <div className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              localVisibility.showVocabPractice === false
                ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-900/60'
                : 'bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent dark:from-amber-500/15 dark:via-transparent border-amber-300/80 dark:border-amber-700/60 shadow-xs'
            }`}>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Flame size={18} className="text-amber-600 dark:text-amber-400" />
                    Công tắc Tổng Phân Khu: Luyện Tập Từ Vựng
                  </span>
                  <span className={`px-2.5 py-0.5 text-[10px] font-black rounded-full ${
                    localVisibility.showVocabPractice !== false
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40'
                      : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40'
                  }`}>
                    {localVisibility.showVocabPractice !== false ? '🟢 Phân khu đang MỞ' : '🔴 Phân khu đang BỊ ẨN'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {localVisibility.showVocabPractice !== false
                    ? 'Khi phân khu MỞ, học viên sẽ thấy mục "Luyện Tập Từ Vựng" trên Sidebar và có thể học các chế độ con được cấp phép bên dưới.'
                    : 'Khi phân khu BỊ ẨN, toàn bộ mục "Luyện Tập Từ Vựng" sẽ biến mất khỏi Sidebar và Trang chủ của học viên, đồng thời chặn truy cập trực tiếp bằng đường dẫn URL.'}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={toggleVocabPracticeSection}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                    localVisibility.showVocabPractice !== false ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      localVisibility.showVocabPractice !== false ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Warning if Master Toggle is OFF */}
            {localVisibility.showVocabPractice === false && (
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center gap-2.5 text-xs text-amber-900 dark:text-amber-200">
                <AlertCircle size={16} className="shrink-0 text-amber-600 dark:text-amber-400" />
                <span>
                  <strong>Lưu ý:</strong> Vì Công tắc Tổng đang Tắt, tất cả 10 chế độ bên dưới sẽ tự động bị ẩn đối với học viên cho dù công tắc riêng lẻ của từng mục đang bật.
                </span>
              </div>
            )}

            {/* Sub-items Grid (10 Modes) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Danh Sách 10 Chế Độ Học Tập Con (Tùy Chọn Độc Lập):
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Đã ẩn: {(localVisibility.hiddenPracticeItems || []).length}/10
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {PRACTICE_ITEMS_CONFIG.map((item) => {
                  const isItemHidden = (localVisibility.hiddenPracticeItems || []).some(
                    k => k.toLowerCase() === item.key.toLowerCase()
                  );
                  const isEffectivelyVisible = localVisibility.showVocabPractice !== false && !isItemHidden;
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.key}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                        isItemHidden
                          ? 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-80'
                          : 'bg-white dark:bg-slate-800/80 border-slate-200/90 dark:border-slate-700 shadow-xs hover:border-blue-300 dark:hover:border-blue-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <div className={`p-2 rounded-xl text-white shrink-0 shadow-xs ${
                            isItemHidden 
                              ? 'bg-slate-400 dark:bg-slate-600' 
                              : 'bg-gradient-to-br from-indigo-500 to-blue-600'
                          }`}>
                            <Icon size={16} />
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <span className="font-bold text-xs text-slate-800 dark:text-white line-clamp-1">
                              {item.title}
                            </span>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                              {item.desc}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 text-[9px] font-black rounded-full shrink-0 ${
                            isEffectivelyVisible
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                              : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                          }`}
                        >
                          {isEffectivelyVisible ? 'Đang mở' : 'Đã ẩn'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60">
                        <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                          {isItemHidden ? 'Đang bị khóa' : 'Cho phép học viên'}
                        </span>

                        <button
                          type="button"
                          onClick={() => togglePracticeItem(item.key)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                            !isItemHidden ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                              !isItemHidden ? 'translate-x-4.5' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 3: Quản Lý Khóa / Mở Trí Tuệ Nhân Tạo (AI) */}
          <div className="bg-gradient-to-r from-violet-500/10 via-purple-500/5 to-transparent dark:from-violet-500/15 dark:via-transparent p-6 rounded-3xl border border-violet-300/80 dark:border-violet-700/60 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Bot size={20} className="text-violet-600 dark:text-violet-400" />
                  <h4 className="text-sm font-black text-slate-800 dark:text-white">
                    Quản Lý Khóa / Mở Trí Tuệ Nhân Tạo (AI Control)
                  </h4>
                  <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                    localVisibility.lockAi
                      ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40'
                      : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40'
                  }`}>
                    {localVisibility.lockAi ? '🔒 Đang Khóa AI Đối Với Học Viên' : '⚡ Đang Mở AI Hoạt Động Bình Thường'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
                  <strong>Khóa AI (Bật):</strong> Vô hiệu hóa toàn bộ các tính năng gọi Gemini AI (Đề thi thử TOEIC AI, Trắc nghiệm ngữ pháp AI, Chấm phát âm AI, Tạo từ vựng AI) đối với học viên để tiết kiệm tài nguyên API hoặc trong thời gian thi cử/bảo trì.<br />
                  <strong>Mở AI (Tắt):</strong> Cho phép học viên tự do khai thác toàn bộ trợ lý AI như bình thường.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={toggleLockAi}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                    localVisibility.lockAi ? 'bg-rose-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      localVisibility.lockAi ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Section 4: Quản Lý Ẩn/Hiện Cài Đặt Giọng Đọc (Voice Settings) */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
                  <Volume2 size={16} className="text-blue-600 dark:text-blue-400" />
                  Quản Lý Ẩn/Hiện Cài Đặt Giọng Đọc (Voice Settings)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tùy chỉnh quyền cho phép học viên tùy biến cấu hình giọng phát âm Tiếng Anh hoặc Tiếng Nhật Minna trong ứng dụng.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSaveVisibility}
                disabled={savingVisibility || loadingUserVisibility}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 cursor-pointer self-start sm:self-auto"
              >
                <Save size={14} className={savingVisibility ? 'animate-spin' : ''} />
                <span>{savingVisibility ? 'Đang lưu...' : 'Lưu Cài Đặt'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* English Voice Setting Toggle */}
              <div className={`p-5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                localVisibility.showEnglishVoiceSettings === false
                  ? 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-75'
                  : 'bg-white dark:bg-slate-800/80 border-blue-200/60 dark:border-blue-800/40 shadow-sm'
              }`}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                      🇬🇧 Cài Đặt Giọng Đọc Tiếng Anh
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      localVisibility.showEnglishVoiceSettings === false
                        ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
                        : 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {localVisibility.showEnglishVoiceSettings !== false ? 'Đang mở' : 'Đang ẩn'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Bao gồm: Chọn giọng đọc (US, UK, AU, CA), thanh trượt tốc độ phát âm và chế độ ngẫu nhiên giọng thi TOEIC.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => toggleVoiceSettingsVisibility('en')}
                  className={`shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                    localVisibility.showEnglishVoiceSettings !== false ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      localVisibility.showEnglishVoiceSettings !== false ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Japanese Voice Setting Toggle */}
              <div className={`p-5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                localVisibility.showJapaneseVoiceSettings === false
                  ? 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-75'
                  : 'bg-white dark:bg-slate-800/80 border-rose-200/60 dark:border-rose-800/40 shadow-sm'
              }`}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                      🇯🇵 Cài Đặt Giọng Đọc Tiếng Nhật
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      localVisibility.showJapaneseVoiceSettings === false
                        ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
                        : 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {localVisibility.showJapaneseVoiceSettings !== false ? 'Đang mở' : 'Đang ẩn'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Bao gồm: Lựa chọn giọng đọc Tokyo/Minna, thanh trượt tốc độ phát âm chuyên biệt cho từ vựng Hiragana/Kanji.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => toggleVoiceSettingsVisibility('ja')}
                  className={`shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                    localVisibility.showJapaneseVoiceSettings !== false ? 'bg-rose-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      localVisibility.showJapaneseVoiceSettings !== false ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Section 5: Quản Lý Ẩn/Hiện Số Lượng Từ Vựng (Word Count Control) */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Hash size={20} className="text-amber-500 dark:text-amber-400" />
                  <h4 className="text-sm font-black text-slate-800 dark:text-white">
                    Quản Lý Ẩn / Hiện Số Lượng Từ Vựng (Word Count Visibility)
                  </h4>
                  <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                    localVisibility.showWordCount === false
                      ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40'
                      : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40'
                  }`}>
                    {localVisibility.showWordCount === false ? '🔒 Đang Ẩn Số Lượng Từ' : '👁️ Đang Hiển Thị Số Lượng Từ'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
                  <strong>Ẩn số lượng từ:</strong> Ẩn các con số đếm từ vựng (ví dụ: &quot;4,650+ từ&quot;, &quot;Hơn 4,650+ từ vựng&quot;, &quot;Tổng 4,650 từ&quot;) trên toàn bộ giao diện Trang Chủ, Header, Tìm Kiếm và Bàn Học đối với học viên. Học viên chỉ thấy thông tin chất lượng kho từ vựng mà không thấy số lượng cụ thể.<br />
                  <strong>Hiển thị số lượng:</strong> Cho phép học viên nhìn thấy đầy đủ các con số thống kê từ vựng như bình thường.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={toggleWordCountVisibility}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                    localVisibility.showWordCount !== false ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                  title={localVisibility.showWordCount !== false ? 'Nhấn để ẩn số lượng từ' : 'Nhấn để hiển thị số lượng từ'}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      localVisibility.showWordCount !== false ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Section 6: Quản Lý Ẩn/Hiện Phân Loại Từ Vựng (Chuyên Đề, Hàng Ngày, Nhóm Tổng) */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
                  <Target size={18} className="text-purple-600 dark:text-purple-400" />
                  Quản Lý Ẩn / Hiện Phân Loại Từ Vựng (Chuyên Đề, Hàng Ngày, Nhóm Tổng)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Kiểm soát quyền truy cập và hiển thị 3 nhóm phân loại từ vựng chính của hệ thống đối với học viên.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                <button
                  type="button"
                  onClick={enableAllVocabCategories}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Mở Tất Cả
                </button>
                <button
                  type="button"
                  onClick={disableAllVocabCategories}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Ẩn Tất Cả
                </button>
                <button
                  type="button"
                  onClick={handleSaveVisibility}
                  disabled={savingVisibility || loadingUserVisibility}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-500/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Save size={14} className={savingVisibility ? 'animate-spin' : ''} />
                  <span>{savingVisibility ? 'Đang lưu...' : 'Lưu Cài Đặt'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              {/* Card 1: Chuyên đề */}
              <div className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                localVisibility.showChuyendeVocab === false
                  ? 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-75'
                  : 'bg-white dark:bg-slate-800/80 border-purple-200/60 dark:border-purple-800/40 shadow-sm'
              }`}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                        <Target size={18} />
                      </div>
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
                        Từ Vựng Chuyên Đề
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-black rounded-full ${
                      localVisibility.showChuyendeVocab === false
                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                        : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                    }`}>
                      {localVisibility.showChuyendeVocab !== false ? 'Đang mở' : 'Đã ẩn'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Bao gồm các chuyên đề luyện thi trọng điểm: 600 Từ vựng TOEIC, ETS 2026, TOEIC 30 Ngày, TOEIC 500 Mất Gốc, Tiếng Nhật Minna...
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/60">
                  <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                    {localVisibility.showChuyendeVocab === false ? 'Đang bị khóa đối với học viên' : 'Cho phép học viên học tập'}
                  </span>
                  <button
                    type="button"
                    onClick={toggleChuyendeVocab}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                      localVisibility.showChuyendeVocab !== false ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        localVisibility.showChuyendeVocab !== false ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Card 2: Hàng ngày */}
              <div className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                localVisibility.showDailyVocab === false
                  ? 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-75'
                  : 'bg-white dark:bg-slate-800/80 border-indigo-200/60 dark:border-indigo-800/40 shadow-sm'
              }`}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                        <Layers size={18} />
                      </div>
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
                        Từ Vựng Hàng Ngày
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-black rounded-full ${
                      localVisibility.showDailyVocab === false
                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                        : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                    }`}>
                      {localVisibility.showDailyVocab !== false ? 'Đang mở' : 'Đã ẩn'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Bao gồm các chủ đề giao tiếp đời sống: Động vật, Tính từ, Thời tiết & Kỳ nghỉ, Thiên nhiên, Đồ vật, Trang phục, Giao thông (Units &gt;= 13)...
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/60">
                  <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                    {localVisibility.showDailyVocab === false ? 'Đang bị khóa đối với học viên' : 'Cho phép học viên học tập'}
                  </span>
                  <button
                    type="button"
                    onClick={toggleDailyVocab}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                      localVisibility.showDailyVocab !== false ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        localVisibility.showDailyVocab !== false ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Card 3: Nhóm tổng */}
              <div className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                localVisibility.showMasterVocab === false
                  ? 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-75'
                  : 'bg-white dark:bg-slate-800/80 border-emerald-200/60 dark:border-emerald-800/40 shadow-sm'
              }`}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                        <FolderTree size={18} />
                      </div>
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
                        Từ Vựng Nhóm Tổng
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-black rounded-full ${
                      localVisibility.showMasterVocab === false
                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                        : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                    }`}>
                      {localVisibility.showMasterVocab !== false ? 'Đang mở' : 'Đã ẩn'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Bao gồm các nhóm từ vựng mở rộng theo Master Group tùy biến và danh mục phân loại sâu do Admin/Hệ thống cấu hình.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/60">
                  <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                    {localVisibility.showMasterVocab === false ? 'Đang bị khóa đối với học viên' : 'Cho phép học viên học tập'}
                  </span>
                  <button
                    type="button"
                    onClick={toggleMasterVocab}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                      localVisibility.showMasterVocab !== false ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        localVisibility.showMasterVocab !== false ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: System Settings */}
      {activeSubTab === 'settings' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <h3 className="text-base font-black text-slate-800 dark:text-white flex items-center gap-2">
            <Cpu size={18} className="text-violet-600" />
            Cấu Hình Hệ Thống & Trí Tuệ Nhân Tạo (AI)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quick AI Lock Gatekeeper Control */}
            <div className="p-5 bg-gradient-to-r from-violet-500/10 via-purple-500/5 to-slate-50 dark:from-violet-950/20 dark:via-slate-800/60 dark:to-slate-900 rounded-2xl border border-violet-200/80 dark:border-violet-800/40 space-y-3 md:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Bot size={20} className="text-violet-600 dark:text-violet-400" />
                    <span className="text-sm font-black text-slate-800 dark:text-white">
                      Khóa / Mở Trí Tuệ Nhân Tạo (AI Control Gatekeeper)
                    </span>
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                      localVisibility.lockAi
                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40'
                        : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40'
                    }`}>
                      {localVisibility.lockAi ? '🔒 Đang Khóa AI Học Viên' : '⚡ Đang Mở Hoạt Động'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
                    Kiểm soát quyền truy cập Gemini AI toàn hệ thống. Khi khóa, học viên sẽ không thể gọi API sinh đề thi thử TOEIC, trắc nghiệm ngữ pháp AI và chấm phát âm AI.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    const next = !localVisibility.lockAi;
                    setLocalVisibility(prev => ({ ...prev, lockAi: next }));
                    const ok = await updateVisibilitySettings({ ...localVisibility, lockAi: next });
                    if (ok) {
                      try { audioManager.playSuccess?.(); } catch {}
                      toast.success(next ? "Đã khóa toàn bộ tính năng AI cho học viên!" : "Đã mở lại tính năng AI toàn hệ thống!");
                    }
                  }}
                  className={`px-4 py-2.5 text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer text-white shrink-0 ${
                    localVisibility.lockAi
                      ? 'bg-rose-600 hover:bg-rose-700 active:scale-95'
                      : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95'
                  }`}
                >
                  {localVisibility.lockAi ? <Lock size={14} /> : <Sparkles size={14} />}
                  <span>{localVisibility.lockAi ? 'Mở Khóa AI Ngay' : 'Khóa Toàn Bộ AI'}</span>
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 space-y-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Mô hình Trợ lý AI (Google Gemini / Vertex AI)
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Được sử dụng trong các tính năng tạo câu chuyện ngữ cảnh, sinh bài đọc, kiểm tra phát âm và gợi ý từ liên quan.
              </p>
              <div className="flex items-center gap-2 text-xs font-mono bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                <Sparkles size={16} className="text-amber-500 shrink-0" />
                <span>Gemini 2.5 Flash (Tối ưu tốc độ phản hồi)</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 space-y-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Bộ Nhớ Tạm & Dữ Liệu Học Tập (Local Cache)
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Xóa bộ nhớ đệm trên trình duyệt này nếu bạn muốn kiểm thử chuỗi ngày học (streak) hoặc tải lại toàn bộ từ database.
              </p>
              <button
                onClick={() => {
                  if (window.confirm("Bạn có chắc muốn xóa bộ nhớ đệm và tải lại trang?")) {
                    localStorage.removeItem('lastActiveDate');
                    localStorage.removeItem('streakCount');
                    toast.info("Đã xóa bộ nhớ đệm. Đang tải lại...");
                    setTimeout(() => window.location.reload(), 600);
                  }
                }}
                className="px-4 py-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 rounded-xl text-xs font-bold transition-colors border border-rose-200 dark:border-rose-800/40"
              >
                Xóa Cache & Đặt Lại Tiến Độ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: System Logs & Live Debugging */}
      {activeSubTab === 'logs' && (
        <AdminLogViewer />
      )}
    </div>
  );
}
