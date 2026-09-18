/**
 * Admin Live Logger & Debug Utility
 * 
 * Captures console.log, console.warn, console.error, and network fetch requests
 * for real-time inspection in the Admin Log Viewer.
 */

export interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'log' | 'info' | 'warn' | 'error' | 'network';
  message: string;
  details?: any;
  status?: number;
  duration?: number;
}

type LogListener = (logs: LogEntry[]) => void;

class AdminLogger {
  private logs: LogEntry[] = [];
  private maxLogs: number = 300;
  private listeners: Set<LogListener> = new Set();
  private isInitialized: boolean = false;
  private isUnlocked: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.isUnlocked = localStorage.getItem('admin_allow_logs') === 'true' || 
                        sessionStorage.getItem('admin_allow_logs') === 'true';
    }
  }

  public init() {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    // Capture standard console methods while preserving original functionality
    const originalLog = console.log;
    const originalInfo = console.info;
    const originalWarn = console.warn;
    const originalError = console.error;

    console.log = (...args: any[]) => {
      originalLog.apply(console, args);
      this.addEntry('log', args);
    };

    console.info = (...args: any[]) => {
      originalInfo.apply(console, args);
      this.addEntry('info', args);
    };

    console.warn = (...args: any[]) => {
      originalWarn.apply(console, args);
      this.addEntry('warn', args);
    };

    console.error = (...args: any[]) => {
      originalError.apply(console, args);
      this.addEntry('error', args);
    };

    // Capture network API fetch calls
    const originalFetch = window.fetch;
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const startTime = performance.now();
      const urlString = typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input as Request).url;
      const method = (init?.method || 'GET').toUpperCase();

      // Only capture API or local requests to avoid cluttering with external CDNs
      const isApi = urlString.includes('/api/') || urlString.startsWith('http://localhost') || urlString.startsWith('/');

      try {
        const response = await originalFetch(input, init);
        if (isApi) {
          const duration = Math.round(performance.now() - startTime);
          const status = response.status;
          const entryType = status >= 400 ? 'error' : status >= 300 ? 'warn' : 'network';
          this.add({
            id: `net_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            timestamp: new Date(),
            type: entryType,
            message: `${method} ${urlString} -> HTTP ${status} (${duration}ms)`,
            status,
            duration,
          });
        }
        return response;
      } catch (err: any) {
        if (isApi) {
          const duration = Math.round(performance.now() - startTime);
          this.add({
            id: `net_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            timestamp: new Date(),
            type: 'error',
            message: `${method} ${urlString} -> NETWORK ERROR (${duration}ms): ${err?.message || 'Failed to fetch'}`,
            details: err,
            duration,
          });
        }
        throw err;
      }
    };

    // Log startup
    this.add({
      id: `init_${Date.now()}`,
      timestamp: new Date(),
      type: 'info',
      message: 'Hệ thống nhật ký & gỡ lỗi Admin đã sẵn sàng hoạt động.',
    });
  }

  private addEntry(type: 'log' | 'info' | 'warn' | 'error', args: any[]) {
    try {
      const message = args.map(arg => {
        if (typeof arg === 'string') return arg;
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      }).join(' ');

      // Filter out noisy Vite HMR or CSS injection logs if desired
      if (message.includes('[vite]') && !message.includes('error')) return;

      this.add({
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        timestamp: new Date(),
        type,
        message,
        details: args.length > 1 ? args : undefined
      });
    } catch {}
  }

  public add(entry: LogEntry) {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
    this.notify();
  }

  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  public clear() {
    this.logs = [];
    this.notify();
  }

  public subscribe(listener: LogListener): () => void {
    this.listeners.add(listener);
    listener(this.getLogs());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const current = this.getLogs();
    this.listeners.forEach(l => {
      try { l(current); } catch {}
    });
  }

  // Temporary DevTools / F12 Unlock
  public isDevToolsUnlocked(): boolean {
    if (typeof window !== 'undefined') {
      return this.isUnlocked || 
             localStorage.getItem('admin_allow_logs') === 'true' || 
             sessionStorage.getItem('admin_allow_logs') === 'true';
    }
    return false;
  }

  public setDevToolsUnlock(enable: boolean) {
    this.isUnlocked = enable;
    if (typeof window !== 'undefined') {
      if (enable) {
        localStorage.setItem('admin_allow_logs', 'true');
        sessionStorage.setItem('admin_allow_logs', 'true');
      } else {
        localStorage.removeItem('admin_allow_logs');
        sessionStorage.removeItem('admin_allow_logs');
      }
      window.dispatchEvent(new CustomEvent('admin_logs_toggle', { detail: { enabled: enable } }));
    }
    this.add({
      id: `security_${Date.now()}`,
      timestamp: new Date(),
      type: enable ? 'warn' : 'info',
      message: enable 
        ? '🔓 Đã mở khóa F12 / DevTools / Chuột phải tạm thời cho Quản trị viên.' 
        : '🔒 Đã bật lại chế độ bảo vệ chống can thiệp (Chặn F12 & Chuột phải).',
    });
  }
}

export const adminLogger = new AdminLogger();

// Initialize immediately in browser
if (typeof window !== 'undefined') {
  adminLogger.init();
  // Expose global shortcut function for browser console
  (window as any).openAdminLogs = () => {
    adminLogger.setDevToolsUnlock(true);
    console.log('%c🔓 Đã mở log & DevTools tạm thời cho Admin!', 'color: #10b981; font-weight: bold;');
  };
  (window as any).closeAdminLogs = () => {
    adminLogger.setDevToolsUnlock(false);
    console.log('%c🔒 Đã đóng log & kích hoạt lại bảo mật!', 'color: #ef4444; font-weight: bold;');
  };
}
