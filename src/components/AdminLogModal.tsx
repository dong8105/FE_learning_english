import React, { useEffect } from 'react';
import { X, Maximize2, Terminal } from 'lucide-react';
import AdminLogViewer from './AdminLogViewer';

interface AdminLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminLogModal({ isOpen, onClose }: AdminLogModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-3 md:p-6 bg-black/75 backdrop-blur-md animate-fadeIn">
      {/* Click outside backdrop to close */}
      <div 
        className="absolute inset-0 -z-10" 
        onClick={onClose} 
      />

      <div className="relative w-full max-w-6xl shadow-2xl rounded-3xl overflow-hidden border border-slate-700 bg-slate-900">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-full transition-colors cursor-pointer"
          title="Đóng cửa sổ (Esc)"
        >
          <X size={18} />
        </button>

        <AdminLogViewer isModal={true} onClose={onClose} />
      </div>
    </div>
  );
}
