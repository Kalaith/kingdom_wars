let gameState = {
  kingdom: {
    name: "",
    flag: null,
    power: 100,
    population: 10,
    happiness: 100
  },
  resources: {
    gold: 500,
    food: 300,
    wood: 200,
    stone: 150
  },
  buildings: JSON.parse(JSON.stringify(gameData.buildings)),
  army: {},
  trainingQueue: [],
  research: {
    completed: [],
    inProgress: null
  },
  alliance: null,
  lastUpdate: Date.now(),
  tutorialCompleted: false,
  actionCooldowns: {}
};

function loadGameState() {
  try {
    if (window.savedGameState) {
      gameState = { ...gameState, ...window.savedGameState };
    }
  } catch (error) {
    console.error('Failed to load game state:', error);
  }
}

function saveGameState() {
  try {
    gameState.lastUpdate = Date.now();
    const gameDataString = JSON.stringify(gameState);
    // Using a simple in-memory storage since localStorage is not available
    window.savedGameState = gameState;
  } catch (error) {
    console.error('Failed to save game state:', error);
  }
}
