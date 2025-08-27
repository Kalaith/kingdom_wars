// Game constants
export const GameConstants = {
  RESOURCE_ICONS: {
    gold: '🏛️',
    food: '🌾',
    wood: '🪵',
    stone: '🪨',
  },
  BUILDING_ICONS: {
    castle: '🏰',
    goldMine: '⛏️',
    farm: '🚜',
    lumberMill: '🪵',
    stoneQuarry: '⛰️',
    barracks: '⚔️',
    archeryRange: '🏹',
    stable: '🐎',
    workshop: '🔨',
  },
  UNIT_ICONS: {
    peasant: '👨‍🌾',
    soldier: '⚔️',
    archer: '🏹',
    knight: '🐎',
    catapult: '🏰',
  },
  NOTIFICATION_DURATION: 5000,
  AUTO_SAVE_INTERVAL: 30000,
  GAME_UPDATE_INTERVAL: 1000,
  PRODUCTION_UPDATE_INTERVAL: 60000,
  RESEARCH_COMPLETION_TIME: 60000,
} as const;

// Utility functions
export const formatNumber = (num: number): string => {
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toString();
};

export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};
