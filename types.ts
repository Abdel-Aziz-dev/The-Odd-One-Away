import { LucideIcon } from 'lucide-react';

export enum GameMode {
  CLASSIC = 'CLASSIC',
  TIMED = 'TIMED',
  ZEN = 'ZEN',
  BLITZ = 'BLITZ'
}

export enum GamePhase {
  MENU = 'MENU',
  OBSERVE = 'OBSERVE',
  LOCKED = 'LOCKED',
  GUESS = 'GUESS',
  RESULT = 'RESULT',
  GAME_OVER = 'GAME_OVER',
  THEMES = 'THEMES'
}

export interface Theme {
  id: string;
  name: string;
  background: string;
  surface: string;
  accent: string;
  text: string;
  itemColors: string[];
}

export interface GameItem {
  id: string;
  iconName: string; // Key to look up the icon component
  color: string;
  rotation: number;
  isTarget: boolean; // True if this is the one that changed
  originalData?: { // What it looked like before change (for reveal)
    iconName: string;
    color: string;
    rotation: number;
  };
}

export interface LevelConfig {
  gridSize: number; // e.g., 4 means 4x4
  observeTime: number; // seconds
  itemsCount: number;
  difficultyMultiplier: number;
}

export interface PlayerStats {
  xp: number;
  level: number;
  highScores: Record<GameMode, number>;
  unlockedThemes: string[];
  selectedThemeId: string;
  streak: number;
}