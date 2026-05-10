import { create } from 'zustand';
import type {
  GameState,
  Resources,
  ProductionRates,
  TabType,
  NotificationData,
  EnemyKingdom,
  BattleReport,
} from '../types';
import { gameData } from '../data/gameData';
import { webhatcheryGameApi, type WebHatcheryGameState } from '../api/webhatcheryGameApi';
import { useWebHatcherySessionStore } from './webhatcherySessionStore';

interface BackendBattleResult extends BattleReport {
  lossPercentage?: number;
}

interface GameStore extends GameState {
  currentTab: TabType;
  notifications: NotificationData[];
  isKingdomCreated: boolean;
  isLoading: boolean;
  error: string | null;
  setCurrentTab: (tab: TabType) => void;
  createKingdom: (name: string, flag?: string | null) => Promise<boolean>;
  addResources: (resources: Partial<Resources>) => Promise<boolean>;
  subtractResources: (resources: Partial<Resources>) => Promise<boolean>;
  canAfford: (cost: Partial<Resources>) => boolean;
  getProductionRates: () => ProductionRates;
  upgradeBuilding: (buildingKey: string) => Promise<boolean>;
  getBuildingUpgradeCost: (buildingKey: string) => Partial<Resources> | null;
  canUpgradeBuilding: (buildingKey: string) => boolean;
  trainUnit: (unitType: string, quantity: number) => Promise<boolean>;
  processTrainingQueue: () => Promise<void>;
  getArmyPower: () => number;
  startResearch: (techKey: string) => Promise<boolean>;
  completeResearch: () => Promise<void>;
  canResearch: (techKey: string) => boolean;
  attackKingdom: (enemy: EnemyKingdom) => Promise<BackendBattleResult | null>;
  addNotification: (notification: Omit<NotificationData, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  updateGameTime: () => Promise<void>;
  saveGame: () => Promise<void>;
  loadGame: () => Promise<void>;
}

const initialGameState: GameState = {
  kingdom: {
    name: '',
    flag: null,
    power: 100,
    population: 10,
    happiness: 100,
  },
  resources: {
    gold: 500,
    food: 300,
    wood: 200,
    stone: 150,
  },
  buildings: JSON.parse(JSON.stringify(gameData.buildings)),
  army: {},
  trainingQueue: [],
  research: {
    completed: [],
    inProgress: null,
  },
  alliance: null,
  lastUpdate: Date.now(),
  tutorialCompleted: false,
  actionCooldowns: {},
  battleReports: [],
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const applyBackendGame = (game: WebHatcheryGameState): void => {
  const state = game.save.state;
  if (!isRecord(state) || !isRecord(state.resources) || !isRecord(state.buildings)) {
    useGameStore.setState({ isLoading: false, error: 'Backend returned an invalid kingdom state.' });
    return;
  }

  useGameStore.setState({
    kingdom: isRecord(state.kingdom) ? (state.kingdom as unknown as GameState['kingdom']) : initialGameState.kingdom,
    resources: state.resources as unknown as Resources,
    buildings: state.buildings as unknown as GameState['buildings'],
    army: isRecord(state.army) ? (state.army as unknown as GameState['army']) : {},
    trainingQueue: Array.isArray(state.trainingQueue) ? (state.trainingQueue as GameState['trainingQueue']) : [],
    research: isRecord(state.research) ? (state.research as unknown as GameState['research']) : initialGameState.research,
    alliance: isRecord(state.alliance) ? (state.alliance as unknown as GameState['alliance']) : null,
    lastUpdate: typeof state.lastUpdate === 'number' ? state.lastUpdate : Date.now(),
    tutorialCompleted: state.tutorialCompleted === true,
    actionCooldowns: isRecord(state.actionCooldowns) ? (state.actionCooldowns as GameState['actionCooldowns']) : {},
    battleReports: Array.isArray(state.battleReports) ? (state.battleReports as GameState['battleReports']) : [],
    isKingdomCreated: state.isKingdomCreated === true,
    isLoading: false,
    error: null,
  });
};

const loadBackendGame = async (): Promise<WebHatcheryGameState> => {
  const session = useWebHatcherySessionStore.getState();
  try {
    return await session.loadGame();
  } catch {
    return await session.continueAsGuest();
  }
};

const runIntent = async (
  intent: string,
  payload: Record<string, unknown> = {},
): Promise<WebHatcheryGameState> => {
  if (!useWebHatcherySessionStore.getState().gameState) {
    applyBackendGame(await loadBackendGame());
  }

  const game = await webhatcheryGameApi.applyIntent(intent, payload);
  useWebHatcherySessionStore.setState({ gameState: game, user: game.user });
  applyBackendGame(game);
  return game;
};

const lastBattleResult = (game: WebHatcheryGameState): BackendBattleResult | null => {
  const result = game.save.state.lastBattleResult;
  return isRecord(result) ? (result as unknown as BackendBattleResult) : null;
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialGameState,
  currentTab: 'kingdom',
  notifications: [],
  isKingdomCreated: false,
  isLoading: false,
  error: null,

  setCurrentTab: tab => set({ currentTab: tab }),

  createKingdom: async (name, flag = null) => {
    try {
      await runIntent('create_kingdom', { name, flag });
      return true;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unable to create kingdom.' });
      return false;
    }
  },

  addResources: async resources => {
    try {
      await runIntent('add_resources', { resources });
      return true;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unable to add resources.' });
      return false;
    }
  },

  subtractResources: async resources => {
    try {
      await runIntent('subtract_resources', { resources });
      return true;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Insufficient resources.' });
      return false;
    }
  },

  canAfford: cost => {
    const { resources } = get();
    return (Object.keys(cost) as Array<keyof Resources>).every(key => {
      const value = cost[key];
      return value === undefined || resources[key] >= value;
    });
  },

  getProductionRates: () => {
    const { buildings, research } = get();
    const baseRates = { gold: 0, food: 0, wood: 0, stone: 0 };
    Object.entries(buildings).forEach(([key, building]) => {
      if (building.production && building.level > 0) {
        const production = building.production * building.level;
        if (key === 'goldMine') baseRates.gold += production;
        else if (key === 'farm') baseRates.food += production;
        else if (key === 'lumberMill') baseRates.wood += production;
        else if (key === 'stoneQuarry') baseRates.stone += production;
      }
    });
    if (research.completed.includes('agriculture')) baseRates.food *= 1.5;
    if (research.completed.includes('mining')) {
      baseRates.gold *= 1.4;
      baseRates.stone *= 1.4;
    }
    return baseRates;
  },

  upgradeBuilding: async buildingKey => {
    try {
      await runIntent('upgrade_building', { buildingKey });
      const building = get().buildings[buildingKey];
      get().addNotification({
        type: 'success',
        message: `${building?.name ?? 'Building'} upgraded!`,
      });
      return true;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unable to upgrade building.' });
      return false;
    }
  },

  getBuildingUpgradeCost: buildingKey => {
    const building = get().buildings[buildingKey];
    if (!building || building.level >= building.maxLevel) return null;
    const multiplier = Math.pow(1.5, building.level);
    return {
      gold: Math.floor(building.cost.gold * multiplier),
      food: Math.floor(building.cost.food * multiplier),
      wood: Math.floor(building.cost.wood * multiplier),
      stone: Math.floor(building.cost.stone * multiplier),
    };
  },

  canUpgradeBuilding: buildingKey => {
    const building = get().buildings[buildingKey];
    const upgradeCost = get().getBuildingUpgradeCost(buildingKey);
    return Boolean(building && upgradeCost && get().canAfford(upgradeCost));
  },

  trainUnit: async (unitType, quantity) => {
    try {
      await runIntent('train_unit', { unitType, quantity });
      const unit = gameData.units[unitType];
      get().addNotification({
        type: 'success',
        message: `Training ${quantity} ${unit?.name ?? 'unit'}${quantity > 1 ? 's' : ''}...`,
      });
      return true;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unable to train units.' });
      return false;
    }
  },

  processTrainingQueue: async () => {
    try {
      await runIntent('process_training_queue');
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unable to process training queue.' });
    }
  },

  getArmyPower: () => {
    const { army, research } = get();
    let totalPower = 0;
    Object.entries(army).forEach(([unitType, count]) => {
      const unit = gameData.units[unitType];
      if (unit) {
        let unitPower = unit.attack + unit.defense + unit.health;
        if (research.completed.includes('ironWorking')) unitPower *= 1.2;
        totalPower += unitPower * count;
      }
    });
    return Math.floor(totalPower);
  },

  startResearch: async techKey => {
    try {
      await runIntent('start_research', { techKey });
      get().addNotification({
        type: 'success',
        message: `Research started: ${gameData.technologies[techKey]?.name ?? 'Technology'}`,
      });
      return true;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unable to start research.' });
      return false;
    }
  },

  completeResearch: async () => {
    try {
      await runIntent('complete_research');
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unable to complete research.' });
    }
  },

  canResearch: techKey => {
    const { research } = get();
    return !research.completed.includes(techKey) && research.inProgress !== techKey && research.inProgress === null;
  },

  attackKingdom: async enemy => {
    try {
      const game = await runIntent('attack_kingdom', { enemy });
      return lastBattleResult(game);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unable to attack kingdom.' });
      return null;
    }
  },

  addNotification: notification => {
    const newNotification: NotificationData = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
    };
    set(state => ({ notifications: [...state.notifications, newNotification] }));
    window.setTimeout(() => get().removeNotification(newNotification.id), notification.duration || 5000);
  },

  removeNotification: id => {
    set(state => ({ notifications: state.notifications.filter(n => n.id !== id) }));
  },

  updateGameTime: async () => {
    try {
      await runIntent('update_game_time');
    } catch {
      // The next tick or user action will retry backend synchronization.
    }
  },

  saveGame: async () => {
    try {
      await runIntent('save');
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unable to save game.' });
    }
  },

  loadGame: async () => {
    set({ isLoading: true, error: null });
    try {
      applyBackendGame(await loadBackendGame());
    } catch (error) {
      set({ isLoading: false, error: error instanceof Error ? error.message : 'Unable to load game.' });
    }
  },
}));

window.setInterval(() => {
  void useGameStore.getState().updateGameTime();
}, 1000);
