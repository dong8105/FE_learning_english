/**
 * Anti-Tamper & Anti-Cheat Protection Utility
 * 
 * Protects exams, quizzes, and learning workflows by:
 * 1. Blocking Developer Tools shortcut keys (F12, Ctrl+Shift+I/J/C, Ctrl+U, Ctrl+S)
 * 2. Blocking right-click Context Menu
 * 3. Displaying strong security warning banners against console script injection
 * 4. Bypassing all restrictions seamlessly for Admin users
 */
import { toast } from 'react-toastify';
import { adminLogger } from './logger';

let lastToastTime = 0;
const TOAST_THROTTLE_MS = 2500;

function showThrottledWarning(message: string) {
  const now = Date.now();
  if (now - lastToastTime > TOAST_THROTTLE_MS) {
    lastToastTime = now;
    toast.warning(message, {
      position: 'top-center',
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false,
    });
  }
}

/**
 * Print prominent anti-script injection banner in browser console
 */
export function displayConsoleWarning() {
  try {
    setTimeout(() => {
      console.log(
        '%c⛔ STOP!',
        'color: #ef4444; font-size: 42px; font-weight: 900; text-shadow: 2px 2px 0px #000; padding: 10px 0;'
      );
      console.log(
        '%c⚠️ SECURITY NOTICE:\n' +
        'This is a browser feature intended for developers.\n' +
        'If someone told you to copy and paste anything here to get answers, hack points, or cheat, IT IS A SCAM.\n' +
        'Pasting code here can compromise your account and may result in your account being permanently banned.\n\n' +
        'Please close this window and continue learning safely!',
        'font-size: 14px; color: #b91c1c; font-weight: 600; line-height: 1.6;'
      );
    }, 1000);
  } catch {}
}

export interface AntiTamperOptions {
  blockRightClick?: boolean;
  blockShortcuts?: boolean;
}

/**
 * Initialize Anti-Tamper event listeners
 * Returns cleanup function
 */
export function initAntiTamper(
  isAdmin: boolean = false,
  options: AntiTamperOptions = { blockRightClick: true, blockShortcuts: true }
): () => void {
  displayConsoleWarning();

  // If user is Admin or logs are unlocked, do not intercept F12 or right-click
  if (isAdmin || adminLogger.isDevToolsUnlocked()) {
    return () => {};
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    const isCtrlOrCmd = e.ctrlKey || e.metaKey;
    const isShift = e.shiftKey;
    const key = e.key.toLowerCase();

    // Secret shortcut Ctrl + Shift + L to toggle admin logs/F12
    if (isCtrlOrCmd && isShift && key === 'l') {
      const nextState = !adminLogger.isDevToolsUnlocked();
      adminLogger.setDevToolsUnlock(nextState);
      if (nextState) {
        toast.success('🔓 Đã mở log & DevTools tạm thời cho Admin!', { position: 'top-center' });
      } else {
        toast.info('🔒 Đã đóng log & kích hoạt lại bảo vệ phòng học.', { position: 'top-center' });
      }
      return;
    }

    if (adminLogger.isDevToolsUnlocked()) return;
    if (!options.blockShortcuts) return;

    // F12
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault();
      e.stopPropagation();
      showThrottledWarning('Thao tác này tạm thời bị khóa trong phòng học để đảm bảo tập trung!');
      return false;
    }

    // Ctrl + Shift + I (Inspect)
    // Ctrl + Shift + J (Console)
    // Ctrl + Shift + C (Element picker)
    if (isCtrlOrCmd && isShift && (key === 'i' || key === 'j' || key === 'c')) {
      e.preventDefault();
      e.stopPropagation();
      showThrottledWarning('Thao tác này tạm thời bị khóa trong phòng học để đảm bảo tập trung!');
      return false;
    }

    // Ctrl + U (View Source)
    if (isCtrlOrCmd && key === 'u') {
      e.preventDefault();
      e.stopPropagation();
      showThrottledWarning('Thao tác này tạm thời bị khóa trong phòng học!');
      return false;
    }

    // Ctrl + S (Save Page)
    if (isCtrlOrCmd && key === 's') {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  };

  const handleContextMenu = (e: MouseEvent) => {
    if (adminLogger.isDevToolsUnlocked()) return;
    if (!options.blockRightClick) return;

    // Allow right click on text input or textarea for copy/paste convenience
    const target = e.target as HTMLElement;
    const isInput = target && (
      target.tagName === 'INPUT' || 
      target.tagName === 'TEXTAREA' || 
      target.isContentEditable
    );

    if (!isInput) {
      e.preventDefault();
      e.stopPropagation();
      showThrottledWarning('Thao tác chuột phải tạm thời bị khóa trên nội dung câu hỏi!');
      return false;
    }
  };

  window.addEventListener('keydown', handleKeyDown, { capture: true });
  window.addEventListener('contextmenu', handleContextMenu, { capture: true });

  return () => {
    window.removeEventListener('keydown', handleKeyDown, { capture: true });
    window.removeEventListener('contextmenu', handleContextMenu, { capture: true });
  };
}
