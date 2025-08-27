function updateUI() {
  document.getElementById('goldAmount').textContent = Math.floor(gameState.resources.gold);
  document.getElementById('foodAmount').textContent = Math.floor(gameState.resources.food);
  document.getElementById('woodAmount').textContent = Math.floor(gameState.resources.wood);
  document.getElementById('stoneAmount').textContent = Math.floor(gameState.resources.stone);

  document.getElementById('kingdomName').textContent = gameState.kingdom.name;
  document.getElementById('kingdomPower').textContent = calculatePower();
  document.getElementById('kingdomTitle').textContent = gameState.kingdom.name;
  document.getElementById('population').textContent = gameState.kingdom.population;
  document.getElementById('happiness').textContent = gameState.kingdom.happiness + '%';
  document.getElementById('totalDefense').textContent = calculateDefense();
  document.getElementById('armySize').textContent = calculateArmySize();

  if (gameState.kingdom.flag) {
    document.getElementById('kingdomFlag').src = gameState.kingdom.flag;
  }

  const production = calculateProduction();
  document.getElementById('goldProduction').textContent = production.gold;
  document.getElementById('foodProduction').textContent = production.food;
  document.getElementById('woodProduction').textContent = production.wood;
  document.getElementById('stoneProduction').textContent = production.stone;
}

function renderBuildings() {
  const buildingsList = document.getElementById('buildingsList');
  buildingsList.innerHTML = '';

  Object.entries(gameState.buildings).forEach(([key, building]) => {
    const buildingCard = document.createElement('div');
    buildingCard.className = 'building-card';
    buildingCard.innerHTML = `
      <h3>${building.name}</h3>
      <p>Level: ${building.level}</p>
      <p>Effect: ${building.effect || 'N/A'}</p>
      <button onclick="upgradeBuilding('${key}')">Upgrade</button>
    `;
    buildingsList.appendChild(buildingCard);
  });
}

function renderMilitary() {
  renderUnitTraining();
  renderArmy();
  renderTrainingQueue();
}

function renderUnitTraining() {
  const unitTraining = document.getElementById('unitTraining');
  unitTraining.innerHTML = '';

  Object.entries(gameData.units).forEach(([key, unit]) => {
    const unitCard = document.createElement('div');
    unitCard.className = 'unit-card';
    unitCard.innerHTML = `
      <h3>${unit.name}</h3>
      <p>Attack: ${unit.attack}</p>
      <p>Defense: ${unit.defense}</p>
      <p>Health: ${unit.health}</p>
      <button onclick="trainUnit('${key}')">Train</button>
    `;
    unitTraining.appendChild(unitCard);
  });
}

function renderArmy() {
  const armyList = document.getElementById('armyList');
  armyList.innerHTML = '';

  Object.entries(gameState.army).forEach(([unitType, count]) => {
    const armyCard = document.createElement('div');
    armyCard.className = 'army-card';
    armyCard.innerHTML = `
      <h3>${gameData.units[unitType].name}</h3>
      <p>Count: ${count}</p>
    `;
    armyList.appendChild(armyCard);
  });

  if (Object.keys(gameState.army).length === 0 || calculateArmySize() === 0) {
    armyList.innerHTML = '<p>No units in your army.</p>';
  }
}

function renderTrainingQueue() {
  const trainingQueue = document.getElementById('trainingQueue');
  trainingQueue.innerHTML = '';

  if (gameState.trainingQueue.length === 0) {
    trainingQueue.innerHTML = '<p>No units in training.</p>';
    return;
  }

  gameState.trainingQueue.forEach((item, index) => {
    const queueCard = document.createElement('div');
    queueCard.className = 'queue-card';
    queueCard.innerHTML = `
      <h3>${gameData.units[item.unit].name}</h3>
      <p>Completion Time: ${new Date(item.completionTime).toLocaleTimeString()}</p>
    `;
    trainingQueue.appendChild(queueCard);
  });
}

function calculatePower() {
  let power = 100; // Base power

  // Add building power
  Object.values(gameState.buildings).forEach(building => {
    power += building.level * 50;
  });

  // Add army power
  Object.entries(gameState.army).forEach(([unitType, count]) => {
    const unit = gameData.units[unitType];
    if (unit) {
      power += count * (unit.attack + unit.defense + unit.health);
    }
  });

  return Math.floor(power);
}

function calculateDefense() {
  let defense = 0;
  Object.entries(gameState.buildings).forEach(([key, building]) => {
    if (gameData.buildings[key].defense) {
      defense += building.level * gameData.buildings[key].defense;
    }
  });
  return defense;
}

function calculateArmySize() {
  return Object.values(gameState.army).reduce((total, count) => total + count, 0);
}
