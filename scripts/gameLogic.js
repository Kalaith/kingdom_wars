function calculateProduction() {
  const production = {gold: 0, food: 0, wood: 0, stone: 0};

  if (gameState.buildings.goldMine.level > 0) {
    production.gold = gameState.buildings.goldMine.level * gameData.buildings.goldMine.production;
  }
  if (gameState.buildings.farm.level > 0) {
    production.food = gameState.buildings.farm.level * gameData.buildings.farm.production;
  }
  if (gameState.buildings.lumberMill.level > 0) {
    production.wood = gameState.buildings.lumberMill.level * gameData.buildings.lumberMill.production;
  }
  if (gameState.buildings.stoneQuarry.level > 0) {
    production.stone = gameState.buildings.stoneQuarry.level * gameData.buildings.stoneQuarry.production;
  }

  if (gameState.research.completed.includes('agriculture')) {
    production.food = Math.floor(production.food * 1.5);
  }
  if (gameState.research.completed.includes('mining')) {
    production.gold = Math.floor(production.gold * 1.4);
    production.stone = Math.floor(production.stone * 1.4);
  }

  return production;
}

function updateResources() {
  const production = calculateProduction();
  const timeDelta = 1; // 1 second
  gameState.resources.gold += production.gold * timeDelta / 60;
  gameState.resources.food += production.food * timeDelta / 60;
  gameState.resources.wood += production.wood * timeDelta / 60;
  gameState.resources.stone += production.stone * timeDelta / 60;
  updateUI();
}

function processTrainingQueue() {
  const now = Date.now();
  const completed = [];
  gameState.trainingQueue.forEach((item, index) => {
    if (item.completionTime <= now) {
      completed.push(index);
      const unit = gameData.units[item.unit];
      gameState.army[item.unit] = (gameState.army[item.unit] || 0) + 1;
      showNotification(`${unit.name} training completed!`, 'success');
    }
  });

  completed.reverse().forEach(index => {
    gameState.trainingQueue.splice(index, 1);
  });

  renderMilitary();
  updateUI();
}

function cleanupCooldowns() {
  const now = Date.now();
  Object.keys(gameState.actionCooldowns).forEach(key => {
    if (gameState.actionCooldowns[key] <= now) {
      delete gameState.actionCooldowns[key];
    }
  });
}

function startGameLoop() {
  setInterval(() => {
    updateResources();
    processTrainingQueue();
    cleanupCooldowns();
  }, 1000);
}
