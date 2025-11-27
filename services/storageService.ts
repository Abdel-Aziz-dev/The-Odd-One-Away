import { PlayerStats, GameMode } from '../types';

const STORAGE_KEY = 'odd_one_away_save_v1';

const DEFAULT_STATS: PlayerStats = {
  xp: 0,
  level: 1,
  highScores: {
    [GameMode.CLASSIC]: 0,
    [GameMode.TIMED]: 0,
    [GameMode.ZEN]: 0,
    [GameMode.BLITZ]: 0,
  },
  unlockedThemes: ['neon_cyber'],
  selectedThemeId: 'neon_cyber',
  streak: 0
};

export const loadStats = (): PlayerStats => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return { ...DEFAULT_STATS, ...JSON.parse(data) };
    }
  } catch (e) {
    console.error("Failed to load save data", e);
  }
  return DEFAULT_STATS;
};

export const saveStats = (stats: PlayerStats) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error("Failed to save data", e);
  }
};
