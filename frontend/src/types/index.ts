// Core resource types
export interface Resources {
  gold: number;
  food: number;
  wood: number;
  stone: number;
}

// Building types
export interface Building {
  name: string;
  level: number;
  maxLevel: number;
  cost: Resources;
  effect?: string;
  production?: number;
  defense?: number;
}

export interface BuildingData {
  [key: string]: Building;
}

// Unit types
export interface Unit {
  name: string;
  attack: number;
  defense: number;
  health: number;
  cost: Partial<Resources>;
  trainingTime: number;
  building: string;
}

export interface UnitData {
  [key: string]: Unit;
}

export interface Army {
  [unitType: string]: number;
}

// Technology types
export interface Technology {
  name: string;
  cost: Partial<Resources>;
  effect: string;
  completed?: boolean;
}

export interface TechnologyData {
  [key: string]: Technology;
}

// Training queue
export interface TrainingQueueItem {
  id: string;
  unitType: string;
  quantity: number;
  completionTime: number;
  building: string;
}

// Research
export interface Research {
  completed: string[];
  inProgress: string | null;
  completionTime?: number;
}

// Enemy kingdoms
export interface EnemyKingdom {
  name: string;
  power: number;
  resources: Resources;
}

// Kingdom state
export interface Kingdom {
  name: string;
  flag: string | null;
  power: number;
  population: number;
  happiness: number;
}

// Alliance
export interface Alliance {
  id: string;
  name: string;
  members: string[];
  level: number;
}

// Battle report
export interface BattleReport {
  id: string;
  attacker: string;
  defender: string;
  result: 'victory' | 'defeat' | 'draw';
  resourcesGained: Partial<Resources>;
  unitsLost: Army;
  timestamp: number;
}

// Game state
export interface GameState {
  kingdom: Kingdom;
  resources: Resources;
  buildings: BuildingData;
  army: Army;
  trainingQueue: TrainingQueueItem[];
  research: Research;
  alliance: Alliance | null;
  lastUpdate: number;
  tutorialCompleted: boolean;
  actionCooldowns: { [key: string]: number };
  battleReports: BattleReport[];
}

// UI states
export type TabType = 'kingdom' | 'buildings' | 'military' | 'attack' | 'research' | 'alliances';

export interface NotificationData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: number;
  duration?: number;
}

// Action cooldowns
export interface ActionCooldowns {
  [actionKey: string]: number;
}

// Production rates
export interface ProductionRates {
  gold: number;
  food: number;
  wood: number;
  stone: number;
}
