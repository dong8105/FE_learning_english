import { IVisibilitySettings } from '../types/visibility.types';
import { VisibilityPolicy, defaultVisibilityPolicy } from './visibilityPolicy';

export interface IRouteResolution {
  status: 'ok' | 'not_found' | 'forbidden';
  tab: string;
  subTab?: string;
  requiredAuth?: boolean;
}

export interface IRoutePolicyParams {
  pathname: string;
  user: { id: string; role: 'admin' | 'user' } | null;
  isAdmin: boolean;
  validTabs: Set<string>;
  visibilitySettings?: IVisibilitySettings | null;
}

export class RoutePolicy {
  private policy: VisibilityPolicy;

  constructor(policy: VisibilityPolicy = defaultVisibilityPolicy) {
    this.policy = policy;
  }

  public resolveRoute(params: IRoutePolicyParams): IRouteResolution {
    const { pathname, user, isAdmin, validTabs, visibilitySettings } = params;

    let clean = (pathname || '/').toLowerCase().trim().replace(/^\/+|\/+$/g, '').split('?')[0].split('#')[0];

    // Root path handling
    if (!clean) {
      if (!user) {
        return { status: 'ok', tab: 'home' };
      }
      return { status: 'ok', tab: 'dashboard' };
    }

    // Explicit /home route
    if (clean === 'home') {
      return { status: 'ok', tab: 'home' };
    }

    // Login route and aliases
    if (clean === 'login' || clean === 'register' || clean === 'signin' || clean === 'signup' || clean === 'auth') {
      return { status: 'ok', tab: 'login' };
    }

    // Build case-insensitive map from validTabs to canonical registered tab IDs
    const canonicalTabMap = new Map<string, string>();
    for (const t of validTabs) {
      canonicalTabMap.set(t.toLowerCase(), t);
    }

    // Friendly URL Aliases mapping to canonical registered tabs
    const URL_ALIASES: Record<string, string> = {
      'admin': 'admin_dashboard',
      'admindashboard': 'admin_dashboard',
      'phanquyen': 'admin_dashboard',
      'phan-quyen': 'admin_dashboard',
      'permissions': 'admin_dashboard',
      'visibility': 'admin_dashboard',
      'admin-visibility': 'admin_dashboard',
      'admin_visibility': 'admin_dashboard',
      'admin/visibility': 'admin_dashboard',
      'admin/phanquyen': 'admin_dashboard',
      'admin/phan-quyen': 'admin_dashboard',
      'admin/permissions': 'admin_dashboard',
      'admin/users': 'admin_dashboard',
      'admin/online': 'admin_dashboard',
      'admin/backup': 'admin_dashboard',
      'admin/settings': 'admin_dashboard',
      'admin/logs': 'admin_dashboard',
      'admin/log': 'admin_dashboard',
      'logs': 'admin_dashboard',
      'japaneseminna': 'japaneseMinna',
      'minna': 'japaneseMinna',
      'japanese': 'japaneseMinna',
      'japanese-minna': 'japaneseMinna',
      'tieng-nhat': 'japaneseMinna',
      'tiengnhat': 'japaneseMinna',
      'ets-2026': 'ets2026',
      'ets2026ipa': 'ipa',
      'toeic-30': 'toeic30',
      'toeic30day': 'toeic30',
      'toeic-500': 'toeic500',
      'toeic-600': 'toeic600',
      'game-memory': 'game_memory',
      'game-survival': 'game_survival',
      'game-hangman': 'game_hangman',
      'game-falling': 'game_falling',
      'game-scramble': 'game_scramble',
      'sequential-3': 'sequential3',
      'optimal-learning': 'optimal',
    };

    // Determine canonical tab ID
    const aliasedKey = URL_ALIASES[clean] ? URL_ALIASES[clean] : clean;
    const canonicalTab = canonicalTabMap.get(aliasedKey.toLowerCase()) || (validTabs.has(aliasedKey) ? aliasedKey : null);

    // If it's not a recognized route, return 404
    if (!canonicalTab) {
      return { status: 'not_found', tab: clean };
    }

    const normalizedSlug = canonicalTab.toLowerCase();

    // 1. Admin Route Protection (Priority check: Requires Admin privileges)
    if (canonicalTab === 'admin_dashboard' || canonicalTab === 'manage' || canonicalTab === 'admin_visibility') {
      let subTab: string | undefined = undefined;
      const cleanLower = clean.toLowerCase();
      if (
        cleanLower === 'phanquyen' || 
        cleanLower === 'phan-quyen' || 
        cleanLower === 'permissions' || 
        cleanLower === 'visibility' || 
        cleanLower === 'admin-visibility' || 
        cleanLower === 'admin_visibility' || 
        cleanLower === 'admin/visibility' || 
        cleanLower === 'admin/phanquyen' ||
        cleanLower === 'admin/phan-quyen' ||
        cleanLower === 'admin/permissions'
      ) {
        subTab = 'visibility';
      } else if (cleanLower === 'admin/users') {
        subTab = 'users';
      } else if (cleanLower === 'admin/online') {
        subTab = 'online';
      } else if (cleanLower === 'admin/backup') {
        subTab = 'backup';
      } else if (cleanLower === 'admin/settings') {
        subTab = 'settings';
      } else if (cleanLower === 'admin/logs' || cleanLower === 'admin/log' || cleanLower === 'logs') {
        subTab = 'logs';
      }

      if (!isAdmin) {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          window.sessionStorage.setItem('redirectAfterLogin', pathname || '/admin');
        }
        return { status: 'forbidden', tab: canonicalTab, subTab };
      }

      return { status: 'ok', tab: 'admin_dashboard', subTab };
    }

    // 2. Mandatory Authentication Check for learning modes
    if (!user) {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem('redirectAfterLogin', pathname || canonicalTab);
      }
      return { status: 'ok', tab: 'login', requiredAuth: true };
    }

    // 3. Admin Bypass Check
    const shouldBypass = Boolean(isAdmin && (!visibilitySettings || visibilitySettings.adminBypassHidden !== false));

    // 4. Hidden Features Guard (when bypass is inactive)
    if (!shouldBypass && visibilitySettings) {
      // 4a. Special Topics Guard
      const specialTopicSlugs = ['japaneseminna', 'toeic30', 'toeic500', 'ets2026', 'toeic600'];
      if (specialTopicSlugs.includes(normalizedSlug)) {
        if (visibilitySettings.showChuyendeVocab === false || this.policy.isHiddenInList(normalizedSlug, visibilitySettings.hiddenTopics)) {
          return { status: 'not_found', tab: canonicalTab };
        }
      }

      // 4b. Grammar Section Guard
      const grammarTabs = ['grammar', 'reading', 'speaking', 'mixed'];
      if (visibilitySettings.showGrammar === false && grammarTabs.includes(normalizedSlug)) {
        return { status: 'not_found', tab: canonicalTab };
      }

      // 4c. Games Section Guard
      const gameTabs = ['game_memory', 'game_survival', 'game_hangman', 'game_falling', 'game_scramble'];
      if (visibilitySettings.showGames === false && gameTabs.includes(normalizedSlug)) {
        return { status: 'not_found', tab: canonicalTab };
      }

      // 4d. Vocabulary Practice Section & Sub-Items Guard
      const practiceTabs = ['sequential3', 'optimal', 'flashcards', 'quiz', 'match', 'typing', 'dictation', 'ipa', 'mixedgame', 'related'];
      if (practiceTabs.includes(normalizedSlug)) {
        if (visibilitySettings.showVocabPractice === false) {
          return { status: 'not_found', tab: canonicalTab };
        }
        if (Array.isArray(visibilitySettings.hiddenPracticeItems)) {
          if (visibilitySettings.hiddenPracticeItems.some(h => h.trim().toLowerCase() === normalizedSlug)) {
            return { status: 'not_found', tab: canonicalTab };
          }
        }
      }
    }

    // 5. Valid Canonical Tab Match
    return { status: 'ok', tab: canonicalTab };
  }
}

export const defaultRoutePolicy = new RoutePolicy();
