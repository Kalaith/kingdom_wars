import type { BuildingData, UnitData, TechnologyData, EnemyKingdom } from '../types';

export const gameData = {
  buildings: {
    townHall: {
      name: "Town Hall",
      level: 1,
      maxLevel: 10,
      cost: { gold: 0, wood: 0, stone: 0, food: 0 },
      effect: "Central building that unlocks other structures"
    },
    goldMine: {
      name: "Gold Mine",
      level: 0,
      maxLevel: 8,
      cost: { gold: 100, wood: 50, stone: 30, food: 0 },
      production: 10
    },
    farm: {
      name: "Farm",
      level: 0,
      maxLevel: 8,
      cost: { gold: 80, wood: 40, stone: 20, food: 0 },
      production: 8
    },
    lumberMill: {
      name: "Lumber Mill",
      level: 0,
      maxLevel: 8,
      cost: { gold: 90, wood: 30, stone: 40, food: 0 },
      production: 6
    },
    stoneQuarry: {
      name: "Stone Quarry",
      level: 0,
      maxLevel: 8,
      cost: { gold: 120, wood: 60, stone: 20, food: 0 },
      production: 4
    },
    barracks: {
      name: "Barracks",
      level: 0,
      maxLevel: 6,
      cost: { gold: 200, wood: 100, stone: 80, food: 0 },
      effect: "Trains infantry units"
    },
    archeryRange: {
      name: "Archery Range",
      level: 0,
      maxLevel: 6,
      cost: { gold: 180, wood: 120, stone: 60, food: 0 },
      effect: "Trains ranged units"
    },
    stable: {
      name: "Stable",
      level: 0,
      maxLevel: 6,
      cost: { gold: 300, wood: 80, stone: 100, food: 0 },
      effect: "Trains cavalry units"
    },
    walls: {
      name: "Walls",
      level: 0,
      maxLevel: 8,
      cost: { gold: 150, wood: 200, stone: 150, food: 0 },
      defense: 20
    },
    watchtower: {
      name: "Watchtower",
      level: 0,
      maxLevel: 5,
      cost: { gold: 100, wood: 80, stone: 120, food: 0 },
      defense: 15
    }
  } as BuildingData,

  units: {
    soldier: {
      name: "Soldier",
      attack: 10,
      defense: 8,
      health: 25,
      cost: { gold: 20, food: 10 },
      trainingTime: 30,
      building: "barracks"
    },
    spearman: {
      name: "Spearman",
      attack: 12,
      defense: 15,
      health: 30,
      cost: { gold: 30, food: 15 },
      trainingTime: 45,
      building: "barracks"
    },
    archer: {
      name: "Archer",
      attack: 15,
      defense: 5,
      health: 20,
      cost: { gold: 25, food: 12 },
      trainingTime: 35,
      building: "archeryRange"
    },
    crossbowman: {
      name: "Crossbowman",
      attack: 20,
      defense: 8,
      health: 25,
      cost: { gold: 40, food: 18 },
      trainingTime: 50,
      building: "archeryRange"
    },
    knight: {
      name: "Knight",
      attack: 25,
      defense: 20,
      health: 50,
      cost: { gold: 80, food: 30 },
      trainingTime: 90,
      building: "stable"
    }
  } as UnitData,

  technologies: {
    ironWorking: {
      name: "Iron Working",
      cost: { gold: 500, stone: 200 },
      effect: "Increases all unit attack by 20%"
    },
    masonry: {
      name: "Masonry",
      cost: { gold: 400, stone: 300 },
      effect: "Increases building defense by 30%"
    },
    agriculture: {
      name: "Agriculture",
      cost: { gold: 300, wood: 150 },
      effect: "Increases food production by 50%"
    },
    mining: {
      name: "Mining",
      cost: { gold: 350, stone: 200 },
      effect: "Increases gold and stone production by 40%"
    }
  } as TechnologyData,

  enemyKingdoms: [
    {
      name: "Valoria",
      power: 1250,
      resources: { gold: 850, food: 620, wood: 430, stone: 380 }
    },
    {
      name: "Drakmoor",
      power: 980,
      resources: { gold: 720, food: 540, wood: 380, stone: 290 }
    },
    {
      name: "Ironhold",
      power: 1420,
      resources: { gold: 950, food: 680, wood: 520, stone: 460 }
    },
    {
      name: "Thornwall",
      power: 760,
      resources: { gold: 480, food: 360, wood: 280, stone: 220 }
    }
  ] as EnemyKingdom[]
};

export default gameData;
