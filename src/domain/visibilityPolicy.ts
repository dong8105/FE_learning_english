import { IVisibilitySettings, SectionKey, VocabCategoryKey } from '../types/visibility.types';

/**
 * Identify if a master group name belongs to a special exam/topic category (Chuyên đề)
 */
export function isSpecialTopicGroup(name?: string): boolean {
  if (!name) return false;
  const specialKeywords = ['toeic', 'ets', 'minna', 'ielts', 'chuyên đề', 'chuyen de', 'bài học'];
  const lower = name.toLowerCase();
  return specialKeywords.some(kw => lower.includes(kw));
}

/**
 * Determine high-level category of a word
 */
export function getVocabCategory(word?: { master_group?: string; unit?: number } | null): 'chuyende' | 'daily' | 'master' | 'unit' | 'other' {
  if (!word) return 'other';
  if (word.master_group) {
    if (isSpecialTopicGroup(word.master_group)) return 'chuyende';
    return 'master';
  }
  if (typeof word.unit === 'number') {
    if (word.unit >= 13) return 'daily';
    if (word.unit >= 1) return 'unit';
  }
  return 'other';
}

/**
 * Aliases mapping between internal IDs, slugs, and display titles (OCP - Open/Closed Principle)
 * Can be extended with registerTopicAlias() without modifying internal evaluation algorithms.
 */
export const DEFAULT_TOPIC_ALIASES: Record<string, string[]> = {
  'japaneseminna': ['japaneseminna', 'từ vựng tiếng nhật minna no nihongo', 'tiếng nhật minna no nihongo', 'minna', 'minnanonihongo'],
  'từ vựng tiếng nhật minna no nihongo': ['japaneseminna', 'từ vựng tiếng nhật minna no nihongo', 'tiếng nhật minna no nihongo', 'minna', 'minnanonihongo'],
  'tiếng nhật minna no nihongo': ['japaneseminna', 'từ vựng tiếng nhật minna no nihongo', 'tiếng nhật minna no nihongo', 'minna', 'minnanonihongo'],
  'minna': ['japaneseminna', 'từ vựng tiếng nhật minna no nihongo', 'tiếng nhật minna no nihongo', 'minna', 'minnanonihongo'],

  'toeic30': ['toeic30', 'lộ trình toeic 30 ngày', 'toeic 30 ngày', 'toeic30day', 'lo trinh toeic 30 ngay'],
  'lộ trình toeic 30 ngày': ['toeic30', 'lộ trình toeic 30 ngày', 'toeic 30 ngày', 'toeic30day', 'lo trinh toeic 30 ngay'],
  'toeic 30 ngày': ['toeic30', 'lộ trình toeic 30 ngày', 'toeic 30 ngày', 'toeic30day', 'lo trinh toeic 30 ngay'],

  'toeic500': ['toeic500', '500 từ vựng toeic mất gốc', 'toeic mất gốc', '500 tu vung toeic mat goc'],
  '500 từ vựng toeic mất gốc': ['toeic500', '500 từ vựng toeic mất gốc', 'toeic mất gốc', '500 tu vung toeic mat goc'],

  'ets2026': ['ets2026', 'từ vựng ets 2026', 'ets 2026', 'tu vung ets 2026'],
  'từ vựng ets 2026': ['ets2026', 'từ vựng ets 2026', 'ets 2026', 'tu vung ets 2026'],

  '600 từ vựng toeic': ['600 từ vựng toeic', '600 từ vựng toeic căn bản', '600 tu vung toeic', 'toeic600'],
  '600 từ vựng toeic căn bản': ['600 từ vựng toeic', '600 từ vựng toeic căn bản', '600 tu vung toeic', 'toeic600'],
  'toeic600': ['600 từ vựng toeic', '600 từ vựng toeic căn bản', '600 tu vung toeic', 'toeic600'],
};

export class VisibilityPolicy {
  private aliases: Record<string, string[]>;

  constructor(customAliases: Record<string, string[]> = DEFAULT_TOPIC_ALIASES) {
    this.aliases = { ...customAliases };
  }

  /**
   * Register a new topic alias dynamically (OCP)
   */
  public registerAlias(key: string, aliases: string[]): void {
    const normalizedKey = key.trim().toLowerCase();
    const normalizedAliases = aliases.map(a => a.trim().toLowerCase());
    this.aliases[normalizedKey] = Array.from(new Set([...(this.aliases[normalizedKey] || []), ...normalizedAliases]));
  }

  /**
   * Check if a topic matches any item in a list of aliases or keys
   */
  public isHiddenInList(topicNameOrId: string, list: string[] = []): boolean {
    if (!topicNameOrId || !Array.isArray(list) || list.length === 0) return false;
    const normalized = topicNameOrId.trim().toLowerCase();
    const aliases = this.aliases[normalized] || [normalized];
    return list.some(hidden => {
      const normHidden = hidden.trim().toLowerCase();
      return aliases.includes(normHidden) || normHidden === normalized;
    });
  }

  /**
   * Determine if Admin bypass privilege is currently active
   */
  public shouldAdminBypass(isAdmin: boolean, settings: IVisibilitySettings): boolean {
    return Boolean(isAdmin && settings.adminBypassHidden !== false);
  }

  /**
   * Evaluate global visibility of a topic
   */
  public isTopicVisible(topicNameOrId: string, settings: IVisibilitySettings, shouldBypass: boolean): boolean {
    if (shouldBypass) return true;
    if (!topicNameOrId) return true;
    return !this.isHiddenInList(topicNameOrId, settings.hiddenTopics);
  }

  /**
   * Evaluate sidebar visibility of a topic
   */
  public isTopicVisibleInSidebar(topicNameOrId: string, settings: IVisibilitySettings, shouldBypass: boolean): boolean {
    if (shouldBypass) return true;
    if (!topicNameOrId) return true;
    if (this.isHiddenInList(topicNameOrId, settings.hiddenTopics)) return false;
    if (this.isHiddenInList(topicNameOrId, settings.sidebarHiddenTopics)) return false;
    return true;
  }

  /**
   * Evaluate section visibility
   */
  public isSectionVisible(sectionKey: SectionKey, settings: IVisibilitySettings, shouldBypass: boolean): boolean {
    if (shouldBypass) return true;
    if (sectionKey === 'grammar') return settings.showGrammar !== false;
    if (sectionKey === 'games') return settings.showGames !== false;
    if (sectionKey === 'vocabPractice' || sectionKey === 'practice') return settings.showVocabPractice !== false;
    return true;
  }

  /**
   * Evaluate visibility of a practice sub-item (e.g. flashcards, quiz, typing, etc.)
   */
  public isPracticeItemVisible(itemKey: string, settings: IVisibilitySettings, shouldBypass: boolean): boolean {
    if (shouldBypass) return true;
    if (settings.showVocabPractice === false) return false;
    if (!itemKey) return true;
    if (Array.isArray(settings.hiddenPracticeItems)) {
      const normalizedKey = itemKey.trim().toLowerCase();
      if (settings.hiddenPracticeItems.some(h => h.trim().toLowerCase() === normalizedKey)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Raw hidden checks regardless of bypass (used for [Đã ẩn] indicators)
   */
  public isTopicHidden(topicNameOrId: string, settings: IVisibilitySettings): boolean {
    return this.isHiddenInList(topicNameOrId, settings.hiddenTopics);
  }

  public isTopicHiddenInSidebar(topicNameOrId: string, settings: IVisibilitySettings): boolean {
    return this.isHiddenInList(topicNameOrId, settings.hiddenTopics) || 
           this.isHiddenInList(topicNameOrId, settings.sidebarHiddenTopics);
  }

  public isSectionHidden(sectionKey: SectionKey, settings: IVisibilitySettings): boolean {
    if (sectionKey === 'grammar') return settings.showGrammar === false;
    if (sectionKey === 'games') return settings.showGames === false;
    if (sectionKey === 'vocabPractice' || sectionKey === 'practice') return settings.showVocabPractice === false;
    return false;
  }

  /**
   * Raw hidden check for a practice sub-item (used for [Đã ẩn] indicators)
   */
  public isPracticeItemHidden(itemKey: string, settings: IVisibilitySettings): boolean {
    if (settings.showVocabPractice === false) return true;
    if (!itemKey) return false;
    if (Array.isArray(settings.hiddenPracticeItems)) {
      const normalizedKey = itemKey.trim().toLowerCase();
      return settings.hiddenPracticeItems.some(h => h.trim().toLowerCase() === normalizedKey);
    }
    return false;
  }

  /**
   * Evaluate AI locking status
   */
  public isAiLocked(settings: IVisibilitySettings, shouldBypass: boolean): boolean {
    if (shouldBypass) return false;
    return Boolean(settings.lockAi === true);
  }

  /**
   * Evaluate voice settings tab visibility (English / Japanese)
   */
  public isVoiceSettingsVisible(lang: 'en' | 'ja', settings: IVisibilitySettings, shouldBypass: boolean): boolean {
    if (shouldBypass) return true;
    if (lang === 'en') return settings.showEnglishVoiceSettings !== false;
    if (lang === 'ja') return settings.showJapaneseVoiceSettings !== false;
    return true;
  }

  public isVoiceSettingsHidden(lang: 'en' | 'ja', settings: IVisibilitySettings): boolean {
    if (lang === 'en') return settings.showEnglishVoiceSettings === false;
    if (lang === 'ja') return settings.showJapaneseVoiceSettings === false;
    return false;
  }

  /**
   * Evaluate word count visibility
   */
  public isWordCountVisible(settings: IVisibilitySettings, shouldBypass: boolean): boolean {
    if (shouldBypass) return true;
    return settings.showWordCount !== false;
  }

  public isWordCountHidden(settings: IVisibilitySettings): boolean {
    return settings.showWordCount === false;
  }

  /**
   * Evaluate vocabulary category visibility (Chuyên đề / Hàng ngày / Nhóm tổng)
   */
  public isVocabCategoryVisible(category: VocabCategoryKey, settings: IVisibilitySettings, shouldBypass: boolean): boolean {
    if (shouldBypass) return true;
    if (category === 'chuyende') return settings.showChuyendeVocab !== false;
    if (category === 'daily') return settings.showDailyVocab !== false;
    if (category === 'master') return settings.showMasterVocab !== false;
    return true;
  }

  public isVocabCategoryHidden(category: VocabCategoryKey, settings: IVisibilitySettings): boolean {
    if (category === 'chuyende') return settings.showChuyendeVocab === false;
    if (category === 'daily') return settings.showDailyVocab === false;
    if (category === 'master') return settings.showMasterVocab === false;
    return false;
  }

  public isAiLockedRaw(settings: IVisibilitySettings): boolean {
    return Boolean(settings.lockAi === true);
  }
}

export const defaultVisibilityPolicy = new VisibilityPolicy();
