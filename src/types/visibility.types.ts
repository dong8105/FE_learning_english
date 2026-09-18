/**
 * Visibility & Feature Permissions Interfaces (ISP - Interface Segregation Principle)
 */

export interface IVisibilitySettings {
  hiddenTopics: string[];        // Topics hidden globally from regular learners
  sidebarHiddenTopics?: string[]; // Topics hidden specifically from the sidebar
  showGrammar: boolean;          // Section toggle for "Luyện câu & Ngữ pháp"
  showGames: boolean;            // Section toggle for "Khu vực Trò chơi"
  showVocabPractice?: boolean;   // Section toggle for "Luyện Tập Từ Vựng"
  hiddenPracticeItems?: string[]; // Sub-items under practice hidden: e.g. ['flashcards', 'quiz', ...]
  adminBypassHidden?: boolean;   // Admin privilege to view all items with [Đã ẩn] tag
  lockAi?: boolean;              // AI Lock toggle: locks/disables AI across the app for learners
  showEnglishVoiceSettings?: boolean;  // Voice Settings: toggle English voice config tab for learners
  showJapaneseVoiceSettings?: boolean; // Voice Settings: toggle Japanese Minna voice config tab for learners
  showWordCount?: boolean;             // Word count visibility: toggle vocabulary count on UI for learners
  showChuyendeVocab?: boolean;         // Vocab Category: toggle "Chuyên đề" topics for learners
  showDailyVocab?: boolean;            // Vocab Category: toggle "Hàng ngày" topics (Units >= 13) for learners
  showMasterVocab?: boolean;           // Vocab Category: toggle "Nhóm tổng" (Master group) for learners
}

export type SectionKey = 'grammar' | 'games' | 'vocabPractice' | 'practice';
export type VocabCategoryKey = 'chuyende' | 'daily' | 'master';

/**
 * Reader interface: For components that only consume visibility rules
 */
export interface IVisibilityReader {
  isTopicVisible: (topicNameOrId: string) => boolean;
  isTopicVisibleInSidebar: (topicNameOrId: string) => boolean;
  isSectionVisible: (sectionKey: SectionKey) => boolean;
  isPracticeItemVisible: (itemKey: string) => boolean;
  isVoiceSettingsVisible: (lang: 'en' | 'ja') => boolean;
  isWordCountVisible: () => boolean;
  isVocabCategoryVisible: (category: VocabCategoryKey) => boolean;
  isTopicHidden: (topicNameOrId: string) => boolean;
  isTopicHiddenInSidebar: (topicNameOrId: string) => boolean;
  isSectionHidden: (sectionKey: SectionKey) => boolean;
  isPracticeItemHidden: (itemKey: string) => boolean;
  isVoiceSettingsHidden: (lang: 'en' | 'ja') => boolean;
  isWordCountHidden: () => boolean;
  isVocabCategoryHidden: (category: VocabCategoryKey) => boolean;
  shouldAdminBypass: boolean;
  isAiLocked: boolean;
}

/**
 * Manager interface: For components that update or refresh settings
 */
export interface IVisibilityManager {
  updateSettings: (newSettings: Partial<IVisibilitySettings>) => Promise<boolean>;
  refetchSettings: () => Promise<void>;
}

/**
 * Complete context value interface
 */
export interface IVisibilityContext extends IVisibilityReader, IVisibilityManager {
  settings: IVisibilitySettings;
  loading: boolean;
}

/**
 * Service contract for I/O operations (DIP - Dependency Inversion Principle)
 */
export interface IVisibilityService {
  fetchSettings(token?: string | null): Promise<IVisibilitySettings>;
  saveSettings(settings: IVisibilitySettings, token?: string | null): Promise<boolean>;
  fetchUserSettings?(userId: string, token?: string | null): Promise<{ hasCustom: boolean; settings: IVisibilitySettings }>;
  saveUserSettings?(userId: string, settings: IVisibilitySettings, token?: string | null): Promise<boolean>;
  resetUserSettings?(userId: string, token?: string | null): Promise<boolean>;
}
