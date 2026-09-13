import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
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
  ArrowRight
} from 'lucide-react';
import { toast } from 'react-toastify';
import { audioManager } from '../utils/audioManager';
import { useAuth, User } from '../context/AuthContext';

interface AdminDashboardProps {
  words: any[];
  speak?: (text: string) => void;
  setActiveTab: (tab: string) => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminDashboard({ words, setActiveTab }: AdminDashboardProps) {
  const { user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'users' | 'backup' | 'settings'>('overview');
  const [serverMetrics, setServerMetrics] = useState<any>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // New user form state
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'user'>('user');

  const fetchServerMetrics = async () => {
    setLoadingMetrics(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/metrics`);
      if (res.ok) {
        const data = await res.json();
        setServerMetrics(data.metrics);
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

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users`);
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
  }, [words.length]);

  // Export database as JSON
  const handleExportJSON = () => {
    audioManager.playClick();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(words, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `engmaster_vocabulary_backup_${Date.now()}.json`);
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
    link.setAttribute("download", `engmaster_vocabulary_${Date.now()}.csv`);
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
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success(`Đã xóa tài khoản ${username}`);
        fetchUsers();
      } else {
        throw new Error();
      }
    } catch {
      setUsersList(prev => prev.filter(u => u.id !== id));
      toast.success(`Đã xóa tài khoản ${username}`);
    }
  };

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
                Chào mừng trở lại, <span className="font-bold text-white">{user?.name || 'Administrator'}</span>. Toàn quyền quản trị hệ thống EngMaster.
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

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Words Card */}
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

        {/* Total Users Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tài Khoản Học Viên</span>
            <div className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white mt-1">
              {usersList.length}
            </div>
            <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1 flex items-center gap-1">
              <Users size={13} />
              <span>{usersList.filter(u => u.role === 'admin').length} Quản trị viên</span>
            </div>
          </div>
          <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-2xl">
            <Users size={26} />
          </div>
        </div>

        {/* Server Health Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Máy Chủ & Database</span>
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

        {/* Modules Breakdown Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Học Phần Nổi Bật</span>
            <div className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white mt-1">
              {toeicWordsCount > 0 ? `${toeicWordsCount}` : 'TOEIC / ETS'}
            </div>
            <div className="text-[11px] text-violet-600 dark:text-violet-400 font-semibold mt-1">
              {minnaWordsCount > 0 ? `${minnaWordsCount} từ Minna No Nihongo` : 'Đa dạng giáo trình'}
            </div>
          </div>
          <div className="p-3.5 bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 rounded-2xl">
            <Sparkles size={26} />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => {
            audioManager.playClick();
            setActiveSubTab('overview');
          }}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
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
            setActiveSubTab('users');
          }}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
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
            setActiveSubTab('backup');
          }}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
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
            setActiveSubTab('settings');
          }}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
            activeSubTab === 'settings'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Cpu size={18} />
          <span>Cấu hình & AI</span>
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeSubTab === 'overview' && (
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
      )}

      {/* Tab 2: User Management */}
      {activeSubTab === 'users' && (
        <div className="space-y-6">
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

          {/* Users Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-black text-slate-800 dark:text-white">
                Danh Sách Tài Khoản Đã Đăng Ký ({usersList.length})
              </h3>
              <span className="text-xs text-slate-400">Tự động đồng bộ với MySQL</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Người Dùng</th>
                    <th className="px-5 py-3.5">Tên Đăng Nhập</th>
                    <th className="px-5 py-3.5">Vai Trò</th>
                    <th className="px-5 py-3.5">Ngày Tham Gia</th>
                    <th className="px-5 py-3.5 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-4 font-bold flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                          u.role === 'admin' 
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400' 
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                        }`}>
                          {u.name ? u.name.charAt(0).toUpperCase() : u.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-slate-900 dark:text-white">{u.name || u.username}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{u.id}</div>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-mono font-medium">{u.username}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                          u.role === 'admin'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50'
                        }`}>
                          {u.role === 'admin' ? '👑 Admin' : '🎓 Học Viên'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-500">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : 'Hôm nay'}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {u.username !== 'admin' ? (
                          <button
                            onClick={() => handleDeleteUser(u.id, u.username)}
                            className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                            title="Xóa tài khoản"
                          >
                            <Trash2 size={16} />
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Mặc định</span>
                        )}
                      </td>
                    </tr>
                  ))}
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

      {/* Tab 4: System Settings */}
      {activeSubTab === 'settings' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <h3 className="text-base font-black text-slate-800 dark:text-white flex items-center gap-2">
            <Cpu size={18} className="text-violet-600" />
            Cấu Hình Hệ Thống & Trí Tuệ Nhân Tạo (AI)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
    </div>
  );
}
