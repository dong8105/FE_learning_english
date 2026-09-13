import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface VisibilitySettings {
  hiddenTopics: string[]; // List of topic names or IDs that are hidden from regular users
  showGrammar: boolean;   // Toggle for "Luyện câu & Ngữ pháp" section
  showGames: boolean;     // Toggle for "Khu vực Trò chơi" section
}

interface VisibilityContextType {
  settings: VisibilitySettings;
  loading: boolean;
  updateSettings: (newSettings: Partial<VisibilitySettings>) => Promise<boolean>;
  isTopicVisible: (topicNameOrId: string) => boolean;
  isSectionVisible: (sectionKey: 'grammar' | 'games') => boolean;
}

const DEFAULT_SETTINGS: VisibilitySettings = {
  hiddenTopics: [],
  showGrammar: true,
  showGames: true,
};

const STORAGE_KEY = 'engmaster_visibility_settings';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const VisibilityContext = createContext<VisibilityContextType | undefined>(undefined);

export const VisibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin } = useAuth();
  const [settings, setSettings] = useState<VisibilitySettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse cached visibility settings', e);
    }
    return DEFAULT_SETTINGS;
  });
  const [loading, setLoading] = useState(false);

  // Fetch settings from Backend API
  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/settings/visibility`);
      if (res.ok) {
        const data = await res.json();
        const merged: VisibilitySettings = {
          hiddenTopics: Array.isArray(data.hiddenTopics) ? data.hiddenTopics : [],
          showGrammar: data.showGrammar !== false,
          showGames: data.showGames !== false,
        };
        setSettings(merged);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      }
    } catch (err) {
      // Offline fallback: keep localStorage settings
      console.log('API settings unavailable, using local cache');
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSettings = async (newPartial: Partial<VisibilitySettings>): Promise<boolean> => {
    const updated: VisibilitySettings = {
      ...settings,
      ...newPartial,
    };
    setSettings(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    try {
      const res = await fetch(`${API_BASE_URL}/api/settings/visibility`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (!res.ok) {
        throw new Error('Failed to save to server');
      }
      return true;
    } catch (err) {
      console.warn('Saved visibility settings locally (offline/error)');
      return true;
    }
  };

  // Helper: check if a topic is visible
  // Admin ALWAYS sees everything. Regular users only see topics that are NOT hidden.
  const isTopicVisible = (topicNameOrId: string): boolean => {
    if (isAdmin) return true;
    if (!topicNameOrId) return true;
    return !settings.hiddenTopics.includes(topicNameOrId);
  };

  // Helper: check if a section is visible
  const isSectionVisible = (sectionKey: 'grammar' | 'games'): boolean => {
    if (isAdmin) return true;
    if (sectionKey === 'grammar') return settings.showGrammar;
    if (sectionKey === 'games') return settings.showGames;
    return true;
  };

  return (
    <VisibilityContext.Provider value={{
      settings,
      loading,
      updateSettings,
      isTopicVisible,
      isSectionVisible
    }}>
      {children}
    </VisibilityContext.Provider>
  );
};

export const useVisibility = () => {
  const context = useContext(VisibilityContext);
  if (!context) {
    throw new Error('useVisibility must be used within a VisibilityProvider');
  }
  return context;
};
