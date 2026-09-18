import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Terminal, 
  Search, 
  Trash2, 
  Copy, 
  Check, 
  Download, 
  ShieldAlert, 
  ShieldCheck, 
  Globe, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  FileText, 
  ChevronDown, 
  ChevronRight,
  ArrowDownCircle,
  Play
} from 'lucide-react';
import { toast } from 'react-toastify';
import { adminLogger, LogEntry } from '../utils/logger';

interface AdminLogViewerProps {
  isModal?: boolean;
  onClose?: () => void;
}

export default function AdminLogViewer({ isModal = false, onClose }: AdminLogViewerProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'error' | 'warn' | 'network' | 'info' | 'log'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(() => adminLogger.isDevToolsUnlocked());
  const [autoScroll, setAutoScroll] = useState(true);
  const [expandedLogIds, setExpandedLogIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const logsEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Subscribe to live logs
  useEffect(() => {
    const unsubscribe = adminLogger.subscribe((newLogs) => {
      setLogs([...newLogs]);
    });

    const handleToggleEvent = (e: any) => {
      setIsUnlocked(!!e.detail?.enabled);
    };
    window.addEventListener('admin_logs_toggle', handleToggleEvent);

    return () => {
      unsubscribe();
      window.removeEventListener('admin_logs_toggle', handleToggleEvent);
    };
  }, []);

  // Auto-scroll when logs change
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const handleToggleUnlock = () => {
    const next = !isUnlocked;
    setIsUnlocked(next);
    adminLogger.setDevToolsUnlock(next);
    if (next) {
      toast.success('🔓 Đã mở khóa F12 & DevTools tạm thời!');
    } else {
      toast.info('🔒 Đã đóng log & khóa lại DevTools.');
    }
  };

  const handleClearLogs = () => {
    adminLogger.clear();
    setExpandedLogIds(new Set());
    toast.info('Đã làm sạch nhật ký!');
  };

  const handleToggleExpand = (id: string) => {
    setExpandedLogIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCopyLog = (entry: LogEntry) => {
    const text = `[${new Date(entry.timestamp).toLocaleTimeString()}] [${entry.type.toUpperCase()}] ${entry.message}${
      entry.details ? '\n' + JSON.stringify(entry.details, null, 2) : ''
    }`;
    navigator.clipboard.writeText(text);
    setCopiedId(entry.id);
    setTimeout(() => setCopiedId(null), 1800);
    toast.success('Đã sao chép dòng log!');
  };

  const handleCopyAll = () => {
    if (filteredLogs.length === 0) return;
    const text = filteredLogs.map(entry => {
      return `[${new Date(entry.timestamp).toLocaleTimeString()}] [${entry.type.toUpperCase()}] ${entry.message}${
        entry.details ? '\n' + JSON.stringify(entry.details, null, 2) : ''
      }`;
    }).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
    toast.success(`Đã sao chép ${filteredLogs.length} dòng log vào Clipboard!`);
  };

  const handleDownloadLogs = () => {
    if (logs.length === 0) {
      toast.warn('Chưa có nhật ký nào để tải về!');
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `angel_english_admin_logs_${new Date().toISOString().slice(0,19).replace(/[:T]/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success('Đã tải xuống file nhật ký JSON!');
  };

  const handleTriggerTestLog = () => {
    console.log('Test Log message:', { timestamp: new Date().toISOString(), status: 'OK' });
    console.warn('Test Warning message: Bộ nhớ đệm sắp cần làm mới!');
    console.error('Test Error message: Ví dụ một ngoại lệ kết nối API thử nghiệm.');
    toast.info('Đã ghi 3 log thử nghiệm vào console!');
  };

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Type filter
      if (filterType !== 'all') {
        if (filterType === 'network' && log.type !== 'network') return false;
        if (filterType === 'error' && log.type !== 'error') return false;
        if (filterType === 'warn' && log.type !== 'warn') return false;
        if (filterType === 'info' && log.type !== 'info') return false;
        if (filterType === 'log' && log.type !== 'log') return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const msgMatch = log.message.toLowerCase().includes(query);
        const detailsMatch = log.details && JSON.stringify(log.details).toLowerCase().includes(query);
        return msgMatch || detailsMatch;
      }
      return true;
    });
  }, [logs, filterType, searchQuery]);

  // Counts
  const counts = useMemo(() => {
    const error = logs.filter(l => l.type === 'error').length;
    const warn = logs.filter(l => l.type === 'warn').length;
    const network = logs.filter(l => l.type === 'network').length;
    const info = logs.filter(l => l.type === 'info').length;
    const log = logs.filter(l => l.type === 'log').length;
    return { all: logs.length, error, warn, network, info, log };
  }, [logs]);

  return (
    <div className={`flex flex-col bg-slate-900 text-slate-100 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden ${isModal ? 'h-[85vh]' : 'min-h-[620px]'}`}>
      {/* Top Header Bar */}
      <div className="p-4 md:p-5 bg-slate-950/80 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl">
            <Terminal size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base md:text-lg font-bold text-white tracking-tight">
                Nhật Ký & Hoạt Động Hệ Thống
              </h2>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Trực tiếp
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Ghi lại console, cảnh báo lỗi, và các lượt gọi API thực tế.
            </p>
          </div>
        </div>

        {/* Temporary Unlock DevTools / F12 Banner Switch */}
        <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-700/60 px-4 py-2 rounded-2xl shadow-inner">
          <div className="flex items-center gap-2">
            {isUnlocked ? (
              <ShieldAlert size={18} className="text-amber-400 animate-pulse" />
            ) : (
              <ShieldCheck size={18} className="text-emerald-400" />
            )}
            <div className="text-left">
              <div className="text-xs font-bold text-slate-200">
                Mở khóa F12 / DevTools
              </div>
              <div className="text-[10px] text-slate-400">
                {isUnlocked ? 'Đang mở (Bấm F12/Inspect thoải mái)' : 'Đang khóa (Chế độ phòng học)'}
              </div>
            </div>
          </div>

          <button
            onClick={handleToggleUnlock}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
              isUnlocked ? 'bg-amber-500' : 'bg-slate-700'
            }`}
            title="Bật/Tắt mở khóa F12 tạm thời"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isUnlocked ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Control Bar: Filters & Search & Actions */}
      <div className="p-3 md:px-5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Type Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              filterType === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-750'
            }`}
          >
            <span>Tất cả</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 font-mono">
              {counts.all}
            </span>
          </button>

          <button
            onClick={() => setFilterType('error')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              filterType === 'error'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-slate-800 text-rose-400 hover:bg-rose-950/40'
            }`}
          >
            <AlertCircle size={14} />
            <span>Lỗi</span>
            {counts.error > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-900/60 font-mono font-bold text-rose-200">
                {counts.error}
              </span>
            )}
          </button>

          <button
            onClick={() => setFilterType('network')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              filterType === 'network'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-800 text-sky-400 hover:bg-sky-950/40'
            }`}
          >
            <Globe size={14} />
            <span>API / Mạng</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 font-mono">
              {counts.network}
            </span>
          </button>

          <button
            onClick={() => setFilterType('warn')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              filterType === 'warn'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-800 text-amber-400 hover:bg-amber-950/40'
            }`}
          >
            <AlertTriangle size={14} />
            <span>Cảnh báo</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 font-mono">
              {counts.warn}
            </span>
          </button>

          <button
            onClick={() => setFilterType('info')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              filterType === 'info'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800 text-emerald-400 hover:bg-emerald-950/40'
            }`}
          >
            <Info size={14} />
            <span>Thông tin</span>
          </button>
        </div>

        {/* Search Input & Action Icons */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-56">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm URL, mã lỗi, thông báo..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                ×
              </button>
            )}
          </div>

          {/* Test log generator */}
          <button
            onClick={handleTriggerTestLog}
            title="Thử ghi log kiểm tra"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            <Play size={15} />
          </button>

          {/* Auto-scroll toggle */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            title={autoScroll ? 'Tự cuộn: ĐANG BẬT' : 'Tự cuộn: ĐANG TẮT'}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              autoScroll ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowDownCircle size={15} />
          </button>

          {/* Copy All */}
          <button
            onClick={handleCopyAll}
            title="Sao chép toàn bộ nhật ký"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            {copiedAll ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
          </button>

          {/* Download JSON */}
          <button
            onClick={handleDownloadLogs}
            title="Tải về file JSON"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            <Download size={15} />
          </button>

          {/* Clear Logs */}
          <button
            onClick={handleClearLogs}
            title="Xóa sạch nhật ký"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-slate-300 hover:text-rose-400 transition-colors cursor-pointer"
          >
            <Trash2 size={15} />
          </button>

          {isModal && onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold ml-1 cursor-pointer"
            >
              Đóng
            </button>
          )}
        </div>
      </div>

      {/* Logs Console Stream Body */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 p-3 md:p-4 overflow-y-auto font-mono text-xs space-y-1.5 bg-slate-950/60 custom-scrollbar selection:bg-indigo-500/30"
      >
        {filteredLogs.length === 0 ? (
          <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-slate-500 space-y-3">
            <Terminal size={40} className="stroke-1 text-slate-600 animate-pulse" />
            <div className="text-center">
              <p className="font-semibold text-slate-400">Không có bản ghi nào phù hợp</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Các thao tác điều hướng, gọi API hoặc lỗi sẽ xuất hiện tự động tại đây.
              </p>
            </div>
          </div>
        ) : (
          filteredLogs.map((entry) => {
            const isExpanded = expandedLogIds.has(entry.id);
            const timeStr = new Date(entry.timestamp).toLocaleTimeString('vi-VN', { 
              hour12: false, 
              hour: '2-digit', 
              minute: '2-digit', 
              second: '2-digit' 
            });

            // Color scheme by type
            let badgeBg = 'bg-slate-800 text-slate-300 border-slate-700';
            let rowBorder = 'border-slate-800/60 hover:border-slate-700';
            let textClass = 'text-slate-300';

            if (entry.type === 'error') {
              badgeBg = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
              rowBorder = 'border-rose-900/40 bg-rose-950/10 hover:border-rose-700';
              textClass = 'text-rose-200 font-medium';
            } else if (entry.type === 'warn') {
              badgeBg = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
              rowBorder = 'border-amber-900/40 bg-amber-950/10 hover:border-amber-700';
              textClass = 'text-amber-200';
            } else if (entry.type === 'network') {
              const isNetError = entry.status && entry.status >= 400;
              if (isNetError) {
                badgeBg = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
                rowBorder = 'border-rose-900/40 bg-rose-950/10 hover:border-rose-700';
                textClass = 'text-rose-300 font-medium';
              } else {
                badgeBg = 'bg-sky-500/20 text-sky-300 border-sky-500/30';
                rowBorder = 'border-sky-900/40 bg-sky-950/10 hover:border-sky-700';
                textClass = 'text-sky-200';
              }
            } else if (entry.type === 'info') {
              badgeBg = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
              rowBorder = 'border-emerald-900/40 bg-emerald-950/10 hover:border-emerald-700';
              textClass = 'text-emerald-200';
            }

            return (
              <div
                key={entry.id}
                className={`group rounded-xl border ${rowBorder} p-2.5 transition-all text-[11px] leading-relaxed relative hover:bg-slate-900/80`}
              >
                <div className="flex items-start gap-2.5">
                  {/* Timestamp */}
                  <span className="text-slate-500 select-none whitespace-nowrap font-mono pt-0.5">
                    {timeStr}
                  </span>

                  {/* Badge */}
                  <span className={`px-2 py-0.5 rounded-md font-bold uppercase tracking-wider text-[10px] border select-none whitespace-nowrap ${badgeBg}`}>
                    {entry.type === 'network' ? (entry.status ? `API ${entry.status}` : 'API') : entry.type}
                  </span>

                  {/* Duration if available */}
                  {entry.duration !== undefined && (
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                      {entry.duration}ms
                    </span>
                  )}

                  {/* Message */}
                  <div className={`flex-1 break-all select-text ${textClass}`}>
                    {entry.message}
                  </div>

                  {/* Actions (Copy / Expand) */}
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleCopyLog(entry)}
                      title="Sao chép dòng này"
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                    >
                      {copiedId === entry.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    </button>

                    {entry.details && (
                      <button
                        onClick={() => handleToggleExpand(entry.id)}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 flex items-center gap-0.5 cursor-pointer"
                        title={isExpanded ? 'Thu gọn chi tiết' : 'Mở rộng chi tiết'}
                      >
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Details / Stack trace / Payload */}
                {isExpanded && entry.details && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 pl-2">
                    <div className="text-[10px] text-slate-400 mb-1 flex items-center gap-1 font-semibold">
                      <FileText size={12} />
                      Chi tiết dữ liệu (Details / Payload):
                    </div>
                    <pre className="p-2.5 bg-black/60 rounded-lg text-emerald-300 font-mono text-[10px] overflow-x-auto max-h-60 border border-slate-800 custom-scrollbar">
                      {typeof entry.details === 'string'
                        ? entry.details
                        : JSON.stringify(entry.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={logsEndRef} />
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <span>Phím tắt:</span>
          <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono text-[10px]">
            Ctrl + Shift + L
          </kbd>
          <span>để bật/tắt cửa sổ nhật ký & mở F12 mọi lúc.</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Tổng số: <strong className="text-white">{logs.length}</strong> dòng</span>
          <span className="text-slate-600">|</span>
          <span className="text-rose-400 font-semibold">{counts.error} lỗi</span>
        </div>
      </div>
    </div>
  );
}
