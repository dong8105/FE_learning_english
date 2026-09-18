/**
 * Domain Policy: Vocabulary Categorization and Filtering
 * Pure domain logic (Single Responsibility & Open/Closed Principle)
 */
import { VocabCategoryType, IVisibilitySettings } from '../types/visibility.types';

export interface IVocabItem {
  id?: string;
  en?: string;
  vi?: string;
  category?: string;
  unit?: number;
  master_group?: string | null;
  sub_group?: string | null;
  [key: string]: any;
}

export class VocabularyPolicy {
  private specialTopics = [
    'Tiếng Nhật Minna No Nihongo',
    '30 Ngày TOEIC Cơ Bản',
    'TOEIC Căn Bản 500+',
    'Từ Vựng Trọng Điểm TOEIC 600+',
    'Từ Vựng ETS 2026',
  ];

  isSpecialTopicGroup(groupName: string): boolean {
    if (!groupName) return false;
    const lower = groupName.toLowerCase();
    return (
      lower.includes('minna') ||
      lower.includes('nhật') ||
      lower.includes('toeic') ||
      lower.includes('ets') ||
      this.specialTopics.some((t) => t.toLowerCase() === lower)
    );
  }

  getVocabCategory(word: IVocabItem): VocabCategoryType {
    if (!word) return 'daily';

    const group = (word.master_group || word.category || '').trim();
    const sub = (word.sub_group || '').trim();

    if (this.isSpecialTopicGroup(group) || this.isSpecialTopicGroup(sub)) {
      return 'chuyende';
    }

    if (
      group.toLowerCase().includes('hàng ngày') ||
      group.toLowerCase().includes('daily') ||
      sub.toLowerCase().includes('hàng ngày') ||
      sub.toLowerCase().includes('daily')
    ) {
      return 'daily';
    }

    if (
      group.toLowerCase().includes('tổng') ||
      group.toLowerCase().includes('master') ||
      sub.toLowerCase().includes('tổng') ||
      sub.toLowerCase().includes('master')
    ) {
      return 'master';
    }

    // Default classification:
    // If it belongs to a numbered unit (unit 1-12) -> daily vocabulary
    if (word.unit !== undefined && word.unit !== null && word.unit > 0) {
      return 'daily';
    }

    return 'master';
  }

  isWordVisible(
    word: IVocabItem,
    settings: IVisibilitySettings | null,
    isAdmin: boolean
  ): boolean {
    if (isAdmin && settings?.adminBypassHidden !== false) {
      return true;
    }
    if (!settings) return true;

    const cat = this.getVocabCategory(word);
    if (cat === 'chuyende' && settings.showChuyendeVocab === false) return false;
    if (cat === 'daily' && settings.showDailyVocab === false) return false;
    if (cat === 'master' && settings.showMasterVocab === false) return false;

    return true;
  }

  filterWords(
    words: IVocabItem[],
    settings: IVisibilitySettings | null,
    isAdmin: boolean
  ): IVocabItem[] {
    if (!Array.isArray(words)) return [];
    if (isAdmin && settings?.adminBypassHidden !== false) {
      return words;
    }
    return words.filter((w) => this.isWordVisible(w, settings, isAdmin));
  }
}

export const defaultVocabularyPolicy = new VocabularyPolicy();
