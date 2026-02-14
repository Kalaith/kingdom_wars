import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { subscribeWithSelector } from 'zustand/middleware';
import type {
  GameState,
  Resources,
  TrainingQueueItem,
  ProductionRates,
  TabType,
  NotificationData,
} from '../types';
import { gameData } from '../data/gameData';

interface GameStore extends GameState {
  // UI State
  currentTab: TabType;
  notifications: NotificationData[];
  isKingdomCreated: boolean;

  // Actions
  setCurrentTab: (tab: TabType) => void;
  createKingdom: (name: string, flag?: string | null) => void;

  // Resource management
  addResources: (resources: Partial<Resources>) => void;
  subtractResources: (resources: Partial<Resources>) => boolean;
  canAfford: (cost: Partial<Resources>) => boolean;
  getProductionRates: () => ProductionRates;

  // Building management
  upgradeBuilding: (buildingKey: string) => boolean;
  getBuildingUpgradeCost: (buildingKey: string) => Partial<Resources> | null;
  canUpgradeBuilding: (buildingKey: string) => boolean;

  // Unit management
  trainUnit: (unitType: string, quantity: number) => boolean;
  processTrainingQueue: () => void;
  getArmyPower: () => number;

  // Research management
  startResearch: (techKey: string) => boolean;
  completeResearch: () => void;
  canResearch: (techKey: string) => boolean;

  // Utility
  addNotification: (notification: Omit<NotificationData, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  updateGameTime: () => void;
  saveGame: () => void;
  loadGame: () => void;
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

export const useGameStore = create<GameStore>()(
  persist(
    subscribeWithSelector((set, get) => ({
      ...initialGameState,
      currentTab: 'kingdom' as TabType,
      notifications: [],
      isKingdomCreated: false,

      setCurrentTab: (tab: TabType) => set({ currentTab: tab }),

      createKingdom: (name: string, flag?: string | null) => {
        set(state => ({
          kingdom: { ...state.kingdom, name, flag: flag || null },
          isKingdomCreated: true,
        }));
      },

      addResources: (resources: Partial<Resources>) => {
        set(state => {
          const newResources = { ...state.resources };
          (Object.keys(resources) as Array<keyof Resources>).forEach(key => {
            const value = resources[key];
            if (value !== undefined) {
              newResources[key] += value;
            }
          });
          return { resources: newResources };
        });
      },

      subtractResources: (resources: Partial<Resources>) => {
        const state = get();
        if (!state.canAfford(resources)) return false;

        set(state => {
          const newResources = { ...state.resources };
          (Object.keys(resources) as Array<keyof Resources>).forEach(key => {
            const value = resources[key];
            if (value !== undefined) {
              newResources[key] -= value;
            }
          });
          return { resources: newResources };
        });
        return true;
      },

      canAfford: (cost: Partial<Resources>) => {
        const { resources } = get();
        return (Object.keys(cost) as Array<keyof Resources>).every(key => {
          const value = cost[key];
          return value === undefined || resources[key] >= value;
        });
      },

      getProductionRates: () => {
        const { buildings, research } = get();
        const baseRates = { gold: 0, food: 0, wood: 0, stone: 0 };

        // Calculate base production from buildings
        Object.entries(buildings).forEach(([key, building]) => {
          if (building.production && building.level > 0) {
            const production = building.production * building.level;

            if (key === 'goldMine') baseRates.gold += production;
            else if (key === 'farm') baseRates.food += production;
            else if (key === 'lumberMill') baseRates.wood += production;
            else if (key === 'stoneQuarry') baseRates.stone += production;
          }
        });

        // Apply research bonuses
        if (research.completed.includes('agriculture')) {
          baseRates.food *= 1.5;
        }
        if (research.completed.includes('mining')) {
          baseRates.gold *= 1.4;
          baseRates.stone *= 1.4;
        }

        return baseRates;
      },

      upgradeBuilding: (buildingKey: string) => {
        const state = get();
        const building = state.buildings[buildingKey];

        if (!building || building.level >= building.maxLevel) return false;

        const upgradeCost = state.getBuildingUpgradeCost(buildingKey);
        if (!upgradeCost || !state.canAfford(upgradeCost)) return false;

        if (state.subtractResources(upgradeCost)) {
          set(state => {
            const currentBuilding = state.buildings[buildingKey];
            if (!currentBuilding) return state;

            return {
              buildings: {
                ...state.buildings,
                [buildingKey]: {
                  ...currentBuilding,
                  level: currentBuilding.level + 1,
                },
              },
            };
          });

          get().addNotification({
            type: 'success',
            message: `${building.name} upgraded to level ${building.level + 1}!`,
          });

          return true;
        }

        return false;
      },

      getBuildingUpgradeCost: (buildingKey: string) => {
        const { buildings } = get();
        const building = buildings[buildingKey];

        if (!building || building.level >= building.maxLevel) return null;

        // Calculate upgrade cost (increases by 1.5x per level)
        const multiplier = Math.pow(1.5, building.level);
        return {
          gold: Math.floor(building.cost.gold * multiplier),
          food: Math.floor(building.cost.food * multiplier),
          wood: Math.floor(building.cost.wood * multiplier),
          stone: Math.floor(building.cost.stone * multiplier),
        };
      },

      canUpgradeBuilding: (buildingKey: string) => {
        const state = get();
        const building = state.buildings[buildingKey];

        if (!building || building.level >= building.maxLevel) return false;

        const upgradeCost = state.getBuildingUpgradeCost(buildingKey);
        return upgradeCost ? state.canAfford(upgradeCost) : false;
      },

      trainUnit: (unitType: string, quantity: number) => {
        const state = get();
        const unit = gameData.units[unitType];

        if (!unit) return false;

        const totalCost = {
          gold: (unit.cost.gold || 0) * quantity,
          food: (unit.cost.food || 0) * quantity,
          wood: (unit.cost.wood || 0) * quantity,
          stone: (unit.cost.stone || 0) * quantity,
        };

        if (!state.canAfford(totalCost)) return false;

        // Check if required building exists and is built
        const requiredBuilding = state.buildings[unit.building];
        if (!requiredBuilding || requiredBuilding.level === 0) return false;

        if (state.subtractResources(totalCost)) {
          const trainingItem: TrainingQueueItem = {
            id: `${unitType}-${Date.now()}`,
            unitType,
            quantity,
            completionTime: Date.now() + unit.trainingTime * 1000 * quantity,
            building: unit.building,
          };

          set(state => ({
            trainingQueue: [...state.trainingQueue, trainingItem],
          }));

          get().addNotification({
            type: 'success',
            message: `Training ${quantity} ${unit.name}${quantity > 1 ? 's' : ''}...`,
          });

          return true;
        }

        return false;
      },

      processTrainingQueue: () => {
        const now = Date.now();

        set(state => {
          const completed: TrainingQueueItem[] = [];
          const remaining: TrainingQueueItem[] = [];

          state.trainingQueue.forEach(item => {
            if (item.completionTime <= now) {
              completed.push(item);
            } else {
              remaining.push(item);
            }
          });

          // Add completed units to army
          const newArmy = { ...state.army };
          completed.forEach(item => {
            newArmy[item.unitType] = (newArmy[item.unitType] || 0) + item.quantity;
          });

          return {
            trainingQueue: remaining,
            army: newArmy,
          };
        });
      },

      getArmyPower: () => {
        const { army, research } = get();
        let totalPower = 0;

        Object.entries(army).forEach(([unitType, count]) => {
          const unit = gameData.units[unitType];
          if (unit) {
            let unitPower = unit.attack + unit.defense + unit.health;

            // Apply research bonuses
            if (research.completed.includes('ironWorking')) {
              unitPower *= 1.2; // 20% attack boost affects overall power
            }

            totalPower += unitPower * count;
          }
        });

        return Math.floor(totalPower);
      },

      startResearch: (techKey: string) => {
        const state = get();
        const tech = gameData.technologies[techKey];

        if (!tech || !state.canResearch(techKey)) return false;

        if (state.subtractResources(tech.cost)) {
          set(state => ({
            research: {
              ...state.research,
              inProgress: techKey,
            },
          }));

          get().addNotification({
            type: 'success',
            message: `Research started: ${tech.name}`,
          });

          // Auto-complete research after 60 seconds (for demo purposes)
          setTimeout(() => {
            get().completeResearch();
          }, 60000);

          return true;
        }

        return false;
      },

      completeResearch: () => {
        set(state => {
          if (!state.research.inProgress) return state;

          const completedTech = state.research.inProgress;
          const tech = gameData.technologies[completedTech];

          get().addNotification({
            type: 'success',
            message: `Research completed: ${tech?.name}!`,
          });

          return {
            research: {
              completed: [...state.research.completed, completedTech],
              inProgress: null,
            },
          };
        });
      },

      canResearch: (techKey: string) => {
        const { research } = get();
        return (
          !research.completed.includes(techKey) &&
          research.inProgress !== techKey &&
          research.inProgress === null
        );
      },

      addNotification: (notification: Omit<NotificationData, 'id' | 'timestamp'>) => {
        const newNotification: NotificationData = {
          ...notification,
          id: `notification-${Date.now()}-${Math.random()}`,
          timestamp: Date.now(),
        };

        set(state => ({
          notifications: [...state.notifications, newNotification],
        }));

        // Auto-remove notification after duration
        const duration = notification.duration || 5000;
        setTimeout(() => {
          get().removeNotification(newNotification.id);
        }, duration);
      },

      removeNotification: (id: string) => {
        set(state => ({
          notifications: state.notifications.filter(n => n.id !== id),
        }));
      },

      updateGameTime: () => {
        const now = Date.now();
        const state = get();
        const timeDiff = now - state.lastUpdate;

        // Process training queue
        state.processTrainingQueue();

        // Add resource production (every minute)
        if (timeDiff > 60000) {
          // 1 minute
          const productionRates = state.getProductionRates();
          const productionAmount = {
            gold: Math.floor(productionRates.gold * (timeDiff / 60000)),
            food: Math.floor(productionRates.food * (timeDiff / 60000)),
            wood: Math.floor(productionRates.wood * (timeDiff / 60000)),
            stone: Math.floor(productionRates.stone * (timeDiff / 60000)),
          };

          state.addResources(productionAmount);

          set({ lastUpdate: now });
        }
      },

      saveGame: () => {
        // Zustand persist handles saving automatically
      },

      loadGame: () => {
        // Zustand persist handles loading automatically
      },
    })),
    {
      name: 'kingdomWarsGameState',
      partialize: state => ({
        kingdom: state.kingdom,
        resources: state.resources,
        buildings: state.buildings,
        army: state.army,
        trainingQueue: state.trainingQueue,
        research: state.research,
        alliance: state.alliance,
        lastUpdate: state.lastUpdate,
        tutorialCompleted: state.tutorialCompleted,
        actionCooldowns: state.actionCooldowns,
        battleReports: state.battleReports,
        isKingdomCreated: state.isKingdomCreated,
      }),
    }
  )
);

// Auto-save is handled by Zustand persist middleware
// Update game time every second
setInterval(() => {
  useGameStore.getState().updateGameTime();
}, 1000);
