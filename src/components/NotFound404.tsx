import React from 'react';
import { ShieldAlert, FileQuestion, ArrowLeft, Home, LogIn, Sparkles } from 'lucide-react';
import { audioManager } from '../utils/audioManager';

interface NotFound404Props {
  mode?: 'not_found' | 'forbidden';
  path?: string;
  onGoHome: () => void;
  onLoginAdmin?: () => void;
}

export default function NotFound404({
  mode = 'not_found',
  path = window.location.pathname,
  onGoHome,
  onLoginAdmin
}: NotFound404Props) {
  const isForbidden = mode === 'forbidden';

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="relative max-w-lg w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 md:p-10 shadow-2xl text-center overflow-hidden animate-fade-in">
        {/* Glow background decoration */}
        <div 
          className={`absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none ${
            isForbidden ? 'bg-rose-500' : 'bg-blue-500'
          }`} 
        />
        <div 
          className={`absolute -bottom-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none ${
            isForbidden ? 'bg-amber-500' : 'bg-purple-500'
          }`} 
        />

        {/* Icon */}
        <div className="relative inline-block mb-6">
          <div 
            className={`p-5 rounded-3xl shadow-xl flex items-center justify-center ${
              isForbidden 
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50' 
                : 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50'
            }`}
          >
            {isForbidden ? <ShieldAlert size={48} /> : <FileQuestion size={48} />}
          </div>
          <span 
            className={`absolute -top-2 -right-2 px-2.5 py-0.5 text-xs font-black rounded-full uppercase tracking-wider text-white shadow-md ${
              isForbidden ? 'bg-rose-600' : 'bg-blue-600'
            }`}
          >
            {isForbidden ? '403 Forbidden' : '404 Not Found'}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tight mb-2">
          {isForbidden ? 'Khu Vực Bị Giới Hạn Truy Cập' : 'Trang Này Không Tồn Tại'}
        </h2>

        {/* Subtitle / Path */}
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
          {isForbidden ? (
            <>
              Đường dẫn <code className="px-2 py-0.5 font-mono text-xs bg-slate-100 dark:bg-slate-800 text-rose-600 dark:text-rose-400 rounded-md font-bold">{path}</code> yêu cầu tài khoản có đặc quyền <strong>Quản Trị Viên (Admin)</strong>.
            </>
          ) : (
            <>
              Đường dẫn <code className="px-2 py-0.5 font-mono text-xs bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-md font-bold">{path}</code> không tồn tại trên hệ thống học tập EngMaster.
            </>
          )}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => {
              audioManager.playClick();
              onGoHome();
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs md:text-sm rounded-2xl shadow-lg shadow-blue-500/25 active:scale-95 transition-all"
          >
            <Home size={16} />
            <span>Về Trang Chủ Học Tập</span>
          </button>

          {isForbidden && onLoginAdmin && (
            <button
              onClick={() => {
                audioManager.playClick();
                onLoginAdmin();
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs md:text-sm rounded-2xl border border-slate-200 dark:border-slate-700 active:scale-95 transition-all"
            >
              <LogIn size={16} />
              <span>Đăng Nhập Admin</span>
            </button>
          )}
        </div>

        {/* Security watermark */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
          <Sparkles size={13} className="text-amber-500" />
          <span>Hệ thống bảo vệ truy cập tự động EngMaster 2026</span>
        </div>
      </div>
    </div>
  );
}
