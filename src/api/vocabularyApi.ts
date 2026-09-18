/**
 * Vocabulary API Service (ISP & DIP)
 */

export interface WordItem {
  id?: number | string;
  en: string;
  vi: string;
  ipa?: string;
  category?: string;
  unit?: number;
  master_group?: string;
  sub_group?: string;
  [key: string]: any;
}

export interface IVocabularyApi {
  getAllWords(): Promise<WordItem[]>;
  addDataFile(newData: WordItem[]): Promise<{ success: boolean; count: number }>;
  addWord(word: WordItem): Promise<{ success: boolean; word?: WordItem; error?: string }>;
  deleteWord(id: number | string): Promise<{ success: boolean; error?: string }>;
}

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/words`;

export class VocabularyApiService implements IVocabularyApi {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    try {
      const token = localStorage.getItem('engmaster_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    } catch {}
    return headers;
  }

  public async getAllWords(): Promise<WordItem[]> {
    try {
      const response = await fetch(this.baseUrl, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch words');
      return await response.json();
    } catch (error) {
      console.error('VocabularyApi.getAllWords Error:', error);
      return [];
    }
  }

  public async addDataFile(newData: WordItem[]): Promise<{ success: boolean; count: number }> {
    let count = 0;
    const headers = this.getAuthHeaders();

    for (const word of newData) {
      try {
        const res = await fetch(this.baseUrl, {
          method: 'POST',
          headers,
          credentials: 'include',
          body: JSON.stringify(word),
        });
        if (res.ok) count++;
      } catch (error) {
        console.error('VocabularyApi.addDataFile Failed to add word:', error);
      }
    }
    return { success: true, count };
  }

  public async addWord(word: WordItem): Promise<{ success: boolean; word?: WordItem; error?: string }> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(word),
      });
      return await response.json();
    } catch (error: any) {
      console.error('VocabularyApi.addWord Error:', error);
      return { success: false, error: error?.message || 'Failed to add word' };
    }
  }

  public async deleteWord(id: number | string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });
      return await response.json();
    } catch (error: any) {
      console.error('VocabularyApi.deleteWord Error:', error);
      return { success: false, error: error?.message || 'Failed to delete word' };
    }
  }
}

export const vocabularyApi: IVocabularyApi = new VocabularyApiService();
