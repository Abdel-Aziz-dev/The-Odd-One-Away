import { v4 as uuidv4 } from 'uuid';
import { GameItem, LevelConfig } from '../types';
import { ICON_KEYS, THEMES } from '../constants';

// Helper to get random int
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const calculateLevelConfig = (level: number, modeStr: string): LevelConfig => {
  // Simple difficulty curve
  const baseItems = 3;
  const growth = Math.floor(level / 2);
  let count = Math.min(baseItems + growth, 30); // Cap at 30 items for mobile sanity
  
  let time = Math.max(2, 5 - (level * 0.1)); // Reduce time slightly
  if (modeStr === 'ZEN') time = 999;
  if (modeStr === 'BLITZ') time = 2;

  // Grid size calculation (approximate square root)
  const gridSize = Math.ceil(Math.sqrt(count));

  return {
    gridSize,
    observeTime: time,
    itemsCount: count,
    difficultyMultiplier: 1 + (level * 0.1)
  };
};

export const generateScene = (config: LevelConfig, themeId: string): GameItem[] => {
  const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
  const items: GameItem[] = [];

  for (let i = 0; i < config.itemsCount; i++) {
    items.push({
      id: uuidv4(),
      iconName: randomItem(ICON_KEYS),
      color: randomItem(theme.itemColors),
      rotation: 0, // Keep simple for now, maybe randomize later for higher difficulty
      isTarget: false
    });
  }
  return items;
};

export const applyChanges = (originalItems: GameItem[], difficultyLevel: number, themeId: string): GameItem[] => {
  // Deep copy
  const newItems = JSON.parse(JSON.stringify(originalItems)) as GameItem[];
  const theme = THEMES.find(t => t.id === themeId) || THEMES[0];

  // Select a target index to change
  const targetIndex = randomInt(0, newItems.length - 1);
  const targetItem = newItems[targetIndex];

  // Save original state for reference
  targetItem.originalData = {
    iconName: targetItem.iconName,
    color: targetItem.color,
    rotation: targetItem.rotation
  };

  targetItem.isTarget = true;

  // Determine type of change based on RNG
  // 1. Change Icon (Most common)
  // 2. Change Color (Medium)
  // 3. Rotate (Not implemented in UI yet, stick to 1 & 2)

  const changeType = Math.random() > 0.5 ? 'ICON' : 'COLOR';

  if (changeType === 'ICON') {
    let newIcon = randomItem(ICON_KEYS);
    // Ensure it's different
    while (newIcon === targetItem.iconName) {
      newIcon = randomItem(ICON_KEYS);
    }
    targetItem.iconName = newIcon;
  } else {
    let newColor = randomItem(theme.itemColors);
    while (newColor === targetItem.color) {
      newColor = randomItem(theme.itemColors);
    }
    targetItem.color = newColor;
  }

  return newItems;
};
