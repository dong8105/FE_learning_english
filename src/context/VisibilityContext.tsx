import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { 
  IVisibilitySettings, 
  IVisibilityContext, 
  IVisibilityService, 
  SectionKey,
  VocabCategoryKey 
} from '../types/visibility.types';
import { 
  VisibilityPolicy, 
  defaultVisibilityPolicy, 
  DEFAULT_TOPIC_ALIASES,
  isSpecialTopicGroup,
  getVocabCategory
} from '../domain/visibilityPolicy';
import { 
  VisibilityService, 
  defaultVisibilityService, 
  DEFAULT_VISIBILITY_SETTINGS 
} from '../services/visibilityService';

// Backward compatibility re-exports
export type VisibilitySettings = IVisibilitySettings;
export const TOPIC_ALIASES_MAP = DEFAULT_TOPIC_ALIASES;
export { isSpecialTopicGroup, getVocabCategory };

const VisibilityContext = createContext<IVisibilityContext | undefined>(undefined);

interface VisibilityProviderProps {
  children: React.ReactNode;
  service?: IVisibilityService; // DIP: can inject custom/mock service for testing
  policy?: VisibilityPolicy;    // DIP: can inject custom policy
}

export const VisibilityProvider: React.FC<VisibilityProviderProps> = ({ 
  children,
  service = defaultVisibilityService,
  policy = defaultVisibilityPolicy,
}) => {
  const { user, isAdmin } = useAuth();
  const [settings, setSettings] = useState<IVisibilitySettings>(() => {
    if (service instanceof VisibilityService) {
      return service.getCachedSettings();
    }
    return DEFAULT_VISIBILITY_SETTINGS;
  });
  const [loading, setLoading] = useState(false);

  // Fetch settings from Backend Service
  const refetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('engmaster_token');
      const latest = await service.fetchSettings(token);
      setSettings(latest);
    } finally {
      setLoading(false);
    }
  }, [service]);

  useEffect(() => {
    refetchSettings();
    const handleAuthChange = () => {
      refetchSettings();
    };
    window.addEventListener('engmaster_auth_changed', handleAuthChange);
    return () => {
      window.removeEventListener('engmaster_auth_changed', handleAuthChange);
    };
  }, [user?.id, isAdmin, refetchSettings]);

  // Update settings via Service
  const updateSettings = useCallback(async (newPartial: Partial<IVisibilitySettings>): Promise<boolean> => {
    const updated: IVisibilitySettings = {
      ...settings,
      ...newPartial,
    };
    setSettings(updated);

    const token = localStorage.getItem('engmaster_token');
    return await service.saveSettings(updated, token);
  }, [settings, service]);

  // Admin bypass calculation (delegated to Policy)
  const shouldAdminBypass = useMemo(() => {
    return policy.shouldAdminBypass(isAdmin, settings);
  }, [isAdmin, settings, policy]);

  // Domain evaluation functions (delegated to Policy)
  const isTopicVisible = useCallback((topicNameOrId: string): boolean => {
    return policy.isTopicVisible(topicNameOrId, settings, shouldAdminBypass);
  }, [policy, settings, shouldAdminBypass]);

  const isTopicVisibleInSidebar = useCallback((topicNameOrId: string): boolean => {
    return policy.isTopicVisibleInSidebar(topicNameOrId, settings, shouldAdminBypass);
  }, [policy, settings, shouldAdminBypass]);

  const isSectionVisible = useCallback((sectionKey: SectionKey): boolean => {
    return policy.isSectionVisible(sectionKey, settings, shouldAdminBypass);
  }, [policy, settings, shouldAdminBypass]);

  const isPracticeItemVisible = useCallback((itemKey: string): boolean => {
    return policy.isPracticeItemVisible(itemKey, settings, shouldAdminBypass);
  }, [policy, settings, shouldAdminBypass]);

  const isVoiceSettingsVisible = useCallback((lang: 'en' | 'ja'): boolean => {
    return policy.isVoiceSettingsVisible(lang, settings, shouldAdminBypass);
  }, [policy, settings, shouldAdminBypass]);

  const isTopicHidden = useCallback((topicNameOrId: string): boolean => {
    return policy.isTopicHidden(topicNameOrId, settings);
  }, [policy, settings]);

  const isTopicHiddenInSidebar = useCallback((topicNameOrId: string): boolean => {
    return policy.isTopicHiddenInSidebar(topicNameOrId, settings);
  }, [policy, settings]);

  const isSectionHidden = useCallback((sectionKey: SectionKey): boolean => {
    return policy.isSectionHidden(sectionKey, settings);
  }, [policy, settings]);

  const isPracticeItemHidden = useCallback((itemKey: string): boolean => {
    return policy.isPracticeItemHidden(itemKey, settings);
  }, [policy, settings]);

  const isVoiceSettingsHidden = useCallback((lang: 'en' | 'ja'): boolean => {
    return policy.isVoiceSettingsHidden(lang, settings);
  }, [policy, settings]);

  const isWordCountVisible = useCallback((): boolean => {
    return policy.isWordCountVisible(settings, shouldAdminBypass);
  }, [policy, settings, shouldAdminBypass]);

  const isWordCountHidden = useCallback((): boolean => {
    return policy.isWordCountHidden(settings);
  }, [policy, settings]);

  const isVocabCategoryVisible = useCallback((category: VocabCategoryKey): boolean => {
    return policy.isVocabCategoryVisible(category, settings, shouldAdminBypass);
  }, [policy, settings, shouldAdminBypass]);

  const isVocabCategoryHidden = useCallback((category: VocabCategoryKey): boolean => {
    return policy.isVocabCategoryHidden(category, settings);
  }, [policy, settings]);

  const isAiLocked = useMemo(() => {
    return policy.isAiLocked(settings, shouldAdminBypass);
  }, [policy, settings, shouldAdminBypass]);

  const contextValue: IVisibilityContext = useMemo(() => ({
    settings,
    loading,
    updateSettings,
    refetchSettings,
    isTopicVisible,
    isTopicVisibleInSidebar,
    isSectionVisible,
    isPracticeItemVisible,
    isVoiceSettingsVisible,
    isWordCountVisible,
    isVocabCategoryVisible,
    isTopicHidden,
    isTopicHiddenInSidebar,
    isSectionHidden,
    isPracticeItemHidden,
    isVoiceSettingsHidden,
    isWordCountHidden,
    isVocabCategoryHidden,
    shouldAdminBypass,
    isAiLocked
  }), [
    settings,
    loading,
    updateSettings,
    refetchSettings,
    isTopicVisible,
    isTopicVisibleInSidebar,
    isSectionVisible,
    isPracticeItemVisible,
    isVoiceSettingsVisible,
    isWordCountVisible,
    isVocabCategoryVisible,
    isTopicHidden,
    isTopicHiddenInSidebar,
    isSectionHidden,
    isPracticeItemHidden,
    isVoiceSettingsHidden,
    isWordCountHidden,
    isVocabCategoryHidden,
    shouldAdminBypass,
    isAiLocked
  ]);

  return (
    <VisibilityContext.Provider value={contextValue}>
      {children}
    </VisibilityContext.Provider>
  );
};

export const useVisibility = (): IVisibilityContext => {
  const context = useContext(VisibilityContext);
  if (!context) {
    throw new Error('useVisibility must be used within a VisibilityProvider');
  }
  return context;
};
