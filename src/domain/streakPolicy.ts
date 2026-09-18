/**
 * Domain Policy: Streak and Daily Learning Activity
 * Pure domain logic independent of React UI (Single Responsibility Principle)
 */

export interface IStreakData {
  streakCount: number;
  lastActiveDate: string | null;
  lastActiveTimestamp: number | null;
}

export interface IStreakStatus {
  count: number;
  isOnlineToday: boolean;
  isStreakActive: boolean;
  lastActiveDate: string | null;
}

export class StreakPolicy {
  getTodayString(): string {
    return new Date().toDateString();
  }

  getYesterdayString(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toDateString();
  }

  isToday(dateStr: string | null): boolean {
    if (!dateStr) return false;
    return dateStr === this.getTodayString();
  }

  isYesterday(dateStr: string | null): boolean {
    if (!dateStr) return false;
    return dateStr === this.getYesterdayString();
  }

  isStreakActive(lastActiveDate: string | null): boolean {
    if (!lastActiveDate) return false;
    return this.isToday(lastActiveDate) || this.isYesterday(lastActiveDate);
  }

  computeNextStreak(currentData: Partial<IStreakData>): IStreakData {
    const today = this.getTodayString();
    const lastDate = currentData.lastActiveDate || null;
    const currentCount = currentData.streakCount || 0;

    // Already recorded activity today
    if (lastDate === today) {
      return {
        streakCount: Math.max(1, currentCount),
        lastActiveDate: today,
        lastActiveTimestamp: Date.now(),
      };
    }

    // Consecutive day (yesterday) -> increment streak
    if (this.isYesterday(lastDate)) {
      return {
        streakCount: currentCount + 1,
        lastActiveDate: today,
        lastActiveTimestamp: Date.now(),
      };
    }

    // Break in streak -> restart at 1
    return {
      streakCount: 1,
      lastActiveDate: today,
      lastActiveTimestamp: Date.now(),
    };
  }

  getStatus(data: Partial<IStreakData> | null): IStreakStatus {
    const count = data?.streakCount || 0;
    const lastActiveDate = data?.lastActiveDate || null;
    const isOnlineToday = this.isToday(lastActiveDate);
    const isStreakActive = this.isStreakActive(lastActiveDate);

    return {
      count: isStreakActive ? count : 0,
      isOnlineToday,
      isStreakActive,
      lastActiveDate,
    };
  }
}

export const defaultStreakPolicy = new StreakPolicy();
