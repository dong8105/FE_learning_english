/**
 * Audio Engine Interfaces (ISP - Interface Segregation Principle)
 */

export interface IAudioPlayer {
  playClick(): void;
  playCorrect(): void;
  playSuccess(): void;
  playWrong(): void;
  playVictory(): void;
  playStreak(): void;
}

export interface IAudioController {
  isMuted(): boolean;
  getIsMuted(): boolean;
  toggleMute(): boolean;
  toggleMuted(): boolean;
  setMuted(muted: boolean): void;
}

export interface IAudioManager extends IAudioPlayer, IAudioController {}
